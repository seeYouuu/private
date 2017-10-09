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
                this.super.initializer('SbDayModule');
            };

            this.run = function() {
            	var features = require.toUrl('features');
            	
                var dir = function($filter, sbDatePicker) {

		            return {
		                restrict: 'AE',
		                scope: {
		                    start: '=',
		                    end: '=',
		                    sdate: '=',
		                    edate: '=',
		                    bookDates: '=',
		                    type: '=',
		                    orderstart: '=',
		                    orderend: '=',
		                    autoClose: "&autoClose"
		                },
		                link: function($scope, element) {
		                    $scope.date = new Date();
		                    $scope.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		                    $scope.weeks = angular.copy(sbDatePicker.getVisibleWeeks($scope.date));

		                    $scope.copyWeeks = [];

		                    var formatDate = function(date, format){
		                        return $filter('date')(date, format);
		                    };

		                    var reset = function(){
		                        $scope.end = $scope.weeks[$scope.weeks.length -1][6];
		                        $scope.start = $scope.weeks[0][0];
		                        $scope.copyWeeks = [];
		                        $scope.today = new Date();
		                        _.each($scope.weeks, function(week){
		                            var temp = [];
		                            _.each(week, function(item){
		                            	if(formatDate(item, 'yyyy-MM-dd') == formatDate($scope.today, 'yyyy-MM-dd')) {
		                            		temp.push({date: item, today: true});
		                            	}else if(formatDate(item, 'yyyy-MM-dd') == formatDate($scope.orderstart, 'yyyy-MM-dd') || formatDate(item, 'yyyy-MM-dd') == formatDate($scope.orderend, 'yyyy-MM-dd')){
		                            		temp.push({date: item, selected: true});
		                            	}else {
		                            		temp.push({date: item});
		                            	}
		                            });
		                            $scope.copyWeeks.push(temp);
		                        });
		                    };

		                    reset();

		                    $scope.print = function(data){
		                    	_.each($scope.copyWeeks, function(week) {
		                    		_.each(week, function(day) {
		                    			day.selected = false;
		                    		});
		                    	});
		                    	data.selected = true;
		                        if(!data.flag && !data.booked){
		                            if($scope.type === 'start'){
		                                $scope.orderstart = formatDate(data.date,'yyyy-MM-dd');
		                            }else if($scope.type === 'end'){
		                                $scope.orderend = formatDate(data.date,'yyyy-MM-dd');
		                            }
		                            $scope.autoClose();
		                        }
		                    };

		                    $scope.prev = function(delta){
		                        return $scope.next(-delta || -1);
		                    };

		                    $scope.next = function(delta){
		                        var date = $scope.date;
		                        delta = delta || 1;
		                        $scope.date.setDate(1);
		                        date.setMonth(date.getMonth() + delta);
		                        $scope.weeks = sbDatePicker.getVisibleWeeks($scope.date);
		                        
		                        dateInfo();
		                        
		                    };

		                    $scope.today = function(){
		                        $scope.date = new Date();
		                        $scope.weeks = sbDatePicker.getVisibleWeeks($scope.date);
		                    };

		                    $scope.$watch('bookDates', function(newValue, oldValue) {
		                        if(newValue === oldValue){
		                            return;
		                        }
		                        dateInfo();
		                    }, true);

		                    var dateInfo = function(){
		                        var today = new Date();
		                        today = today.setDate(today.getDate() - 1);
		                        reset();
		                        if($scope.bookDates.length !== 0){
		                             _.each($scope.bookDates, function(book){
		                                _.each($scope.copyWeeks, function(week){
		                                    _.each(week, function(item){ 
		                                        if(item.date.getTime() >= book.start*1000 && item.date.getTime() <= book.end*1000){   
		                                            item.booked = true;
		                                        }else if($scope.orderstart && item.date < new Date($scope.orderstart)){
		                                            item.flag = true;
		                                        }else if($scope.orderend && item.date > new Date($scope.orderend)){
		                                        	item.flag = true;
		                                        }else if(item.date.getTime() < new Date($scope.sdate).getTime() || item.date.getTime() > new Date($scope.edate).getTime()){
		                                            item.flag = true;
		                                        }else if(item.date.getTime() < today){
		                                            item.flag = true;
		                                        }
		                                    });
		                                });
		                            });
		                        }else{
		                            _.each($scope.copyWeeks, function(week){
		                                _.each(week, function(item){
		                                    if($scope.type == 'end' && $scope.orderstart && item.date < new Date($scope.orderstart)){
		                                        item.flag = true;
		                                    }else if($scope.type == 'start' && $scope.orderend && item.date > new Date($scope.orderend)){
	                                        	item.flag = true;
	                                        }else if(item.date.getTime() < new Date($scope.sdate).getTime() || item.date.getTime() > new Date($scope.edate).getTime()){
		                                        item.flag = true;
		                                    }else if(item.date.getTime() < today){
		                                        item.flag = true;
		                                    }
		                                });
		                            });
		                        } 
		                    };

		                    dateInfo();

		                },
		                templateUrl: features + '/common/ui/SbDay.html'
		            };
		        };
                this.mod.directive('sbDay', ['$filter', 'sbDatePicker',  dir]);
            };

        });

        return Feature;

    });


})(define);
