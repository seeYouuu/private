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

    define(['tpl!./partials/dashboard.html'], function(tpl) {
        return [{
            id: 'dashboard',
            isDefault: false,
            when: '/dashboard',
            controller: 'DashboardController',
            template: tpl()
        }];
    });

}(define));
