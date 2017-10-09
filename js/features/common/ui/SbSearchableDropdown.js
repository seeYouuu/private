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
                this.super.initializer('SbSearchableDropdownModule');
            };

            this.run = function() {

            	var features = require.toUrl('features');

                var dir = function($compile) {
                    return {
	                    restrict: 'E',
	                    scope: {
	                        select: '=',
	                        options: '=',
                            placeholder: '@',
                            resetOnOptionsChange: '='
	                    },
	                    templateUrl: features + '/common/ui/SbSearchableDropdown.html',
	                    link: function($scope, element, attrs) {
                            if (!$scope.resetOnOptionsChange) {
                                $scope.resetOnOptionsChange = function() {return true;}; 
                            }
                          
                            var reset = function(newOptions, oldOptions) {
                                $scope.showDrop = false;
                                $scope.search = {keyword: ''};
                                if (_.isArray($scope.options)) {
                                    $scope.normalizedOptions = _.reduce($scope.options, function(result, o) {
                                        result[o] = o;
                                        return result;
                                    }, {});   
                                } else {
                                    $scope.normalizedOptions = _.clone($scope.options);   
                                }
                                
                                $scope.filtered = $scope.normalizedOptions;
                                $scope.hasOptions = !_.isEmpty($scope.normalizedOptions);
                                if ($scope.hasOptions) {
                                    $scope.selection = {};
                                    _.each($scope.select, function(item){
                                        $scope.selection[item] = item;
                                    });
                                } else {
                                    if ($scope.resetOnOptionsChange(newOptions, oldOptions)) {
                                        $scope.selection = {};
                                    } 
                                }
                            };
	                        
	                        $scope.toggleDropdown = function(value, undefined) {
                                if (value !== undefined && value !== null) {
                                    $scope.showDrop = value;
                                } else {
	                                $scope.showDrop = !$scope.showDrop;
                                }
	                        };

	                        $scope.toggleSelection = function(text, value, $event) {
                                if ($event.currentTarget.checked) {
                                    $scope.selection[text] = value;
                                } else {
                                    $scope.removeSelection(text);   
                                }
	                        };
                            
                            $scope.removeSelection = function(text) {
                                delete $scope.selection[text];
                            };
                            
                            $scope.selectAll = function() {
                                $scope.selection = _.clone($scope.filtered);
                            };
                            
                            $scope.selectNone = function() {
                                $scope.selection = {};
                            };
                            
                            $scope.$watch('options', reset);
                            
                            $scope.$watch('selection', function(newValue) {
                                if (newValue === undefined) return;
                                $scope.select = _.map(newValue, function(v, k) {
                                    return v;
                                });
                            }, true);
                            
                            $scope.$watch('search.keyword', function(newValue) {
                                if (!newValue || newValue === '') {
                                    $scope.filtered = $scope.normalizedOptions;
                                } else {
                                    $scope.filtered = _.zipObject(_.filter(_.pairs($scope.normalizedOptions), function(pair) {
                                        return pair[0].startsWith(newValue);
                                    }));
                                }
                            }, true);
                            
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
	                    }
	                };
                };

                this.mod.directive('sbSearchableDropdown',  ['$compile', dir]);
            };

        });

        return Feature;

    });


})(define);
