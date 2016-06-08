FROM daocloud.io/library/node:6.2.1
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
#安装依赖phantomjs
#RUN apt-get install phantomjs
#安装最新版本pm2模块
#RUN cnpm install pm2@latest -g
#安装依赖
RUN cnpm install phantomjs@1.9.16
RUN npm install
#复制工程
COPY . /usr/src/app
ENV PORT 9999
EXPOSE 9999
# 线上环境
RUN npm run compile
#换个镜像
RUN rm -v /etc/apt/sources.list
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse" >> /etc/apt/sources.list
RUN apt-get update -y
RUN apt-get upgrade -y
#微软字体
RUN apt-get install -y ttf-mscorefonts-installer
#文泉驿-点阵宋体
RUN apt-get install -y xfonts-wqy
#ENTRYPOINT pm2 start www/production.js --name 'T326_web' --no-daemon
ENTRYPOINT node www/production.js
