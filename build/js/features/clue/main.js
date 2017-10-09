/**
 * ******************************************************************************************************
 *
 *   Defines a clue feature
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
        './controller/ClueController',
        './service/ClueService',
        'tpl!./partials/createClues.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        ClueController,
        ClueService,
        createCluesTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('clue');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('ClueController', ClueController);
                this.mod.service('ClueService', ClueService);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('createCluesTpl', createCluesTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
