 /**
 *  Entrance of common service
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define([
        'lodash',
        './ui/main',
        './service/main',
        './filter/main'
    ], function() {
        return _.flatten([].slice.call(arguments, 1));
    });

}(define));
