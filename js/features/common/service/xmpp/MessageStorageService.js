/**
 * Common service used to store current filter info
 */
(function(define) {
    'use strict';

    /**
     * Register the FilterStorageService class with RequireJS
     */
    define(['FeatureBase'], function(FeatureBase) {

        var MessageStorageService = function() {

            var storage = {};

            var getStorage = function () {
                return localStorage;
                // return storage;
            };

            /**
             * store current filter info
             * @param params
             * @public
             */
            var setHistoryMessage = function (params) {
                // storage['historyMessage'] = JSON.stringify(params || []);
                localStorage['historyMessage'] = JSON.stringify(params || []);
            };

            var setGroupMembers = function (params) {
                localStorage['members'] = JSON.stringify(params || []);
            };

            return {
                getStorage: getStorage,
                setHistoryMessage: setHistoryMessage,
                setGroupMembers: setGroupMembers
            };

        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('MessageStorageServiceModule');
            };

            this.run = function () {
                this.mod.factory(
                    'MessageStorageService',
                    MessageStorageService
                );
            };

        });

        return Feature;

    });

})(define);