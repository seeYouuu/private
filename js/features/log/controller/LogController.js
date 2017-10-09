/**
 *  Defines the LogController controller
 *
 *  @author  liping.chen
 *  @date    July 28, 2016
 *
 */
(function(define) {
    'use strict';
    /**
     * Register the LogController class with RequireJS
     */
    define(['lodash'], function(_) {

        /**
         * @constructor
         */
        var LogController = function($rootScope, $scope, LogService, events, CONF, md5, $translate, CurrentAdminService, $sce, $filter) {

            $scope.pageFlag = LogService.getSearchParam('pageFlag') ? LogService.getSearchParam('pageFlag') : 'list';
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.PERMISSION_KEY = 'platform.log';
            $scope.buildingOptions = {};
            $scope.refresh = true;
            $scope.showSpinner = true;
            $scope.roomTypeDesc = {};
            $scope.userOptions = {};
            $scope.unitDesc = LogService.getUnitDesc();
            $scope.statusDesc = LogService.getStatusDesc();
            $scope.logAction = LogService.getLogAction();
            $scope.logModule = LogService.getLogModule();
            $scope.buildingStatus = LogService.getBuildingStatus();
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: LogService.getSearchParam('pageIndex') ? parseInt(LogService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.status = [
                {name: '已标记', value: 1},
                {name: '未标记', value: 0}
            ];
            $scope.filterOption = {
                company: '',
                module: '',
                status: '',
                searchKey: LogService.getSearchParam('search'),
                startDate: LogService.getSearchParam('startDate'),
                endDate: LogService.getSearchParam('endDate')
            };
            $scope.placeholder = {
                company: '销售方',
                module: '模块管理',
                status: '全部状态'
            };

            $scope.translationData = {
                discount_price: ''
            };

            $scope.markOptions = {
                remarks: ''
            };
            
            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var getModuleList = function(){
                LogService.getModules().success(function(data){
                    $scope.modules = data;
                    _.each($scope.modules, function(item){
                        item.name == LogService.getSearchParam('module') ? $scope.filterOption.module = item : '';
                    });
                    if(LogService.getSearchParam('status')){
                        _.each($scope.status, function(item) {
                            item.value == LogService.getSearchParam('status') ? $scope.filterOption.status = item : '';
                        });
                    }
                });
            };

            var getRoomType = function(){
                LogService.getRoomTypes().success(function(data){
                    $scope.roomTypes = data;
                    _.each(data, function(item){
                        $scope.roomTypeDesc[item.name] = item.description;
                    });
                });
            };

            var getUsers = function(params){
                LogService.getUserList(params).success(function(data){
                    _.each(data, function(item){
                        $scope.userOptions[item.id] = item;
                    });
                });
            };

            var getUserBuildings = function(params){
                LogService.getBuildings(params).success(function(data){
                    _.each(data, function(item){
                        $scope.buildingOptions[item.id] = item.name;
                    });
                });
            };

            var getPermissions = function(){
                var arr = [];
                $scope.logItem.log_object_json.commonRole = [];
                $scope.logItem.log_object_json.buildingRole = {};
                _.each($scope.logItem.log_object_json.permissions, function(item){
                    if(item.building){
                        arr.push(item.building.id);
                        if($scope.logItem.log_object_json.buildingRole[item.building.id] && $scope.logItem.log_object_json.buildingRole[item.building.id].length > 0){
                            $scope.logItem.log_object_json.buildingRole[item.building.id].push(item);
                        }else{
                            $scope.logItem.log_object_json.buildingRole[item.building.id] = [];
                            $scope.logItem.log_object_json.buildingRole[item.building.id].push(item);
                        }
                    }else{
                        $scope.logItem.log_object_json.commonRole.push(item);
                    }
                });
                arr = _.uniq(arr);
                arr.length > 0 ? getUserBuildings({'id[]': arr, 'platform': 'sales'}): '';
            };

            var initLogParams = function(){
                var params = {
                    pageLimit: $scope.pageOptions.pageSize, 
                    pageIndex: $scope.pageOptions.pageIndex
                };
                if(LogService.getSearchParam('module')){
                    params.module = LogService.getSearchParam('module');
                }
                if(LogService.getSearchParam('status')){
                    params.mark = LogService.getSearchParam('status');
                }
                if(LogService.getSearchParam('object_key')){
                    params.object_key = LogService.getSearchParam('object_key');
                }
                if(LogService.getSearchParam('object_id')){
                    params.object_id = LogService.getSearchParam('object_id');
                }
                if($scope.filterOption.searchKey) {
                    params.search = $scope.filterOption.searchKey;
                }
                if($scope.filterOption.startDate){
                    params.startDate = $scope.filterOption.startDate;
                }
                if($scope.filterOption.endDate){
                    params.endDate = $scope.filterOption.endDate;
                }
                
                return params;
            };

            var formatLogData = function(data){
                $scope.logList = data.items;
                var adminArr = [];
                _.each($scope.logList, function(item){
                    adminArr.push(item.admin_username);
                    item.log_object_json = JSON.parse(item.log_object_json);
                    if(item.log_module === 'room'){
                        _.each(item.log_object_json.office_supplies, function(supply, index){
                            if(index ===0){
                                item.log_object_json.supplies = supply.supply.name + 'x' + supply.quantity;
                            }else {
                                item.log_object_json.supplies = item.log_object_json.supplies + '，' + supply.supply.name + 'x' + supply.quantity;
                            }
                        });
                    }else if(item.log_module === 'room_order' || item.log_module === 'room_order_preorder' || item.log_module === 'room_order_reserve'){
                        item.log_object_json.product_info = JSON.parse(item.log_object_json.product_info);
                        item.log_object_json.product_info.seat_number = item.log_object_json.product_info.seat_number? item.log_object_json.product_info.seat_number: '-';
                        if(!item.log_object_json.user_id){
                            item.log_object_json.user_id = 1;
                        }
                        var arr = [];
                        arr.push(item.log_object_json.user_id);
                        if(item.log_object_json.product.room.type === 'meeting' && item.log_object_json.appointed !== ''){
                            arr.push(item.log_object_json.appointed);
                        }
                        if(item.log_object_json.product.room.type === 'office' && item.log_object_json.invited_people){
                            _.each(item.log_object_json.invited_people, function(inv){
                                arr.push(inv.user_id);
                            });
                        }
                        item.userOptions = {};
                    }else if(item.log_module === 'invoice'){
                        item.log_object_json.invoice_profile = JSON.parse(item.log_object_json.invoice_profile);
                    }
                });
                getUsers({'id[]': adminArr});
            };

            var getLogList = function(){
                var params = initLogParams();
                LogService.getLogList(params).success(function(data){
                    data.items = _.filter(data.items, function(item) {return item.platform == 'sales'});
                    formatLogData(data);
                    $scope.pageOptions.totalNum = data.total_count;
                    $scope.refresh = false;
                });
            };
            
            var init = function(){
                $rootScope.crumbs = {first: '管理员日志'};
                if($scope.pageFlag === 'list'){
                    getModuleList();
                    getLogList();
                    getRoomType();
                }else{
                    $rootScope.crumbs.second = '相关历史记录';
                    getLogList();
                    getRoomType();
                }
            };

            init();

            $scope.back = function(){
                LogService.updateSearchParam('pageFlag', '');
                LogService.updateSearchParam('object_key', '');
                LogService.updateSearchParam('object_id', '');
            };

            $scope.seeDetail = function(item){
                $scope.logItem = item;
                var title = '',
                    tpl = item.log_module + 'Tpl';   
                if(item.log_module === 'user' || item.log_module === 'building' || item.log_module === 'event'){
                    title = item.log_object_json.name;
                }else if(item.log_module === 'room'){
                    title = item.log_object_json.city.name + ',' + item.log_object_json.building.name + ',' + item.log_object_json.name;
                }else if(item.log_module === 'product'){
                    title = item.log_object_json.room.city.name + ',' + item.log_object_json.room.building.name + ',' + item.log_object_json.room.name;
                    $scope.logItem.log_object_json.url = CONF.productURL + '&productid='+ $scope.logItem.log_object_json.id + '&btype=' + $scope.logItem.log_object_json.room.type;
                    if($scope.logItem.log_object_json.private){
                        getUsers({'id[]': [$scope.logItem.log_object_json.visible_user_id]});
                    }
                }else if(item.log_module === 'admin'){
                    title = item.log_object_json.username;
                    getPermissions();
                }else if(item.log_module === 'room_order' || item.log_module === 'room_order_preorder' || item.log_module === 'room_order_reserve'){
                    title = item.log_object_json.order_number;
                    $scope.translationData.discount_price = item.log_object_json.discount_price;
                    getUsers({'id[]': [item.log_object_json.user_id]});
                }else if(item.log_module === 'invoice'){
                    title = item.log_object_json.invoice_number;
                    getUsers({'id[]': [$scope.logItem.log_object_json.user_id]});
                }
                events.emit('modal', {
                    scope: $scope,
                    title: title,
                    backdrop: true,
                    animation: 'am-fade-and-slide-top',
                    template: tpl
                });
            };

            $scope.goPage = function(index){
                LogService.updateSearchParam('pageIndex', index);
            };

            $scope.search = function () {
                LogService.updateSearchParam('pageIndex', '');
                LogService.updateSearchParam('module', '');
                LogService.updateSearchParam('search', $scope.filterOption.searchKey.toString());
            };

            $scope.seeHistory = function(item){
                LogService.updateSearchParam('pageFlag', 'history');
                LogService.updateSearchParam('pageIndex', '');
                LogService.updateSearchParam('module', '');
                LogService.updateSearchParam('object_key', item.log_object_key);
                LogService.updateSearchParam('object_id', item.log_object_id);
            };

            $scope.showRemark = function(item){
                $scope.selectedLog = item;

                if(!item.mark){
                    $scope.markOptions.remarks = '';
                    events.emit('modal', {
                        scope: $scope,
                        title: '备注',
                        backdrop: true,
                        animation: 'am-fade-and-slide-top',
                        template: 'remarkTpl',
                        placement: 'center'
                    });
                }else{
                    var params = [{
                        'op': 'add',
                        'path': '/mark',
                        'value': false
                    }];
                    LogService.addRemark($scope.selectedLog.id, params).success(function(){
                        noty('info', '备注取消成功');
                        getLogList();
                    })
                }
            };

            $scope.closeRemark = function($hide){
                $hide();
            };

            $scope.addRemark = function($hide){
                if(!$scope.markOptions.remarks){
                    noty('error', '请输入备注！');
                }else{
                    var params = [{
                        'op': 'add',
                        'path': '/mark',
                        'value': true
                    },{
                        'op': 'add',
                        'path': '/remarks',
                        'value': $scope.markOptions.remarks
                    }];

                    LogService.addRemark($scope.selectedLog.id, params).success(function(){
                        noty('info', '备注添加成功');
                        getLogList();
                        $hide();
                    })
                }
            };

            $scope.$watch('filterOption.company', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(!$scope.refresh){
                    LogService.updateSearchParam('pageIndex', '');
                    newValue ? LogService.updateSearchParam('company', newValue.id) : LogService.updateSearchParam('company', '');
                }
            }, true);

            $scope.$watch('filterOption.module', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(!$scope.refresh){
                    LogService.updateSearchParam('pageIndex', '');
                    newValue ? LogService.updateSearchParam('module', newValue.name) : LogService.updateSearchParam('module', '');
                }
            }, true);

            $scope.$watch('filterOption.startDate', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(!$scope.refresh){
                    LogService.updateSearchParam('pageIndex', '');
                    newValue ? LogService.updateSearchParam('startDate', $filter('date')(newValue, 'yyyy-MM-dd')) : LogService.updateSearchParam('startDate', '');
                }
            }, true);

            $scope.$watch('filterOption.endDate', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(!$scope.refresh){
                    LogService.updateSearchParam('pageIndex', '');
                    newValue ? LogService.updateSearchParam('endDate', $filter('date')(newValue, 'yyyy-MM-dd')) : LogService.updateSearchParam('endDate', '');
                }
            }, true);

             $scope.$watch('filterOption.status', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(!$scope.refresh){
                    LogService.updateSearchParam('pageIndex', '');
                    newValue ? LogService.updateSearchParam('status', newValue.value.toString()) : LogService.updateSearchParam('status', '');
                }
            }, true);

            $scope.$on('$destroy', function() {});

            events.on(
                'refreshlog',
                function() {
                    $scope.pageOptions.pageIndex = 1;
                    events.emit('pagination');
                },
                true
            );
        };

        return ['$rootScope', '$scope', 'LogService', 'events', 'CONF', 'md5', '$translate', 'CurrentAdminService', '$sce', '$filter', LogController];

    });

})(define);
