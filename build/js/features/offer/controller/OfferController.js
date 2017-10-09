/**
 *  Defines the OfferController controller
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the OfferController class with RequireJS
     */
    define(['lodash', 'angular', 'jquery'], function(_, angular, $) {

        /**
         * @constructor
         */
        var OfferController = function($rootScope, $scope, OfferService, events, $filter, CONF, CurrentAdminService, utils, $timeout, $cookies, $location) {

            $scope.pageType = OfferService.getSearchParam('ptype') ? OfferService.getSearchParam('ptype') : 'list';
            $scope.spaceDetailTab = 1;
            $scope.contractTab = 1;
            $scope.now = new Date();
            $scope.dropDownOptions = [
                {name: '订单号'},
                {name: '空间名(包含)'}
            ];
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: OfferService.getSearchParam('pageIndex') ? parseInt(OfferService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.PERMISSION_KEY = 'sales.platform.lease_offer';
            $scope.placeholder = {
                all: '全部',
                tenantry: '报价号',
                community: '所有社区（显示该销售方下的所有社区）',
                commense: '起租日'
            };
            
            $scope.radio = {
                personal: 'personal',
                enterprise: 'enterprise'
            }
            $scope.keywordList = OfferService.getKeywordList();
            $scope.filterStatus = OfferService.getStatus();
            $scope.filterOption = {};
            $scope.filterOption.keywordObj = $scope.keywordList[0];
            $scope.search = {
                building: '',
                space: '',
                customer: ''
            };
            $scope.selectedSearchData = {
                building: '',
                space: '',
                customer: ''
            };
            $scope.searchReponse = {
                building: '',
                space: '',
                customer: ''
            };
            $scope.offerOption = {
                status: 'offer',
                lessee_type: 'personal'
            };
            $scope.statusDesc = OfferService.getStatusDesc();
            $scope.offer = {
                remark: ''
            };
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };
            $scope.selected = false;

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var getTableItems = function(){
                var params = {object: 'lease_offer'};
                OfferService.getTableItems(params).success(function(data){
                    $scope.dragModels.tableItems = data;
                    $scope.copyTableItem = angular.copy(data);
                });
            };

            var getTableHeaders = function(){
                var params = {object: 'lease_offer'};
                OfferService.getTableHeader(params).success(function(data){
                    $scope.tableHeaders = data;
                    $timeout(function() {
                        cusBConWidth();
                    }, 200);
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

            var getSupplementaryList = function(){
                OfferService.getSupplementaryList().success(function(data){
                    $scope.supplementaryList = data;
                    $scope.copysupplementaryList = angular.copy(data);
                });
            };

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var formatData = function(item){
                item.customization = _.pick(item, 'serial_number', 'lessee_enterprise', 'number');
                item.customization.room_name = item.product.room.name;
                item.customization.room_type_tag = item.product.room.type_tag_description;
                item.customization.start_date = item.start_date && item.end_date ? formatDate(item.start_date, 'yyyy-MM-dd') + ' - ' + formatDate(item.end_date, 'yyyy-MM-dd') : ' - ' ;
                item.customization.creation_date = formatDate(item.creation_date, 'yyyy-MM-dd HH:mm:ss');
                item.customization.monthly_rent = item.monthly_rent ? item.monthly_rent + ' 元/月' : '';
                item.customization.total_rent = item.total_rent ? item.total_rent + '元' : '';
                item.customization.lessee_type = item.lessee_type === 'personal' ? '个人承租' : '企业承租';
                item.customization.status = $scope.statusDesc[item.status];
                item.customization.lessee_customer = item.customer.name;
                item.customization.deposit = item.deposit ? item.deposit + '元' : '';
                item.customization.lease_rent_types = _.pluck(_.filter(item.lease_rent_types, 'type', 'tax'), 'name').join(';  ')
                return item;
            };

            var getFilterParams = function(){
                OfferService.getSearchParam('keyword_search') ? $scope.filterOption.keyword_search = OfferService.getSearchParam('keyword_search') : '';
                OfferService.getSearchParam('create_start') ? $scope.filterOption.create_start = OfferService.getSearchParam('create_start') : '';
                OfferService.getSearchParam('create_end') ? $scope.filterOption.create_end = OfferService.getSearchParam('create_end') : '';
                OfferService.getSearchParam('start_date') ? $scope.filterOption.start_date = OfferService.getSearchParam('start_date') : '';
                OfferService.getSearchParam('end_date') ? $scope.filterOption.end_date = OfferService.getSearchParam('end_date') : '';
                OfferService.getSearchParam('building') ? $scope.filterOption.building = OfferService.getSearchParam('building') : '';
                OfferService.getSearchParam('keyword') ? $scope.filterOption.keywordObj = _.find($scope.keywordList, function(item){return item.value == OfferService.getSearchParam('keyword')}): '';
                OfferService.getSearchParam('status') ? $scope.filterOption.statusObj = _.find($scope.filterStatus, function(item){return item.value == OfferService.getSearchParam('status')}): '';
            };


            var initFilterParams = function(){
                $scope.filterOption.keyword_search ? $scope.filterOption.keyword_search = $scope.filterOption.keyword_search : '';
                $scope.filterOption.create_start ? $scope.filterOption.create_start = formatDate($scope.filterOption.create_start, 'yyyy-MM-dd') : '';
                $scope.filterOption.create_end ? $scope.filterOption.create_end = formatDate($scope.filterOption.create_end, 'yyyy-MM-dd') : '';
                $scope.filterOption.statusObj ? $scope.filterOption.status = $scope.filterOption.statusObj.value : '';
                $scope.filterOption.keywordObj ? $scope.filterOption.keyword = $scope.filterOption.keywordObj.value : '';
                $scope.filterOption.buildingObj ? $scope.filterOption.building = $scope.filterOption.buildingObj.id : '';

                if($scope.filterOption.start_date){
                    $scope.filterOption.start_date = formatDate($scope.filterOption.start_date, 'yyyy-MM-dd');
                    $scope.filterOption.rent_filter = 'rent_start';
                }
                if($scope.filterOption.end_date){
                    $scope.filterOption.end_date = formatDate($scope.filterOption.end_date, 'yyyy-MM-dd');
                    $scope.filterOption.rent_filter = 'rent_start';
                }


                var cache = _.pick($scope.filterOption,'keyword', 'keyword_search', 'create_end', 'create_start', 'end_date', 'start_date', 'status', 'rent_filter', 'building');
                return cache;
            };

            $scope.resetSearch = function(){
                $scope.filterOption = {
                    create_start: '',
                    create_end: '',
                    start_date: '',
                    end_date: '',
                    statusObj: '',
                    building: '',
                    keyword_search: '',
                    keywordObj: ''
                };
                getFilterParams();
            };

            $scope.searchList = function(){
                var params = initFilterParams();
                console.log(params)
                for(var key in params){
                    OfferService.updateSearchParam(key, params[key]);
                }
                $scope.filterOption.building ? OfferService.updateSearchParam('building', $scope.filterOption.buildingObj.id) : OfferService.updateSearchParam('building', '');
                $scope.filterOption.keyword ? '' : OfferService.updateSearchParam('keyword', '');
                OfferService.updateSearchParam('pageIndex', '');
            };

            $scope.clearSearchFilters = function(){
                $scope.filterOption = {};
                _.each($location.search(), function(value, key){
                    OfferService.updateSearchParam(key, '');
                });
            };

            var getBuildingList = function() {
                var params = {
                    op: 1
                };
                params['permission[]'] = $scope.PERMISSION_SPACE_KEY;
                OfferService.getBuildingList(params).success(function(data) {
                    $scope.buildings = _.filter(data, function(item) {return item.visible});
                    OfferService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildings, function(item){return item.id == OfferService.getSearchParam('building')}): '';
                });
            };

            var getOfferList = function(){
                var params = {pageLimit: $scope.pageOptions.pageSize, pageIndex: $scope.pageOptions.pageIndex};
                OfferService.getOfferList(params).success(function(data){
                    $scope.offerList = data.items;
                    _.each($scope.offerList, function(item){
                        item = formatData(item);
                    });
                    $scope.pageOptions.totalNum = data.total_count;
                });
            };

            var getProductDetail = function(productid){
                OfferService.getProductDetail(productid).success(function(data){
                    $scope.selectedSearchData.space = data.room;
                    $scope.selectedSearchData.space.product_id = data.id;
                    $scope.selectedSearchData.space.preview = data.room.attachment[0].attachment_id.content;
                    $scope.search.space = {};
                    $scope.search.space.key = data.room.name;
                });
            };

            var getOfferDetail = function(id){
                getRemarks(id);
                OfferService.getOfferDetail(id).success(function(data){
                    $scope.offerOption = _.pick(data, 'start_date', 'status', 'end_date', 'lessor_name', 'lessor_address', 'lessor_phone', 'lessor_contact', 'lessor_email', 'lessee_type', 'lessee_enterprise', 'monthly_rent', 'total_rent', 'purpose', 'deposit', 'other_expenses', 'supplementary_terms');
                    $scope.offerItem = data;
                    $scope.offerItem.leaseRentType = _.pluck(_.filter(data.lease_rent_types, 'type', 'rent'), 'name').join(';  ');
                    $scope.offerItem.leaseTaxType = _.pluck(_.filter(data.lease_rent_types, 'type', 'tax'), 'name').join(';  ');
                    $scope.selectedSearchData.customer = data.customer;
                    $scope.search.customer = {};
                    $scope.search.customer.key = data.customer.name;
                    data.product_id ? getProductDetail(data.product_id) : '';
                    $scope.supplementaryList = angular.copy($scope.copysupplementaryList);
                    var temp = {};
                    _.each(data.lease_rent_types, function(item){
                        temp[item.id] = item.name;
                    });
                    _.each($scope.supplementaryList, function(item){
                        item.selected = temp[item.id] ? true : false;
                    });
                });
            };

            var getRemarks = function(id){
                var params = {
                    object: 'lease_offer',
                    object_id: id
                };
                OfferService.getOfferRemarks(params).success(function(data){
                    $scope.clueRemarks = data;
                });
            };

            var addRemarkForOffer = function(){
                var params = {
                    'object': 'lease_offer',
                    'object_id': $scope.offerItem.id,
                    'remarks': $scope.offer.remark
                };
                OfferService.addRemarks(params).success(function(){
                    noty('info', '增加备注成功！');
                    getRemarks($scope.offerItem.id);
                });
            };

            var initParams = function(){
                var params = angular.copy($scope.offerOption);
                $scope.selectedSearchData.building ? params.building_id = $scope.selectedSearchData.building.building_id : '';
                $scope.selectedSearchData.space ? params.product_id = $scope.selectedSearchData.space.product_id : '';
                $scope.selectedSearchData.customer ? params.lessee_customer = $scope.selectedSearchData.customer.id : '';
                params.rent_type_ids = _.pluck(_.filter($scope.supplementaryList, 'selected', true), 'id');
                return params;
            };

            var validParams = function(param, msg){
                if(param){
                    noty('error', msg);
                    return false;
                }
                return true;
            };

            var validOfferOption = function(params){
                var validationFlag = true;
                validationFlag = validationFlag ? validParams(!params.lessor_name, '出租方名称不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!params.lessor_address, '出租方地址不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!params.lessor_contact, '出租方联系人不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!params.lessor_phone, '出租方电话不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!params.lessor_email, '出租方邮箱不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(params.lessor_email && !utils.isEmail(params.lessor_email), '出租方邮箱格式不对！') : validationFlag;
                validationFlag = validationFlag ? validParams(!params.lessee_customer, '承租方联系人不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(params.lessee_type === 'enterprise' && !params.lessee_enterprise, '承租企业不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(params.monthly_rent && !utils.isNumber(params.monthly_rent), '月租金格式不对！') : validationFlag;
                validationFlag = validationFlag ? validParams(params.total_rent && !utils.isNumber(params.total_rent), '合同总租金格式不对！') : validationFlag;
                validationFlag = validationFlag ? validParams(params.deposit && !utils.isNumber(params.deposit), '租赁压金格式不对！') : validationFlag;
                return validationFlag;
            };

            var getClueDetail = function(){
                OfferService.getClueDetail($cookies.get('object_id')).success(function(data){
                    console.log(data);
                    $scope.selectedSearchData.customer = data.customer;
                    $scope.search.customer = {};
                    $scope.search.customer.key = data.customer.name;
                    $scope.offerOption = _.pick(data, 'number', 'monthly_rent', 'cycle', 'start_date', 'lessee_email', 'lessee_phone', 'lessee_address', 'lessee_name');
                    // data.building_id ? getBuilding(data.building_id) : '';
                    data.product_id ? getProductDetail(data.product_id) : '';
                });
                $cookies.put('convert_object', '');
                $cookies.put('object_id', '');
            };

            var init = function(){
                $rootScope.crumbs = {first: '租赁报价'};
                getTableItems();
                getTableHeaders();
                getOfferList();
                getBuildingList();
                getSupplementaryList();
                if($cookies.get('convert_object') === 'offer'){
                    getClueDetail();
                    $scope.operateFlag = 'add';
                    events.emit('modal', {
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade-and-slide-top',
                        template: 'offerItemTpl'
                    });
                }
            };

            init();

            $scope.switchLeaseeType = function(type){
                $scope.offerOption.lessee_type = type;
            };

            $scope.saveOffer = function($hide){
                var params = initParams();
                if(validOfferOption(params)){
                    OfferService.addOffer(params).success(function(){
                        $hide();
                        noty('info', '创建租赁报价成功！');
                        getOfferList();
                    });
                }
            };

            $scope.updateOffer = function($hide){
                var params = initParams();
                if(validOfferOption(params)){
                    OfferService.updateOffer($scope.offerItem.id, params).success(function(){
                        $hide();
                        noty('info', '编辑租赁报价成功！');
                        getOfferList();
                    });
                }
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
                    object: 'lease_offer',
                    list_ids: []
                };
                var tempArr = _.filter($scope.dragModels.tableItems, function(item){
                    return item.required || item.checked; 
                }) ;
                params.list_ids = _.pluck(tempArr, 'id');
                OfferService.updateTableColumn(params).success(function(){
                    $scope.cusDrop = false;
                    getTableHeaders();
                    noty('info', '设置表格成功！');
                });
            };

            $scope.searchBuilding = function(){
                var params = {};
                if($scope.search.building){
                    params.query = $scope.search.building.key;
                    OfferService.getBuildings(params).success(function(data){
                        $scope.searchReponse.building = data;
                    });
                }
            };

            $scope.searchSpace = function(){
                var params = {};
                if($scope.search.space){
                    $scope.search.building ? params.building = $scope.selectedSearchData.building.id : '';
                    params.query = $scope.search.space.key;
                    OfferService.getBuildingSpaces(params).success(function(data){
                        $scope.searchReponse.space = data;
                        _.each($scope.searchReponse.space, function(item){
                            item.id = item.room_id;
                        });
                    });
                }
            };

            $scope.searchCustomer = function(){
                var params = {};
                if($scope.search.customer){
                    params.query = $scope.search.customer.key;
                    OfferService.getCustomers(params).success(function(data){
                        $scope.searchReponse.customer = data;
                    });
                }
            };

            $scope.createOffer = function(){
                console.log($scope.offerOption);
            };

            $scope.showOfferDialog = function(flag, item){
                $scope.operateFlag = flag;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'offerItemTpl'
                });
                flag === 'detail' ? getOfferDetail(item.id) : '';
                flag === 'add' ? $scope.supplementaryList = angular.copy($scope.copysupplementaryList) : '';
            };

            $scope.showRemark = function(){
                $scope.remarkFlag = true;
            };

            $scope.addRemark = function(){
                $scope.remarkFlag = false;
                if($scope.offer.remark){
                    addRemarkForOffer();
                }
            };

            $scope.toggleRemark = function(){
                $scope.remarkListFlag = !$scope.remarkListFlag;
            };

            $scope.closeOffer = function($hide){
                var params = {'status': 'closed'};
                OfferService.closeOffer($scope.offerItem.id, params).success(function(){
                    $hide();
                    noty('info', '作废报价成功！');
                });
            };

            $scope.showUpdate = function(){
                $scope.operateFlag = 'update';
            };

            $scope.showPrint = function(){
                $scope.operateFlag = 'pdf';
            };

            $scope.goPage = function(index){
                OfferService.updateSearchParam('pageIndex', index);
            };

            $scope.exportPDF = function($hide){
                window.location.href = CONF.api + 'sales/admin/pdf/lease/offers/' + $scope.offerItem.id + '?company=' + $cookies.get('salesCompanyId');
                $hide();
            };

            $scope.$watch('selectedSearchData.building', function(newValue, oldValue){
                if(newValue === oldValue){
                    return;
                }
                newValue && newValue.id ? newValue.building_id = newValue.id : '';
                if(newValue.building_id && newValue.building_id !== $scope.selectedSearchData.space.building_id){
                    $scope.search.space = {};
                    $scope.search.space.key = '';
                    $scope.selectedSearchData.space.preview = '';
                    $scope.selectedSearchData.space.area = '';
                    $scope.selectedSearchData.space.allowed_people = '';
                }
            }, true);

            $scope.$watch('selectedSearchData.space', function(newValue, oldValue){
                if(newValue === oldValue){
                    return;
                }
                console.log(newValue);
                if(newValue.product_id && $scope.selectedSearchData.building.building_id != newValue.building_id){
                    
                    $scope.selectedSearchData.building = {
                        building_id: newValue.building_id,
                        address: newValue.building_address
                    };
                    $scope.search.building = {};
                    $scope.search.building.key = newValue.building_name;
                }
            }, true);
            
        }
        return ['$rootScope', '$scope', 'OfferService', 'events', '$filter', 'CONF', 'CurrentAdminService', 'utils', '$timeout', '$cookies', '$location', OfferController];

    });

})(define);
