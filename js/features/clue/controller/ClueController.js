/**
 *  Defines the ClueController controller
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the ClueController class with RequireJS
     */
    define(['lodash', 'angular'], function(_, angular) {

        /**
         * @constructor
         */
        var ClueController = function($rootScope, $scope, ClueService, events, $filter, CONF, $translate, CurrentAdminService, $timeout, utils, $location, $cookies, $modal) {

            $scope.pageType = ClueService.getSearchParam('ptype') ? ClueService.getSearchParam('ptype') : 'list';
            $scope.spaceDetailTab = 1;
            $scope.contractTab = 1;
            $scope.now = new Date();
            $scope.dropDownOptions = [
                {name: '订单号'},
                {name: '空间名(包含)'}
            ];
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: ClueService.getSearchParam('pageIndex') ? parseInt(ClueService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.PERMISSION_KEY = 'sales.platform.lease_clue';
            $scope.placeholder = {
                all: '全部',
                status: '状态',
                community: '所有社区（显示该销售方下的所有社区）',
                commense: '起租日',
                building: '输入要选择的社区名',
                space: '输入要选择的空间名'
            };
            $scope.cusDrop = false;
            $scope.clueList = [];
            $scope.customerOptions = {
                phone_code: '',
                phone: '',
                name: ''
            };
            $scope.loaded = false;
            $scope.keywordList = ClueService.getKeywordList();
            $scope.filterStatus = ClueService.getStatus();
            var searchParams = _.keys($location.search());
            if(searchParams.length > 2){
                $scope.showFilter = true;
            }else if(searchParams.length > 0 && searchParams.length <= 2 && !_.contains(searchParams, 'keyword')){
                $scope.showFilter = true;
            }else{
                $scope.showFilter = false;
            }
            $scope.today = new Date();
            $scope.clue = {
                remarks: ''
            };
            $scope.statusDesc = ClueService.getStatusDesc();
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.filterOption = {
                start_date: '',
                end_date: '',
                create_start: '',
                create_end: '',
                keyword_search: ''
            };
            $scope.filterOption.keywordObj = $scope.keywordList[0];
            $scope.tags = [];
            $scope.modalInstance = '';

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var getAreacode = function(){
                ClueService.getAreacode().success(function(data){
                    $scope.areaCodes = data;
                });
            };

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var formatData = function(item){
                item.customization = _.pick(item, 'serial_number', 'number', 'lessee_address', 'lessee_email', 'lessee_name', 'lessee_phone');
                item.customization.room_name = item.product ? item.product.room.name : '';
                item.customization.room_type_tag = item.product ? item.product.room.type_tag_description : '';
                item.customization.start_date = formatDate(item.start_date, 'yyyy-MM-dd HH:mm:ss');
                item.customization.creation_date = formatDate(item.creation_date, 'yyyy-MM-dd HH:mm:ss');
                item.customization.cycle = item.cycle ? item.cycle + '个月' : '';
                item.customization.total_rent = item.cycle && item.monthly_rent ? item.cycle * item.monthly_rent + ' 元' : '';
                item.customization.status = $scope.statusDesc[item.status];
                item.customization.monthly_rent = item.monthly_rent ? item.monthly_rent + ' 元/月起' : '';
                item.customization.lessee_customer = item.customer.name;
                return item;
            };

            var getFilterParams = function(){
                ClueService.getSearchParam('keyword_search') ? $scope.filterOption.keyword_search = ClueService.getSearchParam('keyword_search') : '';
                ClueService.getSearchParam('create_start') ? $scope.filterOption.create_start = ClueService.getSearchParam('create_start') : '';
                ClueService.getSearchParam('create_end') ? $scope.filterOption.create_end = ClueService.getSearchParam('create_end') : '';
                ClueService.getSearchParam('start_date') ? $scope.filterOption.start_date = ClueService.getSearchParam('start_date') : '';
                ClueService.getSearchParam('end_date') ? $scope.filterOption.end_date = ClueService.getSearchParam('end_date') : '';
                ClueService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildings, function(item){return item.id == ClueService.getSearchParam('building')}) : '';
                ClueService.getSearchParam('building') ? $scope.filterOption.building = ClueService.getSearchParam('building') : '';
                ClueService.getSearchParam('keyword') ? $scope.filterOption.keywordObj = _.find($scope.keywordList, function(item){return item.value == ClueService.getSearchParam('keyword')}): $scope.filterOption.keywordObj = $scope.keywordList[0];
                ClueService.getSearchParam('status') ? $scope.filterOption.statusObj = _.find($scope.filterStatus, function(item){return item.value == ClueService.getSearchParam('status')}): '';
            };

            $scope.filterDes = {
                status: '状态',
                start_date: '起租开始',
                end_date: '起租结束',
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

            events.on('clueDeleteTag', function(item){
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
                $scope.filterOption.statusObj ? $scope.filterOption.status = $scope.filterOption.statusObj.value : '';
                $scope.filterOption.keywordObj && $scope.filterOption.keyword_search ? $scope.filterOption.keyword = $scope.filterOption.keywordObj.value : '';
                $scope.filterOption.buildingObj ? $scope.filterOption.building = $scope.filterOption.buildingObj.id : '';

                if($scope.filterOption.start_date){
                    $scope.filterOption.start_date = formatDate($scope.filterOption.start_date, 'yyyy-MM-dd');
                    $scope.filterOption.rent_filter = 'rent_start';
                }
                if($scope.filterOption.end_date){
                    $scope.filterOption.end_date = formatDate($scope.filterOption.end_date, 'yyyy-MM-dd');
                    $scope.filterOption.rent_filter = 'rent_start';
                }
                if(!$scope.filterOption.start_date && !$scope.filterOption.end_date){
                    $scope.filterOption.rent_filter = '';
                }


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

            var getClueList = function(tag){
                getFilterParams();
                var params = initFilterParams();
                tag === 'init' ? formateTags(): '';
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                params = pickValue(params);
                $scope.loaded = false;
                ClueService.getClueList(params).success(function(data){
                    $scope.clueList = data.items;
                    var arr = [];
                    _.each($scope.clueList, function(item){
                        item = formatData(item);
                        arr.push(item.id);
                    });
                    $scope.pageOptions.totalNum = data.total_count;
                    getStatusLog(arr);
                    $scope.loaded = true;
                });
            };

            var getTableItems = function(){
                var params = {object: 'lease_clue'};
                ClueService.getTableItems(params).success(function(data){
                    $scope.dragModels.tableItems = data;
                    $scope.copyTableItem = angular.copy(data);
                });
            };

            var cusBConWidth = function(length){
                $('.cus-b-con').width(length * 160 + 20 + 14);
            };

            var getTableHeaders = function(){
                var params = {object: 'lease_clue'};
                ClueService.getTableHeader(params).success(function(data){
                    $scope.tableHeaders = data;
                    cusBConWidth($scope.tableHeaders.length);
                });
            };

            var getBuildingList = function() {
                var params = {
                    op: 1
                };
                params['permission[]'] = $scope.PERMISSION_KEY;
                ClueService.getBuildingList(params).success(function(data) {
                    $scope.buildings = _.filter(data, function(item) {return item.visible});
                    ClueService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildings, function(item){return item.id == ClueService.getSearchParam('building')}): '';
                });
            };

            var getBuilding = function(buildingid){
                ClueService.getBuildingDetail(buildingid).success(function(data){
                    $scope.selectedSearchData.building = data;
                    $scope.search.building = {};
                    $scope.search.building.key = data.name;
                });
            };

            var getProductDetail = function(productid){
                ClueService.getProductDetail(productid).success(function(data){
                    $scope.selectedSearchData.space = data.room;
                    $scope.selectedSearchData.space.product_id = data.id;
                    $scope.selectedSearchData.space.content = data.room.attachment[0].attachment_id.content;
                    $scope.search.space = {};
                    $scope.search.space.key = data.room.name;
                });
            };

            var getRemarks = function(id){
                var params = {
                    object: 'lease_clue',
                    object_id: id
                };
                ClueService.getClueRemarks(params).success(function(data){
                    $scope.clueRemarks = data;
                });
            };

            var initParams = function(){
                var params = angular.copy($scope.clueOption);
                $scope.selectedSearchData.building ? params.building_id = $scope.selectedSearchData.building.id : '';
                $scope.selectedSearchData.space ? params.product_id = $scope.selectedSearchData.space.product_id : '';
                $scope.selectedSearchData.customer ? params.lessee_customer = $scope.selectedSearchData.customer.id : '';
                return params;
            };

            var getClueDetail = function(item){
                ClueService.getClueDetail(item.id).success(function(data){
                    $scope.clueItem = data;
                    $scope.selectedSearchData.customer = data.customer;
                    $scope.search.customer = {};
                    $scope.search.customer.key = data.customer.name;
                    $scope.clueOption = _.pick(data, 'status', 'number', 'monthly_rent', 'cycle', 'start_date', 'lessee_email', 'lessee_phone', 'lessee_address', 'lessee_name');
                    data.building_id ? getBuilding(data.building_id) : '';
                    data.product_id ? getProductDetail(data.product_id) : '';
                });
            };

            var validParams = function(param, msg){
                if(param){
                    noty('error', msg);
                    return false;
                }
                return true;
            };

            var validOption = function(){
                var validationFlag = true;
                validationFlag = validationFlag ? validParams($scope.clueOption.lessee_email && !utils.isEmail($scope.clueOption.lessee_email), '承租方邮箱格式不对！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.clueOption.cycle && !utils.isNumber($scope.clueOption.cycle), '租赁周期格式不对！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.clueOption.monthly_rent && !utils.isNumber($scope.clueOption.monthly_rent), '租金预算格式不对！') : validationFlag;

                return validationFlag;
            };

            var addRemarkForClue = function(){
                var params = {
                    'object': 'lease_clue',
                    'object_id': $scope.clueItem.id,
                    'remarks': $scope.clue.remark
                };
                ClueService.addRemarks(params).success(function(){
                    noty('info', '增加备注成功！');
                    getRemarks($scope.clueItem.id);
                });
            };

            var resetParams = function(){
                $scope.clueOption = {
                    status: 'clue'
                };
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
            };

            var switchOffer = function(id){
                $cookies.put('convert_object', 'offer');
                $cookies.put('convert_from', 'clue');
                $cookies.put('object_id', id);
                $location.path('offer');
            };

            var switchLease = function(id){
                $cookies.put('convert_object', 'lease');
                $cookies.put('convert_from', 'clue');
                $cookies.put('object_id', id);
                $location.path('contract');
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

            var getStatusLog = function(ids){
                var params = {
                    object: 'lease_clue',
                    'object_id[]': ids
                };
                ClueService.getStatusLog(params).success(function(data){
                    $scope.statusLogs = _.groupBy(data, 'object_id');
                });
            };

            var init = function(){
                $rootScope.crumbs = {first: '租赁线索'};
                resetParams();
                getAreacode();
                getTableItems();
                getTableHeaders();
                getBuildingList();
                getClueList('init');
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
                    keyword_search: '',
                    keywordObj: ''
                };
                getFilterParams();
            };

            $scope.searchList = function(){
                var params = initFilterParams();
                for(var key in params){
                    ClueService.updateSearchParam(key, params[key]);
                }
                $scope.filterOption.building ? ClueService.updateSearchParam('building', $scope.filterOption.buildingObj.id) : ClueService.updateSearchParam('building', '');
                $scope.filterOption.keyword ? '' : ClueService.updateSearchParam('keyword', '');
                ClueService.updateSearchParam('pageIndex', '');
            };

            $scope.clearSearchFilters = function(){
                // $scope.filterOption = {};
                // $scope.filterOption.keywordObj = $scope.keywordList[0];
                // _.each($location.search(), function(value, key){
                //     ClueService.updateSearchParam(key, '');
                // });
                for(var key in $scope.filterOption){
                    $scope.filterOption[key] = '';
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
                    object: 'lease_clue',
                    list_ids: []
                };
                var tempArr = _.filter($scope.dragModels.tableItems, function(item){
                    return item.required || item.checked; 
                }) ;
                params.list_ids = _.pluck(tempArr, 'id');
                ClueService.updateTableColumn(params).success(function(){
                    $scope.cusDrop = false;
                    getTableHeaders();
                    noty('info', '设置表格成功！');
                });
            };

            $scope.closeClue = function($hide){
                events.emit('confirm', {
                    title: '作废线索',
                    content: '是否确认作废该线索？线索作废后将不可恢复。',
                    onConfirm: function() {
                        var params = {'status': 'closed'};
                        ClueService.closeClue($scope.clueItem.id, params).success(function(){
                            $hide();
                            getClueList();
                            noty('info', '作废线索成功！');
                        });
                    }
                });
            };

            $scope.seePopover = function(str){
                $scope.popoverType = str;
            };

            $scope.exportExcel = function(){
                $scope.download = CONF.api + 'sales/admin/lease/export/clues?';
                $scope.download += formatDownload();
                window.location.href = $scope.download;
            };

            $scope.showDetail = function(item){
                $scope.operateFlag = 'detail'
                $scope.remarkFlag = false;

                if($scope.modalInstance && !$scope.modalInstance.$isShown){
                    $scope.modalInstance.show();
                }else if(!$scope.modalInstance){
                    $scope.modalInstance = $modal({
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade-and-slide-top',
                        template: 'createCluesTpl'
                    });
                }
                getClueDetail(item);
                getRemarks(item.id);
            };
            
            $scope.searchBuilding = function(){
                var params = {};
                if($scope.search.building){
                    params.query = $scope.search.building.key;
                    ClueService.getBuildings(params).success(function(data){
                        $scope.searchReponse.building = data;
                    });
                }
            };

            $scope.searchSpace = function(){
                var params = {};
                if($scope.search.space){
                    $scope.search.building ? params.building = $scope.selectedSearchData.building.id : '';
                    params.query = $scope.search.space.key;
                    ClueService.getBuildingSpaces(params).success(function(data){
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
                    ClueService.getCustomers(params).success(function(data){
                        console.log(data)
                        $scope.searchReponse.customer = data;
                    });
                }
            };

            $scope.saveClue = function($hide, flag){
                var params = initParams();
                if(validOption()){
                    ClueService.createClue(params).success(function(data){
                        $hide();
                        noty('info', '保存线索成功！');
                        !flag ? getClueList() : '' ;
                        if(flag === 'offer'){
                            switchOffer(data.id);
                        }else if(flag === 'lease'){
                            switchLease(data.id);
                        }
                    });
                }
            };

            $scope.updateClue = function($hide, flag){
                var params = initParams();
                if(validOption()){
                    ClueService.updateClue($scope.clueItem.id, params).success(function(){
                        $hide();
                        noty('info', '更新线索成功！');
                        !flag ? getClueList() : '' ;
                        if(flag === 'offer'){
                            switchOffer($scope.clueItem.id);
                        }else if(flag === 'lease'){
                            switchLease($scope.clueItem.id);
                        }
                    });
                }
            };

            $scope.createClue = function(){
                $scope.operateFlag = 'add';
                resetParams();
                if($scope.modalInstance && !$scope.modalInstance.$isShown){
                    $scope.modalInstance.show();
                }else if(!$scope.modalInstance){
                    $scope.modalInstance = $modal({
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade-and-slide-top',
                        template: 'createCluesTpl'
                    });
                }
            };

            $scope.showPrint = function(){
                $scope.operateFlag = 'pdf';
            };

            $scope.showUpdate = function(){
                $scope.operateFlag = 'update';
            };

            $scope.showRemark = function(){
                $scope.remarkFlag = true;
            };

            $scope.toggleRemark = function(){
                $scope.remarkListFlag = !$scope.remarkListFlag;
            };

            $scope.addRemark = function(){
                $scope.remarkFlag = false;
                if($scope.clue.remark){
                    addRemarkForClue();
                }
            };

            $scope.goPage = function(index){
                ClueService.updateSearchParam('pageIndex', index);
            };

            $scope.convertToOffer = function($hide){
                $hide();
                switchOffer($scope.clueItem.id);
            };

            $scope.convertToLease = function($hide){
                $hide();
                switchLease($scope.clueItem.id);
            };

            $scope.exportPDF = function($hide){
                window.location.href = CONF.api + 'sales/admin/pdf/lease/clues/' + $scope.clueItem.id + '?company=' + $cookies.get('salesCompanyId');
                $hide();
            };

            $scope.$watch('selectedSearchData.building', function(newValue, oldValue){
                if(newValue === oldValue){
                    return;
                }
                newValue && newValue.id ? newValue.building_id = newValue.id : '';
                if(newValue.building_id && newValue.building_id !== $scope.selectedSearchData.space.building.id){
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
        return ['$rootScope', '$scope', 'ClueService', 'events', '$filter', 'CONF', '$translate', 'CurrentAdminService', '$timeout', 'utils', '$location', '$cookies', '$modal', ClueController];

    });

})(define);
