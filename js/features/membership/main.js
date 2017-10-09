/**
 * ******************************************************************************************************
 *
 *   Defines a dashboard feature
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 * ******************************************************************************************************
 */
(function(define) {
    'use strict';

    define([
        'FeatureBase',
        './Routes',
        './controller/MembershipController',
        './service/MembershipService',
        'tpl!./partials/cropDialog.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        MembershipController,
        MembershipService,
        cropDialogTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('membership');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('MembershipController', MembershipController);
                this.mod.service('MembershipService', MembershipService);
                
                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('cropDialogTpl', cropDialogTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
