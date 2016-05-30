'use strict';

import _ from 'underscore';
const logger = require('tracer').colorConsole();

export default class extends think.controller.rest {
    init(http) {
        super.init(http);
        this._method = "_method";
        logger.info(this._method);
    }
    async __before() {
            logger.info("__before");
        }
        // async indexAction(){
        //   return this.json([]);
        // }
    async getAction() {
        let classes = this.model("classes"),
            page_size = this.get("page_size") || 100,
            page = this.get("page") || 1,
            data = new Array(),
            queryWords = this.get("queryWords"),
            regText = new RegExp(queryWords, "i");

        logger.info(this.get());
        let classData = await classes.where({
            class_name: {
                $regex: regText
            }
        }).find();
        // logger.info(classData);
        if (!_.isEmpty(classData)) { //直接查询班级下的未学生
            // logger.info(1);
            data = await this.modelInstance.limit(page_size).where({
                "clazz_id": classData._id
            }).select();
            // logger.info(data);
            if (!_.isEmpty(data)) {
                data = _.map(data, (val) => {
                    // logger.info(_.isEmpty(val.signature));
                    //隐藏敏感信息
                    val.id_number = val.id_number.substring(0, 3) + "***" + val.id_number.substring(val.id_number.length - 4, val.id_number.length - 1);
                    val.phone_number = val.phone_number.substring(0, 3) + "***" + val.phone_number.substring(val.phone_number.length - 4, val.phone_number.length - 1);
                    val.erp_number = val.erp_number.substring(0, 2) + "***" + val.erp_number.substring(val.erp_number.length - 4, val.erp_number.length - 1);
                    return _.extend(val, {
                        "class_name": classData.class_name,
                        "hasSiged": _.isEmpty(val.signature)
                    });
                });
            }
            // logger.info(data.length);
        } else { //查询未签名学生
            logger.info(2);
            data = await this.modelInstance.limit(page_size).where({
                $or: [{
                    student_id: {
                        $regex: regText
                    }
                }, {
                    student_name: {
                        $regex: regText
                    }
                }, {
                    phone_number: {
                        $regex: regText
                    }
                }, {
                    id_number: {
                        $regex: regText
                    }
                }, {
                    erp_number: {
                        $regex: regText
                    }
                }]
            }).select();
            // logger.info(data.length);
            let class_ids = _.map(data, (val) => {
                return val.clazz_id
            });
            let classesColl = await classes.where({
                _id: {
                    $in: class_ids
                }
            }).select();
            data = _.map(data, (student) => {
                // logger.info(_.isEmpty(student.signature));
                //隐藏敏感信息
                student.id_number = student.id_number.substring(0, 3) + "***" + student.id_number.substring(student.id_number.length - 4, student.id_number.length - 1);
                student.phone_number = student.phone_number.substring(0, 3) + "***" + student.phone_number.substring(student.phone_number.length - 4, student.phone_number.length - 1);
                student.erp_number = student.erp_number.substring(0, 2) + "***" + student.erp_number.substring(student.erp_number.length - 4, student.erp_number.length - 1);
                let className = _.find(classesColl, (val) => {
                    return JSON.stringify(val._id) == JSON.stringify(student.clazz_id);
                });
                return _.extend(student, {
                    "class_name": className.class_name,
                    "hasSiged": _.isEmpty(student.signature)
                });
            });
            // logger.info(data);
        }
        let pages = 1;
        this.header("pages", pages); //设置 header
        // logger.info(data);
        this.json(data); //设置返回格式
    }
    async putAction() {
        let pk = await this.modelInstance.getPk();
        logger.info(pk);
        let data = this.post();
        logger.info(data);
        let rows = await this.modelInstance.where({
            [pk]: data.id
        }).update({
            "signature": data.signature,
            "signature_date": new Date()
        });
        logger.info(rows);
        this.json({
            "status": "done"
        });
    }
    async deleteAction() {
        let pk = await this.modelInstance.getPk();
        let rows = await this.modelInstance.where({
            [pk]: this.id
        }).find();
        let updateRes = await this.modelInstance.where({
            [pk]: this.id
        }).update({
            $unset: {
                "signature": "",
                "signature_date": ""
            },
            $set: {
                signature_bakup: rows.signature || rows.signature_bakup,
                signatureDate_bakup: rows.signature_date || rows.signatureDate_bakup
            }
        });
        logger.info(updateRes);
        this.json({
            "status": "done"
        });
    }
    async __call() {
        logger.info("__call");
        return this.fail(think.locale("ACTION_INVALID", this.http.action, this.http.url));
    }
}
