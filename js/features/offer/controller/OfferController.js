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
                commense: '起租日',
                building: '输入要选择的社区名',
                space: '输入要选择的空间名',
                company: '输入要选择的企业名'
            };
            
            $scope.radio = {
                personal: 'personal',
                enterprise: 'enterprise'
            }
            $scope.keywordList = OfferService.getKeywordList();
            $scope.filterStatus = OfferService.getStatus();
            $scope.filterOption = {
                create_start: '',
                create_end: '',
                start_date: '',
                end_date: '',
                keyword_search: ''
            };
            $scope.filterOption.keywordObj = $scope.keywordList[0];
            $scope.search = {
                building: '',
                space: '',
                customer: '',
                enterprise: ''
            };
            $scope.selectedSearchData = {
                building: '',
                space: '',
                customer: '',
                enterprise: ''
            };
            $scope.searchReponse = {
                building: '',
                space: '',
                customer: '',
                enterprise: ''
            };
            $scope.offerOption = {
                status: 'offer',
                lessee_type: 'personal'
            };
            $scope.statusDesc = OfferService.getStatusDesc();
            $scope.rentModes = OfferService.getRentMode();
            $scope.offer = {
                remark: ''
            };
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };
            $scope.selected = false;
            $scope.loaded = false;
            var searchParams = _.keys($location.search());
            if(searchParams.length > 2){
                $scope.showFilter = true;
            }else if(searchParams.length > 0 && searchParams.length <= 2 && !_.contains(searchParams, 'keyword')){
                $scope.showFilter = true;
            }else{
                $scope.showFilter = false;
            }
            $scope.tags = [];

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
                    cusBConWidth($scope.tableHeaders.length);
                });
            };

            var cusBConWidth = function(length){
                $('.cus-b-con').width(length * 160 + 20 + 14);
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
                item.customization.room_name = item.product ? item.product.room.name : '';
                item.customization.room_type_tag = item.product ? item.product.room.type_tag_description : '';
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
                OfferService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildings, function(item){return item.id == OfferService.getSearchParam('building')}) : '';
                OfferService.getSearchParam('keyword') ? $scope.filterOption.keywordObj = _.find($scope.keywordList, function(item){return item.value == OfferService.getSearchParam('keyword')}): $scope.filterOption.keywordObj = $scope.keywordList[0];
                OfferService.getSearchParam('status') ? $scope.filterOption.statusObj = _.find($scope.filterStatus, function(item){return item.value == OfferService.getSearchParam('status')}): '';
                OfferService.getSearchParam('rent_filter') ? $scope.filterOption.rentMode = _.find($scope.rentModes, function(item){return item.value == OfferService.getSearchParam('rent_filter')}): '';
            };

            $scope.filterDes = {
                status: '状态',
                start_date: '租赁开始',
                end_date: '租赁结束',
                create_start: '创建开始',
                create_end: '创建结束',
                building: '社区',
                keyword_search: '关键字'
            };

            var formateTags = function(){
                var cache = {};
                for(var key in $scope.filterOption){
                    cache = {};
                    if($scope.filterOption[key] && typeof $scope.filterOption[key] !== 'object' && !(key === 'keyword' || key === 'rent_filter' || key === 'buildingObj')){
                        cache = {
                            name: key,
                            des: $scope.filterDes[key],
                            value: $scope.filterOption[key]
                        };
                        if(key === 'status'){
                            cache.value = _.find($scope.filterStatus, function(item){return item.value === $scope.filterOption[key]}).name;
                        }
                        $scope.tags.push(cache);
                    }
                }
            };

            events.on('offerDeleteTag', function(item){
                console.log('offer')
                $scope.filterOption[item.name] = '';
                if(item.name === 'building'){
                    $scope.filterOption['buildingObj'] = '';
                }else if(item.name === 'status'){
                    $scope.filterOption['statusObj'] = '';
                }else if(item.name === 'keyword_search'){
                    $scope.filterOption['keywordObj'] = '';
                }
                $scope.searchList();
            });


            var initFilterParams = function(){
                $scope.filterOption.keyword_search ? $scope.filterOption.keyword_search = $scope.filterOption.keyword_search : '';
                $scope.filterOption.create_start ? $scope.filterOption.create_start = formatDate($scope.filterOption.create_start, 'yyyy-MM-dd') : '';
                $scope.filterOption.create_end ? $scope.filterOption.create_end = formatDate($scope.filterOption.create_end, 'yyyy-MM-dd') : '';
                $scope.filterOption.start_date ? $scope.filterOption.start_date = formatDate($scope.filterOption.start_date, 'yyyy-MM-dd') : '';
                $scope.filterOption.end_date ? $scope.filterOption.end_date = formatDate($scope.filterOption.end_date, 'yyyy-MM-dd') : '';
                $scope.filterOption.statusObj ? $scope.filterOption.status = $scope.filterOption.statusObj.value : '';
                $scope.filterOption.keywordObj ? $scope.filterOption.keyword = $scope.filterOption.keywordObj.value : '';
                $scope.filterOption.buildingObj ? $scope.filterOption.building = $scope.filterOption.buildingObj.id : '';
                $scope.filterOption.rentMode && ($scope.filterOption.start_date || $scope.filterOption.end_date)? $scope.filterOption.rent_filter = $scope.filterOption.rentMode.value : '';

                var cache = _.pick($scope.filterOption,'keyword', 'keyword_search', 'create_end', 'create_start', 'end_date', 'start_date', 'status', 'rent_filter', 'building');
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

            var getBuildingList = function() {
                var params = {
                    op: 1
                };
                params['permission[]'] = $scope.PERMISSION_KEY;
                OfferService.getBuildingList(params).success(function(data) {
                    $scope.buildings = _.filter(data, function(item) {return item.visible});
                    OfferService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildings, function(item){return item.id == OfferService.getSearchParam('building')}): '';
                });
            };

            var getOfferList = function(tag){
                getFilterParams();
                var params = initFilterParams();
                tag === 'init' ? formateTags(): '';
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                params = pickValue(params);
                $scope.loaded = false;
                OfferService.getOfferList(params).success(function(data){
                    $scope.offerList = data.items;
                    var arr = [];
                    _.each($scope.offerList, function(item){
                        item = formatData(item);
                        arr.push(item.id);
                    });
                    getStatusLog(arr);
                    $scope.pageOptions.totalNum = data.total_count;
                    $scope.loaded = true;
                });
            };

            var getProductDetail = function(productid){
                OfferService.getProductDetail(productid).success(function(data){
                    $scope.selectedSearchData.building = data.room.building;
                    $scope.selectedSearchData.building.building_id = data.room.building.id;
                    $scope.search.building = {};
                    $scope.search.building.key = data.room.building.name;

                    $scope.selectedSearchData.space = data.room;
                    $scope.selectedSearchData.space.building_id = data.room.building.id;
                    $scope.selectedSearchData.space.product_id = data.id;
                    $scope.selectedSearchData.space.content = data.room.attachment[0].attachment_id.content;
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
                    $scope.offerRemarks = data;
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
                $scope.selectedSearchData.enterprise ? params.lessee_enterprise = $scope.selectedSearchData.enterprise.id : '';
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
                // validationFlag = validationFlag ? validParams(!params.lessor_name, '出租方名称不能为空！') : validationFlag;
                // validationFlag = validationFlag ? validParams(!params.lessor_address, '出租方地址不能为空！') : validationFlag;
                // validationFlag = validationFlag ? validParams(!params.lessor_contact, '出租方联系人不能为空！') : validationFlag;
                // validationFlag = validationFlag ? validParams(!params.lessor_phone, '出租方电话不能为空！') : validationFlag;
                // validationFlag = validationFlag ? validParams(!params.lessor_email, '出租方邮箱不能为空！') : validationFlag;
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
                    $scope.selectedSearchData.customer = data.customer;
                    $scope.search.customer = {};
                    $scope.search.customer.key = data.customer.name;
                    $scope.offerOption = _.pick(data, 'monthly_rent', 'start_date');
                    $scope.offerOption.status = 'offer';
                    $scope.offerOption.lessee_type = 'personal';
                    $scope.offerOption.lease_clue_id = data.id;
                    data.product_id ? getProductDetail(data.product_id) : '';
                });
                $cookies.put('convert_object', '');
                $cookies.put('object_id', '');
                $cookies.put('convert_from', '');
            };

            var initDataFromClue = function(){
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

            var switchLease = function(id){
                $cookies.put('convert_object', 'lease');
                $cookies.put('convert_from', 'offer');
                $cookies.put('object_id', id);
                $location.path('contract');
            };

            var getStatusLog = function(ids){
                var params = {
                    object: 'lease_offer',
                    'object_id[]': ids
                };
                OfferService.getStatusLog(params).success(function(data){
                    $scope.statusLogs = _.groupBy(data, 'object_id');
                });
            };

            var init = function(){
                $rootScope.crumbs = {first: '租赁报价'};
                getTableItems();
                getTableHeaders();
                getOfferList('init');
                getBuildingList();
                getSupplementaryList();
                initDataFromClue();
            };

            init();

            $scope.resetSearch = function(){
                $scope.filterOption = {
                    create_start: '',
                    create_end: '',
                    start_date: '',
                    end_date: '',
                    statusObj: '',
                    building: '',
                    rent_filter: '',
                    keyword_search: '',
                    keywordObj: ''
                };
                getFilterParams();
            };

            $scope.searchList = function(){
                var params = initFilterParams();
                for(var key in params){
                    OfferService.updateSearchParam(key, params[key]);
                }
                $scope.filterOption.building ? OfferService.updateSearchParam('building', $scope.filterOption.buildingObj.id) : OfferService.updateSearchParam('building', '');
                $scope.filterOption.keyword ? '' : OfferService.updateSearchParam('keyword', '');
                OfferService.updateSearchParam('pageIndex', '');
            };

            $scope.clearSearchFilters = function(){
                // $scope.filterOption = {};
                // $scope.filterOption.keywordObj = $scope.keywordList[0];
                // _.each($location.search(), function(value, key){
                //     OfferService.updateSearchParam(key, '');
                // });
                for(var key in $scope.filterOption){
                    $scope.filterOption[key] = '';
                }
            };

            $scope.switchLeaseeType = function(type){
                $scope.offerOption.lessee_type = type;
            };

            $scope.saveOffer = function($hide, flag){
                var params = initParams();
                if(validOfferOption(params)){
                    OfferService.addOffer(params).success(function(data){
                        $hide();
                        noty('info', '创建租赁报价成功！');
                        flag ? switchLease(data.id) : getOfferList();
                    });
                }
            };

            $scope.seePopover = function(str){
                $scope.popoverType = str;
            };

            var formatDownload = function(){
                var params = initFilterParams(),
                    url = '';
                for(var key in params){
                    params[key] ? url += ('&' + key + '=' + params[key]) : '';
                }
                url = url.slice(1);
                return url;
            };

            $scope.exportExcel = function(){
                $scope.download = CONF.api + 'sales/admin/lease/export/offers?';
                $scope.download += formatDownload();
                console.log($scope.download)
                window.location.href = $scope.download;
            };

            $scope.updateOffer = function($hide, flag){
                var params = initParams();
                if(validOfferOption(params)){
                    OfferService.updateOffer($scope.offerItem.id, params).success(function(){
                        $hide();
                        noty('info', '编辑租赁报价成功！');
                        flag ? switchLease($scope.offerItem.id) : getOfferList();
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

            $scope.searchEnterprise = function(){
                var params = {};
                if($scope.search.enterprise){
                    params.query = $scope.search.enterprise.key;
                    OfferService.getEnterprise(params).success(function(data){
                        $scope.searchReponse.enterprise = data;
                    });
                }
            };

            $scope.createOffer = function(){
            };

            $scope.showOfferDialog = _.debounce(function(flag, item){
                $scope.operateFlag = flag;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'offerItemTpl'
                });
                if(flag === 'detail'){
                    getOfferDetail(item.id);
                }
                flag === 'add' ? $scope.supplementaryList = angular.copy($scope.copysupplementaryList) : '';
            }, 300);

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
                events.emit('confirm', {
                    title: '作废报价',
                    content: '是否确认作废该报价？报价作废后将不可恢复。',
                    onConfirm: function() {
                        var params = {'status': 'closed'};
                        OfferService.closeOffer($scope.offerItem.id, params).success(function(){
                            $hide();
                            noty('info', '作废报价成功！');
                            getOfferList();
                        });
                    }
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

            $scope.convertToLease = function($hide){
                $hide();
                switchLease($scope.offerItem.id);
            };

            $scope.$watch('selectedSearchData.building', function(newValue, oldValue){
                if(newValue === oldValue){
                    return;
                }
                console.log(newValue);
                console.log($scope.selectedSearchData.space);
                newValue && newValue.id ? newValue.building_id = newValue.id : '';
                if(newValue.building_id && newValue.building_id !== $scope.selectedSearchData.space.building_id){
                    $scope.search.space = {};
                    $scope.search.space.key = '';
                    $scope.selectedSearchData.space.content = '';
                    $scope.selectedSearchData.space.area = '';
                    $scope.selectedSearchData.space.allowed_people = '';
                }
            }, true);

            $scope.$watch('selectedSearchData.space', function(newValue, oldValue){
                if(newValue === oldValue){
                    return;
                }
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
