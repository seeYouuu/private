/**
 * ******************************************************************************************************
 *
 *   Defines a event feature
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
        './controller/EventController',
        './service/EventService',
        'tpl!./partials/eventDialog.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        EventController,
        EventService,
        eventDialogTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('event');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('EventController', EventController);
                this.mod.service('EventService', EventService);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('eventDialogTpl', eventDialogTpl());
                }]);
            };

        });

        return Feature;

    });

}(define));
