/**
 *  Defines the sandbox year directive
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

                    $scope.date = new Date();
                    $scope.monthDesc = ['Jan', 'Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
                    $scope.bookItems = [];
                    var init = function(){
                        $scope.months = [{month: 1}, {month: 2},{month: 3},{month: 4},{month: 5},{month: 6},{month: 7},{month: 8},{month: 9},{month: 10},{month: 11},{month: 12}];
                    };

                    init();

                    var formatDate = function(date, format){
                        return $filter('date')(date, format);
                    };

                    $scope.prev = function(delta){
                        return $scope.next(-delta || -1);
                    };

                    $scope.next = function(delta){
                        var date = $scope.date;
                        delta = delta || 1;
                        date.setFullYear(date.getFullYear() + delta);
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
                            if(formatDate(item.start_date, 'yyyy') < formatDate($scope.date, 'yyyy')){
                                item.startMonth = 1;
                                item.startDate = 1;
                                item.endMonth = parseInt(formatDate(item.end_date, 'M'));
                                item.endDate = parseInt(formatDate(item.end_date, 'd'));
                            }else{
                                item.startMonth = parseInt(formatDate(item.start_date, 'M'));
                                item.startDate = parseInt(formatDate(item.start_date, 'd'));
                                item.endMonth = parseInt(formatDate(item.end_date, 'M'));
                            }
                            
                        });
                        
                        $scope.bookItems = [];

                        _.each($scope.bookDates, function(book){
                            var temp = {}; 
                            var count = 0;
                            _.each($scope.months, function(item){
                                if(item.month == book.startMonth){
                                    item.selected = true;
                                    temp = book;
                                    item.user = book.user;
                                    count++;
                                }else if(item.month > book.startMonth && item.month < book.endMonth){
                                    item.hide = true;
                                    count++;
                                }else if(item.month == book.endMonth){
                                    item.hide = true;
                                    count++;
                                }
                            });
                            temp.count = count > 0 ? count : 1;
                            temp.left = (book.startMonth-1)*64 + Math.floor((book.startDate-1)*64/30);
                            temp.start = formatDate(book.start_date, 'yyyy-MM-dd');
                            temp.end = formatDate(book.end_date, 'yyyy-MM-dd');
                            temp.invited_people = book.invited_people;
                            temp.appointed_user = book.appointed_user;
                            if(book.endDate){
                                temp.width = Math.floor((book.endDate - book.startDate + 1)*62/30);
                            }else{
                                if(book.startMonth == 12){
                                    temp.width = 62 - Math.floor((book.startDate-1)*62/30);
                                }else{
                                    temp.width = temp.count > 1 ? 62*(temp.count-1) : 62;
                                    // temp.width = 62;
                                }
                            }
                            $scope.bookItems.push(temp);
                        });
                    },true);

                },
                templateUrl: features + '/space/directive/year.html'
            };
        };

        return ['$filter', dir];

    });

})(define);
