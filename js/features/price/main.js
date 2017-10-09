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
        './controller/PriceController',
        './service/PriceService',
        'tpl!./partials/discountsetting.html',
        'tpl!./partials/room-popover.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        PriceController,
        PriceService,
        discountsettingTpl,
        roomPopoverTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('price');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('PriceController', PriceController);
                this.mod.service('PriceService', PriceService);
                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('discountsettingTpl', discountsettingTpl());
                    $templateCache.put('roomPopoverTpl', roomPopoverTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
