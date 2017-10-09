/* global Strophe, $iq */
(function() {
'use strict';

    /**
     * Custom Strophe MAM (xep-0313) plugin with additional nodes
     */

    function $iq(attrs) { return new Strophe.Builder("iq", attrs); };

    var mamPlugin = {
        _c: null,
        _p: [
            'with', 'start', 'end',
            // custom nodes
            'company'
        ],
        init: function (conn) {
            this._c = conn;
            Strophe.addNamespace('MAM', 'urn:xmpp:mam:0');
        },
        query: function (jid, options) {
            var _p = this._p;
            var attr = {
                type:'set',
                id:jid
            };
            var mamAttr = {xmlns: Strophe.NS.MAM};
            if (!!options.queryid) {
                mamAttr.queryid = options.queryid;
                delete options.queryid;
            }
            var iq = $iq(attr).c('query', mamAttr).c('x',{xmlns:'jabber:x:data'});

            iq.c('field',{var:'FORM_TYPE'}).c('value').t('urn:xmpp:mam:0').up().up();
            var i;
            for (i = 0; i < this._p.length; i++) {
                var pn = _p[i];
                var p = options[pn];
                delete options[pn];
                if (!!p) {
                    iq.c('field',{var:pn}).c('value').t(p).up().up();
                }
            }
            iq.up();

            var onComplete = options.onComplete;
            delete options.onComplete;
            iq.cnode(new Strophe.RSM(options).toXML());

            return this._c.sendIQ(iq, onComplete);
        }
    };

    Strophe.addConnectionPlugin('mam', mamPlugin);

}());
