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

        var CompanyService = function(http, utils, $location) {


            this.getCompanyLists = function(params){
                return http.get(utils.getapi('/sales/admin/enterprise_customers'), {params: params});
            };

            this.companyMessage = function(params){
                return http.post(utils.getapi('/sales/admin/enterprise_customers'), params);
            };

            this.changeCompanyMessage = function(id, params){
                return http.put(utils.getapi('/sales/admin/enterprise_customers/') + id, params);
            };

            this.getTableHeader = function(params){
                return http.get(utils.getapi('/sales/admin/generic/lists/user'), {params: params});
            };

            this.getTableItems = function(params){
                return http.get(utils.getapi('/sales/admin/generic/lists'), {params: params});
            };
            
            this.updateTableColumn = function(params){
                return http.post(utils.getapi('/sales/admin/generic/lists'), params);
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

            this.getIndustryList = function(){
                return[
                    {name: "医药机构"},
                    {name: "互联网"},
                    {name: "电子计算机"}
                ]
            };

        };

        return ['http', 'utils', '$location', CompanyService];

    });

})(define);
