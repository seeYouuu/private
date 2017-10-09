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
        var ContractController = function($rootScope, $scope, ContractService, events, $filter, CONF, $location, $cookies, $translate, CurrentAdminService, utils, $timeout) {

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
                commense: '起租日'
            };
            $scope.cusDrop = false;
            
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };
            $scope.filterStatus = ContractService.getStatus();
            $scope.statusDesc = ContractService.getStatusDesc();
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
            $scope.contractOption ={
                lessee_type: 'personal'
            };
            $scope.dragModels = {
                selected: null,
                tableItems: []
            };

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
                params['permission[]'] = $scope.PERMISSION_SPACE_KEY;
                ContractService.getBuildingList(params).success(function(data) {
                    $scope.buildings = _.filter(data, function(item) {return item.visible});
                    ContractService.getSearchParam('building') ? $scope.filterOption.buildingObj = _.find($scope.buildings, function(item){return item.id == ContractService.getSearchParam('building')}): '';
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
                    $timeout(function() {
                        cusBConWidth();
                    }, 200);
                });
            };

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var formatNumber = function(params){
                return $filter('number')(params, '2');
            };

            var formatData = function(item){
                item.customization = _.pick(item, 'deposit', 'lessee_enterprise', 'serial_number');
                item.customization.room_name = item.product.room.name;
                item.customization.lessee_type = item.lessee_type === 'personal' ? '个人承租' : '企业承租';
                item.customization.room_type_tag = $scope.typeDesc[item.product.room.type_tag];
                item.customization.start_date = formatDate(item.start_date, 'yyyy-MM-dd') + '至' + formatDate(item.end_date, 'yyyy-MM-dd');
                item.customization.total_rent = formatNumber(item.total_rent) + ' 元';
                item.customization.lease_bill = item.total_lease_bills_amount;
                item.customization.other_bill = item.other_bills_amount;
                item.customization.creation_date = formatDate(item.creation_date, 'yyyy-MM-dd HH:mm:ss');
                item.customization.status = $scope.statusDesc[item.status];
                item.customization.monthly_rent = formatNumber(item.monthly_rent) + ' 元/月起';
                item.customization.deposit = formatNumber(item.deposit) + ' 元';
                return item;
            };

            var getContractList = function(){
                var params = {pageLimit: $scope.pageOptions.pageSize, pageIndex: $scope.pageOptions.pageIndex};
                ContractService.getContractList(params).success(function(data){
                    $scope.leaseList = data.items;
                    _.each($scope.leaseList, function(item){
                        item = formatData(item);
                    });
                    $scope.pageOptions.totalNum = data.total_count;
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

            var getContractDetail = function(id){
                ContractService.getLeasesDetail(id).success(function(data){
                    $scope.contractItem = data;
                    $scope.contractItem.leaseRentType = _.pluck(data.lease_rent_types, 'name').join('; ')
                });
            };

            var init = function(){
                $rootScope.crumbs = {first: '租赁合同'};
                getTypeDescription();
                getTableHeaders();
                getTableItems();
                getBuildingList();
                getContractList();
            };

            init();

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
                }

                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'contractItemTpl'
                });
            };

            $scope.switchLeaseeType = function(type){
                $scope.contractOption.lessee_type = type;
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
            
        }
        return ['$rootScope', '$scope', 'ContractService', 'events', '$filter', 'CONF', '$location', '$cookies', '$translate', 'CurrentAdminService', 'utils', '$timeout', ContractController];

    });

})(define);
