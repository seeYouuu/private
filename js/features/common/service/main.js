/**
 *  Entrance of common service
 *
 *  @author  sky.zhang
 *  @date    Jun 11, 2015
 *
 */
(function(define) {
    'use strict';

    define([
        './CurrentAdminService',
        './DaySelectorApi',
        './HourSelectorApi',
        './Globalization',
        './ImageCropService',
        './ImageUploaderService',
        './ExcelUploaderService',
        './FilterStorageService',
        './SbCropImg',
        './xmpp/XmppConnector',
        './xmpp/XmlParseUtils',
        './xmpp/MessageParser',
        './xmpp/MessageStorageService',
        './xmpp/SendMessage',
        './xmpp/CurrentUser',
        './xmpp/XmppGenerator',
        './xmpp/MessageGenerator',
        './xmpp/StanzaSender',
        './xmpp/XmppPresences',
        './xmpp/XmppMessages',
        './xmpp/MessageService'
    ], function() {
        return [].slice.call(arguments);
    });

}(define));
