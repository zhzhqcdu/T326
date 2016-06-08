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
#windows字体
RUN cd ~
RUN wget http://www.stchman.com/tools/MS_fonts/tahoma.zip #Tahoma 字体
RUN sudo unzip -d /usr/share/fonts/truetype/msttcorefonts ~/tahoma.zip
RUN sudo fc-cache -f -v
RUN rm -f ~/tahoma.zip
RUN sudo fc-cache -f -s -v   #刷新字体缓存
#ENTRYPOINT pm2 start www/production.js --name 'T326_web' --no-daemon
ENTRYPOINT node www/production.js
