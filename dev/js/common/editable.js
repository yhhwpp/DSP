/*

    在html中构建一个editable元素
    @class editable
    @uses editableContainer
*/
(function($) {
    "use strict";

    var Editable = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.editable.defaults, options);
        this.init();
    };

    Editable.prototype = {
        constructor: Editable,
        init: function() {
            var isValueByText = false;

            this.options.name = this.options.name || this.$element.attr('id');
            this.options.scope = this.$element[0];
            this.input = $.fn.editableutils.createInput(this.options); // 根据指定表单类型，创建表单

            if (!this.input) {
                return;
            }

            // 设置表单初始化的值(从options.value或者element's text)
            if (this.options.value === undefined || this.options.value === null) {
                this.value = this.input.html2value($.trim(this.$element.html()));
                isValueByText = true;
            } else if (typeof this.options.value === 'function') {
                this.value = this.options.value.call(this.options.scope);
            } else {
                /*
                  value can be string when received from 'data-value' attribute
                  for complext objects value can be set as json string in data-value attribute, 
                  e.g. data-value="{city: 'Moscow', street: 'Lenina'}"
                */
                this.options.value = $.fn.editableutils.tryParseJson(this.options.value, true); 
                if(typeof this.options.value === 'string') {
                    this.value = this.input.str2value(this.options.value);
                } else {
                    this.value = this.options.value;
                }
            }

            // 添加editable样式到每个元素
            this.$element.addClass('editable');

            //specifically for "textarea" add class .editable-pre-wrapped to keep linebreaks
            if (this.input.type === 'textarea') {
                this.$element.addClass('editable-pre-wrapped');
            }

            //attach handler activating editable. In disabled mode it just prevent default action (useful for links)
            if (this.options.toggle !== 'manual') {
                this.$element.addClass('editable-click');
                this.$element.on(this.options.toggle + '.editable', $.proxy(function(e) {
                    //prevent following link if editable enabled
                    if (!this.options.disabled) {
                        e.preventDefault();
                    }

                    //stop propagation not required because in document click handler it checks event target
                    //e.stopPropagation();

                    if (this.options.toggle === 'mouseenter') {
                        //for hover only show container
                        this.show();
                    } else {
                        //when toggle='click' we should not close all other containers as they will be closed automatically in document click listener
                        var closeAll = (this.options.toggle !== 'click');
                        this.toggle(closeAll);
                    }
                }, this));
            } else {
                this.$element.attr('tabindex', -1); //do not stop focus on element when toggled manually
            }
        },
        /**
        Shows container with form
        @method show()
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/
        show: function(closeAll) {
            if (this.options.disabled) {
                return;
            }

            //init editableContainer: popover, tooltip, inline, etc..
            if (!this.container) {
                var containerOptions = $.extend({}, this.options, {
                    value: this.value,
                    input: this.input //pass input to form (as it is already created)
                });
                this.$element.editableContainer(containerOptions);
                //listen `save` event 
                this.$element.on("save.internal", $.proxy(this.save, this));
                this.container = this.$element.data('editableContainer');
            } else if (this.container.tip().is(':visible')) {
                return;
            }

            //show container
            this.container.show(closeAll);

            // 表单验证
            /*if($('form.editableform')) {
                $('form.editableform').validation();
            }*/
        },

        /**
        Hides container with form
        @method hide()
        **/
        hide: function() {
            if (this.container) {
                this.container.hide();
            }
        },
        /**
        Toggles container visibility (show / hide)
        @method toggle()
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/
        toggle: function(closeAll) {
            if (this.container && this.container.tip().is(':visible')) {
                this.hide();
            } else {
                this.show(closeAll);
            }
        }
    };

    /*
    初始化编辑框editable
    */
    $.fn.editable = function(option) {
        var result = {},
            args = arguments,
            datakey = 'editable';

        // 返回jquery对象
        return this.each(function() {
            var $this = $(this),
                data = $this.data(datakey),
                options = typeof option === 'object' && option;

            if (!data) {
                $this.data(datakey, (data = new Editable(this, options)));
            }
            if (options === 'string') {
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            }

        });
    };

    $.fn.editable.defaults = {
        type: 'text', // 表单类型
        toggle: 'click', // editable 触发事件
        value: null, // 表单默认文本
        displayVal: null // 替换value
    };


}(window.jQuery));


/*
    editableutils 编辑框工具类
*/
(function($) {
    'use strict';

    $.fn.editableutils = {
        /*
            classic JS inheritance function
        */
        inherit: function(Child, Parent) {
            var F = function() {};
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.prototype.constructor = Child;
            Child.superclass = Parent.prototype;
        },
        /**
         * set caret position in input
         * see http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
         */
        setCursorPosition: function(elem, pos) {
            if (elem.setSelectionRange) {
                elem.setSelectionRange(pos, pos);
            } else if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        },
         /**
        * function to parse JSON in *single* quotes. (jquery automatically parse only double quotes)
        * That allows such code as: <a data-source="{'a': 'b', 'c': 'd'}">
        * safe = true --> means no exception will be thrown
        * for details see http://stackoverflow.com/questions/7410348/how-to-set-json-format-to-html5-data-attributes-in-the-jquery
        */
        tryParseJson: function(s, safe) {
            if (typeof s === 'string' && s.length && s.match(/^[\{\[].*[\}\]]$/)) {
                if (safe) {
                    try {
                        /*jslint evil: true*/
                        s = (new Function('return ' + s))();
                        /*jslint evil: false*/
                    } catch (e) {} finally {
                        return s;
                    }
                } else {
                    /*jslint evil: true*/
                    s = (new Function('return ' + s))();
                    /*jslint evil: false*/
                }
            }
            return s;
        },
        /**
         * slice object by specified keys
         */
        sliceObj: function(obj, keys, caseSensitive /* default: false */ ) {
            var key, keyLower, newObj = {};

            if (!$.isArray(keys) || !keys.length) {
                return newObj;
            }

            for (var i = 0; i < keys.length; i++) {
                key = keys[i];
                if (obj.hasOwnProperty(key)) {
                    newObj[key] = obj[key];
                }

                if (caseSensitive === true) {
                    continue;
                }

                //when getting data-* attributes via $.data() it's converted to lowercase.
                //details: http://stackoverflow.com/questions/7602565/using-data-attributes-with-jquery
                //workaround is code below.
                keyLower = key.toLowerCase();
                if (obj.hasOwnProperty(keyLower)) {
                    newObj[key] = obj[keyLower];
                }
            }
            return newObj;
        },
        /*
        returns array items from sourceData having value property equal or inArray of 'value'
       */
        itemsByValue: function(value, sourceData, valueProp) {
            if (!sourceData || value === null) {
                return [];
            }

            if (typeof(valueProp) !== "function") {
                var idKey = valueProp || 'value';
                valueProp = function(e) {
                    return e[idKey];
                };
            }

            var isValArray = $.isArray(value),
                result = [],
                that = this;

            $.each(sourceData, function(i, o) {
                if (o.children) {
                    result = result.concat(that.itemsByValue(value, o.children, valueProp));
                } else {
                    /*jslint eqeq: true*/
                    if (isValArray) {
                        if ($.grep(value, function(v) {
                                return v == (o && typeof o === 'object' ? valueProp(o) : o);
                            }).length) {
                            result.push(o);
                        }
                    } else {
                        var itemValue = (o && (typeof o === 'object')) ? valueProp(o) : o;
                        if (value == itemValue) {
                            result.push(o);
                        }
                    }
                    /*jslint eqeq: false*/
                }
            });

            return result;
        },

        /*
        Returns input by options: type, mode. 
        */
        createInput: function(options) {
            var TypeConstructor, typeOptions, input,
                type = options.type;

            //`date` is some kind of virtual type that is transformed to one of exact types
            //depending on mode and core lib
            //create input of specified type. Input will be used for converting value, not in form
            if (typeof $.fn.editabletypes[type] === 'function') {
                TypeConstructor = $.fn.editabletypes[type];
                typeOptions = this.sliceObj(options, this.objectKeys(TypeConstructor.defaults));
                input = new TypeConstructor(typeOptions);
                return input;
            } else {
                $.error('Unknown type: ' + type);
                return false;
            }
        },
        /*
         returns keys of object
        */
        objectKeys: function(o) {
            if (Object.keys) {
                return Object.keys(o);
            } else {
                if (o !== Object(o)) {
                    throw new TypeError('Object.keys called on a non-object');
                }
                var k = [],
                    p;
                for (p in o) {
                    if (Object.prototype.hasOwnProperty.call(o, p)) {
                        k.push(p);
                    }
                }
                return k;
            }

        }
    };
}(window.jQuery));


/**
AbstractInput - base class for all editable inputs.
It defines interface to be implemented by any input type.
To create your own input you can inherit from this class.

抽象表单

@class abstractinput
**/
(function($) {
    "use strict";

    $.fn.editabletypes = {};

    var AbstractInput = function() {};

    AbstractInput.prototype = {
        /*
            init inputs
        */
        init: function(type, options, defaults) {
            this.type = type;
            this.options = $.extend({}, defaults, options);
        },
        /*
            预加载模版
       */
        prerender: function() {
            this.$tpl = $(this.options.tpl); // 将模版设定为jquery object
            this.$input = this.$tpl; // 通过自我控制，改变渲染方法
            this.$clear = null; // clear button
        },

        /*
        渲染input tpl， 返回tpl的jquery对象.子类可以重写该方法
        */
        render: function() {

        },
        /**
         Sets element's html by value. 

         @method value2html(value, element)
         @param {mixed} value
         @param {DOMElement} element
        **/
        value2html: function(value, element) {
            $(element)[this.options.escape ? 'text' : 'html']($.trim(value));
        },

        /**
         Converts element's html to value

         @method html2value(html)
         @param {string} html
         @returns {mixed}
        **/
        html2value: function(html) {
            return $('<div>').html(html).text();
        },

        /**
         Converts value to string (for internal compare). For submitting to server used value2submit().

         @method value2str(value) 
         @param {mixed} value
         @returns {string}
        **/
        value2str: function(value) {
            return value;
        },

        /**
         Converts string received from server into value. Usually from `data-value` attribute.

         @method str2value(str)
         @param {string} str
         @returns {mixed}
        **/
        str2value: function(str) {
            return str;
        },

        /**
         Converts value for submitting to server. Result can be string or object.

         @method value2submit(value) 
         @param {mixed} value
         @returns {mixed}
        **/
        value2submit: function(value) {
            return value;
        },

        /**
         Sets value of input.

         @method value2input(value) 
         @param {mixed} value
        **/
        value2input: function(value) {
            this.$input.val(value);
        },

        /**
         Returns value of input. Value can be object (e.g. datepicker)

         @method input2value() 
        **/
        input2value: function() {
            return this.$input.val();
        },

        /**
         Activates input. For text it sets focus.

         @method activate() 
        **/
        activate: function() {
            if (this.$input.is(':visible')) {
                this.$input.focus();
            }
        },

        /**
         Creates input.

         @method clear() 
        **/
        clear: function() {
            this.$input.val(null);
        },

        /**
         method to escape html.
        **/
        escape: function(str) {
            return $('<div>').text(str).html();
        },

        /**
        Additional actions when destroying element 
        **/
        destroy: function() {},

        // -------- helper functions --------
        setClass: function() {
            if (this.options.inputclass) {
                this.$input.addClass(this.options.inputclass);
            }
        },

        setAttr: function(attr) {
            if (this.options[attr] !== undefined && this.options[attr] !== null) {
                if(typeof this.options[attr] === 'function') {
                    this.$input.attr(attr, this.options[attr].call(this.options.scope));
                } else {
                    this.$input.attr(attr, this.options[attr]);
                }
            }
        },

        option: function(key, value) {
            this.options[key] = value;
        }
    };

    AbstractInput.defaults = {
        tpl: '', // 模版
        inputclass: '', //给input表单添加的样式
        scope: null, // 定义内部方法的scope
        showbuttons: true // 显示表单按钮
    };

    $.extend($.fn.editabletypes, {
        abstractinput: AbstractInput
    });
}(window.jQuery));

/*
    Text input types
*/
(function($) {
    "use strict";

    var Text = function(options) {
        this.init('text', options, Text.defaults);
    };

    $.fn.editableutils.inherit(Text, $.fn.editabletypes.abstractinput);

    $.extend(Text.prototype, {
        render: function() {
            this.renderClear();
            this.setClass();
            this.setAttr('placeholder');
            this.setAttr('maxlength');
        },
        activate: function() {
            if (this.$input.is(':visible')) {
                this.$input.focus();
                $.fn.editableutils.setCursorPosition(this.$input.get(0), this.$input.val().length);
                if (this.toggleClear) {
                    this.toggleClear();
                }
            }
        },

        //render clear button
        renderClear: function() {
            if (this.options.clear) {
                this.$clear = $('<span class="editable-clear-x"><i class="fa fa-times"></i></span>');
                this.$input.after(this.$clear)
                    .css('padding-right', 24)
                    .keyup($.proxy(function(e) {
                        //arrows, enter, tab, etc
                        if (~$.inArray(e.keyCode, [40, 38, 9, 13, 27])) {
                            return;
                        }

                        clearTimeout(this.t);
                        var that = this;
                        this.t = setTimeout(function() {
                            that.toggleClear(e);
                        }, 100);

                    }, this))
                    .parent().css('position', 'relative');

                this.$clear.click($.proxy(this.clear, this));
            }
        },
        //show / hide clear button
        toggleClear: function(e) {
            if (!this.$clear) {
                return;
            }

            var len = this.$input.val().length,
                visible = this.$clear.is(':visible');

            if (len && !visible) {
                this.$clear.show();
            }

            if (!len && visible) {
                this.$clear.hide();
            }
        },

        clear: function() {
            this.$clear.hide();
            this.$input.val('').focus();
        }
    });

    Text.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<input type="text"/>',
        placeholder: null,
        maxlength: null,
        clear: true
    });


    $.fn.editabletypes.text = 　Text;

}(window.jQuery));

/*
    Text input types
*/
(function($) {
    "use strict";

    var Number = function(options) {
        this.init('number', options, Number.defaults);
    };

    $.fn.editableutils.inherit(Number, $.fn.editabletypes.text);

    $.extend(Number.prototype, {
        render: function() {
            Number.superclass.render.call(this);
            this.setAttr('min');
            this.setAttr('max');
            this.setAttr('step');
        },
        activate: function() {
            if (this.$input.is(':visible')) {
                this.$input.focus();
                if (this.toggleClear) {
                    this.toggleClear();
                }
            }
        }  
    });

    Number.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="number"/>',
        inputclass: 'input-mini',
        min:null,
        max:null,
        step:null
    });

    $.fn.editabletypes.number = Number;

}(window.jQuery));

/**
List - abstract class for inputs that have source option loaded from js array or via ajax

@class list
@extends abstractinput
**/
(function ($) {
    "use strict";
    
    var List = function (options) {
       
    };

    $.fn.editableutils.inherit(List, $.fn.editabletypes.abstractinput);

    $.extend(List.prototype, {
        render: function () {
            var deferred = $.Deferred();

            this.error = null;
            this.onSourceReady(function () {
                this.renderList();
                deferred.resolve();
            }, function () {
                this.error = this.options.sourceError;
                deferred.resolve();
            });

            return deferred.promise();
        },

        html2value: function (html) {
            return null; //can't set value by text
        },
        
        value2html: function (value, element, display, response) {
            var deferred = $.Deferred(),
                success = function () {
                    if(typeof display === 'function') {
                        //custom display method
                        display.call(element, value, this.sourceData, response); 
                    } else {
                        this.value2htmlFinal(value, element);
                    }
                    deferred.resolve();
               };
            
            //for null value just call success without loading source
            if(value === null) {
               success.call(this);   
            } else {
               this.onSourceReady(success, function () { deferred.resolve(); });
            }

            return deferred.promise();
        },  

        // ------------- additional functions ------------

        onSourceReady: function (success, error) {
            //run source if it function
            var source;
            if ($.isFunction(this.options.source)) {
                source = this.options.source.call(this.options.scope);
                this.sourceData = null;
                //note: if function returns the same source as URL - sourceData will be taken from cahce and no extra request performed
            } else {
                source = this.options.source;
            }            
            
            //if allready loaded just call success
            if(this.options.sourceCache && $.isArray(this.sourceData)) {
                success.call(this);
                return; 
            }

            //try parse json in single quotes (for double quotes jquery does automatically)
            try {
                source = $.fn.editableutils.tryParseJson(source, false);
            } catch (e) {
                error.call(this);
                return;
            }
            //loading from url
            if (typeof source === 'string') {
                //try to get sourceData from cache
                if(this.options.sourceCache) {
                    var cacheID = source,
                    cache;

                    if (!$(document).data(cacheID)) {
                        $(document).data(cacheID, {});
                    }
                    cache = $(document).data(cacheID);

                    //check for cached data
                    if (cache.loading === false && cache.sourceData) { //take source from cache
                        this.sourceData = cache.sourceData;
                        this.doPrepend();
                        success.call(this);
                        return;
                    } else if (cache.loading === true) { //cache is loading, put callback in stack to be called later
                        cache.callbacks.push($.proxy(function () {
                            this.sourceData = cache.sourceData;
                            this.doPrepend();
                            success.call(this);
                        }, this));

                        //also collecting error callbacks
                        cache.err_callbacks.push($.proxy(error, this));
                        return;
                    } else { //no cache yet, activate it
                        cache.loading = true;
                        cache.callbacks = [];
                        cache.err_callbacks = [];
                    }
                }
                
                //ajaxOptions for source. Can be overwritten bt options.sourceOptions
                var ajaxOptions = $.extend({
                    url: source,
                    type: 'get',
                    cache: false,
                    dataType: 'json',
                    success: $.proxy(function (data) {
                        if (data.res !== 0) {
                            this.options.sourceError = data.msg;
                            error.call(this);
                            return;
                        }
                        if(cache) {
                            cache.loading = false;
                        }
                        if ($.isFunction(this.options.sourceCallback)) {
                            this.sourceData = this.options.sourceCallback(data);
                        }
                        else {
                            this.sourceData = this.makeArray(data.obj);
                        }
                        
                        if($.isArray(this.sourceData)) {
                            if(cache) {
                                //store result in cache
                                cache.sourceData = this.sourceData;
                                //run success callbacks for other fields waiting for this source
                                $.each(cache.callbacks, function () { this.call(); }); 
                            }
                            this.doPrepend();
                            success.call(this);
                        } else {
                            error.call(this);
                            if(cache) {
                                //run error callbacks for other fields waiting for this source
                                $.each(cache.err_callbacks, function () { this.call(); }); 
                            }
                        }
                    }, this),
                    error: $.proxy(function () {
                        error.call(this);
                        if(cache) {
                             cache.loading = false;
                             //run error callbacks for other fields
                             $.each(cache.err_callbacks, function () { this.call(); }); 
                        }
                    }, this)
                }, this.options.sourceOptions);
                
                //loading sourceData from server
                $.ajax(ajaxOptions);
                
            } else { //options as json/array
                this.sourceData = this.makeArray(source);
                    
                if($.isArray(this.sourceData)) {
                    this.doPrepend();
                    success.call(this);   
                } else {
                    error.call(this);
                }
            }
        },

        doPrepend: function () {
            if(this.options.prepend === null || this.options.prepend === undefined) {
                return;  
            }
            
            if(!$.isArray(this.prependData)) {
                //run prepend if it is function (once)
                if ($.isFunction(this.options.prepend)) {
                    this.options.prepend = this.options.prepend.call(this.options.scope);
                }
              
                //try parse json in single quotes
                this.options.prepend = $.fn.editableutils.tryParseJson(this.options.prepend, true);
                
                //convert prepend from string to object
                if (typeof this.options.prepend === 'string') {
                    this.options.prepend = {'': this.options.prepend};
                }
                
                this.prependData = this.makeArray(this.options.prepend);
            }

            if($.isArray(this.prependData) && $.isArray(this.sourceData)) {
                this.sourceData = this.prependData.concat(this.sourceData);
            }
        },

        /*
         renders input list
        */
        renderList: function() {
            // this method should be overwritten in child class
        },
       
         /*
         set element's html by value
        */
        value2htmlFinal: function(value, element) {
            // this method should be overwritten in child class
        },        

        /**
        * convert data to array suitable for sourceData, e.g. [{value: 1, text: 'abc'}, {...}]
        */
        makeArray: function(data) {
            var count, obj, result = [], item, iterateItem;
            if(!data || typeof data === 'string') {
                return null; 
            }

            if($.isArray(data)) { //array
                /* 
                   function to iterate inside item of array if item is object.
                   Caclulates count of keys in item and store in obj. 
                */
                iterateItem = function (k, v) {
                    obj = {value: k, text: v};
                    if(count++ >= 2) {
                        return false;// exit from `each` if item has more than one key.
                    }
                };
            
                for(var i = 0; i < data.length; i++) {
                    item = data[i]; 
                    if(typeof item === 'object') {
                        count = 0; //count of keys inside item
                        $.each(item, iterateItem);
                        //case: [{val1: 'text1'}, {val2: 'text2} ...]
                        if(count === 1) { 
                            result.push(obj); 
                            //case: [{value: 1, text: 'text1'}, {value: 2, text: 'text2'}, ...]
                        } else if(count > 1) {
                            //removed check of existance: item.hasOwnProperty('value') && item.hasOwnProperty('text')
                            if(item.children) {
                                item.children = this.makeArray(item.children);   
                            }
                            result.push(item);
                        }
                    } else {
                        //case: ['text1', 'text2' ...]
                        result.push({value: item, text: item}); 
                    }
                }
            } else {  //case: {val1: 'text1', val2: 'text2, ...}
                $.each(data, function (k, v) {
                    result.push({value: k, text: v});
                });  
            }
            return result;
        },
        
        option: function(key, value) {
            this.options[key] = value;
            if(key === 'source') {
                this.sourceData = null;
            }
            if(key === 'prepend') {
                this.prependData = null;
            }            
        }        

    });      

    List.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        Source data for list.  
        If **array** - it should be in format: `[{value: 1, text: "text1"}, {value: 2, text: "text2"}, ...]`  
        For compability, object format is also supported: `{"1": "text1", "2": "text2" ...}` but it does not guarantee elements order.
        
        If **string** - considered ajax url to load items. In that case results will be cached for fields with the same source and name. See also `sourceCache` option.
          
        If **function**, it should return data in format above (since 1.4.0).
        
        Since 1.4.1 key `children` supported to render OPTGROUP (for **select** input only).  
        `[{text: "group1", children: [{value: 1, text: "text1"}, {value: 2, text: "text2"}]}, ...]` 

        
        @property source 
        @type string | array | object | function
        @default null
        **/         
        source: null, 
        /**
        Data automatically prepended to the beginning of dropdown list.
        
        @property prepend 
        @type string | array | object | function
        @default false
        **/         
        prepend: false,
        /**
        Error message when list cannot be loaded (e.g. ajax error)
        
        @property sourceError 
        @type string
        @default Error when loading list
        **/          
        sourceError: '加载数据列表失败',
        /**
        if <code>true</code> and source is **string url** - results will be cached for fields with the same source.    
        Usefull for editable column in grid to prevent extra requests.
        
        @property sourceCache 
        @type boolean
        @default true
        @since 1.2.0
        **/        
        sourceCache: true,
        /**
        Additional ajax options to be used in $.ajax() when loading list from server.
        Useful to send extra parameters (`data` key) or change request method (`type` key).
        
        @property sourceOptions 
        @type object|function
        @default null
        @since 1.5.0
        **/        
        sourceOptions: null,
        // 回调
        sourceCallback: null,
    });

    $.fn.editabletypes.list = List;      

}(window.jQuery));



/**
List of checkboxes. 
Internally value stored as javascript array of values.

@class checklist
@extends list
@final
@example
<a href="#" id="options" data-type="checklist" data-pk="1" data-url="/post" data-title="Select options"></a>
<script>
$(function(){
    $('#options').editable({
        value: [2, 3],    
        source: [
              {value: 1, text: 'option1'},
              {value: 2, text: 'option2'},
              {value: 3, text: 'option3'}
           ]
    });
});
</script>
**/
(function ($) {
    "use strict";
    
    var Checklist = function (options) {
        this.init('checkbox', options, Checklist.defaults);
    };

    $.fn.editableutils.inherit(Checklist, $.fn.editabletypes.list);

    $.extend(Checklist.prototype, {
        renderList: function() {
            var $label, $div;
            
            this.$tpl.empty();
            
            if(!$.isArray(this.sourceData)) {
                return;
            }

            for(var i=0; i<this.sourceData.length; i++) {
                $label = $('<label>').append($('<input>', {
                                           type: 'checkbox',
                                           name: 'checklist',
                                           value: this.sourceData[i].value 
                                     }))
                                     .append($('<span>').text(' '+this.sourceData[i].text));
                
                $('<div>').append($label).appendTo(this.$tpl);
            }
            
            this.$input = this.$tpl.find('input[type="checkbox"]');
            this.setClass();
        },
       
       value2str: function(value) {
           return $.isArray(value) ? value.sort().join($.trim(this.options.separator)) : '';
       },  
       
       //parse separated string
        str2value: function(str) {
           var reg, value = null;
           if(typeof str === 'string' && str.length) {
               reg = new RegExp('\\s*'+$.trim(this.options.separator)+'\\s*');
               value = str.split(reg);
           } else if($.isArray(str)) {
               value = str; 
           } else {
               value = [str];
           }
           return value;
        },       
       
       //set checked on required checkboxes
       value2input: function(value) {
            this.$input.prop('checked', false);
            if($.isArray(value) && value.length) {
               this.$input.each(function(i, el) {
                   var $el = $(el);
                   // cannot use $.inArray as it performs strict comparison
                   $.each(value, function(j, val){
                       /*jslint eqeq: true*/
                       if($el.val() == val) {
                       /*jslint eqeq: false*/                           
                           $el.prop('checked', true);
                       }
                   });
               }); 
            }  
        },  
        
       input2value: function() { 
           var checked = [];
           this.$input.filter(':checked').each(function(i, el) {
               checked.push($(el).val());
           });
           return checked;
       },            
          
       //collect text of checked boxes
        value2htmlFinal: function(value, element) {
           var html = [],
               checked = $.fn.editableutils.itemsByValue(value, this.sourceData),
               escape = this.options.escape;
               
           if(checked.length) {
               $.each(checked, function(i, v) {
                   var text = escape ? $.fn.editableutils.escape(v.text) : v.text; 
                   html.push(text); 
               });
               $(element).html(html.join('<br>'));
           } else {
               $(element).empty(); 
           }
        },
        
       activate: function() {
           this.$input.first().focus();
       },
       
       autosubmit: function() {
           this.$input.on('keydown', function(e){
               if (e.which === 13) {
                   $(this).closest('form').submit();
               }
           });
       }
    });      

    Checklist.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        /**
        @property tpl 
        @default <div></div>
        **/         
        tpl:'<div class="editable-checklist"></div>',
        
        /**
        @property inputclass 
        @type string
        @default null
        **/         
        inputclass: null,        
        
        /**
        Separator of values when reading from `data-value` attribute

        @property separator 
        @type string
        @default ','
        **/         
        separator: ','
    });

    $.fn.editabletypes.checkbox = Checklist;      

}(window.jQuery));


/**
List of radioes. 
Internally value stored as javascript array of values.

@class checklist
@extends list
@final
@example
<a href="#" id="options" data-type="radio" data-pk="1" data-url="/post" data-title="Select options"></a>
<script>
$(function(){
    $('#options').editable({
        value: [2, 3],    
        source: [
              {value: 1, text: 'option1'},
              {value: 2, text: 'option2'},
              {value: 3, text: 'option3'}
           ]
    });
});
</script>
**/
(function ($) {
    "use strict";
    
    var Radiolist = function (options) {
        this.init('radio', options, Radiolist.defaults);
    };

    $.fn.editableutils.inherit(Radiolist, $.fn.editabletypes.list);

    $.extend(Radiolist.prototype, {
        renderList: function() {
            var $label, $div;
            
            this.$tpl.empty();
            
            if(!$.isArray(this.sourceData)) {
                return;
            }

            for(var i=0; i<this.sourceData.length; i++) {
                $label = $('<label>').append($('<input>', {
                                           type: 'radio',
                                           name: 'radiolist',
                                           value: this.sourceData[i].value 
                                     }))
                                     .append($('<span>').text(' '+this.sourceData[i].text));
                
                $('<div>').append($label).appendTo(this.$tpl);
            }
            
            this.$input = this.$tpl.find('input[type="radio"]');
            this.setClass();
        },
               
       //set checked on required checkboxes
       value2input: function(value) {
            this.$input.prop('checked', false);
            if(value) {
               this.$input.each(function(i, el) {
                   var $el = $(el);
                   /*jslint eqeq: true*/
                   if($el.val() == value) {
                   /*jslint eqeq: false*/                           
                       $el.prop('checked', true);
                   }
               }); 
            }  
        },  
        
       input2value: function() { 
           var checked = '';
           this.$input.filter(':checked').each(function(i, el) {
               checked = $(el).val();
           });
           return checked;
       },            
          
       //collect text of checked boxes
        value2htmlFinal: function(value, element) {
           var html = [],
               checked = $.fn.editableutils.itemsByValue(value, this.sourceData),
               escape = this.options.escape;
               
           if(checked.length) {
               $.each(checked, function(i, v) {
                   var text = escape ? $.fn.editableutils.escape(v.text) : v.text; 
                   html.push(text); 
               });
               $(element).html(html.join('<br>'));
           } else {
               $(element).empty(); 
           }
        },
        
       activate: function() {
           this.$input.first().focus();
       },
       
       autosubmit: function() {
           this.$input.on('keydown', function(e){
               if (e.which === 13) {
                   $(this).closest('form').submit();
               }
           });
       }
    });      

    Radiolist.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        /**
        @property tpl 
        @default <div></div>
        **/         
        tpl:'<div class="editable-radio"></div>',
        
        /**
        @property inputclass 
        @type string
        @default null
        **/         
        inputclass: null,        
        
        /**
        Separator of values when reading from `data-value` attribute

        @property separator 
        @type string
        @default ','
        **/         
        separator: ','
    });

    $.fn.editabletypes.radio = Radiolist;      

}(window.jQuery));

/**
Select (dropdown)

@class select
@extends list
@final
@example
<a href="#" id="status" data-type="select" data-pk="1" data-url="/post" data-title="Select status"></a>
<script>
$(function(){
    $('#status').editable({
        value: 2,    
        source: [
              {value: 1, text: 'Active'},
              {value: 2, text: 'Blocked'},
              {value: 3, text: 'Deleted'}
           ]
    });
});
</script>
**/
(function ($) {
    "use strict";
    
    var Select = function (options) {
        this.init('select', options, Select.defaults);
    };

    $.fn.editableutils.inherit(Select, $.fn.editabletypes.list);

    $.extend(Select.prototype, {
        renderList: function() {
            this.$input.empty();

            var fillItems = function($el, data) {
                var attr;
                if($.isArray(data)) {
                    for(var i=0; i<data.length; i++) {
                        attr = {};
                        if(data[i].children) {
                            attr.label = data[i].text;
                            $el.append(fillItems($('<optgroup>', attr), data[i].children)); 
                        } else {
                            attr.value = data[i].value;
                            if(data[i].disabled) {
                                attr.disabled = true;
                            }
                            $el.append($('<option>', attr).text(data[i].text)); 
                        }
                    }
                }
                return $el;
            };        

            fillItems(this.$input, this.sourceData);
            
            this.setClass();
            
            //enter submit
            this.$input.on('keydown.editable', function (e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
            });            
        },
       
        value2htmlFinal: function(value, element) {
            var text = '', 
                items = $.fn.editableutils.itemsByValue(value, this.sourceData);
                
            if(items.length) {
                text = items[0].text;
            }
            
            //$(element).text(text);
            $.fn.editabletypes.abstractinput.prototype.value2html.call(this, text, element);
        },
        
        autosubmit: function() {
            this.$input.off('keydown.editable').on('change.editable', function(){
                $(this).closest('form').submit();
            });
        }
    });      

    Select.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        /**
        @property tpl 
        @default <select></select>
        **/         
        tpl:'<select></select>'
    });

    $.fn.editabletypes.select = Select;      

}(window.jQuery));



/**
Form with single input element, two buttons and two states: normal/loading.
Applied as jQuery method to DIV tag (not to form tag!). This is because form can be in loading state when spinner shown.
Editableform is linked with one of input types, e.g. 'text', 'select' etc.

@class editableform
@uses text
@uses textarea
**/
(function($) {
    "use strict";

    var EditableForm = function(div, options) {
        this.options = $.extend({}, $.fn.editableform.defaults, options);
        this.$div = $(div); //div, containing form. Not form tag. Not editable-element.
        if (!this.options.scope) {
            this.options.scope = this;
        }
        //nothing shown after init
    };

    EditableForm.prototype = {
        constructor: EditableForm,
        initInput: function() { //called once
            //take input from options (as it is created in editable-element)
            this.input = this.options.input;

            //set initial value
            //todo: may be add check: typeof str === 'string' ? 
            this.value = this.input.str2value(this.options.value);

            //prerender: get input.$input
            this.input.prerender();
        },
        initTemplate: function() {
            this.$form = $($.fn.editableform.template);
        },
        initButtons: function() {
            var $btn = this.$form.find('.editable-buttons');
            $btn.append($.fn.editableform.buttons);
            if (this.options.showbuttons === 'bottom') {
                $btn.addClass('editable-buttons-bottom');
            }
        },
        /**
        Renders editableform

        @method render
        **/
        render: function() {
            //init loader
            this.$loading = $($.fn.editableform.loading);
            this.$div.empty().append(this.$loading);

            //init form template and buttons
            this.initTemplate();
            if (this.options.showbuttons) {
                this.initButtons();
            } else {
                this.$form.find('.editable-buttons').remove();
            }

            //show loading state
            this.showLoading();

            //flag showing is form now saving value to server. 
            //It is needed to wait when closing form.
            this.isSaving = false;

            /**        
            Fired when rendering starts
            @event rendering 
            @param {Object} event event object
            **/
            this.$div.triggerHandler('rendering');

            //init input
            this.initInput();

            //append input to form
            this.$form.find('div.editable-input').append(this.input.$tpl);

            //append form to container
            this.$div.append(this.$form);

            //render input
            $.when(this.input.render())
                .then($.proxy(function() {

                    //attach 'cancel' handler
                    this.$form.find('.editable-cancel').click($.proxy(this.cancel, this));

                    if (this.input.error) {
                        this.error(this.input.error);
                        this.$form.find('.editable-submit').attr('disabled', true);
                        this.input.$input.attr('disabled', true);
                        //prevent form from submitting
                        this.$form.submit(function(e) {
                            e.preventDefault();
                        });
                    } else {
                        this.error(false);
                        this.input.$input.removeAttr('disabled');
                        this.$form.find('.editable-submit').removeAttr('disabled');
                        if (typeof this.options.displayVal === 'function') {
                            this.input.value2input(this.options.displayVal.call(this.options.scope));
                        }
                        else {
                            var value = (this.value === null || this.value === undefined || this.value === '') ? this.options.defaultValue : this.value;
                            this.input.value2input(value);
                        }
                        //attach submit handler
                        this.$form.submit($.proxy(this.submit, this));
                    }

                    /**        
                    Fired when form is rendered
                    @event rendered
                    @param {Object} event event object
                    **/
                    this.$div.triggerHandler('rendered');

                    this.showForm();

                    //call postrender method to perform actions required visibility of form
                    if (this.input.postrender) {
                        this.input.postrender();
                    }
                }, this));
        },
        cancel: function() {
            /**        
            Fired when form was cancelled by user
            @event cancel 
            @param {Object} event event object
            **/
            this.$div.triggerHandler('cancel');
        },
        showLoading: function() {
            var w, h;
            if (this.$form) {
                //set loading size equal to form
                w = this.$form.outerWidth();
                h = this.$form.outerHeight();
                if (w) {
                    this.$loading.width(w);
                }
                if (h) {
                    this.$loading.height(h);
                }
                this.$form.hide();
            } else {
                //stretch loading to fill container width
                w = this.$loading.parent().width();
                if (w) {
                    this.$loading.width(w);
                }
            }
            this.$loading.show();
        },

        showForm: function(activate) {
            this.$loading.hide();
            this.$form.show();
            if (activate !== false) {
                this.input.activate();
            }
            /**        
            Fired when form is shown
            @event show 
            @param {Object} event event object
            **/
            this.$div.triggerHandler('show');
        },

        error: function(msg) {
            var $group = this.$form.find('.control-group'),
                $block = this.$form.find('.editable-error-block'),
                lines;

            if (msg === false) {
                // $group.removeClass($.fn.editableform.errorGroupClass);
                $block.removeClass($.fn.editableform.errorBlockClass).empty().hide();
            } else {
                //convert newline to <br> for more pretty error display
                if (msg) {
                    lines = ('' + msg).split('\n');
                    for (var i = 0; i < lines.length; i++) {
                        lines[i] = $('<div>').text(lines[i]).html();
                    }
                    msg = lines.join('<br>');
                }
                // $group.addClass($.fn.editableform.errorGroupClass);
                $block.addClass($.fn.editableform.errorBlockClass).html(msg).show();
            }
        },

        submit: function(e) {
            e.stopPropagation();
            e.preventDefault();

            //get new value from input
            var newValue = this.input.input2value();

            //validation: if validate returns string or truthy value - means error
            //if returns object like {newValue: '...'} => submitted value is reassigned to it
            var error = this.validate(newValue);
            if ($.type(error) === 'object' && error.newValue !== undefined) {
                newValue = error.newValue;
                this.input.value2input(newValue);
                if (typeof error.msg === 'string') {
                    this.error(error.msg);
                    this.showForm();
                    return;
                }
            } else if (error) {
                this.error(error);
                this.showForm();
                return;
            }

            //if value not changed --> trigger 'nochange' event and return
            /*jslint eqeq: true*/
            if (!this.options.savenochange && this.input.value2str(newValue) == this.input.value2str(this.value)) {
                /*jslint eqeq: false*/
                /**        
                Fired when value not changed but form is submitted. Requires savenochange = false.
                @event nochange 
                @param {Object} event event object
                **/
                this.$div.triggerHandler('nochange');
                return;
            }

            //convert value for submitting to server
            var submitValue = this.input.value2submit(newValue);

            this.isSaving = true;

            //sending data to server
            $.when(this.save(submitValue))
                .done($.proxy(function(response) {
                    this.isSaving = false;

                    //run success callback
                    var res = typeof this.options.success === 'function' ? this.options.success.call(this.options.scope, response, newValue) : null;

                    //if success callback returns false --> keep form open and do not activate input
                    if (res === false) {
                        this.error(false);
                        this.showForm(false);
                        return;
                    }

                    //if success callback returns string -->  keep form open, show error and activate input               
                    if (typeof res === 'string') {
                        this.error(res);
                        this.showForm();
                        return;
                    }

                    //if success callback returns object like {newValue: <something>} --> use that value instead of submitted
                    //it is usefull if you want to chnage value in url-function
                    if (res && typeof res === 'object' && res.hasOwnProperty('newValue')) {
                        newValue = res.newValue;
                    }

                    //clear error message
                    this.error(false);
                    this.value = newValue;
                    /**        
                    Fired when form is submitted
                    @event save 
                    @param {Object} event event object
                    @param {Object} params additional params
                    @param {mixed} params.newValue raw new value
                    @param {mixed} params.submitValue submitted value as string
                    @param {Object} params.response ajax response

                    @example
                    $('#form-div').on('save'), function(e, params){
                        if(params.newValue === 'username') {...}
                    });
                    **/
                    this.$div.triggerHandler('save', {
                        newValue: newValue,
                        submitValue: submitValue,
                        response: response
                    });
                }, this))
                .fail($.proxy(function(xhr) {
                    this.isSaving = false;

                    var msg;
                    if (typeof this.options.error === 'function') {
                        msg = this.options.error.call(this.options.scope, xhr, newValue);
                    } else {
                        msg = typeof xhr === 'string' ? xhr : xhr.responseText || xhr.statusText || 'Unknown error!';
                    }

                    this.error(msg);
                    this.showForm();
                }, this));
        },

        save: function(submitValue) {
                /*
                  send on server in following cases:
                  1. url is function
                  2. url is string AND (pk defined OR send option = always) 
                */
              var send = !!(typeof this.options.url === 'function' || (this.options.url && ((this.options.send === 'always') || (this.options.url && this.options.send === 'auto')))),
                params;

            if (send) { //send to server
                this.showLoading();

                //standard params
                params = {
                    field: this.options.name || '',
                    value: submitValue
                };

                //additional params
                if (typeof this.options.params === 'function') {
                    var params2 = this.options.params.call(this.options.scope, params);
                    $.extend(params, params2);

                } else {
                    //try parse json in single quotes (from data-params attribute)
                    this.options.params = $.fn.editableutils.tryParseJson(this.options.params, true);
                    $.extend(params, this.options.params);
                }

                if (typeof this.options.url === 'function') { //user's function
                    return this.options.url.call(this.options.scope, params);
                } else {
                    //send ajax to server and return deferred object
                    return $.ajax($.extend({
                        url: this.options.url,
                        data: params,
                        type: 'POST'
                    }, this.options.ajaxOptions));
                }
            }
        },

        validate: function(value) {
            if (value === undefined) {
                value = this.value;
            }
            if (typeof this.options.validate === 'function') {
                return this.options.validate.call(this.options.scope, value);
            }
        },

        option: function(key, value) {
            if (key in this.options) {
                this.options[key] = value;
            }

            if (key === 'value') {
                this.setValue(value);
            }

            //do not pass option to input as it is passed in editable-element
        },

        setValue: function(value, convertStr) {
            if (convertStr) {
                this.value = this.input.str2value(value);
            } else {
                this.value = value;
            }

            //if form is visible, update input
            if (this.$form && this.$form.is(':visible')) {
                this.input.value2input(this.value);
            }
        }
    };

    /*
    Initialize editableform. Applied to jQuery object.

    @method $().editableform(options)
    @params {Object} options
    @example
    var $form = $('&lt;div&gt;').editableform({
        type: 'text',
        name: 'username',
        url: '/post',
        value: 'vitaliy'
    });

    //to display form you should call 'render' method
    $form.editableform('render');     
    */
    $.fn.editableform = function(option) {
        var args = arguments;
        return this.each(function() {
            var $this = $(this),
                data = $this.data('editableform'),
                options = typeof option === 'object' && option;
            if (!data) {
                $this.data('editableform', (data = new EditableForm(this, options)));
            }

            if (typeof option === 'string') { //call method 
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            }
        });
    };

    //keep link to constructor to allow inheritance
    $.fn.editableform.Constructor = EditableForm;

    //defaults
    $.fn.editableform.defaults = {
        /* see also defaults for input */

        /**
        Type of input. Can be <code>text|textarea|select|date|checklist</code>

        @property type 
        @type string
        @default 'text'
        **/
        type: 'text',
        /**
        Url for submit, e.g. <code>'/post'</code>  
        If function - it will be called instead of ajax. Function should return deferred object to run fail/done callbacks.

        @property url 
        @type string|function
        @default null
        @example
        url: function(params) {
            var d = new $.Deferred;
            if(params.value === 'abc') {
                return d.reject('error message'); //returning error via deferred object
            } else {
                //async saving data in js model
                someModel.asyncSaveMethod({
                   ..., 
                   success: function(){
                      d.resolve();
                   }
                }); 
                return d.promise();
            }
        } 
        **/
        url: null,
        /**
        Additional params for submit. If defined as <code>object</code> - it is **appended** to original ajax data (pk, name and value).  
        If defined as <code>function</code> - returned object **overwrites** original ajax data.
        @example
        params: function(params) {
            //originally params contain pk, name and value
            params.a = 1;
            return params;
        }

        @property params 
        @type object|function
        @default null
        **/
        params: null,
        /**
        Name of field. Will be submitted on server. Can be taken from <code>id</code> attribute

        @property name 
        @type string
        @default null
        **/
        name: null,
        /**
        Initial value. If not defined - will be taken from element's content.
        For __select__ type should be defined (as it is ID of shown text).

        @property value 
        @type string|object
        @default null
        **/
        value: null,
        /**
        Value that will be displayed in input if original field value is empty (`null|undefined|''`).

        @property defaultValue 
        @type string|object
        @default null
        @since 1.4.6
        **/
        defaultValue: null,
        /**
        Strategy for sending data on server. Can be `auto|always|never`.
        When 'auto' data will be sent on server **only if pk and url defined**, otherwise new value will be stored locally.

        @property send 
        @type string
        @default 'auto'
        **/
        send: 'auto',
        /**
        Function for client-side validation. If returns string - means validation not passed and string showed as error.
        Since 1.5.1 you can modify submitted value by returning object from `validate`: 
        `{newValue: '...'}` or `{newValue: '...', msg: '...'}`

        @property validate 
        @type function
        @default null
        @example
        validate: function(value) {
            if($.trim(value) == '') {
                return 'This field is required';
            }
        }
        **/
        validate: null,
        /**
        Success callback. Called when value successfully sent on server and **response status = 200**.  
        Usefull to work with json response. For example, if your backend response can be <code>{success: true}</code>
        or <code>{success: false, msg: "server error"}</code> you can check it inside this callback.  
        If it returns **string** - means error occured and string is shown as error message.  
        If it returns **object like** <code>{newValue: &lt;something&gt;}</code> - it overwrites value, submitted by user.  
        Otherwise newValue simply rendered into element.
        
        @property success 
        @type function
        @default null
        @example
        success: function(response, newValue) {
            if(!response.success) return response.msg;
        }
        **/
        success: null,
        /**
        Error callback. Called when request failed (response status != 200).  
        Usefull when you want to parse error response and display a custom message.
        Must return **string** - the message to be displayed in the error block.
                
        @property error 
        @type function
        @default null
        @since 1.4.4
        @example
        error: function(response, newValue) {
            if(response.status === 500) {
                return 'Service unavailable. Please try later.';
            } else {
                return response.responseText;
            }
        }
        **/
        error: null,
        /**
        Additional options for submit ajax request.
        List of values: http://api.jquery.com/jQuery.ajax
        
        @property ajaxOptions 
        @type object
        @default null
        @since 1.1.1        
        @example 
        ajaxOptions: {
            type: 'put',
            dataType: 'json'
        }        
        **/
        ajaxOptions: null,
        /**
        Where to show buttons: left(true)|bottom|false  
        Form without buttons is auto-submitted.

        @property showbuttons 
        @type boolean|string
        @default true
        @since 1.1.1
        **/
        showbuttons: true,
        /**
        Scope for callback methods (success, validate).  
        If <code>null</code> means editableform instance itself. 

        @property scope 
        @type DOMElement|object
        @default null
        @since 1.2.0
        @private
        **/
        scope: null,
        /**
        Whether to save or cancel value when it was not changed but form was submitted

        @property savenochange 
        @type boolean
        @default false
        @since 1.2.0
        **/
        savenochange: false
    };

    /*
    Note: following params could redefined in engine: bootstrap or jqueryui:
    Classes 'control-group' and 'editable-error-block' must always present!
    */
    $.fn.editableform.template = 
        '<form class="form-inline editableform">' +
            '<div class="control-group">' +
                '<div><div class="editable-input"></div><div class="editable-error-block error-msg"></div><div class="editable-buttons"></div></div>' +
            '</div>' +
        '</form>';

    //loading div
    $.fn.editableform.loading = '<div class="editableform-loading"><i class="fa fa-spinner fa-spin"></i></div>';

    //buttons
    $.fn.editableform.buttons = '<button type="submit" class="editable-submit">ok</button>' +
        '<button type="button" class="editable-cancel">cancel</button>';

    //error class attached to control-group
    $.fn.editableform.errorGroupClass = null;

    //error class attached to editable-error-block
    $.fn.editableform.errorBlockClass = 'editable-error';

    //engine
    $.fn.editableform.engine = 'jquery';
}(window.jQuery));

/*
    @class editableContainer 编辑容器
    uses editableform
*/
(function($) {
    'use strict';

    var Popup = function(element, options) {
        this.init(element, options);
    };

    Popup.prototype = {
        containerName: null, // 通过容器名称调用元素
        containerDataName: null, // 用于元素获取element.data()
        innerCss: null, // 子元素样式
        containerClass: 'editable-container editable-popup', // 用于容器元素的样式
        defaults: {},
        init: function(element, options) { // 初始化弹出框容器
            this.$element = $(element);
            this.options = $.extend({}, $.fn.editableContainer.defaults, options);
            this.splitOptions();

            this.formOptions.scope = this.$element[0]; //设置回调元素的范围

            this.initContainer(); // 初始化容器

            // 标识
            this.delayedHide = false;

            // 当元素移除dom时，销毁当前容器
            this.$element.on('destroyed', $.proxy(function() {
                this.destroy();
            }, this));

            // 添加click /escape事件，关闭容器
            if (!$(document).data('editable-handlers-attached')) {
                // 执行escape关闭容器
                $(document).on('keyup.editable', function(e) {
                    if (e.which === 27) {
                        $('.editable-open').editableContainer('hide');
                    }
                });

                // 当点击容器外部时关闭容器
                $(document).on('click.editable', function(e) {
                    var $target = $(e.target),
                        i,
                        exclude_classes = ['.editable-container']; // 以下样式除外

                     //check if element is detached. It occurs when clicking in bootstrap datepicker
                    if (!$.contains(document.documentElement, e.target)) {
                      return;
                    }

                    //for some reason FF 20 generates extra event (click) in select2 widget with e.target = document
                    //Possibly related to http://stackoverflow.com/questions/10119793/why-does-firefox-react-differently-from-webkit-and-ie-to-click-event-on-selec
                    if ($target.is(document)) {
                        return;
                    }

                    //当点击事件是在以下对象下，不做任何处理
                    for (i = 0; i < exclude_classes.length; i++) {
                        if ($target.is(exclude_classes[i]) || $target.parents(exclude_classes[i]).length) {
                            return;
                        }
                    }

                    Popup.prototype.closeOthers(e.target);
                });
                $(document).data('editable-handlers-attached', true);
            }
        },
        splitOptions: function() { // 分隔容器和表单
            this.containerOptions = {};
            this.formOptions = {};

            if (!$.fn[this.containerName]) {
                throw new Error(this.containerName + ' not found. Have you included corresponding js file?');
            }

            //keys defined in container defaults go to container, others go to form
            for (var k in this.options) {
                if (k in this.defaults) {
                    this.containerOptions[k] = this.options[k];
                } else {
                    this.formOptions[k] = this.options[k];
                }
            }
        },
        tip: function() {
            return this.container() ? this.container().$tip : null;
        },
        /* returns container object */
        container: function() {
            var container;
            // 1、通过containerDataName获取容器
            if (this.containerDataName) {
                if (container = this.$element.data(this.containerDataName)) {
                    return container;
                }
            }
            //2、通过containerName获取容器
            container = this.$element.data(this.containerName);
            return container;
        },
        call: function() {
            this.$element[this.containerName].apply(this.$element, arguments);
        },
        initContainer: function() {
            this.call(this.containerOptions);
        },
        renderForm: function() {
            this.$form
                .editableform(this.formOptions)
                .on({
                    save: $.proxy(this.save, this), //click on submit button (value changed)
                    nochange: $.proxy(function() {
                        this.hide('nochange');
                    }, this), //click on submit button (value NOT changed)                
                    cancel: $.proxy(function() {
                        this.hide('cancel');
                    }, this), //click on calcel button
                    show: $.proxy(function() {
                        if (this.delayedHide) {
                            this.hide(this.delayedHide.reason);
                            this.delayedHide = false;
                        } else {
                            this.setPosition();
                        }
                    }, this), //re-position container every time form is shown (occurs each time after loading state)
                    rendering: $.proxy(this.setPosition, this), //this allows to place container correctly when loading shown
                    resize: $.proxy(this.setPosition, this), //this allows to re-position container when form size is changed 
                    rendered: $.proxy(function() {
                        /**        
                        Fired when container is shown and form is rendered (for select will wait for loading dropdown options).  
                        **/
                        /*
                         TODO: added second param mainly to distinguish from bootstrap's shown event. It's a hotfix that will be solved in future versions via namespaced events.  
                        */
                        this.$element.triggerHandler('shown', $(this.options.scope).data('editable'));
                    }, this)
                })
                .editableform('render');
        },
        show: function(closeAll) {
            this.$element.addClass('editable-open');
            if (closeAll !== false) {
                //关闭其它容器
                this.closeOthers(this.$element[0]);
            }

            //展示容器
            this.innerShow();
            this.tip().addClass(this.containerClass);

            /*
            Currently, form is re-rendered on every show. 
            The main reason is that we dont know, what will container do with content when closed:
            remove(), detach() or just hide() - it depends on container.
            
            Detaching form itself before hide and re-insert before show is good solution, 
            but visually it looks ugly --> container changes size before hide.  
            */

            //if form already exist - delete previous data 
            if (this.$form) {
                //todo: destroy prev data!
                //this.$form.destroy();
            }

            this.$form = $('<div>');

            //insert form into container body
            if (this.tip().is(this.innerCss)) {
                //for inline container
                this.tip().append(this.$form);
            } else {
                this.tip().find(this.innerCss).append(this.$form);
            }

            //render form
            this.renderForm();

        },

        /**
        Hides container with form
        @method hide()
        @param {string} reason Reason caused hiding. Can be <code>save|cancel|onblur|nochange|undefined (=manual)</code>
        **/
        hide: function(reason) {
            if (!this.tip() || !this.tip().is(':visible') || !this.$element.hasClass('editable-open')) {
                return;
            }

            //if form is saving value, schedule hide
            if (this.$form.data('editableform').isSaving) {
                this.delayedHide = {
                    reason: reason
                };
                return;
            } else {
                this.delayedHide = false;
            }

            this.$element.removeClass('editable-open');
            this.innerHide();

            /**
            Fired when container was hidden. It occurs on both save or cancel.  
            @event hidden 
            @param {object} event event object
            @param {string} reason Reason caused hiding. Can be <code>save|cancel|onblur|nochange|manual</code>
            @example
            $('#username').on('hidden', function(e, reason) {
                if(reason === 'save' || reason === 'cancel') {
                    //auto-open next editable
                    $(this).closest('tr').next().find('.editable').editable('show');
                } 
            });
            **/
            this.$element.triggerHandler('hidden', reason || 'manual');
        },

        /* internal show method. To be overwritten in child classes */
        innerShow: function() {

        },

        /* internal hide method. To be overwritten in child classes */
        innerHide: function() {

        },

        /**
        Toggles container visibility (show / hide)
        @method toggle()
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/
        toggle: function(closeAll) {
            if (this.container() && this.tip() && this.tip().is(':visible')) {
                this.hide();
            } else {
                this.show(closeAll);
            }
        },

        /*
        Updates the position of container when content changed.
        @method setPosition()
        */
        setPosition: function() {
            //tbd in child class
        },
        save: function(e, params) {
            /**        
            Fired when new value was submitted. You can use <code>$(this).data('editableContainer')</code> inside handler to access to editableContainer instance
            
            @event save 
            @param {Object} event event object
            @param {Object} params additional params
            @param {mixed} params.newValue submitted value
            @param {Object} params.response ajax response
            @example
            $('#username').on('save', function(e, params) {
                //assuming server response: '{success: true}'
                var pk = $(this).data('editableContainer').options.pk;
                if(params.response && params.response.success) {
                    alert('value: ' + params.newValue + ' with pk: ' + pk + ' saved!');
                } else {
                    alert('error!'); 
                } 
            });
            **/
            this.$element.triggerHandler('save', params);

            //hide must be after trigger, as saving value may require methods of plugin, applied to input
            this.hide('save');
        },
        /**
        Sets new option
        
        @method option(key, value)
        @param {string} key 
        @param {mixed} value 
        **/
        option: function(key, value) {
            this.options[key] = value;
            if (key in this.containerOptions) {
                this.containerOptions[key] = value;
                this.setContainerOption(key, value);
            } else {
                this.formOptions[key] = value;
                if (this.$form) {
                    this.$form.editableform('option', key, value);
                }
            }
        },

        setContainerOption: function(key, value) {
            this.call('option', key, value);
        },

        /**
        Destroys the container instance
        @method destroy()
        **/
        destroy: function() {
            this.hide();
            this.innerDestroy();
            this.$element.off('destroyed');
            this.$element.removeData('editableContainer');
        },

        /* to be overwritten in child classes */
        innerDestroy: function() {

        },

        /*
        Closes other containers except one related to passed element. 
        Other containers can be cancelled or submitted (depends on onblur option)
        */
        closeOthers: function(element) {
            $('.editable-open').each(function(i, el) {
                //do nothing with passed element and it's children
                if (el === element || $(el).find(element).length) {
                    return;
                }

                //otherwise cancel or submit all open containers 
                var $el = $(el),
                    ec = $el.data('editableContainer');

                if (!ec) {
                    return;
                }

                if (ec.options.onblur === 'cancel') {
                    $el.data('editableContainer').hide('onblur');
                } else if (ec.options.onblur === 'submit') {
                    $el.data('editableContainer').tip().find('form').submit();
                }
            });

        },

        /**
        Activates input of visible container (e.g. set focus)
        @method activate()
        **/
        activate: function() {
            if (this.tip && this.tip().is(':visible') && this.$form) {
                this.$form.data('editableform').input.activate();
            }
        }
    };


    $.fn.editableContainer = function(option) {
        this.args = arguments;
        return this.each(function() {
            var $this = $(this),
                datakey = 'editableContainer',
                data = $this.data(datakey),
                options = typeof option === 'object' && option,
                Constructor = Popup;

            if (!data) {
                $this.data(datakey, (data = new Constructor(this, options)));
            }

            if (typeof option === 'string') {
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            }
        });
    };


    // store constructor
    $.fn.editableContainer.Popup = Popup;

    $.fn.editableContainer.defaults = {
        value: null, // 初始化表单数据的值
        placement: 'top', // 容器相对元素的位置
        autohide: true, // 容器自动隐藏
        onblur: 'cancel', // 当用户点击容器以外的位置时，容器自动销毁
        mode: 'popup' // 编辑框的展示形式
    };

    /* 
     * workaround to have 'destroyed' event to destroy popover when element is destroyed
     * see http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-element-is-removed-from-the-dom
     */
    jQuery.event.special.destroyed = {
        remove: function(o) {
            if (o.handle) {
                o.handle();
            }
        }
    };
}(window.jQuery));

/*
Editableform based on Twitter Bootstrap 3
*/
(function($) {
    "use strict";

    //store parent methods
    var pInitInput = $.fn.editableform.Constructor.prototype.initInput;

    $.extend($.fn.editableform.Constructor.prototype, {
        initTemplate: function() {
            this.$form = $($.fn.editableform.template);
            this.$form.find('.control-group').addClass('form-group');
            this.$form.find('.editable-error-block').addClass('help-block');
        },
        initInput: function() {
            pInitInput.apply(this);

            //for bs3 set default class `input-sm` to standard inputs
            var emptyInputClass = this.input.options.inputclass === null || this.input.options.inputclass === false;
            var defaultClass = 'input-sm';

            //bs3 add `form-control` class to standard inputs
            var stdtypes = 'text,select,textarea,password,email,url,tel,number,range,time'.split(',');
            if (~$.inArray(this.input.type, stdtypes)) {
                this.input.$input.addClass('form-control');
                if (emptyInputClass) {
                    this.input.options.inputclass = defaultClass;
                    this.input.$input.addClass(defaultClass);
                }
            }

            //apply bs3 size class also to buttons (to fit size of control)
            var $btn = this.$form.find('.editable-buttons');
            var classes = emptyInputClass ? [defaultClass] : this.input.options.inputclass.split(' ');
            for (var i = 0; i < classes.length; i++) {
                // `btn-sm` is default now

                if (classes[i].toLowerCase() === 'input-lg') {
                    $btn.find('button').removeClass('btn-sm').addClass('btn-lg');
                }
            }
        }
    });

    //buttons
    $.fn.editableform.buttons =
        '<button type="submit" class="btn btn-primary editable-submit"><i class="fa fa-check"></i></button>' +
        '<button type="button" class="btn editable-cancel"><i class="fa fa-times"></i></button>';

    //error classes
    $.fn.editableform.errorGroupClass = 'has-error';
    $.fn.editableform.errorBlockClass = null;
    //engine
    $.fn.editableform.engine = 'bs3';
}(window.jQuery));

(function($) {
    "use strict";

    //extend methods
    $.extend($.fn.editableContainer.Popup.prototype, {
        containerName: 'popover',
        containerDataName: 'bs.popover',
        innerCss: '.popover-content',
        defaults: $.fn.popover.Constructor.DEFAULTS,

        initContainer: function() {
            $.extend(this.containerOptions, {
                trigger: 'manual',
                selector: false,
                content: ' ',
                template: this.defaults.template
            });

            //as template property is used in inputs, hide it from popover
            var t;
            if (this.$element.data('template')) {
                t = this.$element.data('template');
                this.$element.removeData('template');
            }

            this.call(this.containerOptions);

            if (t) {
                //restore data('template')
                this.$element.data('template', t);
            }
        },

        /* show */
        innerShow: function() {
            this.call('show');
        },

        /* hide */
        innerHide: function() {
            this.call('hide');
        },

        /* destroy */
        innerDestroy: function() {
            this.call('destroy');
        },

        setContainerOption: function(key, value) {
            this.container().options[key] = value;
        },

        /**
         * move popover to new position. This function mainly copied from bootstrap-popover.
         */
        /*jshint laxcomma: true, eqeqeq: false*/
        setPosition: function() {

            (function() {

                var $tip = this.tip();

                var placement = typeof this.options.placement == 'function' ?
                    this.options.placement.call(this, $tip[0], this.$element[0]) :
                    this.options.placement;

                var autoToken = /\s?auto?\s?/i;
                var autoPlace = autoToken.test(placement);
                if (autoPlace) {
                    placement = placement.replace(autoToken, '') || 'top';
                }


                var pos = this.getPosition();
                var actualWidth = $tip[0].offsetWidth;
                var actualHeight = $tip[0].offsetHeight;

                if (autoPlace) {
                    var $parent = this.$element.parent();

                    var orgPlacement = placement;
                    var docScroll = document.documentElement.scrollTop || document.body.scrollTop;
                    var parentWidth = this.options.container == 'body' ? window.innerWidth : $parent.outerWidth();
                    var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight();
                    var parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;

                    placement = placement == 'bottom' && pos.top + pos.height + actualHeight - docScroll > parentHeight ? 'top' :
                        placement == 'top' && pos.top - docScroll - actualHeight < 0 ? 'bottom' :
                        placement == 'right' && pos.right + actualWidth > parentWidth ? 'left' :
                        placement == 'left' && pos.left - actualWidth < parentLeft ? 'right' :
                        placement;

                    $tip
                        .removeClass(orgPlacement)
                        .addClass(placement);
                }


                var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

                this.applyPlacement(calculatedOffset, placement);


            }).call(this.container());
            /*jshint laxcomma: false, eqeqeq: true*/
        }
    });

}(window.jQuery));



/**
@extends text
add the percent symbol
**/
(function($) {
    "use strict";
    var Percent = function(options) {
        this.init('percent', options, Percent.defaults);
    };
    $.fn.editableutils.inherit(Percent, $.fn.editabletypes.text);
    $.extend(Percent.prototype, {
        render: function() {
            this.$input.parent('.editable-input').addClass('editable-percent');
            this.renderClear();
            this.setClass();
        }
    });
    Percent.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="text" class="form-control editable-percent-input"/>',
        clear: true
    });
    $.fn.editabletypes.percent = Percent;
}(window.jQuery));

/**
@extends list
add the category select
**/

(function ($) {
    'use strict';
    var CategorySelect = function (options) {
        this.init('category', options, CategorySelect.defaults);
    };
    $.fn.editableutils.inherit(CategorySelect, $.fn.editabletypes.list);
    $.extend(CategorySelect.prototype, {
        /*
            加载模版表单对象
        */
        renderList: function () {
            if (this.sourceData) {
                this.$tpl.categoryList(this.sourceData);
            }
        },
        value2input: function (value) {
            if (value) {
                this.$tpl.categoryList('select', value);
            }
        },
        input2value: function () {
            return this.$tpl.data('value');
        },
        onSourceReady: function (success, error) {
            var source;
            if ($.isFunction(this.options.source)) {
                source = this.options.source.call(this.options.scope);
                this.sourceData = null;
            }
            else {
                source = this.options.source;
            }
            if (this.options.sourceCache && $.isArray(this.sourceData)) {
                success.call(this);
                return;
            }
            try {
                source = $.fn.editableutils.tryParseJson(source, false);
            }
            catch (e) {
                error.call(this);
                return;
            }
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
    CategorySelect.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        tpl: '<div class="category-list"></div>'
    });
    $.fn.editabletypes.category = CategorySelect;
}(window.jQuery));




/**
Textarea input
@class textarea
@extends abstractinput
**/
(function ($) {
    "use strict";
    var Textarea = function (options) {
        this.init('textarea', options, Textarea.defaults);
    };
    $.fn.editableutils.inherit(Textarea, $.fn.editabletypes.abstractinput);
    $.extend(Textarea.prototype, {
        render: function () {
            this.setClass();
            this.setAttr('placeholder');
            this.setAttr('rows');                        
            this.$input.keydown(function (e) {
                if (e.ctrlKey && e.which === 13) {
                    $(this).closest('form').submit();
                }
            });
        },
        activate: function() {
            $.fn.editabletypes.text.prototype.activate.call(this);
        }
    });
    Textarea.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl:'<textarea></textarea>',
        inputclass: 'input-large',
        placeholder: null,     
        rows: 7        
    });

    $.fn.editabletypes.textarea = Textarea;
}(window.jQuery));