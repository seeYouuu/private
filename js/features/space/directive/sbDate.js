/**
 *  Defines the sandbox date directive
 *
 *  @author  guofang.zhang
 *  @date    Jun 15, 2015
 *
 */
(function(define) {
    'use strict';

    var features = require.toUrl('features');

    define(['lodash'], function(_) {

        var dir = function($filter) {

            return {
                restrict: 'AE',
                scope: {
                    'date': '=',
                    'bookDates': '='
                },
                link: function($scope) {
                    $scope.date = $scope.date ? $scope.date: new Date();

                    var init = function(){
                        $scope.hours = [
                            {hour: 0, min: 0, mindesc: '00', show: true},
                            {hour: 0, min: 30, mindesc: '30', show: false},
                            {hour: 1, min: 0, mindesc: '00', show: true},
                            {hour: 1, min: 30, mindesc: '30', show: false},
                            {hour: 2, min: 0, mindesc: '00', show: true},
                            {hour: 2, min: 30, mindesc: '30', show: false},
                            {hour: 3, min: 0, mindesc: '00', show: true},
                            {hour: 3, min: 30, mindesc: '30', show: false},
                            {hour: 4, min: 0, mindesc: '00', show: true},
                            {hour: 4, min: 30, mindesc: '30', show: false},
                            {hour: 5, min: 0, mindesc: '00', show: true},
                            {hour: 5, min: 30, mindesc: '30', show: false},
                            {hour: 6, min: 0, mindesc: '00', show: true},
                            {hour: 6, min: 30, mindesc: '30', show: false},
                            {hour: 7, min: 0, mindesc: '00', show: true},
                            {hour: 7, min: 30, mindesc: '30', show: false},
                            {hour: 8, min: 0, mindesc: '00', show: true},
                            {hour: 8, min: 30, mindesc: '30', show: false},
                            {hour: 9, min: 0, mindesc: '00', show: true},
                            {hour: 9, min: 30, mindesc: '30', show: false},
                            {hour: 10, min: 0, mindesc: '00', show: true},
                            {hour: 10, min: 30, mindesc: '30', show: false},
                            {hour: 11, min: 0, mindesc: '00', show: true},
                            {hour: 11, min: 30, mindesc: '30', show: false},
                            {hour: 12, min: 0, mindesc: '00', show: true},
                            {hour: 12, min: 30, mindesc: '30', show: false},
                            {hour: 13, min: 0, mindesc: '00', show: true},
                            {hour: 13, min: 30, mindesc: '30', show: false},
                            {hour: 14, min: 0, mindesc: '00', show: true},
                            {hour: 14, min: 30, mindesc: '30', show: false},
                            {hour: 15, min: 0, mindesc: '00', show: true},
                            {hour: 15, min: 30, mindesc: '30', show: false},
                            {hour: 16, min: 0, mindesc: '00', show: true},
                            {hour: 16, min: 30, mindesc: '30', show: false},
                            {hour: 17, min: 0, mindesc: '00', show: true},
                            {hour: 17, min: 30, mindesc: '30', show: false},
                            {hour: 18, min: 0, mindesc: '00', show: true},
                            {hour: 18, min: 30, mindesc: '30', show: false},
                            {hour: 19, min: 0, mindesc: '00', show: true},
                            {hour: 19, min: 30, mindesc: '30', show: false},
                            {hour: 20, min: 0, mindesc: '00', show: true},
                            {hour: 20, min: 30, mindesc: '30', show: false},
                            {hour: 21, min: 0, mindesc: '00', show: true},
                            {hour: 21, min: 30, mindesc: '30', show: false},
                            {hour: 22, min: 0, mindesc: '00', show: true},
                            {hour: 22, min: 30, mindesc: '30', show: false},
                            {hour: 23, min: 0, mindesc: '00', show: true},
                            {hour: 23, min: 30, mindesc: '30', show: false}
                        ];
                    };

                    init();

                    var formatDate = function(date, format){
                        return $filter('date')(date, format);
                    };

                    $scope.prev = function(delta){
                        return $scope.next(-delta || -1);
                    };

                    $scope.next = function(delta){
                        var date = $scope.date,
                        delta = delta || 1;
                        date.setDate(date.getDate() + delta);
                    };

                    $scope.today = function(){
                        $scope.date = new Date();
                    };

                    $scope.$watch('bookDates', function(newValue, oldValue){
                        if(newValue === oldValue){
                            return;
                        }
                        init();
                        _.each($scope.bookDates, function(item){
                            item.startHour = formatDate(item.start_date, 'H');
                            item.startMin = formatDate(item.start_date, 'm');
                            item.startMinDesc = formatDate(item.start_date, 'mm');
                            item.endHour = formatDate(item.end_date, 'H');
                            item.endMin = formatDate(item.end_date, 'm');
                            item.endMinDesc = formatDate(item.end_date, 'mm');
                        });

                        _.each($scope.bookDates, function(book){
                            var count = 0, temp;
                            _.each($scope.hours, function(item){
                                if(item.hour == book.startHour && item.min >= book.startMin){
                                    if(item.min == book.startMin){
                                        item.user = book.user;
                                        temp = item;
                                        item.bookTime = book;
                                        item.selected = true;
                                    }else {
                                        item.hide = true;
                                    }
                                    count++;
                                }else if(item.hour == book.endHour && item.min < book.endMin){
                                    item.hide = true;
                                    count++;
                                }else if( item.hour > book.startHour && item.hour < book.endHour){
                                    item.hide = true;
                                    count++;
                                }
                            });
                            temp.count = count > 0 ? count: 1;
                        });
                        
                    }, true);
                },
                templateUrl: features + '/space/directive/date.html'
            };
        };

        return ['$filter', dir];

    });

})(define);
