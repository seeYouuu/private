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
        var TransactionController = function($rootScope, $scope, TransactionService, events, $filter, CONF, $location, $cookies, $translate, CurrentAdminService, utils) {

            $scope.pageType = TransactionService.getSearchParam('ptype') ? TransactionService.getSearchParam('ptype') : 'list';
            $scope.tabType = TransactionService.getSearchParam('tabtype') ? TransactionService.getSearchParam('tabtype') : 'space';
            $scope.spaceDetailTab = 1;
            $scope.contractTab = 1;
            $scope.now = new Date();
            $scope.dropDownOptions = [
                {name: '订单号'},
                {name: '空间名(包含)'}
            ];
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: TransactionService.getSearchParam('pageIndex') ? parseInt(TransactionService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.userOptions = {};
            $scope.roomTypeDesc = {};
            $scope.stepBoxs = TransactionService.getStepBoxs();
            $scope.modify = false;
            $scope.placeholder = {
                all: '全部'
            };
            $scope.PERMISSION_SPACE_KEY = 'sales.building.order';
            $scope.PERMISSION_EVENT_KEY = 'sales.platform.event_order';
            $scope.PERMISSION_PREORDER_KEY = 'sales.building.order.preorder';
            $scope.PERMISSION_RESERVE_KEY = 'sales.building.order.reserve';
            $scope.PERMISSION_ROOM_KEY = 'sales.building.room';
            $scope.PERMISSION_PRODUCT_KEY = 'sales.building.product';
            $scope.PERMISSION_EVE_KEY = 'sales.platform.event';

            $scope.spaceOrderStatus = TransactionService.getWorkspaceStatusDesc();
            $scope.unitDesc = TransactionService.getUnitDesc();
            $scope.searchResult = {
                // draweeOption: {},
                supervisorOption: {},
                changeUserOption: {}
            };
            $scope.generateFlag = TransactionService.getSearchParam('appointmentId') ? true : false;
            $scope.filterExchangeHour = TransactionService.getFilterExchangeHour();
            $scope.filterRentDate = TransactionService.getFilterRentDate();
            $scope.filterPayDate = TransactionService.getFilterPayDate();
            $scope.filterOption = {};
            $scope.download = '';
            $scope.currentStep = 0;
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $rootScope.selectDropdown = false;
            $scope.selectedRoomType = [];
            $scope.selectedChannelType = [];
            $scope.agreementBills = [];
            $scope.deleteBills = [];
            $scope.expandFlag = false;
            $scope.offlineHeight = 250;
            $scope.deposit = {
                note: ''
            };
            $scope.salesOffline = {
                note: ''
            };
            $scope.otherBill = {};
            $scope.changeAmountOptions = {
                revised_amount: '',
                revision_note: ''
            };
            $scope.loaded = false;
            $scope.mutiSelectedBills = [];

            $scope.remarkList = [];
            $scope.createOptions = {remarkText: ''};

            var getRoomType = function(){
                TransactionService.getRoomTypes().success(function(data){
                    $scope.roomTypes = data;
                    _.each($scope.roomTypes, function(item){
                        $scope.roomTypeDesc[item.name] = item;
                        _.each(TransactionService.getSearchParam('type').split('|'), function(type){
                            item.name == type ? item.selected = true : '';
                        });
                    });
                });
            };

            var getBuildingList = function() {
                var params = {
                    op: 1
                };
                params['permission[]'] = $scope.PERMISSION_SPACE_KEY;
                TransactionService.getBuildingList(params).success(function(data) {
                    $scope.buildings = _.filter(data, function(item) {return item.visible});
                    TransactionService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildings, function(item){return item.id == TransactionService.getSearchParam('building')}): '';
                });
            };

            var getChannels = function(){
                var params = {type: $scope.tabType};
                TransactionService.getChannels(params).success(function(data){
                    $scope.channelList = data;
                    _.each($scope.channelList, function(item){
                        _.each(TransactionService.getSearchParam('channel').split('|'), function(channel){
                            item.payment.channel == channel ? item.selected = true : '';
                        });
                    });
                });
            };

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var getUsers = function(params){
                TransactionService.getUserList(params).success(function(data){
                    _.each(data, function(item){
                        item.avatar = CONF.file + '/person/' + item.id + '/avatar_small.jpg';
                        $scope.userOptions[item.id] = item;
                    });
                });
            };

            var formatDownload = function(){
                var params = initFilterParams(),
                    url = '';
                for(var key in params){
                    params[key] ? url += ('&' + key + '=' + params[key]) : '';
                }
                url = url.slice(1);
                $scope.tabType != 'member' ? url += ('&company=' + $cookies.get('salesCompanyId')) : '';
                return url;
            };

            var getFilterParams = function(){
                TransactionService.getSearchParam('keyword') ? $scope.filterOption.keyword = TransactionService.getSearchParam('keyword') : '';
                TransactionService.getSearchParam('keyword_search') ? $scope.filterOption.keyword_search = TransactionService.getSearchParam('keyword_search') : '';
                TransactionService.getSearchParam('create_start') ? $scope.filterOption.create_start = TransactionService.getSearchParam('create_start') : '';
                TransactionService.getSearchParam('create_end') ? $scope.filterOption.create_end = TransactionService.getSearchParam('create_end') : '';
                TransactionService.getSearchParam('status') ? $scope.filterOption.status = TransactionService.getSearchParam('status') : '';
                TransactionService.getSearchParam('pay_start') ? $scope.filterOption.pay_start = TransactionService.getSearchParam('pay_start') : '';
                TransactionService.getSearchParam('pay_end') ? $scope.filterOption.pay_end = TransactionService.getSearchParam('pay_end') : '';
                TransactionService.getSearchParam('start_date') ? $scope.filterOption.start_date = TransactionService.getSearchParam('start_date') : '';
                TransactionService.getSearchParam('end_date') ? $scope.filterOption.end_date = TransactionService.getSearchParam('end_date') : '';
                TransactionService.getSearchParam('pay_date') ? $scope.filterOption.pay_date = TransactionService.getSearchParam('pay_date') : '';
                TransactionService.getSearchParam('building') ? $scope.filterOption.building = TransactionService.getSearchParam('building') : '';
                TransactionService.getSearchParam('create_date_range') ? $scope.filterOption.create_date_range = TransactionService.getSearchParam('create_date_range') : '';
                TransactionService.getSearchParam('exchangeHour') ? $scope.filterOption.exchangeHour = _.find($scope.filterExchangeHour, function(item){return item.value == TransactionService.getSearchParam('exchangeHour')}): '';
                TransactionService.getSearchParam('rent_filter') ? $scope.filterOption.rentDate = _.find($scope.filterRentDate, function(item){return item.value == TransactionService.getSearchParam('rent_filter')}): '';
                TransactionService.getSearchParam('payDate') ? $scope.filterOption.payDate = _.find($scope.filterPayDate, function(item){return item.value == TransactionService.getSearchParam('payDate')}): '';
                TransactionService.getSearchParam('keyword') ? $scope.filterOption.keyword = _.find($scope.keywordList, function(item){return item.value == TransactionService.getSearchParam('keyword')}): '';
                TransactionService.getSearchParam('status') ? $scope.filterOption.statusObj = _.find($scope.filterStatus, function(item){return item.value == TransactionService.getSearchParam('status')}): '';
                TransactionService.getSearchParam('type') ? $scope.selectedRoomType = TransactionService.getSearchParam('type').split('|') : '';
                TransactionService.getSearchParam('channel') ? $scope.selectedChannelType = TransactionService.getSearchParam('channel').split('|') : '';

            };

            var getSupplementaryList = function(params){
                TransactionService.getSupplementaryList().success(function(data){
                    $scope.supplementaryList = angular.copy(data);
                    if(params && params.length > 0){
                        var temp = {};
                        _.each(params, function(item){
                            temp[item.id] = item.name;
                        });
                        _.each($scope.supplementaryList, function(item){
                            item.selected = temp[item.id] ? true : false;
                        });
                    }
                    $scope.agreementData ? $scope.agreementData.excludedRentType = _.pluck(_.filter($scope.supplementaryList, 'selected', false), 'name').join('; ') : '';
                });
            };

            var getWorkspaceOrders = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                $scope.loaded = false;
                TransactionService.getWorkspaceList(params).success(function(data){
                    $scope.spaceList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each($scope.spaceList, function(item){
                        if(formatDate(item.start_date, 'yyyy-MM-dd HH:mm:ss') > formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss')){
                            item.cancellable = true;
                        }
                        if(item.product_info){
                            item.product_info = JSON.parse(item.product_info);
                            if(item.product_info.room.type_tag !== 'dedicated_desk' && !item.product_info.base_price && item.product_info.order){
                                item.product_info.order.base_price = _.find(item.product_info.room.leasing_set, function(set){return set.unit_price === item.product_info.order.unit_price}).base_price;
                            }
                            if(item.product_info.room.type == 'fixed' && item.product_info.room.seat && item.product_info.room.seat.base_price){
                                item.product_info.base_price = item.product_info.room.seat.base_price;
                            }
                        }
                        arr.push(item.user_id);
                        arr.push(item.payment_user_id);
                        item.appointed ? arr.push(item.appointed) : '';
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.refresh = false;
                    $scope.loaded = true;
                });
            };

            var getUsersInfo = function(params, flag){
                TransactionService.getUsersInfo({'id[]': params}).success(function(data){
                    if(flag){
                        // $scope.searchResult.draweeOption = angular.copy(data[0]);
                        $scope.searchResult.supervisorOption = angular.copy(data[0]);
                    }
                    _.each(data, function(item){
                        item.avatar = CONF.file + '/person/' + item.id + '/avatar_small.jpg';
                        $scope.userOptions[item.id] = item;
                        // $scope.agreementOption.drawee === item.id ? $scope.searchResult.draweeOption = item : '';
                        $scope.agreementOption.supervisor === item.id ? $scope.searchResult.supervisorOption = item : '';
                    });
                });
            };

            var getProductDetail = function(){
                TransactionService.getProductDetail(TransactionService.getSearchParam('productId')).success(function(data){
                    $scope.appointmentData = {};
                    $scope.appointmentData.product = data;
                    $scope.permissionBuildingId = data.room.building.id;
                    if($scope.pageType === 'createAgreement'){
                        $scope.agreementOption.monthly_rent = data.base_price;
                        $scope.agreementOption.deposit = data.deposit;
                        getSupplementaryList(data.lease_rent_types);
                    }
                });
            };

            var getSpaceDetail = function(){
                TransactionService.getSpaceDetail(TransactionService.getSearchParam('orderId')).success(function(data){
                    $scope.spaceItem = data;
                    $scope.spaceItem.product_info = JSON.parse($scope.spaceItem.product_info);
                    if($scope.spaceItem.product_info.room.type_tag !== 'dedicated_desk' && !$scope.spaceItem.product_info.base_price){
                        $scope.spaceItem.product_info.order.base_price = _.find($scope.spaceItem.product_info.room.leasing_set, function(set){return set.unit_price === $scope.spaceItem.product_info.order.unit_price}).base_price;
                    }
                    var arr = [$scope.spaceItem.user_id, $scope.spaceItem.payment_user_id];
                    if($scope.spaceItem.appointed){
                        arr.push($scope.spaceItem.appointed);
                    }
                    if($scope.spaceItem.invited_people.length > 0){
                        _.each($scope.spaceItem.invited_people, function(item){
                            arr.push(item.user_id);
                        });
                    }
                    $scope.spaceItem.edit_admin_id ? arr.push($scope.spaceItem.edit_admin_id) : '';
                    $scope.spaceItem.admin_id ? arr.push($scope.spaceItem.admin_id) : '';
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $rootScope.crumbs.second = data.order_number;
                });
            };

            var getEventOrderDetail = function(){
                TransactionService.getEventOrderDetail(TransactionService.getSearchParam('orderId')).success(function(data){
                    $scope.eventOrderDetail = data;
                    $rootScope.crumbs.second = data.order_number;
                    $scope.eventOrderDetail.arr = [];
                    var dateArr = [];
                    _.each($scope.eventOrderDetail.event.dates, function(item){
                        var temp = formatDate(item.date, 'yyyy-MM-dd');
                        dateArr.push(item.date);
                        _.each(item.times, function(time){
                            $scope.eventOrderDetail.arr.push(temp + ' ' + formatDate(time.start_time, 'HH:mm') + ' - ' + formatDate(time.end_time, 'HH:mm') + ' ' + time.description);
                        });
                    });
                    $scope.eventOrderDetail.minDate = formatDate(dateArr[0], 'yyyy-MM-dd');
                    $scope.eventOrderDetail.maxDate = formatDate(dateArr[dateArr.length-1], 'yyyy-MM-dd');
                    getUsers({'id[]': [$scope.eventOrderDetail.user_id]});
                });
            };

            var getMemberDetail = function(){
                TransactionService.getMemberDetail(TransactionService.getSearchParam('orderId')).success(function(data){
                    $scope.memberShipItem = data;
                    getUsers({'id[]': [$scope.memberShipItem.user]});
                    $rootScope.crumbs.second = data.order_number;
                });
            };

            var getOrderDetail = function(){
                if($scope.tabType === 'space'){
                    getRoomType();
                    getSpaceDetail();
                }else if($scope.tabType === 'event'){
                    getEventOrderDetail();
                }else if($scope.tabType === 'member'){
                    getMemberDetail();
                }
            };

            //events orders
            var getEventOrders = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                $scope.loaded = false;
                TransactionService.getEventList(params).success(function(data){
                    $scope.eventList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each($scope.eventList, function(event){
                        event.arr = [];
                        var dateArr = [];
                        _.each(event.event.dates, function(item){
                            var temp = formatDate(item.date, 'yyyy-MM-dd');
                            dateArr.push(item.date);
                            _.each(item.times, function(time){
                                event.arr.push(temp + ' ' + formatDate(time.start_time, 'HH:mm') + ' - ' + formatDate(time.end_time, 'HH:mm') + ' ' + time.description);
                            });
                        });
                        event.minDate = formatDate(dateArr[0], 'yyyy-MM-dd');
                        event.maxDate = formatDate(dateArr[dateArr.length-1], 'yyyy-MM-dd');
                        arr.push(event.user_id);
                    });
                    $scope.refresh = false;
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.loaded = true;
                });
            };

            var getMemberShipList = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                TransactionService.getMemberList(params).success(function(data){
                    $scope.membershipList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each(data.items, function(item){
                        item.user ? arr.push(item.user) : '';
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                });
            };

            var getTabList = function(){
                if($scope.tabType === 'space'){
                    getRoomType();
                    getBuildingList();
                    getWorkspaceOrders();
                }else if($scope.tabType === 'event'){
                    getEventOrders();
                }else if($scope.tabType === 'member'){
                    getBuildingList();
                    getMemberShipList();
                }
            };

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var validParams = function(param, msg){
                if(param){
                    noty('error', msg);
                    return false;
                }
                return true;
            };

            var initFilterParams = function(){
                $scope.filterOption.keyword_search ? $scope.filterOption.keyword_search = $scope.filterOption.keyword_search : '';
                $scope.filterOption.create_start ? $scope.filterOption.create_start = formatDate($scope.filterOption.create_start, 'yyyy-MM-dd') : '';
                $scope.filterOption.create_end ? $scope.filterOption.create_end = formatDate($scope.filterOption.create_end, 'yyyy-MM-dd') : '';
                $scope.filterOption.statusObj ? $scope.filterOption.status = $scope.filterOption.statusObj.value : '';
                $scope.filterOption.buildingObj ? $scope.filterOption.building = $scope.filterOption.buildingObj.id : '';
                $scope.filterOption.pay_date ? $scope.filterOption.pay_date = formatDate($scope.filterOption.pay_date, 'yyyy-MM-dd') : '';
                $scope.filterOption.pay_start ? $scope.filterOption.pay_start = formatDate($scope.filterOption.pay_start, 'yyyy-MM-dd') : '';
                $scope.filterOption.pay_end ? $scope.filterOption.pay_end = formatDate($scope.filterOption.pay_end, 'yyyy-MM-dd') : '';
                $scope.filterOption.start_date ? $scope.filterOption.start_date = formatDate($scope.filterOption.start_date, 'yyyy-MM-dd') : '';
                $scope.filterOption.end_date ? $scope.filterOption.end_date = formatDate($scope.filterOption.end_date, 'yyyy-MM-dd') : '';
                $scope.filterOption.rentDate ? $scope.filterOption.rentDate = $scope.filterOption.rentDate : '';
                $scope.filterOption.exchangeHour && $scope.filterOption.exchangeHour.value != 'period' ? $scope.filterOption.create_date_range = $scope.filterOption.exchangeHour.value : '';
                $scope.filterOption.rentDate ? $scope.filterOption.rent_filter = $scope.filterOption.rentDate.value : '';

                var cache = _.pick($scope.filterOption, 'keyword_search', 'create_date_range', 'create_end', 'create_start', 'end_date', 'pay_date', 'pay_end', 'pay_start', 'start_date', 'status', 'rent_filter', 'building');
                $scope.filterOption.keyword ? cache.keyword = $scope.filterOption.keyword.value : '';
                $scope.selectedRoomType.length > 0 ? cache['type[]'] = $scope.selectedRoomType : '';
                $scope.selectedChannelType.length > 0 ? cache['channel[]'] = $scope.selectedChannelType : '';
                $scope.filterOption.rentDate ? cache.rent_filter = $scope.filterOption.rentDate.value : '';
                return cache;
            };

            var verifyChangeAmountParams = function(){
                var validationFlag = true;
                // validationFlag = validationFlag ? validParams(!$scope.changeAmountOptions.revised_amount, '订单金额不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.changeAmountOptions.revised_amount < 0, '订单金额不能为负数！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.changeAmountOptions.revision_note, '更改备注不能为空！') : validationFlag;
                return validationFlag;
            };

            var setDefaultTabType = function(){
                if($scope.currentAdmin.permissionMap[$scope.PERMISSION_SPACE_KEY]){
                    $scope.tabType = 'space';
                    return ;
                }
                if($scope.currentAdmin.permissionMap[$scope.PERMISSION_EVENT_KEY]){
                    $scope.tabType = 'event';
                    return ;
                }
            };

            var initCrumbs = function(){
                if(TransactionService.getSearchParam('tabtype')){
                    $scope.tabType = TransactionService.getSearchParam('tabtype');
                }else{
                    setDefaultTabType();
                }
                $scope.keywordList = TransactionService.getKeywordList($scope.tabType);
                $scope.filterStatus = TransactionService.getFilterStatus($scope.tabType);

                if($scope.pageType === 'list'){
                    $rootScope.crumbs = {first: '交易管理'};
                }else {
                    if($scope.tabType === 'space'){
                        $rootScope.crumbs = {first: '空间订单'};
                    }else if($scope.tabType === 'longrent'){
                        $rootScope.crumbs = {first: '长租申请'};
                    }else if($scope.tabType === 'agreement'){
                        $rootScope.crumbs = {first: '长租合同'};
                    }else if($scope.tabType === 'event'){
                        $rootScope.crumbs = {first: '活动订单'};
                    }else if($scope.tabType === 'member'){
                        $rootScope.crumbs = {first: '会员卡订单'};
                    }
                }
            };

            var getCustomerService = function(){
                TransactionService.getCustomerService().success(function(data){
                    $scope.customerservice = {};
                    _.each(data.customerservice, function(item){
                        $scope.customerservice[item] = true;
                    });
                    console.log($scope.customerservice);
                });
            };

            var getRemarkList = function() {
                var params = {};
                if($scope.pageType == 'spaceDetail') {
                    params = {'object': 'product_order', 'object_id': TransactionService.getSearchParam('orderId')};
                }
                TransactionService.getRemarkList(params).success(function(data) {
                    $scope.remarkList = data;
                });
            };

            var init = function(){
                initCrumbs();
                getCustomerService();
                if($scope.pageType === 'list'){
                    getChannels();
                    getTabList();
                    $scope.currentAdmin.permissionMap[$scope.PERMISSION_LEASES_KEY] ? getLeasesLists(true) : '';
                }else if($scope.pageType === 'spaceDetail' || $scope.pageType === 'eventDetail' || $scope.pageType === 'memberDetail'){
                    getOrderDetail();
                    $scope.pageType == 'spaceDetail' ? getRemarkList() : '';
                }else if($scope.pageType === 'createAgreement'){
                    $rootScope.crumbs.second = '生成合同';
                    $scope.initBill();
                    $scope.appointmentLeaseFlag = TransactionService.getSearchParam('appointmentId') ? true : false;
                    $scope.appointmentLeaseFlag ? getAppointmentDetail() : getProductDetail();
                    getRoomType();
                }
            };

            $scope.createRemark = function() {
                var params = {};
                if($scope.pageType == 'spaceDetail') {
                    params = {'object': 'product_order', 'object_id': TransactionService.getSearchParam('orderId')};
                }
                params.remarks = $scope.createOptions.remarkText;
                TransactionService.createRemark(params).success(function() {
                    getRemarkList();
                    $scope.createOptions.remarkText = '';
                });
            };

            $scope.seeRemarkDialog = function() {
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'orderRemarkTpl'
                });
            };

            $scope.seeBottom = function(){
                var ele = document.getElementsByClassName('detail-scroller')[0],
                    content = document.getElementsByClassName('long-wrapper')[0],
                    conHeight = content.offsetHeight,
                    conTop = ele.scrollTop;
                var _Linear = function(t, b, c, d){
                    return c*t/d + b;
                }
                var _run = function(){
                    conTop = conTop + 50;
                    var cal = _Linear(conTop, conTop, conHeight - conTop, conHeight);
                    ele.scrollTop = cal;
                    conTop < conHeight ? window.requestAnimationFrame(_run) : '';
                };
                _run();
            };
            
            $scope.exportExcel = function(){
                $scope.tabType == 'space' ? $scope.download = CONF.api + 'sales/admin/orders/export?' : '';
                $scope.tabType == 'event' ? $scope.download = CONF.api + 'sales/admin/events/orders/export?' : '';
                $scope.tabType == 'member' ? $scope.download = CONF.api + 'sales/admin/membership/cards/orders/export?' : '';
                $scope.download += formatDownload();
                window.location.href = $scope.download;
            };

            $scope.selectPayType = function(type, list){
                $scope.selectedChannelType = [];
                type.selected = !type.selected;
                _.each(list, function(item){
                    item.selected ? $scope.selectedChannelType.push(item.payment.channel) : '';
                });
                $scope.selectedChannelType = _.uniq($scope.selectedChannelType);
            };

            $scope.selectSpaceType = function(type, list){
                $scope.selectedRoomType = [];
                type.selected = !type.selected;
                _.each(list, function(item){
                    item.selected ? $scope.selectedRoomType.push(item.name) : '';
                });
                $scope.selectedRoomType = _.uniq($scope.selectedRoomType);
            };

            $scope.searchList = function(){
                var params = initFilterParams();
                for(var key in params){
                    TransactionService.updateSearchParam(key, params[key]);
                }
                $scope.filterOption.exchangeHour ? TransactionService.updateSearchParam('exchangeHour', $scope.filterOption.exchangeHour.value) : TransactionService.updateSearchParam('exchangeHour', '');
                $scope.filterOption.rentDate ? TransactionService.updateSearchParam('rent_filter', $scope.filterOption.rentDate.value) : TransactionService.updateSearchParam('rent_filter', '');
                $scope.filterOption.payDate ? TransactionService.updateSearchParam('payDate', $scope.filterOption.payDate.value) : TransactionService.updateSearchParam('payDate', '');
                $scope.filterOption.building ? TransactionService.updateSearchParam('building', $scope.filterOption.buildingObj.id) : TransactionService.updateSearchParam('building', '');
                $scope.filterOption.keyword ? '' : TransactionService.updateSearchParam('keyword', '');
                TransactionService.updateSearchParam('pageIndex', '');
            };

            $scope.clearSearchFilters = function(){
                $scope.filterOption = {};
                _.each($location.search(), function(value, key){
                    key != 'tabtype' ? TransactionService.updateSearchParam(key, '') : '';
                });
            };

            $scope.seeOrderDetail = function(item, type){
                TransactionService.updateSearchParam('ptype', type);
                TransactionService.updateSearchParam('orderId', item.id);
                TransactionService.updateSearchParam('tabtype', $scope.tabType);
                TransactionService.updateSearchParam('type', '');
            };

            $scope.cancelOrder = function(id){
                events.emit('confirm', {
                    title: '取消订单',
                    content: '是否确认取消该订单？订单取消后将不可恢复。',
                    onConfirm: function() {
                        TransactionService.cancelOrder(id).success(function(){
                            getWorkspaceOrders();
                            noty('info','取消订单成功！');
                        }).error(function(){
                            noty('error','取消订单失败！');
                        });
                    }
                });
            };

            $scope.goPage = function(index){
                if($scope.pageType === 'history'){
                    $scope.pageOptions.pageIndex = index;
                    getLeasesLog();
                }else{
                    TransactionService.updateSearchParam('pageIndex', index);
                }
            };

            $scope.seeOrderPage = function(){
                TransactionService.updateSearchParam('ptype', 'orderPage');
            };

            $scope.seeHistory = function(){
                TransactionService.updateSearchParam('ptype', 'history');
            };

            $scope.switchTab = function(tag){
                TransactionService.updateSearchParam('tabtype', tag);
                _.each($location.search(), function(value, key){
                    key != 'tabtype' ? TransactionService.updateSearchParam(key, '') : '';
                });
            };

            $scope.expand = function() {
                $scope.expandFlag = !$scope.expandFlag;
                if($scope.pageType == 'rechargeDetail') {
                    $scope.expandFlag ? $scope.offlineHeight = Math.ceil($scope.rechargeItem.transfer.length/4) * 242 : $scope.offlineHeight = 242;
                }
            };

            $scope.searchUserByPhone = function(phone, option){
                 if(phone && phone.length === 11){
                     var params = {
                         'query': phone
                     };
                     TransactionService.searchUser(params).success(function(data){
                        if(data.length >0){
                            phone = '';
                            data[0].avatar = CONF.file + '/person/' + data[0].id + '/avatar_small.jpg';
                            $scope.searchResult[option] = data[0];
                         }
                     });
                 }
            };

            $scope.seePopup = function(tag, item){
                var flag = true;
                tag === 'changePushOrderAmount' || tag === 'billAmount' ? $scope.changeAmountOrder = item : '';
                $scope.popupType = tag;
                if(tag === 'changeSupervisor' || tag === 'changeDrawee'){
                    $scope.searchResult.changeUserOption = {};
                }else if(tag === 'bathPush'){
                    $scope.mutiSelectedBills.length === 0 ? flag = false : '';
                }else if(tag === 'singlePush'){
                    $scope.mutiSelectedBills = [];
                    $scope.mutiSelectedBills.push(item);
                }else if(tag === 'remark'){
                    $scope.selectedBill = item;
                }else if(tag === 'orderAmount' && $scope.pageType == 'list'){
                    $scope.spaceItem = item;
                }
                if(flag){
                    events.emit('modal', {
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade',
                        template: 'popupTpl'
                    });
                }
            };

            $scope.setStatus = function(orderid, flag){
                var params = [{
                        'op': 'add',
                        'path': '/rejected',
                        'value': flag
                    }];
                TransactionService.setOrderStatus(orderid, params).success(function(){
                    if(flag){
                        noty('info','该订单已被拒绝！');
                    }else{
                        noty('info','该订单已被同意！');
                    }
                    getTabList();
                });
            };

            $scope.seeRoomDetail = function(item){
                if($scope.currentAdmin.roomMap[$scope.PERMISSION_ROOM_KEY + item.room.building.id] || $scope.currentAdmin.productMap[$scope.PERMISSION_PRODUCT_KEY + item.room.building.id] || 
                    $scope.currentAdmin.preorderMap[$scope.PERMISSION_PREORDER_KEY + item.room.building.id] === 2 || $scope.currentAdmin.reserveMap[$scope.PERMISSION_RESERVE_KEY + item.room.building.id] === 2 || $scope.currentAdmin.user.is_super_admin){
                    window.open(CONF.bizbase + 'space?ptype=spaceDetail&roomId='+ item.room.id +'&productId='+ item.id +'&communityId='+ item.room.building.id);
                }
            };

            $scope.seeEventDetail = function(item){
                if($scope.currentAdmin.permissionMap[$scope.PERMISSION_EVE_KEY]){
                    window.open(CONF.bizbase + 'activity?type=eventdetail&eventid=' + item.event.id);
                }
            };

            var verifyPushParams = function(){
                var validationFlag = true;
                var params = _.map($scope.mutiSelectedBills, function(item){
                    var temp = {};
                    if(validationFlag){
                        if(item.expand){
                            if(item.revised_amount && item.revision_note && item.revised_amount < 0){
                                validationFlag = false;
                                noty('error', '订单金额不能为负数！');
                            }else if(!item.revised_amount){
                                validationFlag = false;
                                noty('error', '订单金额不能为空！');
                            }else if(!item.revision_note){
                                validationFlag = false;
                                noty('error', '更改备注不能为空！');
                            }
                            temp = {
                                id: item.id,
                                revised_amount: item.revised_amount,
                                revision_note: item.revision_note
                            };
                        }else{
                            temp = {id: item.id};
                        }
                    }
                    return temp;
                });
                return validationFlag ? params : [];
            };

            $scope.showOriginImage = function(url){
                $scope.originImageUrl = url;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'tranImgPreviewTpl'
                });
            };

            $scope.generateChat = function(userId, buildingId){
                var params = {
                    creatorId: userId,
                    buildingId: buildingId,
                    tag: 'customerservice'
                };
                TransactionService.createGroupChat(params).success(function(data){
                    events.emit('refreshGroup');
                    events.emit('openChat', data.id);
                });
            };

            $scope.switchModifyFlag = function(bill){
                !bill.expand ? bill.revised_amount = bill.revised_amount || bill.amout : '';
                bill.expand = !bill.expand;
            };

            $scope.changeBillAmount = function($hide, type){
                var params = [{
                    op: 'add',
                    path: type == 'orderAmount' ? '/discountPrice' : '/revised_amount',
                    value: $scope.changeAmountOptions.revised_amount
                }, {
                    op: 'add',
                    path: type == 'orderAmount' ? '/editComment' : '/revision_note',
                    value: $scope.changeAmountOptions.revision_note
                }];
                if(verifyChangeAmountParams()){
                    if(type == 'orderAmount'){
                        TransactionService.changeSpaceOrderAmount($scope.spaceItem.id, params).success(function(){
                            $hide();
                            noty('info', '订单金额修改成功！');
                            if($scope.pageType === 'list' && $scope.tabType === 'space'){
                                getWorkspaceOrders();
                            }else{
                                getSpaceDetail();
                            }
                        });
                    }
                }
            };

            $scope.$watch('filterOption.keyword', function(newValue, oldValue) {
                if(newValue !== oldValue){
                    if($rootScope.selectDropdown){
                        $scope.filterOption.keyword_search = '';
                    }
                }
            }, true);

            $scope.$watch('filterOption.exchangeHour', function(newValue, oldValue) {
                if(newValue !== oldValue){
                    if($rootScope.selectDropdown){
                        $scope.filterOption.create_start = '';
                        $scope.filterOption.create_end = '';
                        $scope.filterOption.create_date_range = '';
                    }
                }
            }, true);

            $scope.$watch('filterOption.rentDate', function(newValue, oldValue) {
                if(newValue !== oldValue){
                    if($rootScope.selectDropdown && newValue == undefined){
                        $scope.filterOption.start_date = '';
                        $scope.filterOption.end_date = '';
                    }
                }
            }, true);

            $scope.$watch('filterOption.payDate', function(newValue, oldValue) {
                if(newValue !== oldValue){
                    if($rootScope.selectDropdown){
                        $scope.filterOption.pay_start = '';
                        $scope.filterOption.pay_end = '';
                        $scope.filterOption.pay_date = '';
                    }
                }
            }, true);

            $scope.$watch('filterOption.statusObj', function(newValue, oldValue) {
                if(!newValue){
                    $scope.filterOption.statusObj = {};
                }
            }, true);

            $scope.$watch('roomTypes', function(newValue, oldValue) {
                if(newValue !== oldValue){
                    if($scope.selectedRoomType){
                        TransactionService.updateSearchParam('type', $scope.selectedRoomType.join('|'));
                    }else{
                        TransactionService.updateSearchParam('type', '');
                    }
                }
            }, true);

            $scope.$watch('channelList', function(newValue, oldValue) {
                if(newValue !== oldValue){
                    if($scope.selectedChannelType){
                        TransactionService.updateSearchParam('channel', $scope.selectedChannelType.join('|'));
                    }else{
                        TransactionService.updateSearchParam('channel', '');
                    }
                }
            }, true);

            $scope.$watch('currentAdmin', function(newValue) {
                if(newValue && newValue.user){
                    init();
                }
            }, true);
        };

        return ['$rootScope', '$scope', 'TransactionService', 'events', '$filter', 'CONF', '$location', '$cookies', '$translate', 'CurrentAdminService', 'utils', TransactionController];

    });

})(define);
