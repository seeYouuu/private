/**
 *
 *  Routes module expose route information used in clue feature
 *
 *  @author  sky.zhang
 *  @date    Dec 2, 2016
 *
 */
(function(define) {
    'use strict';

    define(['tpl!./partials/clue.html'], function(tpl) {
        return [{
            id: 'clue',
            isDefault: false,
            when: '/clue',
            controller: 'ClueController',
            template: tpl()
        }];
    });

}(define));
