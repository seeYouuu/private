/**
 *  Defines the sbDatePicker Module.
 *
 *  @author  sky.zhang
 *  @date    Sep 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['FeatureBase'], function(Base) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('sbDatePickerModule');
            };

            this.constructor = function() {
            };

            this.beforeStart = function() {
            };

            this.run = function() {

                this.mod.factory('sbDatePicker', function() {

		            var truncateToDay = function(date){
		              date.setHours(0 - date.getTimezoneOffset() / 60, 0, 0, 0);
		            };

		            return {
		              getVisibleMinutes : function(date, step) {
		                date = new Date(date || new Date());
		                date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
		                var minutes = [];
		                var stop = date.getTime() + 60 * 60 * 1000;
		                while (date.getTime() < stop) {
		                  minutes.push(date);
		                  date = new Date(date.getTime() + step * 60 * 1000);
		                }
		                return minutes;
		              },
		              getVisibleWeeks : function(date) {
		                date = new Date(date || new Date());
		                var startMonth = date.getMonth(), startYear = date.getYear();
		                // set date to start of the week
		                // date.setDate(1);
		                date.setDate(1);
		                // truncate date to get rid of time informations
		                truncateToDay(date);

		                if (date.getDay() === 0) {
		                  // day is sunday, let's get back to the previous week
		                  date.setDate(-6);
		                } else {
		                  // day is not sunday, let's get back to the start of the week
		                  // date.setDate(date.getDate() - (date.getDay() - 1));
		                  date.setDate(date.getDate() - date.getDay());
		                }
		                if (date.getDate() === 1) {
		                  // day is monday, let's get back to the previous week
		                  date.setDate(-7);
		                }

		                var weeks = [];
		                while (weeks.length < 6) {
		                  /*jshint -W116 */
		                  if(date.getYear()=== startYear && date.getMonth() > startMonth) break;
		                  var week = [];
		                  for (var i = 0; i < 7; i++) {
		                    week.push(new Date(date));
		                    date.setDate(date.getDate() + 1);
		                  }
		                  weeks.push(week);
		                }
		                return weeks;
		              },
		              getVisibleYears : function(date) {
		                var years = [];
		                date = new Date(date || new Date());
		                date.setFullYear(date.getFullYear() - (date.getFullYear() % 10));
		                date.setMonth(0);
		                date.setDate(1);
		                truncateToDay(date);
		                var pushedDate;
		                for (var i = 0; i < 12; i++) {
		                  pushedDate = new Date(date);
		                  pushedDate.setFullYear(date.getFullYear() + (i - 1));
		                  years.push(pushedDate);
		                }
		                return years;
		              },
		              getDaysOfWeek : function(date) {
		                date = new Date(date || new Date());
		                date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		                date.setDate(date.getDate() - (date.getDay() - 1));
		                truncateToDay(date);
		                var days = [];
		                for (var i = 0; i < 7; i++) {
		                  days.push(new Date(date));
		                  date.setDate(date.getDate() + 1);
		                }
		                return days;
		              },
		              getVisibleMonths : function(date) {
		                date = new Date(date || new Date());
		                var year = date.getFullYear();
		                var months = [];
		                var pushedDate;
		                for (var month = 0; month < 12; month++) {
		                  pushedDate = new Date(year, month, 1);
		                  truncateToDay(pushedDate);
		                  months.push(pushedDate);
		                }
		                return months;
		              },
		              getVisibleHours : function(date) {
		                date = new Date(date || new Date());
		                truncateToDay(date);
		                var hours = [];
		                for (var i = 0; i < 24; i++) {
		                  hours.push(date);
		                  date = new Date(date.getTime() + 60 * 60 * 1000);
		                }
		                return hours;
		              },
		              isAfter : function(model, date) {
		                model = (model !== undefined) ? new Date(model) : model;
		                date = new Date(date);
		                return model && model.getTime() >= date.getTime();
		              },
		              isBefore : function(model, date) {
		                model = (model !== undefined) ? new Date(model) : model;
		                date = new Date(date);
		                return model.getTime() <= date.getTime();
		              },
		              isSameYear :   function(model, date) {
		                model = (model !== undefined) ? new Date(model) : model;
		                date = new Date(date);
		                return model && model.getFullYear() === date.getFullYear();
		              },
		              isSameMonth : function(model, date) {
		                model = (model !== undefined) ? new Date(model) : model;
		                date = new Date(date);
		                return this.isSameYear(model, date) && model.getMonth() === date.getMonth();
		              },
		              isSameDay : function(model, date) {
		                model = (model !== undefined) ? new Date(model) : model;
		                date = new Date(date);
		                return this.isSameMonth(model, date) && model.getDate() === date.getDate();
		              },
		              isSameHour : function(model, date) {
		                model = (model !== undefined) ? new Date(model) : model;
		                date = new Date(date);
		                return this.isSameDay(model, date) && model.getHours() === date.getHours();
		              },
		              isSameMinutes : function(model, date) {
		                model = (model !== undefined) ? new Date(model) : model;
		                date = new Date(date);
		                return this.isSameHour(model, date) && model.getMinutes() === date.getMinutes();
		              },
		              isValidDate : function(value) {
		                // Invalid Date: getTime() returns NaN
		                return value && !(value.getTime && value.getTime() !== value.getTime());
		              }
		            };
		        });

                this.mod.filter('time',function () {
		          function format(date){
		            return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
		          }

		          return function (date) {
		            if (!(date instanceof Date)) {
		              date = new Date(date);
		              if (isNaN(date.getTime())) {
		                return undefined;
		              }
		            }
		            return format(date);
		          };
		        });
            };
        });

        return Feature;
    });

})(define);
