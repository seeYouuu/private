/**
 *
 *  The SbNewMutiDropdown.
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
                this.super.initializer('SbNewMutiDropdownModule');
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
	                        'onOptions': '=',
	                        'name': '@',
	                        'short': '=',
	                        'normal': '=',
	                        'children': '=',
	                        'placeholder': '=',
	                        'onChange': '&onChange',
	                        'item': '=',
	                        'allName': '@'
	                    },
	                    link: function($scope, element, attrs) {
	                    	$scope.all = $scope.allName? $scope.allName: '请选择';
	                    	$scope.placeholder = $scope.options && $scope.options.length > 0 ? '选择职位' : '暂无职位';
	                    	$scope.select = $scope.select? $scope.select : [];
                            $scope.noEmpty = false;
                            if (attrs.noEmpty !== undefined) {
                                $scope.noEmpty = true;
                            }
	                    	$scope.name = $scope.name? $scope.name: 'name';
	                        $scope.showDrop = false;
	                        $scope.selectedOptions = {};
	                        
	                        $scope.showDropdown = function() {
	                            $scope.showDrop = !$scope.showDrop;
	                        };

	                        $scope.setSelectItem = function(item) {
	                        	if(item && !$scope.selectedOptions[item.id]){
	                        		item.selected = !item.selected;
	                        		$scope.select = _.filter($scope.options, function(temp){
	                        			return temp.selected;
	                        		});
	                        		console.log($scope.select);
	                        	}
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

				            $scope.$watch('onOptions', function(newValue, oldValue) {
				                if(!newValue && newValue === oldValue){
				                    return;
				                }
				                _.each(newValue, function(item){
				                	$scope.selectedOptions[item.position_id] = true;
	                        	});
				            }, true);

	                        $(document).on('click', handler);
	                    },
	                    templateUrl: features + '/common/ui/SbNewMutiDropdown.html'
	                };
                };

                this.mod.directive('sbNewMutiDropdown',  ['$compile', '$rootScope', dir]);
            };

        });

        return Feature;

    });


})(define);
