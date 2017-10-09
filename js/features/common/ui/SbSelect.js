/**
 *
 *  The SbDropdown.
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 **/
(function(define) {
    'use strict';

    define(['FeatureBase', 'lodash'], function(Base, _) {
        
        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('SbSelectModule');
            };

            this.run = function() {
                var features = require.toUrl('features');
                var dir = function($compile) {
                    return {
	                    restrict: 'E',
                        templateUrl: features + '/common/ui/SbSelect.html',
	                    scope: {
	                        'select': '=',
	                        'options': '=',
	                        'short': '=',
	                        'normal': '=',
	                    },
	                    link: function($scope, element, attrs) {
                            var reset = function() {
                                $scope.placeholder = element.attr('placeholder');
	                            $scope.showDrop = false;
                                if (_.isArray($scope.options)) {
                                    $scope.normalizedOptions = _.reduce($scope.options, function(result, o) {
                                        result[o] = o;
                                        return result;
                                    }, {});
                                } else {
                                    $scope.normalizedOptions = _.clone($scope.options);   
                                }
                                $scope.hasOptions = !_.isEmpty($scope.normalizedOptions);
                                $scope.selection = _.findKey($scope.normalizedOptions, function(v) {return v === $scope.select;});
                            };
                            reset();
	                    	
                            $scope.$watch('options', reset, true);
                          
                            element.on('load', reset);
                            
	                        $scope.toggleDropdown = function(value, undefined) {
                                if (value !== null && value !== undefined) {
                                    $scope.showDrop = value;
                                } else {
	                                $scope.showDrop = !$scope.showDrop;
                                }
	                        };

	                        $scope.setSelectItem = function(text, value) {
                                $scope.selection = text;
	                            $scope.select = value;
	                            $scope.toggleDropdown();
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
	                    }
	                };
                };

                this.mod.directive('sbSelect',  ['$compile', dir]);
            };

        });

        return Feature;

    });


})(define);
