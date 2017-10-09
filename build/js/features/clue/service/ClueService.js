/**
 *  Defines the ClueService
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the ClueService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var ClueService = function(http, utils, $location) {

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

            this.updateClue = function(id, params){
                return http.put(utils.getapi('/sales/admin/lease/clues/') + id, params);
            };
            
            this.closeClue = function(id, params){
                return http.patch(utils.getapi('/sales/admin/lease/clues/') + id, params);
            };

            this.getProductDetail = function(id){
                return http.get(utils.getapi('/sales/admin/products/') + id);
            };

            this.getBuildingDetail = function(id){
                return http.get(utils.getapi('/sales/admin/buildings/' + id));
            };

            this.createClue = function(params){
                return http.post(utils.getapi('/sales/admin/lease/clues'), params);
            };

            this.getCustomers = function(params){
                return http.get(utils.getapi('/sales/admin/customers'), {params: params});
            };

            this.getClueDetail = function(id){
                return http.get(utils.getapi('/sales/admin/lease/clues/' + id));
            };

            this.getBuildings = function(params){
                return http.get(utils.getapi('/sales/admin/buildings/search'), {params: params});
            };

            this.getBuildingSpaces = function(params){
                return http.get(utils.getapi('/sales/admin/space/search'), {params: params});
            };

            this.getAreacode = function(){
                return http.get(utils.getapi('/phonecode/lists'));
            };

            this.getClueList = function(params){
                return http.get(utils.getapi('/sales/admin/lease/clues'), {params: params});
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getStatus = function(){
                var response = [
                    {name: '新线索', value: 'clue'},
                    {name: '已关闭', value: 'closed'},
                    {name: '已转为报价', value: 'offer'},
                    {name: '已转为合同', value: 'contract'}
                ];
                return response;
            };

            this.getStatusDesc = function(){
                return {
                    clue: '新线索',
                    closed: '已关闭',
                    offer: '已转为报价',
                    contract: '已转为合同'
                };
            };

            this.getKeywordList = function(){
                var response = [
                    {name: '线索号', value: 'number'},
                    {name: '客户手机号', value: 'customer_phone'},
                    {name: '客户名', value: 'customer_name'},
                    {name: '空间名', value: 'room_name'}
                ];
                return response;
            };
        };

        return ['http', 'utils', '$location', ClueService];

    });

})(define);
