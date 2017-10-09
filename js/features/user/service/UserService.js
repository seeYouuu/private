/**
 *  Defines the UserService
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the UserService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
      
        var UserService = function($http, http, utils, $location, $q) {

            
            this.getGroups = function() {
                return http.get(utils.getapi('/sales/admin/user/groups'));
            };

             this.getCustomerLists = function(params){
                return http.get(utils.getapi('/sales/admin/customers'), {params: params});
            }

            this.createGroup = function(params) {
                return http.post(utils.getapi('/sales/admin/user/groups'), params);
            };

            this.updateGroup = function(params, id) {
                return http.put(utils.getapi('/sales/admin/user/groups/' + id), params);
            };
            
            this.deleteGroup = function(id) {
                return http.delete(utils.getapi('/sales/admin/user/groups/' + id));
            };
            
            this.addUserToGroup = function(params) {
                return http.post(utils.getapi('/sales/admin/user/groups/user'), params);
            };
        
            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

        };

        return ['$http', 'http', 'utils', '$location', '$q', UserService];

    });

})(define);