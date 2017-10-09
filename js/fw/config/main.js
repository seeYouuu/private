/**
 *  Entrance of config
 *
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define([
        './AppConfig',
        './LoadingBarConfig',
        './RouterConfig',
        './SSOConfig',
        "./GlobalizationConfig"
    ], function() {
        return [].slice.call(arguments, 0);
    });

}(define));
