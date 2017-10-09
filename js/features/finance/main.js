/**
 * ******************************************************************************************************
 *
 *   Defines a invoice feature
 *
 *  @author  liping.chen
 *  @date    Jun 13, 2016
 *
 * ******************************************************************************************************
 */
(function(define) {
    'use strict';

    define([
        'FeatureBase',
        './Routes',
        './controller/FinanceController',
        './service/FinanceService',
        'tpl!./partials/invoiceDialog.html',
        'tpl!./partials/financeDialog.html',
        'tpl!./partials/popup.html',
        'tpl!./partials/originImagePreview.html',
        'tpl!./partials/remarkDialog.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        FinanceController,
        FinanceService,
        invoiceDialogTpl,
        financeDialogTpl,
        financePopupTpl,
        financePreviewTpl,
        remarkDialogTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('finance');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('FinanceController', FinanceController);
                this.mod.service('FinanceService', FinanceService);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('invoiceDialogTpl', invoiceDialogTpl());
                    $templateCache.put('financeDialogTpl', financeDialogTpl());
                    $templateCache.put('financePopupTpl', financePopupTpl());
                    $templateCache.put('financePreviewTpl', financePreviewTpl());
                    $templateCache.put('remarkDialogTpl', remarkDialogTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
