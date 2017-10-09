/**
 *  Defines the BillService
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the BillService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var BillService = function(http, utils, $location) {

            this.collectionSalesOffline = function(id, params){
                return http.patch(utils.getapi('/sales/admin/leases/bills/' + id + '/collection'), params);
            };
            
            this.pushLeasesBill = function(id, params){
                return http.patch(utils.getapi('/sales/admin/leases/bills/') + id, params);
            };

            this.getBillRemarks = function(params){
                return http.get(utils.getapi('/sales/admin/remarks'), {params: params});
            };

            this.getUser = function(id){
                return http.get(utils.getapi('/sales/admin/users/' + id));
            };

            this.getCustomer = function(id){
                return http.get(utils.getapi('/sales/admin/customers/' + id));
            };

            this.getRoomTypes = function(){
                return http.get(utils.getapi('/rooms/types'));
            };

            this.getBillList = function(params){
                return http.get(utils.getapi('/sales/admin/lease/bills'), {params: params});
            };

            this.updateTableColumn = function(params){
                return http.post(utils.getapi('/sales/admin/generic/lists'), params);
            };

            this.getBuildingList = function(params) {
                return http.get(utils.getapi('/sales/admin/location/buildings'), {params: params});
            };
            
            this.getTableHeader = function(params){
                return http.get(utils.getapi('/sales/admin/generic/lists/user'), {params: params});
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.addRemarks = function(params){
                return http.post(utils.getapi('/sales/admin/remarks'), params);
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getTableItems = function(params){
                return http.get(utils.getapi('/sales/admin/generic/lists'), {params: params});
            };

            this.getStatusDesc = function(){
                return {
                    pending: '未推送',
                    unpaid: '未付款',
                    verify: '待确认',
                    paid: '已付款'
                };
            };

            this.getChannels = function(){
                var response = [
                    {name: '创合钱包', value: 'sandbox'},
                    {name: '线下收款', value: 'sales_offline'}
                ];
                return response;
            };

            this.getKeywordList = function(){
                var response = [
                    {name: '账单号', value: 'bill'},
                    {name: '合同号', value: 'lease'},
                    {name: '客户手机号', value: 'phone'},
                    {name: '客户名', value: 'name'},
                    {name: '空间名', value: 'room'}
                ];
                return response;
            };

        };

        return ['http', 'utils', '$location', BillService];

    });

})(define);
