/**
 *
 *  The SbMutiDropdown.
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
                this.super.initializer('SbMutiDropdownModule');
            };

            this.run = function() {

            	var features = require.toUrl('features');

                var dir = function() {
                    return {
	                    restrict: 'E',
	                    transclude: true,
	                    scope: {
	                        select: '=',
	                        options: '=',
	                        name: '@',
	                        number: '@?',
	                        children: '=',
	                        onChange: '&onChange',
	                    },
	                    link: function($scope, element, attrs) {
	                    	$scope.placeholder = element.attr('placeholder');
	                    	$scope.name = $scope.name? $scope.name: 'name';
	                        $scope.showDrop = false;

	                        $scope.showDropdown = function() {
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

	                        $scope.$watch('options', function(newValue, oldValue) {
				                if(newValue === oldValue){
				                    return;
				                }
				                $scope.onChange();
				            }, true);

	                        $(document).on('click', handler);
	                    },
	                    templateUrl: features + '/common/ui/SbMutiDropdown.html'
	                };
                };

                this.mod.directive('sbMutiDropdown',  [dir]);
            };

        });

        return Feature;

    });


})(define);
