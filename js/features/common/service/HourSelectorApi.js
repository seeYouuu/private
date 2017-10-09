(function(define) {
    'use strict';

    /**
     * API SbHourSelector, and can be called in controllers.
     */
    define(['FeatureBase', 'lodash'], function(FeatureBase, _) {

        var HourSelectorApi = function() {
            var data, coords;
          
            var init = function() {
                data = _.map(Array(7), function() {
                    return Array(48);
                });

                coords = Array(2);
                
                reset();
            };
            
            var reset = function() {
                _.each(data, function(ary) {
                    _.fill(ary, null);
                });
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
                var rows = [coords[0].row, coords[1].row].sort(function(a, b) {return a - b;});
                var cols = [coords[0].col, coords[1].col].sort(function(a, b) {return a - b;});
                return [
                  { row: rows[0], col: cols[0] },  // top-left 
                  { row: rows[1], col: cols[1] }   // bottom-right
                ];
            };
          
            this.coord = function(index, row, col) {
                if (row === undefined && col === undefined) return coords[index];
                else return coords[index] = { row: row, col: col };
            };
          
            this.isCoordsSet = function() {
                return coords[0] !== null && coords[1] !== null;
            };
          
        };
      
        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('HourSelectorApi');
            };

            this.run = function () {
                this.mod.service(
                    'HourSelectorApi',
                    HourSelectorApi
                );
            };

        });

        return Feature;
      
    });

})(define);