'use strict';

import Base from './base.js';
import querystring from 'querystring';
import request from "request";

export default class extends Base {
    async indexAction() {
        let queryWords = this.get("queryWords");
        console.log(this.http.host);
        if (!think.isEmpty(queryWords)) {
            let data = querystring.stringify({
                queryWords: queryWords
            });
            let url = `http://${this.http.host}/classes/?${data}`;
            console.log(url);
            let fn = think.promisify(request.get);
            try {
                let res = await fn({
                    url: url,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                });
                // console.log(JSON.parse(res.body));
                this.assign({
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
                queryWords: '',
                datas: []
            });
            return this.display();
        }
    }

    async studentsAction() {
        this.display();
    }
}
