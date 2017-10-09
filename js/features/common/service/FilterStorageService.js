/**
 * Common service used to store current filter info
 */
(function(define) {
    'use strict';

    /**
     * Register the FilterStorageService class with RequireJS
     */
    define(['FeatureBase'], function(FeatureBase) {

        var FilterStorageService = function() {

            var getStorage = function () {
                return localStorage;
            };

            /**
             * store current filter info
             * @param params
             * @public
             */
            var setCurrentFilter = function (params) {
                localStorage['currentFilter'] = JSON.stringify(params || {});
            };

            return {
                getStorage: getStorage,
                setCurrentFilter: setCurrentFilter
            };

        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('FilterStorageService');
            };

            this.run = function () {
                this.mod.factory(
                    'FilterStorageService',
                    FilterStorageService
                );
            };

        });

        return Feature;

    });

})(define);