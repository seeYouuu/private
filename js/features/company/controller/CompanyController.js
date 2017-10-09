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
            $scope.idtypeList = CompanyService.getIdcardList();
            $scope.companyDetails = {};
            $scope.filterOption = {};
            $scope.changeDetails = true;
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };
            $scope.placeholder = {
                idcard: '选择职位'
            };
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.PERMISSION_KEY = 'sales.platform.enterprise_customer';
            $scope.customerList=[];
            $scope.companyMessage = {
                contacts:[]
            }
            $scope.company = {
                remarks: ''
            };
            $scope.linkman_list = [];
            $scope.del_linkman = false;
            $scope.loaded = false;


            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var resetParams = function(){
                $scope.companyOption = {
                    status: 'company'
                };
                $scope.search = {
                    customer: ''
                };
                $scope.selectedSearchData = {
                    customer: ''
                };
                $scope.searchReponse = {
                    customer: '',
                };
            };

            var init = function(){
                $rootScope.crumbs = {first: '企业账户'};
                getTableHeaders();
                getTableItems();
                getCompanyLists();
                resetParams();
            };

            var cusBConWidth = function(length){
                $('.cus-b-con').width(length * 160 + 20 + 14);
            };

            var getCompanyLists = function(){
                var params = {};
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                $scope.loaded = false;
                CompanyService.getCompanyLists(params).success(function(data){
                    $scope.companyLists = data;
                    $scope.pageOptions.totalNum = data.total_count;
                    _.each($scope.companyLists, function(item){
                        item.customization = _.pick(item, 'name', 'register_address', 'business_license_number', 'organization_certificate_code', 'tax_registration_number', 'taxpayer_identification_number', 'bank_name', 'bank_account_number', 'website', 'phone', 'industry', 'mailing_address', 'contacts', 'comment');
                    });
                    $scope.loaded = true;
                });
            };

            var getTableHeaders = function(){
                var params = {object: 'enterprise'};
                CompanyService.getTableHeader(params).success(function(data){
                    $scope.tableHeaders = data;
                    cusBConWidth($scope.tableHeaders.length);
                });
            };

             var getTableItems = function(){
                var params = {object: 'enterprise'};
                CompanyService.getTableItems(params).success(function(data){
                    $scope.dragModels.tableItems = data;
                    $scope.copyTableItem = angular.copy(data);
                });
            };

            var getRemarks = function(id){
                var params = {
                    object: 'enterprise',
                    object_id: id
                };
                CompanyService.getCompanyRemarks(params).success(function(data){
                    $scope.companyRemarks = data;
                });
            };

            var addRemarkForCompany = function(){
                var params = {
                    'object': 'enterprise',
                    'object_id': $scope.companyDetails.id,
                    'remarks': $scope.company.remark
                };
                CompanyService.addRemarks(params).success(function(){
                    noty('info', '增加备注成功！');
                    getRemarks($scope.companyDetails.id);
                });
            };

            var getCompanyLinkmanList = function(item){
                $scope.linkman_list = [];
                _.each(item.contacts, function(item){
                    CompanyService.getCustomerDetail(item.customer_id).success(function(data){
                        $scope.linkman_list.push({
                            'contact_position': item.contact_position,
                            'name': data.name,
                            'phone': data.phone,
                            'sex': data.sex,
                            'avatar': data.avatar,
                            'user_id': data.user_id
                        })
                    });
                })
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

            $scope.showRemark = function(){
                $scope.remarkFlag = true;
            };

            $scope.toggleRemark = function(){
                $scope.remarkListFlag = !$scope.remarkListFlag;
            };

            $scope.addRemark = function(){
                $scope.remarkFlag = false;
                if($scope.company.remark){
                    addRemarkForCompany();
                }
            };

            $scope.delLinkman = function(item){
                for(var i = 0; i<$scope.customerList.length; i++){
                    if(item == $scope.customerList[i]){
                        $scope.customerList.splice(i,1);
                    }
                }
            }

            $scope.creatCompany = _.debounce(function(){
                resetParams();
                $scope.companyMessage = {
                    contacts:[]
                }
                $scope.customerList = [];
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'creatCompanyTpl'
                });
            },300);

            $scope.creatCompanyMessage = function($hide){
                var filter = [];
                _.each($scope.customerList,function(item){
                    filter[filter.length]={
                        'customer_id': item.customer.id,
                        'contact_position': item.id_type ? item.id_type.name : ''
                    }
                });
                $scope.companyMessage.contacts = filter;
                $scope.filterOption.type ? $scope.companyMessage.industry = $scope.filterOption.type.name : '';
                if($scope.companyMessage.name){
                    CompanyService.companyMessage($scope.companyMessage).success(function(){
                        $hide();
                        noty('info', '客户创建成功！');
                        getCompanyLists();
                    });
                }else{
                    noty('error', '请输入用户名！');
                }
                $scope.companyMessage = {
                    contacts:[]
                }
                $scope.customerList = [];
            };

            $scope.searchCustomer = function(){
                var params = {};
                if($scope.search.customer){
                    params.query = $scope.search.customer.key;
                    CompanyService.getCustomerLists(params).success(function(data){
                        $scope.searchReponse.customer = data;
                    });
                }
            };

            $scope.editCompany = _.debounce(function(item){
                $scope.changeDetails = true;
                $scope.remarkFlag = false;
                $scope.companyDetails = item;
                getRemarks(item.id);
                $scope.customerList = [];
                _.each(item.contacts, function(value){
                    CompanyService.getCustomerDetail(value.customer_id).success(function(data){
                        $scope.customerList.push({
                            contact_position:value.contact_position,
                            id_type: '',
                            customer: {
                                'name': data.name,
                                'phone':data.phone,
                                'id': data.id,
                                'avatar': data.avatar
                            }
                        });
                    });
                })
                $scope.companyOption = _.pick(item, 'name', 'register_address', 'business_license_number', 'organization_certificate_code', 'tax_registration_number', 'taxpayer_identification_number', 'bank_name', 'bank_account_number', 'website', 'phone', 'industry', 'mailing_address', 'contacts', 'comment');
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'editCompanyTpl'
                });
                getCompanyLinkmanList(item);
            },300);

            $scope.changeCompanyDetails = function(value, $hide, id){
                $scope.changeDetails = value;
                $scope.filterOption.type ? $scope.companyDetails.industry = $scope.filterOption.type.name : '';
                var filter = [];
                _.each($scope.customerList,function(item){
                    filter[filter.length]={
                        'customer_id': item.customer.id,
                        'contact_position': item.id_type ? item.id_type.name : item.contact_position
                    }
                });
                $scope.companyDetails.contacts = filter;
                if(!value){
                    _.each($scope.industryList, function(item){
                        item.name === $scope.companyDetails.industry ?  $scope.filterOption.type = item : '';
                    });
                }
                if(value){
                    delete $scope.companyDetails.customization;
                    delete $scope.companyDetails.company_id;
                    delete $scope.companyDetails.creation_date;
                    delete $scope.companyDetails.modification_date;
                    delete $scope.companyDetails.id;
                    CompanyService.changeCompanyMessage(id, $scope.companyDetails).success(function(){
                        $hide();
                        noty('info', '客户修改成功！');
                        getCompanyLists();
                    }).error(function(){
                        $hide();
                        getCompanyLists();
                    });
                }
            };

            $scope.linkman = _.debounce(function(item){
                getCompanyLinkmanList(item);
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'linkmanTpl'
                });
            },300);

            $scope.$watch('selectedSearchData.customer',function(newValue,oldValue){
                if(newValue === oldValue){
                    return;
                }else if(newValue.id){
                    $scope.customerList.push({
                        id_type: '', 
                        customer: newValue
                    });
                }
            },true)

            init();

        }
        return ['$rootScope', '$scope', 'CompanyService', 'events', '$filter', '$timeout', 'CONF', '$location', '$cookies', '$translate', 'CurrentAdminService', 'ImageUploaderService', 'SbCropImgService', 'utils', 'ExcelUploaderService', CompanyController];

    });

})(define);
