/**
 *  HeadInit set all needed head info to the index.html.
 *
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define, global) {
    'use strict';

    define(['InitBase', 'tpl!etc/config.json', 'jquery'], function(Base, tpl, $) {

        var Initializer = Base.extend(function() {

            this.constructor = function(features, app) {
                this.super(features, app);
                this.head = $(global.document.head);
                this.config = JSON.parse(tpl());
            };

            this.title = function(t) {
                var title = $('<title></title>');
                title.text(t);
                this.head.append(title);
            };

            this.base = function(attr) {
                var base = $('<base>');
                base.attr(attr);
                this.head.find('base').remove();
                this.head.append(base);
            };

            this.meta = function(attr) {
                var meta = $('<meta>');
                meta.attr(attr);
                this.head.append(meta);
            };

            this.run = function() {
                this.super.run();
                this.title(this.config.appname);
                this.base({
                    href: '/' + (this.config.base ? this.config.base + '/' : '')
                });

                this.meta({
                    'charset': 'utf-8'
                });
                this.meta({
                    'name': 'viewport',
                    'content': 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1.0, user-scalable=yes'
                });
                this.meta({
                    'name': 'renderer',
                    'content': 'webkit'
                });
                this.meta({
                    'http-equiv': 'X-UA-Compatible',
                    'content': 'IE=edge,chrome=1'
                });
                this.meta({
                    'name': 'apple-mobile-web-app-capable',
                    'content': 'no'
                });
            };
        });

        return Initializer;

    });

}(define, window));
