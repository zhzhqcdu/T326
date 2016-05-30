'use strict';

import _ from 'underscore';
import moment from 'moment';
const logger = require('tracer').colorConsole();

export default class extends think.controller.rest {
    init(http) {
        super.init(http);
        this._method = "_method";
        // logger.info(this._method);
    }
    async __before() {
        logger.info("__before");
    }
    async getAction() {
        let classes = this.model("classes"),
            students = this.model("students"),
            id = this.id,
            page_size = this.get("page_size") || 100,
            page = this.get("page") || 1,
            queryWords = this.get("queryWords"),
            regText = new RegExp(queryWords, "i"),
            data = new Array();

        logger.info(think.isEmpty(id));
        if (think.isEmpty(id)) {
            let classData = await classes.where({
                $or: [{
                    class_name: {
                        $regex: regText
                    }
                }, {
                    semester: {
                        $regex: regText
                    }
                }]
            }).order("start_date DESC").select();
            let ids = _.pluck(classData, "_id");
            let total = await students.aggregate([{
                $match: {
                    clazz_id: {
                        $in: ids
                    },
                    signature: {
                        $exists: true
                    }
                }
            }, {
                $group: {
                    _id: "$clazz_id",
                    signIn: {
                        "$sum": 1
                    }
                }
            }]);
            _.each(classData, (val) => {
                _.each(total, (v) => {
                    if (_.isEqual(val._id, v._id)) {
                        _.extend(val, {
                            signIn: v.signIn
                        });
                    }
                })
            });
            data = classData;
        } else {
            let classData = await classes.where({
                "class_id": id
            }).find();
            if (think.isEmpty(classData)) {
                return this.json();
            } else {
                data = await students.where({
                    "clazz_id": classData._id
                }).select();
            }
        }
        this.json(data); //设置返回格式
    }
    async __call() {
        logger.info("__call");
        return this.fail(think.locale("ACTION_INVALID", this.http.action, this.http.url));
    }
}
