/**
 *  Defines the AdminController controller
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';
    /**
     * Register the AdminController class with RequireJS
     */
    define(['lodash', 'angular'], function(_, angular) {

        /**
         * @constructor
         */
        var SpaceController = function($rootScope, $scope, SpaceService, events, CONF, ImageUploaderService, CurrentAdminService, $translate, GalleryUploadImage, $sce, $filter, utils, FilterStorageService, $timeout, $location, $cookies, SbCropImgService) {
            $rootScope.selectDropdown = false;
            $scope.pageType = SpaceService.getSearchParam('ptype') ? SpaceService.getSearchParam('ptype') : 'list';
            $scope.roomType = SpaceService.getSearchParam('roomType') ? SpaceService.getSearchParam('roomType') : '';
            $scope.productType = SpaceService.getSearchParam('productType') ? SpaceService.getSearchParam('productType') : '';
            $scope.currentRentType = SpaceService.getSearchParam('renttype') ? SpaceService.getSearchParam('renttype') : '';
            $scope.currentAdmin = CurrentAdminService.getStorage().currentAdmin;
            $scope.currentFilter = {};
            $scope.now = new Date();
            $scope.showItem = false;
            $scope.getCoordinatesUrl = CONF.getCoordinatesUrl;
            $scope.dialogType = '';
            $scope.operateMore = false;
            $scope.spaceDetailTab = 1;
            $scope.userOptions = {};
            $scope.productItem = {};
            $scope.typeTagDesc = {};
            $scope.communitiyList = '';
            $scope.PERMISSION_PREORDER_KEY = 'sales.building.order.preorder';
            $scope.PERMISSION_RESERVE_KEY = 'sales.building.order.reserve';
            $scope.PERMISSION_ADD_COMMUNITY_KEY = 'sales.platform.building';
            $scope.PERMISSION_UPDATE_COMMUNITY_KEY = 'sales.building.building';
            $scope.PERMISSION_ROOM_KEY = 'sales.building.room';
            $scope.PERMISSION_PRODUCT_KEY = 'sales.building.product';
            $scope.PERMISSION_LEASES_KEY = 'sales.building.long_term_lease';
            $scope.PERMISSION_APPOINTMENT_KEY = 'sales.building.long_term_appointment';
            $scope.PERMISSION_SPACE_ORDER_KEY = 'sales.building.order';

            $scope.clock = GalleryUploadImage.getClockList();
            $scope.statusOptions = GalleryUploadImage.getStatusDesc();
            $scope.selectedProFilter = [];
            $scope.selectedStatus = '';
            $scope.selectedSeat = '';
            $scope.search = {key: ''};
            $scope.productFilters = GalleryUploadImage.getProductFilters();
            $scope.agreementStatus = GalleryUploadImage.getAgreementStatusDesc();
            $scope.unitDesc = GalleryUploadImage.getUnitDesc();
            $scope.rentDesc = GalleryUploadImage.getRentDesc();
            $scope.leasingTypes = GalleryUploadImage.getLeasingTypes($scope.currentRentType);
            $scope.today = new Date();
            $scope.today.setDate($scope.today.getDate() - 1);
            $scope.pageOptions = {
                pageSize: CONF.pageSize,
                pageIndex: SpaceService.getSearchParam('pageIndex') ? parseInt(SpaceService.getSearchParam('pageIndex')) : 1,
                totalNum: 0
            };
            $scope.roomGallery = {
                width: 640,
                height: 465
            };
            $scope.logoGallery = {
                width: 100,
                height: 100
            };
            $scope.calendarOptions = {
                date: new Date(),
                year: new Date()
            };
            $scope.roomImages = {
                currentIndex: 0
            };
            
            $scope.editOptions = {
                room: {}
            };
            $scope.users = {
                list: [],
                query: {},
                select: {}
            };
            $scope.menuState = {
                show: false,
                input_visb: false,
                origin_price: false
            };
            $scope.communityDetail = {};
            $scope.communityOptions = {};
            $scope.uploadImgServer = CONF.api + 'plugins/fileServer/fileservice/sales/admin';
            $scope.current = {
                step: 1,
                originStep: 1,
                prev: false
            };
            $scope.imageUploader = {};
            $scope.gallery = {
                building: []
            };
            $scope.suppliesList = [];
            $scope.serviceList = [];
            $scope.roomCreateoptions = {
                number: ''
            };
            $scope.deskNums = [];
            $scope.roomUpdateOptions = [];
            $scope.roomPics = [];
            $scope.selectedRoomPics = [];
            $scope.cropedRoomPic = [];
            $scope.roomMainPic = {};
            $scope.currentRoomType = '';
            $scope.floors = '';
            $scope.doorLists = [];
            $scope.managerFloors = [];
            $scope.managerPhones = [];
            $scope.orderEmail = [];
            $scope.orderPhones = [];
            $scope.form = {
                coverImage: {},
                logoImage: []
            };
            $scope.bookDatas = {
                meeting: [],
                office: [],
                flexible: [],
                fixed: []
            };
            $scope.search.admins = [];
            $scope.roomTypeObject = {};
            $scope.selectedCommunity = {};
            $scope.selectedCommunity.id = SpaceService.getSearchParam('communityId');
            $scope.pageOptions = {
                pageSize: parseInt(CONF.pageSize),
                pageIndex: 1,
                totalNum: 0
            };
            $scope.leftMenuScrollTop = 0;
            $scope.listScrollTop = 0;
            $scope.deleteRoomTypeImgs = [];
            $scope.hourRentFlag = false;
            $scope.remove_dates = {}

            var initParams = function(){
                $scope.hourOrderParam = {
                    start_date: '',
                    discount_price: '',
                    times: {
                        start: '',
                        end: ''
                    }
                };
                $scope.dayOrderParam = {
                    start_date: '',
                    discount_price: '',
                    end_date: ''
                };
                $scope.weekOrderParam = {
                    start_date: '',
                    discount_price: '',
                    end_date: '',
                    rent_period: ''
                };
                $scope.monthOrderParam = {
                    start_date: '',
                    discount_price: '',
                    end_date: '',
                    rent_period: ''
                };
            };

            initParams();

            //add for tinymce start;
            var editorInstance; 
            var onContentImageUploaded = function (item, response) {
                editorInstance.editorManager.activeEditor.insertContent(
                    '<img src="' + response.download_link +'">'
                );
            };
            $scope.contentImageUploader = ImageUploaderService.createUncompressedImageUploader(
                'building',
                onContentImageUploaded
            );
            $scope.tinymceOptions = GalleryUploadImage.getTinymceOptions(editorInstance);
            $scope.tinymceOptions.setup = function(editor){
                editorInstance = editor;
            }
            //add for tinymce end;

            $scope.stepBoxs = GalleryUploadImage.getSteps();
            $scope.unitList = GalleryUploadImage.getUnitList();
            $scope.rentLimits = GalleryUploadImage.getRentLimits();
            $scope.filterOptions = {
                unit: {
                    name: '小时'
                }
            };
            $scope.communitiyList = '';
            $scope.spaceItem = {};
            $scope.newRoom = SpaceService.getSearchParam('new') ? SpaceService.getSearchParam('new') : '';
            $scope.appointmentOrderStatus = SpaceService.getAppointmentStatusDesc();
            $scope.roomTypeDesc = {};
            $scope.selectedAdmins = [];
            $scope.obj = {
                coords: [0, 0, 100, 100, 100, 100],
                thumbnail: false
            };
            $scope.cropOptions = {
                target: 'room',
                width: 640,
                height: 465,
                previewFlag: true
            };

            $scope.imageUploader.community = ImageUploaderService.createUncompressedImageUploader(
                'building',
                function(item, response){
                    var temp = _.pick(response, 'filename');
                    temp.content = response.download_link;
                    temp.attachment_type = response.content_type;
                    temp.size = 0;
                    $scope.pageType !== 'addCommunity' ? temp.building_id = SpaceService.getSearchParam('communityId') : '';
                    temp.room_type = 'office';
                    $scope.pageType === 'communityImages' ? $scope.communityImages.unshift(temp) : '';
                    if($scope.pageType !== 'addCommunity' || $scope.pageType !== 'editCommunity') {
                        $scope.dialogType = 'add-main-pic';
                    }
                    if($scope.pageType !== 'addCommunity') {
                        SpaceService.uploadCommunityImage(temp).success(function(){
                            noty('info', '社区图片上传成功！');
                        });
                    }else{
                        $scope.showCropView(temp);
                    }
                }
            );

            $scope.imageUploader.communityLogo = ImageUploaderService.createUncompressedImageUploader(
                'building',
                function(item, response){
                    var temp = _.pick(response, 'filename');
                    temp.content = response.download_link;
                    temp.attachment_type = response.content_type;
                    temp.size = 0;
                    temp.room_type = 'office';
                    $scope.dialogType = 'add-logo-pic';
                    $scope.showCropView(temp);
                }
            );

            var formatDate = function(date, format){
                return $filter('date')(date, format);
            };

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg
                });
            };

            var testText = function(val){
                var reg = new RegExp('[\\u4E00-\\u9FFF]+','g');
                return reg.test(val);
            };

            var getPriceRange = function(arr){
                var prices = _.without(_.pluck(arr, 'base_price'), undefined);
                var min_price = $filter('currency')(prices.length !== 0 ? _.min(prices) : 0, '');
                var max_price = $filter('currency')(prices.length !== 0 ? _.max(prices) : 0, '');
                if(max_price == min_price){
                    return min_price;
                }else{
                    return min_price + ' - ' + max_price;
                }
            };

            /***** for community *****/
            var getRegions = function(parent, flag){
                var params = {
                    parent: parent
                }
                SpaceService.getRegionList(params).success(function(data){
                    if(flag === 'province'){
                        $scope.provinces = data;
                    }else if(flag === 'city'){
                        $scope.cities = data;
                    }else if(flag === 'district'){
                        $scope.districts = data;
                    }else{
                        $scope.countries = data;
                        $scope.countries.push({name: '国际热门城市', value: 'international'}, {name: '国内热门城市', value: 'internal'});
                    }
                });
            };

            var getHotCities = function(type) {
                var params = {type: type};
                SpaceService.getHotCities(params).success(function(data) {
                    $scope.cities = data;
                });
            };

            var getCommunities = function(){
                SpaceService.getCommunities().success(function(data){
                    $scope.communitiyList = data;
                    _.each($scope.communitiyList.using, function(item){
                        item.type = 'using';
                    });
                    _.each($scope.communitiyList.invisible, function(item){
                        item.type = 'invisible';
                    });
                    _.each($scope.communitiyList.pending, function(item){
                        item.type = 'pending';
                    });
                    _.each($scope.communitiyList.banned, function(item){
                        item.type = 'banned';
                    });
                    var temp ;
                    if($scope.currentFilter && $scope.currentFilter.communityId){
                        temp = _.filter($scope.communitiyList.using.concat($scope.communitiyList.pending, $scope.communitiyList.banned, $scope.communitiyList.invisible), function(item){
                            return item.id == $scope.currentFilter.communityId;
                        })[0];
                    }else{
                        temp = $scope.communitiyList.using[0] || $scope.communitiyList.pending[0] || $scope.communitiyList.banned[0] || $scope.communitiyList.invisible[0];
                    }
                    $timeout(function() {
                        events.emit('spaceMenu');
                    }, 500);
                    $scope.switchCommunity(temp);
                });
            };

            var getServiceList = function(){
                SpaceService.getServiceList().success(function(data){
                    $scope.serviceList = data;
                    if($scope.pageType === 'editCommunity'){
                        _.each($scope.serviceList, function(item){
                            item.selected = $scope.tempService[item.id] ? true : false;
                        });
                    }
                });
            };

            var getRoomTypeAttachments = function(id){
                var params = {};
                $scope.pageType == 'addCommunity' ? params = {} : params = {building: id};
                SpaceService.getCommunityRoomAttachments(params).success(function(data){
                    $scope.communityImages = data;
                });
            };

            var getMeetingUsage = function(){
                SpaceService.getMeetingUsage($scope.roomDetail.id, {day: formatDate($scope.calendarOptions.date, 'yyyy-MM-dd')}).success(function(data){
                    _.each(data, function(item){
                        item.user.avatar = CONF.file + '/person/' + item.user.id + '/avatar_small.jpg';
                        if(item.appointed_user){
                            item.appointed_user.avatar = CONF.file + '/person/' + item.appointed_user.id + '/avatar_small.jpg';
                        }
                    });
                    $scope.bookDatas.meeting = data;
                });
            };

            var getOfficeUsage = function(){
                SpaceService.getOfficeUsage($scope.roomDetail.id, {year: formatDate($scope.calendarOptions.year, 'yyyy')}).success(function(data){
                    _.each(data, function(item){
                        item.user.avatar = CONF.file + '/person/' + item.user.id + '/avatar_small.jpg';
                        if(item.invited_people && item.invited_people.length >0){
                            var arr = [];
                            _.each(item.invited_people, function(user){
                                arr.push(user.user_id);
                            });
                            SpaceService.getUsers({'id[]': arr}).success(function(user_data){
                                _.each(user_data, function(u){
                                    u.avatar = CONF.file + '/person/' + u.id + '/avatar_small.jpg';
                                });
                                item.invited_people = user_data;
                            });
                        }
                    });
                    $scope.bookDatas.office = data;
                });
            };

            var getLongtermUsage = function(){
                SpaceService.getLongtermUsage($scope.roomDetail.id, {year: formatDate($scope.calendarOptions.year, 'yyyy')}).success(function(data){
                    _.each(data, function(item){
                        var arr = [item.supervisor];
                        if(item.invited_people && item.invited_people.length > 0){
                            _.each(item.invited_people, function(user){
                                arr.push(user.id);
                            });
                        }
                        SpaceService.getUsers({'id[]': arr}).success(function(user_data){
                            _.each(user_data, function(u){
                                u.avatar = CONF.file + '/person/' + u.id + '/avatar_small.jpg';
                            });
                            item.invited_people = _.filter(user_data, function(user){return user.id != item.supervisor});
                            item.user = _.filter(user_data, function(user){return user.id == item.supervisor})[0];
                        });
                    });
                    $scope.bookDatas.office = data;
                });
            };

            var getFixedUsage = function(){
                SpaceService.getFixedUsage($scope.roomDetail.id, {start: formatDate($scope.calendarOptions.year, 'yyyy') + '-01-01', end: formatDate($scope.calendarOptions.year, 'yyyy') + '-12-31', seat: $scope.selectedSeat ? $scope.selectedSeat : $scope.roomDetail.fixed[0].id}).success(function(data){
                    _.each(data, function(item){
                        item.user.avatar = CONF.file + '/person/' + item.user.id + '/avatar_small.jpg';
                        if(item.invited_people && item.invited_people.length >0){
                            var arr = [];
                            _.each(item.invited_people, function(user){
                                arr.push(user.user_id);
                            });
                            SpaceService.getUsers({'id[]': arr}).success(function(user_data){
                                _.each(user_data, function(u){
                                    u.avatar = CONF.file + '/person/' + u.id + '/avatar_small.jpg';
                                });
                                item.invited_people = user_data;
                            });
                        }
                        if(item.appointed_user){
                            item.appointed_user.avatar = CONF.file + '/person/' + item.appointed_user.id + '/avatar_small.jpg';
                        }
                    });
                    $scope.bookDatas.fixed = data;
                });
            }

            var getFlexibleUsage = function(){
                SpaceService.getFlexibleUsage($scope.roomDetail.id, {start: formatDate($scope.calendarOptions.start, 'yyyy-MM-dd'), end: formatDate($scope.calendarOptions.end, 'yyyy-MM-dd')}).success(function(data){
                    $scope.bookDatas.flexible = data;
                    _.each(data, function(item){
                        item.start = new Date(item.date);
                        item.start.setHours(8);
                        item.start = item.start.getTime();
                        item.end = new Date(item.end_date).getTime();
                        if(item.appointed_user){
                            item.appointed_user.avatar = CONF.file + '/person/' + item.appointed_user.id + '/avatar_small.jpg';
                        }
                        item.user.avatar = CONF.file + '/person/' + item.user.id + '/avatar_small.jpg';
                    });
                });
            }

            var getCommunityDetail = function(){
                SpaceService.getCommunityDetail(SpaceService.getSearchParam('communityId')).success(function(data){
                    // getRoomTypeAttachments(data.id);
                    $scope.remove_dates = data.remove_dates ? data.remove_dates : {};
                    if($scope.pageType === 'editCommunity'){
                        $scope.selectedCommunity = data;
                        $scope.communityOptions = _.pick(data, 'address', 'avatar', 'business_hour', 'building_company', 'postal_code', 'community_manager_name', 'detail', 'name', 'lat', 'lng', 'server', 'lessor_name', 'lessor_address', 'lessor_contact', 'lessor_phone', 'lessor_email', 'lessor_bank_account_name', 'lessor_bank_account_number', 'lessor_bank_name', 'lease_remarks');
                        $scope.filterOptions.property = data.property_type;
                        $scope.filterOptions.country = data.country;
                        $scope.filterOptions.province = data.province;
                        $scope.filterOptions.city = data.city;
                        $scope.filterOptions.district = data.district;
                        $scope.managerFloors = data.floors;
                        _.each($scope.managerFloors, function(item){
                            item.original = item.floor_number;
                        });
                        $scope.managerPhones = data.phones;
                        $scope.managerPhonesOrigin = _.pluck(data.phones, 'id');
                        _.each($scope.managerPhones, function(item){
                            item.original = parseInt(item.phone);
                            item.phone_number = parseInt(item.phone);
                        });
                        $scope.orderEmail = _.map(data.email? data.email.split(',') : '',function(item){
                            return {email: item};
                        });
                        $scope.orderPhones = _.map(data.order_remind_phones ? data.order_remind_phones.split(','): '', function(item){
                            return {phone: item};
                        });
                        // $scope.form.logoImage.download_link = data.avatar;
                        $scope.form.logoImage.push({download_link: data.avatar});
                        _.each(data.building_attachments, function(item){
                            item.content_type = item.attachment_type;
                            item.preview_link = item.preview;
                            item.download_link = item.content;
                        });
                        $scope.form.coverImage = data.building_attachments[0];
                        $scope.gallery.building = data.building_attachments;
                        //$scope.gallery.building.splice(0, 1);
                        $scope.tempService = {};
                        _.each(data.building_services, function(item){
                            $scope.tempService[item.service.id] = true;
                        });
                        getServiceList();
                        getAllAdmins(data.customer_services);
                    }else if($scope.pageType === 'communityImages'){
                        $rootScope.crumbs.second = data.name;
                        $scope.communityDetail = data;
                    }else{
                        $scope.communityDetail = data;
                        $scope.gallery.building = $scope.communityDetail.building_attachments;
                        $scope.selectedCommunity = data;
                        $scope.communityDetail.detail = $sce.trustAsHtml($scope.communityDetail.detail);
                        var arr = [];
                        arr = _.map(data.customer_services, function(item){
                            return item.user_id;
                        });
                        arr.length > 0 ? getUsers({'id[]': arr}): '';
                        (!$scope.communityDetail.visible && $scope.communityDetail.status == 'accept') ? $scope.communityDetail.status = 'invisible' : '';
                    }
                });
            };

            var getRoomTypeTags = function(typeId){
                var params = {type: typeId};
                SpaceService.getTypeTags(params).success(function(data){
                    $scope.roomTypeTags = data;
                    _.each(data, function(item) {
                        $scope.typeTagDesc[item.tag_key] = item.tag_name;
                    })
                    if($scope.pageType === 'editRoom' || $scope.pageType === 'copyRoom' ){
                        $scope.selectedTag = _.filter($scope.roomTypeTags, 'tag_key', $scope.roomDetail.type_tag)[0];
                        $scope.selectedTag.selected = true;
                    }
                });
            };

            /***** for space *****/
            var getSupplementaryList = function(){
                SpaceService.getSupplementaryList().success(function(data){
                    $scope.supplementaryList = angular.copy(data);
                });
            };

            var getComSpaceList = function(selectedFlag){
                var params = {};
                params.pageIndex = $scope.pageOptions.pageIndex;
                params.pageLimit = 100;
                if($scope.search.query){
                    params.query = $scope.search.query
                }else{
                    params.building = $scope.selectedCommunity.id;
                    if($scope.selectedRoomType && $scope.selectedRoomType.type == 'recommend') {
                        params['room_types[]'] = _.without(_.pluck($scope.selectedCommunity.roomTypes, 'type'), 'recommend');
                    }else{
                        params['room_types[]'] = $scope.selectedRoomType ? $scope.selectedRoomType.type : _.without(_.pluck($scope.selectedCommunity.roomTypes, 'type'), 'recommend');
                    }
                }
                SpaceService.getComSpaceList(params).success(function(data){
                    $scope.comSpaceList = data;
                    _.each($scope.comSpaceList, function(item){
                        item.has_rent = item.product.id ? true : false;
                        if(item.type == 'desk' && item.product.seats && item.product.seats.length > 0){
                            if(item.has_rent){
                                item.base_price = getPriceRange(item.product.seats);
                            }
                        }
                    });
                    var spaceList = [];
                    _.each(_.groupBy($scope.comSpaceList, function(item){return item.building_id}), function(key, value){
                        spaceList.push({'name': key[0].building_name, 'space': key});
                    });
                    $scope.comSpaceList = spaceList;

                    if(!selectedFlag){
                        $timeout(function() {
                            events.emit('spaceList');
                        }, 500);
                    }
                });
            };

            var getRecommendList = function() {
                var params = {};
                params.pageIndex = $scope.pageOptions.pageIndex;
                params.pageLimit = 100;
                params.building = $scope.selectedCommunity.id;
                SpaceService.getRecommendList(params).success(function(data) {
                    $scope.recommendList = data.items;
                    $scope.recommendCount = data.total_count;
                    if($scope.selectedRoomType.type == 'recommend') {
                        _.each($scope.recommendList, function(item){
                            item.has_rent = item.product.id ? true : false;
                            if(item.type == 'desk' && item.product.seats && item.product.seats.length > 0){
                                if(item.has_rent){
                                    item.base_price = getPriceRange(item.product.seats);
                                }
                            }
                        });
                        $scope.comSpaceList = [{name: '', space: $scope.recommendList}];
                    }
                });
            };

            var getDateInfo = function(item, type, start_date, end_date){
                $scope.dateInfo =[];
                var params = {};
                if(item.unit_price == 'hour'){
                    params.rent_date = start_date ? formatDate(start_date, 'yyyy-MM-dd') : formatDate($scope.calendarOptions.start, 'yyyy-MM-dd');
                }else if(item.unit_price == 'day'){
                    params.month_start = start_date ? formatDate(start_date, 'yyyy-MM-dd') : formatDate($scope.calendarOptions.start, 'yyyy-MM-dd');
                    params.month_end = end_date ? formatDate(end_date, 'yyyy-MM-dd') : formatDate($scope.calendarOptions.end, 'yyyy-MM-dd');
                }else if(item.room.type == 'fixed'){
                    params.seat_id = $scope.selectedSeat;
                }
                SpaceService.getDateInfo(item.id, params).success(function(data){
                    $scope.dateInfo = data;
                });
                $scope.calendarOptions.id = item.id;
                $scope.calendarOptions.type= type;
            };

            var getRentPeriod = function(type){
                var start, end;
                if(type === 'hour'){
                    if($scope.hourOrderParam.times.start === '' || $scope.hourOrderParam.times.end === ''){
                        return;
                    }
                    start = $scope.hourOrderParam.times.start.name.split(':');
                    end = $scope.hourOrderParam.times.end.name.split(':');
                    $scope.hourOrderParam.rent_period = ((parseInt(end[0]*60) + parseInt(end[1]))-(parseInt(start[0]*60) + parseInt(start[1]))) / 60;
                }else if(type === 'day'){
                    if($scope.dayOrderParam.start_date === '' || $scope.dayOrderParam.end_date === ''){
                        return;
                    }
                    start = new Date($scope.dayOrderParam.start_date);
                    end = new Date(formatDate($scope.dayOrderParam.end_date,'yyyy-MM-dd'));
                    $scope.dayOrderParam.rent_period = Math.round(Math.abs(end - start) / 1000 / 60 / 60 /24)+1;
                }
            };

            var showReserveDlg = function(){
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'reserveDlgTpl'
                });
            };

            var getUsers = function(params){
                SpaceService.getUsers(params).success(function(data){
                    _.each(data, function(item){
                        item.avatar = CONF.file + '/person/' + item.id + '/avatar_small.jpg';
                        $scope.userOptions[item.id] = item;
                    });
                });
            };

            var getSpaceOrders = function(){
                var params = [];
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                params.room = SpaceService.getSearchParam('roomId');
                SpaceService.getSpaceOrders(params).success(function(data){
                    $scope.spaceList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each($scope.spaceList, function(item){
                        if(formatDate(item.start_date, 'yyyy-MM-dd HH:mm:ss') > formatDate($scope.now, 'yyyy-MM-dd HH:mm:ss')){
                            item.cancellable = true;
                        }
                        if(item.product_info){
                            item.product_info = JSON.parse(item.product_info);
                            if(item.product_info.room.type_tag !== 'dedicated_desk' && !item.product_info.base_price){
                                item.product_info.order.base_price = _.find(item.product_info.room.leasing_set, function(set){return set.unit_price === item.product_info.order.unit_price}).base_price;
                            }
                        }
                        arr.push(item.user_id);
                        arr.push(item.payment_user_id);
                        item.appointed ? arr.push(item.appointed) : '';
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                });
            };

            var setBasePrice = function(item){
                _.each(item.leasing_sets, function(set){
                    set.input_visb = false;
                    set.origin_price = false;
                    if(set.unit_price === 'hour'){
                        $scope.hourOrderParam.base_price = set.base_price;
                        $scope.hourOrderParam.origin_price = set.origin_price;
                    }else if(set.unit_price === 'day'){
                        $scope.dayOrderParam.base_price = set.base_price;
                        $scope.hourOrderParam.origin_price = set.origin_price;
                    }else if(set.unit_price === 'month'){
                        $scope.monthOrderParam.base_price = set.base_price;
                        $scope.hourOrderParam.origin_price = set.origin_price;
                    }else if(set.unit_price === 'week'){
                        $scope.weekOrderParam.base_price = set.base_price;
                        $scope.hourOrderParam.origin_price = set.origin_price;
                    }
                });
            };

            var getProductDetail = function(id){
                SpaceService.getProductDetail(id).success(function(data){
                    $scope.productItem = data;
                    _.each($scope.productItem.room.office_supplies, function(item){
                        item.desc = item.supply.name + ' × ' + item.quantity;
                    });
                    setBasePrice($scope.productItem);
                    $scope.productItem.supplies = _.pluck($scope.productItem.room.office_supplies, 'desc').toString();
                    $scope.productItem.url = CONF.productURL + '&productid='+ $scope.productItem.id + '&btype=' + data.type;
                    $scope.productItem.earliest_rent_date = formatDate($scope.productItem.earliest_rent_date, 'yyyy-MM-dd');
                    $scope.productItem.room.fixed.sort(compare('seat_number'));
                    if($scope.pageType == 'operateProduct'){
                        if($scope.productItem.visible_user_id && $scope.productItem.visible_user_id != 0){
                            getUsers({'id[]': [$scope.productItem.visible_user_id]});
                        }
                        if($scope.productItem.room.type_tag == 'dedicated_desk'){
                            $scope.productItem.base_price = getPriceRange($scope.productItem.room.fixed);
                        }
                        if($scope.productItem.room.type == 'office'){
                            _.each($scope.supplementaryList, function(item){
                                _.contains(_.pluck($scope.productItem.lease_rent_types, 'id'), item.id) ? item.selected = true : '';
                            });
                        }
                        
                        _.each($scope.leasingTypes, function(item) {
                            item.unit_price == 'month' && $scope.currentRentType == 'desk' ? item.selected = true : '';
                            item.unit_price == 'hour' && ($scope.currentRentType == 'meeting' || $scope.currentRentType == 'others') ? item.selected = true : '';
                            item.unit_price == 'longterm' && $scope.productItem.rent_set && $scope.productItem.rent_set.status ? item.selected = true : '';

                            _.each($scope.productItem.leasing_sets, function(lease) {
                                if(item.unit_price == lease.unit_price) {
                                    item.base_price = lease.base_price;
                                    item.unit_price == 'hour' ? item.amount = {name: lease.amount} : item.amount = lease.amount;
                                    item.selected = true;
                                }
                            });
                        });
                        
                        $scope.editOptions = angular.copy($scope.productItem);
                    }else if($scope.pageType == 'list'){
                        showReserveDlg();
                    }else if($scope.pageType == 'spaceDetail'){
                        $scope.spaceItem.product = {};
                        $scope.productItem.leaseRentDesc = _.pluck($scope.productItem.lease_rent_types, 'name').toString();
                        if($scope.productItem.visible_user_id && $scope.productItem.visible_user_id != 0){
                            getUsers({'id[]': [$scope.productItem.visible_user_id]});
                        }
                        $scope.spaceItem.product = angular.copy($scope.productItem);
                    }
                });
            };

            var getAppointmentList = function(){
                var params = {};
                params.pageLimit = $scope.pageOptions.pageSize;
                params.pageIndex = $scope.pageOptions.pageIndex;
                params.room = SpaceService.getSearchParam('roomId');
                SpaceService.getAppointmentList(params).success(function(data){
                    $scope.appointmentList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = _.uniq(_.pluck($scope.appointmentList, 'user_id'));
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                });
            };

            var isNumber = function(param){
                var re = /^[\+]?\d+(?:\.\d{0,2})?$/;
                var flag = re.test(param) ? true: false;
                return flag;
            };

            var isInteger = function(param) {
                var re = /^\+?[0-9][0-9]*$/;
                var flag = re.test(param) ? true: false;
                return flag;
            };

            var validManagerPhone = function(){
                var phones = _.filter($scope.managerPhones, function(item){
                    return item.phone_number !='';
                });
                var phone_temp = _.pluck(phones, 'phone_number');
                if(!phone_temp[0]){
                    noty('error', '管理员号码不能为空！');
                    return false;
                }
                if(phone_temp.length != _.uniq(phone_temp).length){
                    noty('error', '管理员号码不能重复！');
                    return false;
                }else{
                    var flag = true;
                    _.each(phones, function(item){
                        if(item.phone_number && !utils.isPhone(item.phone_number)){
                            flag = false;
                        }
                    });
                    if(!flag){
                       noty('error', '管理员手机号码格式错误!'); 
                       return false;
                    }
                    $scope.communityOptions.phones = {};
                    $scope.communityOptions.phones.add = _.filter(phones, function(item){
                        return !item.id;
                    });
                    if($scope.pageType === 'editCommunity'){
                        $scope.communityOptions.phones.modify = _.filter(phones, function(item){
                            return item.id && item.phone_number !== item.original;
                        });
                        $scope.communityOptions.phones.remove = _.difference($scope.managerPhonesOrigin, _.pluck(phones, 'id'));
                        $scope.communityOptions.phones.remove = _.map($scope.communityOptions.phones.remove, function(item){
                            return {id: item};
                        });
                    }
                }
                return true;
            };

            var validParams = function(param, msg){
                if(param){
                    noty('error', msg);
                    return false;
                }
                return true;
            };

            var validEmail = function(){
                $scope.communityOptions.email = _.pluck($scope.orderEmail, 'email').join(',');
                if(!$scope.communityOptions.email){
                    noty('error', '新订单提醒邮箱不能为空！');
                    return false;
                }
                for(var i = 0; i < $scope.orderEmail.length; i++){
                    if($scope.orderEmail[i].email && !utils.isEmail($scope.orderEmail[i].email)){
                        noty('error', '新订单提醒邮箱格式错误！');
                        return false;
                    }
                }
                return true;
            };

            var validPhone = function(){
                $scope.communityOptions.order_remind_phones = _.pluck($scope.orderPhones, 'phone').join(',');
                if(!$scope.communityOptions.order_remind_phones){
                    noty('error', '新订单提醒手机号不能为空！');
                    return false;
                }
                if($scope.orderPhones[0].phone && !utils.isPhone($scope.orderPhones[0].phone)){
                    noty('error', '新订单提醒手机号格式错误！');
                    return false;
                }
                return true;
            };

            var validationStep1 = function(){
                var validationFlag = true;

                validationFlag = validationFlag ? validParams($scope.form.logoImage.length === 0, '请上传社区logo！') : validationFlag;
                validationFlag ? $scope.communityOptions.avatar = $scope.form.logoImage[0].download_link : '';
                //validationFlag = validationFlag ? validParams($scope.gallery.building.length === 0, '请上传社区封面！') : validationFlag;
                if(validationFlag) {
                    $scope.communityOptions.building_attachments = [];
                    $scope.communityOptions.building_attachments = _.map(
                        $scope.gallery.building,
                        function (oneImage) {
                            return {
                                content: oneImage.content,
                                attachment_type: oneImage.attachment_type,
                                filename: oneImage.filename,
                                preview: oneImage.preview_link,
                                size: '0'
                            }
                        }
                    );
                }
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.name, '请输入社区名称！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.filterOptions.property, '请选择社区物业类型！') : validationFlag;
                $scope.communityOptions.property_type_id = $scope.filterOptions.property ? $scope.filterOptions.property.id : '';
                
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.building_company.phone, '请输入社区客服电话！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.address, '请输入社区具体地址！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.filterOptions.city, '请选择城市！') : validationFlag;
                $scope.communityOptions.city_id = $scope.filterOptions.city ? $scope.filterOptions.city.id : '';
                $scope.communityOptions.district_id = $scope.filterOptions.district ? $scope.filterOptions.district.id : '';
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.lat || !$scope.communityOptions.lng, '请输入经纬度') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.business_hour, '请输入社区营业时间！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.detail, '请输入社区介绍！') : validationFlag;
                if($scope.pageType === 'editCommunity'){
                    $scope.communityOptions.floors = {};
                }else{
                    $scope.communityOptions.floors = {};
                    $scope.communityOptions.floors.add = [{floor_number: 1}];
                }
                
                $scope.communityOptions.building_services = [];
                $scope.communityOptions.building_services = _.map(_.filter($scope.serviceList, function(item){
                    return item.selected;
                }), function(service){
                    return {id: service.id}
                });

                return validationFlag;
            };

            var validationStep2 = function(){
                var validationFlag = true;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.community_manager_name, '请输入社区负责人姓名！') : validationFlag;
                validationFlag = validationFlag ? validManagerPhone() : validationFlag;
                validationFlag = validationFlag ? validPhone() : validationFlag;
                validationFlag = validationFlag ? validEmail() : validationFlag;
                $scope.communityOptions.customer_services = {};
                if($scope.pageType === 'editCommunity'){
                    var temp = _.keys($scope.tempOriginCustomer);
                    var origin = _.keys($scope.originCustomer);
                    $scope.communityOptions.customer_services.add = _.map(_.difference(origin, temp), function(item){
                        return {tag: "customerservice", user_id: item};
                    });
                    $scope.communityOptions.customer_services.remove = _.map(_.difference(temp, origin), function(item){
                        return {tag: "customerservice", user_id: item};
                    });
                }else{
                    $scope.communityOptions.customer_services.customerservice = _.map($scope.selectedAdmins, function(item){
                        return item.user_id;
                    });
                }
                return validationFlag;
            };

            var validationStep3 = function(){
                var validationFlag = true;
                $scope.communityOptions.remove_dates = Object.keys($scope.remove_dates).length > 0 ? $scope.remove_dates : '';
                //validationFlag = validationFlag ? validParams(!$scope.communityOptions.remove_dates, '请选择社区休息日！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.lessor_name, '请输入出租方名称！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.lessor_address, '请输入出租方地址！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.lessor_contact, '请输入出租方联系人！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.lessor_phone, '请输入出租方电话！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.lessor_email, '请输入出租方邮箱！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.lessor_bank_account_name, '请输入出租方收款账户名！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.lessor_bank_account_number, '请输入出租方收款账号！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.lessor_bank_name, '请输入出租方开户行！') : validationFlag;
                validationFlag = validationFlag ? validParams(!$scope.communityOptions.lease_remarks, '请输入长租合同补充条款！') : validationFlag;
                return validationFlag;
            };

            var getOrderParam = function(type){
                var params = {};
                if(type === 'hour'){
                    params = $scope.hourOrderParam;
                }else if(type === 'day'){
                    params = $scope.dayOrderParam;
                }else if(type === 'week'){
                    params = $scope.weekOrderParam;
                }else{
                    params = $scope.monthOrderParam;
                }
                return params;
            };

            var validation = function(type){
                var validationFlag = true;
                var params = getOrderParam(type);
                if($scope.dialogType === 'preorder'){
                    validationFlag = validationFlag ? validParams(!$scope.users.select.id, '请选择使用者！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!params.start_date, '请选择开始日期！') : validationFlag;
                    validationFlag = validationFlag ? validParams(params.discount_price && !isNumber(params.discount_price), '请输入正确价格！') : validationFlag;
                }
                if(type === 'month'){
                    validationFlag = validationFlag ? validParams(!params.rent_period, '请选择租用时间！') : validationFlag;
                }else if(type === 'hour'){
                    validationFlag = validationFlag ? validParams(!params.times.start, '请选择开始时间！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!params.times.end, '请选择结束时间！') : validationFlag;
                    validationFlag = validationFlag ? validParams(params.rent_period < 0, '结束时间应该大于开始时间！') : validationFlag;
                }else if(type === 'day'){
                    validationFlag = validationFlag ? validParams(!params.end_date, '请选择结束日期！') : validationFlag;
                    validationFlag = validationFlag ? validParams(params.end_date < params.start_date, '结束时间应该大于开始时间！') : validationFlag;
                }else if(type === 'week'){
                    validationFlag = validationFlag ? validParams(!params.rent_period, '请选择租用时长！') : validationFlag;
                }
                return validationFlag;
            };

            var validationUpdate = function(){
                var validationFlag = true;
                if($scope.editOptions.room.type_tag != 'dedicated_desk'){
                    validationFlag = validationFlag ? validParams(!_.contains(_.pluck($scope.leasingTypes, 'selected'), true), '请设置商品租赁规格！') : validationFlag;
                    _.each($scope.leasingTypes, function(item) {
                        // if($scope.currentRentType == 'office' && item.unit_price == 'month') {
                        //     validationFlag = validationFlag ? validParams(!item.base_price, '请输入月租价格！') : validationFlag;
                        //     validationFlag = validationFlag ? validParams(!item.amount, '请输入起租量！') : validationFlag;
                        // }
                        if(item.selected && item.unit_price != 'longterm') {
                            validationFlag = validationFlag ? validParams(!item.amount, '请输入起租量！') : validationFlag;
                            item.unit_price != 'hour' ? (validationFlag = validationFlag ? validParams(!isInteger(item.amount), '起租量必须是整数！') : validationFlag) : '';
                            validationFlag = validationFlag ? validParams(!item.base_price, '请输入商品价格！') : validationFlag;
                        }
                    });
                }else if($scope.editOptions.room.type_tag == 'dedicated_desk'){
                    _.each($scope.editOptions.room.fixed, function(item){
                        validationFlag = validationFlag ? validParams(!item.base_price, '请输入商品价格！') : validationFlag;
                    });
                }
                if($scope.editOptions.rent_set){
                    validationFlag = validationFlag ? validParams(_.filter($scope.supplementaryList, function(item){return item.selected}).length <= 0, '请选择月租包含项！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.editOptions.rent_set.deposit, '请输入租赁押金！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!isNumber($scope.editOptions.rent_set.deposit), '请输入正确的价格！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.editOptions.rent_set.earliest_rent_date, '请选择最早起租日期！') : validationFlag;
                    validationFlag = validationFlag ? validParams(!$scope.editOptions.rent_set.rental_info, '请输入租凭须知！') : validationFlag;
                }
                return validationFlag;
            };

            var getUnitDesc = function(type){
                switch(type){
                    case 'month':
                        return $translate.instant('MONTH');
                    case 'hour':
                        return $translate.instant('HOUR');
                    case 'day':
                        return $translate.instant('DAY');
                    default:
                        return '';
                }
            };

            var getCustomerService = function(){
                SpaceService.getCustomerService().success(function(data){
                    $scope.customerservice = {};
                    _.each(data.customerservice, function(item){
                        $scope.customerservice[item] = true;
                    });
                });
            };

            /***** for room *****/
            var getRoomType = function(){
                SpaceService.getRoomTypes().success(function(data){
                    $scope.roomTypes = angular.copy(data);
                    _.each($scope.roomTypes, function(item){
                        $scope.roomTypeDesc[item.name] = item;
                    });
                    if($scope.pageType == 'list' || $scope.pageType == 'operateProduct'){
                        $scope.productFilters.type = _.map(angular.copy(data), function(item){
                            item.selected = $scope.currentFilter && $scope.currentFilter.selectedRoomType && $scope.currentFilter.selectedRoomType[item.name] ? true : false;
                            item.type = item.name;
                            item.name = item.description;
                            return _.pick(item, 'name', 'type', 'selected');
                        });
                        $scope.selectedProFilter = _.filter($scope.productFilters.type, 'selected', true);
                    }
                    $scope.pageType === 'addCommunity' || $scope.pageType === 'editCommunity' ? data.push({name: 'building', description: 'building'}) : '';
                    _.each(data, function(item){
                        item.units ? item.units[0].name = getUnitDesc(item.units[0].unit) : '';
                        $scope.roomTypeObject[item.name] = item;
                        if($scope.pageType === 'addCommunity' || $scope.pageType === 'editCommunity'){
                            $scope.imageUploader[item.name] = ImageUploaderService.createGalleryUploader();
                            $scope.imageUploader[item.name].onAfterAddingAll = GalleryUploadImage.cropAndUploadImage.bind(
                                $scope.imageUploader[item.name],
                                item.name,
                                $scope
                            );
                        }
                    });
                    if($scope.pageType == 'addRoom' || $scope.pageType == 'editRoom' || $scope.pageType == 'copyRoom' || $scope.pageType == 'spaceDetail'){
                        $scope.currentRoomType = _.find($scope.roomTypes, function(room){
                            return room.name == $scope.roomType;
                        });
                        if($scope.currentRoomType) {
                            _.each($scope.currentRoomType.units, function(item){
                                item.unit === 'hour' ? $scope.hourRentFlag = true : '';
                            });
                        }
                        var id = _.filter($scope.roomTypes, 'name', SpaceService.getSearchParam('roomType'))[0].id;
                        getRoomTypeTags(id);
                    }
                });
                if($scope.pageType === 'addRoom' || $scope.pageType === 'editRoom' || $scope.pageType === 'copyRoom'){
                    $scope.selectedCommunityId = SpaceService.getSearchParam('communityId');
                    $scope.imageUploader[$scope.roomType] = ImageUploaderService.createGalleryUploader();
                    $scope.imageUploader[$scope.roomType].onAfterAddingAll = GalleryUploadImage.cropAndUploadImage.bind(
                        $scope.imageUploader[$scope.roomType],
                        $scope.roomType,
                        $scope
                    );
                }
            };

            var getRoomPics = function(room){
                var params = {'building': SpaceService.getSearchParam('communityId')};
                SpaceService.getBuildingAttachments(params).success(function(data){
                    $scope.roomPics = data;
                    if($scope.pageType == 'editRoom' || $scope.pageType == 'copyRoom') {
                        room.attachment && room.attachment.length > 0 ? $scope.roomMainPic = room.attachment[0].attachment_id : '';
                        $scope.roomMainPic.mainSelected = true;
                        room.attachment.splice(0,1);
                        $scope.selectedRoomPics = room.attachment;
                        _.each($scope.selectedRoomPics, function(sPic){
                            for(var key in sPic.attachment_id){
                                sPic[key] = sPic.attachment_id[key];
                            }
                            delete sPic.attachment_id;
                        });
                        _.each($scope.roomPics, function(rPic){
                            _.each($scope.selectedRoomPics, function(sPic){
                                if(sPic.id == rPic.id){
                                    rPic.selected = true;
                                    sPic.selected = true;
                                }
                            });
                            if($scope.roomMainPic.id == rPic.id){
                                rPic.mainSelected = true;
                            }
                        });
                    }
                });
            };

            var getOfficeSupplies = function(){
                SpaceService.getOfficeSupplies().success(function(data){
                    $scope.suppliesList = data;
                });
            };

            var getCommunityRoomType = function(community, selectedFlag){
                SpaceService.getRoomTypeListOfCommunity(community.id).success(function(data){
                    community.roomTypes = data;
                    community.all_number > 0 ? community.roomTypes.unshift({name: '推荐空间', type: 'recommend'}) : '';
                    if(!selectedFlag && $scope.currentFilter && $scope.currentFilter.roomType && $scope.currentFilter.communityId == community.id){
                        $scope.selectedRoomType = _.filter(community.roomTypes, function(item){
                            return item.name === $scope.currentFilter.roomType;
                        })[0];
                        $scope.selectedRoomType.selected = true;
                    }
                    getComSpaceList(selectedFlag);
                    getRecommendList();
                });
            };

            var getFloors = function(){
                SpaceService.getFloors({building: SpaceService.getSearchParam('communityId')}).success(function(data){
                    $scope.floors = data;
                    _.each($scope.floors, function(floor){
                        floor.name = floor.floor_number;
                    });
                });
            };

            var getDoors = function(){
                SpaceService.getDoors({building: SpaceService.getSearchParam('communityId')}).success(function(data){
                    $scope.doorLists = data;
                    if($scope.pageType == 'copyRoom') {
                        var room_control_name = _.pluck($scope.roomDetail.door_control, 'name');
                        $scope.roomCreateoptions.door = [];
                        _.each($scope.doorLists, function(item) {
                            _.contains(room_control_name, item.name) ? item.select = true : item.select = false;
                            item.select ? $scope.roomCreateoptions.door.push(item) : '';
                        });
                    }
                });
            };

            var compareSeat = function(cache){
                var cache_name = $scope.pageType == 'editRoom' ? _.pluck(cache, 'seat_number') : _.pluck(cache, 'number');
                if(cache_name.length != _.uniq(cache_name).length){
                    $scope.roomCreateoptions.repeatSeatNumber = true
                }else{
                    delete $scope.roomCreateoptions.repeatSeatNumber;
                }
            };

            var compare = function(propertyName){
                return function(object1,object2){
                    var value1 = Number(object1[propertyName]);
                    var value2 = Number(object2[propertyName]);
                      
                    if(value1 < value2){
                        return -1;
                    }else if(value1 > value2){
                        return 1;
                    }else{
                        return 0;
                    }
                }
            }

            var formatInfo = function(){
                $scope.roomCreateoptions.attachment_id = [];
                $scope.roomCreateoptions.doors_control = [];
                // $scope.roomCreateoptions.attachment_id.push({id: 936});
                $scope.roomMainPic.content ? $scope.roomCreateoptions.attachment_id.push({id: $scope.roomMainPic.id}) : '';
                if($scope.selectedRoomPics.length > 0){
                    _.each($scope.selectedRoomPics, function(pic){
                        $scope.roomCreateoptions.attachment_id.push({id: pic.id});
                    });
                }
                $scope.roomCreateoptions.type_tag = $scope.selectedTag.tag_key;
                $scope.roomCreateoptions.office_supplies = [];
                _.each($scope.suppliesList, function(supply){
                    var params = {};
                    supply.select ? params.id = supply.id : '';
                    supply.quantity ? params.quantity = supply.quantity : params.quantity = 1;
                    supply.select ? $scope.roomCreateoptions.office_supplies.push(params) : '';
                });
                if($scope.pageType == 'addRoom' || $scope.pageType == 'copyRoom') {
                    _.each($scope.doorLists, function(door){
                        if(door.select){
                            $scope.roomCreateoptions.doors_control.push({control_id: door.id, control_name: door.name});
                        }
                    });
                }
                delete $scope.roomCreateoptions.door;
                if($scope.roomType == 'meeting' || $scope.roomType == 'others'){
                    $scope.roomCreateoptions.room_meeting = {
                        start_hour: $scope.roomCreateoptions.start_hour.name,
                        end_hour: $scope.roomCreateoptions.end_hour.name
                    };
                    delete $scope.roomCreateoptions.start_hour;
                    delete $scope.roomCreateoptions.end_hour;
                }else if($scope.roomType == 'fixed'){
                    if($scope.pageType == 'editRoom'){
                        $scope.roomCreateoptions.room_fixed = {
                            add: [],
                            modify: [],
                            remove: []
                        };
                        _.each($scope.deskNums, function(desk){
                            desk.id ? '' : $scope.roomCreateoptions.room_fixed.add.push({seat_number: desk.seat_number});
                            _.each($scope.roomDetail.fixed, function(item){
                                if(desk.id == item.id && desk.seat_number != item.seat_number){
                                    $scope.roomCreateoptions.room_fixed.modify.push({seat_id: desk.id, seat_number: desk.seat_number});
                                }
                            });
                        });
                        var modified = _.pluck(_.filter($scope.deskNums, function(item){return item.id}), 'id');
                        $scope.roomCreateoptions.room_fixed.remove = _.map(_.xor(modified, _.pluck($scope.roomDetail.fixed, 'id')), function(item){
                            return {seat_id: item};
                        });
                    }else if($scope.pageType == 'addRoom'){
                        $scope.roomCreateoptions.room_fixed = [];
                        _.each($scope.deskNums, function(desk){
                            desk.number ? $scope.roomCreateoptions.room_fixed.push({seat_number: desk.number}) : '';
                        });
                    }
                    compareSeat($scope.deskNums);
                    $scope.roomCreateoptions.allowed_people = $scope.deskNums.length;
                }
            };

            var createVerify = function(){
                var flag = true;
                flag = flag ? validParams(!$scope.roomCreateoptions.name, '请填写空间名字') : flag;
                flag = flag ? validParams(!$scope.selectedTag, '请选择空间类型') : flag;
                flag = flag ? validParams(!$scope.roomCreateoptions.area, '请填写面积') : flag;
                if($scope.roomType != 'fixed'){
                    flag = flag ? validParams(!$scope.roomCreateoptions.allowed_people, '请填写人数') : flag;
                }
                flag = flag ? validParams(!$scope.roomMainPic.content, '请选择空间主图') : flag;
                if($scope.roomType == 'meeting' || $scope.roomType == 'others'){
                    flag = flag ? validParams(!$scope.roomCreateoptions.start_hour, '请填写租用开始时间') : flag;
                    flag = flag ? validParams(!$scope.roomCreateoptions.end_hour, '请填写租用结束时间') : flag;
                }else if($scope.roomType == 'fixed'){
                    flag = flag ? validParams($scope.deskNums.length <= 0, '请填写工位号') : flag;
                }
                return flag;
            };

            var initCreate = function(){
                $scope.roomCreateoptions.floor_id = $scope.floors[0].id;
                $scope.roomCreateoptions.type = $scope.roomType;
                $scope.roomCreateoptions.building_id = SpaceService.getSearchParam('communityId');
                $scope.roomCreateoptions.office_supplies = [];
                $scope.roomCreateoptions.doors_control = [];
                $scope.roomCreateoptions.type_tag = $scope.selectedTag.tag_key;
                formatInfo();
            };

            var initEdit = function(data){
                $scope.roomCreateoptions = _.pick(data, 'allowed_people', 'area', 'name', 'number', 'type', 'description');
                $scope.pageType == 'copyRoom' ? $scope.roomCreateoptions.number = '' : '';
                $scope.roomCreateoptions.floor_id = data.floor.floor_number;
                $scope.roomCreateoptions.office_supplies = data.office_supplies;
                _.each(data.office_supplies, function(supply){
                    _.each($scope.suppliesList, function(item){
                        if(supply.supply.id == item.id){
                            item.select = true;
                            item.quantity = supply.quantity;
                        }
                    });
                });
                if($scope.roomType == 'meeting' || $scope.roomType == 'others'){
                    $scope.roomCreateoptions.start_hour = { name: $filter('date')(data.meeting[0].start_hour,'HH:mm:ss')};
                    $scope.roomCreateoptions.end_hour = { name: $filter('date')(data.meeting[0].end_hour,'HH:mm:ss')};
                }else if($scope.roomType == 'fixed'){
                    _.each(data.fixed, function(des){
                        $scope.deskNums.push(des);
                    })
                }
            };

            var initUpdate = function(){
                $scope.roomUpdateOptions = [];
                formatInfo();
                for(var key in $scope.roomCreateoptions){
                    if(key != 'type' && key != 'floor_id' && key != 'number'){
                        var params = {op: 'add'};
                        params.path = key == 'attachment_id' ? '/attachments' : '/' + key;
                        params.value = $scope.roomCreateoptions[key];
                        $scope.roomUpdateOptions.push(params);
                    }
                }
            };

            var getRoomDetail = function(){
                $scope.loading = false;
                SpaceService.getRoomDetail(SpaceService.getSearchParam('roomId')).success(function(data){
                    $scope.editOptions.room = angular.copy(data);
                    $scope.editOptions.start_date = $scope.today;
                    $scope.roomDetail = data;
                    $scope.roomDetail.fixed.sort(compare('seat_number')); 
                    if($scope.pageType === 'spaceDetail'){
                        $scope.roomDetail = data;
                        _.each($scope.roomDetail.office_supplies, function(item, index){
                            if(index ===0){
                                $scope.roomDetail.supplies = item.supply.name + 'x' + item.quantity;
                            }else {
                                $scope.roomDetail.supplies = $scope.roomDetail.supplies + '，' + item.supply.name + 'x' + item.quantity;
                            }
                        });
                        $scope.roomDetail.door_show = _.pluck($scope.roomDetail.door_control, 'name');
                        $scope.roomDetail.door_show.join(" ");
                        $scope.spaceItem = $scope.roomDetail;
                        if($scope.roomDetail.type == 'desk' && $scope.roomDetail.fixed.length > 0){
                            $scope.spaceDetailTab = 0;
                            $scope.roomDetail.base_price = getPriceRange($scope.roomDetail.fixed);
                        }
                    }else if($scope.pageType === 'editRoom' || $scope.pageType === 'copyRoom'){
                        $scope.roomDetail = angular.copy(data);
                        $scope.pageType === 'copyRoom' ? getDoors() : '';
                        initEdit(data);
                        getRoomPics(data);
                        getRoomType();
                    }else if($scope.pageType == 'operateProduct') {
                        _.each($scope.leasingTypes, function(item) {
                            item.unit_price == 'month' && $scope.currentRentType == 'desk' ? item.selected = true : '';
                            item.unit_price == 'hour' && ($scope.currentRentType == 'meeting' || $scope.currentRentType == 'others') ? item.selected = true : '';
                            item.unit_price == 'longterm' && $scope.productItem.rent_set && $scope.productItem.rent_set.status ? item.selected = true : '';
                        });
                    }
                    $scope.loading = true;
                }).error(function(){
                });
            };

            var addCommunity = function(){
                SpaceService.addCommunity($scope.communityOptions).success(function(data){
                    $scope.communityOptions.id = data.id;
                    $scope.current.originStep = 3;
                    $scope.current.prev = false;
                    $scope.current.step = 4;
                });
            };

            var updateCommunity = function(){
                SpaceService.editCommunity(SpaceService.getSearchParam('communityId'), $scope.communityOptions).success(function(){
                    noty('info', '社区编辑成功！');
                    window.history.back();
                });
            };

            var getLeasesLists = function(){
                var params = {
                    pageLimit: $scope.pageOptions.pageSize,
                    pageIndex: $scope.pageOptions.pageIndex,
                    status: 'all',
                    room: $scope.roomDetail.id
                };
                SpaceService.getLeasesLists(params).success(function(data){
                    $scope.leasesList = data.items;
                    $scope.pageOptions.totalNum = data.total_count;
                    var arr = [];
                    _.each(data.items, function(item){
                        item.supervisor ? arr.push(item.supervisor) : '';
                    });
                    arr = _.uniq(arr);
                    arr.length > 0 ? getUsers({'id[]': arr}): '';
                });
            };

            var resetFilterStorage = function(){
                if($scope.pageType === 'list'){
                    var params = {};
                    params['communityId'] = $scope.selectedCommunity.id;
                    params['roomType'] = $scope.selectedRoomType ? $scope.selectedRoomType.name : '';
                    params['query'] = $scope.search.query ? $scope.search.query: '';
                    params['status'] = $scope.selectedStatus ? $scope.selectedStatus.name: '';
                    params['selectedRoomType'] = {};
                    _.each($scope.selectedProFilter, function(item){
                        params['selectedRoomType'][item.type] = true;
                    });
                    params['listScrollTop'] = $scope.listScrollTop;
                    params['menuScrollTop'] = $scope.leftMenuScrollTop;
                    FilterStorageService.setCurrentFilter({salesSpace: params});
                }
            };

            var initFilterStorage = function(){
                $scope.currentFilter = FilterStorageService.getStorage().currentFilter;
                $scope.currentFilter = $scope.currentFilter ? JSON.parse($scope.currentFilter).salesSpace : {};
                $scope.search.key = $scope.currentFilter && $scope.currentFilter.query ? $scope.currentFilter.query : '';
                $scope.search.query = $scope.search.key;
                if($scope.currentFilter && $scope.currentFilter.status){
                    _.each($scope.productFilters.status, function(item){
                        item.selected = item.name === $scope.currentFilter.status ? true : false;
                        item.name === $scope.currentFilter.status ? $scope.selectedStatus = item : '';
                    });
                }
                events.on('spaceMenu', function() {
                    var leftMenu = angular.element(document.getElementById('leftContainer'));
                    $scope.currentFilter ? leftMenu.scrollTop($scope.currentFilter.menuScrollTop, 1000) : '';
                    leftMenu.on('scroll', function(){
                        $scope.leftMenuScrollTop = leftMenu.scrollTop();
                    });
                });

                events.on('spaceList', function() {
                    var container = angular.element(document.getElementById('listContainer'));
                    $scope.currentFilter ? container.scrollTop($scope.currentFilter.listScrollTop, 1000) : '';
                    container.on('scroll', function(){
                        $scope.listScrollTop = container.scrollTop();
                    });
                    if($scope.search.query){
                        _.each(document.getElementsByClassName('tit-des'), function(item){
                            item.innerHTML = item.innerHTML.replace(new RegExp($scope.search.query, 'g') ,'<font color=red>'+$scope.search.query+'</font>');
                        });
                    }
                });
            };

            var getAllAdmins = function(admins){
                var params = {
                    pageLimit: 50,
                    pageIndex: 1,
                    platform: 'sales',
                    company: $cookies.get('salesCompanyId')
                };

                $scope.originCustomer = {};
                if(admins && admins.length > 0){
                    _.each(admins, function(item){
                        $scope.originCustomer[item.user_id] = true;
                    });
                }
                SpaceService.getAllAdmins(params).success(function(data){
                    $scope.addAdminList = data.items;
                    _.each($scope.addAdminList, function(item){
                        item.user.avatar = CONF.file + '/person/' + item.user.id + '/avatar_small.jpg';
                        if($scope.originCustomer[item.user.id]){
                            $scope.selectedAdmins.push(item);
                        }
                    });
                    $scope.tempOriginCustomer = angular.copy($scope.originCustomer);
                });
            };

            $scope.moveStep = function(num, flag){
                $scope.communityFlag = true;
                if(num === 2 && $scope.current.step === 1){
                    !flag ? $scope.communityFlag = validationStep1() : '';
                }else if(num === 3 && $scope.current.step === 2){
                    $scope.communityFlag = validationStep2()
                }else if(num === 4){
                    validationStep3();
                    $scope.pageType === 'addCommunity'? addCommunity() : updateCommunity();
                }
                if($scope.communityFlag && num !== 4){
                    $scope.current.originStep = angular.copy($scope.current.step);
                    $scope.current.prev = num < $scope.current.step ? true : false;
                    $scope.current.step = num;
                }
            };

            var getPropertyTypes = function() {
                SpaceService.getPropertyTypes().success(function(data) {
                    $scope.propertyTypes = data;
                });
            };

            var init = function(){
                $scope.selectedCommunity.id = SpaceService.getSearchParam('communityId');
                $rootScope.crumbs = {first: '空间管理'};
                getCustomerService();
                if($scope.pageType === 'editCommunity'){
                    $rootScope.crumbs.second = '编辑社区';
                    getRegions();
                    getPropertyTypes();
                    getCommunityDetail();
                    SpaceService.getSearchParam('step') ? $scope.moveStep(parseInt(SpaceService.getSearchParam('step')), true) : '';
                    $scope.stepBoxs.splice($scope.stepBoxs.length-1, 1);
                }else if($scope.pageType === 'addCommunity'){
                    $rootScope.crumbs.second = '创建社区';
                    getAllAdmins();
                    getRegions();
                    getPropertyTypes();
                    getServiceList();
                }else if($scope.pageType === 'list'){
                    initFilterStorage();
                    getCommunities();
                }else if($scope.pageType === 'communityDetail'){
                    $rootScope.crumbs.second = '社区详情';
                    getCommunityDetail();
                }else if($scope.pageType === 'addRoom'){
                    $rootScope.crumbs.second = '创建空间';
                    getOfficeSupplies();
                    getRoomPics();
                    getFloors();
                    getDoors();
                }else if($scope.pageType === 'editRoom'){
                    $rootScope.crumbs.second = '编辑空间';
                    getOfficeSupplies();
                    getFloors();
                    getRoomDetail();
                }else if($scope.pageType === 'copyRoom'){
                    $rootScope.crumbs.second = '复制空间';
                    getOfficeSupplies();
                    getRoomPics();
                    getFloors();
                    getRoomDetail();
                }else if($scope.pageType === 'operateProduct'){
                    $rootScope.crumbs.second = '租赁设置';
                    SpaceService.getSearchParam('renttype') == 'office' ? getSupplementaryList() : '';
                    if($scope.productType == 'edit'){
                        getProductDetail(SpaceService.getSearchParam('productId'));
                    }else if($scope.productType == 'create'){
                        getRoomDetail();
                        SpaceService.getSearchParam('productId') ? getProductDetail(SpaceService.getSearchParam('productId')) : '';
                    }
                }else if($scope.pageType === 'spaceDetail'){
                    $rootScope.crumbs.second = '空间详情';
                    getRoomDetail();
                    SpaceService.getSearchParam('productId') ? getProductDetail(SpaceService.getSearchParam('productId')) : '';
                }else if($scope.pageType === 'communityImages'){
                    $rootScope.crumbs.second = '社区图库';
                    getRoomTypeAttachments(SpaceService.getSearchParam('communityId'));
                    getCommunityDetail();
                }
                if($scope.pageType !== 'copyRoom' && $scope.pageType !== 'editRoom'){
                    getRoomType();
                }
                
            };

            init();

            $scope.blockInput = function(e){
               e.preventDefault();
            };

            $scope.clearRemoveDate = function(){
                $scope.remove_dates = {};
            };

            $scope.generateChat = function(userId, buildingId){
                var params = {
                    creatorId: userId,
                    buildingId: buildingId,
                    tag: 'customerservice'
                };
                SpaceService.createGroupChat(params).success(function(data){
                    events.emit('refreshGroup');
                    events.emit('openChat', data.id);
                });
            };

            /***** for community *****/
            $scope.switchCommunity = function(community, selectedFlag){
                if(community){
                    selectedFlag ? $scope.search.key = '' : '';
                    selectedFlag ? $scope.search.query = '' : '';
                    $scope.comSpaceList = [];
                    community.selected = !community.selected;
                    $scope.selectedCommunity && $scope.selectedCommunity.id !== community.id ? $scope.selectedCommunity.selected = false: '';
                    $scope.selectedCommunity = community;
                    $scope.selectedRoomType = '';
                    getCommunityRoomType(community, selectedFlag);
                }
            };

            $scope.updateBuilding = function(){
                if(validationStep1() && validationStep2() && validationStep3()){
                    updateCommunity();
                }
            };

            $scope.showDialog = function(tag, roomType){
                $scope.dialogType = tag;
                $scope.selectedRoomType = roomType ? roomType : {};
                if(tag === 'add-main-pic' || tag === 'add-logo-pic'){
                    getRoomTypeAttachments(SpaceService.getSearchParam('communityId'));
                }
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'dialogTpl'
                });
            };

            $scope.seeAddService = function () {
                $scope.search.admins = [];
                _.each($scope.addAdminList, function(item){
                    if($scope.originCustomer[item.user.id]){
                        $scope.search.admins.push(item);
                        item.selectedAdd = true;
                    }
                });
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'addCustomerTpl'
                });
            };

            $scope.selectAddAdmin = function(admin){
                admin.selectedAdd = true;
                $scope.search.admins.push(admin);
            };

            $scope.cancelSelectAdmin = function(admin){
                admin.selectedAdd = false;
                $scope.search.admins = _.filter($scope.search.admins, function(item){
                    return item.user.id !== admin.user.id;
                });
            };

            $scope.deleteAdmin = function(item, index){
                $scope.originCustomer[item.user.id] = false;
                delete $scope.originCustomer[item.user.id];
                $scope.selectedAdmins.splice(index, 1);
                _.each($scope.addAdminList, function(admin){
                    admin.user_id == item.user.id ? admin.selectedAdd = false : '';
                });
            };

            $scope.addCustomerForCommunity = function($hide){
                $scope.selectedAdmins = angular.copy($scope.search.admins);
                _.each($scope.selectedAdmins, function(item){
                    $scope.originCustomer[item.user.id] = true;
                });
                $hide();
            };

            $scope.getBuildingAttachments = function(room){
                $scope.showRoom = room;
                var params = {'building': SpaceService.getSearchParam('communityId'), 'type[]': room.name};
                SpaceService.getBuildingAttachments(params).success(function(){
                });
                $scope.showDialog('show-com-pic');
            };

            $scope.seeCreate= function(){
                resetFilterStorage();
                SpaceService.updateSearchParam('ptype', 'addCommunity');
            };

            $scope.editCommunity= function(id, step){
                $scope.pageType === 'list'? resetFilterStorage() : '';
                SpaceService.updateSearchParam('ptype', 'editCommunity');
                SpaceService.updateSearchParam('communityId', id);
                SpaceService.updateSearchParam('step', step);
            };

            $scope.seeCommunity= function(id){
                $scope.pageType === 'list'? resetFilterStorage() : '';
                SpaceService.updateSearchParam('ptype', 'communityDetail');
                SpaceService.updateSearchParam('communityId', id);
            };

            $scope.deleteCommunity = function(community, $hide){
                $hide();
                events.emit('confirm', {
                    title: '删除社区',
                    content: '是否确认删除' + community.name + '， 社区删除后无法恢复？',
                    onConfirm: function() {
                        SpaceService.deleteCommunity(community.id).success(function(){
                            noty('info', $translate.instant('删除社区成功！'));
                            window.history.back();
                        });
                    }
                });
            };

            $scope.setCommunityVisible = function(community, flag, $hide, tag){  
                flag === false && tag == 'showLay' ? $scope.showDialog('confirm-invisible') : '';
                $hide();
                var params = [
                    {
                        'op': 'add',
                        'path': '/visible',
                        'value': flag
                    }
                ];
                if(tag == 'showLay'){
                    return;
                }
                SpaceService.setCommunityVisible(community.id, params).success(function(){
                    flag ? noty('info', '社区上架成功！') : noty('info', '社区下架成功！');
                    if($scope.pageType == 'communityDetail'){
                        getCommunityDetail();
                    }else if($scope.pageType == 'list'){
                        getCommunities();
                    }
                });
            };

            $scope.changeMainPic = function(){
                $('#main-pic input').click();
            };

            /***** for room *****/
            $scope.switchRoomType = function(type){
                $scope.search.key = '';
                $scope.search.query = '';
                _.each($scope.selectedCommunity.roomTypes, function(type){
                    type.selected = false;
                });
                type.selected = true;
                $scope.selectedRoomType = type;
            };

            $scope.seeAddRoom = function(i){
                SpaceService.updateSearchParam('ptype', 'addRoom');
                SpaceService.updateSearchParam('roomType', i.name);
                SpaceService.updateSearchParam('communityId', $scope.selectedCommunity.id);
            };

            $scope.seeEditRoom = function(item){
                SpaceService.updateSearchParam('ptype', 'editRoom');
                SpaceService.updateSearchParam('roomType', item.type);
                SpaceService.updateSearchParam('roomId', item.id);
                SpaceService.updateSearchParam('communityId', $scope.selectedCommunity.id);
            };

            $scope.seeCopyRoom = function(item){

                if($scope.pageType == 'spaceDetail'){
                    item = $scope.roomDetail;
                    SpaceService.updateSearchParam('communityId', $scope.roomDetail.building.id);
                    $scope.productItem ? SpaceService.updateSearchParam('productId', $scope.productItem.id) : '';
                }else{
                    SpaceService.updateSearchParam('communityId', $scope.selectedCommunity.id);
                    item.product.id ? SpaceService.updateSearchParam('productId', item.product.id) : '';
                }
                SpaceService.updateSearchParam('ptype', 'copyRoom');
                SpaceService.updateSearchParam('roomType', item.type);
                SpaceService.updateSearchParam('roomId', item.id);
            };

            $scope.setAgreementStatus = function(item, status){
                var params = [{
                        op: 'add',
                        path: '/status',
                        value: status
                    }];
                SpaceService.setAgreementStatus(item.id, params).success(function(){
                    if(status === 'rejected'){
                        noty('info', '预约申请拒绝成功！')
                        getAppointmentList();
                    }
                });
            };

            $scope.removeRoomPic = function(i, pic){
                $scope.selectedRoomPics.splice(i,1);
            };

            $scope.delRoomMainPic = function(){
                $scope.roomMainPic = {};
                $scope.selecteMain = false;
                _.each($scope.roomPics, function(pic){
                    pic.mainSelected = false;
                });
            };

            $scope.seeRoomPics = function(tag){
                $scope.selecteMain = tag;
                if(tag){
                    _.each($scope.roomPics, function(pic){
                        if($scope.roomMainPic && $scope.roomMainPic.id == pic.id){
                            pic.mainSelected = true;
                        }else{
                            pic.mainSelected = false;
                        }
                    });
                }
                $scope.showDialog('select-room-pic');
            };

            $scope.createRoom = function(){
                if(createVerify()){
                    initCreate();
                    if($scope.roomCreateoptions.repeatSeatNumber){
                        noty('error', '不能创建相同的座位号!');
                        return;
                    }
                    SpaceService.addRoom($scope.roomCreateoptions).success(function(data){
                        noty('info', '房间创建成功!');
                        SpaceService.updateSearchParam('roomType', '');
                        $scope.seeProduct({id: data.id, type: $scope.roomCreateoptions.type}, 'create', true);
                    }).error(function(data){
                        if(data.code == 400001){
                            noty('error', '房间创建失败，重复的房间号！');
                        }
                    });
                }
            };

            $scope.deleteRoom = function(item,$hide){
                $hide();
                var room_id = '',room_name = '';
                room_id = $scope.pageType == 'spaceDetail' ? SpaceService.getSearchParam('roomId') : item.id;
                room_name = $scope.pageType == 'spaceDetail' ? $scope.roomDetail.name : item.name;
                events.emit('confirm', {
                    title: '删除房间',
                    content: '是否确认删除' + room_name + '， 房间删除后无法恢复',
                    onConfirm: function() {
                        SpaceService.deleteRoom(room_id).success(function(){
                            noty('info', '删除房间成功！');
                            if($scope.pageType == 'spaceDetail'){
                                window.history.back();
                            }else{
                                getComSpaceList(true);
                            }
                        });
                    }
                });
            };

            $scope.updateRoom = function(){
                if(createVerify()){
                    initUpdate();
                    if($scope.roomCreateoptions.repeatSeatNumber){
                        noty('error', '不能创建相同的座位号!');
                        return;
                    }
                    SpaceService.updateRoom(SpaceService.getSearchParam('roomId'),$scope.roomUpdateOptions).success(function(){
                        noty('info', '房间更新成功！');
                        window.history.back();
                    });
                }
            };

            /***** for space *****/
            $scope.switchSpaceDetailTab = function(tag){
                $scope.spaceDetailTab = tag;
                if(tag === 4){
                    if($scope.roomDetail.type === 'meeting' || $scope.roomDetail.type === 'space' || $scope.roomDetail.type === 'studio'){
                        getMeetingUsage();
                    }else if($scope.roomDetail.type === 'office'){
                        getOfficeUsage();
                    }else if($scope.roomDetail.type === 'longterm'){
                        getLongtermUsage();
                    }else if($scope.roomDetail.type === 'flexible'){
                        getFlexibleUsage();
                    }else if($scope.roomDetail.type === 'fixed'){
                        getFixedUsage();
                        _.filter($scope.roomDetail.fixed, function(item){return item.selected}).length > 0 ? '' : $scope.roomDetail.fixed[0].selected = true;
                    }
                }else if(tag == 2){
                    getAppointmentList();
                }else if(tag === 3){
                    getLeasesLists();
                }else if(tag === 5){
                    getSpaceOrders();
                }
            };

            $scope.seeContractDetail = function(id){
                window.open(CONF.bizbase + 'trade?tabtype=agreement&ptype=contractDetail&leaseId=' + id);
            };

            $scope.seeOrderDetail = function(id){
                window.open(CONF.bizbase + 'trade?ptype=spaceDetail&orderId=' + id + '&tabtype=space');
            };

            $scope.cancelOrder = function(id){
                events.emit('confirm', {
                    title: '取消订单',
                    content: '是否确认取消该订单？订单取消后将不可恢复。',
                    onConfirm: function() {
                        SpaceService.cancelOrder(id).success(function(){
                            getSpaceOrders();
                            noty('info','取消订单成功！');
                        }).error(function(){
                            noty('error','取消订单失败！');
                        });
                    }
                });
            };

            $scope.setStatus = function(orderid, flag){
                var params = [{
                        'op': 'add',
                        'path': '/rejected',
                        'value': flag
                    }];
                SpaceService.setOrderStatus(orderid, params).success(function(){
                    if(flag){
                        noty('info','该订单已被拒绝！');
                    }else{
                        noty('info','该订单已被同意！');
                    }
                    getSpaceOrders();
                });
            };

            $scope.seeSpaceDetail = function(item){
                if($scope.currentAdmin.leasesMap[$scope.PERMISSION_LEASES_KEY + $scope.selectedCommunity.id] ||  $scope.currentAdmin.appointmentMap[$scope.PERMISSION_APPOINTMENT_KEY + $scope.selectedCommunity.id] || $scope.currentAdmin.spaceOrderMap[$scope.PERMISSION_SPACE_ORDER_KEY + $scope.selectedCommunity.id] || $scope.currentAdmin.roomMap[$scope.PERMISSION_ROOM_KEY + $scope.selectedCommunity.id] || $scope.currentAdmin.productMap[$scope.PERMISSION_PRODUCT_KEY + $scope.selectedCommunity.id] || 
                    $scope.currentAdmin.preorderMap[$scope.PERMISSION_PREORDER_KEY + $scope.selectedCommunity.id] === 2 || $scope.currentAdmin.reserveMap[$scope.PERMISSION_RESERVE_KEY + $scope.selectedCommunity.id] === 2 || $scope.currentAdmin.user.is_super_admin){
                    $scope.pageType === 'list' ? resetFilterStorage() : '';
                    SpaceService.updateSearchParam('ptype', 'spaceDetail');
                    SpaceService.updateSearchParam('roomId', item.id);
                    SpaceService.updateSearchParam('productId', item.product.id);
                    SpaceService.updateSearchParam('communityId', $scope.selectedCommunity.id);
                    SpaceService.updateSearchParam('roomType', item.type);
                }
            };

            $scope.showRejectedConfirm = function(item){
                events.emit('confirm', {
                    title: '拒绝长租申请',
                    content: '是否拒绝此用户的长租申请？拒绝后无法再次操作，用户将收到拒绝提示',
                    btnName: '拒绝',
                    onConfirm: function() {
                        $scope.setAgreementStatus(item, 'rejected')
                    }
                });
            };

            $scope.seeUpdateDraft = function(id){
                $location.path('/trade');
                SpaceService.updateSearchParam('ptype', 'updateDraft');
                SpaceService.updateSearchParam('leaseId', id);
            };

            $scope.generateAgreement = function(item){
                $location.path('/trade');
                SpaceService.updateSearchParam('ptype', 'createAgreement');
                SpaceService.updateSearchParam('appointmentId', item.id);
                SpaceService.updateSearchParam('productId', item.product.id);
            };

            $scope.seeContractDetail = function(id){
                $location.path('/trade');
                SpaceService.updateSearchParam('ptype', 'contractDetail');
                SpaceService.updateSearchParam('leaseId', id);
            };

            $scope.seeMoreOpe = function(){
                $scope.operateMore = true;
            };

            $scope.searchSpace = function(){
                $scope.search.query = angular.copy($scope.search.key);
                getComSpaceList();
            };

            $scope.clearSearch = function(){
                $scope.search.key = '';
                FilterStorageService.setCurrentFilter({salesSpace: {'query': ''}});
            };

            $scope.seeReserveDlg = function(tag, $hide){
                $hide();
                $scope.dialogType = tag;
                $scope.users.select = '';
                $scope.users.query = '';
                $scope.users.list = [];
                initParams();
                if($scope.pageType == 'list'){
                    getProductDetail($scope.spaceItem.product.id);
                }else if($scope.pageType == 'spaceDetail'){
                    showReserveDlg();
                }
            };

            $scope.getDate = function(item, type, timeType){
                $scope.popoverType = $scope.dialogType;
                $scope.calendarOptions.timeType = timeType;
                getDateInfo(item, type);
            };

            $scope.searchUser = _.debounce(function(){
                if($scope.users.query.key){
                    var params = {
                        pageLimit: CONF.pageSize, 
                        pageIndex: 1,
                        query: $scope.users.query.key
                    };
                    SpaceService.searchUser(params).success(function(data){
                        var cache = {};
                        if(data.length > 0){
                            cache = _.find(data, function(item){return item.email === params.query || item.phone === params.query});
                            if(cache){
                                cache.avatar = CONF.file + '/person/' + cache.id + '/avatar_small.jpg';
                                cache.positionList = angular.copy($scope.positions);
                                $scope.users.select = cache;
                            }
                        }else{
                            noty('error', '未搜索到该用户！');
                        }
                    });
                }else{
                    $scope.users.list = [];
                }
            }, 300);

            $scope.reSearch = function(){
                $scope.users.select = null;
            };

            $scope.changePrice = function(set){
                set.input_visb = !set.input_visb;
            };

            $scope.selectSeat = function(item, tag){
                $scope.selectedSeat = item.id;
                if(tag == 'dialog'){
                    $scope.productItem.base_price = item.base_price;
                    _.each($scope.productItem.room.fixed, function(seat){
                        seat.selected = false;
                    });
                    item.selected = true;
                }else{
                    _.each($scope.roomDetail.fixed, function(seat){
                        seat.selected = false;
                    });
                    item.selected = true;
                    getFixedUsage();
                }
                
            };

            $scope.selectFilter = function(item, tag){
                if(tag == 'status'){
                    item.selected = !item.selected;

                    _.each(_.without($scope.productFilters.status, item), function(item){
                        item.selected = false;
                    });
                    item.selected ? $scope.selectedStatus = item : $scope.selectedStatus = '';
                }else{
                    item.selected = !item.selected;
                    $scope.selectedProFilter = _.filter($scope.productFilters.type, 'selected', true);
                }
            };

            $scope.allFilter = function(flag){
                _.each($scope.productFilters.type, function(item){
                    item.selected = flag;
                });
                if(!flag){
                    $scope.selectedStatus.selected = false;
                    $scope.selectedStatus = '';
                }
                $scope.selectedProFilter = _.filter($scope.productFilters.type, 'selected', true);
            };

            $scope.changePosition = function(item, action) {
                var params = {action: action};
                SpaceService.changePosition(item.product.id, params).success(function() {
                    action == 'up' ? noty('info', '上移成功！') : noty('info', '下移成功！');
                    getRecommendList();
                });
            };

            $scope.addRecommend = function(id, $hide) {
                $hide ? $hide() : '';
                var params = [id];
                SpaceService.addRecommend(params).success(function() {
                    noty('info', '设置推荐成功！');
                    if($scope.pageType == 'list') {
                        $scope.selectedRoomType.type == 'recommend' ? '' : getComSpaceList(true);
                        getRecommendList();
                    }else {
                        getProductDetail(SpaceService.getSearchParam('productId'));
                    }
                }).error(function(data) {
                    if(data.code === 409) {
                        noty('error', '最多只能设置5个推荐空间！');
                    }
                });
            };

            $scope.deleteRecommend = function(id, $hide) {
                $hide ? $hide() : '';
                var params = {};
                params['id[]'] = id;
                SpaceService.deleteRecommend(params).success(function() {
                    noty('info', '取消推荐成功！');
                    if($scope.pageType == 'list') {
                        $scope.selectedRoomType.type == 'recommend' ? '' : getComSpaceList(true);
                        getRecommendList();
                    }else {
                        getProductDetail(SpaceService.getSearchParam('productId'));
                    }
                });
            };

            $scope.setVisible = function(flag, $hide){
                $hide ? $hide() : '';
                var params = [{'op': 'add', 'path': '/visible', 'value': flag}];
                
                var productId = $scope.pageType === 'spaceDetail' ? SpaceService.getSearchParam('productId') : $scope.spaceItem.product.id;
                if(!flag){
                    $scope.pageType === 'spaceDetail' && $scope.productItem.sales_recommend ? $scope.deleteRecommend(productId) : '';
                    $scope.pageType === 'list' && $scope.spaceItem.product.sales_recommend ? $scope.deleteRecommend(productId) : '';
                }else {
                    if($scope.spaceItem.rent_type == 'long') {
                        params.push({'op': 'add', 'path': '/earliest_rent_date', 'value': formatDate($scope.productItem.earliest_rent_date, 'yyyy-MM-dd')});
                        params.push({'op': 'add', 'path': '/appointment', 'value': true});
                    }
                }

                SpaceService.setVisible(params, productId).success(function(){
                    if($scope.pageType === 'spaceDetail'){
                        getProductDetail(SpaceService.getSearchParam('productId'));
                    }else {
                        getComSpaceList();
                    }
                    noty('info', flag ? '上架成功！' : '下架成功！');
                });
            };

            $scope.seeStatusPop = function(type){
                $scope.popType = type;
                events.emit('modal', {
                    scope: $scope,
                    placement: 'bottom',
                    animation: 'am-fade',
                    template: 'setStatusPopTpl'
                });
            };

            $scope.setAppointment = function($hide){
                var params = [{'op': 'add', 'path': '/appointment', 'value': !$scope.productItem.appointment}];
                if(!$scope.productItem.appointment){
                    params.push({'op': 'add', 'path': '/earliest_rent_date', 'value': formatDate($scope.productItem.earliest_rent_date, 'yyyy-MM-dd')});
                }
                $hide();
                SpaceService.setVisible(params, $scope.productItem.id).success(function(){
                    $scope.productItem.appointment = !$scope.productItem.appointment;
                });
            };

            $scope.spacePreorder = function(set,$hide){
                $scope.validationFlag = validation(set.unit_price);
                var orderParam = getOrderParam(set.unit_price);
                if($scope.validationFlag){
                    var params = {
                        product_id: $scope.productItem.id,
                        user_id: $scope.users.select.id,
                        time_unit: set.unit_price,
                        start_date: set.unit_price == 'hour' ? (formatDate(new Date(orderParam.start_date), 'yyyy-MM-dd') + ' ' + orderParam.times.start.name) : formatDate(orderParam.start_date, 'yyyy-MM-dd'),
                        rent_period: orderParam.rent_period,
                        price: set.base_price * orderParam.rent_period,
                        discount_price: orderParam.discount_price ? orderParam.discount_price : set.base_price * orderParam.rent_period
                    };
                    if(set.unit_price == 'day' && ($scope.productItem.room.type === 'meeting' || $scope.productItem.room.type === 'others')){
                        // params.start_date = formatDate(new Date(orderParam.start_date), 'yyyy-MM-dd') + ' ' + formatDate(new Date($scope.productItem.room.meeting[0].start_hour), 'hh:mm:ss');
                        params.start_date = formatDate(new Date(orderParam.start_date), 'yyyy-MM-dd') + ' 00:00:00';
                    }
                    SpaceService.spacePreorder(params).success(function(data){
                        $hide();
                        initParams();
                        $scope.order_id = data.order_id;
                        $scope.dialogType = 'confTips';
                        showReserveDlg();
                    }).error(function(data){
                        if(data.code === 409){
                            noty('error', '推送空间订单时间冲突');
                        }else if(data.code === 400021){
                            noty('error', '您所选的时间段内房间不开放');
                        }else if(data.code === 400022){
                            noty('error', '您所选的时间段商品已下架');
                        }else{
                            noty('error', '推送空间订单失败');
                        }
                     });
                }
            };

            $scope.spaceReserve = function(set, $hide){
                $scope.validationFlag = validation(set.unit_price);
                var orderParam = getOrderParam(set.unit_price);
                if($scope.validationFlag){
                    var params = {
                        product_id: $scope.productItem.id,
                        time_unit: set.unit_price,
                        start_date: set.unit_price == 'hour' ? (formatDate(new Date(orderParam.start_date), 'yyyy-MM-dd') + ' ' + orderParam.times.start.name) : formatDate(orderParam.start_date, 'yyyy-MM-dd'),
                        rent_period: orderParam.rent_period
                    };
                    if(set.unit_price == 'day' && ($scope.productItem.room.type === 'meeting' || $scope.productItem.room.type === 'others')){
                        params.start_date = formatDate(new Date(orderParam.start_date), 'yyyy-MM-dd') + ' ' + formatDate(new Date($scope.productItem.room.meeting[0].start_hour), 'hh:mm:ss');
                    }
                    SpaceService.spaceReserve(params).success(function(data){
                        $hide();
                        $scope.order_id = data.order_id;
                        $scope.dialogType = 'confTips';
                        showReserveDlg();
                    }).error(function(data){
                        if(data.code === 409){
                            noty('error', '设置内部占用时间冲突');
                        }else if(data.code === 400021){
                            noty('error', '您所选的时间段内房间不开放');
                        }else if(data.code === 400022){
                            noty('error', '您所选的时间段商品已下架');
                        }else{
                            noty('error', '设置内部占用失败');
                        }
                    });
                }
            };

            $scope.searchByPhone = function(){
                if($scope.editOptions.searchkey){
                    var params = {
                        'query': $scope.editOptions.searchkey
                    };
                    SpaceService.searchByPhone(params).success(function(data){
                        if(data.length >0){
                            $scope.editOptions.searchkey = '';
                            data[0].avatar = CONF.file + '/person/' + data[0].id + '/avatar_small.jpg';
                            $scope.editOptions.visible_user_id = data[0].id;
                            $scope.userOptions[$scope.editOptions.visible_user_id] = data[0];
                        }
                    });
                }
            };

            $scope.deleteVisUser = function(){
                $scope.editOptions.visible_user_id = 0;
                $scope.userOptions[$scope.productItem.visible_user_id] = '';
            };

            $scope.editProduct = function(){
                $scope.validationFlag = validationUpdate();
                if($scope.validationFlag){
                    var params = {
                        //unit_price: $scope.roomTypeObject[$scope.editOptions.room.type].units[0].unit,
                        private: $scope.editOptions.visible_user_id ? true : false,
                        room_id: SpaceService.getSearchParam('roomId'),
                        visible: $scope.editOptions.visible ? $scope.editOptions.visible : true,
                        start_date: formatDate($scope.editOptions.start_date, 'yyyy-MM-dd'),
                        price_rule_include_ids: [],
                        price_rule_exclude_ids: [],
                        leasing_sets: [],
                        rent_type_include_ids: _.pluck(_.filter($scope.supplementaryList, function(item){return item.selected}), 'id')
                    };
                    _.each($scope.leasingTypes, function(item) {
                        item.unit_price == 'hour' ? item.amount = item.amount.name : '';
                        item.selected && item.unit_price != 'longterm' ? params.leasing_sets.push(_.pick(item, 'base_price', 'unit_price', 'amount')) : '';
                        if(item.selected && item.unit_price == 'longterm') {
                            params.rent_set = {};
                            params.rent_set.status = 1;
                            params.rent_set.base_price = $scope.editOptions.rent_set.base_price;
                            params.rent_set.unit_price = 'month';
                            params.rent_set.deposit = $scope.editOptions.rent_set.deposit;
                            params.rent_set.earliest_rent_date = formatDate($scope.editOptions.rent_set.earliest_rent_date, 'yyyy-MM-dd');
                            params.rent_set.rental_info = $scope.editOptions.rent_set.rental_info;
                        }
                        if(!item.selected && item.unit_price == 'longterm'){
                            params.rent_set = {};
                            params.rent_set.status = 0;
                        }
                    });
                    if($scope.editOptions.room.type_tag == 'dedicated_desk') {
                        params.seats = [];
                        _.each($scope.editOptions.room.fixed, function(item){
                            params.seats.push({id: item.id, price: parseFloat(item.base_price)});
                        });
                    }
                    
                    $scope.editOptions.visible_user_id != '' ? params.visible_user_id = $scope.editOptions.visible_user_id : '';
                    if($scope.productType == 'edit'){
                        SpaceService.editProduct($scope.productItem.id, params).success(function(){
                            noty('info', '设置成功！');
                            $scope.backToHistory();
                        });
                    }else{
                        SpaceService.createProduct(params).success(function(data){
                            noty('info', '创建成功！');
                            if($scope.newRoom == 'yes'){
                                $scope.backToList();
                            }else{
                                SpaceService.updateSearchParam('ptype', 'spaceDetail');
                                SpaceService.updateSearchParam('productId', data.id);
                            }
                        });
                    }
                }
            };

            /***** for public *****/
            $scope.seePopover = function(tag, item){
                $scope.pageType === 'list' ? resetFilterStorage() : '';
                item ? $scope.spaceItem = item : '';
                $scope.popoverType = tag;
                if(tag == 'options'){
                    if(!$scope.currentAdmin.preorderMap[$scope.PERMISSION_PREORDER_KEY + item.building_id] && !$scope.currentAdmin.reserveMap[$scope.PERMISSION_RESERVE_KEY + item.building_id]
                     && (!$scope.currentAdmin.productMap[$scope.PERMISSION_PRODUCT_KEY + item.building_id] || $scope.currentAdmin.productMap[$scope.PERMISSION_PRODUCT_KEY + item.building_id] < 2) 
                     && !$scope.currentAdmin.user.is_super_admin || !item.has_rent){
                        $scope.operateMore = true;
                    }else{
                        $scope.operateMore = false;
                    }
                }
            };

            $scope.show = function(){
                $scope.showItem = $scope.showItem ? false: true;
            };

            $scope.addItem = function(options, key){
                var temp = {};
                temp[key] = '';
                !$scope[options] ? $scope[options] = [] : '';
                $scope[options].push(temp);
            };
            
            $scope.deleteItem = function(options, index, roomTypeFlag){
                var temp = options.splice(index, 1);
                if(roomTypeFlag){
                    $scope.deleteRoomTypeImgs.push({id: temp[0].id});
                }
            };

            $scope.backToHistory = function(){
                window.history.back();
            };

            $scope.autoClose = function($hide){
                $hide();
            };
            //add for product
            $scope.seeProduct = function(item, tag, flag){
                $scope.pageType === 'list' ? resetFilterStorage() : '';
                SpaceService.updateSearchParam('renttype', item.type);
                SpaceService.updateSearchParam('ptype', 'operateProduct');
                SpaceService.updateSearchParam('productType', tag);
                SpaceService.updateSearchParam('roomId', item.id);
                SpaceService.updateSearchParam('communityId', $scope.selectedCommunity.id);
                flag ? SpaceService.updateSearchParam('new', 'yes') : '';
                if(tag == 'edit'){
                    SpaceService.updateSearchParam('productId', item.product.id);
                }
            };

            $scope.backToList = function(){
                _.each($location.search(), function(value, key){
                    SpaceService.updateSearchParam(key, '');
                });
            };

            $scope.showSpaceOffLineConfirm = function($hide){
                $hide();
                events.emit('confirm', {
                    title: '下架空间',
                    content: '是否下架此空间？ 下架后此空间将不在创合APP展示，但你仍可对空间进行编辑经及上架操作。',
                    btnName: '下架',
                    onConfirm: function() {
                        $scope.setVisible(false)
                    }
                });
            };

            $scope.showSpaceOnLineConfirm = function($hide){
                $hide();
                if($scope.spaceItem.rent_type == 'long') {
                    $scope.seeStatusPop('visible');
                }else {
                    events.emit('confirm', {
                        title: '上架空间',
                        content: '是否上架此空间？ 上架后此空间将在创合APP展示，请确保信息正确。',
                        btnName: '上架',
                        btnClass: 'btn-success',
                        onConfirm: function() {
                            $scope.setVisible(true)
                        }
                    });
                }
            };

            $scope.generateLeases = function(productId, hide){
                _.each($location.search(), function(value, key){
                    SpaceService.updateSearchParam(key, '');
                });
                hide ? hide() : '';
                $location.path('/trade');
                $location.search('tabtype', 'longrent');
                $location.search('ptype', 'createAgreement');
                $location.search('productId', productId);
            };

            // $scope.recoverPrice = function(set){
            //     if(set.unit_price === 'hour'){
            //         $scope.hourOrderParam.discount_price = '';
            //         $scope.hourOrderParam.origin_price = false;
            //     }else if(set.unit_price === 'day'){
            //         $scope.dayOrderParam.discount_price = '';
            //         $scope.dayOrderParam.origin_price = false;
            //     }else if(set.unit_price === 'week'){
            //         $scope.weekOrderParam.discount_price = '';
            //         $scope.weekOrderParam.origin_price = false;
            //     }else if(set.unit_price === 'month'){
            //         $scope.monthOrderParam.discount_price = '';
            //         $scope.monthOrderParam.origin_price = false;
            //     }
            // };

            $scope.goPage = function(index){
                $scope.pageOptions.pageIndex = index;
                if($scope.spaceDetailTab == 3){
                    getLeasesLists();
                }else if($scope.spaceDetailTab == 2){
                    getAppointmentList();
                }
            };

            $scope.deleteCommunityImg = function(item, index){
                SpaceService.deleteCommunityImage(item.id).success(function(){
                    $scope.communityImages.splice(index, 1);
                    noty('info', '删除社区图片成功！');
                });
            };

            $scope.addCommunityImg = function(){
                $('#uploadCommunityImg').click();
            };

            $scope.seeCommunityImages = function(communityId, $hide){
                SpaceService.updateSearchParam('ptype', 'communityImages');
                communityId ? SpaceService.updateSearchParam('communityId', communityId) : '';
                $hide ? $hide() : '';
            };

            $scope.showCropView = function(pic){
                $scope.selectedCropImgUrl = pic.content;
                $scope.selectedPic = pic;
                if($scope.dialogType === 'add-main-pic'){
                    $scope.cropFlag = 'building';
                }else if($scope.dialogType === 'add-logo-pic'){
                    $scope.cropFlag = 'logo';
                }else if($scope.dialogType === 'select-room-pic'){
                    $scope.selecteMain ? $scope.cropFlag = 'room-main' : $scope.cropFlag = 'room';
                }
                $scope.prevDialogType = $scope.dialogType;
                $scope.dialogType = 'crop';
                if($scope.pageType == 'addCommunity') {
                    events.emit('modal', {
                        scope: $scope,
                        placement: 'bottom',
                        animation: 'am-fade',
                        template: 'dialogTpl'
                    });
                }
            };

            $scope.backToCommunityImages = function(){
                $scope.dialogType = $scope.prevDialogType;
            };

            $scope.uploadRoomImage = function(hide){
                
                if($scope.prevDialogType === 'add-main-pic'){
                    SbCropImgService.cropImage($scope.selectedCropImgUrl, $scope.obj.coords, $scope.cropOptions, $scope.gallery.building);
                }else if($scope.prevDialogType === 'add-logo-pic'){
                    var params = angular.copy($scope.cropOptions);
                    params.width = 100;
                    params.height = 100;
                    SbCropImgService.cropImage($scope.selectedCropImgUrl, $scope.obj.coords, params, $scope.form.logoImage);
                }else if($scope.prevDialogType === 'select-room-pic'){
                    SbCropImgService.cropImage($scope.selectedCropImgUrl, $scope.obj.coords, $scope.cropOptions, $scope.cropedRoomPic);
                }
                hide();
            };

            $scope.selectTypeTag = function(item){
                $scope.selectedTag ? $scope.selectedTag.selected = false : '';
                item.selected = true;
                $scope.selectedTag = item;
            };

            $scope.$watch('dayOrderParam.start_date', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                testText(newValue) ? $scope.dayOrderParam.start_date = '' : '';
                getRentPeriod('day');
            }, true);

            $scope.$watch('dayOrderParam.end_date', function(newValue, oldValue) {
                newValue && newValue !== oldValue ? getRentPeriod('day') : '';
                testText(newValue) ? $scope.dayOrderParam.end_date = '' : '';
                _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'day' ? set.rent_period = true : ''});
            }, true);

            $scope.$watch('hourOrderParam.start_date', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                testText(newValue) ? $scope.hourOrderParam.start_date = '' : '';
                getRentPeriod('hour');
            }, true);

            $scope.$watch('hourOrderParam.end_date', function(newValue, oldValue) {
                newValue && newValue !== oldValue ? getRentPeriod('hour') : '';
                testText(newValue) ? $scope.hourOrderParam.end_date = '' : '';
            }, true);

            $scope.$watch('hourOrderParam.rent_period', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(isNaN($scope.hourOrderParam.rent_period)){
                    $scope.hourOrderParam.rent_period = '';
                }
                $scope.menuState.origin_price = false;
                _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'hour' ? set.rent_period = true : ''});
            }, true);

            $scope.$watch('weekOrderParam.rent_period', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(isNaN($scope.weekOrderParam.rent_period)){
                    $scope.weekOrderParam.rent_period = '';
                }
                $scope.menuState.origin_price = false;
                _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'week' ? set.rent_period = true : ''});
            }, true);

            $scope.$watch('monthOrderParam.rent_period', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if(isNaN($scope.monthOrderParam.rent_period)){
                    $scope.monthOrderParam.rent_period = '';
                }
                $scope.menuState.origin_price = false;
                _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'month' ? set.rent_period = true : ''});
            }, true);

            $scope.$watch('hourOrderParam.times.start', function(newValue, oldValue) {
                newValue && newValue !== oldValue ? getRentPeriod('hour') : '';
            }, true);

            $scope.$watch('hourOrderParam.times.end', function(newValue, oldValue) {
                newValue && newValue !== oldValue ? getRentPeriod('hour') : '';
            }, true);

            $scope.$watch('hourOrderParam.discount_price', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.hourOrderParam.discount_price < $scope.hourOrderParam.base_price * $scope.hourOrderParam.rent_period){
                    $scope.hourOrderParam.origin_price = true;
                }
                if($scope.hourOrderParam.discount_price == ''){
                    $scope.hourOrderParam.origin_price = false;
                    _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'hour' ? set.input_visb = false : ''});
                }
            }, true);

            $scope.$watch('dayOrderParam.discount_price', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.dayOrderParam.discount_price < $scope.dayOrderParam.base_price * $scope.dayOrderParam.rent_period){
                    $scope.dayOrderParam.origin_price = true;
                }
                if($scope.dayOrderParam.discount_price == ''){
                    $scope.dayOrderParam.origin_price = false;
                    _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'day' ? set.input_visb = false : ''});
                }
            }, true);

            $scope.$watch('weekOrderParam.discount_price', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.weekOrderParam.discount_price < $scope.weekOrderParam.base_price * $scope.weekOrderParam.rent_period){
                    $scope.weekOrderParam.origin_price = true;
                }
                if($scope.weekOrderParam.discount_price == ''){
                    $scope.weekOrderParam.origin_price = false;
                    _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'week' ? set.input_visb = false : ''});
                }
            }, true);

            $scope.$watch('monthOrderParam.discount_price', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.monthOrderParam.discount_price < $scope.monthOrderParam.base_price * $scope.monthOrderParam.rent_period){
                    $scope.monthOrderParam.origin_price = true;
                }
                if($scope.monthOrderParam.discount_price == ''){
                    $scope.monthOrderParam.origin_price = false;
                    _.each($scope.productItem.leasing_sets, function(set){set.unit_price === 'month' ? set.input_visb = false : ''});
                }
            }, true);

            $scope.$watch('calendarOptions.date', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                getMeetingUsage();
            }, true);

            $scope.$watch('calendarOptions.year', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.roomDetail.type == 'office'){
                    getOfficeUsage();
                }else if($scope.roomDetail.type == 'longterm'){
                    getLongtermUsage();
                }else if($scope.roomDetail.type == 'fixed'){
                    getFixedUsage();
                }
            }, true);

            $scope.$watch('calendarOptions.start', function(newValue, oldValue) {
                if(newValue === oldValue){
                    return;
                }
                if($scope.roomDetail && $scope.roomDetail.type == 'flexible'){
                    getFlexibleUsage();
                }
                getDateInfo($scope.productItem, $scope.calendarOptions.type, $scope.calendarOptions.start, $scope.calendarOptions.end);
            }, true);

            $scope.$watch('selectedRoomType', function(newValue, oldValue) {
                if(newValue && newValue !== oldValue && $scope.pageType === 'list') {
                    $scope.selectedRoomType.type == 'recommend' ? getRecommendList() : getComSpaceList();
                }
            }, true);

            $scope.$watch('filterOptions.country', function(newValue, oldValue) {
                if(newValue && newValue !== oldValue){
                    if(newValue.id) {
                        getRegions(newValue.id, 'province');
                    }else {
                        getHotCities(newValue.value);
                    }
                    
                    if($rootScope.selectDropdown){
                        $scope.provinces = [];
                        $scope.filterOptions.province = '';
                        $scope.filterOptions.city = '';
                        $scope.filterOptions.district = '';
                    }
                }
            }, true);

            $scope.$watch('filterOptions.province', function(newValue, oldValue) {
                if(newValue && newValue !== oldValue){
                    getRegions(newValue.id, 'city');
                    if($rootScope.selectDropdown){
                        $scope.filterOptions.city = '';
                        $scope.filterOptions.district = ''; 
                    }
                }
                
            }, true);

            $scope.$watch('filterOptions.city', function(newValue, oldValue) {
                if(newValue && newValue !== oldValue){
                    getRegions(newValue.id, 'district');
                    $rootScope.selectDropdown ? $scope.filterOptions.district = '' : '';
                }
            }, true);

            $scope.$watch('search.name', function(newValue, oldValue) {
                if(newValue && newValue !== oldValue){
                    $timeout(function() {
                        $scope.visibleCount = document.getElementsByClassName('a-info').length;
                    }, 500);
                }
            }, true);

            $scope.$watch('cropedRoomPic.length', function(newValue, oldValue) {
                if(newValue && newValue !== oldValue){
                    var temp = {};
                    temp.filename = $scope.cropedRoomPic[0].filename;
                    temp.content = $scope.cropedRoomPic[0].download_link;
                    temp.preview = $scope.cropedRoomPic[0].preview_link;
                    temp.attachment_type = $scope.cropedRoomPic[0].content_type;
                    temp.size = 0;
                    temp.building_id = '';
                    temp.room_type = 'office';
                    SpaceService.uploadCommunityImage(temp).success(function(data){
                        $scope.cropedRoomPic[0].id = data.id;
                        $scope.cropedRoomPic[0].parent_id = $scope.selectedPic.id;
                        $scope.cropFlag == 'room' ? $scope.selectedRoomPics.push($scope.cropedRoomPic[0]) : $scope.roomMainPic = $scope.cropedRoomPic[0];
                    });
                }
            }, true);
            
            $scope.prevInput = function(e){
                e.keyCode == 110 || e.keyCode == 8 || e.keyCode == 48 || e.keyCode == 49 || e.keyCode == 50 || e.keyCode == 51 || e.keyCode == 52 || e.keyCode == 53 || e.keyCode == 54 || e.keyCode == 55 || e.keyCode == 56 || e.keyCode == 57? '' : e.preventDefault();
            };

        };

        return ['$rootScope', '$scope', 'SpaceService', 'events', 'CONF', 'ImageUploaderService', 'CurrentAdminService', '$translate', 'GalleryUploadImage', '$sce', '$filter', 'utils', 'FilterStorageService', '$timeout', '$location', '$cookies', 'SbCropImgService', SpaceController];
    });

})(define);
