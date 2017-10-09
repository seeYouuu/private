/**
 *  Defines the ContractController controller
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the ContractController class with RequireJS
     */
    define(['lodash', 'angular'], function(_, angular) {

        /**
         * @constructor
         */
        var ContractController = function($rootScope, $scope, ContractService, events, $filter, CONF, $location, $cookies, $translate, CurrentAdminService, utils, $modal) {

            $scope.pageType = ContractService.getSearchParam('ptype') ? ContractService.getSearchParam('ptype') : 'list';
            $scope.spaceDetailTab = 1;
            $scope.contractTab = 1;
            $scope.now = new Date();
            $scope.dropDownOptions = [
                {name: '订单号'},
                {name: '空间名(包含)'}
            ];
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: ContractService.getSearchParam('pageIndex') ? parseInt(ContractService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.placeholder = {
                all: '全部',
                tenantry: '报价号',
                community: '所有社区（显示该销售方下的所有社区）',
                commense: '起租日',
                building: '输入要选择的社区名',
                space: '输入要选择的空间名',
                company: '输入要选择的企业名',
                customer: '输入要选择的客户名/手机号'
            };
            $scope.cusDrop = false;
            $scope.loaded = false;
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };
            $scope.PERMISSION_KEY = 'sales.building.long_term_lease';
            $scope.filterStatus = ContractService.getStatus();
            $scope.statusDesc = ContractService.getStatusDesc();
            $scope.billStatusDesc = ContractService.getBillStatusDesc();
            $scope.keywordList = ContractService.getKeywordList();
            $scope.filterOption = {
                create_start: '',
                create_end: '',
                start_date: '',
                end_date: '',
                keyword_search: ''
            };
            $scope.filterOption.keywordObj = $scope.keywordList[0];
            $scope.rentModes = ContractService.getRentMode();
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
            $scope.agreementOption ={
                lessee_type: 'personal',
                is_auto: 0
            };
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };
            $scope.contract = {
                remark: ''
            };
            $scope.otherBill = {};

            $scope.today = new Date();
            $scope.agreementBills = [];
            $scope.tags = [];
            $scope.selected = false;
            $scope.detailInstance = '';
            $scope.mutiSelectedBills = [];
            $scope.statusLogs = [];

            var searchParams = _.keys($location.search());
            if(searchParams.length > 2){
                $scope.showFilter = true;
            }else if(searchParams.length > 0 && searchParams.length <= 2 && !_.contains(searchParams, 'keyword')){
                $scope.showFilter = true;
            }else{
                $scope.showFilter = false;
            }

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var getBuildingList = function() {
                var params = {
                    op: 1
                };
                params['permission[]'] = $scope.PERMISSION_KEY;
                ContractService.getBuildingList(params).success(function(data) {
                    $scope.buildings = _.filter(data, function(item) {return item.visible});
                    ContractService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildings, function(item){return item.id == ContractService.getSearchParam('building')}): '';
                });
            };

            var cusBConWidth = function(length){
                $('.cus-b-con').width(length * 160 + 20 + 14);
            };

            var getTableItems = function(){
                var params = {object: 'lease'};
                ContractService.getTableItems(params).success(function(data){
                    $scope.dragModels.tableItems = data;
                    $scope.copyTableItem = angular.copy(data);
                });
            };

            var getTableHeaders = function(){
                var params = {object: 'lease'};
                ContractService.getTableHeader(params).success(function(data){
                    $scope.tableHeaders = data;
                    cusBConWidth($scope.tableHeaders.length);
                });
            };

            var getStatusLog = function(ids){
                var params = {
                    object: 'lease',
                    'object_id[]': ids
                };
                ContractService.getStatusLog(params).success(function(data){
                    $scope.statusLogs = _.groupBy(data, 'object_id');
                });
            };

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var formatNumber = function(params){
                return $filter('number')(params, '2');
            };

            var formatData = function(item){
                item.customization = _.pick(item, 'lessee_customer', 'deposit', 'lessee_enterprise', 'serial_number');
                item.customization.room_name = item.product ? item.product.room.name : '';
                item.customization.lessee_type = item.lessee_type === 'personal' ? '个人承租' : '企业承租';
                item.customization.room_type_tag = item.product ? $scope.typeDesc[item.product.room.type_tag] : '';
                item.customization.start_date = item.start_date && item.end_date ? formatDate(item.start_date, 'yyyy-MM-dd') + '至' + formatDate(item.end_date, 'yyyy-MM-dd') : '-';
                item.customization.total_rent = item.total_rent ? formatNumber(item.total_rent) + ' 元' : '';
                item.customization.lease_bill = item.total_lease_bills_amount;
                item.customization.other_bill = item.other_bills_amount;
                item.customization.creation_date = formatDate(item.creation_date, 'yyyy-MM-dd HH:mm:ss');
                item.customization.status = $scope.statusDesc[item.status];
                item.customization.monthly_rent = item.monthly_rent ? formatNumber(item.monthly_rent) + ' 元/月起' : '';
                item.customization.deposit = item.deposit ? formatNumber(item.deposit) + ' 元' : '';
                item.customization.lease_rent_types = _.pluck(_.filter(item.lease_rent_types, 'type', 'tax'), 'name').join(', ');
                return item;
            };

            var getFilterParams = function(){
                ContractService.getSearchParam('keyword_search') ? $scope.filterOption.keyword_search = ContractService.getSearchParam('keyword_search') : '';
                ContractService.getSearchParam('create_start') ? $scope.filterOption.create_start = ContractService.getSearchParam('create_start') : '';
                ContractService.getSearchParam('create_end') ? $scope.filterOption.create_end = ContractService.getSearchParam('create_end') : '';
                ContractService.getSearchParam('start_date') ? $scope.filterOption.start_date = ContractService.getSearchParam('start_date') : '';
                ContractService.getSearchParam('end_date') ? $scope.filterOption.end_date = ContractService.getSearchParam('end_date') : '';
                ContractService.getSearchParam('building') ? $scope.filterOption.building = ContractService.getSearchParam('building') : '';
                ContractService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildings, function(item){return item.id == ContractService.getSearchParam('building')}) : '';
                ContractService.getSearchParam('keyword') ? $scope.filterOption.keywordObj = _.find($scope.keywordList, function(item){return item.value == ContractService.getSearchParam('keyword')}): $scope.filterOption.keywordObj = $scope.keywordList[0];
                ContractService.getSearchParam('status') ? $scope.filterOption.statusObj = _.find($scope.filterStatus, function(item){return item.value == ContractService.getSearchParam('status')}): '';
                ContractService.getSearchParam('rent_filter') ? $scope.filterOption.rentMode = _.find($scope.rentModes, function(item){return item.value == ContractService.getSearchParam('rent_filter')}): '';
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

            events.on('contractDeleteTag', function(item){
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
                $scope.filterOption.keywordObj && $scope.filterOption.keyword_search ? $scope.filterOption.keyword = $scope.filterOption.keywordObj.value : '';
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

            var getCustomerUsers = function(params){
                ContractService.getCustomerUsers(params).success(function(data){
                    $scope.customerObj = {};
                    _.each(data, function(item){
                        $scope.customerObj[item.id] = item.name;
                    });
                });
            };

            var getContractList = function(tag){
                getFilterParams();
                var params = initFilterParams();
                tag === 'init' ? formateTags(): '';
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                params = pickValue(params);
                $scope.loaded = false;
                ContractService.getContractList(params).success(function(data){
                    $scope.leaseList = data.items;
                    var arr = [];
                    _.each($scope.leaseList, function(item){
                        item = formatData(item);
                        item.lessee_customer ? arr.push(item.lessee_customer): '';
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getCustomerUsers({'id[]': arr}): '';
                    $scope.pageOptions.totalNum = data.total_count;
                    $scope.loaded = true;
                    getStatusLog(_.pluck(data.items, 'id'));
                });
            };

            var getTypeDescription = function(){
                ContractService.getTypeDescription().success(function(data){
                    $scope.typeDesc = {};
                    _.each(data, function(item){
                        $scope.typeDesc[item.tag_key] = item.tag_name;
                    });
                });
            };

            var getRemarks = function(id){
                var params = {
                    object: 'lease',
                    object_id: id
                };
                ContractService.getContractRemarks(params).success(function(data){
                    $scope.contractRemarks = data;
                });
            };

            var getCustomerDetail = function(id){
                ContractService.getCustomerDetail(id).success(function(data){
                    $scope.customerItem = data;
                    $scope.selectedSearchData.customer = angular.copy(data);
                    $scope.search.customer = {};
                    $scope.search.customer.key = data.name;
                });
            };

            var getEnterpriseDetail = function(id){
                ContractService.getEnterpriseDetail(id).success(function(data){
                    $scope.enterpriseItem = data;
                    $scope.selectedSearchData.enterprise = angular.copy(data);
                    $scope.search.enterprise = {};
                    $scope.search.enterprise.key = data.name;
                });
            };

            var getContractDetail = function(id){
                ContractService.getLeasesDetail(id).success(function(data){
                    $scope.contractItem = data;
                    $scope.contractItem.leaseRentType = _.pluck(_.filter(data.lease_rent_types, 'type', 'rent'), 'name').join(';  ');
                    $scope.contractItem.leaseTaxType = _.pluck(_.filter(data.lease_rent_types, 'type', 'tax'), 'name').join(';  ');
                    getCustomerDetail(data.lessee_customer);
                    //add for update contract
                    $scope.agreementOption = _.pick(data,'lessee_type', 'start_date', 'status', 'end_date', 'lessor_name', 'lessor_address', 'lessor_phone', 'lessor_contact', 'lessor_email',  'monthly_rent', 'total_rent', 'purpose', 'deposit', 'other_expenses', 'supplementary_terms', 'is_auto', 'plan_day');
                    $scope.agreementBills = data.bills;
                    _.each($scope.agreementBills, function(item){
                        item.start_date = formatDate(item.start_date, 'yyyy-MM-dd');
                        item.end_date = formatDate(item.end_date, 'yyyy-MM-dd');
                    });
                    $scope.supplementaryList = angular.copy($scope.copysupplementaryList);
                    var temp = {};
                    _.each(data.lease_rent_types, function(item){
                        temp[item.id] = item.name;
                    });
                    _.each($scope.supplementaryList, function(item){
                        item.selected = temp[item.id] ? true : false;
                    });
                    if(data.product){
                        $scope.selectedSearchData.building = data.product.room.building;
                        $scope.selectedSearchData.building.building_id = data.product.room.building.id;
                        $scope.search.building = {};
                        $scope.search.building.key = data.product.room.building.name;

                        $scope.selectedSearchData.space = angular.copy(data.product.room);
                        $scope.selectedSearchData.space.product_id = data.product.id;
                        $scope.selectedSearchData.space.content = data.product.room.attachment;
                        $scope.selectedSearchData.space.building_id = data.product.room.building.id;
                        $scope.search.space = {};
                        $scope.search.space.key = data.product.room.name;
                    }
                    if(data.lessee_type === 'enterprise'){
                        getEnterpriseDetail(data.lessee_enterprise);
                    }
                });
            };

            var getSupplementaryList = function(){
                ContractService.getSupplementaryList().success(function(data){
                    $scope.supplementaryList = data;
                    $scope.copysupplementaryList = angular.copy(data);
                });
            };

            var getLeasesPushedBills = function(id){
                var params = {
                    pageLimit: 100,
                    pageIndex: 0
                }
                ContractService.getPushedBills(id, params).success(function(data){
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
                });
            };

            var initLeases = function(){
                $scope.agreementOption.lease_rent_types = _.pluck(_.filter($scope.supplementaryList, 'selected', true), 'id');
                $scope.agreementOption.bills = {};
                $scope.agreementOption.bills.add = [];
                $scope.agreementOption.bills.edit = [];
                $scope.agreementOption.bills.remove = $scope.deleteBills;
                $scope.agreementOption.building_id = $scope.selectedSearchData.building ? $scope.selectedSearchData.building.id || $scope.selectedSearchData.building.building_id : '';
                $scope.agreementOption.product_id = $scope.selectedSearchData.space ? $scope.selectedSearchData.space.product_id : '';
                $scope.agreementOption.lessee_customer = $scope.selectedSearchData.customer ? $scope.selectedSearchData.customer.id : '';
                $scope.agreementOption.start_date = formatDate($scope.agreementOption.start_date, 'yyyy-MM-dd');
                $scope.agreementOption.end_date = formatDate($scope.agreementOption.end_date, 'yyyy-MM-dd');
                $scope.agreementOption.is_auto = $scope.agreementOption.is_auto  ? 1 : 0;
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
                if($scope.agreementOption.lessee_type === 'enterprise'){
                    $scope.agreementOption.lessee_enterprise = $scope.selectedSearchData.enterprise ? $scope.selectedSearchData.enterprise.id : '';
                }
            };

            var validParams = function(param, msg){
                if(param){
                    noty('error', msg);
                    return false;
                }
                return true;
            };

            var validLease = function(status){
                var validationFlag = true;

                validationFlag = validationFlag ? validParams($scope.agreementOption.monthly_rent && !utils.isNumber($scope.agreementOption.monthly_rent), '月租金格式不对') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.agreementOption.total_rent && !utils.isNumber($scope.agreementOption.total_rent), '总租金格式不对') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.agreementOption.deposit && !utils.isNumber($scope.agreementOption.deposit), '租赁押金格式不对') : validationFlag;

                validationFlag = validationFlag ? validParams($scope.agreementOption.monthly_rent < 0, '月租金不能小于零！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.agreementOption.total_rent < 0, '合同总租金不能小于零！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.agreementOption.deposit < 0, '租赁押金不能小于零！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.agreementOption.is_auto && !$scope.agreementOption.plan_day, '自动推送提前天数不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessee_customer, '承租方联系人不能为空！') : validationFlag;

                if($scope.agreementOption.lessee_type === 'enterprise'){
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessee_enterprise, '承租企业不能为空！') : validationFlag;
                }
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
                if(status === 'performing'){
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessor_name, '出租方名称不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessor_address, '出租方地址不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessor_contact, '出租方联系人不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessor_phone, '出租方电话不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.lessor_email, '出租方邮箱不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams($scope.agreementOption.lessor_email && !utils.isEmail($scope.agreementOption.lessor_email), '出租方邮箱格式不对！') : validationFlag;
                    
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.start_date, '租赁起始日期不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.end_date, '租赁结束日期不能为空') : validationFlag;
                    validationFlag = validationFlag ? validParams($scope.agreementOption.lease_rent_types.length === 0, '您还未选择租金包含！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.agreementOption.purpose, '房屋使用用途不能为空！') : validationFlag;
                }
                
                return validationFlag;
            };

            var initBill = function(){
                $scope.agreementBills = [];
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

            var getProductDetail = function(productid){
                ContractService.getProductDetail(productid).success(function(data){
                    console.log(data);
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

            var addRemarkForContract = function(){
                var params = {
                    'object': 'lease',
                    'object_id': $scope.contractItem.id,
                    'remarks': $scope.contract.remark
                };
                ContractService.addRemarks(params).success(function(){
                    noty('info', '增加备注成功！');
                    getRemarks($scope.contractItem.id);
                });
            };

            var getOfferDetail = function(){
                ContractService.getOfferDetail($cookies.get('object_id')).success(function(data){
                    $scope.selectedSearchData.customer = data.customer;
                    $scope.search.customer = {};
                    $scope.search.customer.key = data.customer.name;
                    
                    $scope.agreementOption = _.pick(data, 'lessor_email', 'lessor_phone', 'lessor_contact', 'lessor_address', 'lessor_name', 'lessee_type', 'number', 'monthly_rent', 'cycle', 'start_date', 'purpose', 'other_expenses', 'supplementary_terms');
                    $scope.agreementOption.lease_offer_id = data.id;
                    var temp = {};
                    _.each(data.lease_rent_types, function(item){
                        temp[item.id] = item.name;
                    });
                    _.each($scope.supplementaryList, function(item){
                        item.selected = temp[item.id] ? true : false;
                    });
                    data.lessee_type === 'enterprise' ? getEnterpriseDetail(data.lessee_enterprise) : '';
                    data.product_id ? getProductDetail(data.product_id) : '';
                });
                $cookies.put('convert_object', '');
                $cookies.put('convert_from', '');
                $cookies.put('object_id', '');
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

            var getClueDetail = function(){
                ContractService.getClueDetail($cookies.get('object_id')).success(function(data){
                    $scope.selectedSearchData.customer = data.customer;
                    $scope.search.customer = {};
                    $scope.search.customer.key = data.customer.name;
                    $scope.agreementOption = _.pick(data, 'monthly_rent', 'start_date');
                    $scope.agreementOption.status = '';
                    $scope.agreementOption.lessee_type = 'personal';
                    $scope.agreementOption.lease_clue_id = data.id;
                    data.product_id ? getProductDetail(data.product_id) : '';
                });
                $cookies.put('convert_object', '');
                $cookies.put('convert_from', '');
                $cookies.put('object_id', '');
            };

            var initDataFromClueOrOffer = function(){
                var convertObj = $cookies.get('convert_object');
                var convertFrom = $cookies.get('convert_from');
                if(convertObj === 'lease'){
                    convertFrom === 'clue' ? getClueDetail() : getOfferDetail();
                    $scope.operateFlag = 'add';
                    events.emit('modal', {
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade-and-slide-top',
                        template: 'contractItemTpl'
                    });
                }
            };

            var getContractBills = function(type, id){
                var params = {type: type};
                ContractService.getContractBills(id, params).success(function(data){
                    $scope.billList = data.items;
                    _.each($scope.billList, function(item){
                        item.invoiceBy = item.sales_invoice ? item.lease.product.room.building.company.name + '开票' : '创合开票';
                        item.order_method = item.order_method === 'auto' ? '自动推送' : '后台推送';
                    });
                });
            };

            var init = function(){
                $rootScope.crumbs = {first: '租赁合同'};
                getTypeDescription();
                getTableHeaders();
                getTableItems();
                getBuildingList();
                getContractList('init');
                getSupplementaryList();
                initDataFromClueOrOffer();
            };

            init();

            $scope.showBillsDialog = function(flag, item){
                if((flag === 'other' && item.customization.other_bill > 0) || (flag === 'lease' && item.customization.lease_bill > 0)){
                    $scope.contractItem = angular.copy(item);
                    events.emit('modal', {
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade-and-slide-top',
                        template: 'contractBillTpl'
                    });
                    getContractBills(flag, item.id);
                }
            };

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
                console.log(params)
                for(var key in params){
                    ContractService.updateSearchParam(key, params[key]);
                }
                $scope.filterOption.building ? ContractService.updateSearchParam('building', $scope.filterOption.buildingObj.id) : ContractService.updateSearchParam('building', '');
                $scope.filterOption.keyword ? '' : ContractService.updateSearchParam('keyword', '');
                ContractService.updateSearchParam('pageIndex', '');
            };

            $scope.clearSearchFilters = function(){
                // $scope.filterOption = {};
                // $scope.filterOption.keywordObj = $scope.keywordList[0];
                // _.each($location.search(), function(value, key){
                //     ContractService.updateSearchParam(key, '');
                // });
                for(var key in $scope.filterOption){
                    $scope.filterOption[key] = '';
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
                $scope.download = CONF.api + 'sales/admin/lease/export/leases?';
                $scope.download += formatDownload();
                window.location.href = $scope.download;
            };

            $scope.searchBuilding = function(){
                var params = {};
                if($scope.search.building){
                    params.query = $scope.search.building.key;
                    ContractService.getBuildings(params).success(function(data){
                        $scope.searchReponse.building = data;
                    });
                }
            };

            $scope.searchSpace = function(){
                var params = {};
                if($scope.search.space){
                    $scope.search.building ? params.building = $scope.selectedSearchData.building.id : '';
                    params.query = $scope.search.space.key;
                    ContractService.getBuildingSpaces(params).success(function(data){
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
                    ContractService.getCustomers(params).success(function(data){
                        $scope.searchReponse.customer = data;
                    });
                }
            };

            $scope.searchEnterprise = function(){
                var params = {};
                if($scope.search.enterprise){
                    params.query = $scope.search.enterprise.key;
                    ContractService.getEnterprise(params).success(function(data){
                        $scope.searchReponse.enterprise = data;
                    });
                }
            };

            $scope.updateTableColumn = function($hide){
                $hide();
                var params = {
                    object: 'lease',
                    list_ids: []
                };
                var tempArr = _.filter($scope.dragModels.tableItems, function(item){
                    return item.required || item.checked; 
                }) ;
                params.list_ids = _.pluck(tempArr, 'id');
                ContractService.updateTableColumn(params).success(function(){
                    $scope.cusDrop = false;
                    getTableHeaders();
                    noty('info', '设置表格成功！');
                });
            };

            $scope.checkItem = function(item){
                !item.required ? item.checked = !item.checked : '';
            };

            $scope.resetSelect = function($event){
                 $scope.dragModels.tableItems = angular.copy($scope.copyTableItem);
                 $event.preventDefault();
            };

            $scope.droptoggle = function(){
                $scope.cusDrop = !$scope.cusDrop
            };

            $scope.showDialog = function(flag, item){
                $scope.operateFlag = flag;
                if(item){
                    getRemarks(item.id);
                    getContractDetail(item.id);
                    getLeasesPushedBills(item.id);
                }
                if(flag === 'add'){
                    $scope.agreementOption ={
                        lessee_type: 'personal',
                        is_auto: 0
                    };
                    initBill();
                }
                if($scope.detailInstance && !$scope.detailInstance.$isShown){
                    $scope.detailInstance.show();
                }else if(!$scope.detailInstance){
                    $scope.detailInstance = $modal({
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade-and-slide-top',
                        template: 'contractItemTpl'
                    });
                }
            };

            $scope.switchLeaseeType = function(type){
                $scope.agreementOption.lessee_type = type;
            };

            $scope.goPage = function(index){
                ContractService.updateSearchParam('pageIndex', index);
            };

            $scope.showPrint = function(){
                $scope.operateFlag = 'pdf';
            };

            $scope.exportPDF = function($hide){
                window.location.href = CONF.api + 'sales/admin/pdf/leases/' + $scope.contractItem.id + '?company=' + $cookies.get('salesCompanyId');
                $hide();
            };

            $scope.saveContract = function(status, $hide){
                initLeases();
                var params = angular.copy($scope.agreementOption);
                params.status = status;
                if(validLease(status)){
                    ContractService.createLease(params).success(function(){
                        $hide();
                        noty('info', '合同创建成功！');
                        getContractList();
                    });
                }
            };

            $scope.updateContract = function($hide){
                initLeases();
                var params = angular.copy($scope.agreementOption);
                if(validLease($scope.contractItem.status)){
                    ContractService.updateLease($scope.contractItem.id, params).success(function(){
                       $hide();
                       noty('info', '合同修改成功！');
                       getContractList();
                    });
                }
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

            $scope.deleteBill = function(index){
                var temp = $scope.agreementBills.splice(index, 1)[0];
                temp.id ? $scope.deleteBills.push(temp.id) : '';
            };

            $scope.showUpdate = function(){
                $scope.operateFlag = 'update';
            };

            $scope.showRemark = function(){
                $scope.remarkFlag = true;
            };

            $scope.addRemark = function(){
                $scope.remarkFlag = false;
                if($scope.contract.remark){
                    addRemarkForContract();
                }
            };

            $scope.toggleRemark = function(){
                $scope.remarkListFlag = !$scope.remarkListFlag;
            };

            $scope.setLeasesStatus = function(status, $hide){
                var params = {status: status};
                ContractService.setLeasesStatus($scope.contractItem.id, params).success(function(){
                    status === 'closed' ? noty('info', '合同已作废') : '';
                    $hide();
                    getContractList();
                });
            };

            $scope.selectedBill = function(bill){
                bill.selected = !bill.selected;
            };

            $scope.selectedBill = function(bill){
                bill.selected = !bill.selected;
                $scope.mutiSelectedBills = angular.copy(_.filter($scope.contractItem.bills, 'selected', true));
                $scope.enabledBathPush = $scope.mutiSelectedBills.length > 0 ? true : false;
            };

            $scope.seePopup = function(tag, item){
                var flag = true;
                tag === 'changePushOrderAmount' || tag === 'billAmount' ? $scope.changeAmountOrder = item : '';
                $scope.popupType = tag;
                if(tag === 'bathPush'){
                    if($scope.mutiSelectedBills.length === 0){
                        flag = false;
                        noty('warning', '请选择需要推送的账单！');
                    }
                }else if(tag === 'singlePush'){
                    $scope.mutiSelectedBills = [];
                    $scope.mutiSelectedBills.push(item);
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

            $scope.switchModifyFlag = function(bill){
                !bill.expand ? bill.revised_amount = bill.revised_amount || bill.amout : '';
                bill.expand = !bill.expand;
            };

            $scope.bathPushLeaseBills = function($hide){
                var params = verifyPushParams()
                if(params.length > 0){
                    ContractService.batchPushBills($scope.contractItem.id, params).success(function(){
                        $hide();
                        noty('info','订单推送成功！');
                        getContractDetail($scope.contractItem.id);
                    });
                }
            };

            $scope.pushOtherBill = function($hide){
                var params = angular.copy($scope.otherBill);
                params.start_date = formatDate(params.start_date, 'yyyy-MM-dd');
                params.end_date = formatDate(params.end_date, 'yyyy-MM-dd');
                params.lease_id = $scope.contractItem.id;

                ContractService.createOtherBills(params).success(function(){
                    $hide();
                    noty('info', '其它账单推送成功！');
                    getContractList();
                });
            };

            $scope.effectContract = function($hide){
                initLeases();
                var params = angular.copy($scope.agreementOption);
                params.status = 'performing';
                ContractService.updateLease($scope.contractItem.id, params).success(function(){
                   $hide();
                   noty('info', '合同生效成功！');
                   getContractList();
                }).error(function(data){
                    data.code ? noty('warning', '合同生效失败，请先完善合同！') : '';
                });
            };

            $scope.showLeasesConfirm = function(status, $hide){
                if(status === 'performing'){
                    events.emit('confirm', {
                        title: '生效合同',
                        content: '生效合同后，客户将能使用合同内租约的房间，是否确认生效合同',
                        btnName: '生效',
                        btnClass: 'btn-success',
                        onConfirm: function() {
                            // $scope.setLeasesStatus(status)
                            $scope.effectContract($hide)
                        }
                    });
                }else if(status === 'closed'){
                    events.emit('confirm', {
                        title: '作废合同',
                        content: '是否确认作废合同?',
                        btnName: '作废合同',
                        onConfirm: function() {
                            $scope.setLeasesStatus(status, $hide)
                        }
                    });
                }else if(status === 'terminated' || status === 'end'){
                    $scope.popupType = status;
                    events.emit('modal', {
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade',
                        template: 'popupTpl'
                    });
                }
            };

            $scope.$watch('selectedSearchData.building', function(newValue, oldValue){
                if(newValue === oldValue){
                    return;
                }
                newValue && newValue.id ? newValue.building_id = newValue.id : '';
                if($scope.selectedSearchData.space && newValue.building_id && newValue.building_id !== $scope.selectedSearchData.space.building_id){
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
                    
                    $scope.selectedSearchData.building = angular.copy(newValue.building);
                    $scope.search.building = {};
                    $scope.search.building.key = newValue.building.name;
                }
            }, true);
            
        }
        return ['$rootScope', '$scope', 'ContractService', 'events', '$filter', 'CONF', '$location', '$cookies', '$translate', 'CurrentAdminService', 'utils', '$modal', ContractController];

    });

})(define);
