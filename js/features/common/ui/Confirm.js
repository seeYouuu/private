/**
 *  Defines the Confirm Modal
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['FeatureBase', 'tpl!./Confirm.html'], function(Base, tpl) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('ConfirmModal');
            };

            this.run = function() {
                this.mod.run(['events', '$timeout', '$rootScope', '$templateCache', function(events, $timeout, $rootScope, $templateCache) {

                    $templateCache.put('confirmTpl', tpl());

                    events.on('confirm', function(opts) {
                        if (!opts) {
                            return;
                        }

                        var scope = $rootScope.$new();
                        scope.name = opts.btnName ? opts.btnName : '确定';
                        scope.btnClass = opts.btnClass ? opts.btnClass : 'btn-danger';//btn-default, btn-primary, btn-success, btn-info, btn-warning, btn-danger
                        scope.confirm = function($hide) {
                            $hide();
                            if (angular.isFunction(opts.onConfirm)) {
                                opts.onConfirm();
                            }
                        };
                      
                        scope.cancel = function($hide) {
                            $hide();
                            if (angular.isFunction(opts.onCancel)) {
                                opts.onCancel(); 
                            }
                        };

                        events.emit('modal', {
                            scope: scope,
                            title: opts.title || 'Confirm',
                            content: opts.content,
                            animation: 'am-fade-and-slide-top',
                            placement: 'center',
                            template: 'confirmTpl'
                        });
                    });

                }]);
            };

        });

        return Feature;

    });

})(define);
