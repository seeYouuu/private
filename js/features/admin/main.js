/**
 * ******************************************************************************************************
 *
 *   Defines a admin feature
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
        'lodash',
        './controller/AdminController',
        './service/AdminService',
        'tpl!./partials/additem.html',
        'tpl!./partials/deleteConf.html',
        'tpl!./partials/operateAdmin.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        _,
        AdminController,
        AdminService,
        additemTpl,
        deleteConfTpl,
        operateAdminTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('admin');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('AdminController', AdminController);
                this.mod.service('AdminService', AdminService);
                this.mod.filter('checkPosition', [function () {

                    var filterPositions = function (admin) {
                        var selectedPosition = this;
                        var result = _.intersection(_.pluck(admin.position, 'id'), _.pluck(selectedPosition, 'id'));
                        return result.length > 0 || selectedPosition.length === 0;
                    };

                    return function (allItems, currentAdmin) {
                        return allItems ? allItems.filter(filterPositions, currentAdmin): [];
                    }
                }]);
                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('additemTpl', additemTpl());
                    $templateCache.put('deleteConfTpl', deleteConfTpl());
                    $templateCache.put('operateAdminTpl', operateAdminTpl());
                }]);
            };

        });

        return Feature;
    });

}(define));
