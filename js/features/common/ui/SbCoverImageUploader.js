(function(define) {
    'use strict';

    define(['FeatureBase'], function(Base) {

        var Feature = Base.extend(function() {

            var features = require.toUrl('features');

            this.initializer = function() {
                this.super.initializer('SbCoverImageUploaderModule');
            };

            this.constructor = function() {

                this.lang = {
                    zh: {
                        IMAGE_SIZE_ERROR: '图片大于500KB',
                        IMAGE_TYPE_ERROR: '不支持的图片格式'
                    },
                    en: {
                        IMAGE_SIZE_ERROR: 'Image size bigger than 500KB',
                        IMAGE_TYPE_ERROR: 'Unsupported image format'
                    }
                };
            };

            this.run = function() {

                var dir = function($q, $translate, events, http, utils, ImageCropService, ImageCropConfig, CONF) {

                    var MAX_IMG_SIZE = CONF.coverImageMaxSize;
                    var SUPPORTED_IMAGE_TYPE = ['image/png', 'image/jpeg'];

                    var noty = function(type, msg) {
                        events.emit('alert', {
                            type: type,
                            message: msg,
                            onShow: function() {},
                            onClose: function() {}
                        });
                    };

                    var uploadImage = function (server, target, base64, previewFlag) {
                        var url = server ? server : utils.getapi(
                                'plugins/fileServer/fileservice/admin',
                                'xmppDomain'
                            );
                        var params = {
                                    type: 'base64',
                                    target: target
                                };
                        if(previewFlag){
                            params.preview_width = 100;
                            params.preview_height = 100;
                        }
                        return http.post(
                            url,
                            {
                                public_b64: base64
                            },
                            {
                                params: params,
                                withCredentials: false
                            }
                        );
                    };

                    var handle_result = function (scope, element, result) {
                        uploadImage(scope.server, scope.target, result, scope.preview).success(
                            function (data) {
                                scope.url = data.download_link;
                                scope.attachment = data;
                                scope.isUploading = false;
                            }
                        ).error(
                            function (response) {
                                noty('error', response.error);
                                scope.isUploading = false;
                                element.find('input[type="file"]').val('');
                            }
                        )
                    };

                    return {
                        restrict: 'E',
                        templateUrl: features + '/common/ui/SbCoverImageUploader.html',
                        transclude: true,
                        scope: {
                            url: '=',
                            attachment: '=?',
                            isUploading: '=?',
                            target: '@',
                            server: '=',
                            defaultUrl: '@',
                            errorUrl: '@',
                            noInstruction: '@?',
                            showRule: '@?',
                            imageWidth: '@?',
                            imageHeight: '@?',
                            ignoreSize: '=',
                            preview: '@'
                        },
                        link: function($scope, element, attrs) {

                            $scope.imageWidth = $scope.imageWidth ?
                                $scope.imageWidth :
                                ImageCropConfig.width
                            ;
                            $scope.imageHeight = $scope.imageHeight ?
                                $scope.imageHeight :
                                ImageCropConfig.height
                            ;
                            var base64Flag = false;
                            
                            element.find('[type="file"]').on('change', function(event) {
                                var file = event.target.files[0];
                                console.log(event.target.files);
                                if (
                                    SUPPORTED_IMAGE_TYPE.indexOf(
                                        file.type.toLowerCase()
                                    ) == -1
                                ) {
                                    noty('error', $translate.instant('IMAGE_TYPE_ERROR'));
                                    return;
                                }
                                if (file.size > MAX_IMG_SIZE  && !$scope.ignoreSize) {
                                    noty('error', $translate.instant('IMAGE_SIZE_ERROR'));
                                    return;
                                }
                                $scope.isUploading = true;

                                if($scope.server){
                                    base64Flag = $scope.server.indexOf('xmpp.sandbox3.cn') > 0 ? false : true;
                                }
                                
                                ImageCropService.cropImage(
                                    file,
                                    $scope.imageWidth,
                                    $scope.imageHeight,
                                    base64Flag
                                ).then(
                                    handle_result.bind(
                                        undefined,
                                        $scope,
                                        element
                                    )
                                );
                            });
                        }
                    };
                };

                this.mod.directive('sbCoverImageUploader',  ['$q', '$translate', 'events', 'http', 'utils', 'ImageCropService', 'ImageCropConfig', 'CONF', dir]);
            };

        });

        return Feature;

    });


})(define);