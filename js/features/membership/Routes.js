/**
 *
 *  Routes module expose route information used in membership feature
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['tpl!./partials/membership.html'], function(tpl) {
        return [{
            id: 'membership',
            isDefault: false,
            when: '/membership',
            controller: 'MembershipController',
            template: tpl()
        }];
    });

}(define));
