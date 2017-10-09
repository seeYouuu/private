/**
 *
 *  The SbDropdown.
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 **/
(function(define) {
    'use strict';

    define(['FeatureBase'], function(Base) {

        var Feature = Base.extend(function() {

            var features = require.toUrl('features');
          
            this.initializer = function() {
                this.super.initializer('SbImageUploaderModule');
            };

            this.run = function() {
                var dir = function($compile) {
                    return {
	                    restrict: 'E',
                        templateUrl: features + '/common/ui/SbImageUploader.html',
                        transclude: true,
	                    scope: {
	                        url: '=',
                            defaultUrl: '@',
                            errorUrl: '@'
	                    },
                        link: function($scope, element, attrs) {
                            element.find('[type="file"]').on('change', function(e) {
                                if (!this.files || this.files.length === 0) return;
                                var reader = new FileReader();
                                reader.onloadend = function(e) {
                                    $scope.$apply(function() {$scope.url = e.target.result;});
                                };
                                reader.readAsDataURL(this.files[0]);
                            });
                        }
	                };
                };

                this.mod.directive('sbImageUploader',  ['$compile', dir]);
            };

        });

        return Feature;

    });


})(define);
