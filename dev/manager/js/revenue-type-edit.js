/**
 * @file revenue-type-edit.js
 * @author hehe
 * 自定义revenue-type修改value2input函数
 */
(function ($) {
    'use strict';
    var RevenueType = function (options) {
        this.init('revenuetype', options, RevenueType.defaults);
    };
    $.fn.editableutils.inherit(RevenueType, $.fn.editabletypes.checkbox);
    $.extend(RevenueType.prototype, {
        value2input: function (value) {
            this.$input.prop('checked', false);
            if ($.isArray(value) && value.length) {
                this.$input.each(function (i, el) {
                    var $el = $(el);
                    $.each(value, function (j, val) {
                        if (+$el.val() <= 2) {
                            $el.prop('disabled', true);
                        }
                        if ($el.val() === val) {
                            $el.prop('checked', true);
                        }
                    });
                });
            }
        }
    });
    RevenueType.defaults = $.extend({}, $.fn.editabletypes.checkbox.defaults);
    $.fn.editabletypes.revenuetype = RevenueType;
})(window.jQuery);
(function ($) {
    'use strict';
    $.fn.advutils = {
        fnQiniuUpload: function (options) {
            var settings = {
                runtimes: 'html5,flash,html4', // 上传模式,依次退化
                browse_button: '', // 上传选择的点选按钮，**必需**
                uptoken_url: API_URL.qiniu_uptoken_url, // Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
                domain: API_URL.qiniu_domain, // bucket 域名，下载资源时用到，**必需**
                max_file_size: '2mb', // 最大文件体积限制
                max_retries: 3, // 上传失败最大重试次数
                dragdrop: true, // 开启可拖曳上传
                chunk_size: '4mb', // 分块上传时，每片的体积
                auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
                multi_selection: false,
                init: {
                    BeforeUpload: function (up, file) {
                        var type = file.type;
                        if (type.indexOf('image') !== -1) {
                            var imgType = type.slice(6);
                            if (imgType !== 'png' && imgType !== 'jpg' && imgType !== 'jpeg') {
                                Helper.fnPrompt(MSG.upload_not_in_conformity);
                                up.removeFile(file);
                            }
                        }
                        else {
                            Helper.fnPrompt(MSG.upload_not_in_conformity);
                            up.removeFile(file);
                        }
                    },
                    UploadProgress: function (up, file) {
                        $('#' + options.browse_button).prop('disabled', true).html(MSG.uploading);
                        if ($('.datagrid-mask-msg').length <= 1) {
                            Helper.load_ajax();
                        }
                    },
                    Error: function (up, err, errTip) {
                        $('#' + options.browse_button).prop('disabled', false).html(MSG.upload);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);
                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    },
                    Key: function (up, file) {
                        var key = '';
                        key = file.id + Helper.fnGetCookie('user_id') + '.jpg';
                        return key;
                    }
                }
            };
            return Qiniu.uploader($.extend({}, settings, options, {
                init: $.extend({}, settings.init, options.init ? options.init : {})
            }));
        },
        fnUploadLicense: function (idTxt) {
            var _btn = $('#' + idTxt);
            this.fnQiniuUpload({
                browse_button: idTxt,
                init: {
                    FileUploaded: function (up, file, info) {
                        Helper.close_ajax();
                        _btn.prop('disabled', false).html(MSG.upload);
                        var res = JSON.parse(info);
                        var imgURL = API_URL.qiniu_domain + '/' + res.key;
                        $.get(imgURL + '?imageInfo', function (ret) {
                            // 素材上传尺寸限定
                            _btn.next('.js-show-license').html('<a href="' + imgURL + '" class="fancybox"><img src="' + imgURL + '" width="40" height="auto"></a><i class="fa fa-times-circle" style="font-size: 20px;"></i>');
                            _btn.text(MSG.modify_img);
                        }, 'json');
                    }
                }
            });
        },
        fnRemoveImg: function (_elem) {
            _elem.delegate('.js-show-license i', 'click', function () {
                var _licenseParent = $(this).parent('.js-show-license');
                _licenseParent.empty();
                _licenseParent.prev('button').text('上传');
            });
        }
    };
})(window.jQuery);
(function ($) {
    'use strict';
    var LicenseEdit = function (options) {
        this.init('licenseedit', options, LicenseEdit.defaults);
    };

     // inherit from Abstract input
    $.fn.editableutils.inherit(LicenseEdit, $.fn.editabletypes.abstractinput);

    $.extend(LicenseEdit.prototype, {
        /*
            加载模版表单对象
        */
        render: function () {
            // 上传图片
            $.fn.advutils.fnUploadLicense('js-license');
            $.fn.advutils.fnRemoveImg(this.$input);
        },
        value2input: function (value) {
            this.$input.attr('data-original', value);
            var valJson = value ? JSON.parse(value) : {};
            var _fieldVal = valJson[this.options.field];
            if (_fieldVal && _fieldVal.image) {
                this.$input.find('#js-license').text('修改图片');
                this.$input.find('.js-show-license').html('<a href="' + _fieldVal.image + '" class="fancybox"><img src="' + _fieldVal.image + '" width="40" height="auto"></a><i class="fa fa-times-circle" style="font-size: 20px;"></i>');
            }
        },
        input2value: function () {
            var _original = this.$input.attr('data-original');
            var valJson = _original ? JSON.parse(_original) : {};
            var _result = {};
            for (var key in valJson) {
                if (valJson[key]) {
                    _result[key] = valJson[key].image;
                }
            }
            var _fieldVal = this.$input.find('.js-show-license img').attr('src');
            _fieldVal = _fieldVal ? _fieldVal : '';
            _result[this.options.field] = _fieldVal;
            return JSON.stringify(_result);
        }
    });

    LicenseEdit.defaults = {
        tpl: '<div style="width: 240px;" data-original="">'
            + '<button class="btn btn-primary" type="button" id="js-license">上传</button>'
            + '<div class="js-show-license campaignIcon">'
            + '</div>'
            + '<span class="form-control-static text-warning">支持jpg、png</span></div>',
        inputclass: '',
        field: ''
    };

    $.fn.editabletypes.licenseedit = LicenseEdit;
})(window.jQuery);
