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
        './controller/UserController',
        './service/UserService',
        'tpl!./partials/userGroupDialog.html',
        'tpl!./partials/delConfirm.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        UserController,
        UserService,
        userGroupTpl,
        delConfirmTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('user');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('UserController', UserController);
                this.mod.service('UserService', UserService);
                
                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('userGroupTpl', userGroupTpl());
                    $templateCache.put('delConfirmTpl', delConfirmTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
