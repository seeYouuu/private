(function(define) {
'use strict';

define(['FeatureBase'], function(Base) {

    var Feature = Base.extend(function() {

        this.initializer = function() {
            this.super.initializer('SbGalleryImageModule');
        };

        this.run = function() {

            var features = require.toUrl('features');

            var dir = function() {
                return {
                    restrict: 'A',
                    scope: {
                        imgSrc: '@',
                        fileName: '@',
                        selected: '='
                    },
                    templateUrl: features + '/common/ui/SbGalleryImage.html'
                };
            };

            this.mod.directive('sbGalleryImage', [dir]);
        };

    });

    return Feature;

});


})(define);