/**
 * Common service used to connect xmpp
 */
(function(define) {
'use strict';

/**
 * Register the XmppConnector class with RequireJS
 */
define(['FeatureBase'], function(FeatureBase) {

    var Feature = FeatureBase.extend(function() {

        var XmppConnectorService = function(CONF, $cookies, $timeout, MessageParser){
            //add for sandbox
            var ROUTE = 'xmpp:' + CONF.xmpp + ':5222';
            var HTTP_FULL_DOMAIN = 'https://' + CONF.xmpp;
            var BOSH_URL =  HTTP_FULL_DOMAIN + '/http-bind';
            
            var options = {
                'mechanisms': [
                    Strophe.BSTSharedSecret
                ]
            };
            var connection = new Strophe.Connection(BOSH_URL, options);

            var connectionCallbacksRegistered = false;
            var connectionStatusCallbacks = [];
            var pendingPing = false;

            var get_connect = function(){
                return connection;
            };

            var calc_resource = function () {
                var clientid = $cookies.get('client_id');

                var number = Math.round(Math.random() * 100000) % 99999;
                var resource = 'webim' + number + '#' + clientid;

                return resource;
            };

            var add_status_callback = function (newStatus, callback) {
                if(connectionStatusCallbacks[newStatus] === undefined) {
                    connectionStatusCallbacks[newStatus] = [];
                }

                connectionStatusCallbacks[newStatus].push(
                    callback
                );
            };

            var reset_connection = function () {
                if (connection === undefined) {
                    return;
                }
                connection.disconnect();
            };

            var on_connected = function (callback) {
                console.log('on_connected');
                add_status_callback(
                    Strophe.Status.CONNECTED,
                    callback
                );
            };

            var on_disconnecting = function (callback) {
                console.log('on_disconnecting');
                add_status_callback(
                    Strophe.Status.DISCONNECTING,
                    callback
                );
            };

            var on_disconnected = function (callback) {
                console.log('on_disconnected');
                add_status_callback(
                    Strophe.Status.DISCONNECTED,
                    callback
                );
            };

            var on_ping_success = function () {
                console.log('on_ping_success');
                if (connection === undefined && connection.connected === false) {
                    return;
                }
                pendingPing = false;
                $timeout(ping, 10000);
            };

            var on_ping_error = function () {
                console.warn('ping error');
                pendingPing = false;
                ping();
            };

            var on_authfail = function (callback) {
                console.log('on_authfail');
                add_status_callback(
                    Strophe.Status.AUTHFAIL,
                    callback
                );
            };

            var ping = function () {
                if (pendingPing === true) {
                    return;
                }
                if (connection === undefined && connection.connected === false) {
                    return;
                }
                pendingPing = true;
                connection.ping.ping(
                    CONF.xmpp,
                    on_ping_success,
                    on_ping_error,
                    30000
                );
            };

            var check_conncted = function(){
                return connection.connected;
            };

            var status_handler = function (newStatus) {
                var callbacks = connectionStatusCallbacks[
                    newStatus
                ];
                angular.forEach(
                    callbacks,
                    function(oneCallBack) {
                        oneCallBack();
                    }
                );
            };

            var create_connection = function(username, password){
                
                connection.reset();
                var _resource = calc_resource();
                var jid = username+ '@' + CONF.xmpp  + '/' + _resource;

                if (connectionCallbacksRegistered === false) {
                    on_connected(function() {
                        ping();
                    });

                    on_disconnected(function() {
                        console.error('we get disconnected!');
                    });

                    connectionCallbacksRegistered = true;
                }

                connection.connect(
                    jid,
                    password,
                    status_handler,
                    undefined,
                    undefined,
                    ROUTE
                );
            };

            var isNormalDisconnection = true;

            var set_to_normal_disconnection = function () {
                isNormalDisconnection = true;
            };

            var set_to_abnormal_disconnection = function () {
                isNormalDisconnection = false;
            };

            var get_is_normal_disconnection = function () {
                return isNormalDisconnection;
            };

            return {
                create_connection: create_connection,
                check_conncted: check_conncted,
                get_connect: get_connect,
                on_authfail: on_authfail,
                on_connected: on_connected,
                on_disconnecting: on_disconnecting,
                on_disconnected: on_disconnected,
                reset_connection: reset_connection,
                set_to_normal_disconnection: set_to_normal_disconnection,
                set_to_abnormal_disconnection: set_to_abnormal_disconnection,
                get_is_normal_disconnection: get_is_normal_disconnection
            };
        };

        this.initializer = function() {
            this.super.initializer('XmppConnectorModule');
        };

        this.run = function () {
            this.mod
                .service(
                    'XmppConnector',
                    [
                        'CONF', 
                        '$cookies',
                        '$timeout',
                        'MessageParser',
                        XmppConnectorService
                    ]
                )
            ;
        };

    });

    return Feature;

});

})(define);