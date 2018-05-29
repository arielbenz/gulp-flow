// Header js

'use strict'

var header = (function() {

    var structure = {
        container: '.header',
        title: '.header__title',
        button: '.header__button'
    };

    var domElements = {};

    var catchDom = function() {
        domElements.container = $(structure.container);
        domElements.title = $(structure.title);
        domElements.button = $(structure.button);
    };

    var bindEvents = function() {
        domElements.button.on('click', events.showMessage);
    };

    var events = {
        showMessage: function(e) {
            console.log("show message");
        }
    };

    var initialize = function() {
        catchDom();
        if (domElements.container.length) {
            bindEvents();
        }
    };

    return {
        init: initialize
    };

})();

header.init();
