(function(define) {
    'use strict';

    /**
     * Create a service to Generates an XML message
     */
    define(['FeatureBase'], function(FeatureBase) {
        
        var xmpp_messages = function (XmppConnector) {

            var onMessageCallbacks = [];

            var on_message = function (messageStanza) {
                onMessageCallbacks.forEach(function(callback) {
                    callback(messageStanza);
                });
                return true;
            };

            var add_on_message_callback = function (cb) {
               onMessageCallbacks.push(cb);
            };

            var start_listening_messages = function () {
                var connection = XmppConnector.get_connect();
                connection.addHandler(
                    on_message,
                    null,
                    'message',
                    null
                );
            };

            return {
                add_on_message_callback: add_on_message_callback,
                start_listening_messages: start_listening_messages
            };
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('XmppMessagesModule');
            };

            this.run = function () {
                this.mod.factory(
                    'XmppMessages',
                    [
                        'XmppConnector',
                        xmpp_messages
                    ]
                );
            };

        });

        return Feature;

    });

})(define);