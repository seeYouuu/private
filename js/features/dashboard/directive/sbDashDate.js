/**
 *  Defines the sandbox dashboard date directive
 *
 *  @author  lipeng
 *  @date    Mar 14, 2017
 *
 */
(function(define) {
    'use strict';

    var features = require.toUrl('features');

    define(['lodash'], function(_) {

        var dir = function($filter, $rootScope, $timeout, DashboardService, events) {

            return {
                restrict: 'AE',
                scope: {
                    orders: '=',
                    rooms: '=',
                    room: '=',
                    roomNums: '=',
                    type: '=',
                    selectedDate: '=',
                    pickOptions: '=',
                    tab: '=',
                    method: '='
                },
                link: function($scope, element) {
                    
                    var today = new Date(),
                        params = {
                            month: 0
                        },
                        boxWidth = {
                            month: 8.33,
                            day: 14.285,
                            hour: 4.166,
                            hourDay: 0.595
                        };
                    $scope.flags = {
                        coverStart: false,
                        coverEnd: false
                    }
                    $rootScope.needRefresh = false;
                    $scope.rendered = false;

                    var noty = function(type, msg) {
                        events.emit('alert', {
                            type: type,
                            message: msg
                        });
                    };

                    var formatDate = function(date, format){
                        return $filter('date')(date, format);
                    };

                    var formateWeekDay = function(aimDate, tag){
                        var year = $filter('date')(aimDate, 'yyyy') * 1,
                            month = $filter('date')(aimDate, 'MM') * 1,
                            day = $filter('date')(aimDate, 'dd') * 1,
                            cache = {};
                        if(tag === 'add1'){
                            cache = new Date(new Date(year, month -1, day, 0, 0).getTime() + 1000 * 3600 * 24);
                        }else{
                            cache = new Date(year, month -1, day, 0, 0);
                        }
                        return cache;
                    };

                    var formatDateForHour = function(date){
                        return {
                            year: $filter('date')(date, 'yyyy') * 1,
                            month: $filter('date')(date, 'M') * 1,
                            day: $filter('date')(date, 'd') * 1,
                            hour: $filter('date')(date, 'H') * 1,
                            minute: $filter('date')(date, 'm') * 1,
                            second: $filter('date')(date, 's') * 1
                        };
                    };

                    var prependChild = function(parent,newChild){
                        parent && parent.firstChild ? parent.insertBefore(newChild,parent.firstChild) : parent.appendChild(newChild);
                    };

                    var getDaysInOneMonth = function(year, month){  
                        month = parseInt(month, 10);  
                        var d= new Date(year, month, 0);  
                        return d.getDate();  
                    }

                    var initFlag = function(){
                        for(var key in $scope.flags){
                            $scope.flags[key] = false;
                        }
                    };

                    var initParams = function(){
                        for(var key in params){
                            $scope.flags[key] = 0;
                        }
                    };

                    $scope.timeItems = DashboardService.getTimeItems($scope.type);

                    var getDaysFromYear = function(d){
                        initParams();
                        var year = formatDate(d, 'yyyy'),
                            month = formatDate(d, 'M'),
                            day = formatDate(d, 'd'),
                            selectedYear = $scope.selectedDate.getFullYear(),
                            cache = 0;
                        if(year >= selectedYear){
                            params.month = parseInt(month);
                            cache = boxWidth.month * (params.month - 1) + (day - 1) / getDaysInOneMonth(year, params.month) * boxWidth.month;
                        }
                        return cache;
                    };

                    var getDaysLength = function(s,e,o){
                        initFlag();
                        var start = new Date(formatDate(s, 'yyyy-MM-dd')),
                            end = new Date(formatDate(e, 'yyyy-MM-dd')),
                            startYear = start.getFullYear(),
                            endYear = end.getFullYear(),
                            selectedYear = $scope.selectedDate.getFullYear(),
                            startMonthDays = 0,
                            endMonthDays = 0,
                            startMonthDaysLength = 0,
                            endMonthDaysLength = 0,
                            percent = 0;
                        if(startYear == endYear && startYear == selectedYear){
                            startMonthDaysLength = getDaysInOneMonth(startYear, start.getMonth() + 1);
                            startMonthDays = startMonthDaysLength - start.getDate() + 1;
                            endMonthDays = end.getDate();
                            endMonthDaysLength = getDaysInOneMonth(endYear, end.getMonth() + 1);
                            if(end.getMonth() - start.getMonth() == 0){
                                percent = startMonthDays / startMonthDaysLength * boxWidth.month;
                            }else{
                                percent = startMonthDays / startMonthDaysLength * boxWidth.month + (end.getMonth() - start.getMonth() - 1) * boxWidth.month + endMonthDays / endMonthDaysLength * boxWidth.month;
                            }
                        }else if(endYear > selectedYear && startYear == selectedYear){
                            o.coverEnd = true;
                            startMonthDaysLength = getDaysInOneMonth(startYear, start.getMonth() + 1);
                            startMonthDays = startMonthDaysLength - start.getDate() + 1;
                            percent = startMonthDays / startMonthDaysLength * boxWidth.month + (12 - start.getMonth() - 1) * boxWidth.month;
                        }
                        if(startYear < selectedYear && endYear == selectedYear){
                            o.coverStart = true;
                            endMonthDays = end.getDate();
                            endMonthDaysLength = getDaysInOneMonth(endYear, end.getMonth() + 1);
                            if(end.getMonth() == 0){
                                percent = endMonthDays / endMonthDaysLength * boxWidth.month;
                            }else{
                                percent = (end.getMonth() - 1) * boxWidth.month + endMonthDays / endMonthDaysLength * boxWidth.month;
                            }
                        }else if(startYear < selectedYear && endYear > selectedYear){
                            o.coverStart = true;
                            o.coverEnd = true;
                            percent = 100;
                        }
                        return percent;
                    };

                    var ifOrderPassed = function(aim){
                        var endDate = formatDateForHour(aim),
                            param = new Date(endDate.year,endDate.month - 1,endDate.day,endDate.hour,endDate.minute,endDate.second).getTime(),
                            flag = false;
                        if($scope.type != 'day'){
                            flag = today.getTime() - param > 0 ? true : false;
                        }else{
                            var endDay = new Date(formatDate(aim, 'yyyy'), formatDate(aim, 'M') - 1, formatDate(aim, 'd'), 23, 59, 59).getTime();
                            flag = today.getTime() - endDay > 0 ? true : false;
                        }
                        return flag;
                    };

                    var notDefaultDate = function(){
                        var flag = false;
                        if($scope.type == 'hour'){
                            if($scope.selectedDate.getTime() != today.getTime() && $scope.selectedDate.getDate() != today.getDate()){
                                flag = true;
                            }
                        }else if($scope.type == 'month'){
                            $scope.selectedDate.getFullYear() != today.getFullYear() ? flag = true : '';
                        }else if($scope.type == 'day'){
                            var now = new Date(today.getFullYear(),today.getMonth(),today.getDate()),
                                weekStart,
                                weekEnd;
                            if(now.getDay() == 0){
                                weekStart = now.getTime();
                                weekEnd = weekStart + 7 * 1000 * 3600 * 24;
                            }else if(now.getDay() == 6){
                                weekEnd = now.getTime() + 1000 * 3600 * 24;
                                weekStart = weekEnd - 6 * 1000 * 3600 * 24;
                            }else if(now.getDay() > 0 && now.getDay() < 6){
                                weekStart = now.getTime() - now.getDay() * 1000 * 3600 * 24;
                                weekEnd = now.getTime() + (7 - now.getDay()) * 1000 * 3600 * 24;
                            }
                            $scope.selectedDate.getTime() > weekEnd || $scope.selectedDate.getTime() < weekStart ? flag = true : '';
                        }
                        return flag;
                    };

                    var getOrderHourLength = function(s,e){
                        var startParams = formatDateForHour(s),
                            endParams = formatDateForHour(e),
                            start = new Date(startParams.year,startParams.month - 1,startParams.day,startParams.hour,startParams.minute,startParams.second),
                            end = new Date(endParams.year,endParams.month - 1,endParams.day,endParams.hour,endParams.minute,endParams.second),
                            today = formatDateForHour($scope.selectedDate),
                            openingEndParams = formatDateForHour($scope.room.product.end_hour),
                            openingStartTime = new Date(today.year,today.month - 1,today.day,startParams.hour,startParams.minute,startParams.second),
                            openingEndTime = new Date(today.year,today.month - 1,today.day,openingEndParams.hour,openingEndParams.minute,openingEndParams.second),
                            cache = {
                                halfhours: 0,
                                endAtHalf: false
                            };
                        end.getMinutes() == 30 ? cache.endAtHalf = true : '';
                        if($scope.type === 'hour' && startParams.day == endParams.day && startParams.month == endParams.month){
                            cache.halfhours = (end.getTime() - start.getTime()) / 1000 / 1800;
                        }else if($scope.type === 'day'){
                            if((end.getTime() - start.getTime()) / 1000 / 3600 / 24 < 1){
                                cache.halfhours = (end.getTime() - start.getTime()) / 1000 / 1800;
                            }else{
                                cache.halfhours = (end.getTime() - start.getTime()) / 1000 / 3600 / 24 * 48;
                            }
                        }else{
                            cache.halfhours = (openingEndTime.getTime() - openingStartTime.getTime()) / 1000 / 1800;
                        }
                        return cache;
                    };

                    var getHourBlockPos = function(s){
                        var startParams = formatDateForHour(s),
                            start = new Date(startParams.year,startParams.month - 1,startParams.day,startParams.hour,startParams.minute,startParams.second),
                            hours = start.getHours(),
                            min = start.getMinutes(),
                            cache = {
                                pos: 0,
                                startAtHalf: false
                            };
                        if(min == 30){
                            cache.pos = (hours + 0.5) * boxWidth.hour;
                            cache.startAtHalf = true;
                        }else{
                            cache.pos = hours * boxWidth.hour;
                        }
                        return cache;
                    };

                    var getHoursToDayBlockPos = function(s, e){
                        var startParams = formatDateForHour(s),
                            endParams = formatDateForHour(e),
                            start = new Date(startParams.year,startParams.month - 1,startParams.day,startParams.hour,startParams.minute,startParams.second),
                            end = new Date(endParams.year,endParams.month - 1,endParams.day,endParams.hour,endParams.minute,endParams.second),
                            startDay = formateWeekDay($scope.pickOptions.startDay),
                            days = 0,
                            hours = start.getHours(),
                            min = start.getMinutes(),
                            cache = {
                                pos: 0,
                                startAtHalf: false
                            };
                        if(start.getTime() - startDay.getTime() > 0){
                            days = parseInt((start.getTime() - startDay.getTime()) / 24 / 3600 / 1000);
                        }else{
                            days = 0;
                        }
                        if(min == 30){
                            cache.pos = boxWidth.day * days + (hours + 0.5) * boxWidth.hourDay;
                            cache.startAtHalf = true;
                        }else{
                            cache.pos = boxWidth.day * days + hours * boxWidth.hourDay;
                        }
                        if($scope.type === 'day'){
                            if((end.getTime() - start.getTime()) / 1000 / 3600 / 24 < 1){
                                cache.pos = boxWidth.day * days + hours * boxWidth.hourDay;
                            }else{
                                cache.pos = boxWidth.day * days;
                            }
                        }
                        return cache;
                    };

                    var getWidthForWeek = function(s, e){
                        var startParams = formatDateForHour(s),
                            endParams = formatDateForHour(e),
                            start = new Date(startParams.year,startParams.month - 1,startParams.day,startParams.hour,startParams.minute,startParams.second),
                            end = new Date(endParams.year,endParams.month - 1,endParams.day,endParams.hour,endParams.minute,endParams.second),
                            startDay = formateWeekDay($scope.pickOptions.startDay),
                            endDay = formateWeekDay($scope.pickOptions.endDay, 'add1'),
                            percent = 0;
                        if(start.getTime() <= startDay.getTime()){
                            if(end.getTime() > endDay.getTime()){
                                percent = 100;
                            }else{
                                percent = parseInt((end.getTime() - startDay.getTime()) / 1000 / 3600 / 24) * boxWidth.day;
                            }
                        }else if(start.getTime() > startDay.getTime()){
                            if(end.getTime() > endDay.getTime()){
                                percent = parseInt((endDay.getTime() - start.getTime()) / 1000 / 3600 / 24) * boxWidth.day;
                            }else{
                                percent = parseInt((end.getTime() - start.getTime()) / 1000 / 3600 / 24) * boxWidth.day;
                            }
                        }
                        return percent;
                    };

                    var initDivider = function(){
                        initParams();
                        if(notDefaultDate()){
                            return false;
                        }
                        var pos = 0,
                            lines = document.querySelectorAll('.line-right'),
                            forDot = document.querySelectorAll('.for-dot');
                        params.month = today.getMonth();
                        if($scope.type == 'month'){
                            pos = boxWidth.month * params.month + (today.getDate() - 1) / getDaysInOneMonth(today.getFullYear(), params.month + 1) * boxWidth.month;
                        }else if($scope.type == 'hour'){
                            if(today.getMinutes() < 30){
                                pos = today.getHours() * boxWidth.hour;
                            }else{
                                pos = (today.getHours() + 0.5) * boxWidth.hour;
                            }
                        }else if($scope.type == 'day'){
                            pos = (today.getHours() * 60 + today.getMinutes()) / 24 / 60 / 7 * 100 + today.getDay() * boxWidth.day;
                        }
                        if(document.querySelectorAll('.dot-wrapper').length == 0){
                            var redDot = document.createElement('div');
                            redDot.classList.add('dot-wrapper');
                            var dot = document.createElement('div'),
                                dotBox = document.createElement('div');
                            dot.classList.add('red-dot');
                            dotBox.classList.add('dot-box');
                            dot.style.left = pos + '%';
                            dotBox.appendChild(dot);
                            redDot.appendChild(dotBox);
                            for (var i = 0; i < forDot.length; i++) {
                                prependChild(forDot[i], redDot);
                            }
                        }
                        for (var j = lines.length - $scope.roomNums; j < lines.length; j++) {
                            var block = document.createElement('div');
                            block.classList.add('divider');
                            block.style.left = pos + '%';
                            prependChild(lines[j], block);
                        }
                    };

                    var fixHoverPos = function(){
                        var _className = $scope.type == 'day' ? '.pink-block' : '.cover',
                            hovers = document.querySelectorAll(_className);
                        for (var i = 0; i < hovers.length; i++) {
                            var son = _.filter(hovers[i].childNodes, function(hover){return hover.classList && hover.classList.contains('threesome')});
                            if(son.length <= 0){
                                if(hovers[i].parentNode.parentNode.offsetWidth - hovers[i].offsetLeft - hovers[i].offsetWidth / 2 < 210){
                                    hovers[i].classList.add('move');
                                }
                            }else{
                                if(hovers[i].parentNode.parentNode.offsetWidth - hovers[i].offsetLeft - hovers[i].offsetWidth / 2 < 325){
                                    hovers[i].classList.add('move');
                                }
                            }
                            
                        }
                    };

                    var addDomForMonth = function(){
                        var blocks = element.find('.cover');
                        _.each($scope.orders, function(order, index){
                            blocks[index].style.left = getDaysFromYear(order.start_date) + '%';
                            blocks[index].style.width = getDaysLength(order.start_date, order.end_date, order) + '%';
                            blocks[index].classList.add('show');
                            ifOrderPassed(order.end_date) ? order.disabled = true : '';
                        })
                    };

                    var addDomForHour = function(){
                        var blocks = element.find('.cover');
                        _.each($scope.orders, function(order, index){
                            if(getHourBlockPos(order.start_date).startAtHalf){
                                order.coverStart = true;
                                blocks[index].style.left = getHourBlockPos(order.start_date).pos + 0.2 + '%';
                                if(getOrderHourLength(order.start_date, order.end_date).endAtHalf){
                                    order.coverEnd = true;
                                    blocks[index].style.width = getOrderHourLength(order.start_date, order.end_date).halfhours * 0.5 * boxWidth.hour - 0.2 - 0.2 + '%';
                                }else{
                                    blocks[index].style.width = getOrderHourLength(order.start_date, order.end_date).halfhours * 0.5 * boxWidth.hour - 0.2 + '%';
                                }
                            }else{
                                if(getOrderHourLength(order.start_date, order.end_date).endAtHalf){
                                    order.coverEnd = true;
                                    blocks[index].style.width = getOrderHourLength(order.start_date, order.end_date).halfhours * 0.5 * boxWidth.hour - 0.2 + '%';
                                }else{
                                    blocks[index].style.width = getOrderHourLength(order.start_date, order.end_date).halfhours * 0.5 * boxWidth.hour + '%';
                                }
                                blocks[index].style.left = getHourBlockPos(order.start_date).pos + '%';
                            }
                            blocks[index].classList.add('show');
                            ifOrderPassed(order.end_date) ? order.disabled = true : '';
                        })
                    };

                    var formateDayMock = function(name, length, father, order){
                        if(length > 0){
                            var div = document.createElement('div');
                            div.classList.add(name);
                            div.classList.add('for-radius');
                            div.style.height = length / order.allowed_people * 45 + 'px';
                            father.appendChild(div);
                        }
                    };

                    var addDomForDay = function(){
                        var blocks = element.find('.pink-block');
                        _.each($scope.room.uses, function(order, index){
                            var pos = order.pos,
                                wrap = document.createElement('div'),
                                selfies = _.filter(order.users, function(user){return !user.type}),
                                preorders = _.filter(order.users, function(user){return user.type == 'preorder'}),
                                reserves = _.filter(order.users, function(user){return user.type == 'reserve'});
                            blocks[index].classList.add('no-height');
                            ifOrderPassed(order.date) ? blocks[index].classList.add('disabled') : '';
                            blocks[index].style.left = pos * boxWidth.day + 0.3 + '%';
                            formateDayMock('selfies',selfies.length, wrap, order);
                            formateDayMock('preorders',preorders.length, wrap, order);
                            formateDayMock('reserves',reserves.length, wrap, order);
                            blocks[index].appendChild(wrap);
                            blocks[index].style.width = boxWidth.day - 0.6 + '%';
                            blocks[index].classList.add('show');
                        });
                    };

                    var addDomForHourToDay = function(){
                        var blocks = element.find('.cover');
                        _.each($scope.orders, function(order, index){
                            if(getHoursToDayBlockPos(order.start_date, order.end_date).startAtHalf){
                                order.coverStart = true;
                                blocks[index].style.left = getHoursToDayBlockPos(order.start_date, order.end_date).pos + '%';
                                if(getOrderHourLength(order.start_date, order.end_date).endAtHalf){
                                    order.coverEnd = true;
                                    blocks[index].style.width = getOrderHourLength(order.start_date, order.end_date).halfhours * 0.5 * boxWidth.hourDay + '%';
                                }else{
                                    blocks[index].style.width = getOrderHourLength(order.start_date, order.end_date).halfhours * 0.5 * boxWidth.hourDay + '%';
                                }
                            }else{
                                if(getOrderHourLength(order.start_date, order.end_date).endAtHalf){
                                    order.coverEnd = true;
                                    blocks[index].style.width = getOrderHourLength(order.start_date, order.end_date).halfhours * 0.5 * boxWidth.hourDay + '%';
                                }else{
                                    blocks[index].style.width = getOrderHourLength(order.start_date, order.end_date).halfhours * 0.5 * boxWidth.hourDay + '%';
                                }
                                blocks[index].style.left = getHoursToDayBlockPos(order.start_date, order.end_date).pos + '%';
                            }
                            blocks[index].classList.add('show');
                            ifOrderPassed(order.end_date) ? order.disabled = true : '';
                        })
                    }

                    var addDomForMember = function(){
                        var blocks = element.find('.pink-block');
                        _.each($scope.orders, function(order, index){
                            blocks[index].style.left =  order.pos * boxWidth.month + 0.3 + '%';
                            blocks[index].style.width = boxWidth.month - 0.6 + '%';
                            blocks[index].style.height = $scope.room.max === 0 ? '0px' : order.count * 1 / $scope.room.max * 45 + 'px';
                            blocks[index].classList.add('show');
                        })
                    };

                    var addDomForMess = function(){

                    };

                    var addDomForMonthToDay = function(){
                        var blocks = element.find('.cover');
                        _.each($scope.orders, function(order, index){
                            blocks[index].style.left = getHoursToDayBlockPos(order.start_date).pos + '%';
                            console.log(getHoursToDayBlockPos(order.start_date).pos)
                            blocks[index].style.width = getWidthForWeek(order.start_date, order.end_date) + '%';
                            console.log(getWidthForWeek(order.start_date, order.end_date))
                            blocks[index].classList.add('show');
                            ifOrderPassed(order.end_date) ? order.disabled = true : '';
                        })
                    };

                    var init = function(){
                        initDivider();
                        console.log('here')
                        if($scope.type == 'month'){
                            if($scope.tab === 'membership_card'){
                                addDomForMember();
                            }else{
                                if($scope.tab === 'desk' && $scope.method !== 'seat'){
                                    addDomForMess();
                                }else{
                                    addDomForMonth();
                                    fixHoverPos();
                                }
                            }
                        }else if($scope.type == 'hour'){
                            addDomForHour();
                            fixHoverPos();
                        }else if($scope.type == 'day'){
                            if($scope.tab === 'meeting' || $scope.tab === 'others'){
                                addDomForHourToDay();
                            }else if($scope.tab === 'office'){
                                addDomForMonthToDay();
                            }else{
                                addDomForDay();
                                fixHoverPos();
                            }
                        }
                    };

                    $scope.cancelOrder = function(id){
                        events.emit('confirm', {
                            title: '取消订单',
                            content: '是否确认取消该订单？订单取消后将不可恢复。',
                            onConfirm: function() {
                                DashboardService.cancelOrder(id).success(function(){
                                    noty('info','取消订单成功！');
                                    $rootScope.needRefresh = true;
                                }).error(function(){
                                    noty('error','取消订单失败！');
                                });
                            }
                        });
                    };

                    $scope.$watch('rooms', function(newValue, oldValue){
                        if(newValue && newValue.length > 0){
                            $timeout(function() {
                                init();
                            }, 300);
                        }
                    }, true)

                },
                templateUrl: features + '/dashboard/directive/dashDate.html'
            };
        };

        return ['$filter', '$rootScope', '$timeout', 'DashboardService', 'events', dir];

    });

})(define);
