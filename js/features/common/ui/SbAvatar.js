(function(define) {
'use strict';

define(['FeatureBase'], function(Base) {

    var Feature = Base.extend(function() {

        this.initializer = function() {
            this.super.initializer('SbAvatarModule');
        };

        this.run = function() {
            var features = require.toUrl('features');

            var dir = function(CONF) {

                var AVATAR_FILE_NAME_PREFIX = '/avatar_';
                var BACKGROUND_FILE_NAME_PREFIX = '/background_';

                var compileFunction = function (element, attrs) {
                    element.addClass('avatar-container');
                    if (attrs.background !== undefined) {
                        element.addClass('background');
                    }
                    if (attrs.size === undefined) {
                        attrs.size = 'small';
                    }
                    // link function
                    return function (scope, element, attrs) {
                        var imgElement = element.find('img');
                        scope.FILE_URL = CONF.file;

                        scope.avatarUrlAfter = AVATAR_FILE_NAME_PREFIX +
                            scope.size +
                            '.jpg';
                        if (attrs.background !== undefined) {
                            scope.avatarUrlAfter = BACKGROUND_FILE_NAME_PREFIX +
                                scope.size +
                                '.jpg';
                            imgElement.addClass('background');
                        }
                        if (scope.avatarType === 'company') {
                            imgElement.addClass('company');
                        }

                        var srcAttr = '';

                        if (attrs.background === undefined) {
                            switch (attrs.fallback) {
                                case 'company':
                                    srcAttr = CONF.defaultCompanyAvatar;
                                    break;
                                default:
                                    srcAttr = CONF.defaultUserAvatar;
                                    break;
                            }
                        } else if (attrs.background !== undefined) {
                            srcAttr = CONF.defaultAvatarBackground;
                        }


                        imgElement.bind('error', function() {
                            imgElement.attr('src', srcAttr);
                        });
                    }
                };

                return {
                    restrict: 'A',
                    scope: {
                        avatarId: '=',
                        avatarType: '@', // person , company
                        size: '@?',
                        background: '@?'

                    },
                    templateUrl: features + '/common/ui/SbAvatar.html',
                    compile: compileFunction
                };
            };

            this.mod.directive('sbAvatar', ['CONF',dir]);
        };

    });

    return Feature;

});


})(define);
