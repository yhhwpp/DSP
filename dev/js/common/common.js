/**
 * @file common.js
 * @author hehe, xiaokangli, songxing
 */
// 全局设置$.ajax默认配置项
$.ajaxSetup({
    dataType: 'json',
    error: function (jqXHR, textStatus, errorThrown) {
        // 错误信息输出
        if (jqXHR.status === 401) {
            if (location.href.indexOf('login.html') < 0 && location.pathname !== '/bos-front/dev/') {
                location.href = API_URL.login_url;
            }
        }
        else if (jqXHR.status === 403) {
            location.href = API_URL.forbidden_url;
        }
    }
});

(function ($) {
    'use strict';

    // 根据aria-labelledby展示对应的DOM
    $.fn.initDom = function () {
        $('[data-toggle="showDiv"').click(function () {
            var _this = $(this);
            $('[data-name="' + _this.attr('data-name') + '"][data-toggle="showDiv"]').each(function () {
                $('[aria-labelledby="' + $(this).attr('id') + '"]').hide();
            });
            $('[aria-labelledby="' + _this.attr('id') + '"]').show();
        });

        $('[data-toggle="showLi"').click(function () {
            var _this = $(this);
            $('[data-name="' + _this.attr('data-name') + '"][data-toggle="showLi"]').each(function () {
                $('[aria-labelledby="' + $(this).attr('id') + '"]').hide();
                $(this).removeClass('cur');
            });
            $('[aria-labelledby="' + _this.attr('id') + '"]').show();
            _this.addClass('cur');
        });

        $('[data-toggle="showText"]').on('change', function () {
            if ($('[aria-labelledby="' + $(this).attr('id') + '"]')) {
                $('[aria-labelledby="' + $(this).attr('id') + '"]').text($(this).val());
            }

        });

        $('[data-toggle="showImg"]').on('change', function () {
            if ($('[aria-labelledby="' + $(this).attr('id') + '"]')) {
                $('[aria-labelledby="' + $(this).attr('id') + '"]').attr('src', $(this).val());
            }

        });

        $('[data-toggle="showHref"]').on('change', function () {
            if ($('[aria-labelledby="' + $(this).attr('id') + '"]')) {
                $('[aria-labelledby="' + $(this).attr('id') + '"]').attr('href', $(this).val());
            }

        });
    };

    String.prototype.endsWith = String.prototype.endsWith || function (str) {
        return (String(this.match(str + '$')) === str);
    };
}(window.jQuery));


// 封装datatable表格异步请求
jQuery.extend(jQuery.fn, {
    initTable: function (urlTitle, urlList, opt, attach) {
        var table;
        var _this = $(this);
        var _fnToMapset = function (a) {
            var obj = {};
            for (var i = 0; i !== a.length; i++) {
                obj[a[i].name] = a[i].value;
            }
            return obj;
        };
        var option = {
            ajaxSource: urlList,
            serverSide: true,
            processing: true,
            fixedHeader: true,
            fnServerData: function (sSource, aoData, fnCallback, oSettings) {
                var o = option;
                var t = this;
                aoData = _fnToMapset(aoData);
                var parse = jQuery.extend({}, opt.postData || {});
                for (var k in parse) {
                    if (typeof parse[k] === 'function') {
                        parse[k] = parse[k].call(this);
                    }
                }
                var postData = null;
                postData = jQuery.extend({
                    _t: new Date().getTime()
                }, parse);
                postData.pageSize = aoData.iDisplayLength;
                postData.pageNo = (aoData.iDisplayStart / aoData.iDisplayLength) + 1;

                if (aoData.sSortDir_0) {
                    if (aoData.sSortDir_0.toLowerCase() === 'asc') {
                        postData.sort = aoData['mDataProp_' + aoData.iSortCol_0];
                    }
                    else {
                        postData.sort = '-' + aoData['mDataProp_' + aoData.iSortCol_0];
                    }
                }
                postData.search = aoData.sSearch ? aoData.sSearch : postData.search;

                $.ajax($.extend({
                    url: sSource,
                    type: 'POST',
                    data: postData,
                    dataType: 'json',
                    success: function (json) {
                        if (json.res) {
                            return;
                        }
                        var map = table.map = json.map;
                        var data = {
                            draw: aoData.sEcho,
                            recordsTotal: map && map.count,
                            recordsFiltered: map && map.count,
                            data: json.list ? json.list : []
                        };
                        var obj = table.obj = json.obj;
                        fnCallback(data);
                        if (o.fnAfterDraw && typeof o.fnAfterDraw === 'function') {
                            o.fnAfterDraw.call(t, json);
                        }
                        if (obj) {
                            var aoColumns = oSettings.aoColumns;
                            var aryMDatas = [];
                            for (var jj = 0, h = aoColumns.length; jj < h; jj++) {
                                aryMDatas.push(aoColumns[jj].mData);
                            }
                            for (var key in obj) {
                                if ($.inArray(key, aryMDatas) > -1) {
                                    _this.find('tfoot tr td').eq($.inArray(key, aryMDatas)).html(obj[key]);
                                }
                            }
                        }
                        if (opt.fnCustomOper && typeof opt.fnCustomOper === 'function') {
                            opt.fnCustomOper.call(_this, json);
                        }

                        // 添加tfooter
                        if (obj && obj.footer) {
                            if (_this.find('tfoot tr td') && obj.footer.length === _this.find('tfoot tr td').length) {
                                _this.find('tfoot tr td').each(function (index) {
                                    $(this).html(obj.footer[index]);
                                });
                            }
                        }

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (jqXHR.status === 401) {
                            if (location.href.indexOf('login.html') < 0) {
                                location.href = API_URL.login_url;
                            }
                        }
                        else if (jqXHR.status === 403) {
                            location.href = '/bos-front/dev/forbidden.html';
                        }
                        /* eslint no-console: [0]*/
                        window.console && console.warn(arguments);
                    }
                }, (opt && opt.ajaxOptions) ? opt.ajaxOptions : null));
            }
        };
        var _fnRenderTitle = function (data) {
            if (data.res) {
                return;
            }

            var _obj = data.obj;
            var newColumns = [];
            data = data.list;
            _this.nameList = [];

            var _fnCreatedCell = function (td, sData, oData, row, col, obj) {
                opt.fnCustomColumn.call(this, td, sData, oData, row, col, _this);
            };
            var _fnInitCustomColumn = function (td, sData, oData, row, col) {
                oData[data[col].label] !== 'undefined' && $(td).html(oData[data[col].label]);
                opt.fnCustomColumn.call(this, td, sData, oData, row, col, _this);
            };
            for (var i = 0; i < data.length; i++) {
                newColumns[i] = {};
                newColumns[i].mData = data[i].field;
                _this.nameList.push(newColumns[i].mData);
                newColumns[i].bSortable = (data[i].column_set && $.inArray('sortable', data[i].column_set) !== -1);
                newColumns[i].bSortable = newColumns[i].bSortable ? newColumns[i].bSortable : false;
                if (data[i].width) {
                    newColumns[i].sWidth = data[i].width;
                }
                if (data[i].render) {
                    newColumns[i].mRender = data[i].render;
                }
                if (data[i].sClass) {
                    newColumns[i].sClass = data[i].sClass;
                }
                if (data[i].bVisible != null && data[i].bVisible !== '') {
                    newColumns[i].bVisible = data[i].bVisible;
                }
                newColumns[i].fnCreatedCell = data[i].label !== 'undefined' && data[i].label ? _fnInitCustomColumn : _fnCreatedCell;
                if (data[i].column_set && $.inArray('checkall', data[i].column_set) !== -1) {
                    newColumns[i].sTitle = '<input type="checkbox" data-type="checkall" data-col="' + i + '" />' + data[i].title;
                }
                else {
                    newColumns[i].sTitle = data[i].title;
                }
                if (data[i].column_set && $.inArray('desc', data[i].column_set) !== -1) {
                    option.order = [
                        [
                            i,
                            'desc'
                        ]
                    ];
                }
                else if (data[i].column_set && $.inArray('asc', data[i].column_set) !== -1) {
                    option.order = [
                        [
                            i,
                            'asc'
                        ]
                    ];
                }

            }
            option.order = option.order ? option.order : [];
            opt.aoColumns = newColumns;
            jQuery.extend(option, opt || {});
            /* eslint new-cap: [2, {"capIsNewExceptions": ["DataTable"]}] */
            table = _this.DataTable(option);
            // 添加tfooter
            if (_obj && _obj.footer && _obj.footer.length > 0) {
                var _tr = '<tr>';
                for (var ii = 0, j = _obj.footer.length; ii < j; ii++) {
                    _tr += '<td>' + _obj.footer[ii] + '</td>';
                }
                _tr += '</tr>';
                _this.append($('<tfoot/>').append(_tr));
            }

            table.reload = function () {
                this.ajax.reload.apply(this, [].slice.call(arguments, 0));
            };
            if (typeof attach === 'string') {
                window[attach] = table;
            }
        };
        if (typeof urlTitle === 'string') {
            $.ajax({
                type: 'get',
                url: urlTitle,
                data: {
                    get_title: 1,
                    _t: new Date().getTime()
                },
                dataType: 'json',
                success: function (data) {
                    _fnRenderTitle(data);
                }
            });
        }
        else if (typeof urlTitle === 'object') {
            _fnRenderTitle(urlTitle);
        }

    }
});

// 以配置的方式代理事件
$.fn.delegates = function (configs) {
    var el = $(this[0]);
    for (var name in configs) {
        var value = configs[name];
        if (typeof value === 'function') {
            var obj = {};
            obj.click = value;
            value = obj;
        }

        for (var type in value) {
            el.delegate(name, type, value[type]);
        }
    }
    return this;
};

// 将jQuery的Form序列化转化为json,data为额外增加的数据
$.fn.serializeJson = function (data) {
    var obj = {};
    var array = this.serializeArray();
    if (data !== null && data !== undefined) {
        $.each(data, function (name, value) {
            array.push({
                name: name,
                value: value
            });
        });
    }
    $(array).each(function () {
        if (obj[this.name]) {
            if ($.isArray(obj[this.name])) {
                obj[this.name].push(this.value);
            }
            else {
                obj[this.name] = [obj[this.name], this.value];
            }
        }
        else {
            obj[this.name] = this.value;
        }

    });
    return obj;
};

var Helper = {
    /*
     *	判断是否为数字
     *	@param {number} num  可以直接用$.isNumeric方法
     *	@return bool
     */
    fnIsNumber: function (num) {
        var reg = /^\d{1,}$/;
        if (reg.test(num)) {
            return true;
        }

        return false;
    },

    /*
     *  	判断值是否为空
     *	@param {string} val
     *	@return bool
     */
    fnIsEmpty: function (val) {
        if (val && val.trim() && val.length > 0) {
            return false;
        }
        return true;
    },

    /*
     * 	判断是否为手机号
     *	@param telphone
     */
    fnIsTelphone: function (telphone) {
        // var reg = /^(\+\d{2,3}\-)?\d{11}$/;
        var reg = /^1[3-9]\d{9}$/;
        if (reg.test(telphone)) {
            return true;
        }

        return false;
    },

    /*
     *	判断是否为联系人
     *	@param contact
     */
    fnIsContact: function (contact) {
        var reg = /^[a-zA-Z0-9\u4e00-\u9fa5\@\-\_]+$/;
        if (reg.test(contact)) {
            return true;
        }

        return false;
    },

    /*
     *	判断是否为邮箱
     *	@param email
     */
    fnIsEmail: function (email) {
        var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (reg.test(email)) {
            return true;
        }

        return false;
    },

    /*
     *	判断密码格式是否正确
     *	@param pwd
     */
    fnIsPwd: function (pwd) {
        if (!Helper.fnIsEmpty(pwd) && pwd.length >= 6 && pwd.length < 16) {
            return true;
        }

        return false;
    },

    /*
     *	判断媒体名称
     *	@param traName
     */
    fnIsTraName: function (traName) {
        var reg = /^[a-zA-Z0-9\u4e00-\u9fa5\@\s+\_\-\{\}\[\]\(\)\（\）\【\】\｛\｝\#]+$/;
        if (reg.test(traName)) {
            return true;
        }

        return false;
    },

    /*
     *	判断登录账号
     *	@param traLg
     */
    fnIsTraLg: function (traLg) {
        var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
        if (reg.test(traLg)) {
            return true;
        }

        return false;
    },
    /*
     *  判断qq
     *  @param qq
     */
    fnIsQQ: function (qq) {
        var reg = /^\d{5,11}$/;
        if (reg.test(qq)) {
            return true;
        }
        return false;
    },
    // ajax处理遮罩防止多次提交
    load_ajax: function (domObj) {
        $('<div class=\"datagrid-mask\"></div>').css({
            display: 'block',
            width: '100%',
            height: $(document).height()
        }).appendTo('body');
        $('<div class=\"datagrid-mask-msg\"></div>').html('<i class="fa fa-spinner fa-spin fa-3x"></i>&nbsp;&nbsp;&nbsp;处理中...').appendTo('body').css({
            display: 'block',
            left: ($(document.body).outerWidth(true) - 190) / 2,
            top: ($(window).height() - 45) / 2 + $(document).scrollTop()
        });
    },
    // 关闭遮罩
    close_ajax: function () {
        $('.datagrid-mask').remove();
        $('.datagrid-mask-msg').remove();
    },

    /*
     * [function 提示信息 ]
     * @param {[string]} con [提示内容]
     * @param {[type]} url [跳转链接]
     */
    fnPrompt: function (con, url) {
        if ($('.prompt').length > 0) {
            return;
        }

        $('<div class=\"greylayer\"></div>').css({
            display: 'block',
            width: '100%',
            height: $(document).height()
        }).appendTo('body');
        var $msgtxt = $('<div id=\"msg\" class=\"modifybox prompt\" ><div class=\"bd\"><div id=\"msgtit\"><span class=\"msg-close\">×</span>提示消息</div><div id=\"msgcon\">' + con + '</div></div></div>');
        $msgtxt.appendTo('body').css({
            left: ($(document).width() - $('#msg').width() - 2) / 2 + 'px',
            top: ($(window).height() - $('#msg').height()) / 2 + $(window).scrollTop() + 'px'
        }).fadeIn();
        setTimeout(function () {
            if (undefined !== url) {
                location.href = url;
            }

            $('#msg, .greylayer').fadeOut().remove();
        }, 2000);
        $($msgtxt).find('.msg-close').click(Helper.fnClosePrompt);
    },
    fnClosePrompt: function (e) {
        $('#msg, .greylayer').fadeOut().remove();
        e.stopPropagation();
    },
    /*
     * 创建table函数封装: example:Helper.fnCreatTable('#table', '../demo.json', function (){}, 'dataTable', {'bAutoWidth':false,'fnHeaderCallback':function (){}});
     * @param  {sting} id             id名称
     * @param  {sting/obeject} urlTitle      获取title地址/json
     * @param  {sting} urlList		  获取list地址
     * @param  {function} fnCustomColumn 自定义td函数
     * @param  {string} dtstr         table初始化赋值
     * @param  {obeject} opt          自定义dataTable配置或函数
     */
    fnCreatTable: function (id, urlTitle, urlList, fnCustomColumn, dtstr, opt) {
        var option = {
            fnCustomColumn: fnCustomColumn/* ,
            fnInitComplete: function () {
                if (!window.fixedHeader) {
                    window.fixedHeader = new $.fn.dataTable.FixedHeader(window[dtstr]);
                }
            }*/
        };
        var opt2 = {
            fnDrawCallback: function () {
                opt && opt.fnDrawCallback && opt.fnDrawCallback.apply(null, arguments);
                // var fnFixHeader = function () {
                //     window.fixedHeader || (window.fixedHeader = new $.fn.dataTable.FixedHeader(window[dtstr]));
                //     window.fixedHeader._fnUpdateClones(true);
                //     window.fixedHeader._fnUpdatePositions();
                // };
                // 如果存在图片，需要等待图片全部加载完成 再执行fixedHeader
                // var $tbImg = $(id + ' img');
                // var slength = $tbImg.length;
                // if (slength > 0) {
                //     var num = 0;
                //     $tbImg.each(function () {
                //         num++;
                //         $(this).load(function () {
                //             if (num === slength) {
                //                 fnFixHeader();
                //             }
                //         });
                //     });
                // }
                // else {
                //     fnFixHeader();
                // }
            }
        };

        $.extend(option, opt || {}, opt2);
        $(id).initTable(urlTitle, urlList, option, dtstr);

        /*
         * window resize 保证dataTable FixeHeader样式正常
         */
        // $(window).bind('resize', function () {
        //     if (window.fixedHeader) {
        //         window.fixedHeader._fnUpdateClones(true);
        //         window.fixedHeader._fnUpdatePositions();
        //     }
        // });

    },

    /*
     *	根据参数名获取参数值
     *	@param {string} name 参数名
     */
    fnGetQueryParam: function (name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }

        return null;
    },

    /*
     *  根据hash名获取参数值
     *  @param {string} name 参数名
     */
    fnGetHashParam: function (name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
        var r = window.location.hash.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }

        return null;
    },

    /*
     *	获取弹出框或者提示框的html
     *	@param {string} options  popover或者tooltip配置
     *	@param {string} text 在表格中要显示的内容
     */
    fnGetPopoverOrTooltip: function (options, text) {
        var oSpan = $('<span></span>');
        if (text) {
            oSpan.html(text);
        }

        if (options) {
            oSpan.attr(options);
        }

        return oSpan;
    },

    /*
     * [Helper.fnSetCookie 设置cookie]
     * @param  {string} name  [cookie名称]
     * @param  {string} value [cookie 值]
     * @param  {number} d     [cookie 保存时间(天),默认1天]
     */
    fnSetCookie: function (name, value, d) {
        var date = new Date();
        var expireDays = d ? d : 1;
        date.setTime(date.getTime() + expireDays * 24 * 3600 * 1000);
        document.cookie = name + '=' + encodeURI(value) + '; expires=' + date.toGMTString() + '; path = /';
    },
    // 获取cookie
    fnGetCookie: function (name) {
        var cookiestr = document.cookie;
        var cookiearr0 = cookiestr.split('; ');
        var cookiearr1 = [];
        for (var i = 0; i < cookiearr0.length; i++) {
            cookiearr1 = cookiearr0[i].split('=');
            if (cookiearr1[0] === name) {
                return decodeURI(cookiearr1[1]);
            }

        }
        return '';
    },
    // 删除cookie
    fnRemoveCookie: function (name) {
        this.fnSetCookie(name, '', -1);
    },
    // 模拟系统confirm
    fnConfirm: function (txt, call) {
        if ($('.confirm').length > 0) {
            return;
        }

        $('<div class=\"greylayer\"></div>').css({
            display: 'block',
            width: $(document).width(),
            height: $(document).height()
        }).appendTo('body');
        var $msgtxt = $('<div id=\"msg\" class=\"modifybox .confirm\" ><div class=\"bd\"><div id=\"msgtit\"><span class=\"msg-close\" onclick=\"Helper.fnClosePrompt()\">×</span>提示消息</div><div id=\"msgcon\">' + txt + '</div><div id=\"msgfooter\"><button type=\"button\" class=\"confirm_cancel btn btn-default\">取消</button><button type=\"button\"  class=\"confirm_bt btn btn-primary\">确定</button></div></div></div>');
        $msgtxt.appendTo('body').css({
            left: ($('body').width() - $('#msg').width() - 2) / 2 + 'px',
            top: ($(window).height() - $('#msg').height()) / 2 + $(window).scrollTop() + 'px'
        }).fadeIn();
        $('.confirm_bt').focus();
        $('.confirm_bt').bind('click', call);
        $('.confirm_bt').bind('click', function () {
            $('#msg, .greylayer').remove();
        });
        $('.confirm_cancel').bind('click', function () {
            $('#msg, .greylayer').remove();
            return false;
        });
    },
    // 模拟系统alert
    fnAlert: function (txt, call) {
        if ($('.confirm').length > 0) {
            return;
        }

        $('<div class=\"greylayer\"></div>').css({
            display: 'block',
            width: $(document).width(),
            height: $(document).height()
        }).appendTo('body');
        var $msgtxt = $('<div id=\"msg\" class=\"modifybox .confirm\" ><div class=\"bd\"><div id=\"msgtit\">提示消息</div><div id=\"msgcon\">' + txt + '</div><div id=\"msgfooter\"><button type=\"button\"  class=\"confirm_bt\" style=\"width:100px\">确定</button></div></div></div>');
        $msgtxt.appendTo('body').css({
            left: ($('body').width() - $('#msg').width() - 2) / 2 + 'px',
            top: ($(window).height() - $('#msg').height()) / 2 + $(window).scrollTop() + 'px'
        }).fadeIn();
        $('.confirm_bt').focus();
        $('.confirm_bt').bind('click', call);
        $('.confirm_bt').bind('click', function () {
            $('#msg, .greylayer').remove();
        });
    },

    /*
     *  @param string formId 表单id
     *  @param string  buttonId 提交按钮id
     *  @param function callback 回调函数
     */
    fnInitValid: function (formName, btnName, callback) {
        $('#' + formName).validation();
        $('#' + btnName).on('click', function () {
            if (!($('#' + formName).valid())) {
                return false;
            }

            if (typeof callback === 'function') {
                // callback.call(null, callback);
                callback();
            }

        });
    },

    /*
     * 检测时间格式，日期格式 YYYY-MM-DD
     *
     * @param date
     *            日期
     */
    fnCheckDay: function (str) {
        return /^2\d{3}(\-|\/|\.)\d{2}\1\d{2}$/.test(str);
    },

    /*
     * 动态加载js
     *
     * @param url
     *            加载的url
     * @param callback
     *            加载后的回调函数
     */
    fnLoadScript: function (url, callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = 'async';
        if (script.readyState) { // IE
            script.onreadystatechange = function () {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    script.onreadystatechange = null;
                    callback();
                }

            };
        }
        else { // Others: Firefox, Safari, Chrome, and Opera
            script.onload = function () {
                callback();
            };
        }
        script.src = url;
        document.body.appendChild(script);
    },

    /*
     * 字符串每个字符中间插入字符串
     *
     * @param str1
     *            原始字符串
     * @param str2
     *            需要插入的字符串
     * return 处理后的字符串
     */
    fnInsertString: function (str1, str2) {
        var arr = str1.split('');
        return arr.join(str2);
    },

    /*
     * 解析字符串返回日期对象
     *
     * @param str
     *            日期 YYYY-MM-DD
     * return date对象
     */
    fnGetDate: function (str) {
        var tempDate = new Date();
        var list = str.split('-');
        tempDate.setFullYear(list[0]);
        tempDate.setMonth(list[1] - 1);
        tempDate.setDate(list[2]);
        return tempDate;
    },

    /*
     * 计算两个日期时间段内所有日期
     *
     * @param value1
     *            开始日期 YYYY-MM-DD
     * @param value2
     *            结束日期
     * return 日期数组
     */
    fnDateScope: function (value1, value2) {
        var getDate = function (str) {
            var tempDate = new Date();
            var list = str.split('-');
            tempDate.setFullYear(list[0]);
            tempDate.setMonth(list[1] - 1);
            tempDate.setDate(list[2]);
            return tempDate;
        };
        var date1 = getDate(value1);
        var date2 = getDate(value2);
        if (date1 > date2) {
            var tempDate = date1;
            date1 = date2;
            date2 = tempDate;
        }

        var dateArr = [];
        var i = 0;
        var dayStr = '';
        var monthStr = '';
        while (!(date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate())) {
            dayStr = date1.getDate().toString();
            if (dayStr.length === 1) {
                dayStr = '0' + dayStr;
            }

            monthStr = (date1.getMonth() + 1).toString();
            if (monthStr.length === 1) {
                monthStr = '0' + monthStr;
            }

            dateArr[i] = date1.getFullYear() + '-' + monthStr + '-' + dayStr;
            i++;
            date1.setDate(date1.getDate() + 1);
        }
        // 包含最后一天
        dayStr = date2.getDate().toString();
        if (dayStr.length === 1) {
            dayStr = '0' + dayStr;
        }

        monthStr = (date2.getMonth() + 1).toString();
        if (monthStr.length === 1) {
            monthStr = '0' + monthStr;
        }

        dateArr[i] = date2.getFullYear() + '-' + monthStr + '-' + dayStr;
        return dateArr;
    },

    /*
     * 计算两个日期时间段内所有月份
     *
     * @param value1
     *            开始日期 YYYY-MM-DD
     * @param value2
     *            结束日期
     * return 月份数组
     */
    fnMonthScope: function (value1, value2) {
        var from = Date.parse(value1);
        var end = Date.parse(value2);
        if (from.compareTo(end) === 1) {
            var tmp = from;
            from = end;
            end = tmp;
        }

        var monthArr = [];
        while (from.compareTo(end) < 1) {
            var monthTmp = from.toString('yyyy-MM');
            if ($.inArray(monthTmp, monthArr) < 0) {
                monthArr.push(monthTmp + '-01');
            }
            from = from.addMonths(1);
        }
        return monthArr;
    },

    /*
     * 计算两个日期时间段内所有星期
     *
     * @param value1
     *            开始日期 YYYY-MM-DD
     * @param value2
     *            结束日期
     * return 月份数组
     */
    fnWeekScope: function (from, to) {
        var arr = [];
        var start = Date.parse(from).moveToDayOfWeek(0).addWeeks(-1);
        var end = Date.parse(to).moveToDayOfWeek(0).addWeeks(-1);
        while (Date.compare(start, end) !== 1) {
            arr.push(start.toString('yyyy-MM-dd'));
            start = start.addWeeks(1);
        }
        return arr;
    },

    /*
     * 获取一天内的所有小时
     *
     * @param value1
     *            开始日期 YYYY-MM-DD
     * @param value2
     *            结束日期
     * return 月份数组
     */
    fnHourScope: function (from, to) {
        var arr = [];
        for (var i = 0; i < 24; i++) {
            arr.push(from + ' ' + (i < 10 ? '0' : '') + i + ':00:00');
        }
        return arr;
    },

    fnInitKeyHandle: function () {
        // 关闭
        $('.floater-close').on('click', function (e) {
            $(this).parents('#zones-up').hide();
            e.stopPropagation();
        });

        $(document).click(function (e) {
            var con = $('.zones-up');
            if (!con.is(e.target) && con.has(e.target).length === 0) {
                $('#zones-up').hide();
            }

        });
    },

    /*
     *obj深度拷贝
     */
    fnDeepCopy: function (source) {
        var result = {};
        for (var key in source) {
            result[key] = typeof source[key] === 'object' ? Helper.fnDeepCopy(source[key]) : source[key];
        }
        return result;
    },

    /*
     *json深度拷贝,只拷贝数据，忽略function
     */
    fnJSONDeepCopy: function (source) {
        var result = {};
        for (var key in source) {
            if (typeof source[key] === 'function') {
                continue;
            }
            result[key] = typeof source[key] === 'object' ? Helper.fnDeepCopy(source[key]) : source[key];
        }
        return result;
    },

    /*
     * input只允许输入数字
     */
    fnInputCheckNumber: function (ob) {
        if (!ob.value.match(/^[\+\-]?\d*?\.?\d*?$/)) {
            ob.value = typeof ob.t_value !== 'undefined' ? ob.t_value : '';
        }
        else {
            ob.t_value = ob.value;
        }
    },

    /*
     * 格式化金钱
     */
    fnFormatMoney: function (s, n) {
        if (s == null || s === '' || isNaN(s)) {
            return s;
        }
        n = n >= 0 && n <= 20 ? n : 2;
        if (n === 0) {
            s = parseInt((s + '').replace(/[^\d\.-]/g, ''), 10) + '';
        }
        else {
            s = parseFloat((s + '').replace(/[^\d\.-]/g, '')).toFixed(n) + '';
        }

        var l = s.split('.')[0].split('').reverse();
        var r = s.split('.')[1];
        var t = '';
        for (var i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 === 0 && ((i + 1) !== l.length && l[i + 1] !== '-') ? ',' : '');
        }
        var w = r ? ('.' + r) : '';
        return t.split('').reverse().join('') + w;
    },

    /*
     *计算算数表达式
     */
    fnEval: function (fn) {
        var Fn = Function;  // 一个变量指向Function，防止有些前端编译工具报错
        return new Fn('return ' + fn)();
    },

    /*
     *固定头部，kendo
     */
    fnFixedHead: function ($ele) {
        if (!$ele.is(':hidden')) {
            if ($ele.offset().top - $(window).scrollTop() < 50) {
                $ele.find('.k-grid-header').css({position: 'relative', top: ($(window).scrollTop() - $ele.offset().top + 50), zIndex: '1'});
            }
            else {
                $ele.find('.k-grid-header').css({top: '0px'});
            }
        }
    },
    _fnMakeArray: function (data) {
        var count;
        var obj;
        var result = [];
        var item;
        var iterateItem;
        if (!data || typeof data === 'string') {
            return null;
        }

        if ($.isArray(data)) { // array
            /*
               function to iterate inside item of array if item is object.
               Caclulates count of keys in item and store in obj.
            */
            iterateItem = function (k, v) {
                obj = {value: k, text: v};
                if (count++ >= 2) {
                    return false; // exit from `each` if item has more than one key.
                }
            };
            for (var i = 0; i < data.length; i++) {
                item = data[i];
                if (typeof item === 'object') {
                    count = 0; // count of keys inside item
                    $.each(item, iterateItem);
                    // case: [{val1: 'text1'}, {val2: 'text2} ...]
                    if (count === 1) {
                        result.push(obj);
                        // case: [{value: 1, text: 'text1'}, {value: 2, text: 'text2'}, ...]
                    }
                    else if (count > 1) {
                        // removed check of existance: item.hasOwnProperty('value') && item.hasOwnProperty('text')
                        if (item.children) {
                            item.children = this.makeArray(item.children);
                        }
                        result.push(item);
                    }
                }
                else {
                    // case: ['text1', 'text2' ...]
                    result.push({value: item, text: item});
                }
            }
        }
        else {  // case: {val1: 'text1', val2: 'text2, ...}
            $.each(data, function (k, v) {
                result.push({value: k, text: v});
            });
        }
        return result;
    },
    _fnOnReadySales: function (options, success, error) {
        var self = this;
        var cacheID = options.ajaxOptions.url;
        var cache;

        if (!$(document).data(cacheID)) {
            $(document).data(cacheID, {});
        }
        cache = $(document).data(cacheID);

        // check for cached data
        if (cache.loading === false && cache.sourceData) { // take source from cache
            this.sourceData = cache.sourceData;
            success.call(this);
            return this.sourceData;
        }
        else if (cache.loading === true) { // cache is loading, put callback in stack to be called later
            cache.callbacks.push($.proxy(function () {
                this.sourceData = cache.sourceData;
                success.call(this);
            }, this));

            // also collecting error callbacks
            cache.err_callbacks.push($.proxy(error, this));
            return this.sourceData;
        }
        /* eslint no-else-return: [0] */
        else { // no cache yet, activate it
            cache.loading = true;
            cache.callbacks = [];
            cache.err_callbacks = [];
        }
        // ajaxOptions for source. Can be overwritten bt options.sourceOptions
        var ajaxOptions = $.extend({
            type: 'post',
            cache: false,
            dataType: 'json',
            success: $.proxy(function (data) {
                if (data.res !== 0) {
                    return;
                }
                if (cache) {
                    cache.loading = false;
                }
                this.sourceData = options.toAry ? self._fnMakeArray(data.obj) : data.obj;
                if (cache) {
                    // store result in cache
                    cache.sourceData = this.sourceData;
                    // run success callbacks for other fields waiting for this source
                    $.each(cache.callbacks, function () {
                        this.call();
                    });
                }
                success.call(this);
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
        }, options.ajaxOptions);
        // loading sourceData from server
        $.ajax(ajaxOptions);
    },
    _fnGetImpressionsText: function (impressions) {
        if (!isNaN(impressions)) {
            if (impressions < 10000) {
                return '<1万';
            }
            else if (impressions > 10000000) {
                return '>1000万';
            }
            var power = ((impressions + '').length - 4);
            var first = (impressions + '').substr(0, 1);
            return (parseInt(first, 10) * Math.pow(10, parseInt(power, 10) - 1)) + '万+';
        }
        return '<1万';
    }
};

(function ($) {
    $.fn.categoryList = function (option, arr) {
        var categoryList = {};
        var _this = this;
        if (option === 'select') {
            if ($.isArray(arr)) {
                selectItem(arr);
            }
            return;
        }
        if (option) {
            categoryList = option;
        }

        categoryList = formatData(categoryList);

        function selectItem(arr) {
            for (var i = 0; i < arr.length; i++) {
                var $ele = _this.find('input[value="' + arr[i] + '"]');
                if (!$ele.is(':checked')) {
                    $ele.trigger('click');
                }
            }
        }

        function formatData(data) {
            var obj = {};
            var key = null;
            var tmp = null;
            // 一级
            for (key in data.parent) {
                if (data.parent.hasOwnProperty(key)) {
                    obj[key] = {
                        name: data.parent[key]
                    };
                }
            }

            // 二级
            if (data.category) {
                for (var i = 0, l = data.category.length; i < l; i++) {
                    tmp = data.category[i];
                    if (obj[tmp.parent]) {
                        if (obj[tmp.parent].child === undefined) {
                            obj[tmp.parent].child = {};
                        }
                        obj[tmp.parent].child[tmp.category_id] = $.extend({}, tmp);
                    }
                }

                // 三级
                for (i = 0, l = data.category.length; i < l; i++) {
                    tmp = data.category[i];
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (obj[key].child && obj[key].child[tmp.parent]) {
                                if (obj[key].child[tmp.parent].child === undefined) {
                                    obj[key].child[tmp.parent].child = {};
                                }
                                obj[key].child[tmp.parent].child[tmp.category_id] = $.extend({}, tmp);
                            }
                        }
                    }
                }
            }
            return obj;
        }

        function createHtml(categoryList) {
            var html = '<div class="ct-category-list-container"><ul class="ct-category-list-wrapper">';
            var hasChild = '0';
            var divHtml = '';
            for (var key in categoryList) {
                if (categoryList.hasOwnProperty(key)) {
                    hasChild = categoryList[key].child ? '1' : '0';
                    html += '<li data-type="category-cell" data-value="' + key + '" data-children="' + hasChild + '">'
                    + '<input type="checkbox" value="' + key + '" data-children="' + hasChild + '">'
                    + '<span>' + categoryList[key].name + '</span>'
                    + '</li>';
                    divHtml += (hasChild === '1' ? createChildHtml(categoryList[key].child, key) : '');
                }
            }
            html += '</ul>' + divHtml + '</div>';
            return html;
        }

        function createChildHtml(child, parentId) {
            var html = '<div class="ct-child-container ct-category-list-container" data-type="child-list" data-parent="' + parentId + '"><ul class="ct-child-wrapper">';
            var hasChild = '0';
            var divHtml = '';
            for (var key in child) {
                if (child.hasOwnProperty(key)) {
                    hasChild = child[key].child ? '1' : '0';
                    html += '<li data-type="category-cell" data-value="' + key + '" data-children="' + hasChild + '">'
                    + '<input type="checkbox" value="' + key + '" data-children="' + hasChild + '" data-parent="' + parentId + '">'
                    + '<span>' + child[key].name + '</span>'
                    + '</li>';
                    divHtml += (hasChild === '1' ? createChildHtml(child[key].child, key) : '');
                }

            }
            html += '</ul>' + divHtml + '</div>';
            return html;
        }

        function freshParent($ele) {
            var $wrapper = $ele.parent().parent().parent();
            var checked = $wrapper.find('li input[type="checkbox"]:checked');
            var box = $wrapper.find('li input[type="checkbox"]');
            var $parentBox = _this.find('input[type="checkbox"][value="' + $ele.attr('data-parent') + '"]');
            if (checked.length === 0) {
                $parentBox.prop('indeterminate', false);
                $parentBox.prop('checked', false);
            }
            else if (checked.length === box.length) {
                $parentBox.prop('indeterminate', false);
                $parentBox.prop('checked', true);
            }
            else {
                $parentBox.prop('indeterminate', true);
            }
            if ($parentBox.attr('data-parent') !== undefined) {
                freshParent($parentBox);
            }
        }

        this.on('click', 'li[data-type="category-cell"]', function () {
            var $this = $(this);
            var $ele = $this.parent().parent();
            $this.addClass('active').siblings().removeClass('active');
            $ele.find('[data-type="child-list"]').hide();
            _this.find('[data-type="child-list"][data-parent="' + $this.attr('data-value') + '"]').show();
        });

        this.on('click', 'input[type="checkbox"]', function () {
            var $this = $(this);
            var $ele = $this.parents().parent().parent();
            if ($this.attr('data-children') === '1') {
                var $eles = $ele.find('[data-type="child-list"][data-parent="' + $this.val() + '"]').find('ul li input[type="checkbox"]');
                if ($this.is(':checked')) {
                    $eles.prop('checked', true);
                }
                else {
                    $eles.prop('checked', false);
                }
            }

            if ($this.attr('data-parent') !== undefined) {
                _this.find('li[data-type="category-cell"][data-value="' + $this.attr('data-parent') + '"]').trigger('click');
                freshParent($this);
            }

            var value = [];
            _this.find('input[type="checkbox"]:checked').each(function () {
                if (!$(this).prop('indeterminate')) {
                    value.push($(this).val());
                }
            });
            value = value.join(',');
            _this.data('value', value);
            _this.find('input[name="category"]').val(value);
        });

        this.html(createHtml(categoryList));
        this.append('<input type="hidden" name="category" check-type="required" required-message="请选择分类">');
    };
})(jQuery);
