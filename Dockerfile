FROM node:4.2.2
MAINTAINER huluoyang "huluoyang@gitcafe.io"

WORKDIR /app

COPY . /app/

RUN npm install -g cnpm --registry=https://registry.npm.taobao.org

RUN cnpm install

RUN cnpm install bower -g

RUN bower install --allow-root

RUN cp sample.env .env

EXPOSE 3000
