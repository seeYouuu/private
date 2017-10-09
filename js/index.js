/**
 * System config
 * define all paths, this is the main entrance of the app.
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(require) {
    'use strict';

    require.config({
        baseUrl: 'js',
        paths: {
            'etc': '../etc',
            'maincss': '../css/main',
            'main': 'main',
            'fw': 'fw',
            'ext': 'fw/ext',
            'init': 'fw/init',
            'config': 'fw/config',
            'service': 'fw/service',
            'features': 'features',
            'common': 'features/common',

            'ConfiguratorBase': 'fw/lib/ConfiguratorBase',
            'FeatureBase': 'fw/lib/FeatureBase',
            'InitBase': 'fw/lib/InitBase',
            'ServiceBase': 'fw/lib/ServiceBase',

            'tpl': 'bower/requirejs-tpl/tpl',
            'css': 'bower/require-css/css.min',

            'jquery': 'bower/jquery/dist/jquery.min',
            'lodash': 'bower/lodash/lodash.min',
            'chart': 'bower/Chart.js/Chart.min',
            'extend': 'bower/extend.js/bin/extend.min',
            'jcrop': 'bower/jcrop/js/jquery.Jcrop.min',

            'angular': 'bower/angular/angular.min',
            'angular-animate': 'bower/angular-animate/angular-animate.min',
            'angular-route': 'bower/angular-route/angular-route.min',
            'angular-sanitize': 'bower/angular-sanitize/angular-sanitize.min',
            'angular-strap': 'bower/angular-strap/dist/angular-strap.min',
            'angular-strap-tpl': 'bower/angular-strap/dist/angular-strap.tpl.min',
            'angular-loading-bar': 'bower/angular-loading-bar/build/loading-bar.min',
            'angular-theme-spinner': 'bower/angular-theme-spinner/dist/angular-theme-spinner.min',
            'angular-md5': 'bower/angular-md5/angular-md5.min',
            'angular-file-upload': 'bower/angular-file-upload/angular-file-upload.min',
            'angular-cookies': 'bower/angular-cookies/angular-cookies.min',
            'angular-slick': 'bower/angular-slick/dist/slick.min',
            're-tree': 'bower/re-tree/re-tree.min',
            'ng-device-detector': 'bower/ng-device-detector/ng-device-detector.min',
            'angular-sprintf': 'bower/sprintf/dist/angular-sprintf.min',
            'angular-translate': 'bower/angular-translate/angular-translate.min',
            'tinymce': 'bower/tinymce-dist/tinymce.min',
            'angular-ui-tinymce': 'bower/angular-ui-tinymce/src/tinymce',
            'angular-focus': 'bower/ng-focus-on/ng-focus-on',
            'angular-touch': 'bower/angular-touch/angular-touch.min',
            'angular-fix-img-ori': 'bower/angular-fix-image-orientation/angular-fix-image-orientation',
            'ng-jcrop': 'bower/ng-jcrop/ng-jcrop',
            'angular-drag-drop': 'bower/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min',
            'exif': 'bower/exif-js/exif',

            'bootstrap': 'bower/bootstrap/dist/css/bootstrap.min',
            'bootstrap-additions': 'bower/bootstrap-additions/dist/bootstrap-additions.min',
            'fontawesome': 'bower/fontawesome/css/font-awesome.min',
            'slick-carousel': 'bower/slick-carousel/slick/slick',
            'shared-secret': 'libs/strophe.bstsharedsecret',
            'strophe-ping': 'libs/strophe.plugins.ping',
            'strophe-roster': 'libs/strophe.plugins.roster',
            'strophe-rsm': 'libs/strophe.plugins.rsm',
            // 'strophe-mam': 'libs/custom.strophe.mam',

            'noty': 'bower/noty/js/noty/packaged/jquery.noty.packaged.min',
            'animate': 'bower/animate.css/animate.min',
            'angular-motion': 'bower/angular-motion/dist/angular-motion.min',
            'splash': 'bower/splash-screen/splash.min',
            'sprintf': 'bower/sprintf/dist/sprintf.min',
            'bowser': 'bower/bowser/bowser.min'
        },
        shim: {
            'jquery': {
                exports: '$'
            },
            'lodash': {
                exports: '_'
            },
            'angular': {
                exports: 'angular',
                deps: ['lodash', 'jquery']
            },
            'angular-md5': {
                deps: ['angular']
            },
            'angular-cookies': {
                deps: ['angular']
            },
            'angular-base64': {
                deps: ['angular']
            },
            'angular-animate': {
                deps: ['angular']
            },
            'angular-route': {
                deps: ['angular']
            },
            'angular-sanitize': {
                deps: ['angular']
            },
            'angular-strap': {
                deps: ['angular']
            },
            'angular-strap-tpl': {
                deps: ['angular', 'angular-strap']
            },
            'angular-loading-bar': {
                deps: ['angular']
            },
            'angular-theme-spinner': {
                deps: ['angular']
            },
            'angular-smart-table': {
                deps: ['angular']
            },
            'angular-chart': {
                deps: ['angular']
            },
            'angular-file-upload': {
                deps: ['angular']
            },
            're-tree': {
                deps: ['angular']
            },
            'ng-device-detector': {
                deps: ['re-tree']
            },
            'slick-carousel': {
                deps: ['jquery']
            },
            'angular-slick': {
                deps: ['angular', 'slick-carousel']
            },
            'sprintf': {
                'exports': 'sprintf'
            },
            'angular-sprintf': {
                'deps': ['angular', 'sprintf'] 
            },
            'bowser': {
                exports: ['bowser'] 
            },
            'angular-translate': {
                deps: ['angular']
            },
            'angular-ui-tinymce': {
                deps: ['angular', 'tinymce']
            },
            'angular-focus': {
                deps: ['angular']
            },
            'angular-touch': {
                deps: ['angular']
            },
            'angular-fix-img-ori': {
                deps: ['angular', 'exif']
            },
            'shared-secret': {
                deps: ['strophejs']
            },
            'strophe-ping': {
                deps: ['strophejs']
            },
            'strophe-roster': {
                deps: ['strophejs']
            },
            'strophe-rsm': {
                deps: ['strophejs']
            },
            'jcrop': {
                deps: ['jquery']
            },
            'ng-jcrop': {
                deps: ['angular', 'jcrop']
            },
            'angular-drag-drop': {
                deps: ['angular']
            }
        },
        packages: [{
            name: 'strophejs',
            location: './libs/strophejs'
        }]

    });

    require(['css!bootstrap',
             'css!bootstrap-additions',
             'css!maincss']);

    define(['main'], function(App) {
        (new App()).run();
    });

}(require));
