/**
 * ******************************************************************************************************
 *
 *   Defines a log feature
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
        './controller/LogController',
        './service/LogService',
        'tpl!./partials/user.html',
        'tpl!./partials/room.html',
        'tpl!./partials/event.html',
        'tpl!./partials/room_order_preorder.html',
        'tpl!./partials/room_order_reserve.html',
        'tpl!./partials/room_order.html',
        'tpl!./partials/invoice.html',
        'tpl!./partials/building.html',
        'tpl!./partials/admin.html',
        'tpl!./partials/product.html',
        'tpl!./partials/remark.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        LogController,
        LogService,
        userTpl,
        roomTpl,
        eventTpl,
        room_order_preorderTpl,
        room_order_reserveTpl,
        room_orderTpl,
        invoiceTpl,
        buildingTpl,
        adminTpl,
        productTpl,
        remarkTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('log');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('LogController', LogController);
                this.mod.service('LogService', LogService);
                
                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('userTpl', userTpl());
                    $templateCache.put('roomTpl', roomTpl());
                    $templateCache.put('eventTpl', eventTpl());
                    $templateCache.put('room_order_preorderTpl', room_order_preorderTpl());
                    $templateCache.put('room_order_reserveTpl', room_order_reserveTpl());
                    $templateCache.put('room_orderTpl', room_orderTpl());
                    $templateCache.put('invoiceTpl', invoiceTpl());
                    $templateCache.put('buildingTpl', buildingTpl());
                    $templateCache.put('adminTpl', adminTpl());
                    $templateCache.put('productTpl', productTpl());
                    $templateCache.put('remarkTpl', remarkTpl());
                }]);
            };

        });

        return Feature;
    });

}(define));
