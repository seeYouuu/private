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

    define(['tpl!./partials/admin.html'], function(tpl) {
        return [{
            id: 'admin',
            isDefault: false,
            when: '/admin',
            controller: 'AdminController',
            template: tpl()
        }];
    });

}(define));
