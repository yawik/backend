# Jobwizard backend

this is the backend for our https://jobwizard.yawik.org

Sources are located at https://gitlab.com/yawik/jobwizard

## State: development

## Installation

```
git clone git@gitlab.com:yawik/backend.git
cd backend
yarn
yarn dev
```

## Environment

copy .env.example  to .env and modify values

you can start a development env with `yarn dev`. If you need to test against
staging or production you can start all environments locally by:

```
pm2 start
```

* develop: Port 1337
* staging: Port 4000
* production: Port 3000
