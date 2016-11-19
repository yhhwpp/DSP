/**
 *  @file category-edit.js
 *  @author xiaokl
 */
(function ($) {
    'use strict';
    var CategoryEdit = function (options) {
        this.init('cateedit', options, CategoryEdit.defaults);
    };

     // inherit from Abstract input
    $.fn.editableutils.inherit(CategoryEdit, $.fn.editabletypes.list);

    $.extend(CategoryEdit.prototype, {
        /*
            加载模版表单对象
        */
        renderList: function () {
            var $parent;
            var $category;
            this.$tpl.empty();
            if (this.sourceData) {
                if (this.sourceData.parent && this.sourceData.category) {
                    $parent = '<div class="pull-left parent-div">';
                    $category = '<div class="pull-left category-div">';
                    for (var key in this.sourceData.parent) {
                        $parent += '<div class="radio"><label><input type="radio" value="' + key + '" name="parent" data-name="parent" data-toggle="showDiv" id="parent_' + key + '">'
                            + this.sourceData.parent[key]
                            + '</label></div>';
                        if (this.sourceData.category[key] && this.sourceData.category[key].length > 0) {
                            $category += '<div aria-labelledby="parent_' + key + '" style="display:none;"> <select size="5" name="category" data-name="category_' + key + '">';
                            var oCategory = this.sourceData.category[key];

                            for (var i = 0, j = oCategory.length; i < j; i++) {
                                $category += '<option value="' + oCategory[i].category + '">' + oCategory[i].name + '</option>';
                            }
                            $category += '</select></div>';
                        }
                    }
                    $parent += '</div>';
                    $category += '</div>';
                    this.$tpl.append($parent + $category);
                    $.fn.initDom();
                }
            }
        },
        value2input: function (value) {
            if (!value) {
                return;
            }
            if (value.parent && value.category) {
                this.$input.find('[name=parent][value=' + value.parent + ']').prop('checked', true).trigger('click');
                this.$input.find('[data-name="category_' + value.parent + '"]').val(value.category);
            }
            else {
                this.$input.find('[name=parent]').eq(0).prop('checked', true).trigger('click');
            }
        },
        input2value: function () {
            var parent = this.$input.find('[name=parent]:checked').val();
            if (!(parent && parseInt(parent, 10) > 0)) {
                return null;
            }
            var oCategory = this.$input.find('[data-name="category_' + parent + '"]');
            if (!oCategory) {
                return null;
            }
            var category = oCategory.val();
            if (!(category && category > 0)) {
                return null;
            }
            return category;
        },
        onSourceReady: function (success, error) {
            // run source if it function
            var source;
            if ($.isFunction(this.options.source)) {
                source = this.options.source.call(this.options.scope);
                this.sourceData = null;
                // note: if function returns the same source as URL - sourceData will be taken from cahce and no extra request performed
            }
            else {
                source = this.options.source;
            }
            // if allready loaded just call success
            if (this.options.sourceCache && $.isArray(this.sourceData)) {
                success.call(this);
                return;
            }
            // try parse json in single quotes (for double quotes jquery does automatically)
            try {
                source = $.fn.editableutils.tryParseJson(source, false);
            }
            catch (e) {
                error.call(this);
                return;
            }
            // loading from url
            if (typeof source === 'string') {
                // try to get sourceData from cache
                if (this.options.sourceCache) {
                    var cacheID = source;
                    var cache;

                    if (!$(document).data(cacheID)) {
                        $(document).data(cacheID, {});
                    }
                    cache = $(document).data(cacheID);

                    // check for cached data
                    if (cache.loading === false && cache.sourceData) { // take source from cache
                        this.sourceData = cache.sourceData;
                        this.doPrepend();
                        success.call(this);
                        return;
                    }
                    else if (cache.loading === true) { // cache is loading, put callback in stack to be called later
                        cache.callbacks.push($.proxy(function () {
                            this.sourceData = cache.sourceData;
                            this.doPrepend();
                            success.call(this);
                        }, this));

                        // also collecting error callbacks
                        cache.err_callbacks.push($.proxy(error, this));
                        return;
                    }
                    // no cache yet, activate it
                    cache.loading = true;
                    cache.callbacks = [];
                    cache.err_callbacks = [];
                }
                // ajaxOptions for source. Can be overwritten bt options.sourceOptions
                var ajaxOptions = $.extend({
                    url: source,
                    type: 'get',
                    cache: false,
                    dataType: 'json',
                    success: $.proxy(function (data) {
                        if (data.res !== 0) {
                            return;
                        }
                        if (cache) {
                            cache.loading = false;
                        }
                        this.sourceData = data.obj;
                        if (this.sourceData) {
                            if (cache) {
                                // store result in cache
                                cache.sourceData = this.sourceData;
                                // run success callbacks for other fields waiting for this source
                                $.each(cache.callbacks, function () {
                                    this.call();
                                });
                            }
                            this.doPrepend();
                            success.call(this);
                        }
                        else {
                            error.call(this);
                            if (cache) {
                                // run error callbacks for other fields waiting for this source
                                $.each(cache.err_callbacks, function () {
                                    this.call();
                                });
                            }
                        }
                    }, this),
                    error: $.proxy(function () {
                        error.call(this);
                        if (cache) {
                            cache.loading = false;
                            // run error callbacks for other fields
                            $.each(cache.err_callbacks, function () {
                                this.call();
                            });
                        }
                    }, this)
                }, this.options.sourceOptions);
                // loading sourceData from server
                $.ajax(ajaxOptions);
            }
            else { // options as json/array
                this.sourceData = source;
                if (this.sourceData) {
                    this.doPrepend();
                    success.call(this);
                }
                else {
                    error.call(this);
                }
            }
        }
    });

    CategoryEdit.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        tpl: '<div id="js-name-div" class="name-div"></div>',
        inputclass: null,
        separator: ','
    });
    $.fn.editabletypes.cateedit = CategoryEdit;
}(window.jQuery));
