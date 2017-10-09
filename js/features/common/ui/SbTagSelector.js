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
                this.super.initializer('SbTagSelectorModule');
            };

            this.run = function() {

            	var features = require.toUrl('features');

                var normalizeOptions = function(options) {
                    if (_.isPlainObject(options)) return _.clone(options);
                    if (_.isArray(options)) return _.reduce(options, function(result, o) {
                      result[o] = o; 
                      return result;
                    }, {});
                    return {};
                };
              
                var dir = function() {
                    return {
	                    restrict: 'E',
	                    transclude: true,
	                    scope: {
	                        'select': '=',
	                        'options': '=',
                            'placeholder': '@' 
	                    },
	                    link: function($scope, element, attrs) {
                            $scope.showDrop = false;
                            if (!$scope.select) $scope.select = [];
                            $scope.normalizedOptions = normalizeOptions($scope.options);
                            $scope.removeSelection = function(value) {
                                _.remove($scope.select, function(v) {return value === v;});
                            };
                            $scope.toggleDropdown = function() {
                                $scope.showDrop = !$scope.showDrop;
                            };
                            $scope.isSelected = function(value) {
                                return _.contains($scope.select, value);
                            };
                            $scope.toggleSelection = function(value, $event) {
                                var checked = $event.target.checked;
                                if (checked) {
                                    $scope.select.push(value);
                                } else {
                                    $scope.removeSelection(value);
                                }
                            };
                            $scope.hasOptions = function() {
                                return !_.isEmpty($scope.options);
                            };
                            $scope.textFor = function(value) {
                                return _.findKey($scope.normalizedOptions, function(v) {return v === value;});
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

                            $scope.$watch('options', function(newValue, oldValue) {
                                if (newValue === oldValue) return;
                                $scope.normalizedOptions = normalizeOptions($scope.options);
                            });
	                    },
	                    templateUrl: features + '/common/ui/SbTagSelector.html'
	                };
                };

                this.mod.directive('sbTagSelector',  [dir]);
            };

        });

        return Feature;

    });


})(define);
