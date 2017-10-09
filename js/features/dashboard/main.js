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
        './controller/DashboardController',
        './service/DashboardService',
        './directive/sbChart',
        './directive/sbDashDate',
        'tpl!./partials/pureReverse.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        DashboardController,
        DashboardService,
        sbChart,
        sbDashDate,
        pureReverseTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('dashboard');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('DashboardController', DashboardController);
                this.mod.service('DashboardService', DashboardService);
                this.mod.directive('sbChart', sbChart);
                this.mod.directive('sbDashDate', sbDashDate);
                
                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('pureReverseTpl', pureReverseTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
