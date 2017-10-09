/**
 * Common service used to upload a single excel
 */
(function(define) {
    'use strict';

    /**
     * Register the CurrentAdminService class with RequireJS
     */
    define(['FeatureBase'], function(FeatureBase) {

        var ExcelUploaderService = function(FileUploader, $cookies, CONF, events) {

            var SUPPORTED_IMAGE_TYPE = ['sheet'];
            var UPLOAD_URL = 'sales/admin/customers/import';

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
                var authString = $cookies.get('sb_admin_token');
                if (authString === undefined) {
                    noty('error', '你还没有登录');
                    item.cancel();
                    item.remove();
                    return;
                }


                // if (SUPPORTED_IMAGE_TYPE.indexOf(item.file.type) === -1) {
                //     noty('error', '上传文件格式不对');
                //     item.cancel();
                //     item.remove();
                //     return;
                // }

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
                on_success,
                on_error
            ) {
                var uploader = new FileUploader(
                    {
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

                uploader.onErrorItem = on_error;
                return uploader;
            };

            /**
             * @method createUncompressedExcelUploader
             * @param target
             * @param on_success
             * @public
             */
            var createUncompressedExcelUploader = createUploader.bind(
                undefined,
                false
            );

            return {
                createUncompressedExcelUploader: createUncompressedExcelUploader
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
                this.super.initializer('ExcelUploaderModule');
            };

            this.run = function () {
                this.mod.factory(
                    'ExcelUploaderService',
                    [
                        'FileUploader',
                        '$cookies',
                        'CONF',
                        'events',
                        ExcelUploaderService
                    ]
                );
            };

        });

        return Feature;

    });

})(define);