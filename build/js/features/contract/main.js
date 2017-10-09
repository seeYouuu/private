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
        './controller/ContractController',
        './service/ContractService',
        'tpl!./partials/contractItem.html',
        'tpl!./partials/contractBill.html',
        'tpl!./partials/contractPrint.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        ContractController,
        ContractService,
        contractItemTpl,
        contractBillTpl,
        contractPrintTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('leasecontract');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('ContractController', ContractController);
                this.mod.service('ContractService', ContractService);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('contractItemTpl', contractItemTpl());
                    $templateCache.put('contractBillTpl', contractBillTpl());
                    $templateCache.put('contractPrintTpl', contractPrintTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
