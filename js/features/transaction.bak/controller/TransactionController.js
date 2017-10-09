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
            $scope.PERMISSION_LEASES_KEY = 'sales.building.long_term_lease';
            $scope.PERMISSION_APPOINTMENT_KEY = 'sales.building.long_term_appointment';
            $scope.PERMISSION_EVENT_KEY = 'sales.platform.event_order';
            $scope.PERMISSION_PREORDER_KEY = 'sales.building.order.preorder';
            $scope.PERMISSION_RESERVE_KEY = 'sales.building.order.reserve';
            $scope.PERMISSION_ROOM_KEY = 'sales.building.room';
            $scope.PERMISSION_PRODUCT_KEY = 'sales.building.product';
            $scope.PERMISSION_EVE_KEY = 'sales.platform.event';

            $scope.spaceOrderStatus = TransactionService.getWorkspaceStatusDesc();
            $scope.appointmentOrderStatus = TransactionService.getAppointmentStatusDesc();
            $scope.agreementStatus = TransactionService.getAgreementStatusDesc();
            $scope.unitDesc = TransactionService.getUnitDesc();
            $scope.agreementOption = TransactionService.getAgreementOption();
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
                            console.log(item.product_info);
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

            var getAppointmentList = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                $scope.loaded = false;
                TransactionService.getAppointmentList(params).success(function(data){
                    $scope.appointmentList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = _.uniq(_.pluck($scope.appointmentList, 'user_id'));
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.loaded = true;
                });
            };

            var getAppointmentDetail = function(){
                TransactionService.getAppointmentDetail(TransactionService.getSearchParam('appointmentId')).success(function(data){
                    $scope.appointmentData = data;
                    $scope.permissionBuildingId = data.product.room.building.id;
                    if(TransactionService.getSearchParam('ptype') === 'createAgreement'){
                        $scope.agreementOption.lessee_name = data.applicant_company;
                        $scope.agreementOption.lessee_address = data.address;
                        $scope.agreementOption.lessee_contact = data.applicant_name;
                        $scope.agreementOption.lessee_phone = data.applicant_phone;
                        $scope.agreementOption.lessee_email = data.applicant_email;
                        getLessorInfo($scope.permissionBuildingId);
                        getUsersInfo([data.user_id], 'supervisorOption');
                        $scope.agreementOption.start_date = data.start_rent_date;
                        $scope.agreementOption.end_date = data.end_rent_date;
                        $scope.agreementOption.monthly_rent = data.product.rent_set.base_price;
                        $scope.agreementOption.deposit = data.product.rent_set.deposit;
                        $scope.agreementOption.total_rent = data.product.rent_set.base_price * data.rent_time_length;
                        getSupplementaryList(data.product.lease_rent_types);
                        var temp = {
                            name: '第一期账单',
                            amount: data.product.base_price,
                            description: '第一期账单描述',
                            start_date: data.start_rent_date,
                            end_date: new Date()
                        };
                        temp.end_date.setDate(new Date(data.start_rent_date).getDate() + 30);
                        $scope.agreementBills.unshift(temp);

                    }
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

            var setCurrentStep = function(status){
                if(status === 'confirming' ){
                    $scope.currentStep = 2;
                }else if(status === 'reconfirming'){
                    $scope.currentStep = $scope.agreementData.change_logs && $scope.agreementData.change_logs.lease_performing_date ? 4: 2;
                }else if(status === 'confirmed'){
                    $scope.currentStep = 3;
                }else if(status === 'closed'){
                    $scope.agreementData.change_logs && $scope.agreementData.change_logs.lease_conformed_date ? $scope.currentStep = 3: $scope.currentStep = 2;
                }else if(status === 'performing'){
                    $scope.currentStep = 4;
                }else if(status === 'expired'){
                    $scope.currentStep = 2;
                }else if(status === 'matured'){
                    $scope.currentStep = 4;
                }else if(status === 'end' || status === 'overtime' || status === 'terminated' ){
                    $scope.currentStep = 5;
                }
            };

            var getLeasesDetail = function(){
                TransactionService.getLeasesDetail(TransactionService.getSearchParam('leaseId')).success(function(data){
                    $scope.appointmentData = {};
                    $scope.appointmentData.product = data.product;
                    $scope.permissionBuildingId = data.product.room.building.id;
                    $scope.agreementData = data;
                    $scope.agreementData.start_date = formatDate($scope.agreementData.start_date, 'yyyy-MM-dd');
                    $scope.agreementData.end_date = formatDate($scope.agreementData.end_date, 'yyyy-MM-dd');
                    $scope.agreementOption = _.pick(data, 'drawee', 'supervisor', 'start_date', 'status', 'end_date', 'lessor_name', 'lessor_address', 'lessor_phone', 'lessor_contact', 'lessor_email', 'lessee_name', 'lessee_address', 'lessee_contact', 'lessee_phone', 'lessee_email', 'product', 'monthly_rent', 'total_rent', 'purpose', 'deposit', 'other_expenses', 'supplementary_terms', 'is_auto', 'plan_day');
                    $scope.agreementBills = data.bills;
                    //$scope.supplementaryList = data.product.lease_rent_types;
                    _.each($scope.agreementBills, function(item){
                        item.start_date = formatDate(item.start_date, 'yyyy-MM-dd');
                        item.end_date = formatDate(item.end_date, 'yyyy-MM-dd');
                    });
                    if($scope.pageType === 'updateDraft' || $scope.pageType === 'contractDetail' || $scope.pageType === 'updateAgreement'){
                        var arr = [];
                        data.drawee ? arr.push(data.drawee) : '';
                        data.supervisor ? arr.push(data.supervisor) : '';
                        data.product_appointment && data.product_appointment.user_id ? arr.push(data.product_appointment.user_id) : '';
                        arr = _.uniq(arr);
                        getUsersInfo(arr);
                        getSupplementaryList(data.lease_rent_types);
                        $scope.agreementData.includedRentType = _.pluck(data.lease_rent_types, 'name').join('; ');
                    }
                    if($scope.pageType === 'contractDetail'){
                        setCurrentStep($scope.agreementData.status);
                    }
                    $scope.deposit.note = data.deposit_note;
                    if($scope.pageType === 'contractDetail' || $scope.pageType === 'history' || $scope.pageType === 'billDetail'){
                        _.each($scope.agreementData.invited_people, function(people){
                            people.avatar = CONF.file + '/person/' + people.id + '/avatar_small.jpg';
                        });
                        $rootScope.crumbs.second = data.serial_number; 
                    }
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

            var getLeasesLists = function(draftFlag){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = draftFlag ? 100 : $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                draftFlag ? params = {} : '';
                params.status = draftFlag ? 'drafting' : (params.status ? params.status :'all');
                $scope.loaded = false;
                TransactionService.getLeasesLists(params).success(function(data){
                    if(draftFlag && $scope.pageType === 'list'){
                        $scope.draftCounts = data.total_count;
                    }else {
                        $scope.leasesList = data.items;
                        $scope.pageOptions.totalNum = data.total_count;
                        var arr = [];
                        _.each(data.items, function(item){
                            item.supervisor ? arr.push(item.supervisor) : '';
                        });
                        arr = _.uniq(arr);
                        arr.length > 0 ? getUsers({'id[]': arr}): '';
                    }
                    $scope.loaded = true;
                });
            };

            var getLeasesBillDetail = function(){
                TransactionService.getLeasesBillDetail(TransactionService.getSearchParam('billId')).success(function(data){
                    $scope.billItem = data;
                    $rootScope.crumbs.third = data.name;
                    var arr = [];
                    data.payment_user_id ? arr.push(data.payment_user_id): '';
                    data.drawee ? arr.push(data.drawee): '';
                    data.lease.drawee ? arr.push(data.lease.drawee): '';
                    data.reviser ? arr.push(data.reviser): '';
                    data.sender ? arr.push(data.sender) : '';
                    arr = _.uniq(arr);
                    getUsers({'id[]': arr})
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
                }else if($scope.tabType === 'longrent'){
                    getBuildingList();
                    getRoomType();
                    getAppointmentList();
                }else if($scope.tabType === 'agreement'){
                    getBuildingList();
                    getLeasesLists();
                    getRoomType();
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

            var initLeases = function(){
                $scope.agreementOption.product = $scope.appointmentData.product.id;
                $scope.agreementOption.supervisor = $scope.searchResult.supervisorOption && $scope.searchResult.supervisorOption.id ? $scope.searchResult.supervisorOption.id : '';
                $scope.agreementOption.drawee = $scope.searchResult.supervisorOption && $scope.searchResult.supervisorOption.id ? $scope.searchResult.supervisorOption.id : '';
                $scope.agreementOption.lease_rent_types = _.pluck(_.filter($scope.supplementaryList, 'selected', true), 'id');
                
                $scope.agreementOption.bills = {};
                $scope.agreementOption.bills.add = [];
                $scope.agreementOption.bills.edit = [];
                $scope.agreementOption.bills.remove = $scope.deleteBills;
                _.each($scope.agreementBills, function(item){
                    var temp = {};
                    temp = _.pick(item, 'name', 'amount', 'description', 'start_date', 'end_date');
                    item.id ? temp.id = item.id : '';
                    temp.start_date = formatDate(item.start_date, 'yyyy-MM-dd');
                    temp.end_date = formatDate(item.end_date, 'yyyy-MM-dd');
                    if(item.id){
                        item.status !== 'unpaid' &&  item.status !== 'paid' && item.status != 'cancelled' && item.status != 'verify' ? $scope.agreementOption.bills.edit.push(temp) : '';
                    }else{
                        item.amount ? $scope.agreementOption.bills.add.push(temp) : '';
                    }
                });
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

            var validLease = function(status){
                var validationFlag = true;

                validationFlag = validationFlag ? validParams($scope.agreementOption.monthly_rent < 0, '月租金不能小于零！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.agreementOption.total_rent < 0, '合同总租金不能小于零！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.agreementOption.deposit < 0, '租赁押金不能小于零！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.agreementOption.is_auto && !$scope.agreementOption.plan_day, '自动推送提前天数不能为空！') : validationFlag;
                _.each(_.filter($scope.agreementBills, function(bill){return bill.amount}), function(item){
                    if((status === 'confirming' || status === 'reconfirming') && (!item.name || !item.start_date || !item.end_date || !item.description || !item.amount)){
                        noty('error', '合同账单不能为空！') ;
                        validationFlag = false;
                        return;
                    }
                    if(item.amount < 0){
                        noty('error', '账单租金不能小于零！') ;
                        validationFlag = false;
                        return;
                    }
                });
                if(status === 'confirming' || status === 'reconfirming'){
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessor_name, '出租方名称不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessor_address, '出租方地址不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessor_contact, '出租方联系人不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessor_phone, '出租方电话不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessor_email, '出租方邮箱不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!utils.isEmail($scope.agreementOption.lessor_email), '出租方邮箱格式不对！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessee_name, '承租方名称不能为空') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessee_address, '承租方地址不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessee_contact, '承租方联系人不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessee_phone, '承租方电话不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessee_email, '承租方邮箱不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!utils.isEmail($scope.agreementOption.lessee_email), '承租方邮箱格式不对！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.searchResult.supervisorOption.id, '联系人不能为空！') : validationFlag;
                    // validationFlag = validationFlag ? validParams(!$scope.searchResult.draweeOption.id, '付款人不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.start_date, '租赁起始日期不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.end_date, '租赁结束日期不能为空') : validationFlag;
                    validationFlag = validationFlag ? validParams($scope.agreementOption.lease_rent_types.length === 0, '您还未选择租金包含！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.purpose, '房屋使用用途不能为空！') : validationFlag;
                    // validationFlag = validationFlag ? validParams(!$scope.agreementBills || $scope.agreementBills.length === 0, '请添加合同账单！') : validationFlag;
                }
                
                return validationFlag;
            };

            var verifyChangeAmountParams = function(){
                var validationFlag = true;
                // validationFlag = validationFlag ? validParams(!$scope.changeAmountOptions.revised_amount, '订单金额不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.changeAmountOptions.revised_amount < 0, '订单金额不能为负数！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.changeAmountOptions.revision_note, '更改备注不能为空！') : validationFlag;
                return validationFlag;
            };

            var getLeasesPushedBills = function(){
                TransactionService.getPushedBills(TransactionService.getSearchParam('leaseId'), {pageLimit: 100,
                pageIndex: 0}).success(function(data){
                    $scope.pushedLeasesBills = data.items;
                    //unpaid bills
                    $scope.billData = {};
                    $scope.billData.unpaid_bills = 0;
                    _.each($scope.pushedLeasesBills, function(bill){
                        bill.status == 'unpaid' ? $scope.billData.unpaid_bills ++ : '';
                        if(bill.status == 'unpaid' && bill.transfer[0] && bill.transfer[0].transfer_status == 'pending'){
                            bill.status = 'pending';
                        }else if(bill.status == 'unpaid' && bill.transfer[0] && bill.transfer[0].transfer_status == 'returned'){
                            bill.status = 'returned';
                        }
                    });
                    var arr = [];
                    _.each(data.items, function(bill){
                        arr.push(bill.drawee);
                        arr.push(bill.payment_user_id);
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                });
            };

            var setDefaultTabType = function(){
                if($scope.currentAdmin.permissionMap[$scope.PERMISSION_SPACE_KEY]){
                    $scope.tabType = 'space';
                    return ;
                }
                if($scope.currentAdmin.permissionMap[$scope.PERMISSION_LEASES_KEY]){
                    $scope.tabType = 'agreement';
                    return ;
                }
                if($scope.currentAdmin.permissionMap[$scope.PERMISSION_APPOINTMENT_KEY]){
                    $scope.tabType = 'longrent';
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
                }else if($scope.pageType === 'drafts' || $scope.pageType === 'updateDraft'){
                    $rootScope.crumbs = {first: '长租合同'};
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

            var getLeasesLog = function(){
                var params = {};
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                params.module = 'lease';
                params.object_key = 'lease';
                params.object_id = TransactionService.getSearchParam('leaseId');
                params.sales_company = $cookies.get('salesCompanyId');
                TransactionService.getLeasesLog(params).success(function(data){
                    $scope.leasesLogList = data.items;
                    var arr = [];
                    _.each($scope.leasesLogList, function(item){
                        item.lease = JSON.parse(item.log_object_json);
                        arr.push(item.admin_username);
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.pageOptions.totalNum = data.total_count;
                });
            };

            var getLessorInfo = function(buildingId){
                TransactionService.getLessorInfo(buildingId).success(function(data){
                    $scope.agreementOption.lessor_name = data.lessor_name;
                    $scope.agreementOption.lessor_address = data.lessor_address;
                    $scope.agreementOption.lessor_contact = data.lessor_contact;
                    $scope.agreementOption.lessor_email = data.lessor_email;
                    $scope.agreementOption.lessor_phone = data.lessor_phone;
                });
            };

            var getCustomerService = function(){
                TransactionService.getCustomerService().success(function(data){
                    $scope.customerservice = {};
                    _.each(data.customerservice, function(item){
                        $scope.customerservice[item] = true;
                    });
                });
            };

            var getRemarkList = function() {
                var params = {};
                if($scope.pageType == 'spaceDetail') {
                    params = {'object': 'product_order', 'object_id': TransactionService.getSearchParam('orderId')};
                }else if($scope.pageType == 'billDetail') {
                    params = {'object': 'lease_bill', 'object_id': TransactionService.getSearchParam('billId')};
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
                }else if($scope.pageType === 'updateDraft' || $scope.pageType === 'contractDetail' || $scope.pageType === 'updateAgreement'){
                    getLeasesDetail();
                    getRoomType();
                    if($scope.pageType === 'updateDraft'){
                        $rootScope.crumbs.second = '合同草稿';
                        $rootScope.crumbs.third = '编辑草稿';
                    }else if($scope.pageType === 'updateAgreement'){
                        $rootScope.crumbs.second = '编辑合同';
                    }else if($scope.pageType === 'contractDetail'){
                        getLeasesPushedBills();
                    }
                }else if($scope.pageType === 'drafts'){
                    $rootScope.crumbs.second = '合同草稿';
                    getLeasesLists(true);
                    getRoomType();
                }else if($scope.pageType === 'history'){
                    $rootScope.crumbs.third = '修改历史';
                    getLeasesDetail();
                    getLeasesLog();
                }else if($scope.pageType === 'billDetail'){
                    getLeasesDetail();
                    getRemarkList();
                    getLeasesBillDetail();
                    getRoomType();
                }
            };

            $scope.createRemark = function() {
                var params = {};
                if($scope.pageType == 'spaceDetail') {
                    params = {'object': 'product_order', 'object_id': TransactionService.getSearchParam('orderId')};
                }else if($scope.pageType == 'billDetail') {
                    params = {'object': 'lease_bill', 'object_id': TransactionService.getSearchParam('billId')};
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
                $scope.tabType == 'agreement' ? $scope.download = CONF.api + 'sales/admin/leases/bills/export?' : '';
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
                $scope.billItem ? $scope.selectedBill = $scope.billItem : '';
                TransactionService.collectionSalesOffline($scope.selectedBill.id, params).success(function(){
                    noty('info','已确认收款该账单！');
                    if($scope.pageType == 'contractDetail'){
                        getLeasesPushedBills();
                    }else if($scope.pageType == 'billDetail'){
                        getLeasesBillDetail();
                    }
                }).error(function(){
                    noty('error','未能确认收款！');
                });
                hide();
                $scope.salesOffline.note = '';
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

            $scope.setAgreementStatus = function(item, status){
                var params = [{
                        op: 'add',
                        path: '/status',
                        value: status
                    }];
                TransactionService.setAgreementStatus(item.id, params).success(function(){
                    if(status === 'rejected'){
                        noty('info', '预约申请拒绝成功！')
                        getAppointmentList();
                    }else if(status === 'accepted'){
                        TransactionService.updateSearchParam('ptype', 'createAgreement');
                        TransactionService.updateSearchParam('appointmentId', item.id);
                        TransactionService.updateSearchParam('productId', item.product.id);
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

            $scope.seeContractDetail = function(id){
                TransactionService.updateSearchParam('ptype', 'contractDetail');
                TransactionService.updateSearchParam('leaseId', id);
            };

            $scope.seeBillDetail = function(item){
                TransactionService.updateSearchParam('ptype', 'billDetail');
                TransactionService.updateSearchParam('billId', item.id);
            };

            $scope.seeOrderPage = function(){
                TransactionService.updateSearchParam('ptype', 'orderPage');
            };

            $scope.pushBill = function($hide){
                $hide();
                $scope.seePopup('pushSuccess');
            };

            $scope.addBill = function(){
                var temp = {
                    name: '',
                    amount: '',
                    description: '',
                    start_date: '',
                    end_date: ''
                };
                $scope.agreementBills.push(temp);
            };

            $scope.initBill = function(){
                var temp = {
                    name: '',
                    amount: '',
                    description: '',
                    start_date: '',
                    end_date: ''
                };
                for (var i = 0; i <= 5; i++) {
                    $scope.agreementBills.push(angular.copy(temp));
                }
            };

            $scope.deleteBill = function(index){
                var temp = $scope.agreementBills.splice(index, 1)[0];
                temp.id ? $scope.deleteBills.push(temp.id) : '';
            };

            $scope.seeDrafts = function(){
                TransactionService.updateSearchParam('ptype', 'drafts');
            };

            $scope.seeHistory = function(){
                TransactionService.updateSearchParam('ptype', 'history');
            };

            $scope.printPdf = function(){
                window.location.href = CONF.api + 'sales/admin/leases/export_to_pdf/' + TransactionService.getSearchParam('leaseId') + '?company=' + $cookies.get('salesCompanyId');
            };

            $scope.seeUpdateDraft = function(id){
                TransactionService.updateSearchParam('ptype', 'updateDraft');
                TransactionService.updateSearchParam('leaseId', id);
            };

            $scope.generateAgreement = function(item){
                TransactionService.updateSearchParam('ptype', 'createAgreement');
                TransactionService.updateSearchParam('appointmentId', item.id);
                TransactionService.updateSearchParam('productId', item.product.id);
            };

            $scope.switchTab = function(tag){
                TransactionService.updateSearchParam('tabtype', tag);
                _.each($location.search(), function(value, key){
                    key != 'tabtype' ? TransactionService.updateSearchParam(key, '') : '';
                });
            };

            $scope.expand = function() {
                $scope.expandFlag = !$scope.expandFlag;
                if($scope.pageType == 'billDetail'){
                    $scope.expandFlag ? $scope.offlineHeight = Math.ceil($scope.billItem.transfer.length/4) * 242 : $scope.offlineHeight = 242;
                }else if($scope.pageType == 'rechargeDetail') {
                    $scope.expandFlag ? $scope.offlineHeight = Math.ceil($scope.rechargeItem.transfer.length/4) * 242 : $scope.offlineHeight = 242;
                }
            };

            $scope.switchContractTab = function(tag){
                $scope.contractTab = tag;
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

            $scope.createLeases = function(status){
                initLeases();
                var params = angular.copy($scope.agreementOption);
                if($scope.pageType === 'createAgreement' || $scope.pageType === 'updateDraft'){
                    params.status = status;
                }else{
                    if($scope.agreementData.status === 'drafting'){
                        params.status = status;
                    }else{
                        params.status = $scope.agreementData.status === 'confirming' ? 'confirming': 'reconfirming';
                    }
                }
                
                params.deposit = params.deposit ? params.deposit : 0;
                params.monthly_rent = params.monthly_rent ? params.monthly_rent : 0;
                params.total_rent = params.total_rent ? params.total_rent : 0;
                params.start_date = formatDate(params.start_date, 'yyyy-MM-dd');
                params.end_date = formatDate(params.end_date, 'yyyy-MM-dd');
                $scope.generateFlag ? params.product_appointment = parseInt(TransactionService.getSearchParam('appointmentId')): '';
                var flag = true;
                flag = validLease(status);
                if(flag){
                    if(status === 'confirming' || status === 'reconfirming'){
                        events.emit('confirm', {
                            title: '系统提示',
                            content: '提交后将发送该合同给用户，请确认信息正确',
                            onConfirm: function() {
                               if($scope.pageType === 'createAgreement'){
                                   TransactionService.createLease(params).success(function(){
                                       status === 'drafting'? noty('info', '合同草稿保存成功！') : noty('info', '合同保存成功！');
                                       window.history.back();
                                   });
                               }else{
                                   TransactionService.updateLease(TransactionService.getSearchParam('leaseId'), params).success(function(){
                                       status === 'drafting'? noty('info', '合同草稿修改成功！') : noty('info', '合同修改成功！');
                                       window.history.back();
                                   });
                               }
                            }
                        });
                    }else{
                        if($scope.pageType === 'createAgreement'){
                            TransactionService.createLease(params).success(function(){
                                status === 'drafting'? noty('info', '合同草稿保存成功！') : noty('info', '合同保存成功！');
                                window.history.back();
                            });
                        }else{
                            TransactionService.updateLease(TransactionService.getSearchParam('leaseId'), params).success(function(){
                                status === 'drafting'? noty('info', '合同草稿修改成功！') : noty('info', '合同修改成功！');
                                window.history.back();
                            });
                        }
                    }
                    
                }
            };

            $scope.updateLeaseSupervisorOrDrawee = function(field, $hide){
                if($scope.searchResult.changeUserOption && $scope.searchResult.changeUserOption.id){
                    var params = _.pick($scope.agreementData, 'lessor_name', 'lessor_address', 'lessor_contact', 'lessor_phone', 'lessor_email', 'lessee_name', 
                    'lessee_address', 'lessee_contact', 'lessee_phone', 'lessee_email', 'supervisor', 'drawee', 'start_date', 'end_date', 'monthly_rent', 'total_rent', 'purpose', 'deposit', 'other_expenses', 'supplementary_terms');
                    params.product = $scope.agreementData.product.id;
                    params.lease_rent_types = _.pluck($scope.agreementData.lease_rent_types, 'id');
                    // params.status = 'reconfirming';
                    params.status = $scope.agreementData.status === 'confirming' ? 'confirming': 'reconfirming';
                    params.bills = {};
                    params.start_date = formatDate(params.start_date, 'yyyy-MM-dd');
                    params.end_date = formatDate(params.end_date, 'yyyy-MM-dd');
                    params[field] = $scope.searchResult.changeUserOption.id;

                    TransactionService.updateLease(TransactionService.getSearchParam('leaseId'), params).success(function(){
                        field === 'supervisor' ? noty('info', '合同负责人修改成功！'): '';
                        getLeasesDetail();
                        $hide();
                    });
                }
            };

            $scope.showDeleteLeaseConfirm = function(status){
                events.emit('confirm', {
                    title: status === 'comfirming' ? '删除合同' : '删除草稿',
                    content: status === 'comfirming' ? '是否确认删除合同？' : '是否确认删除草稿？',
                    onConfirm: function() {
                        TransactionService.deleteLeases(TransactionService.getSearchParam('leaseId')).success(function(){
                            status === 'drafting'? noty('info', '删除合同成功成功！') : noty('info', '删除草稿成功！');
                            window.history.back();
                        });
                    }
                });
            };

            $scope.showLeasesConfirm = function(status){
                var text = '';
                if(status === 'performing'){
                    events.emit('confirm', {
                        title: '生效合同',
                        content: '生效合同后，用户将能使用合同内租约的房间，是否确认生效合同',
                        btnName: '生效',
                        btnClass: 'btn-success',
                        onConfirm: function() {
                            $scope.setLeasesStatus(status)
                        }
                    });
                }else if(status === 'closed'){
                    text = $scope.agreementData.status == 'confirming' || $scope.agreementData.status == 'reconfirming' ? '用户尚未确认合同，是否确认关闭合同' : '用户已经确认合同，是否确认关闭合同';
                    events.emit('confirm', {
                        title: '关闭合同',
                        content: text,
                        btnName: '关闭合同',
                        onConfirm: function() {
                            $scope.setLeasesStatus(status)
                        }
                    });
                }else if(status === 'terminated' || status === 'end'){
                    $scope.popupType = 'end';
                    events.emit('modal', {
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade',
                        template: 'popupTpl'
                    });
                }
            };

            $scope.setLeasesStatus = function(status, $hide){
                var params = {status: status};
                TransactionService.setLeasesStatus(TransactionService.getSearchParam('leaseId'), params).success(function(){
                    if(status === 'performing'){
                        noty('info', '该合同已生效！');
                    }else if(status === 'closed'){
                        noty('info', '合同已关闭');
                    }else if(status === 'end'){
                        noty('info', '合同已终止');
                        $hide();
                    }
                    getLeasesDetail();
                });
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

            $scope.showRejectedConfirm = function(item){
                events.emit('confirm', {
                    title: '拒绝长租申请',
                    content: '是否拒绝此用户的长租申请？拒绝后无法再次操作，用户将收到拒绝提示',
                    btnName: '拒绝',
                    onConfirm: function() {
                        $scope.setAgreementStatus(item, 'rejected')
                    }
                });
            };

            $scope.seeUpdateAgreement = function(){
                TransactionService.updateSearchParam('ptype', 'updateAgreement');
                TransactionService.updateSearchParam('productId', $scope.agreementData.product.id);
            };

            $scope.setDepositNote = function($hide){
                var params = [{
                    op: 'add',
                    path: '/deposit_note',
                    value: $scope.deposit.note
                }];

                if($scope.deposit.note){
                    TransactionService.setDepositNote(TransactionService.getSearchParam('leaseId'), params).success(function(){
                        $hide();
                        noty('info', '收取押金备注保存成功！');
                        getLeasesDetail();
                    });
                }else{
                    noty('error', '请填写备注！');
                }   
            };

            $scope.pushOtherBill = function($hide){
                var params = angular.copy($scope.otherBill);
                params.start_date = formatDate(params.start_date, 'yyyy-MM-dd');
                params.end_date = formatDate(params.end_date, 'yyyy-MM-dd');
                params.lease_id = TransactionService.getSearchParam('leaseId');

                TransactionService.createOtherBills(params).success(function(){
                    $hide();
                    noty('info', '其它账单推送成功！');
                    if($scope.contractTab === 2){
                        getLeasesPushedBills();
                    }
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
                    }else{
                        TransactionService.changeLeasesOrderAmount($scope.changeAmountOrder.id, params).success(function(){
                            $hide();
                            noty('info', '账单金额修改成功！');
                            if($scope.pageType === 'contractDetail'){
                                getLeasesPushedBills();
                            }else if($scope.pageType === 'billDetail'){
                                getLeasesBillDetail();
                            }
                        });
                    }
                }
            };

            $scope.backToLeaseDetail = function(){
                window.history.back();
            };

            $scope.selectedBill = function(bill){
                bill.selected = !bill.selected;
                $scope.mutiSelectedBills = angular.copy(_.filter($scope.agreementData.bills, 'selected', true));
                $scope.enabledBathPush = $scope.mutiSelectedBills.length > 0 ? true : false;
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

            $scope.bathPushLeaseBills = function($hide){
                var params = verifyPushParams()
                if(params.length > 0){
                    TransactionService.batchPushBills(TransactionService.getSearchParam('leaseId'), params).success(function(){
                        $hide();
                        noty('info','订单推送成功！');
                        getLeasesDetail();
                        getLeasesPushedBills();
                    });
                }
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

            // $scope.pushSingleBill = function($hide){
            //     var params = [{
            //         op: 'add',
            //         path: '/status',
            //         value: 'unpaid'
            //     }];
            //     TransactionService.pushLeasesBill($scope.selectedBill.id, params).success(function(data){
            //         $scope.selectedBill.status = 'unpaid';
            //         $hide();
            //         noty('info','订单推送成功！！');
            //     });
            // };

            $scope.switchModifyFlag = function(bill){
                !bill.expand ? bill.revised_amount = bill.revised_amount || bill.amout : '';
                bill.expand = !bill.expand;
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
