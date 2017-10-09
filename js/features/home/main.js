/**
 * ******************************************************************************************************
 *
 *   Defines a home feature
 *
 *  @author  sky.zhang
 *  @date    Sep 11, 2016
 *
 * ******************************************************************************************************
 */
(function(define) {
    'use strict';

    define([
        'FeatureBase',
        './Routes',
        './controller/HomeController',
        './service/HomeService',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        HomeController,
        HomeService,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('home');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('HomeController', HomeController);
                this.mod.service('HomeService', HomeService);
            };

        });

        return Feature;

    });

}(define));
