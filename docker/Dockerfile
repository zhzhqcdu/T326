#FROM daocloud.io/library/node:6.2.1
FROM index.alauda.cn/library/ubuntu:14.04

RUN rm -v /etc/apt/sources.list
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse" >> /etc/apt/sources.list

RUN apt-get update && apt-get install -y \
    ttf-mscorefonts-installer \
    xfonts-wqy
