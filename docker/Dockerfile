FROM daocloud.io/library/node:6.2.1
#创建目录
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
#安装依赖phantomjs
#RUN apt-get install phantomjs
#安装最新版本pm2模块
RUN cnpm install pm2@latest -g
#安装依赖
RUN cnpm install phantomjs@1.9.16
RUN npm install
#复制工程
COPY . /usr/src/app
RUN pwd
#
#换镜像
RUN rm -v /etc/apt/sources.list
RUN echo "deb http://mirrors.163.com/debian jessie main" > /etc/apt/sources.list
RUN apt-get update -y
RUN apt-get upgrade -y
#windows字体
RUN apt-get install unzip
#Tahoma 字体
RUN wget http://www.stchman.com/tools/MS_fonts/tahoma.zip
RUN unzip -d /usr/share/fonts/truetype/msttcorefonts ./tahoma.zip
RUN fc-cache -f -v
RUN rm -f ./tahoma.zip
#刷新字体缓存
RUN fc-cache -f -s -v
#
ENV PORT 9999
EXPOSE 9999
#线上环境
RUN npm run compile
ENTRYPOINT pm2 start www/production.js --name 'T326_web' --no-daemon
#ENTRYPOINT node www/production.js
