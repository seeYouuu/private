(function(define) {
    'use strict';

    /**
     * Create a service to get information about the current user
     */
    define(['FeatureBase'], function(FeatureBase) {

        var current_user = function (XmppConnector) {
            
            var get_user_id = function () {
                var jid = get_bare_jid();
                if (jid === null) {
                    return null;
                }
                return Strophe.getNodeFromJid(jid);
            };

            var get_jid = function () {
                var connection = XmppConnector.get_connect();
                return connection.jid;
            };

            var get_bare_jid = function () {
                var connection = XmppConnector.get_connect();
                return Strophe.getBareJidFromJid(connection.jid);
            };
            
            var get_language = function (){
                return 'en';
            };

            var CurrentUser = {
                get_user_id: get_user_id,
                get_jid: get_jid,
                get_bare_jid: get_bare_jid,
                get_language: get_language
            };

            return CurrentUser;
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('CurrentUserModule');
            };

            this.run = function () {
                this.mod.factory(
                    'CurrentUser',
                    [
                        'XmppConnector',
                        current_user
                    ]
                );
            };

        });

        return Feature;

    });

})(define);