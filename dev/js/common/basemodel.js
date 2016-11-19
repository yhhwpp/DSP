/**
 * @file config.js
 * @author xiaokl
 */
(function ($) {
    'use strict';

    $.fn.basemodel = {};

    var AbstractModel = function () {};

    AbstractModel.prototype = {
        save: function (options, callback) {
            $.ajax($.extend({
                dataType: 'json',
                type: 'POST',
                success: function (result) {
                    typeof callback === 'function' && callback.call(this, result);
                },
                error: function () {
                    Helper.fnPrompt(MSG.server_error);
                }
            }, options));
        },
        setData: function (key, value) {
            if (value === null) {
                value = '';
            }

            this.data[key] = value;
        },
        getPostData: function () {
            return this.data;
        }
    };

    $.extend($.fn.basemodel, {
        abstractmodel: AbstractModel
    });

}(window.jQuery));

(function ($) {
    'use strict';

    $.fn.basemodelutils = {

        /*
            classic JS inheritance function
        */
        inherit: function (Child, Parent) {
            var F = function () {};
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.prototype.constructor = Child;
            Child.superclass = Parent.prototype;
        }
    };

}(window.jQuery));
