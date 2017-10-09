/**
 *
 *  Defines the tags
 *
 *  @author  Eason.zhang
 *  @date    Jul 26, 2017
 *
 **/
(function(define) {
    'use strict';

    define(['FeatureBase'], function(Base) {

        var Feature = Base.extend(function() {

            this.initializer = function() {
                this.super.initializer('MutipleTagsModule');
            };

            this.run = function() {
                var features = require.toUrl('features');

                var dir = function(events) {
                    return {
                        restrict: 'EA',
                        replace: true,
                        scope: {
                            'options': '=',
                            'asyncObj': '='
                        },
                        link: function($scope, element) {

                            $scope.transfered = true;

                            $scope.deleteItem = function(item){
                                var search = window.location.pathname.slice(1);
                                events.emit(search +'DeleteTag', item);
                            };
                            console.log($scope.options)
                            $scope.$watch('asyncObj', function(newValue, oldValue){
                                if(newValue === oldValue){
                                    return;
                                }
                                _.each($scope.options, function(item){
                                    if((item.name === 'building' || item.name === 'group_id') && $scope.transfered){
                                        item.value = $scope.asyncObj.name;
                                    }
                                });
                                $scope.transfered = false;
                            }, true);
                        },
                        templateUrl: features + '/common/ui/MutipleTags.html'
                    };
                };

                this.mod.directive('mutipleTags', ['events', dir]);
            };

        });

        return Feature;

    });


})(define);
