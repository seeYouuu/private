/**
 *
 *  Routes module expose route information used in user feature
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['tpl!./partials/user.html'], function(tpl) {
        return [{
            id: 'user',
            isDefault: false,
            when: '/user',
            controller: 'UserController',
            template: tpl()
        }];
    });

}(define));
