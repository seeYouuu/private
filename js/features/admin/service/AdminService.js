/**
 *  Defines the AdminService
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the AdminService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var AdminService = function(http, utils, $location) {

            this.bindPositionsForAdmin = function(params){
                return http.post(utils.getapi('/admin/position/bindings'), params);
            };

            this.getGroupsMap = function(){
                return http.get(utils.getapi('/admin/permissions/groups_map'));
            };
            
            this.getAdmins = function(params){
                return http.get(utils.getapi('/admin/admins'), {params: params});
            };

            this.getSpecifyAdmin = function(params){
                return http.get(utils.getapi('/admin/positions/specify_admin'), {params: params});
            };

            this.getPositionsCounts = function(){
                return http.get(utils.getapi('/admin/positions/counts'));
            };

            this.getExtraAdmins = function(params){
                return http.get(utils.getapi('/admin/extra/admins'), {params: params});
            };

            this.getAdminPositions = function(params){
                return http.get(utils.getapi('/admin/positions/specify_admin'), {params: params});
            };

            this.searchUser = function(params){
                return http.get(utils.getapi('/admin/users/by_phone'), {params: params});
            };

            this.getAdminMenu = function(params){
                return http.get(utils.getapi('/admin/admins/menu'), {params: params});
            };

            this.getPositionMenu = function(params){
                return http.get(utils.getapi('/admin/admins/position/menu'), {params: params});
            };

            this.addPosition = function(params){
                return http.post(utils.getapi('/admin/positions'), params);
            };

            this.editPosition = function(params, id){
                return http.put(utils.getapi('/admin/positions/' + id), params);
            };

            this.getIcons = function(){
                return http.get(utils.getapi('/admin/positions/icons'));
            };

            this.getExcludePermission = function(){
                return http.get(utils.getapi('/sales/admin/auth/exclude_permissions'));
            };

            this.getPermissions = function(params){
                return http.get(utils.getapi('/admin/permissions') , {params: params});
            };

            this.getPositions = function(params){
                return http.get(utils.getapi('/admin/positions'), {params: params});
            };

            this.deletePosition = function(id) {
                return http.delete(utils.getapi('/admin/positions/' + id));
            };

            this.changePosition = function(id, type, params){
                return http.post(utils.getapi('/admin/positions/' + id + '/change_position?type=' + type), params);
            };

            this.addPositionForAdmin = function(params){
                return http.post(utils.getapi('/admin/position/bindings'), params);
            };

            this.deleteAdminFromPlatform = function(params){
                return http.delete(utils.getapi('/admin/position/bindings/from_platform'), {params: params});
            };

            this.deleteAdminPosition = function(params){
                return http.delete(utils.getapi('/admin/position/bindings/from_module'), {params: params});
            };

            this.deleteFromCommunity = function(params){
                return http.delete(utils.getapi('/admin/position/bindings/from_community'), {params: params});
            };

            this.deleteFromGlobal = function(params){
                return http.delete(utils.getapi('/admin/position/bindings/from_global'), {params: params});
            };

            this.bindingPosition = function(params){
                return http.post(utils.getapi('/admin/position/bindings'), params);
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };
        };

        return ['http', 'utils', '$location', AdminService];

    });

})(define);
