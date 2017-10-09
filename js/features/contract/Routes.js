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

    define(['tpl!./partials/contract.html'], function(tpl) {
        return [{
            id: 'contract',
            isDefault: false,
            when: '/contract',
            controller: 'ContractController',
            template: tpl()
        }];
    });

}(define));
