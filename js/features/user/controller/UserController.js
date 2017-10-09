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
            
            
            $scope.editOption = {};
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.PERMISSION_KEY = 'sales.platform.user_group';
            $scope.gropuId = '';
            $scope.groupType = '';
            $scope.loaded = false;
            $scope.groups = [];

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
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

            var getCustomerLists = function(id){
                var params = {
                    'group_id': id
                }
                UserService.getCustomerLists(params).success(function(data) {
                    $scope.customerLists = data;
                    // _.each($scope.customerLists, function(item){
                    //     var temp = _.groupBy(item.groups, 'type');
                    // });
                });
            };

            var init = function() {
                $rootScope.crumbs = {first: '客户组'};
                getGroups();
            };

            init();




            $scope.seeOptions = function(type, item) {
                $scope.optionType = type;
            };

            $scope.addCreateGroup = function($hide){
                if($scope.editOption.g_name){
                    UserService.createGroup({name: $scope.editOption.g_name}).success(function(item) {
                        $hide();
                        noty('info', '创建客户组成功！');
                        getGroups();
                    });
                }
            }

            $scope.updateGroup = function($hide) {
                if($scope.editOption.g_name){
                    UserService.updateGroup({name: $scope.editOption.g_name}, $scope.gropuId).success(function() {
                        $hide();
                        noty('info', '编辑客户组成功！');
                        getGroups();
                    });
                }
            };


            $scope.confirmDelete = function($hide) {
                if($scope.editOption.confirmKey == 'delete') {
                    UserService.deleteGroup($scope.gropuId).success(function() {
                        $hide();
                        noty('info', '删除客户组成功！');
                        getGroups();
                    });
                }else{
                    noty('error', '请输入框中提示字样！');
                }
            };

            $scope.addUserToGroup = function($hide, id) {
                var filter = [];
                filter.push(id);
                var params = {};
                params.customer_ids = filter;
                params.add = []
                params.remove = [$scope.gropuId];
                UserService.addUserToGroup(params).success(function() {
                    $hide();
                    noty('info', '移除客户成功！');
                    getGroups();
                });
            };

            $scope.customers = _.debounce(function(id, groupType){
                $scope.customerLists = {}
                getCustomerLists(id);
                $scope.gropuId = id;
                $scope.groupType = groupType;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'customersTpl'
                });
            },300);

            $scope.creatGroup = _.debounce(function(id){
                id ? $scope.gropuId = id : $scope.gropuId = '';
                $scope.editOption = {};
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'creatGroupTpl'
                });
            },300);

            $scope.delConfirm = _.debounce(function($hide, id){
                $scope.editOption.confirmKey = '';
                $scope.gropuId = id;
                $hide ? $hide() : '';
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade-and-slide-top',
                    template: 'delConfirmTpl'
                });
            },300);
            
            
        };

        return ['$rootScope', '$scope', '$cookieStore', 'events', 'utils', 'UserService', 'CurrentAdminService', '$alert', 'FileUploader', 'CONF', '$filter', '$location', UserController];
    });
})(define);