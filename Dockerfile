# "common" stage
FROM node:14-alpine AS yawik_common

MAINTAINER "Anthonius Mutnhi

# Setup environment
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ARG PORT=1337
ENV PORT=${NODE_PORT}

EXPOSE ${NODE_PORT}

# starting the build
WORKDIR /srv/app
COPY ./package.json ./
COPY ./yarn.lock ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN yarn config set network-timeout 600000 -g
RUN yarn
COPY ./ .

# "development" stage build
# depends on the "common" stage above
FROM yawik_common as yawik_dev
CMD ["yarn", "dev"]

# "production" stage build
# depends on the "common" stage above
FROM build_common AS yawik_prod

ENV NODE_ENV production

RUN set -eux; \
    yarn build

CMD ["yarn", "start"]
