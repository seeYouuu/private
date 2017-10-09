/**
 *  Defines the BillController controller
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the BillController class with RequireJS
     */
    define(['lodash', 'angular', 'jquery'], function(_, angular, $) {

        /**
         * @constructor
         */
        var BillController = function($rootScope, $scope, BillService, events, $filter, CONF, $location, $cookies, $translate, CurrentAdminService, utils, $timeout) {

            $scope.pageType = BillService.getSearchParam('ptype') ? BillService.getSearchParam('ptype') : 'list';
            $scope.spaceDetailTab = 1;
            $scope.contractTab = 1;
            $scope.now = new Date();
            $scope.dropDownOptions = [
                {name: '订单号'},
                {name: '空间名(包含)'}
            ];
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: BillService.getSearchParam('pageIndex') ? parseInt(BillService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.placeholder = {
                all: '全部',
                tenantry: '报价号',
                community: '所有社区（显示该销售方下的所有社区）',
                commense: '起租日'
            };
            $scope.item={
                selected: 'true'
            };
            $scope.cusDrop = false;
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };
            $scope.keywordList = BillService.getKeywordList();
            $scope.statusDesc = BillService.getStatusDesc();
            $scope.channelLists = BillService.getChannels();
            $scope.roomTypeDesc = {};
            $scope.filterOption = {};
            $scope.filterOption.keywordObj = $scope.keywordList[0];

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
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

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var getTableItems = function(){
                var params = {object: 'lease_bill'};
                BillService.getTableItems(params).success(function(data){
                    $scope.dragModels.tableItems = data;
                    $scope.copyTableItem = angular.copy(data);
                });
            };

            var getTableHeaders = function(){
                var params = {object: 'lease_bill'};
                BillService.getTableHeader(params).success(function(data){
                    $scope.tableHeaders = data;
                    $timeout(function() {
                        cusBConWidth();
                    }, 200);
                });
            };

            var formatData = function(item){
                item.customization = _.pick(item, 'description', 'name', 'serial_number', 'drawee', 'number');
                item.customization.lease_serial_number = item.lease.serial_number;
                item.customization.start_date = formatDate(item.start_date, 'yyyy-MM-dd') + '至' + formatDate(item.end_date, 'yyyy-MM-dd') ;
                item.customization.send_date = formatDate(item.send_date, 'yyyy-MM-dd HH:mm:ss');
                item.customization.order_method = item.order_method === 'auto' ? '自动推送' : '后台推送';
                item.customization.status = $scope.statusDesc[item.status];
                item.customization.amount = item.amount + '元';
                item.customization.revised_amount = item.revised_amount + '元';
                item.customization.pay_channel = $translate.instant(item.pay_channel);
                item.customization.drawer = item.sales_invoice ? item.lease.product.room.building.company.name + '开票' : '创合开票';
                return item;
            };

            var getFilterParams = function(){
                BillService.getSearchParam('keyword_search') ? $scope.filterOption.keyword_search = BillService.getSearchParam('keyword_search') : '';
                BillService.getSearchParam('send_start') ? $scope.filterOption.send_start = BillService.getSearchParam('send_start') : '';
                BillService.getSearchParam('send_start') ? $scope.filterOption.send_end = BillService.getSearchParam('send_end') : '';
                BillService.getSearchParam('pay_start_date') ? $scope.filterOption.pay_start_date = BillService.getSearchParam('pay_start_date') : '';
                BillService.getSearchParam('pay_end_date') ? $scope.filterOption.pay_end_date = BillService.getSearchParam('pay_end_date') : '';
                BillService.getSearchParam('building') ? $scope.filterOption.building = BillService.getSearchParam('building') : '';
                BillService.getSearchParam('keyword') ? $scope.filterOption.keywordObj = _.find($scope.keywordList, function(item){return item.value == BillService.getSearchParam('keyword')}): '';
                BillService.getSearchParam('status') ? $scope.filterOption.statusObj = _.find($scope.filterStatus, function(item){return item.value == BillService.getSearchParam('status')}): '';
                BillService.getSearchParam('channel') ? $scope.filterOption.channelObj = _.find($scope.channelLists, function(item){return item.value == BillService.getSearchParam('channel')}): '';
            };


            var initFilterParams = function(){
                $scope.filterOption.keyword_search ? $scope.filterOption.keyword_search = $scope.filterOption.keyword_search : '';
                $scope.filterOption.send_start ? $scope.filterOption.send_start = formatDate($scope.filterOption.send_start, 'yyyy-MM-dd') : '';
                $scope.filterOption.send_end ? $scope.filterOption.send_end = formatDate($scope.filterOption.send_end, 'yyyy-MM-dd') : '';
                $scope.filterOption.statusObj ? $scope.filterOption.status = $scope.filterOption.statusObj.value : '';
                $scope.filterOption.keywordObj && $scope.filterOption.keyword_search ? $scope.filterOption.keyword = $scope.filterOption.keywordObj.value : '';
                $scope.filterOption.buildingObj ? $scope.filterOption.building = $scope.filterOption.buildingObj.id : '';
                $scope.filterOption.channelObj ? $scope.filterOption.channel = $scope.filterOption.channelObj.value : '';

                $scope.filterOption.pay_start_date ? $scope.filterOption.pay_start_date = formatDate($scope.filterOption.start_date, 'yyyy-MM-dd'): '';
                $scope.filterOption.pay_end_date ? $scope.filterOption.pay_end_date = formatDate($scope.filterOption.end_date, 'yyyy-MM-dd'): '';

                var cache = _.pick($scope.filterOption,'keyword', 'keyword_search', 'channel', 'send_end', 'send_start', 'pay_end_date', 'pay_start_date', 'status', 'building');
                return cache;
            };

            $scope.resetSearch = function(){
                $scope.filterOption = {
                    send_start: '',
                    send_end: '',
                    pay_start_date: '',
                    pay_end_date: '',
                    statusObj: '',
                    building: '',
                    channelObj: '',
                    keyword_search: '',
                    keywordObj: ''
                };
                getFilterParams();
            };

            $scope.searchList = function(){
                var params = initFilterParams();
                for(var key in params){
                    BillService.updateSearchParam(key, params[key]);
                }
                $scope.filterOption.building ? BillService.updateSearchParam('building', $scope.filterOption.buildingObj.id) : BillService.updateSearchParam('building', '');
                $scope.filterOption.keyword ? '' : BillService.updateSearchParam('keyword', '');
                BillService.updateSearchParam('pageIndex', '');
            };

            $scope.clearSearchFilters = function(){
                $scope.filterOption = {};
                _.each($location.search(), function(value, key){
                    BillService.updateSearchParam(key, '');
                });
            };

            var getCustomer = function(id){
                BillService.getCustomer(id).success(function(data){
                    $scope.customerOption = data;
                });
            };

            var getUser = function(id){
                BillService.getUser(id).success(function(data){
                    $scope.billSender = data;
                });
            };

            var getRemarks = function(id){
                var params = {
                    object: 'lease_bill',
                    object_id: id
                };
                BillService.getBillRemarks(params).success(function(data){
                    $scope.billRemarks = data;
                });
            };

            var getBillsList = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                // var params = {pageLimit: $scope.pageOptions.pageSize, pageIndex: $scope.pageOptions.pageIndex};
                BillService.getBillList(params).success(function(data){
                    $scope.billsList = data.items;
                    _.each($scope.billsList, function(item){
                        item = formatData(item);
                    });
                    $scope.pageOptions.totalNum = data.total_count;
                });
            };

            var getBuildingList = function() {
                var params = {
                    op: 1
                };
                params['permission[]'] = $scope.PERMISSION_SPACE_KEY;
                BillService.getBuildingList(params).success(function(data) {
                    $scope.buildings = _.filter(data, function(item) {return item.visible});
                    BillService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildings, function(item){return item.id == BillService.getSearchParam('building')}): '';
                });
            };

            var getRoomType = function(){
                BillService.getRoomTypes().success(function(data){
                    _.each(data, function(item){
                        $scope.roomTypeDesc[item.name] = item;
                    });
                });
            };

            var init = function(){
                $rootScope.crumbs = {first: '合同账单'};
                getTableItems();
                getTableHeaders();
                getBuildingList();
                getBillsList();
                getRoomType();
            };

            init();
                
            $scope.resetSelect = function(){
                $scope.dragModels.tableItems = angular.copy($scope.copyTableItem);
            };

            $scope.checkItem = function(item){
                !item.required ? item.checked = !item.checked : '';
            };

            $scope.updateTableColumn = function($hide){
                $hide();
                var params = {
                    object: 'lease_bill',
                    list_ids: []
                };
                var tempArr = _.filter($scope.dragModels.tableItems, function(item){
                    return item.required || item.checked; 
                }) ;
                params.list_ids = _.pluck(tempArr, 'id');
                BillService.updateTableColumn(params).success(function(){
                    $scope.cusDrop = false;
                    getTableHeaders();
                    noty('info', '设置表格成功！');
                });
            };
            
            $scope.showBillDialog = function(item){
                $scope.selectedBill = item;
                getCustomer(item.customer_id);
                getRemarks(item.id);
                item.sender ? getUser(item.sender) : '';
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'billDetailTpl'
                });
            };

            $scope.pushSingleBill = function($hide){
                var params = [{
                    op: 'add',
                    path: '/status',
                    value: 'unpaid'
                }];
                BillService.pushLeasesBill($scope.selectedBill.id, params).success(function(data){
                    $scope.selectedBill.status = 'unpaid';
                    $hide();
                    noty('info','账单推送成功！！');
                });
            };

            $scope.collectionSalesOffline = function(hide){
                if($scope.salesOffline.note == ''){
                    noty('error','请填写收款备注！');
                    return ;
                }
                var params = [
                    {
                        'op' : 'add',
                        'path': '/status',
                        'value': 'paid'
                    },
                    {
                        'op' : 'add',
                        'path': '/remark',
                        'value': $scope.salesOffline.note
                    }
                ];
                BillService.collectionSalesOffline($scope.selectedBill.id, params).success(function(){
                    noty('info','已确认收款该账单！');
                }).error(function(){
                    noty('error','未能确认收款！');
                });
                hide();
                $scope.salesOffline.note = '';
            };

            $scope.goPage = function(index){
                BillService.updateSearchParam('pageIndex', index);
            };
        }
        return ['$rootScope', '$scope', 'BillService', 'events', '$filter', 'CONF', '$location', '$cookies', '$translate', 'CurrentAdminService', 'utils', '$timeout', BillController];

    });

})(define);
