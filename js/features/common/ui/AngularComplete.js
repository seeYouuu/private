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
                this.super.initializer('AngularCompleteModule');
            };

            this.run = function() {
                var features = require.toUrl('features');

                var dir = function() {
                    return {
                        restrict: 'EA',
                        replace: true,
                        scope: {
                            'responseData': '=responsedata',
                            'selectData': '=selectdata',
                            'searchParams': '=searchparams',
                            'inputChange': '&change',
                            'submitSearch': '&search',
                            'name': '@name',
                            'placeholder': '=placeholder'
                        },
                        link: function($scope, element) {
                            $scope.currentIndex = 0;
                            $scope.changeFlag = true;
                            $scope.name = $scope.name ? $scope.name : 'name';
                            $scope.placeholder = $scope.placeholder ? $scope.placeholder : '可以根据用户名邮箱电话搜索'; 
                            $scope.iptChange = function() {
                                $scope.changeFlag ? $scope.inputChange() : '';
                            };

                            $scope.keyPressed = function(event) {
                                $scope.changeFlag = true;
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
                                if (e.target !== element[0] && !isDescendant(element[0], e.target)) {
                                    $scope.currentIndex = 0;
                                    $scope.responseData = [];
                                    $scope.$apply();
                                }
                                e.stopPropagation();
                            };

                            $(document).on('click', handler);
                        },
                        templateUrl: features + '/common/ui/AngularComplete.html'
                    };
                };

                this.mod.directive('angularComplete', [dir]);
            };

        });

        return Feature;

    });


})(define);
