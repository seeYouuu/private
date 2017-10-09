/**
 *
 *  Routes module expose route information used in offer feature
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    define(['tpl!./partials/offer.html'], function(tpl) {
        return [{
            id: 'offer',
            isDefault: false,
            when: '/offer',
            controller: 'OfferController',
            template: tpl()
        }];
    });

}(define));
