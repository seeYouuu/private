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

    define(['tpl!./partials/company.html'], function(tpl) {
        return [{
            id: 'company',
            isDefault: false,
            when: '/company',
            controller: 'CompanyController',
            template: tpl()
        }];
    });

}(define));
