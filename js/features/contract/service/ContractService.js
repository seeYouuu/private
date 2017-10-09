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
        var TransactionService = function(http, utils, $location) {
            
            this.getPushedBills = function(id){
                return http.get(utils.getapi('/sales/admin/leases/' + id + '/bills'));
            };

            this.getStatusLog = function(params){
                return http.get(utils.getapi('/sales/admin/status/logs'), {params: params});
            };
            
            this.getCustomerUsers = function(params){
                return http.get(utils.getapi('/sales/admin/open/customers'), {params: params});
            };

            this.getContractBills = function(id, params){
                return http.get(utils.getapi('/sales/admin/leases/' + id + '/bills'), {params: params});
            };

            this.createOtherBills = function(params){
                return http.post(utils.getapi('/sales/admin/leases/bills'), params);
            };
            
            this.batchPushBills = function(leaseId, params){
                return http.post(utils.getapi('/sales/admin/leases/' + leaseId + '/bills/batch/push'), params);
            };
            
            this.setLeasesStatus = function(id, params){
                return http.patch(utils.getapi('/sales/admin/leases/') + id + '/status', params);
            };

            this.addRemarks = function(params){
                return http.post(utils.getapi('/sales/admin/remarks'), params);
            };

            this.getProductDetail = function(id){
                return http.get(utils.getapi('/sales/admin/products/') + id);
            };

            this.getOfferDetail = function(id){
                return http.get(utils.getapi('/sales/admin/lease/offers/' + id));
            };

            this.getClueDetail = function(id){
                return http.get(utils.getapi('/sales/admin/lease/clues/' + id));
            };
            
            this.getSupplementaryList = function(){
                return http.get(utils.getapi('/lease/renttypes'));
            };

            this.createLease = function(params){
                return http.post(utils.getapi('/sales/admin/leases'), params);
            };

            this.updateLease = function(id, params){
                return http.put(utils.getapi('/sales/admin/leases/') + id, params);
            };

            this.getContractRemarks = function(params){
                return http.get(utils.getapi('/sales/admin/remarks'), {params: params});
            };

            this.getLeasesDetail = function(id){
                return http.get(utils.getapi('/sales/admin/leases/' + id));
            };

            this.getTypeDescription = function(){
                return http.get(utils.getapi('/rooms/type_tags'));
            };

            this.getContractList = function(params){
                return http.get(utils.getapi('/sales/admin/leases'), {params: params});
            };
            
            this.getCustomers = function(params){
                return http.get(utils.getapi('/sales/admin/customers'), {params: params});
            };

            this.getEnterprise = function(params){
                return http.get(utils.getapi('/sales/admin/enterprise_customers'), {params: params});
            };

            this.getEnterpriseDetail = function(id){
                return http.get(utils.getapi('/sales/admin/enterprise_customers/' + id));
            };

            this.getCustomerDetail = function(id){
                return http.get(utils.getapi('/sales/admin/customers/' + id));
            };

            this.getBuildings = function(params){
                return http.get(utils.getapi('/sales/admin/buildings/search'), {params: params});
            };

            this.getBuildingSpaces = function(params){
                return http.get(utils.getapi('/sales/admin/space/search'), {params: params});
            };

            this.getBuildingList = function(params) {
                return http.get(utils.getapi('/sales/admin/location/buildings'), {params: params});
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

            this.getTableItems = function(params){
                return http.get(utils.getapi('/sales/admin/generic/lists'), {params: params});
            };

            this.addRemarks = function(params){
                return http.post(utils.getapi('/sales/admin/remarks'), params);
            };

            this.getContractRemarks = function(params){
                return http.get(utils.getapi('/sales/admin/remarks'), {params: params});
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getStatus = function(){
                var response = [
                    {name: '未生效', value: 'drafting'},
                    {name: '履行中', value: 'performing'},
                    {name: '已终止', value: 'terminated'},
                    {name: '已到期', value: 'matured'},
                    {name: '已结束', value: 'end'},
                    {name: '已关闭', value: 'closed'}
                ];
                return response;
            };

            this.getKeywordList = function(){
                var response = [
                    {name: '合同号', value: 'number'},
                    {name: '客户手机号', value: 'customer_phone'},
                    {name: '客户名', value: 'customer_name'},
                    {name: '空间名', value: 'room_name'}
                ];
                return response;
            };
            
            this.getStatusDesc = function(){
                return {
                    drafting: '未生效',
                    performing: '履行中',
                    end: '已结束',
                    closed: '已关闭',
                    matured: '已到期',
                    terminated: '已终止'
                };
            };

            this.getBillStatusDesc = function(){
                return {
                    pending: '未推送',
                    unpaid: '未付款',
                    verify: '待确认',
                    paid: '已付款'
                };
            };

            this.getRentMode = function(){
                var response = [
                    {name: '起租日', value: 'rent_start'},
                    {name: '时间段', value: 'rent_range'},
                    {name: '结束日', value: 'rent_end'}
                ];
                return response;
            };

        };

        return ['http', 'utils', '$location', TransactionService];

    });

})(define);
