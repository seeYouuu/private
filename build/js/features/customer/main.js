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
        'tpl!./partials/cusPicture.html',
        'tpl!./partials/cusDetail.html',
        'tpl!./partials/importCustomers.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        CustomerController,
        CustomerService,
        creatCusTpl,
        cusPictureTpl,
        cusDetailTpl,
        importCustomersTpl,
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
                    $templateCache.put('cusPictureTpl', cusPictureTpl());
                    $templateCache.put('cusDetailTpl', cusDetailTpl());
                    $templateCache.put('importCustomersTpl', importCustomersTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
