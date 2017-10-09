/**
 *
 *  Defines the autocomplete
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 **/
(function(define) {
    'use strict';

    define(['FeatureBase'], function(Base) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('AutoCompleteModule');
            };

            this.run = function() {
                var features = require.toUrl('features');

                var dir = function(CompleteService, CurrentAdminService, events) {
                    return {
                        restrict: 'EA',
                        replace: true,
                        scope: {
                            'responseData': '=responsedata',
                            'selectData': '=selectdata',
                            'searchParams': '=searchparams',
                            'inputChange': '&change',
                            'submitSearch': '&search',
                            'name': '@name'
                        },
                        link: function($scope, element) {
                            $scope.currentIndex = 0;
                            $scope.changeFlag = true;
                            $scope.listFlag = false;
                            $scope.boxFlag = false;
                            $scope.name = $scope.name ? $scope.name : 'name';
                            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
                            $scope.userInfo = {
                                phone_code: '+86',
                                phone: '',
                                name: ''
                            };

                            var noty = function(type, msg) {
                                events.emit('alert', {
                                    type: type,
                                    message: msg,
                                    onShow: function() {},
                                    onClose: function() {}
                                });
                            };

                            $scope.iptChange = function() {
                                $scope.changeFlag ? $scope.inputChange() : '';
                            };

                            $scope.keyPressed = function(event) {
                                $scope.changeFlag = true;
                                $scope.searchParams.key !== '' ? $scope.listFlag = true: $scope.listFlag = false;
                                if (!(event.which == 38 || event.which == 40 || event.which == 13)) {
                                    event.preventDefault();
                                }
                            };

                            $scope.sbtSearch = function() {
                                $scope.currentIndex = 0;
                                $scope.responseData = [];
                            };

                            $scope.selectItem = function(item) {
                                $scope.changeFlag = false;
                                $scope.currentIndex = 0;
                                $scope.responseData = [];
                                $scope.selectData = item;
                                $scope.searchParams.key = item[$scope.name];
                            };

                            $scope.showUserBox = function(){
                                if($scope.boxFlag){
                                    if($scope.responseData != []){
                                        $scope.listFlag = true;
                                    }
                                    $scope.boxFlag = false;
                                }else{
                                    $scope.boxFlag = true;
                                }
                            };

                            var testPhone = function(str){
                                var pattern = /(13\d|14[57]|15[^4,\D]|17[13678]|18\d)\d{8}|170[0589]\d{7}/;
                                return pattern.test(str);
                            };

                            var verifyUserInfo = function(){
                                var flag = true;
                                if($scope.currentAdmin.permissionMap['sales.platform.customer'] && $scope.currentAdmin.permissionMap['sales.platform.customer'] !== 2){
                                    noty('error', '您没有创建联系人的权限!');
                                    flag = false;
                                    return flag;
                                }
                                if($scope.userInfo.name === ''){
                                    noty('error', '未填写客户名字!');
                                    flag = false;
                                    return flag;
                                }
                                if($scope.userInfo.phone_code === ''){
                                    noty('error', '未填写手机区号!');
                                    flag = false;
                                    return flag;
                                }
                                if($scope.userInfo.phone === ''){
                                    noty('error', '未填写手机号!');
                                    flag = false;
                                    return flag;
                                }
                                if(!testPhone($scope.userInfo.phone)){
                                    noty('error', '手机号不正确!');
                                    flag = false;
                                    return flag;
                                }
                                return flag;
                            };

                            $scope.createCustomer = function(){
                                if(!verifyUserInfo()){
                                    return
                                }
                                CompleteService.cusMessage($scope.userInfo).success(function(data){
                                    noty('info', '客户创建成功！');
                                    $scope.boxFlag = false;
                                    $scope.userInfo.id = data.id;
                                    $scope.selectData = angular.copy($scope.userInfo);
                                    $scope.searchParams.key = $scope.selectData.name;
                                    console.log($scope.selectData)
                                }).error(function(data){
                                    if(data.code === 400001){
                                        noty('info', '客户已存在！');
                                    }
                                });
                            };

                            $scope.itemOver = function(item) {
                                _.each($scope.responseData, function(row, index) {
                                    if (row.result === item.result) {
                                        $scope.currentIndex = index;
                                    }
                                });
                            };

                            $scope.iptBlur = function() {
                                $scope.currentIndex = 0;
                                $scope.responseData = [];
                            };

                            var inputField = element.find('input');

                            inputField.on('keyup', $scope.keyPressed);

                            element.on('keyup', function(event) {

                                if (event.which === 40) {
                                    if ($scope.responseData && ($scope.currentIndex + 1) < $scope.responseData.length) {
                                        $scope.currentIndex++;
                                        $scope.searchParams.key = $scope.responseData[$scope.currentIndex].name;
                                        $scope.$apply();
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                    $scope.$apply();
                                } else if (event.which == 38) {
                                    if ($scope.currentIndex >= 1) {
                                        $scope.currentIndex--;
                                        $scope.searchParams.key = $scope.responseData[$scope.currentIndex].name;
                                        $scope.$apply();
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                } else if (event.which == 13) {
                                    $scope.currentIndex = 0;
                                    $scope.responseData = [];
                                    $scope.$apply();
                                    event.preventDefault();
                                    event.stopPropagation();
                                } else if (event.which == 27) {
                                    $scope.currentIndex = 0;
                                    $scope.responseData = [];
                                    $scope.$apply();
                                } else if (event.which == 8) {
                                    if ($scope.searchParams && !$scope.searchParams.key) {
                                        $scope.selectData = {};
                                    }
                                }
                                $scope.changeFlag = true;
                            });

                            var isDescendant = function(parent, child) {
                                var node = child.parentNode;
                                while (node) {
                                    if (node == parent) {
                                        return true;
                                    }
                                    node = node.parentNode;
                                }
                                return false;
                            };

                            var handler = function(e) {
                                if (e.target !== element[0] && !isDescendant(element[0], e.target) && e.target.className !== 'u-btn') {
                                    $scope.currentIndex = 0;
                                    $scope.responseData = [];
                                    $scope.listFlag = false;
                                    $scope.$apply();
                                }
                                e.stopPropagation();
                            };

                            $(document).on('click', handler);
                        },
                        templateUrl: features + '/common/ui/AutoComplete.html'
                    };
                };

                this.mod.factory('CompleteService', ['http', 'utils', '$cookies', function (http, utils, $cookies) {
                    
                    this.cusMessage = function(params){
                        return http.post(utils.getapi('/sales/admin/customers'), params);
                    };

                    return this;
                }]);

                this.mod.directive('autoComplete', ['CompleteService', 'CurrentAdminService', 'events', dir]);
            };

        });

        return Feature;

    });


})(define);
