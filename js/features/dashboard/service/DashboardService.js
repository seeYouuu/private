/**
 *  Defines the DashboardService
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the DashboardService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var DashboardService = function($http, utils, $location) {

            // this.getStates = function() {
            //     return $http.get(utils.getapi('/states'));
            // };

            this.setCookies = function(params){
                return $http.post(utils.getapi('/admin/platform_set'), params);
            };

            this.cancelOrder = function(id){
                return $http.post(utils.getapi('/sales/admin/orders/' + id + '/cancel'));
            };

            this.getBuildings = function(params){
                return $http.get(utils.getapi('/sales/admin/dashboard/buildings'), {params: params});
            };

            this.spacePreorder = function(params){
                return $http.post(utils.getapi('/sales/admin/orders/preorder'), params);
            };

            this.spaceReserve = function(params){
                return $http.post(utils.getapi('/sales/admin/orders/reserve'), params);
            }

            // this.searchUser = function(params){
            //     return $http.get(utils.getapi('/sales/admin/users/search'), {params: params});
            // };

            this.searchUser = function(params){
                return $http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getDateInfo = function(id,params){
                return $http.get(utils.getapi('/client/products/' + id + '/dates'), {params: params});
            };

            this.getProductDetail = function(id){
                return $http.get(utils.getapi('/sales/admin/products/') + id);
            };

            this.getPermissionMap = function(){
                return $http.get(utils.getapi('/admin/auth/groups'));
            };

            this.getUsers = function(params){
                return $http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getCustomerUsers = function(params){
                return $http.get(utils.getapi('/sales/admin/open/customers'), {params: params});
            };

            this.getUsages = function(params){
                return $http.get(utils.getapi('/sales/admin/dashboard/rooms/usage'), {params: params});
            };

            this.getRoomTypes = function(){
                return $http.get(utils.getapi('/sales/admin/room/types'));
            };

            // this.getMenus = function() {
            //     return $http.get(utils.getapi('/menus'));
            // };

            // this.getDropdown = function() {
            //     return $http.get(utils.getapi('/dropdown'));
            // };

            this.getClockList = function(){
                return [{name: '00:00:00'},{name: '00:30:00'},{name: '01:00:00'},{name: '01:30:00'},{name: '02:00:00'},{name: '02:30:00'},{name: '03:00:00'},{name: '03:30:00'},{name: '04:00:00'},{name: '04:30:00'},
                        {name: '05:00:00'},{name: '05:30:00'},{name: '06:00:00'},{name: '06:30:00'},{name: '07:00:00'},{name: '07:30:00'},{name: '08:00:00'},{name: '08:30:00'},{name: '09:00:00'},
                        {name: '09:30:00'},{name: '10:00:00'},{name: '10:30:00'},{name: '11:00:00'},{name: '11:30:00'},{name: '12:00:00'},{name: '12:30:00'},{name: '13:00:00'},{name: '13:30:00'},{name: '14:00:00'},
                        {name: '14:30:00'},{name: '15:00:00'},{name: '15:30:00'},{name: '16:00:00'},{name: '16:30:00'},{name: '17:00:00'},{name: '17:30:00'},{name: '18:00:00'},{name: '18:30:00'},{name: '19:00:00'},
                        {name: '19:30:00'},{name: '20:00:00'},{name: '20:30:00'},{name: '21:00:00'},{name: '21:30:00'},{name: '22:00:00'},{name: '22:30:00'},{name: '23:00:00'},{name: '23:30:00'}];
            };

            this.getTimeItems = function(type){
                var res = [];
                if(type == 'month'){
                    res = [{name: '一月',num:1},{name: '二月',num:2},{name: '三月',num:3},{name: '四月',num:4},{name: '五月',num:5},{name: '六月',num:6},{name: '七月',num:7},{name: '八月',num:8},{name: '九月',num:9},{name: '十月',num:10},{name: '十一月',num:11},{name: '十二月',num:12}];
                }else if(type == 'day'){
                    res = [{name: '周日',num: 1},{name: '周一',num: 2},{name: '周二',num: 3},{name: '周三',num: 4},{name: '周四',num: 5},{name: '周五',num: 6},{name: '周六',num: 7}];
                }else if(type == 'hour'){
                    res = [{name: 1},{name: 2},{name: 3},{name: 4},{name: 5},{name: 6},{name: 7},{name: 8},{name: 9},{name: 10},{name: 11},{name: 12},{name: 13},{name: 14},{name: 15},{name: 16},{name: 17},{name: 18},{name: 19},{name: 20},{name: 21},{name: 22},{name: 23},{name: 24}];
                }
                return res;
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

        };

        return ['$http', 'utils', '$location', DashboardService];

    });

})(define);
