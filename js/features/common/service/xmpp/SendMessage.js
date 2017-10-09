(function(define) {
    'use strict';

    /**
     * Register the send message class with RequireJS
     */
    define(['FeatureBase', 'angular'], function(FeatureBase, angular) {

        var SendMessage = function ($cookies, CONF, CurrentUser, MessageGenerator, StanzaSender, MessageStorageService, events) {

            var is_json_string = function (text) {
                try {
                    JSON.parse(text);
                } catch (e) {
                    return false;
                }
                return true;
            };

            var send_message = function (
                body,
                toJID,
                service,
                jId
            ) {

                if (body === '') {
                    return false;
                }
                // var MESSAGE_SHARE_SERVICE = 'MessageShare';

                var from = CurrentUser.get_jid();
                var userJid = CurrentUser.get_bare_jid();

                // if (service === 'text' && is_json_string(body)) {
                //     service = 'MessageShare';
                //     body = angular.toJson(
                //         {
                //             message: body.toString(),
                //             service: MESSAGE_SHARE_SERVICE
                //         }
                //     );
                // }

                var message = {
                    body: body,
                    from: from,
                    type: 'groupchat',
                    service: service,
                    userJid: userJid
                };
                
                var messageStanza = MessageGenerator.generate_group_message(
                    '',
                    toJID,
                    body
                );

                message.id = StanzaSender.send_message(messageStanza);
                message.tag = 'customerservice';
                message.readFlag = true;
                message.xmpp_username = $cookies.get('xmpp_username');
                message.time = new Date().getTime();
                message.user_id = $cookies.get('user_id');
                message.avatar = CONF.file + '/person/' + message.user_id + '/avatar_small.jpg';
                message.jId = jId;
                var storage = MessageStorageService.getStorage();
                
                var records = storage && storage.historyMessage ? JSON.parse(storage.historyMessage) : {};
                if(!records[jId]){
                    records[jId] = {};
                }
                message.service = 'text';
                service === 'MessageShare' ? message.body = JSON.parse(body).message : '';

                records[jId][message.id] = message;
                MessageStorageService.setHistoryMessage(records);
                events.emit('message', message);

                return true;
            };

            var send_file_message = function(
                message,
                toJId,
                jId
            ){
                
                var messageStanza = MessageGenerator.generate_group_message(
                    '',
                    toJId,
                    message.body
                );

                message.id = StanzaSender.send_file_message(messageStanza);
                message.readFlag = true;
                message.xmpp_username = $cookies.get('xmpp_username');
                message.time = new Date().getTime();
                message.user_id = $cookies.get('user_id');
                message.avatar = CONF.file + '/person/' + message.user_id + '/avatar_small.jpg';
                message.body = JSON.parse(message.body);
                var storage = MessageStorageService.getStorage();
                
                var records = storage  && storage.historyMessage ? JSON.parse(storage.historyMessage) : {};
                if(!records[jId]){
                    records[jId] = {};
                }
                records[jId][message.id] = message;
                MessageStorageService.setHistoryMessage(records);
                events.emit('message');

                return true;
            };

            return {
                send_message: send_message,
                send_file_message: send_file_message
            };
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('SendMessageModule');
            };

            this.run = function () {
                this.mod.factory(
                    'SendMessage',
                    [
                        '$cookies',
                        'CONF',
                        'CurrentUser',
                        'MessageGenerator',
                        'StanzaSender',
                        'MessageStorageService',
                        'events',
                        SendMessage
                    ]
                );
            };

        });

        return Feature;

    });

})(define);