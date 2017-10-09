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

    define(['tpl!./partials/transaction.html'], function(tpl) {
        return [{
            id: 'trade',
            isDefault: false,
            when: '/trade',
            controller: 'TransactionController',
            template: tpl()
        }];
    });

}(define));
