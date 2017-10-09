/**
 *  Entrance of services
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define([
        './Events',
        './http',
        './Utils'
    ], function() {
        return [].slice.call(arguments, 0);
    });

}(define));
