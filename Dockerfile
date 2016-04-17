FROM node:4.2.2
MAINTAINER huluoyang "huluoyang@gitcafe.io"

WORKDIR /app

COPY . /app/

RUN npm install npm -g

RUN npm install

RUN npm install -g gulp

RUN npm install bower -g

RUN bower install --allow-root

RUN cp sample.env .env

RUN wget apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

RUN echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list

RUN apt-get update

RUN apt-get install -y mongodb-org

RUN mkdir -p /data/db

RUN service mongod start

RUN npm run only-once

EXPOSE 3000

CMD gulp --p=true
