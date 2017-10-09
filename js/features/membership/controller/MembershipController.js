/**
 *  Defines the MembershipController controller
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function (define) {
    'use strict';

    /**
     * Register the MembershipController class with RequireJS
     */
    define(['lodash', 'angular'], function (_, angular) {

        /**
         * @constructor
         */
        var MembershipController = function ($rootScope, $sce, $scope, $cookieStore, events, utils, MembershipService, CurrentAdminService, $alert, FileUploader, CONF, $filter, $location, ImageUploaderService, SbCropImgService) {
            
            $scope.pageType = MembershipService.getSearchParam('pageType') ? MembershipService.getSearchParam('pageType') : 'list';
            $scope.tabType = MembershipService.getSearchParam('tabType') ? MembershipService.getSearchParam('tabType') : 'space';
            $scope.cardFlag = MembershipService.getSearchParam('cardFlag') ? MembershipService.getSearchParam('cardFlag') : '';
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.uploadImgServer = CONF.api + 'plugins/fileServer/fileservice/sales/admin';
            $scope.PERMISSION_KEY = 'sales.platform.membership_card';
            $scope.PERMISSION_CARD_SALES_KEY = 'sales.platform.membership_card_product';
            $scope.PERMISSION_CARD_ORDER_KEY = 'sales.platform.membership_card_order';
            
            $scope.createOption = {doors_control: []};
            $scope.upLoadImg = {};
            $scope.backgroundImg = {};
            $scope.images = [];
            $scope.detailTab = 0;
            $scope.cardRules = [];
            $scope.delRules = [];
            $scope.userOptions = {};

            $scope.gallery = {
                width: 640,
                height: 420
            };
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: MembershipService.getSearchParam('pageIndex') ? parseInt(MembershipService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.cropOptions = {
                width: 640,
                height: 420,
                target: 'membership',
                previewFlag: true
            }
            $scope.cropObj = {
                coords: [0, 0, 100, 100, 100, 100],
                thumbnail: false
            };
            $scope.draftImageUploader = ImageUploaderService.createUncompressedImageUploader(
                'useless',
                function(item, response){
                    console.log(item);
                    console.log(response);
                    $scope.seeDialog(response);
                }
            );

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

            var getUsers = function(params){
                MembershipService.getUserList(params).success(function(data){
                    _.each(data, function(item){
                        item.avatar = CONF.file + '/person/' + item.id + '/avatar_small.jpg';
                        $scope.userOptions[item.id] = item;
                    });
                });
            };

            var getBuildings = function() {
                var params = {
                    op: 1
                };
                params['permission[]'] = $scope.PERMISSION_KEY;
                MembershipService.getBuildings(params).success(function(data) {
                    $scope.buildings = _.filter(data, function(item) {return item.visible});
                    $scope.pageType == 'editCard' || $scope.pageType == 'copyCard' ? initEditCard() : '';
                });
            };

            var getDoors = function(item, type){
                MembershipService.getDoors({building: item.id}).success(function(data){
                    item.doorLists = data;
                    if(($scope.pageType == 'editCard' || $scope.pageType == 'copyCard') && type == 'init') {
                        var doors = _.pluck($scope.membershipItem.doors_control, 'door_control_id');
                        item.doors = [];
                        _.each(item.doorLists, function(door) {
                            _.contains(doors, door.id) ? door.select = true : '';
                            door.selected ? item.doors.push(door) : '';
                        });
                    }
                });
            };

            var replaceEnter = function(aim, tag){
                aim = '<' + tag + '>' + aim + '</' + tag + '>';
                aim = aim.replace( /\n/g, '</' + tag + '><' + tag + '>'); 
                return aim;
            };

            var initRules = function() {
                $scope.cardRules = angular.copy($scope.cardRules.concat($scope.membershipItem.specification));
                var temp = {specification: '', price: '', valid_period: ''};
                while ($scope.cardRules.length < 4) {
                    $scope.cardRules.push(angular.copy(temp));
                }
            };

            var getSpecDesc = function(item) {
                var minPrice, maxPrice, minPeriod, maxPeriod;
                var prices = _.pluck(item.specification, 'price');
                var periods = _.pluck(item.specification, 'valid_period');

                minPrice = $filter('currency')(prices.length !== 0 ? _.min(prices) : 0, '');
                maxPrice = $filter('currency')(prices.length !== 0 ? _.max(prices) : 0, '');
                minPeriod = _.min(periods);
                maxPeriod = _.max(periods);

                item.priceDesc = minPrice == maxPrice ? minPrice : minPrice + ' - ' + maxPrice;
                item.periodDesc = minPeriod == maxPeriod ? minPeriod + '个月' : minPeriod + '个月 - ' + maxPeriod + '个月';
            };

            var initEditCard = function() {
                $scope.backgroundImg.download_link = $scope.membershipItem.background;
                $scope.createOption = _.pick($scope.membershipItem, 'name', 'description', 'instructions', 'phone');
                $scope.createOption.doors_control = [];
                var building_ids = _.pluck($scope.membershipItem.door_desc, 'building_id');
                _.each($scope.buildings, function(item) {
                    if(_.contains(building_ids, item.id)) {
                        item.selected = true;
                        getDoors(item, 'init');
                    }
                });
            };

            var getMembershipDetail = function() {
                $scope.loading = false;
                MembershipService.getMembershipDetail(MembershipService.getSearchParam('cardId')).success(function(data) {
                    $scope.membershipItem = data;
                    $scope.loading = true;
                    $scope.membershipItem.description_html = $sce.trustAsHtml(replaceEnter($scope.membershipItem.description, 'p'));
                    $scope.membershipItem.instructions_html = $sce.trustAsHtml(replaceEnter($scope.membershipItem.instructions, 'p'));
                    $scope.membershipItem.specification.length > 0 ? getSpecDesc($scope.membershipItem) : '';
                    $scope.membershipItem.door_c_list = _.filter($scope.membershipItem.doors_control, function(item) {return item.door_control_id});
                    $scope.membershipItem.door_desc = [];
                    var temp = (_.groupBy($scope.membershipItem.doors_control, function(door) {return door.building.id}));
                    _.each(temp, function(value, key){
                        $scope.membershipItem.door_desc.push({building_name: value[0].building.name, building_id: value[0].building.id, doors: value[0].door_control_id ? value : []});
                    });
                    $scope.pageType == 'salesRule' ? initRules() : '';
                    $scope.pageType == 'editCard' || $scope.pageType == 'copyCard' ? getBuildings() : '';
                });
            };

            var getMembershipList = function() {
                MembershipService.getMembershipList().success(function(data) {
                    $scope.membershipList = data.items;
                    _.each($scope.membershipList, function(item){
                        item.description = $sce.trustAsHtml(replaceEnter(item.description, 'p'));
                        item.instructions = $sce.trustAsHtml(item.instructions);
                        item.specification.length > 0 ? getSpecDesc(item) : '';

                        item.door_desc = [];
                        var temp = (_.groupBy(item.doors_control, function(door) {return door.building.id}));
                        _.each(temp, function(value, key){
                            item.door_desc.push({building_name: value[0].building.name, doors: value});
                        });
                    });
                });
            };

            var getMembershipOrders = function(){
                var params = {};
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                MembershipService.getMembershipOrders($scope.membershipItem.id, params).success(function(data){
                    $scope.membershipOrders = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each(data.items, function(item){
                        item.user ? arr.push(item.user) : '';
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                });
            };


            var initCreate = function() {
                _.each($scope.buildings, function(item) {
                    if(item.selected) {
                        var doors_control = {building_id: item.id, controls: []};
                        _.each(item.doorLists, function(door){
                            if(door.select){
                                doors_control.controls.push({control_id: door.id,control_name: door.name});
                            }
                        });
                        $scope.createOption.doors_control.push(doors_control);
                    }
                });
                if($scope.createOption.doors_control.length == 0) {
                    _.each($scope.buildings, function(item) {
                        var doors_control = {building_id: item.id, controls: []};
                        $scope.createOption.doors_control.push(doors_control);
                    });
                }
                $scope.createOption.background = $scope.backgroundImg.download_link;
            };

            var validCreate = function() {
                var validationFlag = true;

                validationFlag = validationFlag ? validParams(!$scope.createOption.name, '请输入会员卡名称！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.createOption.background, '请添加会员卡背景图！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.createOption.description, '请添加会员卡说明！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.createOption.instructions, '请添加会员卡使用须知！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.createOption.phone, '请输入客服电话！') : validationFlag;

                return validationFlag;
            };

            var validateRule = function(params) {
                var validationFlag = true;
                var re = /^[0-9]*[1-9][0-9]*$/;  
                if($scope.membershipItem.specification.length < 1 && params.add.length < 1) {
                    noty('error', '请至少完整填写一种规格！');
                    validationFlag = false;
                }
                if(_.filter(_.pluck($scope.cardRules, 'price'), function(item) {return item < 0;}).length > 0) {
                    noty('error', '会员卡金额不能小于零！');
                    validationFlag = false;
                }
                if(_.filter(_.without(_.pluck($scope.cardRules, 'valid_period'), ''), function(item) {return !re.test(item);}).length > 0) {
                    noty('error', '请输入正确的有效期！');
                    validationFlag = false;
                }
                return validationFlag;
            };

            var initEditRule = function() {
                var params = {
                    add: [],
                    modify: [],
                    remove: []
                };
                var temp = {};
                _.each($scope.membershipItem.specification, function(item) {
                    temp[item.id] = item;
                });
                _.each($scope.cardRules, function(item) {
                    if(item.id && (item.specification != temp[item.id].specification || item.price != temp[item.id].price || item.valid_period != temp[item.id].valid_period)) {
                        params.modify.push(item);
                    }
                    if(!item.id && item.specification && item.price && item.valid_period) {
                        params.add.push(item)
                    }
                });
                params.remove = $scope.delRules;

                return params;
            };

            var init = function() {
                $rootScope.crumbs = {first: '会员'};
                if($scope.pageType == 'list') {
                    getMembershipList();
                }else if($scope.pageType == 'detail') {
                    $rootScope.crumbs.second = '会员卡详情';
                    getMembershipDetail();
                }else if($scope.pageType == 'createCard') {
                    $rootScope.crumbs.second = '添加会员卡';
                    getBuildings();
                }else if($scope.pageType == 'salesRule') {
                    $rootScope.crumbs.second = '售卖设置';
                    getMembershipDetail();
                }else if($scope.pageType == 'editCard') {
                    $rootScope.crumbs.second = '编辑会员卡';
                    getMembershipDetail();
                }else if($scope.pageType == 'copyCard') {
                    $rootScope.crumbs.second = '创建会员卡';
                    getMembershipDetail();
                }
            };


            init();

            $scope.createMembership = function(type) {
                $scope.switchMethod = type;
                initCreate();
                if(validCreate()){
                    MembershipService.createMembership($scope.createOption).success(function(data) {
                        noty('info', '创建会员卡成功！');
                        $scope.seePage('salesRule', {id: data.id, cardFlag: 'new'});
                    });
                }
            };

            $scope.editMembership = function(type) {
                $scope.switchMethod = type;
                initCreate();
                if(validCreate()){
                    MembershipService.editMembership($scope.createOption, MembershipService.getSearchParam('cardId')).success(function() {
                        noty('info', '编辑会员卡成功！');
                        MembershipService.updateSearchParam('pageType', 'list');
                    });
                }
            };

            $scope.setCardVisible = function(flag, item, $hide) {
                var params = [{op: 'add', path: '/visible', value: flag}];
                MembershipService.setCardVisible(params, item.id).success(function() {
                    $hide ? $hide() : '';
                    flag ? noty('info', '上架会员卡成功！') : noty('info', '下架会员卡成功！');
                    $scope.pageType == 'list' ? getMembershipList() : getMembershipDetail();
                });
            };

            $scope.setSpecification = function() {
                var params = initEditRule();

                if(validateRule(params)) {
                    MembershipService.setSpecification(params, MembershipService.getSearchParam('cardId')).success(function() {
                        MembershipService.setCardVisible([{op: 'add', path: '/visible', value: true}],  MembershipService.getSearchParam('cardId')).success(function() {
                            noty('info', '编辑售卖设置成功！');
                            MembershipService.updateSearchParam('pageType', 'list');
                            MembershipService.updateSearchParam('cardFlag', '');
                        });
                    });
                }
            };

            $scope.backToList = function(){
                _.each($location.search(), function(value, key){
                    MembershipService.updateSearchParam(key, '');
                });
            };

            $scope.delRule = function(item, $index) {
                item.id ? $scope.delRules.push({id: item.id}) : '';
                item.id ? $scope.cardRules[$index].id = '' : '';
                $scope.cardRules[$index].specification = '';
                $scope.cardRules[$index].price = '';
                $scope.cardRules[$index].valid_period = '';
            }

            $scope.selectBuilding = function(item) {
                item.selected = !item.selected;
                getDoors(item);
            };

            $scope.switchCardDetailTab = function(tag) {
                $scope.detailTab = tag;
                if(tag == 1) {
                    getMembershipOrders();
                }
            };
             
            $scope.seePopover = function(type, item) {
                $scope.optionType = type;
                item ? $scope.membershipItem = item : '';
            };

            $scope.goPage = function(index){
                $scope.pageOptions.pageIndex = index;
                if($scope.detailTab == 1){
                    getMembershipOrders();
                }
            };
            
            $scope.seePage = function(type, item, $hide) {
                $hide ? $hide() : '';
                MembershipService.updateSearchParam('pageType', type);
                MembershipService.updateSearchParam('pageIndex', '');
                type == 'detail' || type == 'salesRule' || type == 'editCard' || type == 'copyCard' ? MembershipService.updateSearchParam('cardId', item.id) : '';
                type == 'salesRule' && item.cardFlag ? MembershipService.updateSearchParam('cardFlag', item.cardFlag) : '';
            };

            $scope.switchTab = function(tag){
                $scope.tabType = tag;
            };

            $scope.saveCropedImage = function($hide){
                SbCropImgService.cropImage($scope.upLoadImg.download_link, $scope.cropObj.coords, $scope.cropOptions, $scope.images);
                $hide();
            };

            $scope.seeDialog = function(img) {
                $scope.upLoadImg = img;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'cropDialogTpl'
                });
            };

            $scope.seeModal = function(type, $hide){
                $hide();
                if(type == 'confirm-invisible') {
                    events.emit('confirm', {
                        title: '下架会员卡',
                        content: '是否下架此会员卡? 下架后此会员卡将不在创合APP展示. 但你仍可对会员卡进行编辑以及上架操作.',
                        btnName: '下架',
                        onConfirm: function() {
                            $scope.setCardVisible(false, $scope.membershipItem, $hide)
                        }
                    });
                }else {
                    events.emit('confirm', {
                        title: '上架会员卡',
                        content: '是否上架此会员卡? 上架后此会员卡将在创合APP展示. 请确保信息正确.',
                        btnName: '上架',
                        btnClass: 'btn-success',
                        onConfirm: function() {
                            $scope.setCardVisible(true, $scope.membershipItem, $hide)
                        }
                    });
                }
            };

            $scope.seeOrderDetail = function(item) {
                var path = CONF.bizbase + 'trade?tabtype=member&ptype=memberDetail&orderId=' + item.id;
                window.open(path);
            };


            $scope.$watch('images', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                $scope.backgroundImg = $scope.images[0];
                console.log($scope.images);
            }, true);

        };

        return ['$rootScope', '$sce', '$scope', '$cookieStore', 'events', 'utils', 'MembershipService', 'CurrentAdminService', '$alert', 'FileUploader', 'CONF', '$filter', '$location', 'ImageUploaderService', 'SbCropImgService', MembershipController];

    });

})(define);