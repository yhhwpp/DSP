/**
 * @file login.js
 * @author hehe
 */

/* globals domain */
$(function () {
    $.ajaxSetup({
        cache: false
    });
    BOS.HEAD = {
        'default': {
            title: 'BiddingOS',
            keywords: '原生广告 程序化交易 CPD(cost per download)实时竞价 投放算法与收入优化 准实时数据报表 安全可靠的推广资源接入',
            description: '原生广告 程序化交易 CPD(cost per download)实时竞价 投放算法与收入优化 准实时数据报表 安全可靠的推广资源接入',
            js: 1 // 1:表示首页需要引入index.js。
        },
        'pinxiaotong': {
            title: '品效通',
            keywords: '原生广告 程序化交易 CPD(cost per download)实时竞价 投放算法与收入优化 准实时数据报表 安全可靠的推广资源接入',
            description: '原生广告 程序化交易 CPD(cost per download)实时竞价 投放算法与收入优化 准实时数据报表 安全可靠的推广资源接入',
            js: 1
        },
        'sxt': {
            title: '胜效通官网',
            keywords: '原生广告 程序化交易 CPD(cost per download)实时竞价 投放算法与收入优化 准实时数据报表 安全可靠的推广资源接入',
            description: '胜效通-专注于互动媒体的移动互联平台，融合移动互联网的多项业务，在融合营销，数据积累，精准技术等方面有深厚的积累与沉淀',
            js: 1
        },
        '430569': {
            title: '安尔发'
        },
        'mt': {
            title: '美图'
        },
        'tbt': {
            title: '同步推'
        },
        '91': {
            title: '91iOS'
        }
    };
    /* eslint no-undef: [0]*/
    BosLogin = {
        _fnInit: function () {
            $('.loginforget a').attr('href', BOS.DOCUMENT_URI + '/site/remind.html');
            this._fnCheckLogin();
            this._fnInitListeners();
        },
        _fnChangeckcode: function () {
            $('#img_num').prop({
                src: API_URL.captcha + '?t=' + new Date().getTime()
            });
        },
        _fnInitListeners: function () {
            var that = this;
            $('.novis').on('click', function () {
                that._fnChangeckcode();
            });
            $('.loginbt').on('click', function () {
                that._fnlogin();
            });
            $('.login form').bind('keydown', function (e) {
                var ev = e || event;
                if (ev.keyCode === 13) {
                    that._fnlogin();
                }
            });
        },
        _fnlogin: function () {
            var that = this;
            var username = $('input[name="username"]').val();
            var password = $('input[name="password"]').val();
            var captcha = $('input[name="verificationCode"]').val();
            var $input = $('.login input[type="text"]');
            var $loginbt = $('.loginbt');
            var bPass = 1;
            $.ajax({
                type: 'post',
                url: API_URL.login,
                data: {
                    username: username,
                    password: password,
                    captcha: captcha
                },
                success: function (data) {
                    Helper.fnRemoveCookie('delivery_type');
                    if (0 === data.res) {
                        if (Helper.fnGetCookie('user_id') !== data.obj.user_id) {
                            Helper.fnSetCookie('user_id', data.obj.user_id); // 如果切换账户,更新账户的cookie
                            Helper.fnGetCookie('cur_url') && Helper.fnRemoveCookie('cur_url');
                            if (data.obj.account_type === 'TRAFFICKER' && data.obj.delivery_type === CONSTANT.delivery_type_game) {
                                location.href = BOS.DOCUMENT_URI + '/trafficker/stat/game.html'; // 默认游戏报表
                            }
                            else {
                                location.href = BOS.DOCUMENT_URI + ((data.obj.kind && data.obj.kind === CONSTANT.kind_union) ? '' : '/housead') + '/' + data.obj.account_type.toLowerCase() + '/';
                            }
                        }
                        else {
                            location.href = Helper.fnGetCookie('cur_url') ? Helper.fnGetCookie('cur_url') : BOS.DOCUMENT_URI + ((data.obj.kind && data.obj.kind === CONSTANT.kind_union) ? '' : '/housead') + '/' + data.obj.account_type.toLowerCase() + '/'; // 如果之前登录过，则条跳转到之前页面
                        }
                    }
                    else {
                        $('.login-tips').text(data.msg);
                        $loginbt.val('登录').removeAttr('disabled');
                        $input.removeAttr('disabled');
                        that._fnChangeckcode();
                    }
                },
                beforeSend: function () {
                    $input.each(function (index, el) {
                        if (Helper.fnIsEmpty($(this).val())) {
                            $('.login-tips').text($(this).attr('placeholder'));
                            bPass = 1;
                            return !1;
                        }
                        bPass = 0;
                    });
                    if (bPass) {
                        return !1;
                    }
                    $loginbt.val('登录中..').prop('disabled', true);
                    $input.prop('disabled', true);
                }
            });
            return false;
        },
        _fnCheckLogin: function () {
            var that = this;
            $.ajax({
                type: 'get',
                url: API_URL.is_login,
                success: function (data) {
                    0 === data.res && (location.href = BOS.DOCUMENT_URI + ((data.obj.kind && data.obj.kind === CONSTANT.kind_union) ? '' : '/housead') + '/' + data.obj.account_type.toLowerCase() + '/');
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (XMLHttpRequest.status === 401) {
                        that._fnChangeckcode();
                    }
                }
            });
        }
    };
    // 动态载入html登录模板
    var hostname = window.location.host.replace(/www.|.biddingos|.com/g, '');
    hostname = hostname.match(/pinxiaotong|sxt|430569|mt|tbt|e.91/) ? hostname : 'default';
    var domain_url = domain + BOS.DOCUMENT_URI + '/site/domain/' + hostname;
    var login_template = domain_url + '/index.html';
    var title = BOS.HEAD[hostname].title || '';
    var keywords = BOS.HEAD[hostname].keywords || '';
    var description = BOS.HEAD[hostname].description || '';
    var favicon_url = domain_url + '/images/favicon.ico';
    var css_url = domain_url + '/images/index.css?v=20160511';
    var head_html = '<title>' + title + '</title>' + '<meta http-equiv="X-UA-Compatible" content="IE=Edge">' + '<meta name="viewport" content="width=device-width, initial-scale=1">' + '<meta name="keywords" content="' + keywords + '">' + '<meta name="description" content="' + description + '">' + '<link rel="shortcut icon" href="' + favicon_url + '">' + '<link rel="stylesheet" type="text/css" href="' + css_url + '">';
    $(head_html).appendTo('head');
    $('#container').load(login_template, function () {
        var js_html = BOS.HEAD[hostname].js ? '<script type="text/javascript" src=' + domain_url + '/images/index.js?v=20160511' + '></script>' : '';
        $(js_html).appendTo('body');
        $('img').each(function (index, element) {
            if ($(this)[0].id !== 'img_num') {
                var n_src = domain_url + '/images/' + $(this).data('url');
                $(this).attr('src', n_src);
            }
        });
        BosLogin._fnInit();
    });
});
