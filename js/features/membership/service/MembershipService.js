/**
 *  Defines the MembershipService
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the MembershipService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
      
        var MembershipService = function($http, http, utils, $location, $q) {
            
            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.getUserList = function(params){
                return http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getMembershipOrders = function(id, params){
                return http.get(utils.getapi('/sales/admin/membership/cards/' + id + '/orders'), {params: params});
            };

            this.getMembershipList = function() {
                return http.get(utils.getapi('/sales/admin/membership/cards'));
            };

            this.getMembershipDetail = function(id) {
                return http.get(utils.getapi('/sales/admin/membership/cards/') + id);
            };

            this.createMembership = function(params) {
                return http.post(utils.getapi('/sales/admin/membership/cards'), params);
            };

            this.editMembership = function(params, id) {
                return http.put(utils.getapi('/sales/admin/membership/cards/' + id), params);
            };

            this.getBuildings = function(params) {
                return http.get(utils.getapi('/sales/admin/location/buildings'), {params: params});
            };

            this.getDoors = function(params){
                return http.get(utils.getapi('/sales/admin/doors'), {params: params});
            };

            this.setCardVisible = function(params, id) {
                return http.patch(utils.getapi('/sales/admin/membership/cards/' + id), params);
            };

            this.setSpecification = function(params, id) {
                return http.post(utils.getapi('/sales/admin/membership/cards/' + id + '/specification'), params);
            };

            
        };

        return ['$http', 'http', 'utils', '$location', '$q', MembershipService];

    });

})(define);