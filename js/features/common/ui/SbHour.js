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

    define(['FeatureBase'], function(Base) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('SbHourModule');
            };

            this.run = function() {
                var features = require.toUrl('features');
                
                var dir = function($filter) {
                    return {
                        restrict: 'AE',
                        scope: {
                            'date': '=',
                            'bookDates': '=',
                            'sdate': '=',
                            'edate': '=',
                            'open': '='
                        },
                        link: function($scope, element) {
                            $scope.date = $scope.date ? $scope.date: new Date();

                            var init = function(){
                                $scope.hours = [
                                    {hour: 0, min: 0, mindesc: 'am', show: true},
                                    {hour: 0, min: 30, mindesc: '30', show: false},
                                    {hour: 1, min: 0, mindesc: 'am', show: true},
                                    {hour: 1, min: 30, mindesc: '30', show: false},
                                    {hour: 2, min: 0, mindesc: 'am', show: true},
                                    {hour: 2, min: 30, mindesc: '30', show: false},
                                    {hour: 3, min: 0, mindesc: 'am', show: true},
                                    {hour: 3, min: 30, mindesc: '30', show: false},
                                    {hour: 4, min: 0, mindesc: 'am', show: true},
                                    {hour: 4, min: 30, mindesc: '30', show: false},
                                    {hour: 5, min: 0, mindesc: 'am', show: true},
                                    {hour: 5, min: 30, mindesc: '30', show: false},
                                    {hour: 6, min: 0, mindesc: 'am', show: true},
                                    {hour: 6, min: 30, mindesc: '30', show: false},
                                    {hour: 7, min: 0, mindesc: 'am', show: true},
                                    {hour: 7, min: 30, mindesc: '30', show: false},
                                    {hour: 8, min: 0, mindesc: 'am', show: true},
                                    {hour: 8, min: 30, mindesc: '30', show: false},
                                    {hour: 9, min: 0, mindesc: 'am', show: true},
                                    {hour: 9, min: 30, mindesc: '30', show: false},
                                    {hour: 10, min: 0, mindesc: 'am', show: true},
                                    {hour: 10, min: 30, mindesc: '30', show: false},
                                    {hour: 11, min: 0, mindesc: 'am', show: true},
                                    {hour: 11, min: 30, mindesc: '30', show: false},
                                    {hour: 12, min: 0, mindesc: 'am', show: true},
                                    {hour: 12, min: 30, mindesc: '30', show: false},
                                    {hour: 13, min: 0, mindesc: 'pm', show: true},
                                    {hour: 13, min: 30, mindesc: '30', show: false},
                                    {hour: 14, min: 0, mindesc: 'pm', show: true},
                                    {hour: 14, min: 30, mindesc: '30', show: false},
                                    {hour: 15, min: 0, mindesc: 'pm', show: true},
                                    {hour: 15, min: 30, mindesc: '30', show: false},
                                    {hour: 16, min: 0, mindesc: 'pm', show: true},
                                    {hour: 16, min: 30, mindesc: '30', show: false},
                                    {hour: 17, min: 0, mindesc: 'pm', show: true},
                                    {hour: 17, min: 30, mindesc: '30', show: false},
                                    {hour: 18, min: 0, mindesc: 'pm', show: true},
                                    {hour: 18, min: 30, mindesc: '30', show: false},
                                    {hour: 19, min: 0, mindesc: 'pm', show: true},
                                    {hour: 19, min: 30, mindesc: '30', show: false},
                                    {hour: 20, min: 0, mindesc: 'pm', show: true},
                                    {hour: 20, min: 30, mindesc: '30', show: false},
                                    {hour: 21, min: 0, mindesc: 'pm', show: true},
                                    {hour: 21, min: 30, mindesc: '30', show: false},
                                    {hour: 22, min: 0, mindesc: 'pm', show: true},
                                    {hour: 22, min: 30, mindesc: '30', show: false},
                                    {hour: 23, min: 0, mindesc: 'pm', show: true},
                                    {hour: 23, min: 30, mindesc: '30', show: false}
                                ];
                            };

                            init();

                            var formatDate = function(date, format){
                                return $filter('date')(date, format);
                            };

                            $scope.open_time = {
                                    startHour:'',
                                    startMin:'',
                                    endHour:'',
                                    endMin:''
                                };
                            $scope.open_time.startHour = formatDate($scope.open.start_hour, 'H');
                            $scope.open_time.startMin = formatDate($scope.open.start_hour, 'm');
                            $scope.open_time.endHour = formatDate($scope.open.end_hour, 'H');
                            $scope.open_time.endMin = formatDate($scope.open.end_hour, 'm');

                            $scope.prev = function(delta){
                                return $scope.next(-delta || -1);
                            };

                            $scope.next = function(delta){
                                var date = $scope.date;
                                delta = delta || 1;
                                date.setDate(date.getDate() + delta);
                            };

                            $scope.today = function(){
                                $scope.date = new Date();
                            };

                            $scope.$watch('date', function(newValue, oldValue){
                                if(newValue === oldValue){
                                    return;
                                }
                                dateInfo();
                            }, true);

                            $scope.$watch('bookDates', function(newValue, oldValue){
                                if(newValue === oldValue){
                                    return;
                                }
                                dateInfo();
                            }, true);

                            var dateInfo = function(){
                                init();
                                var temp = {
                                    startHour:'',
                                    startMin:'',
                                    endHour:'',
                                    endMin:'',
                                    hour:'',
                                    min:''
                                };
                                temp.hour = formatDate(new Date(), 'H');
                                temp.min = formatDate(new Date(), 'm');
                               
                                if($scope.bookDates.length !== 0){
                                    _.each($scope.bookDates, function(book){
                                        temp.startHour = formatDate(book.start * 1000, 'H');
                                        temp.startMin = formatDate(book.start * 1000, 'm');
                                        temp.endHour = formatDate(book.end * 1000, 'H');
                                        temp.endMin = formatDate(book.end * 1000, 'm');

                                        _.each($scope.hours, function(item){
                                            if(formatDate($scope.date, 'yyyy-MM-dd') < formatDate(new Date(), 'yyyy-MM-dd')){
                                                item.selected = true;
                                            }else if(formatDate($scope.date, 'yyyy-MM-dd') === formatDate(new Date(), 'yyyy-MM-dd')){
                                                if(item.hour < temp.hour){
                                                    item.selected = true;
                                                }else if(item.hour == temp.hour && item.min == 0 && temp.min < 30 ){
                                                    item.selected = false;
                                                }else if(item.hour == temp.hour && item.min == 0 && temp.min > 30 ){
                                                    item.selected = true;
                                                }else{
                                                    if(item.hour == $scope.open_time.startHour && (item.min < $scope.open_time.startMin) ){
                                                        item.selected = true;
                                                    }else if(item.hour == $scope.open_time.endHour && item.min >= $scope.open_time.endMin){
                                                        item.selected = true;
                                                    }else if(item.hour < $scope.open_time.startHour || item.hour > $scope.open_time.endHour){
                                                        item.selected = true;
                                                    }else if(item.hour >= $scope.open_time.startHour && item.hour <= $scope.open_time.endHour){
                                                        if(item.hour == temp.startHour && (item.min >= temp.startMin) ){
                                                            item.selected = true;
                                                            if(item.hour == temp.endHour && (item.min == temp.endMin)){
                                                                item.selected = false;
                                                            }
                                                        }else if(item.hour > temp.startHour && item.hour < temp.endHour){
                                                            item.selected = true;
                                                        }else if(item.hour == temp.endHour && item.min < temp.endMin){
                                                            item.selected = true;
                                                        }
                                                    }
                                                }

                                            }else if($scope.date.getTime() > new Date($scope.edate).getTime()){
                                                item.selected = true;
                                            }else{
                                                if(item.hour == $scope.open_time.startHour && (item.min < $scope.open_time.startMin) ){
                                                    item.selected = true;
                                                }else if(item.hour == $scope.open_time.endHour && item.min >= $scope.open_time.endMin){
                                                    item.selected = true;
                                                }else if(item.hour < $scope.open_time.startHour || item.hour > $scope.open_time.endHour){
                                                    item.selected = true;
                                                }else if(item.hour >= $scope.open_time.startHour && item.hour <= $scope.open_time.endHour){
                                                    if(item.hour == temp.startHour && (item.min >= temp.startMin) ){
                                                        item.selected = true;
                                                        if(item.hour == temp.endHour && (item.min == temp.endMin)){
                                                            item.selected = false;
                                                        }
                                                    }else if(item.hour == temp.endHour && item.min < temp.endMin){
                                                        item.selected = true;
                                                    }else if( item.hour > temp.startHour && item.hour < temp.endHour){
                                                        item.selected = true;
                                                    }
                                                }
                                            }
                                            
                                        });
                                       
                                    });
                                }else{
                                    _.each($scope.hours, function(item){
                                        if(formatDate($scope.date, 'yyyy-MM-dd') < formatDate(new Date(), 'yyyy-MM-dd')){
                                            item.selected = true;
                                        }else if(formatDate($scope.date, 'yyyy-MM-dd') === formatDate(new Date(), 'yyyy-MM-dd')){
                                            if(item.hour < temp.hour){
                                                item.selected = true;   
                                            }else if(item.hour == temp.hour && item.min == 0 && temp.min < 30 ){
                                                item.selected = false;
                                            }else if(item.hour == temp.hour && item.min == 0 && temp.min > 30 ){
                                                item.selected = true;
                                            }else{
                                                if(item.hour == $scope.open_time.startHour && (item.min < $scope.open_time.startMin) ){
                                                    item.selected = true;
                                                }else if(item.hour == $scope.open_time.endHour && item.min >= $scope.open_time.endMin){
                                                    item.selected = true;
                                                }else if(item.hour < $scope.open_time.startHour || item.hour > $scope.open_time.endHour){
                                                    item.selected = true;
                                                }
                                            }

                                        }else if($scope.date.getTime() > new Date($scope.edate).getTime()){
                                                item.selected = true;
                                        }else{
                                            if(item.hour == $scope.open_time.startHour && (item.min < $scope.open_time.startMin) ){
                                                item.selected = true;
                                            }else if(item.hour == $scope.open_time.endHour && item.min >= $scope.open_time.endMin){
                                                item.selected = true;
                                            }else if(item.hour < $scope.open_time.startHour || item.hour > $scope.open_time.endHour){
                                                item.selected = true;
                                            }
                                        }
                                        
                                    });
                                }  
          
                            };

                            dateInfo();

                        },
                        templateUrl: features + '/common/ui/SbHour.html'
                     };
                };
                this.mod.directive('sbHour', ['$filter',  dir]);
            };

        });

        return Feature;

    });


})(define);
