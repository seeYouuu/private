(function(define) {
    'use strict';

    /**
     * Register the humanize class with RequireJS
     */
    define(['FeatureBase', 'lodash'], function(FeatureBase, _) {

        var mapping = {
            user: {
                gender: { male: '男', female: '女' },
                credential_type: {id_card: '身份证'},
                type: { Normal: '\u200b', VIP: 'VIP' },
                status: {authed: '认证', unauthed: '注册'}
            },
            
            order: {
                status: {
                    paid: '未完成',
                    unpaid: '未付款',
                    completed: '已完成',
                    cancelled: '已取消'
                }
            },
          
            room: {
                type: {
                    office: '独立办公室',
                    meeting: '会议室',
                    flexible: '不可选工位',
                    fixed: '可选工位'
                }
            }
        };
      
        var humanize = function() {
            return function(input, resource, property) {
                if (!mapping[resource] || !mapping[resource][property] || !mapping[resource][property][input]) return input;
                var val = mapping[resource][property][input];
                if (_.isFunction(val)) val = val(input);
                return val;
            };
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('humanizeModule');
            };

            this.run = function () {
                this.mod.filter(
                    'humanize',
                    humanize
                );
            };

        });

        return Feature;

    });

})(define);