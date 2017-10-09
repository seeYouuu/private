/**
 * Common service used to crop a single image
 */
(function(define) {
'use strict';

/**
 * Register the ImageCropService class with RequireJS
 */
define(['FeatureBase'], function(FeatureBase) {

    var SbImageCropService = function(SbCropImgConfig, utils, http) {

        
        var uploadImage = function (target, base64, previewFlag) {
            var url =  utils.getapi('plugins/fileServer/fileservice/sales/admin');
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
                    withCredentials: true
                }
            );
        };

        this.cropImage = function(src, coords, options, result){
            var tempImg = new Image();
            
            tempImg.setAttribute('crossOrigin', 'anonymous');

            tempImg.onload = function () {
                var image = this;
                var canvas = document.createElement('canvas');
                canvas.width = options && options.width ? options.width : SbCropImgConfig.width;
                canvas.height = options && options.height ? options.height : SbCropImgConfig.height;

                canvas.getContext('2d').drawImage(
                    image, coords[0], coords[1], coords[4], coords[5], 0, 0, canvas.width, canvas.height
                );
                var resultesult = canvas.toDataURL('image/jpeg');

                uploadImage(options.target, resultesult, options.previewFlag).success(function(data){
                    data.content = data.download_link ? data.download_link : data.content;
                    data.preview = data.preview_link ? data.preview_link : data.preview;
                    data.attachment_type = data.attachment_type ? data.attachment_type : data.content_type;
                    // result.push(data);
                    result.unshift(data);
                });
            };
            tempImg.src = src;
        };
    };

    var Feature = FeatureBase.extend(function() {

        this.initializer = function() {
            this.super.initializer('SbCropImgModule');
        };

        this.run = function () {
            this.mod
                .service(
                    'SbCropImgService',
                    [
                        'SbCropImgConfig',
                        'utils',
                        'http',
                        SbImageCropService
                    ]
                )
                .constant(
                    'SbCropImgConfig',
                    {
                        width: 640,
                        height: 420
                    }
                )
            ;
        };

    });

    return Feature;

});

})(define);