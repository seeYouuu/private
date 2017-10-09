/**
 *  Defines the PriceService
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the PriceService class with RequireJS
     */
    define(['lodash'], function(_, undefined) {

        /**
         * @constructor
         */
        var PriceService = function($http, $q, $filter, http, utils, $location) {
          
            this.getSearchParam = function(key) {
                return $location.search()[key] ? $location.search()[key] : '';
            };

            this.updateSearchParam = function(key, value) {
                $location.search(key, value ? value : undefined);
            };

            this.createPriceRule = function(params) {
                return http.post(utils.getapi('/sales/admin/price/rules', 'ext_api'), params);
            };

            this.updatePriceRule = function(rule_id, params) {
                return http.put(utils.getapi('/sales/admin/price/rules/' + rule_id, 'ext_api'), params);
            };

            this.getPriceRules = function(params) {
                return $http.get(utils.getapi('/sales/admin/price/rules', 'ext_api'), {params: params});
            };

            this.getRoomTypes = function() {
                return $http.get('/mock/roomTypes.json');
            };

            this.getCities = function(params){
                return http.get(utils.getapi('/location/cities'), {params: params});
            };
            
            this.getBuildings = function(params){
                return http.get(utils.getapi('/location/buildings'), {params: params});
            };

            this.getRooms = function(params) {
                return http.get(utils.getapi('/sales/admin/rooms/producted'), {params: params});
            };

            this.getProductList = function() {
                return http.get(utils.getapi('/sales/admin/price/rule/products', 'ext_api'));
            };

            this.getPriceRule = function(rule_id){
                  return $http.get(utils.getapi('/sales/admin/price/rules/' + rule_id, 'ext_api'));
            };

            this.deletePriceRule = function(rule_id) {
                return $http.delete(utils.getapi('/sales/admin/price/rules/' + rule_id, 'ext_api'));
            };

            this.togglePriceRule = function(rule_id, status) {
                var command = status === 0 ? '/enable' : '/disable'
                return $http.put(utils.getapi('/sales/admin/price/rules/' + rule_id + command, 'ext_api'));
            };

            this.setDiscountData = function(arrayOrMatrix, value) {
                if (_.isArray(arrayOrMatrix[0])) {
                    this.setMatrixValue(arrayOrMatrix, value);   
                } else {
                    this.setArrayValue(arrayOrMatrix, value);  
                }
            };

            this.setMatrixValue = function(matrix, value) {
                for (var i = 0; i < matrix.length; i++) {
                    for (var j = 0; j < matrix[i].length; j++) {
                        if (matrix[i][j] === -1) matrix[i][j] = parseInt(value);   
                    }
                }
            };

            this.setArrayValue = function(ary, value) {
                for (var i = 0; i < ary.length; i++) {
                    if (ary[i] === -1) ary[i] = parseInt(value);   
                }
            };

            this.getCorners = function(matrix) {
                var upper = _.findIndex(matrix, function(row) {
                    return _.includes(row, -1);
                });
                var lower = _.findLastIndex(matrix, function(row) {
                    return _.includes(row, -1);
                });
                var left = _.findIndex(matrix[upper], function(col) {
                    return col === -1;
                });
                var right = _.findLastIndex(matrix[upper], function(col) {
                    return col === -1;
                });
                return [[left, upper], [right, lower]];
            };
        };

        return ['$http', '$q', '$filter', 'http', 'utils', '$location', PriceService];

    });

})(define);
