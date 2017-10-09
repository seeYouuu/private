/**
 *  Defines the HomeService
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the HomeService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var HomeService = function($http, utils) {

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

        };

        return ['$http', 'utils', HomeService];

    });

})(define);
