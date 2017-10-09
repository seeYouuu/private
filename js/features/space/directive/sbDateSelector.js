/**
 *
 *  The stRatio.
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 **/
(function(define) {
    'use strict';

    var features = require.toUrl('features');

    define(['lodash', 'angular'], function(_, angular) {

       var dir = function($filter, sbDatePicker) {

           return {
               restrict: 'AE',
               scope: {
                   edit: '=',
                   removeDates: '=',
                   clear: '&clear'
               },
               link: function($scope) {
                   $scope.date = new Date();
                   $scope.weekdays = ['日','一', '二', '三', '四', '五', '六'];
                   $scope.weeks = angular.copy(sbDatePicker.getVisibleWeeks($scope.date));
                   $scope.copyWeeks = [];
                   $scope.satdayFlag = false;
                   $scope.sundayFlag = false;

                   var formatDate = function(date, format){
                       return $filter('date')(date, format);
                   };

                   var reset = function(){
                       $scope.end = $scope.weeks[$scope.weeks.length -1][6];
                       $scope.start = $scope.weeks[0][0];
                       $scope.copyWeeks = [];
                       _.each($scope.weeks, function(week){
                           var temp = [];
                           _.each(week, function(item){
                               var day = {date: item};
                               if(item.getDay() == 6 || item.getDay() == 0){
                                  day.isWeekend = true;
                               }
                               if($scope.date.getMonth() != item.getMonth()) {
                                    day.disabled = true;
                               }
                               if($scope.removeDates) {
                                  if(_.contains($scope.removeDates[item.getFullYear() + '-' + formatDate(item, 'MM')], formatDate(item, 'dd'))){
                                       day.selected = true;
                                  }
                               }
                               temp.push(day);
                           });
                           $scope.copyWeeks.push(temp);
                       });
                   };

                   var getCurrentYearDate = function(weekday) {
                      var today = new Date();
                      var currentYear = today.getFullYear();
                      var currentMonth = today.getMonth() + 1;

                      for(var month=currentMonth; month<=12; month++ ) {
                        var currentLastDay = (new Date(currentYear, month, 0)).getDate();
                        var tempMonth = month < 10 ? '0' + month : month;
                        $scope.removeDates[currentYear + '-' + tempMonth] ? '' : $scope.removeDates[currentYear + '-' + tempMonth] = [];
                        for(var day=1; day<=currentLastDay; day++){
                          var tempDay = day < 10 ? '0' + day : day;
                          var dayItem = (new Date(currentYear, month-1, day));
                          if(dayItem.getDay() == weekday) {
                            $scope.removeDates[currentYear + '-' + tempMonth].push(tempDay.toString());
                          }
                        }
                      }
                   };

                   reset();

                   $scope.prev = function(delta){
                       return $scope.next(-delta || -1);
                   };

                   $scope.next = function(delta){
                       var date = $scope.date;
                       delta = delta || 1;
                       $scope.date.setDate(1);
                       date.setMonth(date.getMonth() + delta);
                       $scope.weeks = sbDatePicker.getVisibleWeeks($scope.date);
                   };

                   $scope.selectDate = function(item) {
                        item.selected = !item.selected;

                        var dateObj = $scope.removeDates[item.date.getFullYear() + '-' + formatDate(item.date, 'MM')];
                        if(item.selected) {
                          if(dateObj) {
                            dateObj.push(formatDate(item.date, 'dd'));
                          }else {
                            $scope.removeDates[item.date.getFullYear() + '-' + formatDate(item.date, 'MM')] = [];
                            dateObj = $scope.removeDates[item.date.getFullYear() + '-' + formatDate(item.date, 'MM')];
                            dateObj.push(formatDate(item.date, 'dd'));
                          }
                        }else{
                          if(dateObj) {
                            $scope.removeDates[item.date.getFullYear() + '-' + formatDate(item.date, 'MM')] = _.without(dateObj, formatDate(item.date, 'dd'));
                          }
                        }
                   };

                   $scope.selectDates = function(type) {
                        $scope[type] = true;
                        if($scope.satdayFlag) {
                            _.each($scope.copyWeeks, function(week) {
                                _.each(week, function(item) {
                                    item.date.getDay() == 6 ? item.selected = true : '';
                                });
                            });
                            getCurrentYearDate(6);
                        }
                        if($scope.sundayFlag) {
                            _.each($scope.copyWeeks, function(week) {
                                _.each(week, function(item) {
                                    item.date.getDay() == 0 ? item.selected = true : '';
                                });
                            });
                            getCurrentYearDate(0);
                        }
                   };

                   $scope.clearAll = function(){
                       $scope.satdayFlag = false;
                       $scope.sundayFlag = false;
                       _.each($scope.copyWeeks, function(week) {
                           _.each(week, function(item) {
                               item.selected = false;
                           });
                       });
                       $scope.clear();
                   };

                   $scope.$watch('weeks', function() {
                        reset();
                    }, true);               

               },
               templateUrl: features + '/space/directive/sbDateSelector.html'
           };
	      };

        return ['$filter', 'sbDatePicker',  dir];

    });


})(define);
