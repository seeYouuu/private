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

            this.getClueRemarks = function(params){
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
                    drafting: '已确认',
                    performing: '履行中',
                    end: '已结束',
                    closed: '已关闭',
                    matured: '已到期',
                    terminated: '已终止'
                };
            };

        };

        return ['http', 'utils', '$location', TransactionService];

    });

})(define);
