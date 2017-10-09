/**
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define(['ConfiguratorBase', 'lodash'], function(Base, _) {

        var Configurator = Base.extend(function() {
            this.constructor = function(features, app) {
                this.super(features, app);
            };

            this.run = function() {
                this.super.run();
                if (!this.features || this.features.length === 0) {
                    console.warn('No features loaded');
                    return;
                }

                var languages = {},
                    featureWithLang = _.filter(this.features, function(feature) {
                        return feature.lang;
                    });

                _.each(featureWithLang, function(feature) {
                    _.each(feature.lang, function(value, key) {
                        if (!languages[key]) {
                            languages[key] = {};
                        }
                        _.assign(languages[key], value);
                    });

                });

                this.app.config(['$translateProvider', 'CONF',
                    function($translateProvider, CONF) {

                        _.each(languages, function(value, key) {
                            $translateProvider.translations(key, value);
                        });

                        $translateProvider.preferredLanguage(CONF.defaultLang);
                        $translateProvider.fallbackLanguage(CONF.defaultLang);

                        $translateProvider.useSanitizeValueStrategy('escape');
                    }
                ]);

                this.app.config(['ngJcropConfigProvider', function(ngJcropConfigProvider) {
                    ngJcropConfigProvider.setJcropConfig({
                        bgColor: 'black',
                        bgOpacity: 0.4,
                        aspectRatio: 16 / 9
                    });

                    ngJcropConfigProvider.setJcropConfig('activityConfig', {
                        bgColor: 'black',
                        bgOpacity: 0.4,
                        aspectRatio: 32 / 21
                    });

                    ngJcropConfigProvider.setJcropConfig('logoConfig', {
                        bgColor: 'black',
                        bgOpacity: 0.4,
                        aspectRatio: 1 / 1
                    });

                    ngJcropConfigProvider.setJcropConfig('roomConfig', {
                        bgColor: 'black',
                        bgOpacity: 0.4,
                        aspectRatio: 640 / 465
                    });

                    ngJcropConfigProvider.setPreviewStyle('activityConfig', {
                        'width': '320px',
                        'height': '210px',
                        'overflow': 'hidden',
                        'margin-left': '5px'
                    });
                }]);

            };
        });

        return Configurator;

    });

}(define));
