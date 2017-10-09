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
        './controller/CompanyController',
        './service/CompanyService',
        'tpl!./partials/creatCompany.html',
        'tpl!./partials/editCompany.html',
        'tpl!./partials/linkman.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        CompanyController,
        CompanyService,
        creatCompanyTpl,
        editCompanyTpl,
        linkmanTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('company');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('CompanyController', CompanyController);
                this.mod.service('CompanyService', CompanyService);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('creatCompanyTpl', creatCompanyTpl());
                    $templateCache.put('editCompanyTpl', editCompanyTpl());
                    $templateCache.put('linkmanTpl', linkmanTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
