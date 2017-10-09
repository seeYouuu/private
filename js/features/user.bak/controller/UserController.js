/**
 *  Defines the UserController controller
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function (define) {
    'use strict';
    /**
     * Register the UserController class with RequireJS
     */
    define(['lodash', 'angular'], function (_, angular) {
        /**
         * @constructor
         */
        var UserController = function ($rootScope, $scope, $cookieStore, events, utils, UserService, CurrentAdminService, $alert, FileUploader, CONF, $filter, $location) {
            
            $scope.pageType = UserService.getSearchParam('pageType') ? UserService.getSearchParam('pageType') : 'list';
            $scope.tabType = UserService.getSearchParam('tabtype') ? UserService.getSearchParam('tabtype') : 'userInfo';
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.invoiceStatus = UserService.getInvoiceStatus();
            $scope.invoiceType = UserService.getInvoiceType();
            $scope.appointmentOrderStatus = UserService.getAppointmentStatusDesc();
            $scope.agreementStatus = UserService.getAgreementStatusDesc();
            $scope.unitDesc = UserService.getUnitDesc();
            $scope.cardStatus = UserService.getCardStatus();
            $scope.keywordList = UserService.getKeywordList();
            $scope.certificateType = UserService.getCertificateType();
            $scope.cerTypeDesc = UserService.getTypeDesc();
            $scope.editOption = {};
            $scope.filterOption = {};
            $scope.userOptions = {};
            $scope.userInfoOptions = {};
            $scope.userInfo = {};
            $scope.roomTypeDesc = {};
            $scope.editFlag = false;
            $scope.now = new Date();
            $scope.placeholder = {
                all: '全部'
            };
            $scope.gender = [
                {
                    name: '男',
                    value: 'male'
                },
                {
                    name: '女',
                    value: 'female'
                }
            ];
            $scope.PERMISSION_KEY = 'sales.building.user';
            $scope.PERMISSION_SPACE_KEY = 'sales.building.order';
            $scope.PERMISSION_LEASES_KEY = 'sales.building.long_term_lease';
            $scope.PERMISSION_APPOINTMENT_KEY = 'sales.building.long_term_appointment';
            $scope.PERMISSION_EVENT_KEY = 'sales.platform.event_order';
            $scope.PERMISSION_INVOICE_KEY = 'sales.platform.invoice';
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: UserService.getSearchParam('pageIndex') ? parseInt(UserService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var getAddress = function(address){
                address = JSON.parse(address);
                var str = '';
                _.each(address.regions, function(item){
                    str += item.region.name;
                });
                return str;
            };

            var getOrderNumber = function(params){
                UserService.getOrderNumber(params).success(function(data){
                    _.each(data, function(item){
                        $scope.orderNumbers[item.id] = item;
                    });
                });
            };

            var getRoomType = function(){
                UserService.getRoomTypes().success(function(data){
                    $scope.roomTypes = data;
                    _.each($scope.roomTypes, function(item){
                        $scope.roomTypeDesc[item.name] = item;
                    });
                });
            };

            var formatProduct = function(order){
                _.each(order.shop_order_products, function(item){
                    item.price = 0;
                    item.other = '';
                    _.each(item.shop_order_product_specs, function(spec){
                        spec.shop_product_spec_info = JSON.parse(spec.shop_product_spec_info);
                        spec.shop_product_spec_info.spec.unit ? item.unit = spec.shop_product_spec_info.spec.unit: '';
                        _.each(spec.shop_order_product_spec_items, function(specItem){
                            specItem.amount ? item.amount = specItem.amount: '';
                            
                            specItem.shop_product_spec_item_info = JSON.parse(specItem.shop_product_spec_item_info);
                            if(specItem.shop_product_spec_item_info.price){
                                specItem.shop_product_spec_item_info.price = parseFloat(specItem.shop_product_spec_item_info.price);
                                item.price += specItem.shop_product_spec_item_info.price;
                            } 
                            if(specItem.amount && specItem.amount > 0){
                                item.inventory = specItem.shop_product_spec_item_info.item.name;
                            }else{
                                item.other = item.other ? item.other + ',' + specItem.shop_product_spec_item_info.item.name: specItem.shop_product_spec_item_info.item.name;
                            }
                        });
                    });
                    item.shop_product_info = JSON.parse(item.shop_product_info);
                });
                return order;
            };

            var getFilterParams = function(){
                UserService.getSearchParam('keyword') ? $scope.filterOption.keyword = UserService.getSearchParam('keyword') : '';
                UserService.getSearchParam('keyword_search') ? $scope.filterOption.keyword_search = UserService.getSearchParam('keyword_search') : '';
                UserService.getSearchParam('startDate') ? $scope.filterOption.startDate = UserService.getSearchParam('startDate') : '';
                UserService.getSearchParam('endDate') ? $scope.filterOption.endDate = UserService.getSearchParam('endDate') : '';
                UserService.getSearchParam('cardStatus') ? $scope.filterOption.cardStatus = UserService.getSearchParam('cardStatus') : '';
                UserService.getSearchParam('group') ? $scope.filterOption.group = UserService.getSearchParam('group') : '';
                UserService.getSearchParam('keyword') ? $scope.filterOption.keyword = _.find($scope.keywordList, function(item){return item.value == UserService.getSearchParam('keyword')}): '';
                UserService.getSearchParam('cardStatus') ? $scope.filterOption.cardStatusObj = _.find($scope.cardStatus, function(item){return item.value == UserService.getSearchParam('cardStatus')}): '';
                
            };

            var initFilterParams = function(){
                $scope.filterOption.keyword_search ? $scope.filterOption.keyword_search = $scope.filterOption.keyword_search : '';
                $scope.filterOption.startDate ? $scope.filterOption.startDate = formatDate($scope.filterOption.startDate, 'yyyy-MM-dd') : '';
                $scope.filterOption.endDate ? $scope.filterOption.endDate = formatDate($scope.filterOption.endDate, 'yyyy-MM-dd') : '';
                $scope.filterOption.groupObj ? $scope.filterOption.group = $scope.filterOption.groupObj.id : '';

                var cache = _.pick($scope.filterOption, 'keyword_search', 'dateType', 'startDate', 'endDate', 'group');
                $scope.filterOption.keyword ? cache.keyword = $scope.filterOption.keyword.value : '';
                $scope.filterOption.startDate || $scope.filterOption.endDate ? cache['dateType'] = 'bind_card_date' : '';
                $scope.filterOption.cardStatusObj ? cache[$scope.filterOption.cardStatusObj.key] = Number($scope.filterOption.cardStatusObj.value) : '';
                return cache;
            };

            var getUsers = function(params){
                UserService.getUsers(params).success(function(data){
                    _.each(data, function(item){
                        item.avatar = CONF.file + '/person/' + item.id + '/avatar_small.jpg';
                        $scope.userOptions[item.id] = item;
                    });
                });
            };

            var getUserAccount = function(params) {
                UserService.getUserAccount(params).success(function(data) {
                    $scope.userAccount = data;
                });
            };

            var getUserList = function(par) {
                getFilterParams();
                var params = initFilterParams();
                if(params.keyword) {
                    params[params.keyword] = params.keyword_search;
                    delete params.keyword;
                    delete params.keyword_search;
                }
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                par ? _.extend(params, par) : '';
                $scope.loaded = false;
                UserService.getUserList(params).success(function(data) {
                    $scope.userList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each($scope.userList, function(item) {
                        item.avatar = CONF.file + '/person/' + item.id + '/avatar_small.jpg';
                        arr.push(item.id);
                        var temp = _.groupBy(item.groups, 'type');
                        item.groups_desc = _.union(temp['card'], temp['add']);
                    })
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUserAccount({'ids': arr.join(',')}): '';
                    $scope.loaded = true;
                });
            };

            var getUserDetail = function() {
                UserService.getUserDetail(UserService.getSearchParam('userid')).success(function(data) {
                    data.avatar = CONF.file + '/person/' + data.id + '/avatar_small.jpg';
                    $scope.userItem = data;
                    $scope.userItem.commonGroups = _.filter($scope.userItem.groups, function(item) {return item.type == 'add'});
                    getUserAccount({'ids': data.id});
                });
            };

            var getGroups = function() {
                $scope.loaded = false;
                UserService.getGroups().success(function(data) {
                    $scope.groups = data;
                    _.each($scope.groups, function(item) {
                        item.building_desc = _.pluck(item.building, 'name').toString();
                    });
                    $scope.createdGroups = _.filter(data, function(item) {return item.type == 'created'});
                    UserService.getSearchParam('group') ? $scope.filterOption.groupObj = _.find($scope.groups, function(item){return item.id == UserService.getSearchParam('group')}): '';
                    $scope.loaded = true;
                });
            };

            var getGroupCount = function() {
                UserService.getGroupCount().success(function(data) {
                    $scope.groupCount = data;
                });
            };

            var getSpaceOrders = function() {
                var params = {
                    pageLimit: $scope.pageOptions.pageSize,
                    pageIndex: $scope.pageOptions.pageIndex,
                    user: UserService.getSearchParam('userid')
                };
                $scope.loaded = false;
                UserService.getSpaceOrders(params).success(function(data) {
                    $scope.spaceList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each($scope.spaceList, function(item){
                        if(formatDate(item.start_date, 'yyyy-MM-dd HH:mm:ss') > formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss')){
                            item.cancellable = true;
                        }
                        if(item.product_info){
                            item.product_info = JSON.parse(item.product_info);
                            if(item.product_info.room.type_tag !== 'dedicated_desk' && !item.product_info.base_price){
                                item.product_info.order.base_price = _.find(item.product_info.room.leasing_set, function(set){return set.unit_price === item.product_info.order.unit_price}).base_price;
                            }
                        }
                        arr.push(item.user_id);
                        arr.push(item.payment_user_id);
                        item.appointed ? arr.push(item.appointed) : '';
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.loaded = true;
                });
            };

            var getShopOrders = function() {
                var params = {
                    pageLimit: $scope.pageOptions.pageSize,
                    pageIndex: $scope.pageOptions.pageIndex,
                    user: UserService.getSearchParam('userid')
                };
                $scope.loaded = false;
                UserService.getShopOrders(params).success(function(data){
                    $scope.shopList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each($scope.shopList, function(order){
                        order = formatProduct(order);
                        _.each(order.linked_orders, function(item){
                            item = formatProduct(item);
                        });
                        arr.push(order.user_id);
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.loaded = true;
                });
            };

            var getEventOrders = function(){
                var params = {
                    pageLimit: $scope.pageOptions.pageSize,
                    pageIndex: $scope.pageOptions.pageIndex,
                    user: UserService.getSearchParam('userid')
                };
                $scope.loaded = false;
                UserService.getEventOrders(params).success(function(data){
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
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.loaded = true;
                });
            };

            var getRechargeOrders = function(){
                var params = {
                    pageLimit: $scope.pageOptions.pageSize,
                    pageIndex: $scope.pageOptions.pageIndex
                };
                $scope.loaded = false;
                UserService.getRechargeOrders(params, UserService.getSearchParam('userid')).success(function(data){
                    $scope.rechargeList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each($scope.rechargeList, function(recharge){
                        arr.push(recharge.user_id);
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.loaded = true;
                });
            };

            var getLeasesLists = function(){
                var params = {
                    pageLimit: $scope.pageOptions.pageSize,
                    pageIndex: $scope.pageOptions.pageIndex,
                    user: UserService.getSearchParam('userid')
                };
                $scope.loaded = false;
                UserService.getLeasesLists(params).success(function(data){
                    $scope.leasesList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each($scope.leasesList, function(lease){
                        arr.push(lease.supervisor);
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.loaded = true;
                });
            };

            var getAppointmentList = function(){
                var params = {
                    pageLimit: $scope.pageOptions.pageSize,
                    pageIndex: $scope.pageOptions.pageIndex,
                    user: UserService.getSearchParam('userid')
                };
                $scope.loaded = false;
                UserService.getAppointmentList(params).success(function(data){
                    $scope.appointmentList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each($scope.appointmentList, function(appointment){
                        arr.push(appointment.user_id);
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.loaded = true;
                });
            };

            var getInvoiceList = function(){
                var params = {
                    pageLimit: $scope.pageOptions.pageSize,
                    pageIndex: $scope.pageOptions.pageIndex,
                    user: UserService.getSearchParam('userid')
                };
                $scope.loaded = false;
                UserService.getInvoiceList(params).success(function(data){
                    $scope.invoiceList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    var ids = [];
                    var billIds = [];
                    _.each($scope.invoiceList, function(item){
                        item.region = getAddress(item.address);
                        item.address = JSON.parse(item.address);
                        item.invoice_profile = JSON.parse(item.invoice_profile);
                        item.order_id ? ids.push(item.order_id) : '';
                        item.bill_id ? billIds.push(item.bill_id) : '';
                        arr.push(item.user_id);
                    });
                    ids.length > 0 ? getOrderNumber({'ids[]': ids}): '';
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.loaded = true;
                });
            };

            var getMembershipList = function(){
                var params = {
                    pageLimit: $scope.pageOptions.pageSize,
                    pageIndex: $scope.pageOptions.pageIndex,
                    user: UserService.getSearchParam('userid')
                };
                UserService.getMembershipList(params).success(function(data){
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

            var getUserInfo = function() {
                $scope.loaded = false;
                UserService.getUserInfo(UserService.getSearchParam('userid')).success(function(data) {
                    $scope.loaded = true;
                    if(data) {
                        $scope.userInfo = data;
                        $scope.userInfoOptions = angular.copy(data);
                        delete $scope.userInfoOptions.company_name;
                        delete $scope.userInfoOptions.id_number;
                        $scope.userInfoOptions.companyName = data.company_name;
                        $scope.userInfoOptions.idNumber = data.id_number;
                        $scope.userInfoOptions.idType = _.find($scope.certificateType, function(item) {return item.type == data.id_type});
                    }else{
                        $scope.userInfoOptions = {};
                    }
                });
            };

            var getOrders = function() {
                if($scope.tabType == 'space'){
                    getRoomType();
                    getSpaceOrders();
                }else if($scope.tabType == 'shop'){
                    getShopOrders();
                }else if($scope.tabType == 'event'){
                    getEventOrders();
                }else if($scope.tabType == 'recharge'){
                    getRechargeOrders();
                }else if($scope.tabType == 'agreement'){
                    getRoomType();
                    getLeasesLists();
                }else if($scope.tabType == 'longrent'){
                    getRoomType();
                    getAppointmentList();
                }else if($scope.tabType == 'invoice'){
                    getInvoiceList();
                }else if($scope.tabType == 'membership'){
                    getMembershipList();
                }else if($scope.tabType == 'userInfo'){
                    getUserInfo();
                }
            };

            var initAddUserToGroup = function() {
                var params = {};
                params.user_id = $scope.userItem.id;
                var origin_ids = _.pluck(_.filter($scope.userItem.groups, function(item){return item.type == 'add'}), 'id');
                var ids = _.pluck(_.filter($scope.createdGroups, function(item) {return item.selected;}), 'id');
                params.add = _.difference(ids, origin_ids);
                params.remove = _.difference(origin_ids, ids);

                return params;
            };
         
            var init = function() {
                $rootScope.crumbs = {first: '用户'};
                if($scope.pageType == 'list') {
                    getUserList();
                    getGroupCount();
                    getGroups();
                }else if($scope.pageType == 'detail') {
                    $rootScope.crumbs.second = '用户详情';
                    getUserDetail();
                    getOrders();
                }else if($scope.pageType == 'group') {
                    getGroups();
                }else if($scope.pageType == 'groupUser') {
                    getGroups();
                    getUserList({group: UserService.getSearchParam('groupid')});
                }
            };

            init();

             $scope.searchList = function(){
                var params = initFilterParams();
                for(var key in params){
                    UserService.updateSearchParam(key, params[key]);
                }
                $scope.filterOption.cardStatusObj ? UserService.updateSearchParam('cardStatus', $scope.filterOption.cardStatusObj.value) : UserService.updateSearchParam('cardStatus', '');
                $scope.filterOption.group ? UserService.updateSearchParam('group', $scope.filterOption.groupObj.id) : UserService.updateSearchParam('group', '');
                $scope.filterOption.keyword ? '' : UserService.updateSearchParam('keyword', '');
                UserService.updateSearchParam('pageIndex', '');
            };

            $scope.clearSearchFilters = function(){
                $scope.filterOption = {};
                _.each($location.search(), function(value, key){
                    key != 'tabtype' ? UserService.updateSearchParam(key, '') : '';
                });
            };

            $scope.seeOptions = function(type, item) {
                $scope.optionType = type;
                $scope.pageType == 'list' || $scope.pageType == 'groupUser' ? $scope.userItem = item : '';
                $scope.pageType == 'group' ? $scope.groupItem = item : '';
            };

            $scope.createGroup = function($hide) {
                $scope.pendingFlag = true;
                UserService.createGroup({name: $scope.editOption.g_name}).success(function() {
                    $scope.pendingFlag = false;
                    $hide();
                    noty('info', '创建用户组成功！');
                    getGroups();
                });
            };

            $scope.updateGroup = function($hide) {
                $scope.pendingFlag = true;
                UserService.updateGroup({name: $scope.editOption.g_name}, $scope.groupItem.id).success(function() {
                    $scope.pendingFlag = false;
                    $hide();
                    noty('info', '编辑用户组成功！');
                    getGroups();
                });
            };

            $scope.addUserToGroup = function($hide) {
                var params = initAddUserToGroup();
                $scope.pendingFlag = true;
                UserService.addUserToGroup(params).success(function() {
                    $scope.pendingFlag = false;
                    $hide();
                    noty('info', '编辑成功！');
                    $scope.pageType == 'list' ? getUserList() : getUserList({group: UserService.getSearchParam('groupid')});
                });
            };

            $scope.goPage = function(index, tab){
                UserService.updateSearchParam('tabtype', tab);
                UserService.updateSearchParam('pageIndex', index);
            };
            
            $scope.seePage = function(type, $hide) {
                $hide ? $hide() : '';
                UserService.updateSearchParam('pageType', type);
                UserService.updateSearchParam('pageIndex', '');
                type == 'detail' ? UserService.updateSearchParam('userid', $scope.userItem.id) : '';
                type == 'groupUser' ? UserService.updateSearchParam('groupid', $scope.groupItem.id) : '';
            };

            $scope.switchTab = function(tag){
                $scope.tabType = tag;
                $scope.pageOptions.pageIndex = 1;
                getOrders();
            };

            $scope.setEditFlag = function(flag) {
                if(!flag) {
                    events.emit('confirm', {
                        btnName: '确认取消',
                        title: '取消编辑',
                        content: '一旦确定撤销编辑，将无法恢复已经编辑的数据！',
                        onConfirm: function() {
                            $scope.editFlag = flag;
                            getUserInfo();
                        }
                    });
                }else{
                    $scope.editFlag = flag;
                    if($scope.userInfo.id) {
                        _.map($scope.gender, function(i){return i.value == $scope.userInfo.sex ? i.selected = true : ''});
                        
                    }    
                }
            };

            $scope.checkGender = function(item) {
                _.each($scope.gender, function(i) {
                    i.value != item.value ? i.selected = false : '';
                })
                item.selected = !item.selected;
                item.selected ? $scope.userInfoOptions.sex = item.value : '';
            };

            $scope.saveUserInfo = function() {
                var params = _.pick($scope.userInfoOptions, 'name', 'sex', 'phone', 'email', 'nationality', 'idNumber', 'language', 'companyName', 'position', 'comment');
                $scope.userInfoOptions.idType ? params.idType = $scope.userInfoOptions.idType.type : '';
                params.birthday = formatDate($scope.userInfoOptions.birthday, 'yyyy-MM-dd');
                if(!$scope.userInfo.id) {
                    UserService.createUserInfo(params, UserService.getSearchParam('userid')).success(function() {
                        $scope.editFlag = false;
                        noty('info', '保存成功！');
                    });
                }else{
                    UserService.updateUserInfo(params, UserService.getSearchParam('userid')).success(function() {
                        $scope.editFlag = false;
                        noty('info', '保存成功！');
                    });
                }
            };

            $scope.seeModal = function(type, $hide) {
                $hide ? $hide() : '';
                $scope.diaType = type;
                type == 'updateGroup' ? $scope.editOption.g_name = $scope.groupItem.name : '';
                type == 'createGroup' ? $scope.editOption.g_name = '' : '';
                if(type == 'editGroupForUser') {
                    var origin_ids = _.pluck($scope.userItem.groups, 'id');
                    _.each($scope.createdGroups, function(item) {
                        _.contains(origin_ids, item.id) ? item.selected = true : item.selected = false;
                    });
                }
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'userGroupTpl'
                });
            };

            $scope.seeDelConfrim = function($hide) {
                $hide ? $hide() : '';
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'delConfirmTpl'
                });
            };

            $scope.confirmDelete = function($hide) {
                if($scope.editOption.confirmKey == 'delete') {
                    UserService.deleteGroup($scope.groupItem.id).success(function() {
                        $hide();
                        noty('info', '删除用户组成功！');
                        getGroups();
                    });
                }else{
                    noty('error', '请输入框中提示字样！');
                }
            };

            $scope.seeOrderDetail = function(item, type) {
                var path = '';
                if(type == 'space') {
                    path = CONF.bizbase + 'trade?ptype=spaceDetail&orderId=' + item.id + '&tabtype=space';
                }else if(type == 'agreement') {
                    path = CONF.bizbase + 'trade?tabtype=agreement&ptype=contractDetail&leaseId=' + item.id;
                }else if(type == 'event') {
                    path = CONF.bizbase + 'trade?tabtype=event&ptype=eventDetail&orderId=' + item.id;
                }else if(type == 'invoice') {
                    path = CONF.bizbase + 'finance?pageType=invoiceDetail&tabType=all&invoiceId=' + item.id;
                }else if(type == 'longrent') {
                    path = CONF.bizbase + 'trade?tabtype=agreement&ptype=contractDetail&leaseId=' + item.lease_id;
                }else if(type == 'membership') {
                    path = CONF.bizbase + 'trade?tabtype=member&ptype=memberDetail&orderId=' + item.id;
                }
                window.open(path);
            };
        };

        return ['$rootScope', '$scope', '$cookieStore', 'events', 'utils', 'UserService', 'CurrentAdminService', '$alert', 'FileUploader', 'CONF', '$filter', '$location', UserController];
    });
})(define);