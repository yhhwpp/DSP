/**
 * @file modal.js
 * @description 模态窗口
 * @author xiaokl
 */
(function ($) {
    'use strict';

    $.fn.modalabletypes = {};

    var Modalform = function () {};

    Modalform.prototype = {
        init: function (type, options, defaults) {
            this.type = type;
            this.options = $.extend({}, defaults, options);
            this.render();
        },
        render: function () {
            // 初始化模版
            this.initTemplate();
            // 初始化模版内容
            this.initModal();
        },
        initTemplate: function () {
            this.$form = $(Modalform.template);
            if (this.options.modalclass) {
                this.$form.addClass(this.options.modalclass);
            }
        },
        initModal: function () {
            this.$form.find('.modal-title').html(this.options.title);
            if (this.options.showBody) {
                this.$form.find('.modal-body').html(this.options.body);
            }
            else {
                this.$form.find('.modal-body').remove();
            }
            if (this.options.cancelButton && this.options.cancelButton.length > 0) {
                this.$form.find('.js-cancel').text(this.options.cancelButton);
            }

            if (this.options.submitButton && this.options.submitButton.length > 0) {
                this.$form.find('.js-submit').text(this.options.submitButton);
            }

        },
        show: function () {
            $('#allModal').modal('show');
        },
        bindHandle: function () {
            if (typeof this.options.btnHandle === 'function') {
                this.options.btnHandle.apply(this.options.scope, this.options.btnHandle);
            }

        }
    };

    Modalform.defaults = {
        title: '', // 窗口标题
        body: '', // 窗口内容
        btnHandle: null, // 一系列绑定操作
        autoshow: true, // 自动显示模态框
        showBody: true,
        cancelButton: '',
        submitButton: '',
        modalclass: ''
    };

    Modalform.template = '<div class="modal fade" id="allModal">' + '<div class="modal-dialog"><form class="form-horizontal">' + '<div class="modal-content">' + '<div class="modal-header">' + '<button type="button" class="close btn-cancel" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + '<h4 class="modal-title">Modal title</h4>' + '</div>' + '<div class="modal-body">' + '</div>' + '<div class="modal-footer">' + '<button type="button" class="btn btn-default btn-cancel js-cancel" data-dismiss="modal">取消</button>' + '<button type="submit" class="btn btn-primary js-submit">确定</button>' + '</div>' + '</div></form>' + '</div>' + '</div>';

    $.extend($.fn.modalabletypes, {
        modalform: Modalform
    });

}(window.jQuery));


/*
	工具类
*/
(function ($) {
    'use strict';

    $.fn.modalableutils = {

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

/*
	Form表单模态窗口
*/
(function ($) {
    'use strict';

    var Form = function (element, options) {
        this.$element = $(element);
        this.options = options;
        this.init('form', options, Form.defaults);
    };

    $.fn.modalableutils.inherit(Form, $.fn.modalabletypes.modalform);

    $.extend(Form.prototype, {
        render: function () {
            Form.superclass.render.call(this);

            this.$element.on('click', $.proxy(function (e) {
                // 添加模版
                $(document.body).append(this.$form);

                this.bindHandle();

                if (this.options.autovalid) {
                    // 初始化验证
                    this.$form.validation(this.options.validOptions);
                }

                if (this.options.autosubmit) {
                    this.$form.submit($.proxy(this.submit, this));
                }

                this.options.formid && this.options.formid.length > 0 && this.$form.find('form').attr('id', this.options.formid);

                // 显示模态框
                this.show();

                $('#allModal').on('hidden.bs.modal', function (e) {
                    $('#allModal .error-msg').remove();
                    $('#allModal').remove();
                });
            }, this));
        },
        submit: function (e) {
            e.stopPropagation();
            e.preventDefault();

            // 提交数据到服务器
            $.when(this.save()).done($.proxy(function (response) {
                Helper.close_ajax();
                // 保持窗口打开
                if (!(response && response.res === 0)) {
                    response.msg && Helper.fnPrompt(response.msg);
                    return;
                }

                $('#allModal').modal('hide');
                /* eslint no-unused-vars: 0 */
                var res = typeof this.options.success === 'function' ? this.options.success.call(this.options.scope, response) : null;

            }, this)).fail($.proxy(function (xhr) {
                Helper.close_ajax();
                // 网络连接错误
                var res = typeof this.options.fail === 'function' ? this.options.fail.call(this.options.scope, xhr) : null;
            }, this));

        },
        save: function () {
            if (this.options.autovalid) {
                if (!(this.$form.valid())) {
                    return false;
                }
            }

            var send = !!((this.options.url));

            if (send) {
                // 显示加载 showloading
                Helper.load_ajax();

                var params;

                if (typeof this.options.params === 'function') {
                    params = this.options.params.call(this.options.scope, this.options.params);
                }
                else {
                    params = this.options.params;
                }

                if (typeof this.options.url === 'function') {
                    return this.options.url.call(this.options.scope, params);
                }

                return $.ajax($.extend({
                    url: this.options.url,
                    data: params,
                    type: 'POST'
                }, this.options.ajaxOptions));
            }

        },
        show: function () {
            Form.superclass.show.call(this);
            this.$form.find('form')[0].reset();
        }
    });

    Form.defaults = $.extend({}, $.fn.modalabletypes.modalform.defaults, {
        url: null, // Form提交的url
        params: null, // 表单参数 @example function(){return {affname : $('#app_name2').val()}}
        ajaxOptions: null, // ajax请求的参数{type:'GET'}
        success: null,
        fail: null,
        autovalid: true,
        autosubmit: true,
        formid: null, // 表单id
        validOptions: {
            blur: true
        }
    });

    $.fn.modalabletypes.form = Form;

}(window.jQuery));

/*
	其它模态窗口
*/
(function ($) {
    'use strict';

    var Others = function (element, options) {
        this.$element = $(element);
        this.options = options;
        this.init('others', options, Others.defaults);
    };

    $.fn.modalableutils.inherit(Others, $.fn.modalabletypes.modalform);

    $.extend(Others.prototype, {
        render: function () {
            Others.superclass.render.call(this);

            this.$element.on('click', $.proxy(function (e) {
                // 添加模版
                $(document.body).append(this.$form);

                this.bindHandle();

                if (this.options.autoshow) {
                    // 显示模态框
                    this.show();
                }

                $('#allModal').on('hidden.bs.modal', function (e) {
                    $('#allModal').remove();
                });

                this.$form.submit($.proxy(this.submit, this));
            }, this));
        },
        submit: function (e) {
            e.stopPropagation();
            e.preventDefault();

            if (this.options.submitUrl && typeof this.options.submitUrl === 'string') {
                location.href = this.options.submitUrl;
            }

        }
    });

    Others.defaults = $.extend({}, $.fn.modalabletypes.modalform.defaults, {
        submitUrl: null // 提交操作
    });

    $.fn.modalabletypes.others = Others;
}(window.jQuery));


/*
	模态窗口初始化
*/
(function ($) {
    'use strict';

    $.fn.modalable = function (option) {
        var datakey = 'modalable';
        return this.each(function () {
            var $this = $(this);
            var data = $this.data(datakey);
            var options = $.extend({}, $.fn.modalable.defaults, option);
            var TypeConstructor;

            if (!data) {
                if (typeof $.fn.modalabletypes[options.type] === 'function') {
                    TypeConstructor = $.fn.modalabletypes[options.type];
                    data = $this.data(datakey, (data = new TypeConstructor(this, options)));
                }
            }

        });
    };

    $.fn.modalable.show = function () {
        $('#allModal').modal('show');
    };

    $.fn.modalable.defaults = {
        type: 'form'
    };

}(window.jQuery));
