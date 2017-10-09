(function(define) {
    'use strict';

    /**
     * Create a service to get chat history message;
     */
    define(['FeatureBase'], function(FeatureBase) {

        var history_requester = function (XmppConnector, CurrentUser) {
            var currentUserJid = CurrentUser.get_bare_jid();

            var get_all_history_message = function(){
                var connection = XmppConnector.get_connect();
                console.log(connection.mam);
                connection.mam.query(
                    currentUserJid,
                    {
                        // max: 10,
                        onMessage: function(data){
                            console.log(data);
                        },
                        onComplete: function() {
                            console.log('history query success!');
                        }
                    }
                );
            };

            var get_history_message = function(){
                var connection = XmppConnector.get_connect();
                console.log(connection.mam);
                connection.mam.query(
                    currentUserJid,
                    {
                        // max: 10,
                        onMessage: function(data){
                            console.log(data);
                        },
                        onComplete: function() {
                            console.log('history query success!');
                        }
                    }
                );
            };
            
            return {
                getAllHistoryMessage: get_all_history_message,
                getHistoryMessage: get_history_message
            };
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('HistoryRequesterModule');
            };

            this.run = function () {
                this.mod.factory(
                    'HistoryRequester',
                    [
                        'XmppConnector',
                        'CurrentUser',
                        history_requester
                    ]
                );
            };

        });

        return Feature;

    });

})(define);