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

    define(['tpl!./partials/bill.html'], function(tpl) {
        return [{
            id: 'bill',
            isDefault: false,
            when: '/bill',
            controller: 'BillController',
            template: tpl()
        }];
    });

}(define));
