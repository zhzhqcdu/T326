

ubuntu 14.04

更新了源：
```
echo "deb http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse" >> /etc/apt/sources.list
```

安装了字体：
```
apt-get update && apt-get install -y \
        ttf-mscorefonts-installer \
        xfonts-wqy
```
