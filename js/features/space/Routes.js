/**
 *
 *  Routes module expose route information used in admin feature
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['tpl!./partials/space.html'], function(tpl) {
        return [{
            id: 'space',
            isDefault: false,
            when: '/space',
            controller: 'SpaceController',
            template: tpl()
        }];
    });

}(define));
 