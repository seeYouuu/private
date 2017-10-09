/**
 * Created by lubw on 2015/7/27.
 */
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
                this.super.initializer('SbDaySelectorModule');
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
                        templateUrl: features + '/common/ui/SbDaySelector.html',
                        link: function($scope, element, attrs) {
                            $scope.$watch(function() {
                                return Api.data();
                            }, function(newValue, oldValue) {
                                if (newValue === undefined) return;
                                if (newValue === oldValue) return;
                                $scope.data = Api.data();
                            });
                            
                            if ($scope.data) Api.data($scope.data);
                            $scope.data = Api.data();
                            
                            var toggleBubble = function(td, show) {
                                td.find('.bubble').toggle(show);
                            };

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

                            var updateSelection = function() {
                                if (!Api.isCoordsSet()) {
                                    Api.reset();
                                } else {
                                    var coords = Api.coords();
                                    for (var i = 0; i < Api.data().length; i++) {
                                        var isSelected = i >= coords[0] && i <= coords[1];
                                        Api.data()[i] = isSelected ? -1 : null;
                                    }
                                }
                            };

                            var setCoord = function(td, index) {
                                Api.coord(index, parseInt(td.attr('data-weekday')));
                            };
                          
                        }
                    };
                };

                this.mod.directive('sbDaySelector',  ['DaySelectorApi', dir]);
            };

        });

        return Feature;

    });


})(define);
