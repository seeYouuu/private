(function(define) {
    'use strict';

    /**
     * Register the send stanza class with RequireJS
     */
    define(['FeatureBase'], function(FeatureBase) {

        var stanza_sender = function (
            $q,
            xmppConnector,
            $translate
        ) {

            var IQ_TIMEOUT = 30000; // 30s

            var send_iq = function (iq) {
                iq.tree().setAttribute(
                    'xml:lang',
                    $translate.use()
                );
                var deferred = $q.defer();

                var connection = xmppConnector.get_connect();
                connection.sendIQ(
                    iq,
                    function(resultIq) {
                        deferred.resolve(resultIq);
                    },
                    function (errorIq) {
                       deferred.reject(errorIq);
                    },
                    IQ_TIMEOUT
                );
                return deferred.promise;
            };

            var send_message = function (messageStanza) {
                var connection = xmppConnector.get_connect();
                
                var messageId = connection.getUniqueId();

                messageStanza.tree().setAttribute(
                    'id',
                    messageId
                );
                console.log(messageStanza);
                connection.send(messageStanza);
                return messageId;
            };

            var send_file_message = function (messageStanza) {
                var connection = xmppConnector.get_connect();
                var messageId = connection.getUniqueId();
                messageStanza.tree().setAttribute(
                    'id',
                    messageId
                );
                connection.send(messageStanza);
                return messageId;
            };

            var send_stanza = function (stanza) {
                var connection = xmppConnector.get_connect();
                connection.send(stanza);
            };

            var StanzaSender = {
                send_iq: send_iq,
                send_message: send_message,
                send_stanza: send_stanza,
                send_file_message: send_file_message
            };

            return StanzaSender;
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('StanzaSenderModule');
            };

            this.run = function () {
                this.mod.factory(
                    'StanzaSender',
                    [
                        '$q',
                        'XmppConnector',
                        '$translate',
                        stanza_sender
                    ]
                );
            };

        });

        return Feature;

    });

})(define);