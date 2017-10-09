/**
 *
 *  Routes module expose route information used in finance feature
 *
 *  @author  liping.chen
 *  @date    Jun 13, 2016
 *
 */
(function(define) {
    'use strict';

    define(['tpl!./partials/finance.html'], function(tpl) {
        return [{
            id: 'finance',
            isDefault: false,
            when: '/finance',
            controller: 'FinanceController',
            template: tpl()
        }];
    });

}(define));
