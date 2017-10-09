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
        './controller/BillController',
        './service/BillService',
        'tpl!./partials/billDetail.html',
        'tpl!./partials/billPrint.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        BillController,
        BillService,
        billDetailTpl,
        billPrintTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('bill');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('BillController', BillController);
                this.mod.service('BillService', BillService);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('billDetailTpl', billDetailTpl());
                    $templateCache.put('billPrintTpl', billPrintTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
