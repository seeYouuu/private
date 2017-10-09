/**
 *  Defines the EventController controller
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the EventController class with RequireJS
     */
    define(['lodash', 'angular'], function(_, angular) {

        /**
         * @constructor
         */
        var EventController = function($rootScope, $sce, $scope, events, utils, EventService, CurrentAdminService, $popover, $filter, $translate, CONF, ImageUploaderService, SbCropImgService, ImageCropService) {
            $scope.pageFlag = EventService.getSearchParam('type') ? EventService.getSearchParam('type') : 'list';
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.PERMISSION_KEY = 'sales.platform.event';
            $scope.now = new Date();
            $scope.yesterday = angular.copy(new Date().setDate($scope.now.getDate() - 1));
            $scope.radio = {
                yes: true,
                no: false
            };
            $scope.approveUserNumber = 0;
            $scope.placeholder = {
                city: $translate.instant('CITY'),
                building: $translate.instant('BUILDING'),
                type: $translate.instant('TYPE'),
                status: $translate.instant('EVENT_STATUS')
            };
            $scope.createOptions = {
                name: '',
                attachments: [],
                description: '',
                dates: [
                    {
                        date: '',
                        times: [
                            {
                                start_time: '',
                                end_time: '',
                                description: ''
                            }
                        ]
                    }
                ],
                city_id: '',
                address: '',
                limit_number: '',
                publish_company: '',
                registration_start_date: '',
                registration_end_date: '',
                registration_method: 'offline',
                isCharge: true,
                price: 0,
                verify: false,
                forms: []
            };
            $scope.updateOptions = {};
            $scope.startEndDate = {};

            $scope.images = [
                {
                    isUploading: false
                },
                {
                    isUploading: false
                },
    
                {
                    isUploading: false
                },
                {
                    isUploading: false
                }
            ];

            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: 1,
                totalNum: 10
            };

            $scope.eventLists = [];
            $scope.userLists = [];
            $scope.userItem = {};
            $scope.filterOption = {
                city: '',
                building: '',
                room: '',
                status: '',
                eventStatus: ''
            };
            $scope.selectAll = {
                value: false
            };
            $scope.gallery = {
                width: 640,
                height: 420
            };
            $scope.status = [
                {name: '未处理', value: 'pending'},
                {name: '拒绝', value: 'rejected'},
                {name: '同意', value: 'accepted'}
            ];
            $scope.eventStatus = [
                {name: $translate.instant('PREHEATING'), value: 'preheating'},
                {name: $translate.instant('REGISTERING'), value: 'registering'},
                {name: $translate.instant('ONGOING'), value: 'ongoing'},
                {name: $translate.instant('END'), value: 'end'},
                {name: $translate.instant('SAVED'), value: 'saved'}
            ];
            $scope.refresh = false;
            $scope.imgType = '';
            $scope.cropedImgs = [];
            $scope.obj = {
                coords: [0, 0, 100, 100, 100, 100],
                thumbnail: false
            };
            $scope.cropOptions = {
                width: 640,
                height: 420,
                target: 'event',
                previewFlag: true
            }

            $scope.draftImageUploader = ImageUploaderService.createUncompressedImageUploader(
                'useless',
                function(item, response){
                    $scope.showCropView(response.download_link);
                }
            );

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var getCityList = function(){
                EventService.getCities().success(function(data){
                    $scope.cities = data;
                });
            };

            var getRoomList = function(){
                if($scope.filterOption.building){
                    EventService.getRooms({city: $scope.filterOption.city.id, building: $scope.filterOption.building.id, pageLimit: 10, pageIndex: 1}).success(function(data){
                        $scope.rooms = data.items;
                        if($scope.pageFlag === 'edit' && $scope.editOptions.room_id){
                            _.each(data.items, function(room){
                                if(room.id === $scope.editOptions.room_id){
                                    $scope.filterOption.room = room;
                                }
                            });
                        }
                    });
                }
            };

            var getEvent = function(){
                EventService.getEvent(EventService.getSearchParam('eventid')).success(function(data){
                    if ($scope.pageFlag === 'edit') {
                        $scope.editOptions = angular.copy(data);
                        $scope.images = _.map(
                            $scope.editOptions.attachments,
                            function (oneImage) {
                                return {
                                    download_link: oneImage.content,
                                    preview_link: oneImage.preview,
                                    filename: oneImage.filename,
                                    isUploading: false
                                }
                            }
                        );
                        while($scope.images.length < 4) {
                            $scope.images.push({
                                isUploading: false
                            });
                        }
                        _.each($scope.editOptions.dates, function(item){
                            item.date = formatDate(item.date, 'yyyy-MM-dd');
                        });
                        $scope.startEndDate.registration_start_date = formatDate($scope.editOptions.registration_start_date, 'yyyy-MM-dd');
                        $scope.startEndDate.registration_end_date = formatDate($scope.editOptions.registration_end_date, 'yyyy-MM-dd');
                        $scope.filterOption.city = $scope.editOptions.city;
                        $scope.dateFlag = formatDate(new Date(), 'yyyy-MM-dd') < formatDate($scope.editOptions.registration_start_date, 'yyyy-MM-dd')? true: false;
                    }else{
                        $scope.event = data;
                        $scope.event.arr = [];
                        _.each($scope.event.dates, function(item){
                            var temp = formatDate(item.date, 'yyyy-MM-dd');
                            _.each(item.times, function(time){
                                $scope.event.arr.push(temp + ' ' + formatDate(time.start_time, 'HH:mm') + ' - ' + formatDate(time.end_time, 'HH:mm') + ' ' + time.description);
                            });
                        });
                        $scope.event.r_description = $sce.trustAsHtml($scope.event.description.replace(/\n/g, '<br>'));
                    }
                });
            };

            var getEventList = function(){
                var params = {pageLimit: $scope.pageOptions.pageSize, pageIndex: $scope.pageOptions.pageIndex};
                EventService.getSearchParam('status') ? params.status = EventService.getSearchParam('status') : '';
                EventService.getEventList(params).success(function(data){
                    $scope.eventLists = data.items;
                    _.each($scope.eventLists, function(event){
                        if(event.is_saved){
                            event.status = 'saved';
                        }else{
                            if(formatDate(event.registration_start_date, 'yyyy-MM-dd HH:mm:ss') > formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss')){
                                event.status = 'preheating';
                            }else if(formatDate(event.registration_end_date, 'yyyy-MM-dd HH:mm:ss') > formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss') && formatDate(event.registration_start_date, 'yyyy-MM-dd HH:mm:ss') < formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss')){
                                event.status = 'registering';
                            }else if(formatDate(event.registration_end_date, 'yyyy-MM-dd HH:mm:ss') < formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss') && formatDate(event.event_start_date, 'yyyy-MM-dd HH:mm:ss') > formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss')){
                                event.status = 'registend';
                            }else if(formatDate(event.event_start_date, 'yyyy-MM-dd HH:mm:ss') < formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss') && formatDate(event.event_end_date, 'yyyy-MM-dd HH:mm:ss') > formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss')){
                                event.status = 'ongoing';
                            }else if(formatDate(event.event_end_date, 'yyyy-MM-dd HH:mm:ss') < formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss')){
                                event.status = 'end';
                            }
                        }
                        event.arr = [];
                        _.each(event.dates, function(item){
                            var temp = formatDate(item.date, 'yyyy-MM-dd');
                            _.each(item.times, function(time){
                                event.arr.push(temp + ' ' + formatDate(time.start_time, 'HH:mm') + ' - ' + formatDate(time.end_time, 'HH:mm') + ' ' + time.description);
                            });
                        });
                    });
                    $scope.pageOptions.totalNum = data.total_count;
                    $scope.refresh = false;
                });
            };

            var getUserDetail = function(){
                EventService.getRegistUser(EventService.getSearchParam('eventid'), EventService.getSearchParam('userid')).success(function(data){
                    $scope.userItem = data;
                    _.each($scope.userItem.forms, function(item){
                        if(Array.isArray(item.user_input)){
                            item.user_input = _.pluck(item.user_input, 'content').join(', ');
                        }
                    });
                });
            };

            var validNumber = function(param, info){
                var flag = true;
                var re = /^\+?[1-9][0-9]*$/;
                if(re.test(param)){
                    param = parseInt(param);
                }else{
                    noty('error', info);
                    flag = false;
                }
                return flag;
            };

            var validPrice = function(param, info){
                var flag = true;
                var re = /^\+?(?:[1-9]\d*(?:\.\d{1,2})?|0\.(?:\d[1-9]|[1-9]\d))$/;
                if(param > 0 || param != 0){
                    if(re.test(param)){
                        param = parseInt(param);
                    }else{
                        noty('error', info);
                        flag = false;
                    }
                }
                return flag;
            };

            var getRegistrationsList = function(){
                var params = {pageLimit: CONF.pageSize, pageIndex: $scope.pageOptions.pageIndex};
                if($scope.filterOption.status){
                    params.status = $scope.filterOption.status.value;
                }

                EventService.getRegistrations(EventService.getSearchParam('eventid'), params).success(function(data){
                    $scope.userLists = data.items;
                    _.each($scope.userLists, function(user){
                        user.selected = false;
                    });
                    $scope.pageOptions.totalNum = data.total_count;
                    $scope.approveUserNumber = data.custom_parameters.accepted_person_number;

                });
            };

            var getComments = function(){
                var params = {pageLimit: CONF.pageSize, pageIndex: $scope.pageOptions.pageIndex};
                EventService.getEventComments(EventService.getSearchParam('eventid'), params).success(function(data){
                    $scope.commentList = data.items;
                    _.each($scope.commentList, function(item){
                        item.avatar = CONF.file + '/person/' + item.author.user_id + '/avatar_small.jpg';
                    });
                    $scope.commentCount = data.total_count;
                    $scope.pageOptions.totalNum = data.total_count;
                });
            };

            var initEventStatus = function(){
                var tempVal = EventService.getSearchParam('status');
                _.each($scope.eventStatus, function(item){
                    if(tempVal && tempVal == item.value){
                        $scope.filterOption.eventStatus = {name: item.name, value: item.value};
                    }
                });
            };

            var getFileServer = function(){
                EventService.getFileServer({target: 'event'}).success(function(data){
                    $scope.uploadImgServer = data.file_server_domain + '/sales/admin';
                });
            };
            
            var init = function(){
                getCityList();
                $rootScope.crumbs = {first: '活动'};
                if($scope.pageFlag === 'list'){
                    initEventStatus();
                    getEventList();
                }else if($scope.pageFlag === 'eventdetail'){
                    getEvent();
                    $rootScope.crumbs.second = '活动详情';
                }else if($scope.pageFlag === 'edit'){
                    $rootScope.crumbs.second = '编辑活动';
                    getEvent();
                    getFileServer();
                }else if($scope.pageFlag === 'userlist'){
                    $rootScope.crumbs.second = '报名用户';
                    getRegistrationsList();
                    getEvent();
                }else if($scope.pageFlag === 'userdetail'){
                    $rootScope.crumbs.second = '用户详情';
                    getUserDetail();
                    getEvent();
                }else if($scope.pageFlag === 'comlist'){
                    $rootScope.crumbs.second = '评论';
                    getComments();
                    getEvent();
                }else if($scope.pageFlag === 'create'){
                    $rootScope.crumbs.second = '创建活动';
                    getFileServer();
                }
            };

            init();

            var initEdit = function(){
                $scope.updateOptions = angular.copy($scope.editOptions);
                if($scope.updateOptions.registration_method === 'online'){
                    _.each($scope.updateOptions.forms, function(item){
                        if(item.type === 'radio' || item.type === 'checkbox'){
                            var temp = [];
                            _.each(item.options, function(option){
                                if(option.content){
                                    temp.push(option);
                                }
                            });
                            item.options = temp;
                        }
                    });
                    $scope.createOptions.forms = _.filter($scope.createOptions.forms, function(item){
                        return item.title;
                    });
                }
            };

            var createValid = function(){
                if(!$scope.createOptions.name){
                    noty('error', '请输入活动名称！');
                    return false;
                }

                if(!$scope.createOptions.description){
                    noty('error', '请输入活动描述！');
                    return false;
                }

                if($scope.createOptions.dates.length > 0){
                    var flag = true;
                    _.each($scope.createOptions.dates, function(date){
                        _.each(date.times, function(time){
                            if(!time.start_time || !time.end_time || !date.date){
                                flag = false;
                            }
                        });
                    });
                    if(!flag){
                        noty('error', '请填写活动日期和活动时间段！');
                        return false;
                    }
                }

                if(!$scope.filterOption.city){
                    noty('error', '请选择城市！');
                    return false;
                }else{
                    $scope.createOptions.city_id = $scope.filterOption.city.id;
                }

                if(!$scope.createOptions.address){
                    noty('error', '请输入活动地址！');
                    return false;
                }

                if($scope.createOptions.limit_number){
                    if(!validNumber($scope.createOptions.limit_number, '人数上限需为数字！')) return false;
                }else{
                    noty('error', '人数上限不能为空');
                    return false;
                }

                if(!angular.isDate($scope.startEndDate.registration_start_date) || !angular.isDate($scope.startEndDate.registration_end_date)){
                    noty('error', '报名时间格式不对！');
                    return false;
                }else{
                    if($scope.startEndDate.registration_start_date){
                        $scope.createOptions.registration_start_date = formatDate($scope.startEndDate.registration_start_date, 'yyyy-MM-dd');
                    }

                    if($scope.startEndDate.registration_end_date){
                        $scope.createOptions.registration_end_date = formatDate($scope.startEndDate.registration_end_date, 'yyyy-MM-dd');
                    }
                }

                if(!$scope.createOptions.publish_company){
                    noty('error', '请输入发起公司！');
                    return false;
                }

                if($scope.createOptions.price === '' && $scope.createOptions.isCharge){
                    noty('error', '请输入收费金额！');
                    return false;
                }else if($scope.createOptions.isCharge && !validPrice($scope.createOptions.price,'请输入正确的收费金额！')){
                    return false;
                }

                if (!$scope.images[0].download_link) {
                    noty('error', $translate.instant('EMPTY_COVER_IMAGE'));
                    return false;
                }
                $scope.createOptions.attachments = _.map(
                    $scope.images,
                    function (oneImage) {
                        if (oneImage.download_link === undefined) {
                            return {
                                isUploading: false
                            }
                        }
                        return {
                            content: oneImage.download_link,
                            attachment_type: oneImage.content_type,
                            filename: oneImage.filename,
                            preview: oneImage.preview_link,
                            size: '0'
                        }
                    }
                );
                $scope.createOptions.attachments = _.filter(
                    $scope.createOptions.attachments,
                    function (oneImage) {
                        return oneImage.content !== undefined;
                    }
                )
            };

            var editValid = function(){
                if(!$scope.editOptions.name){
                    noty('error', '请输入活动名称！');
                    return false;
                }

                // validate images
                if (!$scope.images[0].download_link) {
                    noty('error', $translate.instant('EMPTY_COVER_IMAGE'));
                    return false;
                }

                $scope.updateOptions.attachments = _.map(
                    $scope.images,
                    function (oneImage) {
                        if (oneImage.download_link === undefined) {
                            return {
                                isUploading: false
                            }
                        }
                        return {
                            content: oneImage.download_link,
                            attachment_type: oneImage.content_type || 'image/jpg',
                            filename: oneImage.filename || 'filename',
                            preview: oneImage.preview_link,
                            size: '0'
                        }
                    }
                );

                $scope.updateOptions.attachments = _.filter(
                    $scope.updateOptions.attachments,
                    function (oneImage) {
                        return oneImage.content !== undefined;
                    }
                )

                if(!$scope.editOptions.description){
                    noty('error', '请输入活动描述！');
                    return false;
                }

                _.each($scope.updateOptions.dates, function(item){
                    if(item.date){
                        item.date = formatDate(item.date, 'yyyy-MM-dd');
                    }
                    _.each(item.times, function(time){
                        if(time.start_time){
                            time.start_time = formatDate(time.start_time, 'HH:mm');
                        }

                        if(time.end_time){
                            time.end_time = formatDate(time.end_time, 'HH:mm');
                        }
                    });
                });

                if(!$scope.filterOption.city){
                    noty('error', '请选择城市！');
                    return false;
                }else{
                    $scope.updateOptions.city_id = $scope.filterOption.city.id;
                }

                if(!$scope.updateOptions.address){
                    noty('error', '请输入活动的地址！');
                    return false;
                }

                if($scope.editOptions.limit_number){
                    if(!validNumber($scope.editOptions.limit_number, '人数上限需为数字！')) return false;
                }else{
                    noty('error', '人数上限不能为空');
                    return false;
                }
                
                if($scope.startEndDate.registration_start_date){
                    $scope.updateOptions.registration_start_date = formatDate($scope.startEndDate.registration_start_date, 'yyyy-MM-dd');
                }else{
                    noty('error', '请选择报名时间，时间需为日期格式！');
                    return false;
                }

                if($scope.startEndDate.registration_end_date){
                    $scope.updateOptions.registration_end_date = formatDate($scope.startEndDate.registration_end_date, 'yyyy-MM-dd');
                }else{
                    noty('error', '请选择报名时间，时间需为日期格式！');
                    return false;
                }

                if(!$scope.editOptions.publish_company){
                    noty('error', '请输入主办公司！');
                    return false;
                }

                if($scope.editOptions.is_charge && $scope.editOptions.price === '') {
                    noty('error', '请输入收费金额！');
                    return false;
                }

                if($scope.editOptions.is_charge && !validPrice($scope.editOptions.price)){
                    noty('error', '请输入正确的收费金额！');
                    return false;
                }

                if (!$scope.images[0].download_link) {
                    noty('error', $translate.instant('EMPTY_COVER_IMAGE'));
                    return false;
                }
            };

            var initCreate = function(){
                if($scope.createOptions.registration_method === 'online'){
                    _.each($scope.createOptions.forms, function(item){
                        if(item.type === 'radio' || item.type === 'checkbox'){
                            var temp = [];
                            _.each(item.options, function(option){
                                if(option.content){
                                    temp.push(option);
                                }
                            });
                            item.options = temp;
                        }
                    });
                    $scope.createOptions.forms = _.filter($scope.createOptions.forms, function(item){
                        return item.title;
                    });
                }

                _.each($scope.createOptions.dates, function(item){
                    if(item.date){
                        item.date = formatDate(item.date, 'yyyy-MM-dd');
                    }
                    _.each(item.times, function(time){
                        if(time.start_time){
                            time.start_time = formatDate(time.start_time, 'HH:mm');
                        }

                        if(time.end_time){
                            time.end_time = formatDate(time.end_time, 'HH:mm');
                        }
                    });
                });
                
                if($scope.filterOption.room){
                    $scope.createOptions.room_id = $scope.filterOption.room.id;
                }
            };

            var acceptUser = function(ids){
                var params = [
                    {
                        'op': 'add',
                        'path': '/status',
                        'value': 'accepted'
                    }
                ];

                EventService.verifyUsesr(params, {'id[]': ids}).success(function(){
                    noty('info', '同意操作成功！');
                    getRegistrationsList();
                });
            };

            var rejectUser = function(ids){
                var params = [
                    {
                        'op': 'add',
                        'path': '/status',
                        'value': 'rejected'
                    }
                ];
                EventService.verifyUsesr(params, {'id[]': ids}).success(function(){
                    noty('info', '拒绝操作成功！');
                    getRegistrationsList();
                });
            };

            var addEvent = function(){
                EventService.addEvent($scope.createOptions).success(function(){
                    noty('info', '创建活动成功！');
                    EventService.updateSearchParam('type', '');
                    EventService.updateSearchParam('pageIndex', '');
                }).error(function(data){
                    if(data.code === 400006){
                        noty('error', '活动开始时间不能大于结束时间！');
                    }else if(data.code === 400005 || data.code === 400004){
                        noty('error', '活动报名时间应该早于活动开始时间！');
                    }
                });
            };

            var editEvent = function(){
                EventService.editEvent(EventService.getSearchParam('eventid'),$scope.updateOptions).success(function(){
                    noty('info', '活动修改成功！');
                    // EventService.updateSearchParam('type', '');
                    window.history.back();
                    getEventList();
                }).error(function(data){
                    if(data.code === 400001){
                        noty('error', '活动报名开始后，不能被修改');
                    }else if(data.code === 400006){
                        noty('error', '活动开始时间不能大于结束时间！');
                    }
                });
            };

            $scope.showDeleteComment = function(item){
                $translate('DELETE_COMMENT_MSG', {name: item.payload}).then(function(message){
                    events.emit('confirm', {
                        title: $translate.instant('DELETE_COMMENT'),
                        content: message,
                        onConfirm: function() {
                            EventService.deleteComment(item.id).success(function(){
                                noty('info', '删除评论成功');
                                getComments();
                            }).error(function(){
                            });
                        }
                    });
                });
            };

            $scope.acceptOperation = function(item){
                if(item){
                    acceptUser([item.id]);
                }else{
                    var arr = _.pluck(_.filter($scope.userLists, 'selected', true ), 'id');
                    if(arr.length > 0){
                        acceptUser(arr)
                    }else{
                        noty('error', '请至少选择一个用户进行操作！');
                    }
                }
            };

            $scope.rejectOperation = function(item){
                if(item){
                    rejectUser([item.id]);
                }else{
                    var arr = _.pluck(_.filter($scope.userLists, 'selected', true ), 'id');
                    if(arr.length > 0){
                        rejectUser(arr)
                    }else{
                        noty('error', '请至少选择一个用户进行操作！');
                    }
                }
            };

            $scope.goPage = function(index){
                EventService.updateSearchParam('pageIndex', index);
                EventService.updateSearchParam('pageIndex', '');
            };

            $scope.seeCreate = function(){
                EventService.updateSearchParam('type', 'create');
                EventService.updateSearchParam('status', '');
            };

            $scope.seeEventEdit = function(item){
                EventService.updateSearchParam('pageIndex', '');
                EventService.updateSearchParam('status', '');
                EventService.updateSearchParam('type', 'edit');
                EventService.updateSearchParam('eventid', item.id);
            };

            $scope.back = function(){
                EventService.updateSearchParam('type', '');
                EventService.updateSearchParam('eventid', '');
            };

            $scope.seeEventDetail = function(item){
                EventService.updateSearchParam('type', 'eventdetail');
                EventService.updateSearchParam('pageIndex', '');
                EventService.updateSearchParam('eventid', item.id);
                EventService.updateSearchParam('status', '');
            };

            $scope.addEvent = function(flag){
                initCreate();
                $scope.createOptions.submit = flag;
                if (createValid() === false) {
                    return;
                }
                if(flag){
                    events.emit('confirm', {
                        title: '保存',
                        content: '是否确认发布?',
                        onConfirm: function() {
                            addEvent();
                        }
                    });
                }else{
                    addEvent();
                }
            };

            $scope.editEvent = function(flag){
                initEdit();
                if(editValid() === false){
                    return;
                }
                $scope.updateOptions.submit = flag;
                $scope.updateOptions.isCharge = $scope.updateOptions.is_charge;
                delete $scope.updateOptions.comments_count;
                delete $scope.updateOptions.is_charge;
                delete $scope.updateOptions.city;
                delete $scope.updateOptions.building;
                delete $scope.updateOptions.creation_date;
                delete $scope.updateOptions.registration_method
                delete $scope.updateOptions.verify;
                delete $scope.updateOptions.is_saved;
                delete $scope.updateOptions.id;
                delete $scope.updateOptions.visible;
                
                if(flag){
                    events.emit('confirm', {
                        title: '保存',
                        content: '是否确认发布?',
                        onConfirm: function() {
                            editEvent();
                        }
                    });
                }else{
                    editEvent();
                }
            };

            $scope.changeEventStatus = function(item){
                var vVal = item.visible;
                var params = [
                    {
                        'op': 'add',
                        'path': '/visible',
                        'value': !vVal
                    }
                ];
                EventService.setEventStatus(item.id,params).success(function(){
                    if (vVal) {
                        noty('info','下架成功');
                    }else{
                        noty('info','上架成功');
                    }
                    getEventList();
                });
            }

            $scope.showStatusConfirm = function(item) {
                $translate('DELETE_EVENT_MSG', {name: item.name}).then(function(message){
                    events.emit('confirm', {
                        title: $translate.instant('DELETE_EVENT'),
                        content: message,
                        onConfirm: function() {
                            EventService.deleteEvent(item.id).success(function(){
                                noty('info', $translate.instant('DELETE_EVENT_SUCCESS'));
                                getEventList();
                            }).error(function(data){
                                if(data.code === 400002){
                                    noty('error', '活动报名开始后，不能被删除');
                                }else{
                                    noty('error', $translate.instant('DELETE_EVENT_FAILURE'));
                                }
                            });
                        }
                    });
                });
            };

            $scope.showUserList = function(item){
                EventService.updateSearchParam('type', 'userlist');
                EventService.updateSearchParam('eventid', item.id);
            };

            $scope.showComList = function(item){
                EventService.updateSearchParam('type', 'comlist');
                EventService.updateSearchParam('eventid', item.id);
            };

            $scope.seeUserDetail = function(item){
                EventService.updateSearchParam('type', 'userdetail');
                EventService.updateSearchParam('userid', item.id);
            };

            $scope.seeUsers = function(){
                EventService.updateSearchParam('type', 'userlist');
            };

            $scope.addTime = function(item){
                item.push({start_time: '', end_time: '', description: '' });
            };

            $scope.addDate = function(date){
                date.push({
                    date: '',
                    times: [{start_time: '', end_time: '', description: '' }]
                });
            };

            $scope.addItem = function(type){
                if($scope.pageFlag === 'edit'){
                    if(type === 'radio' || type === 'checkbox'){
                        $scope.editOptions['forms'].push({title: '', type: type, options: [
                            {content: ''},
                            {content: ''}
                        ]});
                    }else{
                        $scope.editOptions['forms'].push({title: '', type: type});
                    }
                }else{
                    if(type === 'radio' || type === 'checkbox'){
                        $scope.createOptions['forms'].push({title: '', type: type, options: [
                            {content: ''},
                            {content: ''}
                        ]});
                    }else{
                        $scope.createOptions['forms'].push({title: '', type: type});
                    }
                }
                
            };

            $scope.removeItem = function($index){
                if($scope.pageFlag === 'edit'){
                    $scope.editOptions['forms'].splice($index, 1);
                }else{
                    $scope.createOptions['forms'].splice($index, 1);
                }
            }

            $scope.removeOption =function(options, index){
                options.splice(index, 1);
            };

            $scope.addOptions = function(item){
                item.options.push({content: ''});
            };

            $scope.showConfirm = function(item) {
                $translate('DELETE_EVENT_MSG', {name: item.name}).then(function(message){
                    events.emit('confirm', {
                        title: $translate.instant('DELETE_EVENT'),
                        content: message,
                        onConfirm: function() {
                            EventService.deleteEvent(item.id).success(function(){
                                noty('info', $translate.instant('DELETE_EVENT_SUCCESS'));
                                getEventList();
                            }).error(function(data){
                                if(data.code === 400002){
                                    noty('error', '活动报名开始后，不能被删除');
                                }else{
                                    noty('error', $translate.instant('DELETE_EVENT_FAILURE'));
                                }
                            });
                        }
                    });
                });
            };

            $scope.selectAllUser = function(){
                if($scope.selectAll.value === true){
                    _.each($scope.userLists, function(item){
                        if(item.status === 'pending'){
                            item.selected = true;
                        }
                    });
                }else{
                    _.each($scope.userLists, function(item){
                        if(item.status === 'pending'){
                            item.selected = false;
                        }
                    });
                }
            };

            $scope.setImgType = function(type) {
                $scope.imgType = type;
            };

            $scope.saveEventImage = function($hide){
                SbCropImgService.cropImage($scope.selectedCropImgUrl, $scope.obj.coords, $scope.cropOptions, $scope.cropedImgs);
                $hide();
            };

            $scope.deleteItem = function(data, index){
               data[index] = {};
            };

            $scope.showCropView = function(url){
                $scope.selectedCropImgUrl = url;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'eventDialogTpl'
                });
            };

            $scope.$watch('filterOption.eventStatus', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(!$scope.refresh){
                    newValue ? EventService.updateSearchParam('status', newValue.value) : EventService.updateSearchParam('status', '');
                }
            }, true);

            $scope.$watch('filterOption.status', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                getRegistrationsList();
            }, true);

            $scope.$watch('filterOption.building', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                $scope.filterOption.room = '';
                getRoomList();
            }, true);

            $scope.$watch('cropedImgs', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.imgType == 'cover') {
                    $scope.images[0] = $scope.cropedImgs[0];
                }else {
                    $scope.images[parseInt($scope.imgType)] = $scope.cropedImgs[0];
                }
            }, true);

            events.on(
                'refreshevent',
                function() {
                },
                true
            );

            $scope.$on('$destroy', function() {});
        };

        return ['$rootScope', '$sce', '$scope', 'events', 'utils', 'EventService', 'CurrentAdminService', '$popover', '$filter', '$translate', 'CONF', 'ImageUploaderService', 'SbCropImgService', 'ImageCropService', EventController];

    });

})(define);
