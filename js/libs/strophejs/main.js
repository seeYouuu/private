(function(define) {
    'use strict';
    define([
        './strophe.min'
    ], function(Strophe) {
        return window.Strophe = Strophe.Strophe;
    });
})(define);