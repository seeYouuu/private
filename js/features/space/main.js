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
        './controller/SpaceController',
        './service/SpaceService',
        './service/GalleryUploadImage',
        './directive/sbYear',
        './directive/sbMonth',
        './directive/sbDate',
        './directive/sbDateSelector',
        'tpl!./partials/dialog.html',
        'tpl!./partials/reserveDlg.html',
        'tpl!./partials/setStatusPop.html',
        'tpl!./partials/add-customer.html',
        './lang/lang_zh',
        './lang/lang_en'
    ], function(Base,
        Routes,
        _,
        SpaceController,
        SpaceService,
        GalleryUploadImage,
        sbYear,
        sbMonth,
        sbDate,
        sbDateSelector,
        dialogTpl,
        reserveDlgTpl,
        setStatusPopTpl,
        addCustomerTpl,
        lang_zh,
        lang_en) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('space');
            };

            this.constructor = function() {
                this.routes = Routes;
                this.lang = {
                    zh: lang_zh,
                    en: lang_en
                };
            };

            this.run = function() {
                this.mod.controller('SpaceController', SpaceController);
                this.mod.service('SpaceService', SpaceService);
                this.mod.service('GalleryUploadImage', GalleryUploadImage);
                this.mod.directive('sbYear', sbYear);
                this.mod.directive('sbMonth', sbMonth);
                this.mod.directive('sbDate', sbDate);
                this.mod.directive('sbDateSelector', sbDateSelector);

                this.mod.filter('typeFilter', [function () {

                    var filterType = function (item) {
                        var selectedProFilter = this;
                        if(selectedProFilter[1]){
                            return true;
                        }else{
                            var result = _.intersection([item.type], _.pluck(selectedProFilter[0], 'type'));
                            return result.length > 0 || selectedProFilter[0].length === 0;
                        }
                    };
                    return function (comSpaceList, selectedProFilter) {
                        return comSpaceList ? comSpaceList.filter(filterType, selectedProFilter): [];
                    }
                }]);

                this.mod.filter('statusFilter', [function () {

                    var filterStatus = function (item) {
                        var selectedStatus = this;
                        var result = selectedStatus[0].has_rent ? item.has_rent == selectedStatus[0].has_rent : item.product.visible == selectedStatus[0].visible;
                        return result || selectedStatus[0] == '';
                    };
                    return function (comSpaceList, selectedStatus) {
                        return comSpaceList ? comSpaceList.filter(filterStatus, selectedStatus): [];
                    }
                }]);

                this.mod.run(['$templateCache', function($templateCache) {
                    $templateCache.put('dialogTpl', dialogTpl());
                    $templateCache.put('reserveDlgTpl', reserveDlgTpl());
                    $templateCache.put('setStatusPopTpl', setStatusPopTpl());
                    $templateCache.put('addCustomerTpl', addCustomerTpl());
                }]);
            };

        });

        return Feature;
    });

}(define));
