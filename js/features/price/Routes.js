/**
 *
 *  Routes module expose route information used in price feature
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['tpl!./partials/price.html'], function(tpl) {
        return [{
            id: 'price',
            isDefault: false,
            when: '/price',
            controller: 'PriceController',
            template: tpl()
        }];
    });

}(define));
