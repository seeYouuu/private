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
        var CustomerController = function($rootScope, $scope, CustomerService, events, $filter, $timeout, CONF, $location, $cookies, $translate, CurrentAdminService, ImageUploaderService, SbCropImgService, utils, ExcelUploaderService) {

            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: CustomerService.getSearchParam('pageIndex') ? parseInt(CustomerService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.placeholder = {
                all: '全部',
                tenantry: '用户昵称',
                community: '所有社区（显示该销售方下的所有社区）',
                commense: '起租日',
                leads: '线索号',
                code: '+86',
                idtype: '证件类型',
                keywords: '关键字'
            };
            $scope.item={
                selected: 'true'
            };
            $scope.obj = {
                coords: [0, 0, 100, 100, 100, 100],
                thumbnail: false
            };
            $scope.cropOptions = {
                target: 'message',
                previewFlag: true
            };
            $scope.showFilter = false;
            $scope.changeTel = true;
            $scope.changeDetails = true;
            $scope.idType = CustomerService.getIdType();
            $scope.filterOption = {
                lessee_type: '男'
            };
            $scope.importCustomers = '';
            $scope.repeatLength = 0;
            $scope.importCustomerlist = false;
            $scope.importConfirm = {
                action: "bypass"
            }
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };
            $scope.images = {};
            $scope.telWrong = false;
            $scope.telRepeat = false;
            $scope.telright = false;
            $scope.telNew = false;
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.PERMISSION_KEY = 'sales.platform.customer';

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var initcusMessage = function(){
                $scope.cusMessage.birthday ? $scope.cusMessage.birthday = formatDate($scope.cusMessage.birthday, 'yyyy-MM-dd') : '';
                $scope.cusMessage.id_type ?$scope.cusMessage.id_type = $scope.filterOption.type.name : '';
                $scope.cusMessage.avatar = $scope.images.download_link;
                $scope.cusMessage.sex = $scope.filterOption.lessee_type;
            };

            var getAreaCode = function() {
                CustomerService.getAreacode().success(function(data) {
                    var temp = _.uniq(_.map(data, 'code'));
                    $scope.codeList = _.map(temp, function(item) {
                        return { name: item };
                    });
                    $scope.codeList.sort(function(a, b) {
                        return Number(a.name) - Number(b.name);
                    });
                });
            };

            var init = function(){
                getTableHeaders();
                cusBConWidth();
                getTableItems();
                getAreaCode();
                getCustomerLists();
            };

            var getCustomerLists = function(){
                var params = {};
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                CustomerService.getCustomerLists(params).success(function(data){
                    $scope.customerLists = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    _.each($scope.customerLists, function(item){
                        item.customization = _.pick(item, 'avatar', 'name', 'phone', 'sex', 'email', 'groups', 'nationality', 'id_type', 'language', 'birthday', 'company_name', 'position', 'comment');
                        var temp = _.groupBy(item.groups, 'type');
                        item.customization.groups_desc = _.union(temp['created']);
                    });
                });
            };

            var getCustomerDetail = function(id){
                CustomerService.getCustomerDetail(id).success(function(data){
                    $scope.cusDetails = data;
                    $scope.cusDetails.birthday ? $scope.cusDetails.birthday = formatDate($scope.cusDetails.birthday, 'yyyy-MM-dd') : '';
                    $scope.cusDetails.sex = $scope.filterOption.lessee_type;
                });
            };

            var getTableItems = function(){
                var params = {object: 'customer'};
                CustomerService.getTableItems(params).success(function(data){
                    $scope.dragModels.tableItems = data;
                    $scope.copyTableItem = angular.copy(data);
                });
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

            var getTableHeaders = function(){
                var params = {object: 'customer'};
                CustomerService.getTableHeader(params).success(function(data){
                    $scope.tableHeaders = data;
                    $timeout(function() {
                        cusBConWidth();
                    }, 200);
                });
            };
            



            $scope.customerImageUploader = ImageUploaderService.createUncompressedImageUploader(
                'customer',
                function(item, response){
                    $scope.images = response;
                }
            );

            $scope.excelFileUploader = ExcelUploaderService.createUncompressedExcelUploader(
                '',
                function(item, response){
                    $scope.importConfirm.serial_number =response.import_serial_number.toString();
                    CustomerService.importCustomers(response.import_serial_number).success(function(data){
                        $scope.importCustomerlist = true;
                        $scope.importCustomers = data;
                        _.each(data, function(value,key){
                            if(value.status==='repeat'){
                                $scope.repeatLength++;
                            }
                        });
                    })
                },
                function(item, response){
                    response.code == '400001' ? noty('error', '上传文件格式错误！') : '';
                }
            );

            $scope.switchLeaseeType = function(type){
                $scope.filterOption.lessee_type = type;
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
                    object: 'customer',
                    list_ids: []
                };
                var tempArr = _.filter($scope.dragModels.tableItems, function(item){
                    return item.required || item.checked; 
                }) ;
                params.list_ids = _.pluck(tempArr, 'id');
                CustomerService.updateTableColumn(params).success(function(){
                    getTableHeaders();
                    noty('info', '设置表格成功！');
                });
            };

            $scope.importCustomerConfirm = function($hide){
                CustomerService.importCustomerConfirm($scope.importConfirm).success(function(){
                    $hide();
                    noty('info', '批量导入客户成功！');
                    getCustomerLists();
                })
            };

            $scope.creatCus = function(flag, $hide){
                $scope.telWrong = false;
                $scope.telRepeat = false;
                $scope.telright = false;
                $scope.telNew = false;
                $scope.cusMessage={
                    phone_code: '+86',
                    sex: '男',
                    avatar: $scope.images.download_link
                };
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'creatCusTpl'
                });
            };

            $scope.creatcusMessage = function($hide){
                if($scope.cusMessage.name && $scope.cusMessage.phone && $scope.cusMessage.phone_code){
                    initcusMessage();
                    CustomerService.cusMessage($scope.cusMessage).success(function(){
                        $hide();
                        noty('info', '客户创建成功！');
                        getCustomerLists();
                    });
                }else{
                    return false;
                }
            };

            $scope.cusDetail = function(id){
                $scope.changeDetails = true;
                getCustomerDetail(id);
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'cusDetailTpl'
                });
            };

            $scope.showImportCustomers = function(){
                $scope.importCustomerlist = false;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'importCustomersTpl'
                });
            };

            $scope.importDownload = function(){
                window.location.href = CONF.bizbase + '/template.xlsx';
            };

            $scope.showCropView = function(url){
                $scope.selectedCropImgUrl = url;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'cusPictureTpl'
                });
            };

            $scope.goPage = function(index){
                CustomerService.updateSearchParam('pageIndex', index);
            };

            $scope.changeCustomerTel = function(id, $hide, phone_code, phone){
                var params = {};
                if(!phone_code){
                    params = {
                        phone_code: $scope.cusDetails.phone_code,
                        phone: phone
                    }
                }else{
                    params = {
                        phone_code: phone_code,
                        phone: phone
                    }
                }
                CustomerService.changeCustomerTel(id, params).success(function(){
                    $hide();
                    noty('info', '手机更改成功！');
                    getCustomerLists();
                });
            };

            $scope.changeCusTel = function(value, $hide, id, phone_code, phone){
                $scope.changeTel = value;
                if(value){
                    $scope.changeCustomerTel(id, $hide, phone_code, phone);
                }
            };

            $scope.changeCustomerMessage = function($hide, id){
                $scope.cusDetails.birthday ? $scope.cusDetails.birthday = formatDate($scope.cusDetails.birthday, 'yyyy-MM-dd') : '';
                $scope.cusDetails.sex = $scope.filterOption.lessee_type;
                $scope.cusDetails.id_type = $scope.filterOption.type.name;
                $scope.images.download_link ? $scope.cusDetails.avatar = $scope.images.download_link : $scope.cusDetails.avatar = $scope.cusDetails.avatar;
                var filter = [];
                _.each($scope.cusDetails,function(value, key){
                    if((key!=='phone_code') && (key!=='phone')){
                        filter[filter.length]={
                            "op": "add",
                            "path": "/"+key,
                            "value": value
                        }
                    }
                });
                CustomerService.changeCustomerMessage(id, filter).success(function(){
                    $hide();
                    noty('info', '信息修改成功！');
                    getCustomerLists();
                });
            };

            $scope.changeCusDetails = function(value, $hide, id){
                if(!value){
                    _.each($scope.idType, function(item){
                        item.name === $scope.cusDetails.id_type ?  $scope.filterOption.type = item : '';
                    });
                }
                $scope.changeDetails = value;
                if(value){
                    $scope.changeCustomerMessage($hide, id);
                }
            };

            $scope.searchCusTel = _.debounce(function(){
                $scope.telWrong = false;
                $scope.telRepeat = false;
                $scope.telright = false;
                $scope.telNew = false;
                if($scope.cusMessage.phone_code === "+86"){
                    if($scope.cusMessage.phone && !utils.isPhone($scope.cusMessage.phone)){
                        $scope.telWrong = true;
                    }else{
                        var params = {
                                query: $scope.cusMessage.phone
                            };
                        CustomerService.searchUser(params).success(function(data){
                            if(data[0]){
                                $scope.telright = true;
                                $scope.searchOutUser = data[0];
                                $scope.cusMessage.name = $scope.searchOutUser.name;
                                _.each(data, function(item){
                                    item.avatar = CONF.file + '/person/' + item.id + '/avatar_small.jpg';
                                    $scope.cusMessage.avatar = item.avatar;
                                });
                                CustomerService.getCustomerLists();
                            }else{
                                CustomerService.getCustomerLists(params).success(function(data){
                                    if(data[0]){
                                        $scope.telRepeat = true;
                                    }else{
                                        $scope.telNew = true;
                                    }
                                });
                                
                            }
                        });
                    }
                }
            }, 10);

            $scope.$watch('filterOption.type', function(newValue, oldValue) {
                if(newValue !== oldValue){
                    if($rootScope.selectDropdown){
                        if($scope.cusMessage){
                            $scope.cusMessage.id_number= '';
                        }else if($scope.cusDetails){
                            $scope.cusDetails.id_number = '';
                        }
                    }
                }
            }, true);

            init();
        }
        return ['$rootScope', '$scope', 'CustomerService', 'events', '$filter', '$timeout', 'CONF', '$location', '$cookies', '$translate', 'CurrentAdminService', 'ImageUploaderService', 'SbCropImgService', 'utils', 'ExcelUploaderService', CustomerController];

    });

})(define);
