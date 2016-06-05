FROM daocloud.io/library/node:5.9.0
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
#安装依赖phantomjs
RUN sudo apt-get install phantomjs
#安装最新版本pm2模块
RUN cnpm install pm2@latest -g
#安装依赖
RUN cnpm install phantomjs@1.9.16
RUN npm install
#复制工程
COPY . /usr/src/app
ENV PORT 9999
EXPOSE 9999
# 线上环境
RUN npm run compile
ENTRYPOINT pm2 start www/production.js --name 'signature'
#ENTRYPOINT node www/production.js