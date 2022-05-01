'use strict';

/**
 * private-upload service.
 */
 const { pipeline } = require('stream');
const { createCoreService } = require('@strapi/strapi').factories;
const fse = require('fs-extra');
const fs = require('fs');
const { nameToSlug } = require('@strapi/utils');
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const _ = require('lodash');
const { isFunction } = require('lodash/fp');

const UPLOADS_FOLDER_NAME = "private/uploads"
const sendMediaMetrics = data => {
    if (_.has(data, 'caption') && !_.isEmpty(data.caption)) {
      strapi.telemetry.send('didSaveMediaWithCaption');
    }
  
    if (_.has(data, 'alternativeText') && !_.isEmpty(data.alternativeText)) {
      strapi.telemetry.send('didSaveMediaWithAlternativeText');
    }
};

const createAndAssignTmpWorkingDirectoryToFiles = async files => {
    const tmpWorkingDirectory = await fse.mkdtemp(path.join(os.tmpdir(), 'strapi-upload-'));

    Array.isArray(files)
        ? files.forEach(file => (file.tmpWorkingDirectory = tmpWorkingDirectory))
        : (files.tmpWorkingDirectory = tmpWorkingDirectory);

    return tmpWorkingDirectory;
};

const randomSuffix = () => crypto.randomBytes(5).toString('hex');

const generateFileName = name => {
    const baseName = nameToSlug(name, { separator: '_', lowercase: false });
  
    return `${baseName}_${randomSuffix()}`;
};

const bytesToKbytes = bytes => Math.round((bytes / 1000) * 100) / 100;
const getService = name => {
    return strapi.plugin('upload').service(name);
};

module.exports = createCoreService('api::private-upload.private-upload', ({ strapi }) => ({
    async uploadFile({ data, files }, { user } = {}) {
        const tmpWorkingDirectory = await createAndAssignTmpWorkingDirectoryToFiles(files);

        let uploadedFiles = [];

        try {
            const { fileInfo, ...metas } = data;

            const fileArray = Array.isArray(files) ? files : [files];
            const fileInfoArray = Array.isArray(fileInfo) ? fileInfo : [fileInfo];

            const doUpload = async (file, fileInfo) => {
                const fileData = await this.enhanceFile(file, fileInfo, metas);

                return this.uploadFileAndPersist(fileData, { user });
            };

            uploadedFiles = await Promise.all(
                fileArray.map((file, idx) => doUpload(file, fileInfoArray[idx] || {}))
            );
        } finally {
            // delete temporary folder
            await fse.remove(tmpWorkingDirectory);
        }

        return uploadedFiles;
    },
    async enhanceFile(file, fileInfo = {}, metas = {}) {
        const currentFile = this.formatFileInfo(
          {
            filename: file.name,
            type: file.type,
            size: file.size,
          },
          fileInfo,
          {
            ...metas,
            tmpWorkingDirectory: file.tmpWorkingDirectory,
          }
        );
        currentFile.getStream = () => fs.createReadStream(file.path);
    
        const { optimize, isSupportedImage } = strapi.plugin('upload').service('image-manipulation');
    
        if (!(await isSupportedImage(currentFile))) {
          return currentFile;
        }
    
        return optimize(currentFile);
    },

    formatFileInfo({ filename, type, size }, fileInfo = {}, metas = {}) {
        const ext = path.extname(filename);
        const basename = path.basename(fileInfo.name || filename, ext);
    
        const usedName = fileInfo.name || filename;
    
        const entity = {
          name: usedName,
          alternativeText: fileInfo.alternativeText,
          caption: fileInfo.caption,
          hash: generateFileName(basename),
          ext,
          mime: type,
          size: bytesToKbytes(size),
        };
    
        const { refId, ref, field } = metas;
    
        if (refId && ref && field) {
          entity.related = [
            {
              id: refId,
              __type: ref,
              __pivot: { field },
            },
          ];
        }
    
        if (metas.path) {
          entity.path = metas.path;
        }
    
        if (metas.tmpWorkingDirectory) {
          entity.tmpWorkingDirectory = metas.tmpWorkingDirectory;
        }
    
        return entity;
    },
    async uploadFileAndPersist(fileData, { user } = {}) {
        const config = strapi.config.get('plugin.upload');
    
        const {
          getDimensions,
          generateThumbnail,
          generateResponsiveFormats,
          isSupportedImage,
        } = getService('image-manipulation');
        await getService('provider').upload(fileData);
    
        if (await isSupportedImage(fileData)) {
          const thumbnailFile = await generateThumbnail(fileData);
          if (thumbnailFile) {
            await this.upload(thumbnailFile);
            _.set(fileData, 'formats.thumbnail', thumbnailFile);
          }
    
          const formats = await generateResponsiveFormats(fileData);
          if (Array.isArray(formats) && formats.length > 0) {
            for (const format of formats) {
              if (!format) continue;
    
              const { key, file } = format;
    
               await this.upload(file);
              
          //  fs.writeFileSync(path.join(uploadPath, `${file.hash}${file.ext}`), file.buffer);
            file.url = `/${UPLOADS_FOLDER_NAME}/${file.hash}${file.ext}`;
              _.set(fileData, ['formats', key], file);
            }
          }
    
          const { width, height } = await getDimensions(fileData);
    
          _.assign(fileData, {
            width,
            height,
          });
        }
        _.set(fileData, 'provider', config.provider);
    
        return this.add(fileData, { user });
      },

      async add(values, { user } = {}) {
        const fileValues = { ...values };
        if (user) {
          fileValues[UPDATED_BY_ATTRIBUTE] = user.id;
          fileValues[CREATED_BY_ATTRIBUTE] = user.id;
        }
        sendMediaMetrics(fileValues);
    
        const res = await strapi.query('plugin::upload.file').create({ data: fileValues });
    
        return res;
      },
      async upload(file) {
        
        if (isFunction(strapi.plugin('upload').provider.uploadStream)) {
          file.stream = file.getStream();
          await this.uploadStream(file);
          delete file.stream;
        } else {
          file.buffer = await streamToBuffer(file.getStream());
          await this.uploadFileInfo(file);
          delete file.buffer;
        }
      },
      async uploadStream(file) {
        return new Promise((resolve, reject) => { 
          // const uploadPath =  path.join(strapi.dirs.public, "../private");
          const uploadPath = path.resolve(strapi.dirs.public, "../private/uploads");

          pipeline(
            file.stream,
            fs.createWriteStream(path.join(uploadPath, `${file.hash}${file.ext}`)),
            err => {
              if (err) {
                return reject(err);
              }

              file.url = `/private/uploads/${file.hash}${file.ext}`;

              resolve();
            }
          );
        });
      },
      async uploadFileInfo(file) {
        return new Promise((resolve, reject) => {
          // write file in public/assets folder
          fs.writeFile(path.join(uploadPath, `${file.hash}${file.ext}`), file.buffer, err => {
            if (err) {
              return reject(err);
            }

            file.url = `/${UPLOADS_FOLDER_NAME}/${file.hash}${file.ext}`;

            resolve();
          });
        });
      },
      async delete(file) {
        return new Promise((resolve, reject) => {
          const filePath = path.join(uploadPath, `${file.hash}${file.ext}`);

          if (!fs.existsSync(filePath)) {
            return resolve("File doesn't exist");
          }

          // remove file from public/assets folder
          fs.unlink(filePath, err => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        });
      },

}));
