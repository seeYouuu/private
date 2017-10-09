/**
 *  Defines the DashboardController controller
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the DashboardController class with RequireJS
     */
    define([], function() {

        /**
         * @constructor
         */
        var DashboardController = function($rootScope, $scope, CurrentAdminService, DashboardService, $timeout, $filter, CONF, events, $location, $cookies) {
            $rootScope.crumbs = {first: '控制台'};
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.tabType = DashboardService.getSearchParam('tabType') ? DashboardService.getSearchParam('tabType') : 'office';
            $scope.timeItems = [];
            $scope.roomTypes = [];
            $scope.transferRooms = [];
            $scope.loaded = false;
            $scope.changedDate = false;
            $scope.today = new Date();
            $scope.pickedDate = {};
            $scope.pickoptions = {
                selectedDate: new Date(),
                startDay: $filter('date')($scope.today, 'yyyy-MM-dd'),
                endDay: $filter('date')($scope.today, 'yyyy-MM-dd'),
                startYear: '',
                endYear: ''
            };
            $scope.selectedDate = $scope.pickoptions.selectedDate;
            $scope.userOptions = [];
            $scope.popoverType = 'preorder';
            $scope.calendarOptions = {
                date: new Date(),
                year: new Date()
            };
            $scope.orderParam = {
                start_date: '',
                discount_price: '',
                times: {
                    start: '',
                    end: ''
                }
            }
            $scope.users = {
                list: [],
                query: {},
                select: {}
            };
            $scope.menuState = {
                show: false,
                input_visb: false,
                origin_price: false
            };
            $scope.clock = DashboardService.getClockList();
            $scope.placeholder = {
                startTime: '起始时间',
                endTime: '结束时间',
                selectBuilding: '选择社区',
                all: '全部'
            };
            $scope.filterOption = {};
            $scope.roomStatus = [
                {name: '上架', value: '1'},
                {name: '下架', value: '0'}
            ];

            var initParams = function(){
                $scope.hourOrderParam = {
                    start_date: '',
                    discount_price: '',
                    times: {
                        start: '',
                        end: ''
                    }
                };
                $scope.dayOrderParam = {
                    start_date: '',
                    discount_price: '',
                    end_date: ''
                };
                $scope.weekOrderParam = {
                    start_date: '',
                    discount_price: '',
                    end_date: '',
                    rent_period: ''
                };
                $scope.monthOrderParam = {
                    start_date: '',
                    discount_price: '',
                    end_date: '',
                    rent_period: ''
                };
            };

            initParams();

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var formatDateForHour = function(date){
                return {
                    year: $filter('date')(date, 'yyyy') * 1,
                    month: $filter('date')(date, 'M') * 1,
                    day: $filter('date')(date, 'd') * 1,
                    hour: $filter('date')(date, 'H') * 1,
                    minute: $filter('date')(date, 'm') * 1,
                    second: $filter('date')(date, 's') * 1
                };
            };

            var isNumber = function(param){
                var re = /^[\+]?\d+(?:\.\d{0,2})?$/;
                var flag = re.test(param) ? true: false;
                return flag;
            };

            var testText = function(val){
                var reg = new RegExp('[\\u4E00-\\u9FFF]+','g');
                return reg.test(val);
            };

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg
                });
            };

            var showReserveDlg = function(){
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'pureReverseTpl'
                });
            };

            var validParams = function(param, msg){
                if(param){
                    noty('error', msg);
                    return false;
                }
                return true;
            };

            var getFilterParams = function(){
                DashboardService.getSearchParam('query') ? $scope.filterOption.query = DashboardService.getSearchParam('query') : '';
                DashboardService.getSearchParam('building') ? $scope.filterOption.building = DashboardService.getSearchParam('building') : '';
                DashboardService.getSearchParam('visible') ? $scope.filterOption.statusObj = _.find($scope.roomStatus, function(item){return item.value == DashboardService.getSearchParam('visible')}): '';
                DashboardService.getSearchParam('visible') ? $scope.filterOption.visible = DashboardService.getSearchParam('visible'): '';
            };

            var initFilterParams = function(){
                $scope.filterOption.buildingObj ? $scope.filterOption.building = $scope.filterOption.buildingObj.id : '';
                $scope.filterOption.statusObj !== undefined ? $scope.filterOption.visible = $scope.filterOption.statusObj.value : $scope.filterOption.visible = '';
                var cache = _.pick($scope.filterOption, 'query', 'building', 'visible');
                // var cache = _.pick($scope.filterOption, 'query');
                return cache;
            };

            $scope.searchList = function(){
                var params = initFilterParams();
                for(var key in params){
                    DashboardService.updateSearchParam(key, params[key]);
                }
            };

            $scope.clearSearchFilters = function(){
                $scope.filterOption = {};
                _.each($location.search(), function(value, key){
                    key != 'tabType' ? DashboardService.updateSearchParam(key, '') : '';
                });
            };

            var getBuildings = function(){
                DashboardService.getBuildings().success(function(data){
                    $scope.buildingsList = data;
                    if($scope.tabType !== 'membership_card'){
                        $scope.filterOption.buildingObj = $scope.buildingsList[0];
                    }
                    DashboardService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildingsList, function(item){return item.id == DashboardService.getSearchParam('building')}): '';
                    getUsages();
                });
            };

            var filterOrders = function(room){
                var today = formatDateForHour($scope.pickoptions.selectedDate),
                    roomStart = formatDateForHour(room.product.start_hour),
                    todayRoomStart = new Date(today.year,today.month - 1,today.day,roomStart.hour,roomStart.minute,roomStart.second);
                room.orders = _.filter(room.orders, function(order){return new Date(order.end_date).getTime() != todayRoomStart.getTime()});
            };

            var getUsages = function(){
                $scope.loaded = false;
                getFilterParams();
                var params = initFilterParams();
                params = _.pick(params, function(value){return value !== ''});
                params.room_type = $scope.tabType;
                params.start = $scope.pickoptions.startDay;
                params.end = $scope.pickoptions.endDay;
                DashboardService.getUsages(params).success(function(data){
                    $scope.rooms = data;
                    if($scope.tabType == 'membership_card'){
                        _.each($scope.rooms, function(room){
                            _.each(room.orders, function(order, index){
                                order.pos = index;
                            });
                            room.date = new Date();
                            var prices = _.pluck(room.card.specification, 'price');
                            if(prices.length > 0){
                                room.card.min_price = _.min(prices);
                                room.card.max_price = _.max(prices);
                            }else{
                                room.card.min_price = 0;
                                room.card.max_price = 0;
                            }
                        });
                        $scope.transferRooms = angular.copy($scope.rooms);
                    }else{
                        var users = [],customers = [];
                        _.each($scope.rooms, function(room, $index){
                            room.index = $index;
                            room.date = new Date();
                            filterOrders(room);
                            _.each(room.orders, function(order){
                                if(order.user){
                                    order.appointed_user ? users.push(order.appointed_user) : users.push(order.user);
                                }else{
                                    order.customer_id ? customers.push(order.customer_id): '';
                                }
                                order.allowed_people = room.product.allowed_people;
                            });
                            var prices = _.pluck(room.product.leasing_sets, 'base_price');
                            if(prices.length > 0 && prices[0] !== undefined){
                                room.product.min_price = _.min(prices);
                                room.product.max_price = _.max(prices);
                            }else{
                                room.product.min_price = 0;
                                room.product.max_price = 0;
                            }
                        });
                        users = _.uniq(users);
                        customers = _.uniq(customers);
                        if(users.length > 0){
                            getUsers({'user_id[]': users,'id[]': customers})
                        }else if(users.length <= 0){
                            if($scope.timeType == 'day'){
                                formatePos();
                            }
                            $scope.transferRooms = angular.copy($scope.rooms);
                        }
                    }
                    $timeout(function() {
                        $scope.loaded = true;
                    }, 500);
                });
            };

            var formateTypes = function(types){
                _.each(types, function(type){
                    type.name === 'meeting' || type.name === 'others' ? type.unit = 'hour' : type.unit = 'month';
                })
                $scope.timeType = _.find($scope.roomTypes, function(room){return room.name == $scope.tabType}) ? _.find($scope.roomTypes, function(room){return room.name == $scope.tabType}).unit: $scope.roomTypes[0].unit;
            };

            var getRoomType = function(){
                $scope.loaded = false;
                DashboardService.getRoomTypes().success(function(data){
                    $scope.roomTypes = data;
                    $scope.tabType = DashboardService.getSearchParam('tabType') ? DashboardService.getSearchParam('tabType') : $scope.roomTypes[0].name;
                    if($scope.permissionMenu && $scope.permissionMenu.membership){
                        $scope.roomTypes = $scope.roomTypes.concat([{
                            name: 'membership_card',
                            description: '会员卡'
                        }]);
                    }
                    formateTypes($scope.roomTypes);
                    getTimeType();
                    foamateSelectedDate();
                    getBuildings();
                    $scope.loaded = true;
                });
            };

            var initPreorderDate = function(item, half){
                if($scope.timeType == 'hour' && half == 'endHalf'){
                    $scope.orderParam.start_date = $filter('date')($scope.pickoptions.selectedDate, 'yyyy-MM-dd');
                    $scope.orderParam.times = {
                        start: {
                            name: item.name - 1 + ':30:00'
                        }
                    };
                }else if($scope.timeType == 'hour' && half != 'endHalf'){
                    $scope.orderParam.start_date = $filter('date')($scope.pickoptions.selectedDate, 'yyyy-MM-dd');
                    $scope.orderParam.times = {
                        start: {
                            name: item.name - 1 + ':00:00'
                        }
                    };
                }
            };

            var getDateInfo = function(item, type, start_date, end_date){
                $scope.dateInfo =[];
                var params = {};
                if(item.unit_price == 'hour'){
                    params.rent_date = start_date ? formatDate(start_date, 'yyyy-MM-dd') : formatDate($scope.calendarOptions.start, 'yyyy-MM-dd');
                }else if(item.unit_price == 'day'){
                    params.month_start = start_date ? formatDate(start_date, 'yyyy-MM-dd') : formatDate($scope.calendarOptions.start, 'yyyy-MM-dd');
                    params.month_end = end_date ? formatDate(end_date, 'yyyy-MM-dd') : formatDate($scope.calendarOptions.end, 'yyyy-MM-dd');
                }else if(item.room.type == 'fixed'){
                    params.seat_id = $scope.selectedSeat;
                }
                DashboardService.getDateInfo(item.id, params).success(function(data){
                    $scope.dateInfo = data;
                });
                $scope.calendarOptions.id = item.id;
                $scope.calendarOptions.type = type;
            };

            var setBasePrice = function(item){
                _.each(item.leasing_sets, function(set){
                    set.input_visb = false;
                    if(set.unit_price === 'hour'){
                        $scope.hourOrderParam.base_price = set.base_price;
                    }else if(set.unit_price === 'day'){
                        $scope.dayOrderParam.base_price = set.base_price;
                    }else if(set.unit_price === 'month'){
                        $scope.monthOrderParam.base_price = set.base_price;
                    }else if(set.unit_price === 'week'){
                        $scope.weekOrderParam.base_price = set.base_price;
                    }
                });
            };

            var getProductDetail = function(id){
                DashboardService.getProductDetail(id).success(function(data){
                    $scope.productItem = data;
                    setBasePrice($scope.productItem);
                    $scope.productItem.detail_unit = $scope.productItem.unit_price;
                    $scope.productItem.earliest_rent_date = formatDate($scope.productItem.earliest_rent_date, 'yyyy-MM-dd');
                });
            };

            var getPermissionMap = function(){
                DashboardService.getPermissionMap().success(function(data){
                    $scope.permissionMenu = {};
                    _.each(data, function(item){
                        $scope.permissionMenu[item.key] = true;
                    });
                    platformSet();
                    $scope.changedDate = true;
                });
            };

            var getRentPeriod = function(type){
                var start, end;
                if(type === 'hour'){
                    if($scope.hourOrderParam.times.start === '' || $scope.hourOrderParam.times.end === ''){
                        return;
                    }
                    start = $scope.hourOrderParam.times.start.name.split(':');
                    end = $scope.hourOrderParam.times.end.name.split(':');
                    $scope.hourOrderParam.rent_period = ((parseInt(end[0]*60) + parseInt(end[1]))-(parseInt(start[0]*60) + parseInt(start[1]))) / 60;
                }else if(type === 'day'){
                    if($scope.dayOrderParam.start_date === '' || $scope.dayOrderParam.end_date === ''){
                        return;
                    }
                    start = new Date($scope.dayOrderParam.start_date);
                    end = new Date(formatDate($scope.dayOrderParam.end_date,'yyyy-MM-dd'));
                    $scope.dayOrderParam.rent_period = Math.round(Math.abs(end - start) / 1000 / 60 / 60 /24)+1;
                }
            };

            var getOrderParam = function(type){
                var params = {};
                if(type === 'hour'){
                    params = $scope.hourOrderParam;
                }else if(type === 'day'){
                    params = $scope.dayOrderParam;
                }else if(type === 'week'){
                    params = $scope.weekOrderParam;
                }else{
                    params = $scope.monthOrderParam;
                }
                return params;
            };

            var validation = function(type){
                var validationFlag = true;
                var params = getOrderParam(type);
                if($scope.dialogType === 'preorder'){
                    validationFlag = validationFlag ? validParams(!$scope.users.select.id, '请选择使用者！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!params.start_date, '请选择开始日期！') : validationFlag;
                    validationFlag = validationFlag ? validParams(params.discount_price && !isNumber(params.discount_price), '请输入正确价格！') : validationFlag;
                }
                if(type === 'month'){
                    validationFlag = validationFlag ? validParams(!params.rent_period, '请选择租用时间！') : validationFlag;
                }else if(type === 'hour'){
                    validationFlag = validationFlag ? validParams(!params.times.start, '请选择开始时间！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!params.times.end, '请选择结束时间！') : validationFlag;
                    validationFlag = validationFlag ? validParams(params.rent_period < 0, '结束时间应该大于开始时间！') : validationFlag;
                }else if(type === 'day'){
                    validationFlag = validationFlag ? validParams(!params.end_date, '请选择结束日期！') : validationFlag;
                    validationFlag = validationFlag ? validParams(params.end_date < params.start_date, '结束时间应该大于开始时间！') : validationFlag;
                }else if(type === 'week'){
                    validationFlag = validationFlag ? validParams(!params.rent_period, '请选择租用时长！') : validationFlag;
                }
                return validationFlag;
            };

            var mergeSameDate = function(orders){
                var key = {},
                    result = [];
                for (var i = 0; i < orders.length; i++) {
                    if(orders[i].date && !key[orders[i].date]){
                        key[orders[i].date] = {};
                        key[orders[i].date].date = orders[i].date;
                        key[orders[i].date]['users'] = [];
                        key[orders[i].date]['users'] = key[orders[i].date]['users'].concat(orders[i].users);
                        key[orders[i].date]['allowed_people'] = orders[i].allowed_people;
                    }else if(key[orders[i].date]){
                        if(orders[i].date == key[orders[i].date].date){
                            key[orders[i].date]['users'] = key[orders[i].date]['users'].concat(orders[i].users);
                            key[orders[i].date]['allowed_people'] = orders[i].allowed_people;
                        }
                    }
                }
                for (var item in key) {
                    result.push(key[item]);
                }
                return result;
            };

            var getPayChannel = function(channel){
                switch(channel){
                    case 'wx' :
                        return '微信支付';
                    case 'upacp' :
                        return '银联支付';
                    case 'alipay' :
                        return '支付宝';
                    case 'account' :
                        return '余额支付';
                    case 'offline' :
                        return '线下汇款';
                    case 'wx_pub' :
                        return '微信公众号';
                    default: 
                        return '';
                }
            };

            var formateUser = function(cache, order){
                order['users'] = [];
                cache.pay_channel = order.pay_channel;
                cache.pay_channel_des = getPayChannel(order.pay_channel);
                cache.status = order.status;
                cache.type = order.type;
                cache.order_id = order.order_id;
                order['users'].push(cache);
            };

            var getUsers = function(params){
                DashboardService.getCustomerUsers(params).success(function(data){
                    _.each(data, function(item){
                        item.avatar = item.avatar ? item.avatar : CONF.file + '/person/' + item.id + '/avatar_small.jpg';
                        item.account = item.phone ? item.phone : item.email;
                        $scope.userOptions[item.id] = item;
                        _.each($scope.rooms, function(room){
                            _.each(room.orders, function(order){
                                var cache = angular.copy(item);
                                if(order.appointed_user){
                                    if(order.appointed_user == cache.id){
                                       formateUser(cache, order);
                                    }
                                }else{
                                    if(order.user == cache.user_id || order.customer_id == cache.id){
                                        formateUser(cache, order);
                                    }
                                }
                            });
                            room.uses = mergeSameDate(room.orders);
                            room.poses = [];
                            _.each($scope.timeItems, function(time, index){
                                _.each(room.uses, function(u){
                                    if(u.date == time.date){
                                        u.pos = index;
                                        room.poses.push({pos: index,nums: u.users.length});
                                    }
                                });
                            })
                            var poses = _.pluck(room.poses, 'pos');
                            for (var i = 0; i < 7; i++) {
                                if(!_.contains(poses, i)){
                                    room.poses.push({pos: i,nums: 0});
                                }
                            }
                            room.uses = _.filter(room.uses, function(use){return 'pos' in use});
                        });
                    });
                    $scope.transferRooms = angular.copy($scope.rooms);
                });
            };

            var formatePos = function(){
                _.each($scope.rooms, function(room){
                    room.poses = [];
                    for (var i = 0; i < 7; i++) {
                        room.poses.push({pos: i,nums: 0});
                    }
                })
            };

            var getTimeType = function(){
                var date = new Date();
                if($scope.timeType == 'month'){
                    $scope.timeItems = [{name: '一月',num:1},{name: '二月',num:2},{name: '三月',num:3},{name: '四月',num:4},{name: '五月',num:5},{name: '六月',num:6},{name: '七月',num:7},{name: '八月',num:8},{name: '九月',num:9},{name: '十月',num:10},{name: '十一月',num:11},{name: '十二月',num:12}];
                    if($scope.selectedDate.getFullYear() < $scope.today.getFullYear()){
                        _.each($scope.timeItems, function(time){
                            time.disabled = true;
                        });
                    }else if($scope.selectedDate.getFullYear() == $scope.today.getFullYear()){
                        _.find($scope.timeItems, function(time){
                            time.num - 1 < $scope.today.getMonth() ? time.disabled = true : '';
                            time.num == date.getMonth() + 1 ? time.isNow = true : '';
                        });
                    }
                }else if($scope.timeType == 'day'){
                    $scope.timeItems = [{name: '周日',num: 1},{name: '周一',num: 2},{name: '周二',num: 3},{name: '周三',num: 4},{name: '周四',num: 5},{name: '周五',num: 6},{name: '周六',num: 7}];
                    var weekStart = new Date($scope.today.getFullYear(),$scope.today.getMonth(),$scope.today.getDate()).getTime() - $scope.today.getDay() * 1000 * 3600 * 24,
                        weekEnd = weekStart + 7 * 1000 * 3600 *24;
                    if($scope.selectedDate.getTime() < weekStart){
                        _.each($scope.timeItems, function(time){
                            time.disabled = true;
                        });
                    }else if($scope.selectedDate.getTime() > weekStart && $scope.selectedDate.getTime() < weekEnd){
                        _.each($scope.timeItems, function(time){
                            time.num <= $scope.today.getDay() ? time.disabled = true : '';
                            time.num == date.getDay() + 1 ? time.isNow = true : '';
                        });
                    }
                }else if($scope.timeType == 'hour'){
                    $scope.timeItems = [{name: 1},{name: 2},{name: 3},{name: 4},{name: 5},{name: 6},{name: 7},{name: 8},{name: 9},{name: 10},{name: 11},{name: 12},{name: 13},{name: 14},{name: 15},{name: 16},{name: 17},{name: 18},{name: 19},{name: 20},{name: 21},{name: 22},{name: 23},{name: 24}];
                    if($scope.selectedDate && $scope.selectedDate.getFullYear() == $scope.today.getFullYear() && $scope.selectedDate.getMonth() == $scope.today.getMonth() && $scope.selectedDate.getDate() == $scope.today.getDate()){
                        _.each($scope.timeItems, function(time){
                            if(time.name < date.getHours() + 1){
                                time.disabled = true;
                                time.name == date.getHours() ? time.isNow = true : '';
                            }else if(time.name == date.getHours() + 1){
                                date.getMinutes() >= 30 ? time.passedHalf = true : '';
                            }
                        });
                    }else if($scope.selectedDate && $scope.selectedDate.getTime() < $scope.today.getTime() && $scope.selectedDate.getDate() != $scope.today.getDate()){
                        _.each($scope.timeItems, function(time){
                            time.disabled = true;
                        });
                    }
                }
            };

            var getDatesOfWeek = function(index){
                var start = new Date($scope.pickoptions.startDay),
                    day = new Date(start.getTime() + 1000 * 3600 * 24 * index);
                return $filter('date')(day, 'yyyy-MM-dd');
            };

            var foamateSelectedDate = function(){
                if($scope.timeType == 'day'){
                    if($scope.pickoptions.selectedDate.getDay() == 0){
                        $scope.pickoptions.startDay = $filter('date')($scope.pickoptions.selectedDate, 'yyyy-MM-dd');
                        $scope.pickoptions.endDay = $filter('date')(new Date($scope.pickoptions.selectedDate.getTime() + 6 * 1000 * 3600 * 24), 'yyyy-MM-dd');
                    }else if($scope.pickoptions.selectedDate.getDay() == 6){
                        $scope.pickoptions.endDay = $filter('date')($scope.pickoptions.selectedDate, 'yyyy-MM-dd');
                        $scope.pickoptions.startDay = $filter('date')(new Date($scope.pickoptions.selectedDate.getTime() - 6 * 1000 * 3600 * 24), 'yyyy-MM-dd');
                    }else if($scope.pickoptions.selectedDate.getDay() < 6 && $scope.pickoptions.selectedDate.getDay() > 0){
                        var end = $scope.pickoptions.selectedDate.getTime() + (6 - $scope.pickoptions.selectedDate.getDay()) * 1000 * 3600 * 24,
                            start = $scope.pickoptions.selectedDate.getTime() - $scope.pickoptions.selectedDate.getDay() * 1000 * 3600 * 24;
                        $scope.pickoptions.startDay = $filter('date')(new Date(start), 'yyyy-MM-dd');
                        $scope.pickoptions.endDay = $filter('date')(new Date(end), 'yyyy-MM-dd');
                    }
                    $scope.pickoptions.startYear = $filter('date')($scope.pickoptions.startDay, 'yyyy');
                    $scope.pickoptions.endYear = $filter('date')($scope.pickoptions.endDay, 'yyyy');
                    _.each($scope.timeItems, function(time, index){
                        time.date = getDatesOfWeek(index);
                        time.date_show = time.date.slice(5);
                    });
                }else if($scope.timeType == 'hour'){
                    $scope.pickoptions.startDay = $filter('date')($scope.pickoptions.selectedDate, 'yyyy-MM-dd');
                    $scope.pickoptions.endDay = $filter('date')($scope.pickoptions.selectedDate, 'yyyy-MM-dd');
                }else if($scope.timeType == 'month'){
                    $scope.pickoptions.startDay = $scope.selectedDate.getFullYear() + '-01-01';
                    $scope.pickoptions.endDay = $scope.selectedDate.getFullYear() + '-12-31';
                }
            };

            var removeNode = function(ele){
                ele.parentNode.removeChild(ele);
            };

            var destoryDom = function(){
                var _className = $scope.type == 'day' ? '.pink-block' : '.cover',
                    pinks = document.querySelectorAll(_className);
                for (var i = 0; i < pinks.length; i++) {
                    removeNode(pinks[i]);
                }
            };

            var removeDivider = function(){
                var dividers = document.querySelectorAll('.divider'),
                    dot = document.querySelectorAll('.dot-wrapper');
                if(dividers){
                    for (var i = 0; i < dividers.length; i++) {
                        removeNode(dividers[i]);
                    }   
                }
                if(dot){
                    for (var j = 0; j < dot.length; j++) {
                        removeNode(dot[j]);
                    }   
                }
            };

            var platformSet = function(){
                var params = {platform: 'sales', sales_company_id: $cookies.get('salesCompanyId')};
                DashboardService.setCookies(params).success(function(){
                    getRoomType();
                });
            };

            var init = function(){
                getPermissionMap();
                // $timeout(function() {
                //     $scope.changedDate = true;
                // }, 500);
            };

            init();

            $scope.showSeats = function(room){
                room.unfolded = !room.unfolded;
            };

            document.addEventListener('click', function(e){
                var pop = document.querySelectorAll('.dash-pop');
                if(pop.length > 0 && (!e.target.classList.contains('pre-pop') && !e.target.classList.contains('clicked'))){
                    removeNode(pop[0]);
                }
            });

            document.addEventListener('touchstart', function(e){
                var pop = document.querySelector('.dash-pop');
                if(pop && e.target.className != 'pre-pop'){
                    removeNode(pop);
                }
            });

            window.seePreorder = function(){
                $scope.seePreorder('preorder');
                var pop = document.querySelector('.dash-pop');
                removeNode(pop);
            };

            window.seeReserve = function(){
                $scope.seePreorder('reserve');
                var pop = document.querySelector('.dash-pop');
                removeNode(pop);
            };

            $scope.clicked = function(e, index, itemIndex, room, item, half){
                initParams();
                var div = document.createElement('div'),
                    winHeight = window.innerHeight,
                    restHeight = winHeight - 323,
                    allShow = false,
                    boxWidth = 0;
                if($scope.timeType == 'month'){
                    boxWidth = 8.33;
                }else if($scope.timeType == 'day'){
                    boxWidth = 14.285;
                }else if($scope.timeType == 'hour'){
                    boxWidth = 4.166;
                }
                div.classList.add('dash-pop');
                if(restHeight > ($scope.rooms.length + 1) * 80){
                    allShow = true;
                }
                var clicks = document.querySelector('.clicked');
                if(clicks){
                    clicks.classList.remove('clicked');
                    return false;
                }
                e.target.classList.add('clicked');
                getProductDetail(room.product.id);
                initPreorderDate(item, half);

                !allShow && index == $scope.rooms.length - 1? div.classList.add('last-line') : '';
                div.innerHTML = '<ul><li class="pre-pop" onclick="seePreorder()">推送空间订单</li><li class="pre-pop" onclick="seeReserve()">设置内部占用</li></ul>';
                div.style.right = ($scope.timeItems.length - 1 - itemIndex) * boxWidth + '%';
                if($scope.timeType == 'hour'){
                    e.target.parentNode.parentNode.parentNode.parentNode.appendChild(div);
                }else{
                    e.target.parentNode.parentNode.parentNode.appendChild(div);
                }
                var pops = document.querySelectorAll('.pre-pop');
                pops[0].addEventListener('touchend', function(){
                    window.seePreorder();
                });
                pops[1].addEventListener('touchend', function(){
                    window.seeReserve();
                });
            };

            $scope.changeTime = function(tag){
                $scope.rooms = [];
                $scope.transferRooms = [];
                $scope.timeType = tag;
                getTimeType();
                foamateSelectedDate();
                getUsages();
                removeDivider();
            };

            $scope.selectProduct = function(room){
                $scope.selectedRoom = room;
            };

            $scope.switchTab = function(tag){
                removeDivider();
                DashboardService.updateSearchParam('tabType', tag);
            };

            $scope.seeProductDetail = function(room){
                window.location.assign(CONF.bizbase + 'space?ptype=spaceDetail&roomId=' + room.product.room_id + '&productId=' + room.product.id);
            };

            $scope.seeCardDetail = function(room){
                window.location.assign(CONF.bizbase + 'membership?pageType=detail&cardId=' + room.card.id);
            };

            $scope.changePrice = function(){
                $scope.menuState.input_visb = !$scope.menuState.input_visb;
            };

            $scope.selectSeat = function(item, tag){
                $scope.selectedSeat = item.id;
                $scope.productItem.base_price = item.base_price;
                _.each($scope.productItem.room.fixed, function(seat){
                    seat.selected = false;
                });
                item.selected = true;
            };

            $scope.blockInput = function(e){
               e.preventDefault();
            };

            $scope.getDate = function(item, type, timeType){
                $scope.popoverType = $scope.dialogType;
                $scope.calendarOptions.timeType = timeType;
                getDateInfo(item, type);
            };

            $scope.changeDate = function(tag){
                destoryDom();
                removeDivider();
                if($scope.timeType == 'hour'){
                    var dayLength = 1000 * 60 * 60 * 24,
                        selectedTime = $scope.pickoptions.selectedDate.getTime();
                    $scope.pickoptions.selectedDate = tag == 'prev' ? new Date(selectedTime - dayLength) : new Date(selectedTime + dayLength);
                }else if($scope.timeType == 'month'){
                    var year = $scope.pickoptions.selectedDate.getFullYear();
                    $scope.pickoptions.selectedDate = tag == 'prev' ? new Date(year - 1, 0, 1) : new Date(year + 1, 0, 1);
                }else if($scope.timeType == 'day'){
                    $scope.pickoptions.selectedDate = tag == 'prev' ? new Date($scope.pickoptions.selectedDate.getTime() - 7 * 1000 * 3600 * 24) : new Date($scope.pickoptions.selectedDate.getTime() + 6 * 1000 * 3600 * 24);
                }
                $scope.changedDate = true;
            };

            $scope.closedPicker = function(){
                removeDivider();
            };

            $scope.seePopover = function(tag, room, item, half){
                if(!room.product.visible){
                    noty('error', '该空间未上架，无法推送空间订单或设置内部占用!');
                    return false;
                }
                if(item.disabled){
                    noty('error', '无法从过去开始推送空间订单或设置内部占用!');
                    return false;
                }
                $scope.popoverType = tag;
            };

            $scope.seePreorder = function(tag){
                $scope.popoverType = tag;
                $scope.dialogType = tag;
                $scope.users.select = '';
                $scope.users.query = '';
                $scope.users.list = [];
                $scope.menuState.origin_price = false;
                $scope.menuState.input_visb = false;
                showReserveDlg();
            };

            $scope.searchUser = _.debounce(function(){
                if($scope.users.query.key){
                    var params = {
                        // pageLimit: CONF.pageSize, 
                        // pageIndex: 1,
                        query: $scope.users.query.key
                    };
                    DashboardService.searchUser(params).success(function(data){
                        var cache = {};
                        if(data.length > 0){
                            cache = _.find(data, function(item){return item.email === params.query || item.phone === params.query});
                            if(cache){
                                cache.avatar = CONF.file + '/person/' + cache.id + '/avatar_small.jpg';
                                cache.positionList = angular.copy($scope.positions);
                                $scope.users.select = cache;
                            }
                        }else{
                            noty('error', '未搜索到该用户！');
                        }
                    });
                }else{
                    $scope.users.list = [];
                }
            }, 300);

            $scope.reSearch = function(){
                $scope.users.select = null;
            };

            $scope.changePrice = function(set){
                set.input_visb = !set.input_visb;
            };

            $scope.spacePreorder = function(set,$hide){
                $scope.validationFlag = validation(set.unit_price);
                var orderParam = getOrderParam(set.unit_price);
                if($scope.validationFlag){
                    var params = {
                        product_id: $scope.productItem.id,
                        user_id: $scope.users.select.id,
                        time_unit: set.unit_price,
                        start_date: set.unit_price == 'hour' ? (formatDate(new Date(orderParam.start_date), 'yyyy-MM-dd') + ' ' + orderParam.times.start.name) : formatDate(orderParam.start_date, 'yyyy-MM-dd'),
                        rent_period: orderParam.rent_period,
                        price: set.base_price * orderParam.rent_period,
                        discount_price: orderParam.discount_price && orderParam.origin_price ? orderParam.discount_price : set.base_price * orderParam.rent_period
                    };
                    if(set.unit_price == 'day' && ($scope.productItem.room.type === 'meeting' || $scope.productItem.room.type === 'others')){
                        // params.start_date = formatDate(new Date(orderParam.start_date), 'yyyy-MM-dd') + ' ' + formatDate(new Date($scope.productItem.room.meeting[0].start_hour), 'hh:mm:ss');
                        params.start_date = formatDate(new Date(orderParam.start_date), 'yyyy-MM-dd') + ' 00:00:00';
                    }
                    DashboardService.spacePreorder(params).success(function(data){
                        $hide();
                        initParams();
                        $scope.order_id = data.order_id;
                        $scope.dialogType = 'confTips';
                        showReserveDlg();
                        getUsages();
                    }).error(function(data){
                        if(data.code === 409){
                            noty('error', '推送空间订单时间冲突');
                        }else if(data.code === 400021){
                            noty('error', '您所选的时间段内房间不开放');
                        }else if(data.code === 400022){
                            noty('error', '您所选的时间段商品已下架');
                        }else{
                            noty('error', '推送空间订单失败');
                        }
                     });
                }
            };

            $scope.spaceReserve = function(set, $hide){
                $scope.validationFlag = validation(set.unit_price);
                var orderParam = getOrderParam(set.unit_price);
                if($scope.validationFlag){
                    var params = {
                        product_id: $scope.productItem.id,
                        time_unit: set.unit_price,
                        start_date: set.unit_price == 'hour' ? (formatDate(new Date(orderParam.start_date), 'yyyy-MM-dd') + ' ' + orderParam.times.start.name) : formatDate(orderParam.start_date, 'yyyy-MM-dd'),
                        rent_period: orderParam.rent_period
                    };
                    if(set.unit_price == 'day' && ($scope.productItem.room.type === 'meeting' || $scope.productItem.room.type === 'others')){
                        params.start_date = formatDate(new Date(orderParam.start_date), 'yyyy-MM-dd') + ' ' + formatDate(new Date($scope.productItem.room.meeting[0].start_hour), 'hh:mm:ss');
                    }
                    DashboardService.spaceReserve(params).success(function(data){
                        $hide();
                        $scope.order_id = data.order_id;
                        $scope.dialogType = 'confTips';
                        showReserveDlg();
                        getUsages();
                    }).error(function(data){
                        if(data.code === 409){
                            noty('error', '设置内部占用时间冲突');
                        }else if(data.code === 400021){
                            noty('error', '您所选的时间段内房间不开放');
                        }else if(data.code === 400022){
                            noty('error', '您所选的时间段商品已下架');
                        }else{
                            noty('error', '设置内部占用失败');
                        }
                    });
                }
            };

            $scope.generateLeases = function(productId, hide){
                _.each($location.search(), function(value, key){
                    DashboardService.updateSearchParam(key, '');
                });
                hide ? hide() : '';
                $location.path('/trade');
                $location.search('tabtype', 'longrent');
                $location.search('ptype', 'createAgreement');
                $location.search('productId', productId);
            };

            $scope.$watch('filterOption.buildingObj', function(newValue, oldValue) {
                if(!newValue){
                    $scope.filterOption.building = '';
                }
            }, true);
            
            $scope.$watch('dayOrderParam.start_date', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                testText(newValue) ? $scope.dayOrderParam.start_date = '' : '';
                getRentPeriod('day');
            }, true);

            $scope.$watch('dayOrderParam.end_date', function(newValue, oldValue) {
                newValue && newValue !== oldValue ? getRentPeriod('day') : '';
                testText(newValue) ? $scope.dayOrderParam.end_date = '' : '';
            }, true);

            $scope.$watch('hourOrderParam.start_date', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                testText(newValue) ? $scope.hourOrderParam.start_date = '' : '';
                getRentPeriod('hour');
            }, true);

            $scope.$watch('hourOrderParam.end_date', function(newValue, oldValue) {
                newValue && newValue !== oldValue ? getRentPeriod('hour') : '';
                testText(newValue) ? $scope.hourOrderParam.end_date = '' : '';
                $scope.productItem && $scope.productItem.leasing_sets ? _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'day' ? set.rent_period = true : ''}) : '';
            }, true);

            $scope.$watch('hourOrderParam.rent_period', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(isNaN($scope.hourOrderParam.rent_period)){
                    $scope.hourOrderParam.rent_period = '';
                }
                $scope.menuState.origin_price = false;
                _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'hour' ? set.rent_period = true : ''});
            }, true);

            $scope.$watch('weekOrderParam.rent_period', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(isNaN($scope.weekOrderParam.rent_period)){
                    $scope.weekOrderParam.rent_period = '';
                }
                $scope.menuState.origin_price = false;
                _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'week' ? set.rent_period = true : ''});
            }, true);

            $scope.$watch('monthOrderParam.rent_period', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(isNaN($scope.monthOrderParam.rent_period)){
                    $scope.monthOrderParam.rent_period = '';
                }
                $scope.menuState.origin_price = false;
                _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'month' ? set.rent_period = true : ''});
            }, true);

            $scope.$watch('hourOrderParam.times.start', function(newValue, oldValue) {
                newValue && newValue !== oldValue ? getRentPeriod('hour') : '';
            }, true);

            $scope.$watch('hourOrderParam.times.end', function(newValue, oldValue) {
                newValue && newValue !== oldValue ? getRentPeriod('hour') : '';
            }, true);

            $scope.$watch('hourOrderParam.discount_price', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.hourOrderParam.discount_price < $scope.hourOrderParam.base_price * $scope.hourOrderParam.rent_period){
                    $scope.hourOrderParam.origin_price = true;
                }
                if($scope.hourOrderParam.discount_price == ''){
                    $scope.hourOrderParam.origin_price = false;
                    _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'hour' ? set.input_visb = false : ''});
                }
            }, true);

            $scope.$watch('dayOrderParam.discount_price', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.dayOrderParam.discount_price < $scope.dayOrderParam.base_price * $scope.dayOrderParam.rent_period){
                    $scope.dayOrderParam.origin_price = true;
                }
                if($scope.dayOrderParam.discount_price == ''){
                    $scope.dayOrderParam.origin_price = false;
                    _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'day' ? set.input_visb = false : ''});
                }
            }, true);

            $scope.$watch('weekOrderParam.discount_price', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.weekOrderParam.discount_price < $scope.weekOrderParam.base_price * $scope.weekOrderParam.rent_period){
                    $scope.weekOrderParam.origin_price = true;
                }
                if($scope.weekOrderParam.discount_price == ''){
                    $scope.weekOrderParam.origin_price = false;
                    _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'week' ? set.input_visb = false : ''});
                }
            }, true);

            $scope.$watch('monthOrderParam.discount_price', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.monthOrderParam.discount_price < $scope.monthOrderParam.base_price * $scope.monthOrderParam.rent_period){
                    $scope.monthOrderParam.origin_price = true;
                }
                if($scope.monthOrderParam.discount_price == ''){
                    $scope.monthOrderParam.origin_price = false;
                    _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'month' ? set.input_visb = false : ''});
                }
            }, true);

            $scope.$watch('calendarOptions.start', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                getDateInfo($scope.productItem, $scope.calendarOptions.type, $scope.calendarOptions.start, $scope.calendarOptions.end);
            }, true);

            $scope.$watch('pickoptions.selectedDate', function(newValue, oldValue) {
                if($scope.changedDate){
                    $scope.selectedDate = new Date($scope.pickoptions.selectedDate);
                    getTimeType();
                    foamateSelectedDate();
                    getUsages();
                    removeDivider();
                }
            }, true);

            $scope.$watch('needRefresh', function(newValue, oldValue) {
                if(newValue){
                    getUsages();
                    $rootScope.needRefresh = false;
                }
            }, true);

            $scope.$on('$destroy', function() {});
        };

        return ['$rootScope', '$scope', 'CurrentAdminService', 'DashboardService', '$timeout', '$filter', 'CONF', 'events', '$location', '$cookies', DashboardController];

    });

})(define);
