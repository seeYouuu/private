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
        var CustomerController = function($rootScope, $scope, CustomerService, events, $filter, $timeout, CONF, $location,  CurrentAdminService, ImageUploaderService, SbCropImgService, utils, ExcelUploaderService, $modal) {

            $scope.pageType = CustomerService.getSearchParam('pageType') ? CustomerService.getSearchParam('pageType') : 'list';
            $scope.tabType = CustomerService.getSearchParam('tabtype') ? CustomerService.getSearchParam('tabtype') : 'userInfo';
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: CustomerService.getSearchParam('pageIndex') ? parseInt(CustomerService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.placeholder = {
                all: '全部',
                code: '+86',
                idtype: '证件类型',
                keywords: '关键字'
            };
            $scope.item={
                selected: 'true'
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
                action: 'bypass'
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
            $scope.tel_change = false;
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.PERMISSION_KEY = 'sales.platform.customer';
            $scope.keywordList = CustomerService.getKeywordList();
            $scope.tags = [];
            $scope.batchJoin = false;
            $scope.batchJoinOld = true;
            $scope.editOption = {};
            $scope.modalInstance = '';
            $scope.loaded = false;
            $scope.filterDes = {
                group_id: '客户组',
                query: '关键字'
            };
            

            var searchParams = _.keys($location.search());
            if(searchParams.length === 1 && _.contains(searchParams, 'query')){
                $scope.showFilter = false;
            }else if(searchParams.length === 2 && _.contains(searchParams, 'query') && _.contains(searchParams, 'keyword')){
                $scope.showFilter = false;
            }else if(searchParams.length === 0){
                $scope.showFilter = false;
            }else{
                $scope.showFilter = true;
            };

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

            var getFilterParams = function(){
                CustomerService.getSearchParam('query') ? $scope.filterOption.query = CustomerService.getSearchParam('query') : '';
                CustomerService.getSearchParam('group_id') ? $scope.filterOption.groupObj = _.find($scope.filterGroups, function(item){return item.id == CustomerService.getSearchParam('group_id')}): '';
                CustomerService.getSearchParam('group_id') ? $scope.filterOption.group_id = CustomerService.getSearchParam('group_id'): '';
                CustomerService.getSearchParam('keyword') ? $scope.filterOption.keywordObj = _.find($scope.keywordList, function(item){return item.value == CustomerService.getSearchParam('keyword')}): '';

            };

            var formateTags = function(){
                var cache = {};
                for(var key in $scope.filterOption){
                    cache = {};
                    if(typeof $scope.filterOption[key] !== 'object' && !(key === 'keyword' || key === 'groupObj' || key === 'lessee_type')){
                        cache = {
                            name: key,
                            des: $scope.filterDes[key],
                            value: $scope.filterOption[key]
                        };
                        $scope.tags.push(cache);
                    }
                }
            };

            events.on('customerDeleteTag', function(item){
                $scope.filterOption[item.name] = '';
                if(item.name === 'group_id'){
                    $scope.filterOption['groupObj'] = '';
                }
                $scope.searchList();
            });

            var initFilterParams = function(){
                $scope.filterOption.query ? $scope.filterOption.query = $scope.filterOption.query : '';
                $scope.filterOption.groupObj ? $scope.filterOption.group_id = $scope.filterOption.groupObj.id : '';
                $scope.filterOption.keywordObj && $scope.filterOption.query ? $scope.filterOption.keyword = $scope.filterOption.keywordObj.value : '';

                var cache = _.pick($scope.filterOption, 'keyword','query', 'group_id');
                return cache;
            };

            var pickValue = function (cache){
                var res = {};
                for(var key in cache){
                    if(cache[key]){
                        res[key] = cache[key];
                    }
                }
                return res;
            };

            $scope.resetSearch = function(){
                $scope.filterOption = {
                    query: '',
                    groupObj: ''
                };
                getFilterParams();
            };

            $scope.searchList = function(){
                var params = initFilterParams();
                for(var key in params){
                    CustomerService.updateSearchParam(key, params[key]);
                }
                // $scope.filterOption.keyword ? '' : CustomerService.updateSearchParam('keyword', '');
                CustomerService.updateSearchParam('pageIndex', '');
            };

            $scope.clearSearchFilters = function(){
                $scope.filterOption = {};
                _.each($location.search(), function(value, key){
                    CustomerService.updateSearchParam(key, '');
                });
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
                $rootScope.crumbs = {first: '客户'};
                getTableHeaders();
                getTableItems();
                getAreaCode();
                getGroups();
                getCustomerLists();
            };

            var getCustomerLists = function(){
                getFilterParams();
                var params = initFilterParams();
                params = _.pick(params,'query', 'group_id');
                formateTags();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                params = pickValue(params);
                $scope.loaded = false;
                CustomerService.getCustomerLists(params).success(function(data){
                    $scope.customerLists = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    _.each($scope.customerLists, function(item){
                        item.customization = _.pick(item, 'avatar', 'name', 'phone', 'sex', 'email', 'groups', 'nationality', 'id_number', 'language', 'birthday', 'company_name', 'position', 'comment', 'user_id');
                        var temp = _.groupBy(item.groups, 'type');
                        item.customization.groups_desc = _.union(temp['card'], temp['add'], temp['created']);
                    });
                    $scope.loaded = true;
                });
            };

            var getCustomerDetail = function(id){
                CustomerService.getCustomerDetail(id).success(function(data){
                    $scope.cusDetails = data;
                    $scope.cusDetails.birthday ? $scope.cusDetails.birthday = formatDate($scope.cusDetails.birthday, 'yyyy-MM-dd') : '';
                    $scope.filterOption.lessee_type = $scope.cusDetails.sex;
                });
            };

            var getGroups = function() {
                CustomerService.getGroups().success(function(data) {
                    $scope.filterGroups = data;
                    CustomerService.getSearchParam('group_id') ? $scope.filterOption.groupObj = _.find($scope.filterGroups, function(item){return item.id == CustomerService.getSearchParam('group_id')}): '';
                    $scope.createdGroups = _.filter(data, function(item) {return item.type == 'created'});
                });
            };

            var getTableItems = function(){
                var params = {object: 'customer'};
                CustomerService.getTableItems(params).success(function(data){
                    $scope.dragModels.tableItems = data;
                    $scope.copyTableItem = angular.copy(data);
                });
            };

            var cusBConWidth = function(length){
                $('.cus-b-con').width(length * 160 + 20 + 14);
            };

            var getTableHeaders = function(){
                var params = {object: 'customer'};
                CustomerService.getTableHeader(params).success(function(data){
                    $scope.tableHeaders = data;
                    cusBConWidth($scope.tableHeaders.length);
                });
            };

            var initAddUserToGroup = function() {
                var filter = [];
                filter.push($scope.cusDetails.id);
                var params = {};
                params.customer_ids = filter;
                var origin_ids = _.pluck(_.filter($scope.cusDetails.groups, function(item){return item.type == 'add'||'created'}), 'id');
                var ids = _.pluck(_.filter($scope.createdGroups, function(item) {return item.selected;}), 'id');
                params.add = _.difference(ids, origin_ids);
                params.remove = _.difference(origin_ids, ids);

                return params;
            };

            var createGroup = function($hide) {
                CustomerService.createGroup({name: $scope.editOption.g_name}).success(function(item) {
                    _.each($scope.customerLists, function(data){
                        var filter = [];
                        var params = {};
                        if(data.checked){
                            filter.push(data.id);
                            params.customer_ids = filter;
                            params.add = [item.id];
                            params.remove = []
                            CustomerService.addUserToGroup(params).success(function() {
                                $scope.batchJoin = false;
                                $hide();
                                noty('info', '添加到新创建客户组成功！');
                                getCustomerLists();
                                getGroups();
                            });
                        }
                    });
                });
                
            };
            




            $scope.addUserToGroup = function($hide) {
                var params = initAddUserToGroup();
                CustomerService.addUserToGroup(params).success(function() {
                    $hide();
                    noty('info', '编辑成功！');
                    getCustomerLists();
                });
            };

            $scope.addCreateGroup = function($hide){
                if($scope.editOption.g_name){
                    createGroup($hide);
                }else{
                    _.each($scope.customerLists, function(data){
                        var filter = [];
                        var params = {};
                        if(data.checked){
                            filter.push(data.id);
                            params.customer_ids = filter;
                            var origin_ids = _.pluck(_.filter(data.groups, function(item){return item.type == 'add'}), 'id');
                            var ids = _.pluck(_.filter($scope.createdGroups, function(item) {return item.selected;}), 'id');
                            params.add = _.difference(ids, origin_ids);
                            params.remove = _.difference(origin_ids, ids);
                            CustomerService.addUserToGroup(params).success(function() {
                                $scope.batchJoin = false;
                                $hide();
                                getCustomerLists();
                            });
                        }
                    });
                }
            }

            $scope.selectItem = function(item){
                item.checked = !item.checked;
                $scope.batchToGroup = [];
                _.each($scope.customerLists,function(data){
                    if(data.checked === true){
                        $scope.batchToGroup.push(item);
                    }
                });
                if($scope.batchToGroup.length>=2){
                    $scope.batchJoin = true;
                }else{
                    $scope.batchJoin = false;
                }
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
                        $scope.repeatLength = 0;
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
                    response.code == '400003' ? noty('error', '文件内容格式与模板格式不符，请修改后重新上传') : '';
                    response.code == '400002' ? noty('error', '上传的文件内手机号重复，请修改后重新上传') : '';
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

            $scope.creatCus = function(){
                $scope.telWrong = false;
                $scope.telRepeat = false;
                $scope.telright = false;
                $scope.telNew = false;
                $scope.cusMessage={
                    phone_code: '+86',
                    sex: '男',
                    avatar: $scope.images.download_link
                };
                $scope.filterOption = {
                    lessee_type: '男',
                    type: ''
                };
                $scope.images.download_link = '';
                if($scope.modalInstance && !$scope.modalInstance.$isShown){
                    $scope.modalInstance.show();
                }else if(!$scope.modalInstance){
                    $scope.modalInstance = $modal({
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade-and-slide-top',
                        template: 'creatCusTpl'
                    });
                }
            };

            $scope.changeGroups = _.debounce(function(item){
                 _.each($scope.createdGroups,function(data){
                    data.selected = false;
                    _.each(item.groups,function(group){
                        if(group.id == data.id){
                            data.selected = true;
                        }
                    });
                });
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'changeGroupsTpl'
                });
            },300);

            $scope.batchJoinGroup = _.debounce(function(){
                $scope.editOption = {};
                _.each($scope.createdGroups,function(item){
                    item.selected = false;
                })
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'batchJoinGroupTpl'
                });
            },300);


            $scope.creatcusMessage = function($hide){
                if($scope.cusMessage.name && $scope.cusMessage.phone && $scope.cusMessage.phone_code && !$scope.telWrong){
                    initcusMessage();
                    CustomerService.cusMessage($scope.cusMessage).success(function(){
                        $hide();
                        noty('info', '客户创建成功！');
                        getCustomerLists();
                    });
                }else{
                    if(!$scope.cusMessage.name){
                         noty('error', '请输入客户名！');
                    }else if(!$scope.cusMessage.phone){
                        noty('error', '请输入手机号！');
                    }else if($scope.telWrong){
                        noty('error', '手机号格式不对!');
                    }
                }
            };

            $scope.cusDetail = _.debounce(function(id){
                $scope.changeDetails = true;
                $scope.changeTel = true;
                $scope.images.download_link = '';
                getCustomerDetail(id);
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'cusDetailTpl'
                });
            },300);

            $scope.showImportCustomers = _.debounce(function(){
                $scope.importCustomerlist = false;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'importCustomersTpl'
                });
            },300);

            $scope.importDownload = function(){
                window.location.href = CONF.bizbase + '/template.xlsx';
            };

            $scope.goPage = function(index){
                CustomerService.updateSearchParam('pageIndex', index);
            };

            $scope.changeCustomerTel = function(id, phone_code, phone){
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
                if(params.phone_code === "+86" && params.phone && !utils.isPhone(params.phone)){
                    noty('error', '手机号格式不对,请重新输入！');
                    return false;
                }
                CustomerService.changeCustomerTel(id, params).success(function(){
                    noty('info', '手机号更改成功！');
                    getCustomerLists();
                }).error(function(data){
                    if(data.code === 400001){
                        noty('error', '该手机号已存在！');
                    }
                });
            };

            $scope.changeCusTel = function(value, id, phone_code, phone){
                $scope.changeTel = value;
                if(value){
                    $scope.changeCustomerTel(id, phone_code, phone);
                }
            };

            $scope.changeCustomerMessage = function($hide, id, unsave){
                $scope.cusDetails.birthday ? $scope.cusDetails.birthday = formatDate($scope.cusDetails.birthday, 'yyyy-MM-dd') : '';
                $scope.cusDetails.sex = $scope.filterOption.lessee_type;
                $scope.cusDetails.id_type ? $scope.placeholder.idtype = $scope.cusDetails.id_type : '证件类型';
                $scope.cusDetails.id_type ? $scope.cusDetails.id_type = $scope.filterOption.type.name : '';
                $scope.images.download_link ? $scope.cusDetails.avatar = $scope.images.download_link : $scope.cusDetails.avatar;
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
                    noty('info', '信息修改成功！');
                    getCustomerLists();
                });
                $hide();
            };

            $scope.changeCusDetails = function(value, $hide, id, unsave){
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

            $scope.switchBatch = function(){
                $scope.batchJoinOld = !$scope.batchJoinOld;
            }

            $scope.searchCusTel = _.debounce(function(){
                $scope.telWrong = false;
                $scope.telRepeat = false;
                $scope.telright = false;
                $scope.telNew = false;
                if($scope.cusMessage.phone_code === "+86"){
                    if($scope.cusMessage.phone && !utils.isPhone($scope.cusMessage.phone)){
                        $scope.telWrong = true;
                    }else if(!$scope.cusMessage.phone){
                        return;
                    }else{
                        var params = {query: $scope.cusMessage.phone};
                        CustomerService.getCustomerLists(params).success(function(data){
                            if(data[0]){
                                $scope.telRepeat = true;
                            }else{
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
        return ['$rootScope', '$scope', 'CustomerService', 'events', '$filter', '$timeout', 'CONF', '$location', 'CurrentAdminService', 'ImageUploaderService', 'SbCropImgService', 'utils', 'ExcelUploaderService', '$modal', CustomerController];

    });

})(define);
