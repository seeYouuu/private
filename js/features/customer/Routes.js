/**
 *
 *  Routes module expose route information used in home feature
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    define(['tpl!./partials/customer.html'], function(tpl) {
        return [{
            id: 'customer',
            isDefault: false,
            when: '/customer',
            controller: 'CustomerController',
            template: tpl()
        }];
    });

}(define));
