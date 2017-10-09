(function(define) {
    'use strict';

    /**
     * Register the message service class with RequireJS
     */
    define(['FeatureBase', 'lodash'], function(FeatureBase, _) {

        var message_service = function (MessageParser, XmppMessages, MessageStorageService, events, CONF) {

            var on_message = function (messageStanza) {
                var temp = MessageParser.parse(messageStanza);
                if (temp.bodyType !== 'message') {
                    return true;
                }

                if(temp.type !== 'groupchat'){
                    return true;
                }

                var storage = MessageStorageService.getStorage();
                
                var records = storage ? JSON.parse(storage.historyMessage) : {};
                var members = storage ? JSON.parse(storage.members) : {};
                var arr = temp.groupJid.split('@');
                temp.tag = arr[1].split('.')[0];
                if(temp.tag === 'customerservice'){
                    temp.jId = arr[0];
                    temp.readFlag = false;
                    temp.xmpp_username = temp.userJid.split('@')[0];
                    temp.user_id = members[temp.xmpp_username] ? members[temp.xmpp_username].user_id : '';
                    temp.avatar = temp.user_id ? CONF.file + '/person/' + temp.user_id + '/avatar_small.jpg' : '';
                    records[temp.jId] = records[temp.jId] ? records[temp.jId] : {};
                    temp.time ? '': temp.time = new Date().getTIme();
                    if(!records[temp.jId][temp.id] && (temp.service === 'text' || temp.service === 'FileShare' || temp.service === 'room_product')){
                        var tempMessageLength = _.keys(records[temp.jId]).length;
                        if(tempMessageLength > 25){
                            var sortData = _.sortBy(_.values(records[temp.jId]), 'time');
                            var deleteData = sortData.splice(0, sortData.length - 25);
                            _.each(deleteData, function(item){
                                delete records[temp.jId][item.id]
                            });
                        }
                        temp.service === 'FileShare' || temp.service === 'room_product' ? temp.body = JSON.parse(temp.body) : '';
                        temp.service === 'FileShare' ? delete temp.body.preview : '';
                        records[temp.jId][temp.id] = temp;
                        MessageStorageService.setHistoryMessage(records);
                        events.emit('message', temp);
                        events.emit('count');
                    }
                }

                return true;
            };

            var init = function () {
                XmppMessages.add_on_message_callback(
                    on_message
                );
            };

            return {
                init: init
            };
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('MessageServiceModule');
            };

            this.run = function () {
                this.mod.factory(
                    'MessageService',
                    [
                        'MessageParser',
                        'XmppMessages',
                        'MessageStorageService',
                        'events',
                        'CONF',
                        message_service
                    ]
                );
            };

        });

        return Feature;

    });

})(define);