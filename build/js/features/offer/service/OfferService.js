/**
 *  Defines the OfferService
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the OfferService class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var OfferService = function(http, utils, $location) {
            
            this.getClueDetail = function(id){
                return http.get(utils.getapi('/sales/admin/lease/clues/' + id));
            };

            this.closeOffer = function(id, params){
                return http.patch(utils.getapi('/sales/admin/lease/offers/') + id, params);
            };

            this.getOfferRemarks = function(params){
                return http.get(utils.getapi('/sales/admin/remarks'), {params: params});
            };

            this.addRemarks = function(params){
                return http.post(utils.getapi('/sales/admin/remarks'), params);
            };
            
            this.getProductDetail = function(id){
                return http.get(utils.getapi('/sales/admin/products/') + id);
            };

            this.getCustomers = function(params){
                return http.get(utils.getapi('/sales/admin/customers'), {params: params});
            };

            this.updateTableColumn = function(params){
                return http.post(utils.getapi('/sales/admin/generic/lists'), params);
            };
            
            this.getSupplementaryList = function(){
                return http.get(utils.getapi('/lease/renttypes'));
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

            this.getTableHeader = function(params){
                return http.get(utils.getapi('/sales/admin/generic/lists/user'), {params: params});
            };

            this.getTableItems = function(params){
                return http.get(utils.getapi('/sales/admin/generic/lists'), {params: params});
            };

            this.updateOffer = function(id, params){
                return http.put(utils.getapi('/sales/admin/lease/offers/' + id), params);
            };

            this.addOffer = function(params){
                return http.post(utils.getapi('/sales/admin/lease/offers'), params);
            };

            this.getOfferDetail = function(id){
                return http.get(utils.getapi('/sales/admin/lease/offers/' + id));
            };

            this.getOfferList = function(params){
                return http.get(utils.getapi('/sales/admin/lease/offers'), {params: params});
            };

            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.getStatus = function(){
                var response = [
                    {name: '报价中', value: 'offer'},
                    {name: '已关闭', value: 'closed'},
                    {name: '已转为合同', value: 'contract'}
                ];
                return response;
            };

            this.getStatusDesc = function(){
                return {
                    closed: '已关闭',
                    offer: '报价',
                    contract: '已转为合同'
                };
            };

            this.getKeywordList = function(){
                var response = [
                    {name: '报价号', value: ''},
                    {name: '客户手机号', value: ''},
                    {name: '客户名', value: ''},
                    {name: '空间名', value: ''}
                ];
                return response;
            };
        };

        return ['http', 'utils', '$location', OfferService];

    });

})(define);
