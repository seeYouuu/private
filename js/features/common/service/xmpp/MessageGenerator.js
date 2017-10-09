(function(define) {
    'use strict';

    /**
     * Create a service to Generates an message
     */
    define(['FeatureBase'], function(FeatureBase) {

        var message_generator = function (XmppGenerator) {

            var MESSAGE_TYPE = 'message';

            var generate_message_with_company_and_type = function (
                generatorFunction,
                company,
                jid,
                body,
                type
            ) {
                var stanza = generatorFunction(
                    jid,
                    body
                );

                var typeAttribute = MESSAGE_TYPE;
                if (type !== undefined) {
                    typeAttribute = type;
                }

                return stanza.attrs(
                    {
                        company: company,
                        type: typeAttribute
                    }
                );
            };

            var generate_private_message = generate_message_with_company_and_type.bind(
                undefined,
                XmppGenerator.private_chat_message
            );

            var generate_group_message = generate_message_with_company_and_type.bind(
                undefined,
                XmppGenerator.group_chat_message
            );

            return {
                generate_private_message: generate_private_message,
                generate_group_message: generate_group_message
            };

        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('MessageGeneratorModule');
            };

            this.run = function () {
                this.mod.factory(
                    'MessageGenerator',
                    [
                        'XmppGenerator',
                        message_generator
                    ]
                );
            };

        });

        return Feature;

    });

})(define);