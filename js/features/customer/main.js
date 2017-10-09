/**
 * ******************************************************************************************************
 *
 *   Defines a transaction feature
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 * ******************************************************************************************************
 */
(function(define) {
    'use strict';

    define([
        'FeatureBase',
        './Routes',
        './controller/CustomerController',
        './service/CustomerService',
        'tpl!./partials/creatCus.html',
        'tpl!./partials/cusDetail.html',
        'tpl!./partials/importCustomers.html',
        'tpl!./partials/changeGroups.html',
        'tpl!./partials/batchJoinGroup.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        CustomerController,
        CustomerService,
        creatCusTpl,
        cusDetailTpl,
        importCustomersTpl,
        changeGroupsTpl,
        batchJoinGroupTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('customer');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('CustomerController', CustomerController);
                this.mod.service('CustomerService', CustomerService);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('creatCusTpl', creatCusTpl());
                    $templateCache.put('cusDetailTpl', cusDetailTpl());
                    $templateCache.put('importCustomersTpl', importCustomersTpl());
                    $templateCache.put('changeGroupsTpl', changeGroupsTpl());
                    $templateCache.put('batchJoinGroupTpl', batchJoinGroupTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
