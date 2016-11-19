/**
 * @file common.js
 * @author hehe, songxing
 */
 /*
  * 判断是否登录
  */
function fnIsLogin(success, error) {
    var cacheID = API_URL.is_login;
    var cache;

    if (!window.gCacheData) {
        window.gCacheData = {};
    }

    if (!window.gCacheData[cacheID]) {
        window.gCacheData[cacheID] = {};
    }

    if (typeof success !== 'function') {
        success = function () {};
    }

    if (typeof error !== 'function') {
        error = function () {};
    }

    cache = window.gCacheData[cacheID];

    // check for cached data
    if (cache.loading === false && cache.sourceData) { // take source from cache
        success(cache.sourceData);
    }
    else if (cache.loading === true) { // cache is loading, put callback in stack to be called later
        cache.callbacks.push(success);
        // also collecting error callbacks
        cache.error.push(error);
    }
    /* eslint no-else-return: [0] */
    else { // no cache yet, activate it
        cache.loading = true;
        cache.callbacks = [success];
        cache.error = [error];
        // ajaxOptions for source. Can be overwritten bt options.sourceOptions
        var ajaxOptions = {
            type: 'get',
            cache: false,
            url: cacheID,
            success: function (data) {
                var cache = window.gCacheData[API_URL.is_login];
                cache.loading = false;
                cache.sourceData = data;
                if (data.res === 0 && data.obj && data.obj.operation_list) {
                    if (data.obj.operation_list !== 'all') {
                        data.obj.operation_list = ',' + data.obj.operation_list + ',';
                    }
                }
                for (var i = 0; i < cache.callbacks.length; i++) {
                    cache.callbacks[i](data);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // 错误信息输出
                if (jqXHR.status === 401) {
                    if (location.href.indexOf('login.html') < 0) {
                        location.href = API_URL.login_url;
                    }
                }
                var cache = window.gCacheData[API_URL.is_login];
                cache.loading = false;
                for (var i = 0; i < cache.error.length; i++) {
                    cache.error[i].apply(null, arguments);
                }
            }
        };
        // loading sourceData from server
        $.ajax(ajaxOptions);
    }
}
// 判断是否登陆
fnIsLogin(function (data) {
    if  (data.res) { // 如果后端返回超时
        Helper.fnSetCookie('cur_url', location.href);
        location.href = API_URL.login_url; // 跳转到登录页
    }
    else {
        var accountType = data.obj.account_type;
        var kindType = data.obj.kindType;
        // 如果切换了角色,更新Cookie
        Helper.fnSetCookie('user_id', data.obj.user_id);
        Helper.fnSetCookie('user_name', data.obj.username);
        Helper.fnSetCookie('contact_name', data.obj.contact_name);
        Helper.fnSetCookie('account_type', accountType);
        var operationList = data.obj.operation_list;

        if (data.obj.kind === CONSTANT.kind_all) { // 临时处理媒体是自营和联盟
            data.obj.kind = CONSTANT.kind_self;
        }
        // 头部导航通知栏获取
        if (data.obj.kind === CONSTANT.kind_union) {
            if (operationList.indexOf(OPERATION_LIST.message) > -1 && accountType !== 'MANAGER'
                && !(accountType === 'TRAFFICKER' && data.obj.delivery_type === CONSTANT.delivery_type_game)) {
                // 头部导航-获取未读消息
                $.post(API_URL.notice_list, {status: 0}, function (data) {
                    $('#head').prepend($.tmpl('#tpl-notice', data));
                }, 'json').fail(function () {
                    $('#head').prepend($.tmpl('#tpl-notice', {res: -1}));
                });
            }
        }
        var deliveryType = Helper.fnGetCookie('delivery_type') && JSON.parse(Helper.fnGetCookie('delivery_type'))[data.obj.user_id];
        if (!deliveryType) {
            Helper.fnRemoveCookie('delivery_type');
        }
        // 左侧导航栏初始化
        $('#menu').html($.tmpl('#tpl-menu', $.extend({}, data, {delivery_type: deliveryType})));

        // 左侧导航栏选中
        var path = location.pathname.substr(0, location.pathname.lastIndexOf('/'));
        $($('#menu a[href*="' + path + '"]').parent()[0]).addClass('active');

        // 媒体商模式切换
        if (accountType === 'TRAFFICKER' && kindType && kindType === CONSTANT.kind_all) {
            $('#switch-type').html($.tmpl('#tpl-switch', data.obj));
        }
        if (accountType === 'MANAGER' && (operationList === 'all' || operationList.indexOf(OPERATION_LIST.manager_game) > -1)) {
            $('#switch-type').html($.tmpl('#tpl-switch-game', {delivery_type: deliveryType}));
        }
        // 获取销售顾问
        var sSalesUrl;
        if (accountType === 'ADVERTISER') {
            sSalesUrl = API_URL.sales;
        }
        else if (accountType === 'TRAFFICKER') {
            sSalesUrl = API_URL.trafficker_common_sales;
        }
        else if (accountType === 'BROKER') {
            sSalesUrl = API_URL.broker_common_sales;
        }
        if (sSalesUrl) {
            $.post(sSalesUrl, {user_id: Helper.fnGetCookie('user_id')}, function (data) {
                $('#sales-con').html($.tmpl('#tpl-sales', data));
            });
        }
        // 头部导航栏余额获取
        if (operationList === 'all'
            || (accountType === 'TRAFFICKER' && data.obj.kind === CONSTANT.kind_self && operationList.indexOf(OPERATION_LIST.trafficker_self_balance) > -1)
            || (accountType === 'TRAFFICKER' && data.obj.kind === CONSTANT.kind_union && operationList.indexOf(OPERATION_LIST.trafficker_balance) > -1 && data.obj.delivery_type & CONSTANT.delivery_type_app)
            || (accountType !== 'TRAFFICKER' && operationList.indexOf(OPERATION_LIST.balance) > -1)) {
            var sBalanceUrl;
            var sForwardUrl;
            var houseAdFolder = data.obj.kind === CONSTANT.kind_self ? '/housead' : '';
            if (accountType === 'ADVERTISER') {
                sBalanceUrl = API_URL.balance_value;
                sForwardUrl = BOS.DOCUMENT_URI + houseAdFolder + '/advertiser/balance/';
            }
            else if (accountType === 'TRAFFICKER') {
                sBalanceUrl = API_URL.trafficker_common_balance_value;
                sForwardUrl = BOS.DOCUMENT_URI + houseAdFolder + '/trafficker/balance/';
            }
            else if (accountType === 'BROKER') {
                sBalanceUrl = API_URL.broker_common_balance_value;
                sForwardUrl = BOS.DOCUMENT_URI + houseAdFolder + '/broker/balance/';
            }
            else if (accountType === 'MANAGER' && !(deliveryType && deliveryType === CONSTANT.delivery_type_game)) {
                sBalanceUrl = API_URL.manager_common_balance_value;
                sForwardUrl = BOS.MGMT_URI + '/balancelog'; // 直接跳转到旧平台财务收入
            }
            if (sBalanceUrl) {
                $('#head').append($.tmpl('#tpl-top-balance', data));
                $.get(sBalanceUrl, function (data) {
                    $('#balance').html(data.obj.balance);
                });
            }
            $('#balance-wrapper').click(function (event) {
                /* Act on the event */
                location.href = sForwardUrl;
            });
        }

        // 初始化头部用户信息
        $('#head').append($.tmpl('#tpl-user-info', $.extend(data.obj, {delivery_type: deliveryType})));

        if (accountType === 'TRAFFICKER' && operationList.indexOf(OPERATION_LIST.trafficker_campaign) > -1) {
            $.get(API_URL.trafficker_common_campaign_pending_audit, function (data) {
                var num = data.obj.count ? data.obj.count : 0;
                if (num > 0) {
                    $('#menu [data-type="trafficker_campaign"]').append('<span class="badge left" style="">' + num + '</span>');
                }
            });
        }
        else if (accountType === 'MANAGER') {
            if (operationList === 'all' || operationList.indexOf(OPERATION_LIST.manager_package) > -1) {
                $.get(API_URL.manager_common_package_not_latest, function (data) {
                    var num = data.obj.count ? data.obj.count : 0;
                    if (num > 0) {
                        $('#menu [data-type="manager_package"] .badge').html(num);
                    }
                });
            }
            if (operationList === 'all' || operationList.indexOf(OPERATION_LIST.manager_campaign) > -1) {
                $.get(API_URL.manager_common_campaign_pending_audit, function (data) {
                    var num = data.obj.camcnt ? data.obj.camcnt : 0;
                    num += data.obj.meters_count ? data.obj.meters_count : 0;
                    if (num > 0) {
                        $('#menu [data-type="manager-campaign"] .badge').html(num);
                    }
                });
            }
        }
        if (accountType === 'TRAFFICKER' && operationList.indexOf(OPERATION_LIST.trafficker_self_balance) > -1) {
            $.get(API_URL.trafficker_common_balance_pending_audit, function (data) {
                var cNum = data.obj.recharge_count ? data.obj.recharge_count : 0;
                var mNum = data.obj.gift_count ? data.obj.gift_count : 0;
                var num = cNum + mNum;
                if (num > 0) {
                    $('#menu [data-type="trafficker-self-balance"] .badge').html(num);
                }
            });
            $.get(API_URL.trafficker_common_campaign_pending_audit, function (data) {
                var num = data.obj.count ? data.obj.count : 0;
                if (num > 0) {
                    $('#menu [data-type="trafficker_self_campaign"] .badge').html(num);
                }
            });
        }
    }
});
// 管理面板 主题配置
(function ($) {
    fnLoadThemeCss();
    // 动态加载样式
    function fnLoadThemeCss() {
        var host = window.location.host;
        var cssName = 'default.css';
        for (var i in BOS.THEME) {
            if (BOS.THEME.hasOwnProperty(i) && host.match(BOS.THEME[i].name)) {
                cssName = BOS.THEME[i].css + '.css';
                break;
            }
        }
        $('<link href="' + BOS.DOCUMENT_URI + '/css/theme/' + cssName + '" rel="stylesheet">').appendTo('head');
    }
})(jQuery);
$(function () {
    // 退出
    $('#head').delegate('.js-logout', 'click', function () {
        $.post(API_URL.logout, function (data) {
            if (0 === data.res) {
                location.href = API_URL.login_url;
            }
        });
    });
    $('#switch-type').delegate('.switch', 'click', function () { // 媒体商切换模式切换
        Helper.load_ajax();
        var kind = $(this).find('.swithlabel').data('type');
        $.post(API_URL.kind_change, {kind: kind}, function (data) {
            Helper.close_ajax();
            if (0 === data.res && data.obj) {
                var sNewurl = '';
                if (+data.obj.kind === CONSTANT.kind_union) {
                    sNewurl = BOS.DOCUMENT_URI + '/trafficker';
                }
                else {
                    sNewurl = BOS.DOCUMENT_URI + '/housead/trafficker';
                }
                location.href = sNewurl;
            }
            else {
                Helper.fnPrompt(data.msg);
            }
        });
    });
    $('#switch-type').delegate('.switch-game', 'click', function () {
        var deliveryType = $(this).find('.swithlabel').data('type');
        // 添加cookie
        var deliveryTypeCookie = {};
        deliveryTypeCookie[Helper.fnGetCookie('user_id')] = deliveryType;
        Helper.fnSetCookie('delivery_type', JSON.stringify(deliveryTypeCookie));
        if (+deliveryType === CONSTANT.delivery_type_game) {
            location.href = BOS.DOCUMENT_URI + '/manager/stat/game.html';
        }
        else {
            location.href = BOS.DOCUMENT_URI + '/manager';
        }
    });
});
