/* global Strophe */
(function () {
'use strict';

    var NAME = 'BST-SHAREDSECRET';
    var COOKIE_KEY = 'sb_admin_token';
    var COOKIE_USER = 'userid';

    Strophe.BSTSharedSecret = function() {};

    Strophe.BSTSharedSecret.prototype = new Strophe.SASLMechanism(
        NAME,
        true,
        9000
    );

    var get_cookie_value = function (sKey) {
        if (!sKey) { return null; }
        return decodeURIComponent(
            document.cookie.replace(
                new RegExp(
                    '(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(
                        /[\-\.\+\*]/g,
                        '\\$&'
                    ) + '\\s*\\=\\s*([^;]*).*$)|^.*$'
                ),
                '$1'
            )
        ) || null;
    };

    Strophe.BSTSharedSecret.test = function(connection) {
        if (connection.pass !== null) {
            return false;
        }

        var storedUser = get_cookie_value(COOKIE_USER);
        return document.cookie.indexOf(COOKIE_KEY) !== -1 &&
            connection.authcid === storedUser;
    };

    Strophe.BSTSharedSecret.prototype.onChallenge = function(connection) {
        var sharedSecret = get_cookie_value(COOKIE_KEY);
        var auth_str = connection.authcid;
        auth_str = auth_str + '\u0000';
        auth_str = auth_str + sharedSecret;
        
        return auth_str;
    };

    Strophe.Connection.prototype.mechanisms[NAME] = Strophe.BSTSharedSecret;

}());
