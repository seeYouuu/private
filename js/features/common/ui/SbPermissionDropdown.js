/**
 *
 *  The SbPermissionDropdown.
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
                this.super.initializer('SbPermissionDropdownModule');
            };

            this.run = function() {

            	var features = require.toUrl('features');

                var dir = function($compile) {
                    return {
	                    restrict: 'E',
	                    scope: {
	                        select: '=',
	                        options: '=',
                            normal: '=?',
                            name: '@?', // name of property to get from items
                            radioArray: '=?', // eg [{label: 'view', value: 1}]
                            radioModel: '@?', // model for radio result in items
                            onCheck: '&?' // bind on check callback
	                    },
	                    link: function($scope, element, attrs) {
	                    	$scope.name = $scope.name? $scope.name: 'name';
	                        $scope.showDrop = false;
	                        
	                        $scope.showDropdown = function() {
	                            $scope.showDrop = !$scope.showDrop;
	                        };

	                        $scope.setSelectItem = function(item) {
	                            $scope.select = item;
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
	                        $(document).on('click', handler);
	                    },
	                    templateUrl: features + '/common/ui/SbPermissionDropdown.html'
	                };
                };

                this.mod.directive('sbPermissionDropdown',  ['$compile',dir]);
            };

        });

        return Feature;

    });


})(define);
