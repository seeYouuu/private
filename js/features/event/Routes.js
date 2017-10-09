/**
 *
 *  Routes module expose route information used in home feature
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['tpl!./partials/event.html'], function(tpl) {
        return [{
            id: 'activity',
            isDefault: false,
            when: '/activity',
            controller: 'EventController',
            template: tpl()
        }];
    });

}(define));
