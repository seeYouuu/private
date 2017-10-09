(function(define) {
    'use strict';

    /**
     * Register the MessageParser class with RequireJS
     */
    define(['FeatureBase', 'angular'], function(FeatureBase, angular) {

        var MessageParser = function (xmlParsingUtils, CONF) {

            var GUEST_SERVICE_TYPE = 'guestchat';

            var get_message_service = function (messageBody) {
                try {
                    var body = angular.fromJson(messageBody);
                    var type = body.service;
                    return type !== undefined ? type : 'text';
                } catch (e) {
                    return 'text';
                }
            };

            var get_group_jid = function (fromJid, toJid) {
                var groupJid = Strophe.getBareJidFromJid(fromJid);
                // for history message from current user
                // if (groupJid === currentUser.get_bare_jid()) {
                //     groupJid = Strophe.getBareJidFromJid(toJid);
                // }
                return groupJid;
            };

            var get_user_jid = function (fromJid) {
                var userJid = fromJid;
                var resource = Strophe.getResourceFromJid(fromJid);
                if (resource !== null) {
                    var name = resource.split('#')[0];
                    userJid = name + '@' + CONF.xmppDomain;
                }
                return userJid;
            };

            var parse = function(messageStanza) {

                var isFinalMessage = xmlParsingUtils.contains_tag(
                    messageStanza,
                    'fin'
                );
                // TODO: handle final message
                if (isFinalMessage) {
                    return;
                }

                var from = xmlParsingUtils.get_attribute(
                    messageStanza,
                    'from'
                );

                var isHistory = false;
                if (from === undefined) {
                    // is history message
                    isHistory = true;
                    messageStanza = xmlParsingUtils.get_unique_tag_or_throw(
                        messageStanza,
                        'message'
                    );
                    from = xmlParsingUtils.get_attribute(
                        messageStanza,
                        'from'
                    );
                }

                var id = xmlParsingUtils.get_attribute(
                    messageStanza,
                    'id'
                );

                if (id === undefined) {
                    id = xmlParsingUtils.get_tag_attribute(
                        messageStanza,
                        'body',
                        'id'
                    );
                }

                var to = xmlParsingUtils.get_attribute(
                    messageStanza,
                    'to'
                );

                var type = xmlParsingUtils.get_attribute(
                    messageStanza,
                    'type'
                );

                var body = xmlParsingUtils.get_optional_tag_value(
                    messageStanza,
                    'body'
                );

                // fix #2555
                if (body === null) {
                    return;
                }


                var groupJid = get_group_jid(from, to);
                var userJid = get_user_jid(from);

                var domain = Strophe.getDomainFromJid(groupJid);
                var subDomain = domain.split('.', 1)[0];
                if (subDomain === GUEST_SERVICE_TYPE) {
                    type = GUEST_SERVICE_TYPE;
                }

                var service = get_message_service(body);

                // ignore legacy sent message
                var bodyType = xmlParsingUtils.get_tag_attribute(
                    messageStanza,
                    'body',
                    'type'
                );

                var bodyTime = xmlParsingUtils.get_tag_attribute(
                    messageStanza,
                    'body',
                    'time'
                );

                var isOffline = xmlParsingUtils.contains_tag(
                    messageStanza,
                    'delay'
                );

                var isRichMessage = service !== 'text';

                return {
                    groupJid: groupJid,
                    userJid: userJid,
                    from: from,
                    id: id,
                    to: to,
                    type: type,
                    body: body,
                    service: service,
                    isOffline: isOffline,
                    isRichMessage: isRichMessage,
                    bodyType: bodyType,
                    isHistory: isHistory,
                    time: bodyTime
                };

            };

            return {
                parse: parse
            };
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('MessageParserModule');
            };

            this.run = function () {
                this.mod.factory(
                    'MessageParser',
                    [
                        'XmlParseUtils',
                        'CONF',
                        MessageParser
                    ]
                );
            };

        });

        return Feature;

    });

})(define);