/**
 *
 *  Routes module expose route information used in log feature
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['tpl!./partials/log.html'], function(tpl) {
        return [{
            id: 'log',
            isDefault: false,
            when: '/log',
            controller: 'LogController',
            template: tpl()
        }];
    });

}(define));
