/**
 *
 *  The SbNewDropdown.
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
                this.super.initializer('SbNewDropdownModule');
            };

            this.run = function() {
            	
            	var features = require.toUrl('features');

                var dir = function($compile, $rootScope) {
                    return {
	                    restrict: 'E',
	                    transclude: true,
	                    scope: {
	                        'select': '=',
	                        'options': '=',
	                        'name': '@',
	                        'short': '=',
	                        'normal': '=',
	                        'flexible': '=',
	                        'children': '=',
	                        'placeholder': '=',
	                        'onChange': '&onChange',
	                        'item': '=',
	                        'allName': '@'
	                    },
	                    link: function($scope, element, attrs) {
	                    	$scope.all = $scope.allName? $scope.allName: '全部';
                            $scope.noEmpty = false;
                            if (attrs.noEmpty !== undefined) {
                                $scope.noEmpty = true;
                            }
	                    	$scope.name = $scope.name? $scope.name: 'name';
	                        $scope.showDrop = false;
	                        
	                        $scope.showDropdown = function() {
	                            $scope.showDrop = !$scope.showDrop;
	                        };

	                        $scope.setSelectItem = function(item) {
	                            $scope.select = item;
	                            if ($scope.children) {
	                                var temp = _.find(item.sub, function(p) {
	                                    return p.name === $scope.children.name;
	                                });
	                                if (!temp) {
	                                    $scope.children.name = '';
	                                }
	                            }
	                            $rootScope.selectDropdown = true;
	                            $scope.showDrop = !$scope.showDrop;
	                        };

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
	                                $scope.showDrop = false;
	                                $scope.$apply();
	                            }
	                            e.stopPropagation();
	                        };

	                        $scope.$watch('select', function(newValue, oldValue) {
				                if(newValue === oldValue){
				                    return;
				                }
				                $scope.onChange({
				                	id: newValue ? newValue.id : "",
				                	item: $scope.item
				                });
				                
				            }, true);

	                        $(document).on('click', handler);
	                    },
	                    templateUrl: features + '/common/ui/SbNewDropdown.html'
	                };
                };

                this.mod.directive('sbNewDropdown',  ['$compile', '$rootScope', dir]);
            };

        });

        return Feature;

    });


})(define);
