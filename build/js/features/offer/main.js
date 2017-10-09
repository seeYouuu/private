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
        './controller/OfferController',
        './service/OfferService',
        'tpl!./partials/offerItem.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        OfferController,
        OfferService,
        offerItemTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('leaseoffer');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('OfferController', OfferController);
                this.mod.service('OfferService', OfferService);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('offerItemTpl', offerItemTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
