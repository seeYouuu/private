/**
 *  Defines the TransactionController controller
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the TransactionController class with RequireJS
     */
    define(['lodash', 'angular'], function(_, angular) {

        /**
         * @constructor
         */
        var CompanyController = function($rootScope, $scope, CompanyService, events, $filter, $timeout, CONF, $location, $cookies, $translate, CurrentAdminService, ImageUploaderService, SbCropImgService, utils, ExcelUploaderService) {

            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: CompanyService.getSearchParam('pageIndex') ? parseInt(CompanyService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.industryList = CompanyService.getIndustryList();
            $scope.companyDetails = {};
            $scope.filterOption = {};
            $scope.changeDetails = true;
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.PERMISSION_KEY = 'sales.platform.account';

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var init = function(){
                getTableHeaders();
                cusBConWidth();
                getTableItems();
                getCompanyLists();
            };

            var cusBConWidth = function(){
                var cusWidth = 0;
                for(var i = 0; i < $('.cus-nav > div').length; i++){
                    cusWidth += $($('.cus-nav > div')[i]).innerWidth();
                }
                $('.cus-b-con').width(cusWidth+20);
                if($('.cus-nav > div').length < 8){
                    $('.cus-b-con').innerWidth(1060);
                }
            };

             var initCompanyMessage = function(){
                $scope.companyMessage.industry = $scope.filterOption.type.name;
            };

            var getCompanyLists = function(){
                var params = {};
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                CompanyService.getCompanyLists(params).success(function(data){
                    $scope.companyLists = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    _.each($scope.companyLists, function(item){
                        item.customization = _.pick(item, 'name', 'register_address', 'business_license_number', 'organization_certificate_code', 'tax_registration_number', 'taxpayer_identification_number', 'bank_name', 'bank_account_number', 'website', 'phone', 'industry', 'mailing_address', 'contacts', 'comment');
                    });
                });
            };

            var getTableHeaders = function(){
                var params = {object: 'enterprise'};
                CompanyService.getTableHeader(params).success(function(data){
                    $scope.tableHeaders = data;
                    $timeout(function() {
                        cusBConWidth();
                    }, 200);
                });
            };

             var getTableItems = function(){
                var params = {object: 'enterprise'};
                CompanyService.getTableItems(params).success(function(data){
                    $scope.dragModels.tableItems = data;
                    $scope.copyTableItem = angular.copy(data);
                });
            };

            $scope.checkItem = function(item){
                !item.required ? item.checked = !item.checked : '';
            };

            $scope.resetSelect = function(){
                 $scope.dragModels.tableItems = angular.copy($scope.copyTableItem);
            };

            $scope.updateTableColumn = function($hide){
                $hide();
                var params = {
                    object: 'enterprise',
                    list_ids: []
                };
                var tempArr = _.filter($scope.dragModels.tableItems, function(item){
                    return item.required || item.checked; 
                }) ;
                params.list_ids = _.pluck(tempArr, 'id');
                CompanyService.updateTableColumn(params).success(function(){
                    getTableHeaders();
                    noty('info', '设置表格成功！');
                });
            };

            $scope.creatCompany = function(){
                $scope.companyMessage = {};
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'creatCompanyTpl'
                });
            };

            $scope.creatCompanyMessage = function($hide){
                initCompanyMessage();
                if($scope.companyMessage.name){
                    CompanyService.companyMessage($scope.companyMessage).success(function(){
                        $hide();
                        noty('info', '客户创建成功！');
                        getCompanyLists();
                    });
                }else{
                    return false;
                }
            };

            $scope.editCompany = function(item){
                $scope.changeDetails = true;
                $scope.companyDetails = item;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'editCompanyTpl'
                });
            };

            $scope.changeCompanyDetails = function(value, $hide, id){
                $scope.changeDetails = value;
                if(!value){
                    _.each($scope.industryList, function(item){
                        item.name === $scope.companyDetails.industry ?  $scope.filterOption.type = item : '';
                    });
                }
                if(value){
                    delete $scope.companyDetails["customization"];
                    delete $scope.companyDetails["company_id"];
                    delete $scope.companyDetails["id"];
                    delete $scope.companyDetails["creation_date"];
                    delete $scope.companyDetails["modification_date"];
                    $scope.companyDetails.industry ? $scope.companyDetails.industry = $scope.filterOption.type.name : '';
                    CompanyService.changeCompanyMessage(id, $scope.companyDetails).success(function(){
                        $hide();
                        noty('info', '客户修改成功！');
                        getCompanyLists();
                    });
                }
            };

            $scope.linkman = function(item){
                $scope.changeDetails = true;
                $scope.companyDetails = item;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'linkmanTpl'
                });
            };

            $scope.goPage = function(index){
                CompanyService.updateSearchParam('pageIndex', index);
            };

            init();

        }
        return ['$rootScope', '$scope', 'CompanyService', 'events', '$filter', '$timeout', 'CONF', '$location', '$cookies', '$translate', 'CurrentAdminService', 'ImageUploaderService', 'SbCropImgService', 'utils', 'ExcelUploaderService', CompanyController];

    });

})(define);
