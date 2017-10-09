/**
 *  SSOConfig set authorised configuration.
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['ConfiguratorBase'], function(Base) {

        var Configurator = Base.extend(function() {

            this.constructor = function(features, app) {
                this.super(features, app);
            };

            this.run = function() {

                this.app.config(['$httpProvider', function($httpProvider) {
                    $httpProvider.defaults.headers.common.Accept = 'application/json';
                    // $httpProvider.defaults.headers.common['Accept-Language'] = 'zh-cn,zh;q=0.5';
                    $httpProvider.defaults.withCredentials = true;
                }]);

            };
        });

        return Configurator;

    });

}(define));
