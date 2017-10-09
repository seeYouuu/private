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

    define(['FeatureBase', 'bowser', 'lodash'], function(Base, bowser, _) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('SbHourSelectorModule');
            };

            this.run = function() {

                var features = require.toUrl('features');

                var dir = function(Api) {
                    return {
	                    restrict: 'E',
	                    scope: {
                            onSelected: '=',
                            data: '=',
                            popupTextFormatter: '='
	                    },
	                    templateUrl: features + '/common/ui/SbHourSelector.html',
	                    link: function($scope, element, attrs) {
                            $scope.hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
                            $scope.weeks = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日', ];
                            $scope.$watch(function() {
                                return Api.data();
                            }, function(newValue, oldValue) {
                                if (newValue === undefined) return;
                                if (newValue === oldValue) return;
                                $scope.data = Api.data();
                            });
                            
                            if ($scope.data) Api.data($scope.data);
                            $scope.data = Api.data();
                            
                            $scope.onMouseDown = function($event) {
                                var td = $($event.currentTarget);
                                setCoord(td, 0);
                                setCoord(td, 1);
                                updateSelection();
                                $event.preventDefault();
                            };
                            
                            $scope.onMouseOver = function($event) {
                                var td = $($event.currentTarget);
                                var prop = bowser.firefox ? 'buttons' : 'which';
                              
                                if ($event[prop] !== 1) {
                                    toggleBubble(td, true);
                                } else {
                                    setCoord(td, 1);
                                    updateSelection();
                                }
                                $event.preventDefault();
                            };
                            
                            $scope.onMouseOut = function($event) {
                                var td = $($event.currentTarget);
                                toggleBubble(td, false);
                            };
                            
                            $scope.selectDone = function() {
                                if (!$scope.onSelected) return;
                                if (!Api.isCoordsSet()) return;
                                $scope.onSelected(Api.data());
                            };
                            
                            var toggleBubble = function(td, show) {
                                td.find('.bubble').toggle(show);
                            };
                            
                            var updateSelection = function() {
                                if (!Api.isCoordsSet()) {
                                    Api.reset();
                                } else {
                                    var coords = Api.coords();
                                    for (var i = 0; i < Api.data().length; i++) {
                                        var ary = Api.data()[i];
                                        for (var j = 0; j < ary.length; j++) {
                                            var isSelected = i >= coords[0].row && i <= coords[1].row &&
                                                             j >= coords[0].col && j <= coords[1].col;
                                            ary[j] = isSelected ? -1 : null;  // -1 is a placeholder for values yet to be set
                                        }
                                    }
                                }
                            };
                            
                            var setCoord = function(td, index) {
                                Api.coord(index, parseInt(td.attr('data-row')),
                                                 parseInt(td.attr('data-col')));
                            };                          
	                    }
	                };
                };

                this.mod.directive('sbHourSelector',  ['HourSelectorApi', dir]);
            };

        });

        return Feature;

    });


})(define);
