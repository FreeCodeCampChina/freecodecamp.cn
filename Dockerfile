FROM node:4.2.2
MAINTAINER huluoyang "huluoyang@gitcafe.io"

WORKDIR /app

COPY ./package.json /app/

RUN npm install

RUN npm install bower -g

RUN bower install --allow-root

COPY . /app/

RUN cp sample.env .env

EXPOSE 3000
