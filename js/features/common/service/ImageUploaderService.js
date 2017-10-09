/**
 * Common service used to upload a single image
 */
(function(define) {
    'use strict';

    /**
     * Register the CurrentAdminService class with RequireJS
     */
    define(['FeatureBase'], function(FeatureBase) {

        var ImageUploaderService = function(FileUploader, $translate, $cookies, CONF, events) {

            FileUploader.FileSelect.prototype.isEmptyAfterSelection = function() {
                return true;
            };

            var SUPPORTED_IMAGE_TYPE = ['image/png', 'image/jpeg', 'image/gif'];
            var UPLOAD_URL = 'plugins/fileServer/fileservice/sales/admin';

            var noty = function(type, msg) {
                events.emit('alert', {
                    type: type,
                    message: msg,
                    onShow: function() {},
                    onClose: function() {}
                });
            };

            var onBeforeUploadItem = function (
                compress,
                target,
                item
            ) {
                console.log('onBeforeUploadItem');
                var authString = $cookies.get('sb_admin_token');

                item.url = item.url + '?target=' + target;

                if (authString === undefined) {
                    noty('error', $translate.instant('NO_AUTH_ERROR'));
                    item.cancel();
                    item.remove();
                    return;
                }


                if (SUPPORTED_IMAGE_TYPE.indexOf(item.file.type) === -1) {
                    noty('error', $translate.instant('IMAGE_TYPE_ERROR'));
                    item.cancel();
                    item.remove();
                    return;
                }

                if (compress === true) {
                    item.url += '&type=image';
                }

                item.headers = {
                    'Authorization': authString
                };

            };

            /**
             * common image uploader creator
             * @param ifCompress
             * @param target
             * @param on_success
             * @returns {*}
             * @private
             */
            var createUploader = function (
                ifCompress,
                target,
                on_success
            ) {
                var uploader = new FileUploader(
                    {
                        // url: CONF.xmppDomain + UPLOAD_URL,
                        // Automatically upload files after adding them to the queue
                        url: CONF.api + UPLOAD_URL,
                        autoUpload: true,
                        removeAfterUpload: true
                    }
                );
                uploader.onBeforeUploadItem = onBeforeUploadItem.bind(
                    undefined,
                    ifCompress,
                    target
                );
                uploader.onSuccessItem = on_success;

                return uploader;
            };

            /**
             * @method createCompressedImageUploader
             * @param target
             * @param on_success
             * @public
             */
            var createCompressedImageUploader = createUploader.bind(
                undefined,
                true
            );

            /**
             * @method createUncompressedImageUploader
             * @param target
             * @param on_success
             * @public
             */
            var createUncompressedImageUploader = createUploader.bind(
                undefined,
                false
            );

            var createGalleryUploader = function () {
                var uploader = new FileUploader();
                uploader.onBeforeUploadItem = function (item) {
                    if (SUPPORTED_IMAGE_TYPE.indexOf(item.file.type) === -1) {
                        noty('error', $translate.instant('IMAGE_TYPE_ERROR'));
                        item.cancel();
                        item.remove();
                        return;
                    }
                };

                return uploader;
            };

            return {
                createCompressedImageUploader: createCompressedImageUploader,
                createUncompressedImageUploader: createUncompressedImageUploader,
                createGalleryUploader: createGalleryUploader
            };

        };

        var Feature = FeatureBase.extend(function() {

            this.constructor = function() {

                this.lang = {
                    zh: {
                        NO_AUTH_ERROR: '登录认证错误'
                    },
                    en: {
                        NO_AUTH_ERROR: 'login authorization error'
                    }
                };
            };

            this.initializer = function() {
                this.super.initializer('ImageUploaderModule');
            };

            this.run = function () {
                this.mod.factory(
                    'ImageUploaderService',
                    [
                        'FileUploader',
                        '$translate',
                        '$cookies',
                        'CONF',
                        'events',
                        ImageUploaderService
                    ]
                );
            };

        });

        return Feature;

    });

})(define);