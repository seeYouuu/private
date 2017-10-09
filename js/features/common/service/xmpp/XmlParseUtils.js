/**
 * Common service used to parse xml
 */
(function(define) {
    'use strict';

    /**
     * Register the xmlParseUtils class with RequireJS
     */
    define(['FeatureBase', 'angular'], function(FeatureBase, angular) {

        var xmlParseUtils = function () {

            var is_error = function (iq) {
                var type = $(iq).attr('type');
                return type === 'error';
            };
            
            var get_unique_tag_or_throw = function (node, tagname) {
                var tags = node.getElementsByTagName(tagname);
                if (tags.length !== 1) {
                    throw new Error(
                        'We should have only one ' + tagname + ' tag'
                    );
                }
                return tags[0];
            };

            var get_first_tag_or_throw = function (node, tagname) {
                var tags = node.getElementsByTagName(tagname);
                if (tags.length === 0) {
                    throw new Error(
                        'No ' + tagname + ' tag found'
                    );
                }
                return tags[0];
            };

            var has_one_child = function (stanza, tagname) {
                return $(stanza).children(tagname).length === 1;
            };

            var get_tag_value = function (node, tagname) {

                var tag = get_unique_tag_or_throw(node, tagname);
                if (tag.firstChild === null) {
                    return '';
                }
                return $(tag).text();
            };

            var get_first_tag_value = function (node, tagname) {

                var tag = get_first_tag_or_throw(node, tagname);
                if (tag.firstChild === null) {
                    return '';
                }
                return $(tag).text();
            };

            var get_bool_tag_value = function (node, tagname) {
                var value = get_tag_value(node, tagname);

                if (value === '1') {
                    return true;
                }

                if (value !== '0') {
                    throw new Error(
                        tagname + ' tag should contain 0 or 1, not: ' +
                        value
                    );
                }
                return false;
            };

            var get_tag_attribute = function (stanza, tagName, attribute) {
                var tag = get_unique_tag_or_throw(stanza, tagName);
                return get_attribute(tag, attribute);
            };

            var get_attribute = function (tag, attribute, defaultValue) {
                var attributeValue = $(tag).attr(attribute);
                if (attributeValue === null || attributeValue === undefined) {
                    return defaultValue;
                }
                return attributeValue;
            };

            var get_from_jid = function (stanza) {
                var fullJID = $(stanza).attr('from');
                var jid = Strophe.getBareJidFromJid(fullJID);
                return jid;
            };

            var get_from_full_jid = function (stanza) {
                var fullJID = $(stanza).attr('from');
                return fullJID;
            };

            var contains_tag = function (stanza, tag) {
                return stanza.getElementsByTagName(tag).length > 0;
            };

            var get_optional_tag_value = function (stanza, tagName) {
                var tagValue = null;
                if(contains_tag(stanza, tagName)) {
                    tagValue = get_tag_value(stanza, tagName);
                }
                return tagValue;
            };

            var get_optional_first_tag_value = function (stanza, tagName) {
                var tagValue = null;
                if(contains_tag(stanza, tagName)) {
                    tagValue = get_first_tag_value(stanza, tagName);
                }
                return tagValue;
            };

            var get_body_text = function (stanza) {

                if (!contains_tag(stanza, 'body')) {
                    throw new Error(
                        'you can\'t get text from a stanza without a body!'
                    );
                }
                return get_tag_value(stanza, 'body');
            };

            var get_error_message = function (iq) {
                var errorTag = get_unique_tag_or_throw(iq, 'error');
                var errorMessage = get_tag_value(errorTag, 'text');
                return errorMessage;
            };

            var get_item_list = function (iq) {
                var list = iq.getElementsByTagName('list');
                if (list.length !== 1) {
                    return [];
                }
                var items = list[0].getElementsByTagName('item');
                return items;
            };

            var get_items_form = function (iq) {
                var list = iq.getElementsByTagName('x');
                if (list.length !== 1) {
                    return [];
                }
                var items = list[0].getElementsByTagName('item');
                return items;
            };

            var get_form_field_value = function (node, name) {
                var fields = node.getElementsByTagName('field');
                var i = 0;
                for (; i < fields.length; i++) {
                    var fieldNode = fields[i];
                    if (name === get_attribute(fieldNode, 'var')) {
                        return get_tag_value(fieldNode, 'value');
                    }
                }
                return;
            };

            var get_form_field_array_value = function (node, name) {
                var fields = node.getElementsByTagName('field');
                var i = 0;
                var values = [];

                var get_all_values = function (valuesTag) {
                    var j;
                    for(j = 0; j < valuesTag.length; j++) {
                        var id = $(valuesTag[j]).text();
                        values.push(id);
                    }
                    return values;
                };

                for (; i < fields.length; i++) {
                    var fieldNode = fields[i];
                    if (name === get_attribute(fieldNode, 'var')) {
                        get_all_values(
                            fieldNode.getElementsByTagName('value')
                        );
                    }
                }
                return values;
            };

            var get_items_of_list_with_name = function (resultIq, name) {
                var lists = resultIq.getElementsByTagName('list');

                var childrenListWeAreLookingFor = [];
                angular.forEach(lists, function (list) {

                    var listName = get_attribute(
                        list,
                        'name',
                        name
                    );
                    if (listName === name) {
                        childrenListWeAreLookingFor = list.childNodes;
                    }
                });

                var items = Array.prototype.filter.call(
                    childrenListWeAreLookingFor,
                    function (listOneChild) {
                        return listOneChild.nodeName.toLowerCase() === 'item';
                    }
                );
                return items;
            };

            var XML = {
                get_unique_tag_or_throw: get_unique_tag_or_throw,
                get_first_tag_or_throw: get_first_tag_or_throw,
                get_tag_value: get_tag_value,
                get_first_tag_value: get_first_tag_value,
                get_bool_tag_value: get_bool_tag_value,
                is_error: is_error,
                get_from_jid: get_from_jid,
                get_from_full_jid: get_from_full_jid,
                contains_tag: contains_tag,
                get_optional_tag_value: get_optional_tag_value,
                get_optional_first_tag_value: get_optional_first_tag_value,
                get_tag_attribute: get_tag_attribute,
                get_attribute: get_attribute,
                get_error_message: get_error_message,
                get_body_text: get_body_text,
                has_one_child: has_one_child,
                get_item_list: get_item_list,
                get_items_form: get_items_form,
                get_form_field_value: get_form_field_value,
                get_form_field_array_value: get_form_field_array_value,
                get_items_of_list_with_name: get_items_of_list_with_name
            };

            return XML;
        };

        var Feature = FeatureBase.extend(function() {

            this.initializer = function() {
                this.super.initializer('XmlParseUtilsModule');
            };

            this.run = function () {
                this.mod.factory(
                    'XmlParseUtils',
                    xmlParseUtils
                );
            };

        });

        return Feature;

    });

})(define);