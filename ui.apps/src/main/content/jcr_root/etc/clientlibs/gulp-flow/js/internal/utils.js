
GF.Utils = GF.Utils || {

    showElement: function (element) {
        element.removeClass('hidden');
    },

    hideElement: function (element) {
        element.addClass('hidden');
    },

    isVisible: function (element) {
        return element.hasClass('hidden');
    },

    toggleActive: function (element) {
        element.toggleClass('active');
    },

    activeElement: function (element) {
        element.addClass('active');
    },

    deactivateElement: function (element) {
        element.removeClass('active');
    },

    isActive: function (element) {
        return element.hasClass('active');
    },

    enableElement: function (element) {
        element.prop('disabled', false);
    },

    disableElement: function (element) {
        element.prop('disabled', true);
    },

    isEnabled: function (element) {
        return !element.prop('disabled');
    }

};
