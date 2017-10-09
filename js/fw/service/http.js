/**
 *
 *  Defines `http` service which is a wrapper of `$http` service with few
 *  specified features
 *
 *  @author  guofang.zhang
 *  @date    May 15, 2015
 *
 */
(function(define) {
    'use strict';

    define(['ServiceBase', 'lodash', 'angular'], function(Base, _, angular) {

        var successHandler = function(httpHandler, httpResolver, deferred) {
            return function(data, status, headers, config) {
                var breaked = _.any(httpHandler.get('success'), function(handler) {
                    return !handler(data, status, headers, config);
                });
                if (!breaked) {
                    if (httpResolver.get()) {
                        httpResolver.get()(deferred, data, status, headers, config);
                    } else {
                        deferred.resolve({
                            data: data,
                            status: status,
                            headers: headers,
                            config: config
                        });
                    }
                }
            };
        };

        var errorHandler = function(httpHandler, deferred, $cookies, CONF, events, $rootScope) {
            return function(data, status, headers, config) {
                var breaked = _.any(httpHandler.get('error'), function(handler) {
                    return !handler(data, status, headers, config);
                });
                if (!breaked) {
                    deferred.reject({
                        data: data,
                        status: status,
                        headers: headers,
                        config: config
                    });
                }
                //if not login forward to login page
                if(status === 403){
                    if(!$rootScope.permissForbiddenFlag){
                        $rootScope.permissForbiddenFlag = true;
                        events.emit('alert', {
                            type: 'warning',
                            message: '检测到权限问题，可能导致部分数据无法获取！',
                            onShow: function() {},
                            onClose: function() {
                                $rootScope.permissForbiddenFlag = false;
                            }
                        });
                    }
                }else if(status === 401){

                    if(config.url.indexOf('admin/auth/login') < 0){
                        $cookies.remove("sb_admin_token");
                        $cookies.remove("sb_admin_token", {domain:'.sandbox3.cn'});
                        window.location.assign(CONF.admin + 'login');
                    }
                }
            };
        };

        var wrapper = function(method, $q, $http, $cookies, CONF, httpHandler, httpResolver, events, $rootScope) {
            
            return function() {
                var deferred = $q.defer();
                var promise = deferred.promise;
                var args = Array.prototype.slice.call(arguments, 0);
                //set header Authorization
                if(args[0].indexOf('admin/auth/login') > 0){
                    $http.defaults.headers.common.sandboxadminauthorization = $cookies.get("sb_admin_token");
                    $http.defaults.headers.common.Authorization = '';
                }else{
                    $http.defaults.headers.common.Authorization = $cookies.get("sb_admin_token");
                }

                var tmpPromise = $http[method].apply(undefined, args);
                tmpPromise.success(successHandler(httpHandler, httpResolver, deferred));
                tmpPromise.error(errorHandler(httpHandler, deferred, $cookies, CONF, events, $rootScope));
                promise.success = function(fn) {
                    promise.then(function(response) {
                        fn(response.data, response.status, response.headers, response.config);
                    });
                    return promise;
                };

                promise.error = function(fn) {
                    promise.then(null, function(response) {
                        fn(response.data, response.status, response.headers, response.config);
                    });
                    return promise;
                };
                return promise;
            };
        };

        var ser = function($http, $q, $cookies, CONF, httpHandler, httpResolver, events, $rootScope) {
            this.get = wrapper('get', $q, $http, $cookies, CONF, httpHandler, httpResolver, events, $rootScope);
            this.post = wrapper('post', $q, $http, $cookies, CONF, httpHandler, httpResolver, events, $rootScope);
            this.head = wrapper('head', $q, $http, $cookies, CONF, httpHandler, httpResolver, events, $rootScope);
            this.put = wrapper('put', $q, $http, $cookies, CONF, httpHandler, httpResolver, events, $rootScope);
            this.delete = wrapper('delete', $q, $http, $cookies, CONF, httpHandler, httpResolver, events, $rootScope);
            this.patch = wrapper('patch', $q, $http, $cookies, CONF, httpHandler, httpResolver, events, $rootScope);
        };

        var httpHandler = function() {
            var handlers = {
                success: [],
                error: []
            };

            this.push = function(handler, type) {
                if (handler && angular.isFunction(handler) && handlers[type]) {
                    handlers[type].push(handler);
                }
            };

            this.delete = function(handler, type) {
                if (handlers[type]) {
                    _.remove(handlers[type], handler);
                }

            };

            this.get = function(type) {
                return handlers[type];
            };
        };

        var httpResolver = function() {

            var commonResolver;
            this.set = function(resolver) {
                if (resolver && angular.isFunction(resolver)) {
                    commonResolver = resolver;
                }
            };

            this.get = function() {
                return commonResolver;
            };
        };

        var Service = Base.extend(function() {

            this.run = function() {
                this.super.run();

                this.app.service('http', ['$http', '$q', '$cookies', 'CONF', 'httpHandler', 'httpResolver', 'events', '$rootScope', ser]);
                this.app.service('httpHandler', [httpHandler]);
                this.app.service('httpResolver', [httpResolver]);

            };

        });

        return Service;
    });

}(define));
