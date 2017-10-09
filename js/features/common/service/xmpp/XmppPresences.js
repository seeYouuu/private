(function(define) {
    'use strict';

    /**
     * Create a service to Generates an XML message
     */
    define(['FeatureBase'], function(FeatureBase) {
        
        function $pres(attrs) { return new Strophe.Builder("presence", attrs); };

        var xmpp_presences = function (XmppConnector) {

            var tell_we_are_online = function () {
                var connection = XmppConnector.get_connect();
                connection.send($pres());
            };

            var tell_we_are_offline = function () {
                var connection = XmppConnector.get_connect();
                connection.send($pres({
                    type: 'unavailable'
                }));
            };

            return {
                tell_we_are_online: tell_we_are_online,
                tell_we_are_offline: tell_we_are_offline
            };
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('XmppPresencesModule');
            };

            this.run = function () {
                this.mod.factory(
                    'XmppPresences',
                    [
                        'XmppConnector',
                        xmpp_presences
                    ]
                );
            };

        });

        return Feature;

    });

})(define);