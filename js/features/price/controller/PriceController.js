/**
 *  Defines the PriceController controller
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the PriceController class with RequireJS
     */
    define(['lodash', 'sprintf'], function(_, sprintf) {

        /**
         * @constructor
         */
        var PriceController = function($scope, events, utils, $alert, PriceService, CurrentAdminService, DaySelectorApi, HourSelectorApi, CONF, $translate, $filter) {

            var weekdays = ['星期一',  '星期二',  '星期三',  '星期四',  '星期五',  '星期六', '星期日'];
            var currentSearchKey = '';
            $scope.$alert = $alert;

            $scope.PERMISSION_KEY = 'sales.building.price';

            $scope.selectedRoomTypes = [];

            $scope.submissionDisabled = false;

            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;

            $scope.pageFlag = PriceService.getSearchParam('type') ? PriceService.getSearchParam('type') : 'list';

            $scope.discount = 0;
            $scope.sendFlag = false;

            $scope.priceRule = {
				start_time: '',
				end_time: '',
				buildings: [],
				types: []
            };
            $scope.pageOptions = {
				pageSize: CONF.pageSize,
				pageIndex: 1,
				totalNum: 0
            };
            $scope.placeholder = {
            	rule: '全部规则'
            };
            $scope.selectRooms = {};

            var noty = function(type, msg) {
				events.emit('alert', {
				    type: type,
				    message: msg,
				    onShow: function() {
				    },
				    onClose: function() {
				    $scope.submissionDisabled = false;
				    }
				});
            };

            $scope.filterOption = {
                rule: '',
                searchKey: ''
            };

            $scope.ruleStatuses = [{name: '在用规则', value: 0}, {name: '停用规则', value: 1}];

            $scope.userType = {
				normal: '普通用户',
				vip: 'VIP用户',
				all: '所有用户'
            };

            $scope.userTypes = [
				{name: '普通用户', value: 'normal'},
				{name: 'VIP用户', value: 'vip'},
				{name: '所有用户', value: 'all'}
            ];

            $scope.ruleDefinitions = {
				1: '适用对象',
				2: '长订单',
				3: '优惠时段'
            };
            $scope.rentUnits = [
                {name: '时租', value: 'hour'},
                {name: '日租', value: 'day'},
                {name: '月租', value: 'month'}
            ];

            $scope.ruleDefinitionsArr = [
				{name: '适用对象', value:1},
				{name: '长订单', value:2},
				{name: '优惠时段', value:3}
            ];

            $scope.times = [
                {name: '00:00'},{name: '00:30'},{name: '01:00'},{name: '01:30'},{name: '02:00'},{name: '02:30'},{name: '03:00'},{name: '03:30'},{name: '04:00'},{name: '04:30'},{name: '05:00'},{name: '05:30'},{name: '06:00'},{name: '06:30'},{name: '07:00'},{name: '07:30'},{name: '08:00'},{name: '08:30'},{name: '09:00'},{name: '09:30'},{name: '10:00'},{name: '10:30'},{name: '11:00'},{name: '11:30'},
                {name: '12:00'},{name: '12:30'},{name: '13:00'},{name: '13:30'},{name: '14:00'},{name: '14:30'},{name: '15:00'},{name: '15:30'},{name: '16:00'},{name: '16:30'},{name: '17:00'},{name: '17:30'},{name: '18:00'},{name: '18:30'},{name: '19:00'},{name: '19:30'},{name: '20:00'},{name: '20:30'},{name: '21:00'},{name: '21:30'},{name: '22:00'},{name: '22:30'},{name: '23:00'},{name: '23:30'}
            ];

            $scope.ruleTypes = {
                1: '满减',
                2: '折扣'
            };
            $scope.rentTypes = [{name: '天', value: 'day'}, {name: '小时', value: 'hour'}];

            $scope.ruleTypesArr = [
                {name: '满减', value: 1},
                {name: '折扣', value: 2}
            ];
            $scope.building_ids = [];
            $scope.refresh = false;

            var getRoomTypes = function(){
                PriceService.getRoomTypes().success(function(data) {
                    $scope.roomTypes = data;
                    if($scope.pageFlag === 'edit'){
                        _.each($scope.roomTypes, function(type){
                            _.each($scope.updateRule.suitable_area.types, function(item){
                                type.name === item? type.select = true: '';
                            });
                        });
                    }
                });
            };

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var getPriceRules = function() {
                var params = {
                    pageLimit: $scope.pageOptions.pageSize,
                    pageIndex: $scope.pageOptions.pageIndex
                };
                if($scope.filterOption.rule) {
                    params.status = $scope.filterOption.rule.value;
                }
                if(currentSearchKey.length !== 0) {
                    params.query = currentSearchKey;
                }
                PriceService.getPriceRules(params).success(function(data) {
                    $scope.priceRules = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    _.each($scope.priceRules, function(item){
                        item.typeDesc = '';
                        _.each(item.suitable_area.types, function(type, index){
                            if(index === 0){
                                item.typeDesc = $translate.instant(type.toUpperCase());
                            }else{
                                item.typeDesc += ', ' + $translate.instant(type.toUpperCase());
                            }
                        });
                    });
                    $scope.refresh = false;
                });
            };

            var getPriceRule = function(){
                PriceService.getPriceRule(PriceService.getSearchParam('id')).success(function(data){
                    $scope.priceRule.rule_name = data.rule_name;
                    $scope.priceRule.start_time = data.start_time;
                    $scope.priceRule.end_time = data.end_time;
                    $scope.priceRule.limit_min = data.limit_min;
                    $scope.priceRule.limit_max = data.limit_max;
                    $scope.priceRule.rule_description = data.rule_description;
                    $scope.priceRule.bind_product_price = data.bind_product_price;
                    $scope.priceRule.types = data.suitable_area.types;
                    $scope.updateRule = angular.copy(data);
                    $scope.filterOption.rule_define = _.filter(
                        $scope.ruleDefinitionsArr,
                        function (rule) {
                            return rule.value === data.rule_define;
                        }
                    )[0];

                    $scope.filterOption.city = _.filter(
                        $scope.cities,
                        function (city) {
                            return city.id === data.suitable_area.city_id;
                        }
                    )[0];

                    $scope.priceRule.suitable_user = {normal: false, vip: false};
                    if(data.suitable_user === 'normal'){
                        $scope.priceRule.suitable_user['normal'] = true;
                    }else if(data.suitable_user === 'vip'){
                        $scope.priceRule.suitable_user['vip'] = true;
                    }else if(data.suitable_user === 'all'){
                        $scope.priceRule.suitable_user['normal'] = true;
                        $scope.priceRule.suitable_user['vip'] = true;
                    }
                    _.each($scope.ruleTypesArr, function(rule){
                        rule.value === data.rule_type ? $scope.filterOption.ruleType = rule : '';
                    });
                    if($scope.updateRule.rule_define === 1){
                        $scope.priceRule.discounts = $scope.updateRule.discounts[0].discount_data;
                    }else if($scope.updateRule.rule_define === 2){
                        _.each($scope.rentUnits, function(item){
                            item.value === $scope.updateRule.rent_type ? $scope.filterOption.rent_type = item : '';
                        });
                        $scope.priceRule.rent_amount = $scope.updateRule.rent_amount;
                        $scope.priceRule.discounts = $scope.updateRule.discounts[0].discount_data;
                    }else if($scope.updateRule.rule_define === 3){
                        _.each($scope.rentTypes, function(item){
                            item.value === $scope.updateRule.rent_type ? $scope.filterOption.rent_type = item : '';
                        });
                        $scope.priceRule.discounts = data.rent_type==='day'? dateToDiscount(data.discounts): timeToDiscount(data.discounts);

                    }
                    getRoomTypes();
                    getCities();
                    getBuildings();
                    getProductList();
                });
            };

            var getProductList = function() {
                PriceService.getProductList().success(function(data) {
                    $scope.products = data;
                    if($scope.pageFlag === 'edit'){
                        _.each($scope.products, function(product){
                            product.id === $scope.updateRule.bind_product_id ? $scope.filterOption.product = product: '';
                        });
                    }
                });
            };

            var getCities = function(){
                var params = {'permission[]': 'sales.building.price', op: 2};
                PriceService.getCities(params).success(function(data) {
                    $scope.cities = data;
                    if($scope.pageFlag === 'edit'){
                        _.each($scope.cities, function(city){
                            $scope.updateRule.suitable_area.city_id === city.id? $scope.filterOption.city = city: '';
                        });
                    }
                });
            };

            var getBuildings = function(){
                var params = {'permission[]': 'sales.building.price', op: 2, };
                if($scope.filterOption.city){
                    params.city = $scope.filterOption.city.id;
                }
                PriceService.getBuildings(params).success(function(data) {
                    $scope.buildings = [];
                    _.each(data, function(building){
                        building.status==='accept' && building.visible ? $scope.buildings.push({id: building.id, name: building.name}):'';
                    });

                    if($scope.pageFlag === 'edit'){
                        _.each($scope.buildings, function(building){
                            _.each($scope.updateRule.suitable_area.building_id, function(item){
                                building.id === item ? building.select = true : '';
                            });
                        });
                    }
                });
            };

            var getRooms = function(){
				var params = {'building[]': $scope.building_ids, 'type[]': $scope.priceRule.types};

				PriceService.getRooms(params).success(function(data){
				    $scope.roomList = {};
				    $scope.rooms = {};
				    _.each(data, function(room){
    				    $scope.rooms[room.number] = room.number;
    				    $scope.roomList[room.number] = {building_id: room.building.id, room_no: room.number};
				    });

                    var roomNumber = _.pluck(data, 'number');
                    if($scope.pageFlag === 'edit' && data.length > 0){
                        if(_.union(roomNumber, $scope.updateRule.suitable_area.rooms).length === roomNumber.length){
                            $scope.filterOption.rooms = $scope.updateRule.suitable_area.rooms;
                        }
                    }
				})
            };

            var parseTimeToFloat = function(time){
                var date = new Date(time), hour = date.getHours(), mins = date.getMinutes();
                hour = mins > 0 ? (hour + 0.5)*2: 2*hour;
                hour = mins === 59? 48: hour;
                return hour;
            };

            var timeToDiscount = function(discount){
                var temp = [[], [], [], [], [], [], []];
                _.each(temp, function(item){
                    for(var i = 0; i < 48; i++){
                        item.push(null);
                    }
                });
                _.each(discount, function(item){
                    var arr = [], start = parseTimeToFloat(item.start_time), end = parseTimeToFloat(item.end_time) - 1;
                    for(var i = 0; i < 48; i++){
                        if(i >= start && i <= end){
                            arr.push(item.discount_data);
                        }else{
                            arr.push(null);
                        }
                    }
                    temp.splice(item.day-1, 1, arr);
                });
                return temp;
            };

            var dateToDiscount = function(discount){
                var temp = [null, null, null, null, null, null, null];
                _.each(discount, function(item){
                    temp.splice(item.day-1, 1, item.discount_data);
                });
                return temp;
            };

            var getTime = function(number){
                return $scope.times[number].name;
            };

            var validatePriceRule = function(rule) {
                var errors = [];

                if (!rule.rule_name) errors.push('请填写规则名称');
                if (!rule.start_time) errors.push('请设置开始时间');
                if (!rule.end_time) errors.push('请设置结束时间');
                if (!rule.suitable_user) errors.push('请选择适用用户类型');
                if (!rule.rule_define) errors.push('请选择规则定义');
                if (!rule.city_id) errors.push('请选择城市！');
                if (rule.buildings.length === 0) errors.push('请选择大楼！');

                if (rule.rule_define <= 2) { // 适用对象、长订单
                  if (!rule.rule_type) errors.push('请选择规则类型');
                  if(rule.rule_type === 1){
                    if($scope.priceRule.discounts > $scope.priceRule.limit_min){
                        errors.push('满减的价格模板的下限金额应该大于或等于现金减免的金额');
                    }
                  }
                  if (!rule.discounts && rule.discounts !== 0) errors.push('请设置优惠或折扣值');
                  if (rule.discounts < 0) errors.push('优惠或折扣值不能为负');
                  if (rule.rule_type === 2 && rule.discounts > 99) errors.push('折扣值最高为99');
                  if (!rule.limit_min && rule.limit_min !== 0) errors.push('请设置金额下限');
                  if (!rule.limit_max && rule.limit_max !== 0) errors.push('请设置金额上限');
                  if (rule.limit_min > rule.limit_max) errors.push('金额上下限颠倒');
                }

                if (rule.rule_define === 2) { // 长订单
                  if (!rule.rent_type) errors.push('请选择租用单位');
                  if (rule.rent_type !== 'month' &&
                      !rule.rent_amount) errors.push('请设置租用时长');
                  if (rule.rent_type !== 'month' &&
                      rule.rent_amount < 0) errors.push('非法租用时长');
                  if (rule.rent_type === 'hour') rule.types = ['meeting'];
                  else if (rule.rent_type === 'day') rule.types = ['fixed', 'flexible'];
                  else if (rule.rent_type === 'month') rule.types = ['office'];
                }

                if (rule.rule_define === 3) { // 优惠时段
                  if (!rule.rent_type) errors.push('请选择起租类型');
                }

                return errors;
            };

            var initCreate = function(){
				var params = angular.copy($scope.priceRule);

                if($scope.priceRule.suitable_user.normal && $scope.priceRule.suitable_user.vip){
                    params.suitable_user = 'all';
                }else if($scope.priceRule.suitable_user.normal && !$scope.priceRule.suitable_user.vip){
                    params.suitable_user = 'normal';
                }else if(!$scope.priceRule.suitable_user.normal && $scope.priceRule.suitable_user.vip){
                    params.suitable_user = 'vip';
                }else {
                    params.suitable_user = '';
                }
                params.start_time = formatDate(params.start_time, 'yyyy-MM-dd HH:mm:ss');
                params.end_time = formatDate(params.end_time, 'yyyy-MM-dd HH:mm:ss');
                params.rule_define = $scope.filterOption.rule_define ? $scope.filterOption.rule_define.value : '';
                if($scope.filterOption.product){
                    params.bind_product_id = $scope.filterOption.product.id;
                    params.bind_product_price = $scope.filterOption.product.product_price;
                    params.bind_product_description = $scope.filterOption.product.roduct_description;
                }
                params.city_id = $scope.filterOption.city ? $scope.filterOption.city.id: '';
                params.discounts = [];
                params.buildings = [];
                if(params.rule_define === 1){
                    _.each($scope.buildings, function(building){
                        if(building.select){
                            $scope.selectRooms[building.id] ? params.buildings.push({id: building.id, rooms: $scope.selectRooms[building.id].rooms}): params.buildings.push({id: building.id});
                        }
                    });
                    params.rule_type = $scope.filterOption.ruleType ? $scope.filterOption.ruleType.value: '';
                    params.discounts.push({discount_data: $scope.priceRule.discounts});
                }else if(params.rule_define === 2){
                    params.rent_type = $scope.filterOption.rent_type ? $scope.filterOption.rent_type.value: '';
                    _.each($scope.buildings, function(building){
                        building.select ? params.buildings.push({id: building.id}): '';
                    });
                    params.rule_type = $scope.filterOption.ruleType ? $scope.filterOption.ruleType.value: '';
                    if($scope.filterOption.rent_type && $scope.filterOption.rent_type.value === 'hour'){
                        params.rent_amount = $scope.priceRule.rent_amount;
                        params.types = ['meeting'];
                    }else if($scope.filterOption.rent_type && $scope.filterOption.rent_type.value === 'day'){
                        params.rent_amount = $scope.priceRule.rent_amount;
                        params.types = ['fixed', 'flexible'];
                    }else if($scope.filterOption.rent_type && $scope.filterOption.rent_type.value === 'month'){
                        params.types = ['office'];
                        params.rent_amount = 0;
                    }
                    params.discounts.push({discount_data: $scope.priceRule.discounts});
                }else if(params.rule_define === 3){
                    params.rule_type = 2;
                    params.rent_type = $scope.filterOption.rent_type ? $scope.filterOption.rent_type.value: '';
                    _.each($scope.buildings, function(building){
                        if(building.select){
                            $scope.selectRooms[building.id] ? params.buildings.push({id: building.id, rooms: $scope.selectRooms[building.id].rooms}): params.buildings.push({id: building.id});
                        }
                    });
                    if($scope.filterOption.rent_type.value === 'day'){
                        _.each($scope.priceRule.discounts, function(item, index){
                            if(item){
                                params.discounts.push({day: index + 1, discount_data: item});
                            }
                        });
                    }else if($scope.filterOption.rent_type.value === 'hour'){
                        _.each($scope.priceRule.discounts, function(arr, index){
                            var start = '', end = '', flag = false, discount = 0;;
                            _.each(arr, function(item, timeindex){
                                if(item && !flag){
                                    discount = item;
                                    start = timeindex;
                                    end = timeindex + 1;
                                    flag = true;
                                }else if(item && flag){
                                    end = timeindex + 1;
                                }
                            });
                            if(start){
                                params.discounts.push({day: index + 1, discount_data: discount, start_time: getTime(start), end_time: getTime(end)});
                            }
                        });
                    }
                }

				return params;
            };

            var humanizeHour = function(code, offset) {
                code += offset;
                var hour = code / 2;
                var half = code % 2 * 30;
                return sprintf.sprintf('%02d:%02d', hour, half);
            };

            var init = function() {
				if ($scope.pageFlag === 'list') {
				    getRoomTypes();
				    getPriceRules();
				}else if($scope.pageFlag === 'new'){
				    getCities();
				    getBuildings();
				    getRoomTypes();
				    getProductList();
				}else if($scope.pageFlag === 'edit'){
                    getPriceRule();
				}
            };

            init();

            $scope.search = function () {
                $scope.refresh = true;
                $scope.filterOption.rule = '';

                currentSearchKey = $scope.filterOption.searchKey.toString();
                $scope.pageOptions.pageIndex = 1;
                events.emit('pagination');
            };

            $scope.createPriceRule = function() {
                var params = initCreate();
                var errors = validatePriceRule(params);
                if(errors.length > 0){
                    _.each(errors, function(error) {
                        noty('error', error);
                    });
                }else{
                    if(!$scope.sendFlag){
                        $scope.sendFlag = true;
                        PriceService.createPriceRule(params).success(function(data){
                            console.log(data);
                            $scope.sendFlag = false;
                            PriceService.updateSearchParam('type', 'list');
                        });
                    }
                }
            };

            $scope.updatePriceRule = function() {
                var params = initCreate();
                var errors = validatePriceRule(params);

                PriceService.updatePriceRule(PriceService.getSearchParam('id'), params).success(function(data) {
                    noty('info', '价格模板修改成功。');
                    PriceService.updateSearchParam('type', 'list');
                }).error(function(data){

                });
            };

            $scope.goPage = function(index){
                $scope.pageOptions.pageIndex = index;
                getPriceRules();
            };

            $scope.selectBuilding = function(){
                $scope.building_ids = _.filter(
                    $scope.buildings,
                    function (building) {
                        return building.select;
                    }
                );
                $scope.building_ids = _.pluck($scope.building_ids, 'id');
                getRooms();
            };

            $scope.selectRoomType = function(){
                $scope.priceRule.types = _.filter(
                    $scope.roomTypes,
                    function (type) {
                        return type.select;
                    }
                );
                $scope.priceRule.types = _.pluck($scope.priceRule.types, 'name');
                getRooms();
            };

            $scope.showNew = function() {
                PriceService.updateSearchParam('type', 'new');
            };

            $scope.showEdit = function(rule) {
                PriceService.updateSearchParam('type', 'edit');
                PriceService.updateSearchParam('id', rule.id);
            };

            $scope.canModify = function() {
              return $scope.currentAdmin && $scope.currentAdmin.type &&
                ($scope.currentAdmin.permissionMap['sales.building.price'] === 2);
            };

            $scope.back = function() {
                PriceService.updateSearchParam('type', '');
            };

            $scope.daySelected = function(data) {
                $scope.priceRule.discounts = data;
                var first = _.findIndex(data, function(i) {return i == -1;});
                var last = _.findLastIndex(data, function(i) {return i == -1;});
                events.emit('modal', {
                    scope: $scope,
                    title: weekdays[first] + ' ～ ' + weekdays[last],
                    backdrop: 'static',
                    animation: 'am-fade-and-slide-top',
                    template: 'discountsettingTpl'
                });
            };

            $scope.discountFormatter = function(discount) {
                if (!discount) return '0% off';
                if (discount === -1) return '';
                return discount.toString() + '% off';
            };

            $scope.closeModal = function($hide) {
                DaySelectorApi.reset();
                HourSelectorApi.reset();
                $hide();
            };

            $scope.setDiscount = function(discount, adhoc, $hide) {
                if(discount > 0 && discount <= 99){
                    $hide();
                    PriceService.setDiscountData($scope.priceRule.discounts, adhoc ? discount : null);
                    noty('info', '折扣设置成功。');
                }else if(discount <= 0 || discount > 99){
                    noty('error', '折扣不能小于等于0或大于99！');
                }
            };

            $scope.timeSelected = function(data) {
                $scope.priceRule.discounts = data;
                var corners = PriceService.getCorners(data);
                events.emit('modal', {
                    scope: $scope,
                    title: weekdays[corners[0][1]] + ' ~ ' + weekdays[corners[1][1]] + ' ' +
                           humanizeHour(corners[0][0], 0) + ' - ' + humanizeHour(corners[1][0], 1),
                    backdrop: 'static',
                    animation: 'am-fade-and-slide-top',
                    template: 'discountsettingTpl'
                });
            };

            $scope.popDeleteRule = function(rule) {
                events.emit('confirm', {
                    scope: $scope,
                    title: '删除当前规则',
                    animation: 'am-fade-and-slide-top',
                    content: '是否确认删除' + rule.rule_name + '？警告：删除后不可恢复！',
                    onConfirm: function (){
                        PriceService.deletePriceRule(rule.id).success(function() {
                            noty('success', rule.rule_name + '已删除。');
                            getPriceRules();
                        }).error(function(){
                            noty('error', rule.rule_name + '无法删除。');
                        });
                    }
                });
            };

            $scope.popToggleRule = function(rule, status) {
                var action    = status === 0 ? '启用' : '停用';
                var reversion = status === 0 ? '停用' : '启用';
                events.emit('confirm', {
                    scope: $scope,
                    title: action + '当前规则',
                    animation: 'am-fade-and-slide-top',
                    content: '是否确认' + action + rule.rule_name + '？' + action + '后仍可随时' + reversion + '该规则',
                    onConfirm: function () {
                        PriceService.togglePriceRule(rule.id, status).success(function(data){
                            noty('success', rule.rule_name + '已' + action + '。');
                            getPriceRules();
                        }).error(function(){
                            noty('error', rule.rule_name + '无法' + action + '。');
                        });
                    }
                });
            };

            $scope.$watch('filterOption.rent_type', function(newValue, oldValue) {
                if (newValue === oldValue) return;
                if(newValue.value === 'day'){
                    $scope.priceRule.types = ['fixed', 'flexible'];
                }else if(newValue.value === 'hour'){
                    $scope.priceRule.types = ['meeting'];
                }
                $scope.filterOption.rooms = [];
                getRooms();
            }, true);

            $scope.$watch('filterOption.rule', function(newValue, oldValue) {
                if (newValue === oldValue) return;
                if(!$scope.refresh){
                    events.emit('pagination');
                }
            }, true);

            $scope.$watch('filterOption.city', function(newValue, oldValue) {
                if (newValue === oldValue) return;
                getBuildings();
            }, true);

            $scope.$watchCollection('filterOption.rooms', function(newValue, oldValue) {
                if (!$scope.priceRule || newValue === oldValue) return;
                if (newValue) {
                    $scope.selectRooms = {};
                    _.each(newValue, function(room, index){
                        if($scope.selectRooms){
                            if($scope.selectRooms[$scope.roomList[room].building_id] && $scope.selectRooms[$scope.roomList[room].building_id]['rooms'].length > 0){
                                $scope.selectRooms[$scope.roomList[room].building_id]['rooms'].push({room_no: $scope.roomList[room].room_no});
                            }else{
                                $scope.selectRooms[$scope.roomList[room].building_id] = {};
                                $scope.selectRooms[$scope.roomList[room].building_id]['rooms'] = [];
                                $scope.selectRooms[$scope.roomList[room].building_id]['rooms'].push({room_no: $scope.roomList[room].room_no});
                            }

                        }else{
                            $scope.selectRooms[$scope.roomList[room].building_id] = {};
                            $scope.selectRooms[$scope.roomList[room].building_id]['rooms'] = [];
                            $scope.selectRooms[$scope.roomList[room].building_id]['rooms'].push({room_no: $scope.roomList[room].room_no});
                        }
                    });
                }
            }, true);

            events.on(
                'refreshprice',
                function() {
                    $scope.refresh = true;
                    $scope.filterOption.searchKey = '';
                    $scope.filterOption.rule = null;
                    currentSearchKey = '';
                    $scope.pageOptions.pageIndex = 1;
                    events.emit('pagination');
                },
                true
            );
        };

        return ['$scope', 'events', 'utils', '$alert', 'PriceService', 'CurrentAdminService', 'DaySelectorApi', 'HourSelectorApi', 'CONF', '$translate', '$filter', PriceController];

    });

})(define);
