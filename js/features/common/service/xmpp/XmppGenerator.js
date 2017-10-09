(function(define) {
    'use strict';

    /**
     * Create a service to Generates an XML message
     */
    define(['FeatureBase'], function(FeatureBase) {
        function $msg(attrs) { return new Strophe.Builder("message", attrs); }
        
        var xmpp_generator = function (CurrentUser) {
            
            var create_generic = function (toJID, type, body) {

                // Create message tag
                var request = $msg({
                    'to': toJID,
                    'from': CurrentUser.get_jid(),
                    'type': type,
                    'xml:lang': CurrentUser.get_language()
                });

                request.c('body').t(body);

                return request;
            };

            var private_chat_message = function (toJID, body) {
                return create_generic(toJID, 'chat', body);
            };

            var group_chat_message = function (toJID, body) {
                return create_generic(toJID, 'groupchat', body);
            };

            return {
                private_chat_message: private_chat_message,
                group_chat_message: group_chat_message
            };
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('XmppGeneratorModule');
            };

            this.run = function () {
                this.mod.factory(
                    'XmppGenerator',
                    [
                        'CurrentUser',
                        xmpp_generator
                    ]
                );
            };

        });

        return Feature;

    });

})(define);