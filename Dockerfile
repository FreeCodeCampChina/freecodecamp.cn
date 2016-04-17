FROM node:4.2.2
MAINTAINER huluoyang "huluoyang@gitcafe.io"

WORKDIR /app

COPY . /app/

RUN npm install

RUN npm install bower -g

RUN bower install --allow-root

RUN cp sample.env .env

EXPOSE 3000
