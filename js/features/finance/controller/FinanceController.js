/**
 *  Defines the FinanceController controller
 *
 *  @author  liping.chen
 *  @date    Jun 13, 2016
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the FinanceController class with RequireJS
     */
    define(['lodash', 'angular'], function(_, angular) {
        /**
         * @constructor
         */

        var FinanceController = function($rootScope, $sce, $scope, events, utils, FinanceService, CurrentAdminService, $popover, $filter, $translate, ImageUploaderService, CONF, focus, $location) {
            
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.PERMISSION_FINANCE_KEY = 'sales.platform.financial_summary';
            $scope.PERMISSION_INVOICE_KEY = 'sales.platform.invoice';
            $scope.PERMISSION_WITHDRAWAL_KEY = 'sales.platform.withdrawal';
            $scope.PERMISSION_SPACE_KEY = 'sales.building.order';
            $scope.PERMISSION_AUDIT_KEY = 'sales.platform.audit';
            $scope.PERMISSION_LONGTERM_BILL_KEY = 'sales.platform.long_term_service_bills';
            $scope.PERMISSION_MONTHLY_BILL_KEY = 'sales.platform.monthly_bills';
            $scope.PERMISSION_ACCOUNT_KEY = 'sales.platform.account';

            $scope.pageType = FinanceService.getSearchParam('pageType') ? FinanceService.getSearchParam('pageType') : 'finance';
            $scope.tabType = FinanceService.getSearchParam('tabType') ? FinanceService.getSearchParam('tabType') : 'all';
            $scope.invoiceStatus = FinanceService.getInvoiceStatus();
            $scope.orders = {};
            $scope.userOptions = {};
            $scope.roomTypeDesc = {};
            $scope.invStatusList = FinanceService.getInvStatusList();
            $scope.invoiceType = FinanceService.getInvoiceType();
            $scope.invTypeList = FinanceService.getInvTypeList();
            $scope.unitDesc = FinanceService.getUnitDesc();
            $scope.spaceOrderStatus = FinanceService.getSpaceOrderStatus();
            $scope.keywordList = FinanceService.getKeywordList($scope.pageType);
            $scope.deliveryOption = FinanceService.getDeliveryOption();
            $scope.orders = {};
            $scope.userOptions = {};
            $scope.roomTypeDesc = {};
            $scope.filterOption = {};
            $scope.accountInfo = {};
            $scope.invoiceInfo = {};
            $scope.expressInfo = {};
            $scope.placeholder = {
                all: '全部'
            };
            $scope.expandFlag = false;
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: FinanceService.getSearchParam('pageIndex') ? parseInt(FinanceService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.filterStatus = FinanceService.getFilterStatus($scope.pageType);
            $scope.editFlag = {
                account: false,
                invoice: false,
                express: false
            };

            $scope.createFlag = {
                account: false,
                invoice: false,
                express: false
            };
            
            $scope.salesOffline = {
                note: ''
            };
            $scope.billFilterOptions = {};
            $scope.serviceOption = {
                amount: ''
            };
            $scope.withDrawals = {
                amount: ''
            };
            $scope.offlineImage = {};
            /* second rent invoice*/
            $scope.openBox = false;
            $scope.shortRentInvoices = [];
            $scope.shortRentInvoiceApplications = [];
            $scope.shortRentApplicationItem = {};
            $scope.booleans = {
                listAllChecked: false
            };
            $scope.shortRentModels = {
                invoiceNo: ''
            };
            $scope.selectedShortRentInvoices = [];
            $scope.selectedShortRentInvoicesAmount = '';
            $scope.shortRentOptions = {};
            $scope.createOptions = {remarkText: ''};
            $scope.remarkList = [];
            /* second rent invoice*/
            /* long rent*/
            $scope.longRentFilterOptions = {};
            /* long rent*/
            $rootScope.selectDropdown = false;

            var onContentImageUploaded = function (item, response) {
                $scope.offlineImage.content = response.download_link;
                $scope.offlineImage.attachment_type = response.content_type;
                $scope.offlineImage.filename = response.filename;
                $scope.offlineImage.preview = response.preview_link;
                $scope.offlineImage.size = "1";
            };
            $scope.contentImageUploader = ImageUploaderService.createUncompressedImageUploader(
                'fapiao',
                onContentImageUploaded
            );

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var validParams = function(param, msg){
                if(param){
                    noty('error', msg);
                    return false;
                }
                return true;
            };

            var getFilterParams = function(){
                FinanceService.getSearchParam('keyword_search') ? $scope.billFilterOptions.keyword_search = FinanceService.getSearchParam('keyword_search') : '';
                FinanceService.getSearchParam('keyword') ? $scope.billFilterOptions.keyword = FinanceService.getSearchParam('keyword') : '';
                FinanceService.getSearchParam('keyword') ? $scope.billFilterOptions.keyword = _.find($scope.keywordList, function(item){return item.value == FinanceService.getSearchParam('keyword')}): $scope.billFilterOptions.keyword = $scope.keywordList[0];

                FinanceService.getSearchParam('keyword') ? $scope.filterOption.keyword = FinanceService.getSearchParam('keyword') : '';
                FinanceService.getSearchParam('keyword') ? $scope.filterOption.keyword = _.find($scope.keywordList, function(item){return item.value == FinanceService.getSearchParam('keyword')}): $scope.filterOption.keyword = $scope.keywordList[0];
                FinanceService.getSearchParam('send_start') ? $scope.billFilterOptions.send_start = FinanceService.getSearchParam('send_start') : '';
                FinanceService.getSearchParam('send_end') ? $scope.billFilterOptions.send_end = FinanceService.getSearchParam('send_end') : '';
                FinanceService.getSearchParam('amount_start') ? $scope.billFilterOptions.amount_start = Number(FinanceService.getSearchParam('amount_start')) : '';
                FinanceService.getSearchParam('amount_end') ? $scope.billFilterOptions.amount_end = Number(FinanceService.getSearchParam('amount_end')) : '';
                FinanceService.getSearchParam('create_start') ? $scope.billFilterOptions.create_start = FinanceService.getSearchParam('create_start') : '';
                FinanceService.getSearchParam('create_end') ? $scope.billFilterOptions.create_end = FinanceService.getSearchParam('create_end') : '';
                FinanceService.getSearchParam('success_start') ? $scope.billFilterOptions.success_start = FinanceService.getSearchParam('success_start') : '';
                FinanceService.getSearchParam('success_end') ? $scope.billFilterOptions.success_end = FinanceService.getSearchParam('success_end') : '';
                FinanceService.getSearchParam('status') ? $scope.billFilterOptions.status = FinanceService.getSearchParam('status') : '';
                FinanceService.getSearchParam('status') ? $scope.billFilterOptions.statusObj = _.find($scope.filterStatus, function(item){return item.value == FinanceService.getSearchParam('status')}): '';

                FinanceService.getSearchParam('amount_min') ? $scope.filterOption.amount_min = Number(FinanceService.getSearchParam('amount_min')) : '';
                FinanceService.getSearchParam('amount_max') ? $scope.filterOption.amount_max = Number(FinanceService.getSearchParam('amount_max')) : '';
                FinanceService.getSearchParam('requestStart') ? $scope.filterOption.requestStart = FinanceService.getSearchParam('requestStart') : '';
                FinanceService.getSearchParam('requestEnd') ? $scope.filterOption.requestEnd = FinanceService.getSearchParam('requestEnd') : '';
                // FinanceService.getSearchParam('invoiceStart') ? $scope.filterOption.invoiceStart = FinanceService.getSearchParam('invoiceStart') : '';
                // FinanceService.getSearchParam('invoiceEnd') ? $scope.filterOption.invoiceEnd = FinanceService.getSearchParam('invoiceEnd') : '';
                FinanceService.getSearchParam('invoice_type') ? $scope.filterOption.invoice_type = FinanceService.getSearchParam('invoice_type') : '';
                FinanceService.getSearchParam('category') ? $scope.filterOption.category = FinanceService.getSearchParam('category') : '';
                FinanceService.getSearchParam('invoice_type') ? $scope.filterOption.type = _.find($scope.invTypeList, function(item){return item.value == FinanceService.getSearchParam('invoice_type')}): '';
                FinanceService.getSearchParam('order_number') ? $scope.filterOption.order_number = FinanceService.getSearchParam('order_number') : '';
                FinanceService.getSearchParam('order_number') ? $scope.filterOption.keyword = _.find($scope.keywordList, function(item){return item.value == 'order_number'}) : '';
                FinanceService.getSearchParam('invoice_number') ? $scope.filterOption.invoice_number = FinanceService.getSearchParam('invoice_number') : '';
                FinanceService.getSearchParam('invoice_number') ? $scope.filterOption.keyword = _.find($scope.keywordList, function(item){return item.value == 'invoice_number'}) : '';
                FinanceService.getSearchParam('user_name') ? $scope.filterOption.user_name = FinanceService.getSearchParam('user_name') : '';
                FinanceService.getSearchParam('user_name') ? $scope.filterOption.keyword = _.find($scope.keywordList, function(item){return item.value == 'user_name'}) : '';
                /* long rent */
                FinanceService.getSearchParam('amount_start') ? $scope.longRentFilterOptions.amount_start = Number(FinanceService.getSearchParam('amount_start')) : '';
                FinanceService.getSearchParam('amount_end') ? $scope.longRentFilterOptions.amount_end = Number(FinanceService.getSearchParam('amount_end')) : '';
                FinanceService.getSearchParam('create_start') ? $scope.longRentFilterOptions.create_start = FinanceService.getSearchParam('create_start') : '';
                FinanceService.getSearchParam('create_end') ? $scope.longRentFilterOptions.create_end = FinanceService.getSearchParam('create_end') : '';
                FinanceService.getSearchParam('status') ? $scope.longRentFilterOptions.statusObj = _.find($scope.filterStatus, function(item){return item.value == FinanceService.getSearchParam('status')}): '';
                /* long rent history */
                FinanceService.getSearchParam('keyword') ? $scope.longRentFilterOptions.keywordObj = _.find($scope.keywordList, function(item){return item.value == FinanceService.getSearchParam('keyword')}): $scope.longRentFilterOptions.keywordObj = $scope.keywordList[0];
                FinanceService.getSearchParam('keyword_search') ? $scope.longRentFilterOptions.keyword_search = FinanceService.getSearchParam('keyword_search') : '';
                FinanceService.getSearchParam('keyword') ? $scope.longRentFilterOptions.keyword = FinanceService.getSearchParam('keyword') : '';
                FinanceService.getSearchParam('type') ? $scope.longRentFilterOptions.typeObj = _.find($scope.filterStatus, function(item){return item.value == FinanceService.getSearchParam('type')}): '';
                /* long rent history */
                /* long rent */
                /* short rent */
                FinanceService.getSearchParam('amount_start') ? $scope.shortRentOptions.amount_start = Number(FinanceService.getSearchParam('amount_start')) : '';
                FinanceService.getSearchParam('amount_end') ? $scope.shortRentOptions.amount_end = Number(FinanceService.getSearchParam('amount_end')) : '';
                FinanceService.getSearchParam('create_start') ? $scope.shortRentOptions.create_start = FinanceService.getSearchParam('create_start') : '';
                FinanceService.getSearchParam('create_end') ? $scope.shortRentOptions.create_end = FinanceService.getSearchParam('create_end') : '';
                FinanceService.getSearchParam('status') ? $scope.shortRentOptions.statusObj = _.find($scope.filterStatus, function(item){return item.value == FinanceService.getSearchParam('status')}): '';

                /* short rent */
                /* finance summary */
                FinanceService.getSearchParam('year') ? $scope.billFilterOptions.year = FinanceService.getSearchParam('year') : '';
            };

            var initFilterParams = function(){
                $scope.billFilterOptions.keyword_search ? $scope.billFilterOptions.keyword_search = $scope.billFilterOptions.keyword_search : '';
                $scope.billFilterOptions.send_start ? $scope.billFilterOptions.send_start = formatDate($scope.billFilterOptions.send_start, 'yyyy-MM-dd') : '';
                $scope.billFilterOptions.send_end ? $scope.billFilterOptions.send_end = formatDate($scope.billFilterOptions.send_end, 'yyyy-MM-dd') : '';
                $scope.billFilterOptions.amount_start ? $scope.billFilterOptions.amount_start = $scope.billFilterOptions.amount_start : '';
                $scope.billFilterOptions.amount_end ? $scope.billFilterOptions.amount_end = $scope.billFilterOptions.amount_end : '';
                $scope.billFilterOptions.yearObj ? $scope.billFilterOptions.year = $scope.billFilterOptions.yearObj.name : '';
                $scope.billFilterOptions.create_start ? $scope.billFilterOptions.create_start = formatDate($scope.billFilterOptions.create_start, 'yyyy-MM-dd') : '';
                $scope.billFilterOptions.create_end ? $scope.billFilterOptions.create_end = formatDate($scope.billFilterOptions.create_end, 'yyyy-MM-dd') : '';
                $scope.billFilterOptions.success_start ? $scope.billFilterOptions.success_start = formatDate($scope.billFilterOptions.success_start, 'yyyy-MM-dd') : '';
                $scope.billFilterOptions.success_end ? $scope.billFilterOptions.success_end = formatDate($scope.billFilterOptions.success_end, 'yyyy-MM-dd') : '';
                $scope.billFilterOptions.statusObj ? $scope.billFilterOptions.status = $scope.billFilterOptions.statusObj.value : '';

                $scope.filterOption.keyword ? $scope.filterOption.keyword = $scope.filterOption.keyword : '';
                $scope.filterOption.amount_min ? $scope.filterOption.amount_min = $scope.filterOption.amount_min : '';
                $scope.filterOption.amount_max ? $scope.filterOption.amount_max = $scope.filterOption.amount_max : '';
                $scope.filterOption.requestStart ? $scope.filterOption.requestStart = formatDate($scope.filterOption.requestStart, 'yyyy-MM-dd') : '';
                $scope.filterOption.requestEnd ? $scope.filterOption.requestEnd = formatDate($scope.filterOption.requestEnd, 'yyyy-MM-dd') : '';
                // $scope.filterOption.invoiceStart ? $scope.filterOption.invoiceStart = formatDate($scope.filterOption.invoiceStart, 'yyyy-MM-dd') : '';
                // $scope.filterOption.invoiceEnd ? $scope.filterOption.invoiceEnd = formatDate($scope.filterOption.invoiceEnd, 'yyyy-MM-dd') : '';
                $scope.filterOption.type ? $scope.filterOption.invoice_type = $scope.filterOption.type.value : '';
                // $scope.filterOption.categoryObj.name ? $scope.filterOption.category = $scope.filterOption.categoryObj.id : '';

                /* long rent */
                $scope.longRentFilterOptions.amount_start ? $scope.longRentFilterOptions.amount_start = $scope.longRentFilterOptions.amount_start : '';
                $scope.longRentFilterOptions.amount_end ? $scope.longRentFilterOptions.amount_end = $scope.longRentFilterOptions.amount_end : '';
                $scope.longRentFilterOptions.create_start ? $scope.longRentFilterOptions.create_start = formatDate($scope.longRentFilterOptions.create_start, 'yyyy-MM-dd') : '';
                $scope.longRentFilterOptions.create_end ? $scope.longRentFilterOptions.create_end = formatDate($scope.longRentFilterOptions.create_end, 'yyyy-MM-dd') : '';
                $scope.longRentFilterOptions.statusObj ? $scope.longRentFilterOptions.status = $scope.longRentFilterOptions.statusObj.value : '';
                /* long rent history */
                $scope.longRentFilterOptions.keywordObj ? $scope.longRentFilterOptions.keyword = $scope.longRentFilterOptions.keywordObj.value : '';
                $scope.longRentFilterOptions.keyword_search ? $scope.longRentFilterOptions.keyword_search = $scope.longRentFilterOptions.keyword_search : '';
                $scope.longRentFilterOptions.keyword ? $scope.longRentFilterOptions.keyword = $scope.longRentFilterOptions.keyword : '';
                $scope.longRentFilterOptions.typeObj ? $scope.longRentFilterOptions.type = $scope.longRentFilterOptions.typeObj.value : '';
                /* long rent history */
                /* long rent */
                /* short rent */
                $scope.shortRentOptions.statusObj ? $scope.shortRentOptions.status = $scope.shortRentOptions.statusObj.value : '';
                $scope.shortRentOptions.amount_start ? $scope.shortRentOptions.amount_start = $scope.shortRentOptions.amount_start : '';
                $scope.shortRentOptions.amount_end ? $scope.shortRentOptions.amount_end = $scope.shortRentOptions.amount_end : '';
                $scope.shortRentOptions.create_start ? $scope.shortRentOptions.create_start = formatDate($scope.shortRentOptions.create_start, 'yyyy-MM-dd') : '';
                $scope.shortRentOptions.create_end ? $scope.shortRentOptions.create_end = formatDate($scope.shortRentOptions.create_end, 'yyyy-MM-dd') : '';
                /* short rent */

                var cache = {};
                if($scope.pageType == 'invoice'){
                    // cache = _.pick($scope.filterOption, 'order_number', 'invoice_number', 'amount_min', 'amount_max', 'requestStart', 'requestEnd', 'invoiceStart', 'invoiceEnd', 'invoice_type', 'category');
                    cache = _.pick($scope.filterOption, 'order_number', 'invoice_number', 'user_name', 'amount_min', 'amount_max', 'requestStart', 'requestEnd', 'invoice_type', 'category');
                    // $scope.filterOption.keyword ? cache.keyword = $scope.filterOption.keyword.value : '';
                }else if($scope.pageType == 'salesOffline'){
                    cache = _.pick($scope.billFilterOptions, 'keyword_search', 'send_start', 'send_end', 'end_date', 'amount_start', 'amount_end');
                    $scope.billFilterOptions.keyword ? cache.keyword = $scope.billFilterOptions.keyword.value : '';
                    // $scope.filterOption.keyword ? cache.keyword = $scope.filterOption.keyword.value : '';
                }else if($scope.pageType == 'longRent'){
                    cache = _.pick($scope.longRentFilterOptions, 'status', 'create_start', 'create_end', 'amount_start', 'amount_end');
                }else if($scope.pageType == 'longRentHistory'){
                    cache = _.pick($scope.longRentFilterOptions, 'type', 'keyword_search', 'keyword', 'create_start', 'create_end', 'amount_start', 'amount_end');
                }else if($scope.pageType == 'secondRent'){
                    cache = _.pick($scope.shortRentOptions, 'status', 'create_start', 'create_end', 'amount_start', 'amount_end');
                }else if($scope.pageType == 'financeSummary'){
                    cache = _.pick($scope.billFilterOptions, 'year');
                }else if($scope.pageType == 'withdrawalRecord'){
                    cache = _.pick($scope.billFilterOptions, 'create_start', 'create_end', 'success_start', 'success_end', 'amount_start', 'amount_end', 'status');
                }
                return cache;
            };

            var getUsers = function(params){
                FinanceService.getUsers(params).success(function(data){
                    _.each(data, function(item){
                        item.avatar = CONF.file + '/person/' + item.id + '/avatar_small.jpg';
                        $scope.userOptions[item.id] = item;
                    });
                });
            };

            var getBillsList = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                if(FinanceService.getSearchParam('tabType') && FinanceService.getSearchParam('tabType') != 'all'){
                    params.status = FinanceService.getSearchParam('tabType');
                }
                $scope.loaded = false;
                FinanceService.getBillsList(params).success(function(data){
                    $scope.billsList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each($scope.billsList, function(item){
                        arr.push(item.drawee);
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                    $scope.loaded = true;
                });
            };

            var getLeasesBillDetail = function(){
                FinanceService.getLeasesBillDetail(FinanceService.getSearchParam('billId')).success(function(data){
                    $scope.billItem = data;
                    var arr = [];
                    data.drawee ? arr.push(data.drawee): '';
                    data.lease.drawee ? arr.push(data.lease.drawee): '';
                    data.reviser ? arr.push(data.reviser): '';
                    arr = _.uniq(arr);
                    getUsers({'id[]': arr})
                });
            };

            var validateDelivery = function () {
                var reZipcode = /^[1-9]\d{5}$/;
                var rePhone = /^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/;
                var validationFlag = true;

                validationFlag = validationFlag ? validParams(!$scope.deliveryOption.delivery_company, '快递公司不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.deliveryOption.delivery_id, '快递单号不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.deliveryOption.address, '快递地址不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.deliveryOption.phone, '收件人电话不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!rePhone.test($scope.deliveryOption.phone), '电话号码格式不正确！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.deliveryOption.name, '收件人姓名不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.deliveryOption.zipCode, '邮政编码不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!reZipcode.test($scope.deliveryOption.zipCode), '邮政编码格式不正确！') : validationFlag;

                return validationFlag;
            };

            var getRoomType = function(){
                FinanceService.getRoomTypes().success(function(data){
                    _.each(data, function(item){
                        $scope.roomTypeDesc[item.name] = item;
                    });
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

            var getOrderBuildingId = function(ids){
                var params = {'ids[]': ids};
                FinanceService.getOrderBuildingIds(params).success(function(data){
                    $scope.orderOptions = {};
                    _.each(data, function(item){
                        $scope.orderOptions[item.id] = item.building_id;
                    });
                });
            };

            var getBillBuildingId = function(ids){
                var params = {'ids[]': ids};
                FinanceService.getBillBuildingIds(params).success(function(data){
                    $scope.billOptions = {};
                    _.each(data, function(item){
                        $scope.billOptions[item.id] = item.building_id;
                    });
                });
            };

            var getInvoiceList = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                if($scope.tabType == 'all'){
                    var tempList = angular.copy($scope.invStatusList);
                    params['status[]'] = _.pluck(tempList.push({name: '已撤销', value: 'cancelled_wait'}), 'value');
                }else if($scope.tabType == 'pending'){
                    params['status[]'] = ['pending', 'cancelled_wait'];
                }else{
                    params['status[]'] = [$scope.tabType];
                }
                FinanceService.getInvoiceList(params).success(function(data){
                    $scope.invoiceList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    var orderIds = [];
                    var billIds = [];
                    _.each($scope.invoiceList, function(item){
                        item.region = getAddress(item.address);
                        item.address = JSON.parse(item.address);
                        item.invoice_profile = JSON.parse(item.invoice_profile);
                        item.order_id ? orderIds.push(item.order_id) : '';
                        item.bill_id ? billIds.push(item.bill_id) : '';
                        arr.push(item.user_id);
                    });
                    arr = _.uniq(arr);
                    orderIds.length > 0 ? getOrderBuildingId(orderIds) : '';
                    billIds.length > 0 ? getBillBuildingId(billIds) : '';
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                });
                $scope.refresh = false;
            };

            var getInvoice = function(){
                FinanceService.getInvoice(FinanceService.getSearchParam('invoiceId')).success(function(data){
                    $scope.invoiceItem = data;
                    $scope.invoiceItem.region = getAddress($scope.invoiceItem.address);
                    $scope.invoiceItem.address = JSON.parse($scope.invoiceItem.address);
                    $scope.invoiceItem.invoice_profile = JSON.parse($scope.invoiceItem.invoice_profile);
                    getUsers({'id[]': [$scope.invoiceItem.user_id]});
                    if(data.bill_id){
                        FinanceService.getLeasesBillDetail(data.bill_id).success(function(bill){
                            $scope.orderItem = bill;
                            $scope.orderItem.order_number = bill.serial_number;
                            $scope.orderItem.product_info = bill.lease.product;
                        });
                    }else {
                        FinanceService.getOrder(data.order_id).success(function(order){
                            $scope.orderItem = order;
                            $scope.orderItem.product_info = JSON.parse($scope.orderItem.product_info);
                        });
                    }
                });
            };

            // var getCategory = function(){
            //     FinanceService.getCategory().success(function(data){
            //         $scope.categories = data;
            //         _.each($scope.categories, function(cat){
            //             cat.name = cat.category;
            //             cat.id = cat.category;
            //         });
            //         FinanceService.getSearchParam('category') ? $scope.filterOption.categoryObj = _.find($scope.categories, function(item){return item.id == FinanceService.getSearchParam('category')}): '';
            //     });
            // };

            var setStatus = function(item){
                var params = [];
                params.push({'op': 'add', 'path': '/status', 'value': 'completed'});
                FinanceService.editInvoice(params, item.id).success(function(){
                    getInvoiceList();
                });
            };

            var getAccountInfo = function(){
                FinanceService.getAccountInfo().success(function(data){
                    data ? $scope.accountInfo = data : '';
                    $scope.createFlag.account = data ? false : true;
                });
            };

            var getInvoiceInfo = function(){
                FinanceService.getInvoiceInfo().success(function(data){
                    data ? $scope.invoiceInfo = data : '';
                    $scope.createFlag.invoice = data ? false : true;
                });
            };

            var getExpressInfo = function(){
                FinanceService.getExpressInfo().success(function(data){
                    data ? $scope.expressInfo = data : '';
                    $scope.createFlag.express = data ? false : true;
                });
            };

            var validateAccount = function(){
                var re = /^[\+]?\d+(?:\.\d{0,2})?$/;
                var validationFlag = true;
                validationFlag = validationFlag ? validParams(!$scope.accountInfo.sales_company_name, '企业名称不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.accountInfo.business_scope, '经营范围不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.accountInfo.bank_account_name, '基本开户行不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.accountInfo.bank_account_number, '开户账号不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!re.test($scope.accountInfo.bank_account_number), '开户账号必须为数字！') : validationFlag;
                return validationFlag;
            };

            var validateInvoice = function(){
                var re = /^[\+]?\d+(?:\.\d{0,2})?$/;
                var validationFlag = true;
                validationFlag = validationFlag ? validParams(!$scope.invoiceInfo.title, '发票抬头不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.invoiceInfo.category, '发票类型不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.invoiceInfo.taxpayer_id, '纳税人识别号不能为空！') : validationFlag;
                if($scope.invoiceInfo.category.value == 'special'){
                    validationFlag = validationFlag ? validParams(!$scope.invoiceInfo.address, '地址不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.invoiceInfo.phone, '电话不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.invoiceInfo.bank_account_name, '开户行不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.invoiceInfo.bank_account_number, '开户账号不能为空！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!re.test($scope.invoiceInfo.bank_account_number), '开户账号必须为数字！') : validationFlag;
                }
                return validationFlag;
            };

            var validateExpress = function(){
                var validationFlag = true;
                validationFlag = validationFlag ? validParams(!$scope.expressInfo.recipient, '收件人不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.expressInfo.address, '手机号不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.expressInfo.phone, '快递地址不能为空！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.expressInfo.zip_code, '邮编不能为空！') : validationFlag;
                return validationFlag;
            };

            var createAccountInfo = function(type){
                if(validateAccount() === false){
                    return;
                }
                var params = {
                    'sales_company_name': $scope.accountInfo.sales_company_name,
                    'business_scope': $scope.accountInfo.business_scope,
                    'bank_account_name': $scope.accountInfo.bank_account_name,
                    'bank_account_number': $scope.accountInfo.bank_account_number
                };
                FinanceService.createAccountInfo(params).success(function(){
                    noty('info', '创建企业账户信息成功！');
                    $scope.editFlag[type] = false;
                    getAccountInfo();
                });
            };

            var createInvoiceInfo = function(type){
                if(validateInvoice() === false){
                    return;
                }
                var params = {
                    'title': $scope.invoiceInfo.title,
                    'category': $scope.invoiceInfo.category.value,
                    'taxpayer_id': $scope.invoiceInfo.taxpayer_id
                };
                if($scope.invoiceInfo.category.value == 'special'){
                    params.address = $scope.invoiceInfo.address;
                    params.phone = $scope.invoiceInfo.phone;
                    params.bank_account_name = $scope.invoiceInfo.bank_account_name;
                    params.bank_account_number = $scope.invoiceInfo.bank_account_number;
                }
                FinanceService.createInvoiceInfo(params).success(function(){
                    noty('info', '创建发票信息成功！');
                    $scope.editFlag[type] = false;
                    getInvoiceInfo();
                });
            };

            var createExpressInfo = function(type){
                if(validateExpress() === false){
                    return;
                }
                var params = {
                    'recipient': $scope.expressInfo.recipient,
                    'address': $scope.expressInfo.address,
                    'phone': $scope.expressInfo.phone,
                    'zip_code': $scope.expressInfo.zip_code
                };
                FinanceService.createExpressInfo(params).success(function(){
                    noty('info', '创建快递信息成功！');
                    $scope.editFlag[type] = false;
                    getExpressInfo();
                });
            };

            var editAccountInfo = function(type){
                if(validateAccount() === false){
                    return;
                }
                var params = [];
                params.push({'op': 'add', 'path': '/sales_company_name', 'value': $scope.accountInfo.sales_company_name});
                params.push({'op': 'add', 'path': '/business_scope', 'value': $scope.accountInfo.business_scope});
                params.push({'op': 'add', 'path': '/bank_account_name', 'value': $scope.accountInfo.bank_account_name});
                params.push({'op': 'add', 'path': '/bank_account_number', 'value': $scope.accountInfo.bank_account_number});
                FinanceService.editAccountInfo(params, $scope.accountInfo.id).success(function(){
                    noty('info', '编辑企业账户信息成功！');
                    $scope.editFlag[type] = false;
                    getAccountInfo();
                });
            };

            var editInvoiceInfo = function(type){
                if(validateInvoice() === false){
                    return;
                }
                var params = [];
                params.push({'op': 'add', 'path': '/title', 'value': $scope.invoiceInfo.title});
                params.push({'op': 'add', 'path': '/category', 'value': $scope.invoiceInfo.category.value});
                params.push({'op': 'add', 'path': '/taxpayer_id', 'value': $scope.invoiceInfo.taxpayer_id});
                if($scope.invoiceInfo.category.value == 'special'){
                    params.push({'op': 'add', 'path': '/address', 'value': $scope.invoiceInfo.address});
                    params.push({'op': 'add', 'path': '/phone', 'value': $scope.invoiceInfo.phone});
                    params.push({'op': 'add', 'path': '/bank_account_name', 'value': $scope.invoiceInfo.bank_account_name});
                    params.push({'op': 'add', 'path': '/bank_account_number', 'value': $scope.invoiceInfo.bank_account_number});
                }
                FinanceService.editInvoiceInfo(params, $scope.invoiceInfo.id).success(function(){
                    noty('info', '编辑开票信息成功！');
                    $scope.editFlag[type] = false;
                    getInvoiceInfo();
                });
            };

            var editExpressInfo = function(type){
                if(validateExpress() === false){
                    return;
                }
                var params = [];
                params.push({'op': 'add', 'path': '/recipient', 'value': $scope.expressInfo.recipient});
                params.push({'op': 'add', 'path': '/address', 'value': $scope.expressInfo.address});
                params.push({'op': 'add', 'path': '/phone', 'value': $scope.expressInfo.phone});
                params.push({'op': 'add', 'path': '/zip_code', 'value': $scope.expressInfo.zip_code});
                FinanceService.editExpressInfo(params, $scope.expressInfo.id).success(function(){
                    noty('info', '编辑快递信息成功！');
                    $scope.editFlag[type] = false;
                    getExpressInfo();
                });
            };

            var getLongRentBillList = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                FinanceService.getLongTermRentServiceList(params).success(function(data){
                    $scope.serviceList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                });
            };

            var getLongRentHistoryBillList = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                FinanceService.getLongTermRentHistoryServiceList(params).success(function(data){
                    $scope.serviceList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                });
            };

            var getServiceBillDetail = function(){
                FinanceService.getServiceBillDetail(FinanceService.getSearchParam('serviceBillId')).success(function(data){
                    $scope.servillBillItem = data;
                    $scope.servillBillItem.invoice = JSON.parse(data.bill_invoice.invoice_json);
                    $scope.servillBillItem.express = JSON.parse(data.bill_invoice.express_json);
                });
            };

            var getTotalServiceFee = function(){
                FinanceService.getTotalServiceFee().success(function(data){
                    $scope.totalServiceFee = data.service_fee;
                });
            };

            var getFileServer = function(){
                FinanceService.getFileServer({target: 'fapiao'}).success(function(data){
                    $scope.uploadImgServer = data.file_server_domain + '/sales/admin';
                });
            };

            /* second rent invoice*/
            var getShortRentInvoices = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                FinanceService.getShortRentInvoices(params).success(function(data){
                    $scope.shortRentInvoices = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    $scope.secondInvoiceTotalAccount = data.invoice_balance;
                    _.each($scope.shortRentInvoices, function(invoice){
                        invoice.checked = false;
                    });
                });
            };

            var getShortRentInvoicesByIds = function(){
                var arr;
                if($scope.pageType == 'secondRentInvoiceDetail' || FinanceService.getSearchParam('id')){
                    arr = _.pluck($scope.shortRentApplicationItem.invoices, 'id');
                }else{
                    arr = FinanceService.getSearchParam('invoiceIds').split(',');
                }
                var params = {'id[]': arr};
                FinanceService.getShortRentInvoicesByIds(params).success(function(data){
                    $scope.selectedShortRentInvoices = data;
                    $scope.selectedShortRentInvoicesAmount = _.sum(_.pluck(data, 'amount'));
                });
            };

            var getShortRentInvoiceApplications = function(){
                var params = {};
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                FinanceService.getShortRentInvoiceApplications(params).success(function(data){
                    $scope.shortRentInvoiceApplications = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                });
            };

            var getShortRentInvoiceApplicationById = function(){
                FinanceService.getShortRentInvoiceApplicationById(FinanceService.getSearchParam('id')).success(function(data){
                    $scope.shortRentApplicationItem = data;
                    getShortRentInvoicesByIds();
                });
            };
            /* second rent invoice*/

            var validServiceParams = function(){
                var validationFlag = true;
                validationFlag = validationFlag ? validParams($scope.serviceOption.amount <= 0, '支付账单金额不能小于等于0！') : validationFlag;
                validationFlag = validationFlag ? validParams($scope.serviceOption.amount > $scope.totalServiceFee, '输入的金额不能大于待支付账单总金额!') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.offlineImage.content, '请上传银行汇款凭证！') : validationFlag;
                return validationFlag;
            };

            var validRentParams = function(){
                var validationFlag = true;
                validationFlag = validationFlag ? validParams(!$scope.shortRentModels.invoiceNo, '请填写发票编号!') : validationFlag;
                return validationFlag;
            };

            var getFinanceWithDrawalsList = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                FinanceService.getFinanceWithDrawalsList(params).success(function(data){
                    $scope.withDrawalsList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                });
            };

            var formatAccountNum = function(number){
                number = number.replace(/\s/g, '');
                var arr = number.split('');
                for(var i = 0; i < arr.length; i++){
                    if((i+1)%4 === 0){
                        arr[i] = arr[i] + ' ';
                    }
                }
                return arr.join('');
            };

            var getSandboxInfo = function(){
                FinanceService.getSandboxInvoiceInfo().success(function(data){
                    $scope.sandboxInfo = data;
                    $scope.sandboxInfo.bank_account = formatAccountNum(data.bank_account);
                });
            };

            var getYearList = function(){
                FinanceService.getYearsList().success(function(data){
                    $scope.summaryYearList = _.map(data.years, function(item){
                        var temp = {name: item};
                        FinanceService.getSearchParam('year') && FinanceService.getSearchParam('year') == item ? $scope.billFilterOptions.yearObj = temp : '';
                        return temp;
                    });
                });
            };

            var getSummaryList = function(){
                getFilterParams();
                var params = initFilterParams();
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;

                FinanceService.getSummaryList(params).success(function(data){
                    $scope.summaryList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                });
            };

            var getCurrentSummary = function(){
                FinanceService.getCurrentSummary().success(function(data){
                    $scope.currentSummary = data;
                });
            };

            var getFinanceCounts = function(){
                FinanceService.getFinanceCounts().success(function(data){
                    $scope.latestFinanceCounts = data;
                });
            };

            var getWalletCounts = function(){
                FinanceService.getWalletCounts().success(function(data){
                    $scope.latestWalletCounts = data;
                });
            };

            var checkProfileExist = function(){
                FinanceService.checkProfileExist().success(function(data){
                    $scope.profileInfoFlag = data.exist;
                });
            };

            var getCustomerService = function(){
                FinanceService.getCustomerService().success(function(data){
                    $scope.customerservice = {};
                    _.each(data.customerservice, function(item){
                        $scope.customerservice[item] = true;
                    });
                });
            };

            var getRemarkList = function() {
                var params = {};
                if($scope.pageType == 'salesOffline_billDetail') {
                    params = {'object': 'lease_bill', 'object_id': FinanceService.getSearchParam('billId')};
                }
                FinanceService.getRemarkList(params).success(function(data) {
                    $scope.remarkList = data;
                });
            };

            var initCrumbs = function(){
                $rootScope.crumbs = {first: '财务管理'};
                if($scope.pageType === 'invoice'){
                    $rootScope.crumbs.second = '处理开票申请';
                }else if($scope.pageType === 'invoiceDetail'){
                    $rootScope.crumbs.second = '处理开票申请';
                    $rootScope.crumbs.third = '开票详情';
                }else if($scope.pageType === 'salesOffline'){
                    $rootScope.crumbs.second = '审核支付汇款';
                }else if($scope.pageType === 'salesOffline_billDetail'){
                    $rootScope.crumbs.second = '审核支付汇款';
                    $rootScope.crumbs.third = '账单详情';
                }else if($scope.pageType === 'companyAccount'){
                    $rootScope.crumbs.second = '企业账户管理';
                }else if($scope.pageType === 'longRent'){
                    $rootScope.crumbs.second = '长租服务费账单';
                }else if($scope.pageType === 'longRentHistory'){
                    $rootScope.crumbs.second = '长租服务费历史账单';
                }else if($scope.pageType === 'serviceBillDetail'){
                    $rootScope.crumbs.second = '处理开票申请';
                    $rootScope.crumbs.third = '详情';
                }else if($scope.pageType === 'financeSummary'){
                    $rootScope.crumbs.second = '账务汇总';
                }else if($scope.pageType === 'withdrawalRecord'){
                    $rootScope.crumbs.second = '提现记录';
                }else if($scope.pageType === 'secondRent'){
                    $rootScope.crumbs.second = '秒租月结账单';
                }else if($scope.pageType === 'secondRentHistory'){
                    $rootScope.crumbs.second = '账单历史结算记录';
                }else if($scope.pageType === 'secondRentInvoice'){
                    $rootScope.crumbs.second = '秒租月结账单';
                    $rootScope.crumbs.third = '开票结算';
                }
            };

            var init = function(){
                initCrumbs();
                getCustomerService();
                if($scope.pageType === 'finance'){
                    getFinanceCounts();
                    checkProfileExist();
                    if($scope.currentAdmin.permissionMap[$scope.PERMISSION_WITHDRAWAL_KEY]){
                        getWalletCounts();
                    }
                    if($scope.currentAdmin.permissionMap[$scope.PERMISSION_FINANCE_KEY]){
                        getCurrentSummary();
                    }
                    if($scope.currentAdmin.permissionMap[$scope.PERMISSION_ACCOUNT_KEY]){
                        getAccountInfo();
                    }
                }else if($scope.pageType === 'invoice'){
                    // getCategory();
                    getInvoiceList();
                }else if($scope.pageType === 'invoiceDetail'){
                    getRoomType();
                    getInvoice();
                }else if($scope.pageType === 'salesOffline'){
                    getBillsList();
                }else if($scope.pageType === 'salesOffline_billDetail'){
                    getRemarkList();
                    getRoomType();
                    getLeasesBillDetail();
                }else if($scope.pageType === 'companyAccount'){
                    getAccountInfo();
                    getInvoiceInfo();
                    getExpressInfo();
                }else if($scope.pageType === 'longRent'){
                    checkProfileExist();
                    getLongRentBillList();
                    getTotalServiceFee();
                }else if($scope.pageType === 'longRentHistory'){
                    getLongRentHistoryBillList();
                }else if($scope.pageType === 'serviceBillDetail'){
                    getServiceBillDetail();
                }else if($scope.pageType === 'payLongRentBill'){
                    getTotalServiceFee();
                    getSandboxInfo();
                    getFileServer();
                    getInvoiceInfo();
                    getExpressInfo();
                }else if($scope.pageType === 'secondRent'){
                    getShortRentInvoices();
                }else if($scope.pageType === 'secondRentInvoice'){
                    if(FinanceService.getSearchParam('id')){
                        getShortRentInvoiceApplicationById()
                    }else{
                        getShortRentInvoicesByIds();
                    }
                    getSandboxInfo();
                }else if($scope.pageType === 'secondRentHistory'){
                    getShortRentInvoiceApplications();
                }else if($scope.pageType === 'withdrawalRecord'){
                    getFinanceWithDrawalsList();
                }else if($scope.pageType === 'secondRentInvoice'){
                    getSandboxInfo();
                }else if($scope.pageType === 'secondRentInvoiceDetail'){
                    getShortRentInvoiceApplicationById();
                }else if($scope.pageType === 'financeSummary'){
                    getYearList();
                    getSummaryList();
                }
            };

            $scope.createRemark = function() {
                var params = {};
                if($scope.pageType == 'salesOffline_billDetail') {
                    params = {'object': 'lease_bill', 'object_id': FinanceService.getSearchParam('billId')};
                }
                params.remarks = $scope.createOptions.remarkText;
                FinanceService.createRemark(params).success(function() {
                    getRemarkList();
                    $scope.createOptions.remarkText = '';
                });
            };

            $scope.seeRemarkDialog = function() {
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'remarkDialogTpl'
                });
            };

            $scope.setTipType = function(tag){
                $scope.tipType = tag;
            };

            $scope.generateChat = function(userId, buildingId){
                var params = {
                    creatorId: userId,
                    buildingId: buildingId,
                    tag: 'customerservice'
                };
                FinanceService.createGroupChat(params).success(function(data){
                    events.emit('refreshGroup');
                    events.emit('openChat', data.id);
                });
            };

            $scope.confirmFinanceWithDrawals = function($hide){
                if($scope.withDrawals.amount && $scope.withDrawals.amount > 0){
                    FinanceService.createFinanceWithDrawals({amount: $scope.withDrawals.amount}).success(function(){
                        noty('info', '已成功提交提现申请！');
                        $hide();
                        getWalletCounts(); 
                    }).error(function(data){
                        if(data.code === 400032){
                            noty('warning', '请选完善企业账户信息，再提现！');
                            $hide();
                        }else if(data.code === 400001){
                            noty('warning', '余额不足');
                        }
                    });
                }else{
                    noty('error' ,'请输入正确的提现金额！');
                }
            };

            /* second rent invoice*/
            $scope.toggleBox = function(){
                $scope.openBox = !$scope.openBox;
            };

            $scope.listChecked = function(){
                var hasBox = _.filter($scope.shortRentInvoices, function(invoice){
                    return invoice.status == 'incomplete';
                });
                var allChecked = _.every(hasBox, function(invoice){
                    return invoice.checked;
                });
                $scope.booleans.listAllChecked = allChecked ? true : false;
                $scope.selectedShortRentInvoicesAmount = _.sum(_.pluck(_.filter($scope.shortRentInvoices, function(inv){return inv.checked == true}), 'amount'));
            };

            $scope.checkAll = function(){
                _.each($scope.shortRentInvoices, function(invoice){
                    invoice.checked = $scope.booleans.listAllChecked && invoice.status == 'incomplete' ? true : false;
                });
                $scope.selectedShortRentInvoicesAmount = _.sum(_.pluck(_.filter($scope.shortRentInvoices, function(inv){return inv.checked == true}), 'amount'));
            };

            $scope.seeSecondRentInvoice = function(){
                var cache = [];
                _.each($scope.shortRentInvoices, function(invoice){
                    if(invoice.checked && invoice.status == 'incomplete'){
                        cache.push(invoice.id);
                    }
                });
                cache = cache.join(',');
                FinanceService.updateSearchParam('pageType', 'secondRentInvoice');
                FinanceService.updateSearchParam('invoiceIds', cache);
            };

            $scope.seeSecondRentInvoiceDetail = function(item){
                FinanceService.updateSearchParam('pageType', 'secondRentInvoice');
                FinanceService.updateSearchParam('id', item.id);
            };

            $scope.secondRentInvoiceDetail = function(item){
                FinanceService.updateSearchParam('pageType', 'secondRentInvoiceDetail');
                item ? FinanceService.updateSearchParam('id', item.id) : '';
            };

            $scope.createShortRentInvoiceApplicetion = function(){
                if(validRentParams()){
                    if(FinanceService.getSearchParam('invoiceIds')){
                        var params = {
                            invoiceNo: $scope.shortRentModels.invoiceNo,
                            invoiceIds: FinanceService.getSearchParam('invoiceIds'),
                            officialProfileId: $scope.sandboxInfo.id
                        };
                        FinanceService.createShortRentInvoiceApplicetion(params).success(function(data){
                            FinanceService.updateSearchParam('pageType', 'secondRentInvoiced');
                            FinanceService.updateSearchParam('id', data.id);
                        });
                    }else{
                        var newParams = [{
                            op: 'add',
                            path: '/invoiceNo',
                            value: _.pluck($scope.shortRentApplicationItem.invoices, 'id').join(',')
                        }];
                        FinanceService.resentShortRentInvoiceApplicetion(FinanceService.getSearchParam('id'), newParams).success(function(){
                            FinanceService.updateSearchParam('pageType', 'secondRentInvoiced');
                            FinanceService.updateSearchParam('id', FinanceService.getSearchParam('id'));
                        });
                    }
                }
            };
            /* second rent invoice*/

            $scope.cancelledServiceBill = function($hide){
                var params = [{
                    op: 'add',
                    path: '/status',
                    value: 'cancelled'
                }];
                FinanceService.cancelledServiceBill($scope.selectedServiceBill.id, params).success(function(){
                    noty('info', '服务费账单申请已撤销成功！');
                    if($scope.pageType === 'longRent'){
                        getLongRentBillList();
                        getTotalServiceFee();
                    }else{
                        getServiceBillDetail();
                    }
                    $hide();
                }).error(function(data){
                    if(data.code == '400001'){
                        noty('warning', '服务费账单申请已经被确认，不能撤销！');
                        $scope.pageType === 'longRent' ? getLongRentBillList() : getServiceBillDetail();
                        $hide();
                    }
                });
            };

            $scope.createServiceBill = function(){
                if(validServiceParams()){
                    var params = {
                        amount: $scope.serviceOption.amount,
                        attachments: [$scope.offlineImage]
                    };
                    FinanceService.generateServiceBill(params).success(function(data){
                        noty('info', '服务费账单申请已经提交，等待审核！');
                        FinanceService.updateSearchParam('pageType', 'payLongRentBillSucceed');
                        FinanceService.updateSearchParam('serviceBillId', data.id);
                        // window.history.back();
                    });
                }
            };

            $scope.seeServiceDetail = function(item){
                item ? FinanceService.updateSearchParam('serviceBillId', item.id) : '';
                FinanceService.updateSearchParam('pageType', 'serviceBillDetail');
            };

            $scope.switchTab = function(tag){
                FinanceService.updateSearchParam('tabType', tag);
                FinanceService.updateSearchParam('pageIndex', '');
            };

            $scope.back = function(){
                FinanceService.updateSearchParam('invoiceId', '');
                FinanceService.updateSearchParam('pageType', '');
                FinanceService.updateSearchParam('invTab', '');
            };

            $scope.seeDetail = function(item){
                FinanceService.updateSearchParam('invoiceId', item.id);
                FinanceService.updateSearchParam('pageType', 'detail');
                FinanceService.updateSearchParam('invTab', $scope.currentInvoice);
                FinanceService.updateSearchParam('invType', '');
                FinanceService.updateSearchParam('invCat', '');
                FinanceService.updateSearchParam('startDate', '');
                FinanceService.updateSearchParam('endDate', '');
            };

            $scope.search = function(){
                FinanceService.updateSearchParam('pageIndex', '');
                FinanceService.updateSearchParam('search', $scope.filterOption.searchKey);
            };

            $scope.seeList = function(ptype, tab){
                if(ptype == 'payLongRentBill'){
                    $scope.profileInfoFlag ? FinanceService.updateSearchParam('pageType', ptype) : noty('warning', '请先完善企业信息, 再去支付账单！');
                }else {
                    FinanceService.updateSearchParam('pageType', ptype);
                    tab ? FinanceService.updateSearchParam('tabType', tab) : '';
                    if(ptype == 'finance'){
                        _.each($location.search(), function(value, key){
                            FinanceService.updateSearchParam(key, '');
                        });
                    }
                }
            };

            $scope.seeInvoiceDetail = function(item){
                FinanceService.updateSearchParam('pageType', 'invoiceDetail');
                FinanceService.updateSearchParam('invoiceId', item.id);
            };

            $scope.switchTab = function(type){
                FinanceService.updateSearchParam('tabType', type);
            };

            $scope.seeOrderDetail = function(id){
                window.open(CONF.bizbase + 'trade?ptype=spaceDetail&orderId=' + id + '&tabtype=space');
            };

            $scope.setFocus = function(type){
                if(type === 'delivery_number'){
                    $scope.editValue = $scope.invoiceItem.express_delivery_number;
                    $scope.invoiceItem.delivery_focus = true;
                }else if(type === 'invoice_number'){
                    $scope.editValue = $scope.invoiceItem.invoice_number;
                    $scope.invoiceItem.invoice_focus = true;
                }
                focus(type);
            };

            $scope.editInvoice = function(type){
                var params = [];
                if(type === 'delivery_number'){
                    if($scope.invoiceItem.express_delivery_number === ''){
                        noty('error', '快递单号不能为空！');
                        return;
                    }
                    if($scope.invoiceItem.express_delivery_number === $scope.editValue){
                        $scope.invoiceItem.delivery_focus = false;
                        return;
                    }
                    params.push({'op': 'add', 'path': '/express_delivery_number', 'value': $scope.invoiceItem.express_delivery_number});
                }else if(type === 'invoice_number'){
                    if($scope.invoiceItem.invoice_number === ''){
                        noty('error', '发票编号不能为空！');
                        return;
                    }
                    if($scope.invoiceItem.invoice_number === $scope.editValue){
                        $scope.invoiceItem.invoice_focus = false;
                        return;
                    }
                    params.push({'op': 'add', 'path': '/invoice_number', 'value': $scope.invoiceItem.invoice_number});
                }
                FinanceService.editInvoice(params, $scope.invoiceItem.id).success(function(){
                    getInvoice();
                    noty('info', '修改成功！');
                }).error(function(){
                    noty('error', '修改失败！');
                    type === 'delivery_number' ? $scope.invoiceItem.express_delivery_number = $scope.editValue : $scope.invoiceItem.invoice_number = $scope.editValue;
                });
            };

            $scope.editCancel = function(item){
                var params = [];
                params.push({'op': 'add', 'path': '/status', 'value': 'cancelled'});
                FinanceService.editInvoice(params, item.id).success(function(){
                    getInvoiceList();
                    noty('info', '修改成功！');
                });
            };

            $scope.confClose = function($hide){
                $hide();
            };

            $scope.setDelivery = function($hide){
                if($scope.pendingDeliv === true){
                    return;
                }
                $scope.pendingDeliv = true;
                if(validateDelivery() === false){
                    $scope.pendingDeliv = false;
                    return;
                }
                var params = [];
                params.push({'op': 'add', 'path': '/invoice_number', 'value': $scope.deliveryOption.invoice_id});
                params.push({'op': 'add', 'path': '/express_delivery_company', 'value': $scope.deliveryOption.delivery_company});
                params.push({'op': 'add', 'path': '/express_delivery_number', 'value': $scope.deliveryOption.delivery_id});
                params.push({'op': 'add', 'path': '/consignee_address', 'value': $scope.deliveryOption.address});
                params.push({'op': 'add', 'path': '/consignee_phone', 'value': $scope.deliveryOption.phone});
                params.push({'op': 'add', 'path': '/consignee_name', 'value': $scope.deliveryOption.name});
                params.push({'op': 'add', 'path': '/consignee_zip_code', 'value': $scope.deliveryOption.zipCode});

                FinanceService.setDelivery($scope.invoiceItem.id, params).success(function(){
                    $scope.pendingDeliv = false;
                    setStatus($scope.invoiceItem);
                    noty('info', '开票成功！');
                    $hide();
                    getInvoiceList();
                }).error(function(){
                    $scope.pendingDeliv = false;
                    noty('error', '开票失败！');
                });
            }

            $scope.showCancelServiceBillConfirm = function(item, tag){
                item ? $scope.selectedServiceBill = item : '';
                $scope.financeTplTag = tag;
                events.emit('modal', {
                    scope: $scope,
                    backdrop: true,
                    animation: 'am-flip',
                    template: 'financeDialogTpl'
                });
            }

            $scope.showInvDialog = function(item){
                $scope.invoiceItem = item;
                $scope.deliveryOption.invoice_id = '';
                $scope.deliveryOption.delivery_company = '';
                $scope.deliveryOption.delivery_id = '';
                $scope.deliveryOption.address = item.region + item.address.detail_address;
                $scope.deliveryOption.phone = item.address.phone;
                $scope.deliveryOption.name = item.address.name;
                $scope.deliveryOption.zipCode = item.address.zip_code;
                events.emit('modal', {
                    scope: $scope,
                    title: '开票信息',
                    backdrop: true,
                    animation: 'am-fade-and-slide-top',
                    template: 'invoiceDialogTpl'
                });
            };

            $scope.showExpress = function(){
                events.emit('modal', {
                    scope: $scope,
                    title: '快递信息',
                    backdrop: true,
                    animation: 'am-fade-and-slide-top',
                    template: 'expressDialogTpl'
                });
            };

            $scope.showVerify = function(){
                events.emit('modal', {
                    scope: $scope,
                    title: '通过审核',
                    backdrop: true,
                    animation: 'am-fade-and-slide-top',
                    template: 'verifyDialogTpl'
                });
            };

            $scope.searchList = function(){
                var params = initFilterParams();
                for(var key in params){
                    params[key] === 0 ? params[key] = String(params[key]) : '';
                    FinanceService.updateSearchParam(key, params[key]);
                }
                $scope.billFilterOptions.status ? FinanceService.updateSearchParam('status', $scope.billFilterOptions.status) : FinanceService.updateSearchParam('status', '');
                !$scope.filterOption.keyword && $scope.pageType == 'invoice' ? FinanceService.updateSearchParam('keyword', '') : '';
                FinanceService.updateSearchParam('pageIndex', '');
            };

            $scope.clearSearchFilters = function(){
                $scope.billFilterOptions = {};
                $scope.billFilterOptions.keyword = $scope.keywordList[0];
                $scope.filterOption = {};
                $scope.filterOption.keyword = $scope.keywordList[0];
                $scope.longRentFilterOptions = {};
                $scope.shortRentOptions = {};
                _.each($location.search(), function(value, key){
                    key != 'tabType' && key != 'pageType' ? FinanceService.updateSearchParam(key, '') : '';
                });
            };

            $scope.finishAccount = function(){
                window.open(CONF.bizbase + 'finance?pageType=companyAccount');
            };

            $scope.seePopup = function(tag, item){
                if(tag === 'remark'){
                    $scope.selectedBill = item;
                }
                tag == 'enchashment' ? $scope.withDrawals.amount = '': '';
                $scope.popupType = tag;
                
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'financePopupTpl'
                });
            };

            $scope.collectionSalesOffline = function(hide){
                if($scope.salesOffline.note == ''){
                    noty('error','请填写收款备注！');
                    return false;
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
                FinanceService.collectionSalesOffline($scope.selectedBill.id, params).success(function(){
                    noty('info','已确认收款该账单！');
                    getBillsList();
                    if($scope.pageType == 'salesOffline'){
                        getBillsList();
                    }else if($scope.pageType == 'salesOffline_billDetail'){
                        getLeasesBillDetail();
                    }
                }).error(function(){
                    noty('error','未能确认收款！');
                });
                hide();
                $scope.salesOffline.note = '';
            };

            $scope.seeBillDetail = function(item){
                _.each($location.search(), function(value, key){
                    key != 'tabtype' ? FinanceService.updateSearchParam(key, '') : '';
                });
                FinanceService.updateSearchParam('pageType', 'salesOffline_billDetail');
                FinanceService.updateSearchParam('billId', item.id);
            };

            $scope.goPage = function(index){
                FinanceService.updateSearchParam('pageIndex', index);
            };

            $scope.editProfile = function(type, flag){
                flag ? $scope.editFlag[type] = flag : '';

                if(flag && type == 'invoice'){
                    $scope.invoiceInfo.category = _.find($scope.invTypeList, function(item){return item.value == $scope.invoiceInfo.category});
                }
                if(!flag && !$scope.createFlag[type]){
                    if(type == 'account'){
                        editAccountInfo(type);
                    }else if(type == 'invoice'){
                        editInvoiceInfo(type);
                    }else{
                        editExpressInfo(type);
                    }
                }else if(!flag && $scope.createFlag[type]){
                    if(type == 'account'){
                        createAccountInfo(type);
                    }else if(type == 'invoice'){
                        createInvoiceInfo(type);
                    }else{
                        createExpressInfo(type);
                    }
                }
            };

            $scope.showOriginImage = function(url){
                $scope.originImageUrl = url;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'financePreviewTpl'
                });
            };

            $scope.uploaderOfflineImage = function(){
                $('#tinymceImageUpload').click();
            };

            $scope.downloadMonthBills = function(item){
                $scope.download = CONF.api + 'sales/admin/finance/summary/export?summary_id=' + item.id;
                window.location.href = $scope.download;
            };

            $scope.$watch('filterOption.keyword', function(newValue, oldValue) {
                if(newValue !== oldValue){
                    if($rootScope.selectDropdown){
                        $scope.filterOption.keyword_search = '';
                        $scope.filterOption.order_number = '';
                        $scope.filterOption.invoice_number = '';
                        $scope.filterOption.user_name = '';
                    }
                }
            }, true);

            $scope.$watch('billFilterOptions.billStatusObj', function(newValue, oldValue) {
                if(!newValue){
                    $scope.billFilterOptions.billStatusObj = {};
                }
            }, true);

            $scope.$watch('filterOption.type', function(newValue, oldValue) {
                if(!newValue){
                    $scope.filterOption.type = {};
                }
            }, true);

            // $scope.$watch('filterOption.categoryObj', function(newValue, oldValue) {
            //     if(!newValue){
            //         $scope.filterOption.categoryObj = {};
            //     }
            // }, true);

            $scope.$watch('longRentFilterOptions.statusObj', function(newValue, oldValue) {
                if(!newValue){
                    $scope.longRentFilterOptions.statusObj = {};
                }
            }, true);

            $scope.$watch('shortRentOptions.statusObj', function(newValue, oldValue) {
                if(!newValue){
                    $scope.shortRentOptions.statusObj = {};
                }
            }, true);

            $scope.$watch('longRentFilterOptions.keywordObj', function(newValue, oldValue) {
                if(!newValue && $rootScope.selectDropdown){
                    $scope.longRentFilterOptions.keywordObj = {};
                    $scope.longRentFilterOptions.keyword_search = '';
                }
                if(newValue !== oldValue && $rootScope.selectDropdown){
                    $scope.longRentFilterOptions.keyword_search = '';
                }
            }, true);

            $scope.$watch('billFilterOptions.keyword', function(newValue, oldValue) {
                if(newValue !== oldValue){
                    if($rootScope.selectDropdown){
                        $scope.billFilterOptions.keyword_search = '';
                    }
                }
            }, true);

            $scope.$watch('currentAdmin', function(newValue) {
                if(newValue && newValue.user){
                    init();
                }
            }, true);
        };

        return ['$rootScope', '$sce', '$scope', 'events', 'utils', 'FinanceService', 'CurrentAdminService', '$popover', '$filter', '$translate', 'ImageUploaderService', 'CONF', 'focus', '$location', FinanceController];

    });

})(define);
