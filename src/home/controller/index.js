'use strict';

import Base from './base.js';
import fs from 'fs';
import querystring from 'querystring';
import request from "request";
import pdf from 'html-pdf-wth-rendering';
import _ from 'underscore';
import PDF from 'pdfkit';
import nodejszip from "nodejs-zip";
import AdmZip from "adm-zip";
import zip from "node-native-zip";

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
            "format": "Letter"
        };
        if (this.isGet()) {
            return this.fail("不允许get");
        }
        // let ids = this.get("ids"),
        let ids = this.post("ids"),
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
                    semester: `${id}`,
                    datas: JSON.parse(res.body)
                });
                let html = await this.fetch(), //渲染模版
                    task = new Promise((resolve, reject) => { //输出pdf
                        pdf.create(html).toFile(`./output/pdf/${id}.pdf`, (err, res) => {
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

                // var archive = new zip();

                // archive.addFiles([
                //     { name: "moehah.txt", path: "./test/moehah.txt" },
                //     { name: "images/suz.jpg", path: "./test/images.jpg" }
                // ], function() {
                //     var buff = archive.toBuffer();

                //     fs.writeFile("./test2.zip", buff, function() {
                //         logger.info("Finished");
                //     });
                // }, function(err) {
                //     logger.info(err);
                // });

                // let zip = new AdmZip(),
                //     filename = new Date().getTime(),
                //     filePath = `./output/zip/${filename}.zip`;

                // logger.info(filePath);
                // _.each(createRes, res => {
                //     zip.addLocalFile(res.filename);
                //     logger.info(think.isFile(res.filename));
                // });
                // zip.writeZip(filePath);

                // return this.json({ status: "done", filename: filename });

                let filename = new Date().getTime(),
                    file = `./output/zip/${filename}.zip`,
                    opts = ['-j'],
                    fileList = [];

                fileList = _.map(createRes, res => {
                    return res.filename;
                });

                var zip = new nodejszip();

                zip.compress(file, fileList, opts, function(err) {
                    if (err) {
                        throw err;
                    }

                    return this.json({ status: "done", filename: filename });
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
