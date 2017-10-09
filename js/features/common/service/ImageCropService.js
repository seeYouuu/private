/**
 * Common service used to crop a single image
 */
(function(define) {
'use strict';

/**
 * Register the ImageCropService class with RequireJS
 */
define(['FeatureBase'], function(FeatureBase) {

    var ImageCropService = function($q, ImageCropConfig) {

        var IMAGE_WIDTH, IMAGE_HEIGHT;
        var PREFIX_LENGTH  = 'data:image/jpeg;base64,'.length;

        var resizeImageHeight = function (ImageSrc, deferred, base64Flag) {
            var resizeImage = new Image();
            resizeImage.onload = function () {
                var image = this;
                var canvas = document.createElement('canvas');
                canvas.width = IMAGE_WIDTH;
                canvas.height = IMAGE_HEIGHT;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
                if(base64Flag){
                    deferred.resolve(
                        canvas.toDataURL('image/jpeg')
                    );
                }else{
                    deferred.resolve(
                        canvas.toDataURL('image/jpeg').slice(PREFIX_LENGTH)
                    );
                }
            };
            resizeImage.src = ImageSrc;
        };

        var getCroppedImageURL = function (deferred, imageToCrop, base64Flag) {

            var drawWidth = IMAGE_WIDTH;
            var drawHeight = imageToCrop.height * IMAGE_WIDTH / imageToCrop.width;

            // Create an empty canvas element
            var canvas = document.createElement('canvas');
            canvas.width = drawWidth;
            canvas.height = drawHeight;
            canvas.getContext('2d').drawImage(
                imageToCrop, 0, 0, drawWidth, drawHeight
            );
            var resizeResult = canvas.toDataURL('image/jpeg');

            if (drawHeight === IMAGE_HEIGHT) {
                if(base64Flag){
                    deferred.resolve(resizeResult);
                }else{
                    deferred.resolve(resizeResult.slice(PREFIX_LENGTH));
                }
                
                return;
            }
            if (drawHeight < IMAGE_HEIGHT) {
                resizeImageHeight(resizeResult, deferred, base64Flag);
                return;
            }
            var croppedImage = new Image();
            croppedImage.onload = function () {
                var image = this;
                var canvas2 = document.createElement('canvas');
                canvas2.width = drawWidth;
                canvas2.height = IMAGE_HEIGHT;
                var ctx = canvas2.getContext('2d');
                ctx.rect(0, 0, drawWidth, IMAGE_HEIGHT);
                ctx.clip();
                ctx.drawImage(image, 0, 0);
                if(base64Flag){
                    deferred.resolve(
                        canvas2.toDataURL('image/jpeg')
                    );
                }else{
                    deferred.resolve(
                        canvas2.toDataURL('image/jpeg').slice(PREFIX_LENGTH)
                    );
                }
            };
            croppedImage.src = resizeResult;
        };

        this.cropImage = function (
            file,
            customWidth,
            customHeight,
            base64Flag
        ) {
            var deferred = $q.defer();

            IMAGE_WIDTH = customWidth ? customWidth : ImageCropConfig.width;
            IMAGE_HEIGHT = customHeight ? customHeight : ImageCropConfig.height;

            var reader = new FileReader();
            reader.onloadend = function(loadEvent) {
                var mediaElement = new Image();
                mediaElement.onload = function () {
                    var image = this;
                    getCroppedImageURL(
                        deferred,
                        image,
                        base64Flag
                    );
                };
                mediaElement.src = loadEvent.target.result;
            };
            reader.readAsDataURL(file);

            return deferred.promise;
        }

    };

    var Feature = FeatureBase.extend(function() {

        this.initializer = function() {
            this.super.initializer('ImageCropModule');
        };

        this.run = function () {
            this.mod
                .service(
                    'ImageCropService',
                    [
                        '$q',
                        'ImageCropConfig',
                        ImageCropService
                    ]
                )
                .constant(
                    'ImageCropConfig',
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