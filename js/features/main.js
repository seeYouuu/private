/**
 *  Entrance of features
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define([
        './home/main',
        './dashboard/main',
        './user/main',
        './admin/main',
        './event/main',
        './space/main',
        './transaction/main',
        './finance/main',
        './membership/main',
        './log/main',
        './common/main',
        './clue/main',
        './offer/main',
        './contract/main',
        './bill/main',
        './customer/main',
        './company/main'
    ], function(home, dashboard, user, admin, event, space, transaction, finance, membership, log, common, clue, offer, contract, bill, customer, company) {
        return [home, dashboard, user, admin, event, space, transaction, finance, membership, log, clue, offer, contract, bill, customer, company].concat(common);

    });

}(define));
