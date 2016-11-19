/** =========================================================
 * @file validate.js
 * @author validate
 * 在原作者的基础修改支持 bootstrap3
 *
 * check-type=
 *   required 不能为空
 *   url  表示 输入网址
 *   date 日期格式 xxxx-xx-xx
 *   mail 邮箱
 *   number 数字，可以整型，浮点型。
 *   char
 *   chinese 中文
 *   mobile  手机号码
 *   digits   数字
 *   contact  联系人
 *   clientname  名称
 *   loginaccount    登录账号

 * mail-message="扩展提示内容" ， 可以扩展data-message,url-message
 * minlength="6" 表示长度大于等于6
 * range="2.1~3"   表示值在[2.1~3]之间，并check-type="number"
 * range="2.1,2,4,5"   表示值在只能填现数字，并check-type="number"
 * accept="*" 不验证上传文件格式
 * accept="jpeg,png" 表示上传文件格式只是jpeg,png
 * size="112" 验证上传文件大小
 *  regex="^[a-zA-Z0-9\u4e00-\u9fa5\@\-\_]+$"   正则表达式
 *
 *
 * ========================================================= */
(function ($) {
    var formState = false;
    var wFocus = false;
    // var fform_style = 0; // 0=表示基本表单 1=表示内联表单 2=水平排列的表单
    var globalOptions = {};
    // 判断是否为checkbox、radio
    var checkable = function (element) {
        return (/radio|checkbox/i).test(element.attr('type'));
    };
    var findByName = function (element) {
        var checkname = element.attr('name');
        return $('input[name=' + checkname + ']');
    };
    // 表单验证方法
    var validationForm = function (obj) {
        if (globalOptions.blur) {
            // 1.丢失焦点事件
            $(obj).find('input, textarea,select').each(function () {
                var el = $(this);
                el.on('blur', function () { // 失去焦点时
                    var valid;
                    if (checkable(el)) {
                        var obj = findByName(el);
                        valid = (obj[0].getAttribute('check-type')) ? obj[0].getAttribute('check-type').split(' ') : null;
                    }
                    else {
                        valid = (el.attr('check-type')) ? el.attr('check-type').split(' ') : null;
                    }
                    if (valid || el.attr('regex')) {
                        validateField(this, valid);
                    }

                });
            });

            // 2.如是文件选择则要处理onchange事件
            $(obj).find('input[type=\'file\']').each(function () {
                var el = $(this);
                el.on('change', function () { //
                    var valid;
                    valid = (el.attr('check-type') === undefined) ? null : el.attr('check-type').split(' ');
                    if (valid) {
                        validateField(this, valid);
                    }

                });
            });

            // 4.重置按钮 type="reset"
            $(obj).find('input[type=\'reset\'],button[type=\'reset\']').each(function () {
                var el = $(this);
                el.on('click', function () { //
                    $(obj).validation();
                    $('#validerrmsg').remove();
                });
            });
            // end 4
        }

    };

    $.fn.validation = function (callback, options) {
        if (!this.length) {
            if (options && options.debug && window.console) {
                // console.warn('Nothing selected, can\'t validate, returning nothing.');
            }

            return;
        }

        if (typeof callback === 'object') {
            options = callback;
            callback = null;
        }

        return this.each(function () {
            globalOptions = $.extend({}, $.fn.validation.defaults, options);
            globalOptions.callback = callback;
            // Add novalidate tag if HTML5.
            $(this).attr('novalidate', 'novalidate');
            // fform_style = isformstyle(this);
            validationForm(this);
        });
    };

    $.fn.valid = function (object, options, cb) {
        if (formState) { // 重复提交则返回
            return false;
        }

        $('#validerrmsg').remove();

        var myobject;
        var myoptions;
        var mycb;
        if (typeof object === 'object') {
            myobject = $(object);
            if (typeof options === 'string') {
                myoptions = options;
                mycb = cb;
            }
            else {
                mycb = options;
            }
        }
        else {
            if (typeof object === 'string') {
                myoptions = object;
                mycb = cb;
            }
            else {
                mycb = object;
            }
        }

        formState = true;
        var validationError = false;
        // 取出验证的
        $('input, textarea, select', this).each(function () {
            var el = $(this);
            var controlGroup = el.parents('.form-group');
            // check-type="required chinese"  //支持多个，以空格隔开。
            var valid = (el.attr('check-type') === undefined) ? null : el.attr('check-type').split(' ');
            if (!controlGroup.hasClass('has-success') && valid != null && valid.length > 0) {
                if (!validateField(this, valid)) {
                    if (wFocus === false) {
                        // scrollTo(0, el[0].offsetTop - 50); // 去除滚动定位
                        scrollTo(0, $(el[0]).parent()[0].offsetTop - 60); // 添加滚动定位
                        wFocus = true;
                    }

                    validationError = true;
                }
            }

        });

        wFocus = false;
        formState = false;

        // 在最后的提交按钮增加提示内容
        if (myoptions != null && validationError) {
            if (myobject == null) {
                myobject = $('button:last[type=submit]');
            }

            // 由于ie8不支持array .indexOf(), 改下如下代码。
            var classArray = myobject.parent().attr('class').split(' ');
            var hadgroup = false;
            for (var i = 0; i < classArray.length; i++) {
                if (classArray[i] === 'btn-group') {
                    hadgroup = true;
                    break;
                }

            }
            if (hadgroup) {
                myobject.parent().before('<span id="validerrmsg" class="help-block" style="color: #FF0000;"><div class="alert alert-warning" role="alert" style="padding:10px;"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + myoptions + '</div></span>');
            }
            else {
                myobject.before('<span id="validerrmsg" class="help-block" style="color: #FF0000;"><div class="alert alert-warning" role="alert" style="padding:10px;"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + myoptions + '</div></span>');
            }
        }

        // end
        if (mycb) {
            mycb(validationError);
        }

        return !validationError;
    };

    $.fn.validation.defaults = {
        validRules: [
            {
                name: 'required',
                validate: function (value) {
                    return (($.trim(value) === '') || $.trim(value).length === 0);
                },
                defaultMsg: '请输入内容'
            },
            {
                name: 'number',
                validate: function (value) {
                    return (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value));
                },
                defaultMsg: '请输入数字'
            },
            {
                name: 'mail',
                validate: function (value) {
                    return (!/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value));
                },
                defaultMsg: '请输入正确的邮箱地址'
            },
            {
                name: 'char',
                validate: function (value) {
                    return (!/^[a-z\_\-A-Z]*$/.test(value));
                },
                defaultMsg: '请输入英文字符'
            },
            {
                name: 'chinese',
                validate: function (value) {
                    return (!/^[\\S\\s]*[\u4e00-\u9fff]+[\\S\\s]*$/.test(value));
                },
                defaultMsg: '请输入汉字'
            },
            {
                name: 'url',
                validate: function (value) {
                    return (!/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value));
                },
                defaultMsg: '请输入网址'
            },
            {
                name: 'link_url',
                validate: function (value) {
                    return (!/^((http|https):\/\/)(\w(\:\w)?@)?([0-9a-z_-]+\.)*?([a-z0-9-]+\.[a-z]{2,6}(\.[a-z]{2})?(\:[0-9]{2,6})?)((\/[^?#<>\/\\*":]*)+(\?[^#]*)?(#.*)?)?$/i.test(value));
                },
                defaultMsg: '请输入以http|https://开头的正确格式的URL'
            },
            {
                name: 'date',
                validate: function (value) {
                    return (/Invalid|NaN/.test(new Date(value).toString()));
                },
                defaultMsg: '日期格式XXXX-XX-XX'
            },
            {
                name: 'mobile',
                validate: function (value) {
                    return (!/^0?(13[0-9]|15[0-9]|17[0678]|18[0-9]|14[57])[0-9]{8}$/.test(value));
                },
                defaultMsg: '请输入正确的手机号'
            },
            {
                name: 'digits',
                validate: function (value) {
                    return (!/^\d+$/.test(value));
                },
                defaultMsg: '请输入数字'
            },
            {
                name: 'contact',
                validate: function (value) {
                    return (!/^[a-zA-Z0-9\u4e00-\u9fa5\@\-\_]+$/.test(value));
                },
                defaultMsg: '联系人必须为字母，中文，数字，下划线，中划线组成'
            },
            {
                name: 'clientname',
                validate: function (value) {
                    return (!/^[a-zA-Z0-9\u4e00-\u9fa5\@\s+\_\-\{\}\[\]\(\)\（\）\【\】\｛\｝\#]+$/.test(value));
                },
                defaultMsg: '请输入名称'
            },
            {
                name: 'qq',
                validate: function (value) {
                    return (!/^\d{5,11}$/.test(value));
                },
                defaultMsg: '请输入正确的qq'
            },
            {
                name: 'password',
                validate: function (value) {
                    return (!/^\w{6,16}$/.test(value));
                },
                defaultMsg: '请输入6-16位字符'
            },
            {
                name: 'amount',
                validate: function (value) {
                    return (!(!isNaN(value) && value > 0));
                },
                defaultMsg: '请输入大于0的数字'
            },
            {
                name: 'name',
                validate: function (value) {
                    return (!/^[a-zA-Z0-9\u4e00-\u9fa5\@\s+\_\-\{\}\[\]\(\)\（\）\【\】\｛\｝\#]{2,32}$/.test(value));
                },
                defaultMsg: '名称必须为2-32位以内的字母，中文，数字，下划线，@，#，横线和括号组成'
            },
            {
                name: 'briefname',
                validate: function (value) {
                    return (!/^[a-zA-Z0-9\u4e00-\u9fa5\@\s+\_\-\{\}\[\]\(\)\（\）\【\】\｛\｝\#]{2,32}$/.test(value));
                },
                defaultMsg: '简称必须为2-32位以内的字母，中文，数字，下划线，@，#，横线和括号组成'
            },
            {
                name: 'account',
                validate: function (value) {
                    return (!/^[a-zA-Z0-9\u4e00-\u9fa5]{2,32}$/.test(value));
                },
                defaultMsg: '登录账号必须由2-32个中文，字母，数字组成'
            },
            {
                name: 'loginaccount',
                validate: function (value) {
                    return (!/^[a-zA-Z0-9\u4e00-\u9fa5]{2,16}$/.test(value));
                },
                defaultMsg: '登录账号必须由2-16个中文，字母，数字组成'
            }
        ],
        callback: null, // function(obj,params){};
        blur: true
    };

    $.fn.validation.addMethod = function (name, method, message) {
        $.fn.validation.defaults.validRules.push({
            name: name,
            validate: method,
            defaultMsg: message
        });

    };

    function isformstyle(form) {
        if ($(form).hasClass('form-inline')) {
            return 1;
        }

        if ($(form).hasClass('form-horizontal')) {
            return 2;
        }
        return 0;
    }
    var getCheckedAryValue = function (el) {
        var value;
        var checked_array = [];
        $(findByName(el)).each(function () {
            if (this.checked) {
                checked_array.push(1);
            }

            value = checked_array.join('');
        });
        return value;
    };
    // 验证字段
    var validateField = function (field, valid) {
        var el = $(field);
        var error = false;
        var errorMsg = '';
        var minlength = (el.attr('minlength') ? el.attr('minlength') : null);
        var range = (el.attr('range') ? el.attr('range') : null);
        var accept = (el.attr('accept') ? el.attr('accept') : null);
        var size = (el.attr('size') ? el.attr('size') : null);
        var regex = (el.attr('regex') ? el.attr('regex') : null);
        var msg;

        if (valid) {
            for (var i = 0; i < valid.length; i++) {
                var x = true;
                var flag = valid[i];

                msg = (el.attr(flag + '-message') === undefined) ? null : el.attr(flag + '-message');

                if (flag.substr(0, 1) === '!') {
                    x = false;
                    flag = flag.substr(1, flag.length - 1);
                }

                var rules = globalOptions.validRules;

                if (rules) {
                    for (var j = 0; j < rules.length; j++) {
                        var rule = rules[j];
                        if (flag === rule.name) {
                            var value;

                            if (el.attr('type') != null && checkable(el)) {
                                value = getCheckedAryValue(el);
                            }
                            else {
                                value = el.val();
                            }

                            if (rule.name === 'required') {
                                if (rule.validate.call(field, value) === x) {
                                    error = true;
                                    if (el.attr('type') != null && el.attr('type').toLowerCase() === 'file') {
                                        errorMsg = (msg == null || msg === '') ? '请选择文件' : msg;
                                    }
                                    else {
                                        errorMsg = (msg == null || msg === '') ? rule.defaultMsg : msg;
                                    }
                                    break;
                                }
                            }
                            else {
                                if ($.trim(value) !== '' && $.trim(value).length > 0) {
                                    if (rule.validate.call(field, value) === x) {
                                        error = true;
                                        if (el.attr('type') != null && el.attr('type').toLowerCase() === 'file') {
                                            errorMsg = (msg == null || msg === '') ? '请选择文件' : msg;
                                        }
                                        else {
                                            errorMsg = (msg == null || msg === '') ? rule.defaultMsg : msg;
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                if (error) {
                    break;
                }

            }
        }

        // 验证长度
        if (minlength && !error) {
            error = el.val().length < minlength;
            if (error && (msg == null || errorMsg === '')) {
                errorMsg = '输入长度大于等于' + minlength;
            }
        }

        // 值区间
        if ($.inArray('number', valid) >= 0 && range && !error) {
            var values = range.split('~');
            var rangeMsg = (el.attr('range-message') === undefined) ? null : el.attr('range-message');

            if (values.length === 2) {
                error = parseFloat(el.val()) < parseFloat(values[0]) || parseFloat(el.val()) > parseFloat(values[1]);
                if (error && (msg == null || errorMsg === '')) {
                    errorMsg = rangeMsg == null ? ('输入值在［' + values[0] + '~' + values[1] + ']之间。') : rangeMsg;
                }
            }
            else {
                var values2 = range.split(',');
                if (values2.length > 0) {
                    error = $.inArray(el.val(), values2) < 0;
                    if (error && (msg == null || errorMsg === '')) {
                        errorMsg = rangeMsg == null ? ('输入值为' + range + '的其中一个。') : rangeMsg;
                    }
                }
            }
        }

        // 根据正则表达式验证
        if (regex && regex.length > 0 && !error) {
            var regxMsg = (el.attr('regex-message') === undefined) ? null : el.attr('regex-message');
            var reg = new RegExp(regex);
            if ($.trim(el.val()) !== '' && $.trim(el.val()).length > 0 && !reg.test(el.val())) {
                error = true;
                errorMsg = (regxMsg == null || regxMsg.length === 0) ? '请输入正确格式' : regxMsg;
            }
        }

        // 验证上传文件格式
        if (accept && !error) {
            if (accept === '*') {
            }
            else {
                var accepts = accept.split(',');
                var extendsion = (getFileExt(el.val())[0]).substr(1);
                if (!(extendsion && accepts.indexOf(extendsion) > -1)) {
                    error = true;
                    errorMsg = '允许上传的格式为' + accept;
                }
            }
        }

        // 验证上传文件大小
        if (size && !error) {
            var fileSize = getFileSize(el);
            if (fileSize > size) {
                error = true;
                errorMsg = '允许上传的文件大小为' + size + 'kb';
            }
        }

        // 外部验证回调方法
        if (!error && globalOptions.callback) {
            var params = {
                msg: '',
                err: error
            };
            var b = $.ajaxSettings.async;
            $.ajaxSetup({
                async: false
            });
            globalOptions.callback(field, params);
            error = params.err;
            if (error && (msg == null || errorMsg === '')) {
                errorMsg = params.msg;
            }
            else if (params.msg !== '') {
                errorMsg = params.msg;
            }

            $.ajaxSetup({
                async: b
            });
        }

        var controlGroup = el.parents('.form-group');
        // controlGroup.removeClass('has-error has-success');

        // controlGroup.addClass(error == false ? 'has-success' : 'has-error');
        var form = el.parents('form');
        if (form) {
            var fstyle = isformstyle(form); // 0=表示基本表单 1=表示内联表单 2=水平排列的表单
            // var iconname = error === false ? 'glyphicon-ok' : 'glyphicon-remove';
            if (fstyle === 0) {
                controlGroup.find('#valierr').remove();
                if (error) {
                    el.after('<span class="help-block error-msg text-danger" id="valierr">' + errorMsg + '</span>');
                }
            }
            else if (fstyle === 1) {
            }
            else if (fstyle === 2) {
                controlGroup.find('#valierr').remove();
                if (error) {
                    var sMsg = '<span class="help-block error-msg text-danger" id="valierr">' + errorMsg + '</span>';
                    if (el.attr('type') === 'checkbox') {
                        if (el.parent('.checkbox-inline') && el.parent('.checkbox-inline').length > 0) {
                            el.parent().parent().append(sMsg);
                        }
                        else {
                            el.parent().parent().parent().append(sMsg);
                        }
                    }
                    else if (el.attr('type') === 'radio') {
                        if (el.parent('.radio-inline') && el.parent('.radio-inline').length > 0) {
                            el.parent().parent().append(sMsg);
                        }
                        else {
                            el.parent().parent().parent().append(sMsg);
                        }
                    }
                    else {
                        if (el.parent('.input-group') && el.parent('.input-group').length > 0) {
                            el.parent().after(sMsg);
                        }
                        else {
                            el.after(sMsg);
                        }
                    }
                }
            }
        }
        // end !form
        return !error;
    };

    var getFileExt = function (value) {
        var result = /\.[^\.]+$/.exec(value);
        return result;
    };

    var getFileSize = function (element) {
        var byteSize = element[0].files[0].size;
        return (Math.ceil(byteSize / 1024)); // Size returned in KB.
    };

}(window.jQuery));
