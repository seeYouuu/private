/**
 *  Defines the sandbox month directive
 *
 *  @author  sky.zhang
 *  @date    Jun 15, 2015
 *
 */
(function(define) {
    'use strict';

    var features = require.toUrl('features');

    define(['lodash', 'angular'], function(_, angular) {

        var dir = function(sbDatePicker) {

            return {
                restrict: 'AE',
                scope: {
                    start: '=',
                    end: '=',
                    bookDates: '=',
                    type: '=',
                    allow: '='
                },
                link: function($scope) {
                    $scope.date = new Date();
                    $scope.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    $scope.weeks = angular.copy(sbDatePicker.getVisibleWeeks($scope.date));
                    $scope.copyWeeks = [];

                    var reset = function(){
                        $scope.end = $scope.weeks[$scope.weeks.length -1][6];
                        $scope.start = $scope.weeks[0][0];
                        $scope.copyWeeks = [];
                        _.each($scope.weeks, function(week){
                            var temp = [];
                            _.each(week, function(item){
                                temp.push({date: item});
                            });
                            $scope.copyWeeks.push(temp);
                        });
                    };

                    $scope.prev = function(delta){
                        return $scope.next(-delta || -1);
                    };

                    $scope.next = function(delta){
                        var date = $scope.date,
                        delta = delta || 1;
                        $scope.date.setDate(1);
                        date.setMonth(date.getMonth() + delta);
                        $scope.weeks = sbDatePicker.getVisibleWeeks($scope.date);
                    };

                    $scope.today = function(){
                        $scope.date = new Date();
                        $scope.weeks = sbDatePicker.getVisibleWeeks($scope.date);
                    };

                    $scope.$watch('weeks', function() {
                        reset();
                    }, true);

                    $scope.$watch('bookDates', function(newValue, oldValue) {
                        if(newValue === oldValue){
                            return;
                        }
                        console.log($scope.bookDates);
                        $scope.weeks = angular.copy(sbDatePicker.getVisibleWeeks($scope.date));
                        reset();
                        if($scope.bookDates.length > 0){
                            if($scope.type === 'fixed'){
                                _.each($scope.bookDates, function(book){
                                    _.each($scope.copyWeeks, function(week){
                                        var temp = '', count = 0, flag = false;
                                        _.each(week, function(item){
                                            if(item.date.getTime() === book.start){
                                                temp = item;
                                                count = 1;
                                                temp.user = book.user;
                                                flag = true;
                                            }else if(item.date.getTime() > book.start && item.date.getTime() < book.end){
                                                count++;
                                                if(count === 1){
                                                    temp = item;
                                                    flag = true;
                                                }else{
                                                    item.hide = true;
                                                }
                                            }
                                        });
                                        if(temp){
                                            temp.count = count;
                                            temp.flag = flag;
                                        }
                                    });
                                });
                            }else{
                                _.each($scope.copyWeeks, function(week){
                                    _.each(week, function(item){
                                        var count = 0;
                                        _.each($scope.bookDates, function(book){
                                            if(item.date.getTime() === book.start){
                                                count++;
                                                item.users = [];
                                                item.users.push(book.user);
                                                book.appointed_user ? item.appointed_user = book.appointed_user : '';
                                            }
                                        });
                                        item.count = count;
                                    });
                                });
                            }
                        }
                    }, true);
                },
                templateUrl: features + '/space/directive/month.html'
            };
        };

        return ['sbDatePicker', dir];

    });

})(define);
