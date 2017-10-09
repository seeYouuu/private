
(function(define) {
    'use strict';

    /**
     * API SbHourSelector, and can be called in controllers.
     */
    define(['FeatureBase'], function(FeatureBase) {
      
        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('GlobalizationHandler');
            };

            this.run = function () {
                this.mod.config(["$httpProvider", function($httpProvider) {
                    $httpProvider.interceptors.push(['$translate',
                        function($translate) {
                            return {
                                'request': function(config) {
                                    config.headers['Accept-Language'] = $translate.use();
                                    // if (config.params) {
                                    //     config.params.lang = $translate.use();
                                    // }
                                    return config;
                                }
                            };
                        }
                    ]);
                }]);
            };

        });

        return Feature;
      
    });

})(define);