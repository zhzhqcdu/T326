'use strict';

import Base from './base.js';
import querystring from 'querystring';
import request from "request";
import pdf from 'html-pdf-wth-rendering';
import _ from 'underscore';
import PDF from 'pdfkit';
import fs from 'fs';

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
                        'Content-Type': 'application/x-www-form-urlencoded',
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
                    'Content-Type': 'application/x-www-form-urlencoded',
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
    async downloadAction() {
        const options = {
            format: 'Letter'
        };
        if (this.isGet()) {
            return this.fail("不允许get");
        }
        let ids = this.post("ids"),
            createList = new Array(),
            createRes = new Array();

        //查询结果 输出结果模板
        (async() => {
            for (var id of ids) {
                let url = `http://${this.http.host}/classes/${id}/`;
                let fn = think.promisify(request.get);
                let res = await fn({
                    url: url,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                });
                this.assign({
                    title: '签到明细',
                    semester: `${id}`,
                    datas: JSON.parse(res.body)
                });
                let html = await this.fetch(); //渲染模版

                let task = new Promise((resolve, reject) => {
                    pdf.create(html, options).toFile(`./output/${id}.pdf`, (err, res) => {
                        if (err) {
                            return console.log(err);
                            return reject(err);
                        }
                        console.log(res);
                        return resolve(res);
                    });
                });

                createList.push(task);
                createRes.push(`res${id}`);
            };
        })();

        try {
            (async() => {
                createRes = await Promise.all(createList);
                _.each(createRes, res => {
                    console.log(new Date() + "==" + res);
                });
                console.log(new Date() + "==1");
                return this.json({});
            })();
        } catch (e) {
            console.error(e);
            return this.fail(e);
        }
    }
}
