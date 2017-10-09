(function(define) {
    'use strict';

    /**
     * API SbDaySelector, and can be called in controllers.
     */
    define(['FeatureBase', 'lodash'], function(FeatureBase, _) {

        var DaySelectorApi = function() {
            var data, coords;
          
            var init = function() {
                data = Array(7);
                coords = Array(2);
                reset();
            };
            
            var reset = function() {
                _.fill(data, null);
                _.fill(coords, null);
            };
            init();
            
            this.data = function(value) {
                if (value === undefined) return data;
                else return data = value;
            };
          
            this.init = init;
            this.reset = reset;
          
            this.coords = function() {
                return _.clone(coords).sort(function(a, b) {
                    return a - b;
                });
            };
          
            this.coord = function(index, value) {
                if (value === undefined) return coords[index];
                else return coords[index] = value;
            };
          
            this.isCoordsSet = function() {
                return coords[0] !== null && coords[1] !== null;
            };
          
        };
      
        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('DaySelectorApi');
            };

            this.run = function () {
                this.mod.service(
                    'DaySelectorApi',
                    DaySelectorApi
                );
            };

        });

        return Feature;
      
    });

})(define);