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

            this.getUserList = function(params) {
              return http.get(utils.getapi('/sales/admin/users/search'), {params: params});
            };

            this.getUsers = function(params){
                return http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getRoomTypes = function(){
                return http.get(utils.getapi('/rooms/types'));
            };

            this.getSpaceOrders = function(params) {
                return http.get(utils.getapi('/sales/admin/orders'), {params: params});
            };

            this.getEventOrders = function(params){
                return http.get(utils.getapi('/sales/admin/events/orders'), {params: params});
            };

            this.getRechargeOrders = function(params, id){
                return http.get(utils.getapi('/sales/admin/useraccounts/' + id + '/charges', 'ext_api'), {params: params});
            };

            this.getLeasesLists = function(params){
                return http.get(utils.getapi('/sales/admin/leases'), {params: params});
            };

            this.getAppointmentList = function(params){
                return http.get(utils.getapi('/sales/admin/products/appointments/list'), {params: params});
            };

            this.getInvoiceList = function(params){
                return http.get(utils.getapi('/sales/admin/invoices', 'ext_api'), {params: params});
            };

            this.getMembershipList = function(params) {
                return http.get(utils.getapi('/sales/admin/membership/cards/orders/list'), {params: params});
            };

            this.getUserInfo = function(id) {
                return http.get(utils.getapi('/sales/admin/users/' + id + '/info'));
            };

            this.createUserInfo = function(params, id) {
                return http.post(utils.getapi('/sales/admin/users/' + id + '/info'), params);
            };

            this.updateUserInfo = function(params, id) {
                return http.put(utils.getapi('/sales/admin/users/' + id + '/info'), params);
            };

            this.getOrderNumber = function(params){
                return http.get(utils.getapi('/sales/admin/orders/numbers'), {params: params});
            };
          
            this.getUserDetail = function(id) {
              return http.get(utils.getapi('/sales/admin/users/' + id));
            };

            this.getUserAccount = function(params) {
              return http.get(utils.getapi('/sales/admin/useraccounts', 'ext_api'), {params: params});
            };

            this.getGroups = function() {
                return http.get(utils.getapi('/sales/admin/user/groups'));
            };

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

            this.getGroupCount = function() {
                return http.get(utils.getapi('/sales/admin/user/groups/count'));
            };
        
            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.getInvoiceStatus = function(){
                return {
                    pending: '待开发票',
                    completed: '己开发票',
                    cancelled: '已撤销',
                    cancelled_wait: '待撤销'
                };
            };

            this.getInvoiceType = function(){
                return {
                    special: '增值税专用发票',
                    common: '增值税普通发票'
                };
            };

            this.getAppointmentStatusDesc = function(){
                return {
                    accepted: '已同意',
                    pending: '审核中',
                    rejected: '己拒绝',
                    withdrawn: '已撤销'
                };
            };

            this.getAgreementStatusDesc = function(){
                return {
                    confirming: '待确认',
                    reconfirming: '重新确认',
                    confirmed: '已确认',
                    performing: '履行中',
                    end: '已结束',
                    closed: '已关闭',
                    expired: '已超时',
                    matured: '已到期',
                    terminated: '已结束(终止)'
                };
            };

            this.getUnitDesc = function(){
                return {
                    hour: '小时',
                    day: '天',
                    month: '月'
                }
            };

            this.getKeywordList = function() {
              var response = [
                  {name: '用户昵称', value: 'name'}
                  // {name: '手机号', value: 'phone'},
                  // {name: '邮箱', value: 'email'},
                  // {name: 'ID', value: 'id'}
              ];
              return response;
            };

            this.getCertificateType = function() {
                var response = [
                    {name: '身份证', type: 'id_card'},
                    {name: '护照', type: 'passport'}
                ];
                return response;
            };

            this.getTypeDesc = function() {
                return {
                    id_card: '身份证',
                    passport: '护照'
                }
            };

            this.getCardStatus = function() {
              var response = [
                  {name: '已绑定', key: 'card', value: '1'},
                  {name: '未绑定', key: 'card', value: '0'}
              ];
              return response;
            };
        };

        return ['$http', 'http', 'utils', '$location', '$q', UserService];

    });

})(define);