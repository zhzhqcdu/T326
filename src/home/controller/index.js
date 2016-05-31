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
                console.error(e);
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
            console.error(e);
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
        console.log(ids);
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
                                console.error(err);
                                return reject(err);
                            }
                            console.log(res);
                            return resolve(res);
                        });
                    });
                createLists.push(task);
            };
            //输出结果模板
            try {
                createRes = await Promise.all(createLists);
                // let zip = new AdmZip(),
                //     filename = new Date().getTime(),
                //     filePath = `./output/zip/${filename}.zip`;

                // console.log(filePath);
                // _.each(createRes, res => {
                //     zip.addLocalFile(res.filename);
                // });
                // zip.writeZip(filePath);
                // 

                let filename = new Date().getTime(),
                    file = `./output/zip/${filename}.zip`,
                    opts = ['-j'],
                    fileList = [];

                _.each(createRes, res => {
                    zip.push(res.filename);
                });

                var zip = new nodejszip();

                zip.compress(file, fileList, opts, function(err) {
                    if (err) {
                        throw err;
                    }

                    return this.json({ status: "done", filename: filename });
                });
            } catch (e) {
                console.error(e);
                return this.fail(e);
            }
        })();
    }

    async downloadAction() {
        let filename = this.post("filename")
        console.log(`./output/zip/${filename}.zip`);
        return this.download(`./output/zip/${filename}.zip`);
    }
}
