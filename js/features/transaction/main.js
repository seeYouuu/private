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
        './controller/TransactionController',
        './service/TransactionService',
        'tpl!./partials/popup.html',
        'tpl!./partials/originImagePreview.html',
        'tpl!./partials/orderRemark.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        TransactionController,
        TransactionService,
        popupTpl,
        tranImgPreviewTpl,
        orderRemarkTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('transaction');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('TransactionController', TransactionController);
                this.mod.service('TransactionService', TransactionService);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('popupTpl', popupTpl());
                    $templateCache.put('tranImgPreviewTpl', tranImgPreviewTpl());
                    $templateCache.put('orderRemarkTpl', orderRemarkTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
