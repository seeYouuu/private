/**
 *  ConfiguratorBase class
 *
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['extend'], function() {

        var ConfiguratorBase = Class.extend(function() {

            this.constructor = function(features, app) {
                this.features = features;
                this.app = app;
            };

            this.run = function() {};
        });

        return ConfiguratorBase;

    });

}(define));
