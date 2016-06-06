'use strict';

import Base from './base.js';
import fs from 'fs';
import querystring from 'querystring';
import request from "request";
import pdf from 'html-pdf-wth-rendering';
import _ from 'underscore';
import zip from "node-native-zip";
import iconv from "iconv-lite";

var logger = require('tracer').colorConsole();

export default class extends Base {
    async indexAction() {
        let queryWords = this.get("queryWords");
        if (!think.isEmpty(queryWords)) {
            let data = querystring.stringify({
                queryWords: queryWords
            });
            let url = `http://${this.http.host}/classes/?${data}`;
            let fn = think.promisify(request.get);
            try {
                let res = await fn({
                    url: url,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                this.assign({
                    title: '签到管理',
                    queryWords: queryWords,
                    datas: JSON.parse(res.body)
                });
                return this.display();
            } catch (e) {
                logger.error(e);
                return this.display();
            }
        } else {
            this.assign({
                title: '签到管理',
                queryWords: '',
                datas: new Array()
            });
            return this.display();
        }
    }

    async studentsAction() {
        let url = `http://${this.http.host}/classes/${this.get("classid")}/`;
        let fn = think.promisify(request.get);
        try {
            let res = await fn({
                url: url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            this.assign({
                title: '签到明细',
                semester: this.get("semester"),
                datas: JSON.parse(res.body)
            });
            return this.display();
        } catch (e) {
            logger.error(e);
            this.assign({
                title: '签到明细',
                semester: this.get("semester"),
                datas: new Array()
            });
            return this.display();
        }
    }

    //下载
    async createdAction() {
        const options = {
            "format": "Letter",
            //"type": "pdf"
        };
        if (this.isGet()) {
            return this.fail("不允许get");
        }
        // let ids = this.get("ids"),
        let ids = this.post("ids"),
            semester = this.post("semester"),
            createLists = new Array(),
            createRes = new Array();

        // ids = ids.split(",");
        logger.info(ids);
        (async() => {
            //查询结果
            for (let id of ids) {
                let url = `http://${this.http.host}/classes/${id}/`,
                    fn = think.promisify(request.get),
                    res = await fn({
                        url: url,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });
                this.assign({
                    title: '签到明细',
                    semester: `${semester[id]}`,
                    datas: JSON.parse(res.body)
                });
                let html = await this.fetch(), //渲染模版
                    task = new Promise((resolve, reject) => { //输出pdf
                        html = iconv.encode(html, "utf8"); //转换格式
                        pdf.create(html.toString("utf8"), options).toFile(`./output/pdf/${id}.pdf`, (err, res) => {
                            if (err) {
                                logger.error(err);
                                return reject(err);
                            }
                            logger.info(res);
                            return resolve(res);
                        });
                    });
                createLists.push(task);
            };
            //输出结果模板
            try {
                createRes = await Promise.all(createLists);

                let archive = new zip(),
                    zipname = new Date().getTime(),
                    output = `./output/zip/${zipname}.zip`,
                    filepaths = new Array();

                filepaths = _.map(createRes, res => {
                    let id = _.find(ids, id => {
                            return res.filename.indexOf(id) > -1;
                        }),
                        filename = semester[id];

                    if (!think.isEmpty(id)) {
                        return { name: `${id}.pdf`, path: res.filename }
                    }
                });

                archive.addFiles(filepaths, () => {
                    let buff = archive.toBuffer();

                    fs.writeFile(output, buff, () => {
                        logger.info("生成zip文件完成。");
                        return this.json({ status: "done", filename: zipname });
                    });
                }, function(err) {
                    logger.info(err);
                    return this.fail("异常");
                });
            } catch (e) {
                logger.error(e);
                return this.fail(e);
            }
        })();
    }

    async downloadAction() {
        let filename = this.post("filename")
        logger.info(`./output/zip/${filename}.zip`);
        return this.download(`./output/zip/${filename}.zip`);
    }
}
