FROM node:4.2.2
MAINTAINER huluoyang "huluoyang@gitcafe.io"

WORKDIR /app

COPY ./package.json /app/

RUN npm install -g cnpm --registry=https://registry.npm.taobao.org

RUN cnpm install

RUN cnpm install bower -g

RUN bower install --allow-root

COPY . /app/

RUN cp sample.env .env

EXPOSE 3000
