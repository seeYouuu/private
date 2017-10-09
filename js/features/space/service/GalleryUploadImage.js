/**
 *  Defines the AdminService
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    /**
     * Register the AdminService class with RequireJS
     */
    define(['lodash'], function(_) {

        /**
         * @constructor
         */
        var GalleryUploadImage = function(http, utils, ImageCropService, $q, SpaceService) {

            var commonUploadImage = function (imgBase64) {
                return http.post(
                    utils.getapi(
                        'plugins/fileServer/fileservice/sales/admin',
                        'api'
                    ),
                    {
                        public_b64: imgBase64
                    },
                    {
                        params: {
                            type: 'base64',
                            target: 'room',
                            preview_width: '100',
                            preview_height: '100'
                        },
                        withCredentials: false
                    }
                );
            };

            this.getUnitDesc = function(){
                return {
                    hour: '小时',
                    day: '天',
                    week: '周',
                    month: '月'
                }
            };

            this.getRentDesc = function() {
                return {
                    hour: '时租',
                    day: '天租',
                    week: '周租',
                    month: '月租'
                }
            };

            this.getStatusDesc = function(){
                return {
                    accept: '使用中',
                    banned: '冻结中',
                    invisible: '下架中',
                    pending: '审核中'
                };
            };

            this.getClockList = function(){
                return [{name: '00:00:00'},{name: '00:30:00'},{name: '01:00:00'},{name: '01:30:00'},{name: '02:00:00'},{name: '02:30:00'},{name: '03:00:00'},{name: '03:30:00'},{name: '04:00:00'},{name: '04:30:00'},
                        {name: '05:00:00'},{name: '05:30:00'},{name: '06:00:00'},{name: '06:30:00'},{name: '07:00:00'},{name: '07:30:00'},{name: '08:00:00'},{name: '08:30:00'},{name: '09:00:00'},
                        {name: '09:30:00'},{name: '10:00:00'},{name: '10:30:00'},{name: '11:00:00'},{name: '11:30:00'},{name: '12:00:00'},{name: '12:30:00'},{name: '13:00:00'},{name: '13:30:00'},{name: '14:00:00'},
                        {name: '14:30:00'},{name: '15:00:00'},{name: '15:30:00'},{name: '16:00:00'},{name: '16:30:00'},{name: '17:00:00'},{name: '17:30:00'},{name: '18:00:00'},{name: '18:30:00'},{name: '19:00:00'},
                        {name: '19:30:00'},{name: '20:00:00'},{name: '20:30:00'},{name: '21:00:00'},{name: '21:30:00'},{name: '22:00:00'},{name: '22:30:00'},{name: '23:00:00'},{name: '23:30:00'}];
            };

            this.getRentLimits = function(){
                return [{name: '0.5'}, {name: '1'}, {name: '1.5'}, {name: '2'}, {name: '2.5'}, {name: '3'}, {name: '3.5'}, {name: '4'}, {name: '4.5'}, {name: '5'}, {name: '5.5'}, {name: '6'}, {name: '6.5'}, {name: '7'}, {name: '7.5'}, {name: '8'}, {name: '8.5'}, {name: '9'}, {name: '9.5'}];
            };

            this.getProductFilters = function(){
                return {
                    status: [
                        {
                            name: '上架商品',
                            visible: true
                        },{
                            name: '下架商品',
                            visible: false
                        },{
                            name: '无租赁信息',
                            has_rent: false
                        }
                    ],
                    type: []
                };
            };

            this.getAgreementStatusDesc = function(){
                return {
                    confirming: '待确认',
                    reconfirming: '重新确认',
                    confirmed: '已确认',
                    performing: '履行中',
                    end: '已结束',
                    closed: '已关闭',
                    expired: '已超时',
                    matured: '已到期',
                    terminated: '已结束(终止)'
                };
            };

            this.getUnitList = function(){
                return [{
                        name: '小时',
                        value: 'hour'
                    },{
                        name: '天',
                        value: 'day'
                    },{
                        name: '月',
                        value: 'month'
                    }
                ];
            };

            this.getSteps = function(){
                return [{
                        step: 1,
                        des: '社区基本信息'
                    },{
                        step: 2,
                        des: '社区设置'
                    },{
                        step: 3,
                        des: '社区租赁设置'
                    },{
                        step: 4,
                        des: '提交成功'
                    }
                ];
            };

            this.getLeasingTypes = function(type) {
                var response = [];
                if(type == 'meeting' || type == 'others') {
                    response = [{
                        name: '时租',
                        unit_price: 'hour'
                    }, {
                        name: '日租',
                        unit_price: 'day',
                        amount: 1
                    }];
                }else if(type == 'desk') {
                    response = [{
                        name: '日租',
                        unit_price: 'day',
                        amount: 1,
                        base_price: ''
                    }, {
                        name: '周租',
                        unit_price: 'week',
                        amount: 1,
                        base_price: ''
                    }, {
                        name: '月租',
                        unit_price: 'month',
                        amount: 1,
                        base_price: ''
                    }];
                }else if(type == 'office') {
                    response = [{
                        name: '月租',
                        unit_price: 'month',
                        amount: 1,
                        base_price: ''
                    }, {
                        name: '长租设置',
                        unit_price: 'longterm'
                    }];
                }
                return response;
            };

            this.getTinymceOptions = function(){
                return {
                    content_css: 'js/bower/tinymce-dist/tinymce.min.css',
                    menubar: false,
                    elementpath: false,
                    min_height: 200,
                    width: 600,
                    toolbar:
                        'preview | ' +
                        'bold italic underline strikethrough forecolor backcolor  fontsizeselect | ' +
                        'blockquote bullist numlist alignleft aligncenter alignright alignjustify removeformat | ' +
                        'link sbimage'
                    ,
                    plugins: 'preview textcolor link sbimage',
                    paste_data_images: false

                }; 
            }

            this.cropAndUploadImage = function (type, scope, addedItems) {
                var uploader = this;
                var allPromises = _.map(
                    addedItems,
                    function (item) {
                        return ImageCropService.cropImage(
                            item._file,
                            640,
                            465,
                            true
                        );
                    }
                );
                $q.all(
                    allPromises
                ).then(
                    function (resolves) {
                        return $q.all(_.map(
                            resolves,
                            commonUploadImage
                        ));
                    }
                ).then(
                    function (resolves) {
                        _.forEach(
                            resolves,
                            function (response) {
                                var image = response.data;
                                var fileName = image.download_link.split('/');
                                var temp = {
                                    content: image.download_link,
                                    attachment_type: image.content_type,
                                    filename: fileName[fileName.length-1],
                                    preview: image.preview_link,
                                    size: '0',
                                    room_type: type !== 'building' ? type : ''
                                };
                                if(scope.pageType === 'addCommunity' || scope.pageType === 'editCommunity'){
                                    scope.gallery[type] = scope.gallery[type] ? scope.gallery[type] : [];
                                    scope.gallery[type].push(temp);
                                }else if(scope.pageType === 'addRoom' || scope.pageType === 'editRoom' || scope.pageType === 'copyRoom'){
                                    SpaceService.uploadRoomsImage(scope.selectedCommunityId, {room_attachments: [temp]}).success(function() {
                                        SpaceService.getBuildingAttachments({'building': scope.selectedCommunityId, 'type[]': scope.roomType}).success(function(data) {
                                            scope.roomPics = data;
                                            _.each(scope.roomPics, function(item) {
                                                _.contains(_.pluck(scope.selectedRoomPics, 'id'), item.id) ? item.selected = true : '';
                                                scope.roomMainPic.id == item.id ? item.mainSelected = true : '';
                                            });
                                        });
                                    });
                                    //scope.roomPics.push(temp);
                                }
                            }
                        );
                        uploader.clearQueue();
                    }
                );
            };
        };

        return ['http', 'utils', 'ImageCropService', '$q', 'SpaceService', GalleryUploadImage];

    });

})(define);
