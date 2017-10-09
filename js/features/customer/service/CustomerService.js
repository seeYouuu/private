/**
 *  Defines the TransactionService
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the TransactionService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */

        var CustomerService = function(http, utils, $location) {


            this.updateTableColumn = function(params){
                return http.post(utils.getapi('/sales/admin/generic/lists'), params);
            };

            this.cusMessage = function(params){
                return http.post(utils.getapi('/sales/admin/customers'), params);
            };

            this.getCustomerLists = function(params){
                return http.get(utils.getapi('/sales/admin/customers'), {params: params});
            }

            this.getCustomerDetail = function(id){
                return http.get(utils.getapi('/sales/admin/customers/'+id));
            };
            
            this.getTableHeader = function(params){
                return http.get(utils.getapi('/sales/admin/generic/lists/user'), {params: params});
            };

            this.getTableItems = function(params){
                return http.get(utils.getapi('/sales/admin/generic/lists'), {params: params});
            };

            this.importCustomers = function(import_serial_number){
                return http.get(utils.getapi('/sales/admin/customers/import_preview/'+import_serial_number));
            };

            this.importCustomerConfirm = function(params){
                return http.post(utils.getapi('/sales/admin/customers/import_confirm'), params);
            };

            this.changeCustomerTel = function(id, params){
                return http.post(utils.getapi('/sales/admin/customers/'+id+'/phone'), params);
            };

            this.changeCustomerMessage = function(id, params){
                return http.patch(utils.getapi('/sales/admin/customers/' + id), params);
            };

            this.searchUser = function(params){
                return http.get(utils.getapi('/sales/admin/open/users'), {params: params});
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getAreacode = function(){
                return http.get(utils.getapi('/phonecode/lists'));
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
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

            this.addUserToGroup = function(params) {
                return http.post(utils.getapi('/sales/admin/user/groups/user'), params);
            };

            this.getIdType = function(){
                return[
                    {name: "身份证"},
                    {name: "护照"}
                ]
            };

            this.getKeywordList = function(){
                var response = [
                    {name: '客户手机号', value: 'customer_phone'},
                    {name: '客户名', value: 'customer_name'},
                    {name: '客户邮箱', value: 'room_name'}
                ];
                return response;
            };

        };

        return ['http', 'utils', '$location', CustomerService];

    });

})(define);
