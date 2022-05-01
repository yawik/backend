'use strict';

const fs = require('fs');
const path = require('path');
const sendfile = require('koa-sendfile')
// const {LocalFileData } = require("get-file-object-from-local-path");
/**
 *  private-upload controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { ForbiddenError } = require('@strapi/utils').errors;

module.exports = createCoreController('api::private-upload.private-upload', ({strapi }) => ({
    async find(ctx) {
        if(!ctx.state.user) {
           throw new ForbiddenError("You are not login")
        }
        const publishedJob = await strapi.api["private-upload"].services["private-upload"].find({
            populate: "*",
            filters: {
                users: {
                    id: {
                        $in: [ctx.state.user.id]
                    }
                }
            }
        });
        return publishedJob
    },
    async  create(ctx) {
        if(!ctx.state.user) {
           return new ForbiddenError("You are not login")
        }
        if(!ctx.request.body.users) {
            return new ForbiddenError("Please select user")
         }
         let users = ctx.request.body.users
         if(typeof users === "string") {
            users = JSON.parse(users)
         }
         if(users.length === 0) {
            return new ForbiddenError("Please select user")
         }
        const attachment = ctx.request.files.attachment;

        const data = {
            users:  ctx.request.body.users
        }
        if(typeof data.users === 'string') {
            data.users = JSON.parse(data.users);
        }
        // const fileName = attachment.name;
        // const filePath = `${rootDir}/public/uploads/${fileName}`
        // const stats = fs.statSync(filePath);
        data.attachment = await strapi.api["private-upload"].services["private-upload"].uploadFile({
            data:attachment, //mandatory declare the data(can be empty), otherwise it will give you an undefined error. This parameters will be used to relate the file with a collection.
            files: attachment
        });
        return strapi.api["private-upload"].services["private-upload"].create({
            data: data
        });
    },
    async download(ctx) {
        if (!ctx.state.user) {
            return new ForbiddenError("You are not login")
         }
        if (!ctx.request.query.url) {
             return new ForbiddenError("Please enter url")
        }
        const pathInfo = path.join(strapi.dirs.public, "../", ctx.request.query.url);
        await sendfile(ctx, pathInfo)
        if (!ctx.status) ctx.throw(404)
    }
}));
