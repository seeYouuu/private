/*global tinymce:true, $ */

tinymce.PluginManager.add('sbimage', function(editor) {

    var openUpload = function () {
       $('#tinymceImageUpload').click();
    };

    editor.addButton('sbimage', {
        icon: 'image',
        tooltip: 'Insert image',
        onclick: openUpload,
        //stateSelector: 'img:not([data-mce-object],[data-mce-placeholder])'
    });
});