/**
 * @file campaign-index.js
 * @author xiaokl
 */
// 获取template
function getHandleTpl(full) {
    if (full.status === CONSTANT.CAMPAIGN_STATUS_APPROVE_WAITING) { // 待审核
        return '-';
    }
    else if (full.status === CONSTANT.CAMPAIGN_STATUS_STOP) { // 停止投放
        return '<a class="btn btn-default" target="_blank" href="../stat/index.html#campaignid=' + full.campaignid + '&name=' + escape(full.appinfos_app_name) + '">报表</a>';
    }
    else if (full.status === CONSTANT.CAMPAIGN_STATUS_DELIVERY) { // 投放中
        return '<button class="btn btn-default js-change-status" data-value="1">暂停</button>'
            + '<button class="btn btn-default js-modify">修改</button>'
            + '<a class="btn btn-default" target="_blank" href="../stat/index.html#campaignid=' + full.campaignid + '&name=' + escape(full.appinfos_app_name) + '">报表</a>';
    }
    else if (full.status === CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT) { // 未通过审核
        return '<button class="btn btn-default js-modify">修改</button>';
    }
    else if (full.status === CONSTANT.CAMPAIGN_STATUS_PAUSE) { // 已暂停
        if (full.pause_status === CONSTANT.CAMPAIGN_PAUSE_STATUS_ADVERTISER) { // 广告主暂停
            return '<button class="btn btn-default js-change-status" data-value="0">继续</button>'
                + '<button class="btn btn-default js-modify">修改</button>'
                + '<a class="btn btn-default" target="_blank" href="../stat/index.html#campaignid=' + full.campaignid + '&name=' + escape(full.appinfos_app_name) + '">报表</a>';
        }
        else if (full.pause_status === CONSTANT.CAMPAIGN_PAUSE_STATUS_MANAGER) { // 运营暂停
            return '<a class="btn btn-default" target="_blank" href="../stat/index.html#campaignid=' + full.campaignid + '&name=' + escape(full.appinfos_app_name) + '">报表</a>';
        }
        return '<button class="btn btn-default js-modify">修改</button><a class="btn btn-default" target="_blank" href="../stat/index.html#campaignid=' + full.campaignid + '&name=' + escape(full.appinfos_app_name) + '">报表</a>';
    }
}
(function ($) {
    'use strict';

    $.fn.campaignmodel = function () {};

    var CampaignModel = function (data) {
        this.data = $.extend({}, CampaignModel.defaults, data || {});
    };

    $.fn.basemodelutils.inherit(CampaignModel, $.fn.basemodel.abstractmodel);

    $.extend(CampaignModel.prototype, {
        setModel: function (formObj) {
            var inputObj;
            for (var key in CampaignModel.defaults) {
                inputObj = formObj.find('[data-name=' + key + ']');
                if (inputObj && inputObj.length > 0) {
                    this.setData(key, inputObj.val());
                }
                inputObj = null;
            }
        }
    });

    CampaignModel.defaults = {
        revenue_type: CONSTANT.revenue_type_cpd,
        campaignid: 0, // 推广计划id
        appinfos_app_name: '', // 应用名称
        products_icon: '', // 应用图标
        revenue: '', // 出价
        day_limit: '', // 日限额
        total_limit: '', // 总限额
        keywords: [], // 关键字
        zones: [], // 广告位加价
        link_url: '' // 跟踪链接
    };

    $.extend($.fn.campaignmodel, {Model: CampaignModel});

}(window.jQuery));
var CampaignList = (function ($) {
    var CampaignList = function () {
        this.revenueTypes = [];
        this.moneyLimits = null;
        this.zones = [];
        this.keywords = [];
        this.appList = [];
        this.appListStr = null;
        this.platformRes = null;
        this.filter = {
            platform: ''
        };
        this.oTitle = {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'appinfos_app_name',
                    title: '广告名称',
                    render: function (data, type, full) {
                        if (full.appinfos_app_show_icon) {
                            return '<img src="' + full.appinfos_app_show_icon + '" width="40" height="40" />' + data;
                        }
                        return data;
                    }
                },
                {
                    field: 'platform',
                    title: '平台',
                    render: function (data, type, full) {
                        return LANG.platform_group[data];
                    }
                },
                {
                    field: 'revenue_type',
                    title: '计费类型',
                    render: function (data, type, full) {
                        return LANG.revenue_type[data];
                    }
                },
                {
                    field: 'revenue',
                    title: '出价(元)',
                    render: function (data, type, full) {
                        if (full.revenue_type === CONSTANT.revenue_type_cps) {
                            return '-';
                        }
                        return parseFloat(data).toFixed(CONSTANT.revenue_type_conf[full.revenue_type].decimal);
                    }
                },
                {
                    field: 'keyword_price_up_count',
                    title: '关键字加价',
                    render: function (data, type, full) {
                        if (full.revenue_type === CONSTANT.revenue_type_cps || full.revenue_type === CONSTANT.revenue_type_cpa) {
                            return '-';
                        }
                        if (full.ad_type === CONSTANT.ad_type_app_market) {
                            return (data > 0 ? '<span class="js-view-keyword text-center center-block text-warning cursor" data-toggle="popover" data-trigger="manual" title="">查看</span>' : '-');
                        }
                        return '-';
                    }
                },
                {
                    field: 'zone_price_up_count',
                    title: '广告位加价',
                    render: function (data, type, full) {
                        if (full.revenue_type === CONSTANT.revenue_type_cps || full.revenue_type === CONSTANT.revenue_type_cpa) {
                            return '-';
                        }
                        return (data > 0 ? '<span class="js-view-zone text-center center-block text-warning cursor" role="button" data-toggle="popover" data-trigger="manual" title="">查看</span>' : '-');
                    }
                },
                {
                    field: 'day_limit',
                    title: '日预算(元)',
                    render: function (data, type, full) {
                        if (full.revenue_type === CONSTANT.revenue_type_cps || full.revenue_type === CONSTANT.revenue_type_cpa) {
                            return '-';
                        }
                        return Helper.fnFormatMoney(data, 0);
                    }
                },
                {
                    field: 'total_limit',
                    title: '总预算(元)',
                    render: function (data, type, full) {
                        if (full.revenue_type === CONSTANT.revenue_type_cps || full.revenue_type === CONSTANT.revenue_type_cpa) {
                            return '-';
                        }
                        if (parseInt(data, 10) === 0) {
                            return '不限';
                        }
                        return Helper.fnFormatMoney(data, 0);
                    }
                },
                {
                    field: 'status',
                    title: '状态',
                    render: function (data, type, full) {
                        if (data === CONSTANT.CAMPAIGN_STATUS_DELIVERY || data === CONSTANT.CAMPAIGN_STATUS_STOP
                                || data === CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT || data === CONSTANT.CAMPAIGN_STATUS_APPROVE_WAITING) {
                            if (data === CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT) { // 审核未通过
                                return Helper.fnGetPopoverOrTooltip({
                                    'data-toggle': 'tooltip',
                                    'data-trigger': 'hover',
                                    'data-placement': 'right',
                                    'title': full.approve_comment
                                }, (LANG.MANAGER_CAMPAIGN_STATUS[data]) + '&nbsp;<i class="fa fa-exclamation-circle text-warning"></i>').prop('outerHTML');
                            }
                            return LANG.MANAGER_CAMPAIGN_STATUS[data];
                        }
                        // 根据pause_status获取对应的显示
                        return LANG.CAMPAIGN_PAUSE_STATUS[full.pause_status];
                    }
                },
                {
                    field: 'approve_time',
                    title: '最近审核',
                    render: function (data, type, full) {
                        if (full.approve_user === '') {
                            return '-';
                        }
                        return '<div>' + data + '</div><div>' + full.approve_user + '</div>';
                    }
                },
                {
                    field: 'campaignid',
                    title: '操作',
                    render: function (data, type, full) {
                        return getHandleTpl(full);
                    }
                }
            ]
        };
    };

    CampaignList.prototype = {
        _fnPost: function (url, params, callback) {
            $.post(url, params).then(
                function (json) {
                    Helper.close_ajax();
                    if (json && json.res === 0) {
                        callback(json);
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                },
                function () {
                    Helper.close_ajax();
                    Helper.fnPrompt(MSG.server_error);
                }
            );
        },
        _fnChangeBtnStatus: function () { // 修改按钮状态
            var changeObj = $('[data-change=true]');
            if (changeObj && changeObj.length > 0) {
                $('#js-add-btn').prop('disabled', false);
            }
            else {
                $('#js-add-btn').prop('disabled', true);
            }
        },
        _fnListener: function () { // 监听表单数据的变化
            var _this = this;
            $('#js-campaign-modal').delegate('input[name=revenue], input[name=day_limit], input[name=total_limit], #js-zone-table input[name=price_up], .js-keyword-content input[name=price_up][data-listener=1]', 'change', function () {
                if ($('#js-campaign-modal .js-keyword-content').attr('data-change')) {
                    return;
                }
                if ($(this).val() !== '') {
                    if (Number($(this).val()) !== Number($(this).attr('data-original'))) { // 设置值改变状态
                        $(this).attr('data-change', true);
                    }
                    else {
                        $(this).attr('data-change', false);
                    }
                }
                // 修改按钮状态
                _this._fnChangeBtnStatus();
            });
            $('#js-campaign-modal').delegate('input[name=link_url]', 'change', function () {
                if ($('#js-campaign-modal .js-keyword-content').attr('data-change')) {
                    return;
                }
                if ($(this).val() !== $(this).attr('data-original')) {
                    $(this).attr('data-change', true);
                }
                else {
                    $(this).attr('data-change', false);
                }
                // 修改按钮状态
                _this._fnChangeBtnStatus();
            });
            // 监听关键字状态
            $('#js-campaign-modal').delegate('.js-keyword-content input[name=keyword]', 'change', function () {
                if ($('#js-campaign-modal .js-keyword-content').attr('data-change')) {
                    return;
                }
                // 获取原关键字表单数据
                if ($(this).val() !== '') {
                    $(this).attr('data-change', true);
                }
                else {
                    $(this).attr('data-change', false);
                }
                _this._fnChangeBtnStatus();
            });
        },
        _fnGetRevenueTypes: function (callback) { // 获取广告主计费类型
            var _this = this;
            if (!(_this.revenueTypes && _this.revenueTypes.length > 0)) {
                $.get(API_URL.advertiser_campaign_revenue_type, function (revenueTypeRes) {
                    if (revenueTypeRes && revenueTypeRes.res === 0 && revenueTypeRes.obj && revenueTypeRes.obj.revenue_type) {
                        _this.revenueTypes = revenueTypeRes.obj.revenue_type;
                        if (revenueTypeRes.obj.revenue_type.length === 0) {
                            Helper.fnPrompt('广告主没有有效的计费类型');
                            return;
                        }
                        var flag = false;
                        CONSTANT.housead_revenue_type_ary.forEach(function (item, index) {
                            if ($.inArray(item, revenueTypeRes.obj.revenue_type) > -1) {
                                flag = true;
                            }
                        });
                        if (!flag) {
                            Helper.fnPrompt('广告主没有有效的计费类型');
                            return;
                        }
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                    else {
                        Helper.fnPrompt(revenueTypeRes.msg);
                    }
                });
            }
            else {
                if (typeof callback === 'function') {
                    callback();
                }
            }
        },
        _fnGetMoneyLimits: function (callback) { // 获取money limit
            var _this = this;
            if  (!this.moneyLimits) {
                $.get(API_URL.campaign_money_limit, function (moneyLimitsRes) {
                    if (moneyLimitsRes && moneyLimitsRes.res === 0 && moneyLimitsRes.list) {
                        _this.moneyLimits = moneyLimitsRes.list;
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                    else {
                        Helper.fnPrompt(moneyLimitsRes.msg);
                    }
                });
            }
            else {
                if (typeof callback === 'function') {
                    callback();
                }
            }
        },
        _fnInitRevenueConf: function (_revenueObj, revenueType) { // 根据计费类型修改出价配置
            _revenueObj.find('input[name=revenue]').attr({
                'check-type': 'required rangen decimaln stepn',
                'min': this.moneyLimits[revenueType].revenue_min,
                'max': this.moneyLimits[revenueType].revenue_max,
                'step': this.moneyLimits[revenueType].revenue_step,
                'decimal': CONSTANT.revenue_type_conf[revenueType].decimal,
                'required-message': '请输入' + LANG.revenue_type[revenueType] + '出价',
                'rangen-message': '出价大于等于' + this.moneyLimits[revenueType].revenue_min + '小于等于' + this.moneyLimits[revenueType].revenue_max,
                'decimaln-message': '出价保留' + CONSTANT.revenue_type_conf[revenueType].decimal + '位小数点',
                'stepn-message': '最小幅度必须大于等于' + this.moneyLimits[revenueType].revenue_step
            });
            _revenueObj.find('.tips').html('不低于' + this.moneyLimits[revenueType].revenue_min + '元，最小加' + this.moneyLimits[revenueType].revenue_step + '元');
        },
        _fnGetPlatform: function (callback) {
            var _this = this;
            if (!_this.platformRes) {
                $.get(API_URL.trafficker_common_platform, function (response) {
                    if (response && response.res === 0) {
                        _this.platformRes = response;
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                });
            }
            else {
                if (typeof callback === 'function') {
                    callback();
                }
            }
        },
        _fnChangePlaceholder: function (v) {
            var sTips = '请输入应用的名称';
            if (+v === CONSTANT.platform_type_iphone_copyright) {
                sTips = '请输入应用的appleID';
            }
            else if (+v === CONSTANT.platform_type_iphone_jailbreak) {
                sTips = '请输入应用的包名';
            }
            $('input[name=appinfos_app_name]').attr('placeholder', sTips);
        },
        _fnInitHandle: function () {
            var _this = this;
            // 添加表单验证method
            $.fn.validation.addMethod('rangen', function (value) {
                if (isNaN(value)) {
                    return true;
                }
                var _index = value.indexOf('.');
                if (_index > 0 && value.substring(_index).length === 1) {
                    return true;
                }
                var _max = Number($(this).attr('max'));
                var _min = Number($(this).attr('min'));
                if (Number(value) < _min || Number(value) > _max) {
                    return true;
                }
                return false;
            }, '数值不能超过最大值');
            $.fn.validation.addMethod('decimaln', function (value) {
                var _decimal = Number($(this).attr('decimal'));
                var _index = value.indexOf('.');
                if (_index === -1) {
                    return false;
                }
                var _result = value.substring(value.indexOf('.') + 1);
                if (_result.length > _decimal) {
                    return true;
                }
                return false;
            }, '小数点不正确');
            $.fn.validation.addMethod('stepn', function (value) {
                var _orignal = $(this).attr('data-original') ? Number($(this).attr('data-original')) : 0;
                var _decimal = $(this).attr('decimal') ? $(this).attr('decimal') : 0;
                var _step = Number($(this).attr('step'));
                if (_orignal === Number(value)) {
                    return false;
                }
                if (Math.abs(_orignal - Number(value)).toFixed(_decimal) < _step) {
                    return true;
                }
                return false;
            }, '最小幅度');
            $('#js-campaign-table').delegates({
                '.js-view-keyword': function () { // 查看关键字
                    // 根据campaignid获取关键字列表
                    var _self = $(this);
                    var oData = dataTable.row(_self.parents('tr')[0]).data();
                    _this._fnPost(API_URL.keywords_list, {campaignid: oData.campaignid}, function (json) {
                        // 修改popover框内容
                        if (json.list && json.list.length > 0) {
                            _self.attr({
                                'data-content': doT.template($('#tpl-keyword').text())({keywords: json.list, model: oData}),
                                'data-html': true
                            });
                            _self.popover('show');
                            $('#js-keyword .floater-close').click(function () {
                                _self.popover('hide');
                            });
                        }
                    });
                },
                '.js-view-zone': function () { // 查看广告位加价
                    // 根据campaignid获取广告位加价列表
                    var _self = $(this);
                    var oData = dataTable.row(_self.parents('tr')[0]).data();
                    _this._fnPost(API_URL.advertiser_zone_index, {campaignid: oData.campaignid}, function (json) {
                        // 修改popover框内容
                        if (json.list && json.list.length > 0) {
                            _self.attr({
                                'data-content': doT.template($('#tpl-zone-price').text())({zones: json.list, model: oData}),
                                'data-html': true
                            });
                            _self.popover('show');
                            $('#js-zone-price .floater-close').click(function () {
                                _self.popover('hide');
                            });
                        }
                    });
                },
                '.js-change-status': function () { // 修改状态
                    Helper.load_ajax();
                    _this._fnPost(API_URL.advertiser_campaign_update, {
                        campaignid: dataTable.row($(this).parents('tr')[0]).data().campaignid,
                        status: $(this).attr('data-value')
                    }, function (json) {
                        dataTable.reload();
                    });
                },
                '.js-modify': function () { // 修改素材
                    // 根据campaignid获取view
                    var campaignid = dataTable.row($(this).parents('tr')[0]).data().campaignid;
                    _this._fnPost(API_URL.advertiser_campaign_self_view, {campaignid: campaignid}, function (result) {
                        _this._fnGetRevenueTypes(function () {
                            // 获取money_limit限制
                            _this._fnGetMoneyLimits(function () {
                                $('#js-campaign-modal .modal-body').html(doT.template($('#tpl-campaign').text())({isEdit: true}));
                                $('#js-campaign-modal').modal({backdrop: false}).on('hidden.bs.modal', function () {
                                    // 隐藏js-app-list列表
                                    $('#js-app-list').hide();
                                });
                                $('#js-app-name').hide();
                                // 直接显示appinfos
                                var campaignModel = new $.fn.campaignmodel.Model(result.obj).data;
                                $('#js-appinfos .bd').html(doT.template($('#tpl-appinfos').text())({
                                    model: campaignModel,
                                    moneyLimits: _this.moneyLimits,
                                    isEdit: true,
                                    revenueTypes: _this.revenueTypes,
                                    platform: campaignModel.platform
                                }));
                                _this.keywords = campaignModel.keywords;
                                $('input[name=app_list]').val(JSON.stringify(result.obj));
                                $('input[name=campaignid]').val(campaignid);
                                $('#js-appinfos').show();
                                /* eslint new-cap: [2, {"capIsNewExceptions": ["DataTable"]}] */
                                $('#js-zone-table').DataTable({searching: false, serverSide: false, ordering: false, info: false, pageLength: 5, paging: true, lengthChange: false});
                                $('#js-appinfos').validation();
                                $('.fancybox').fancybox();
                                // 开启监听机制
                                _this._fnListener();
                            });
                        });
                    });
                }
            });
            $(document).click(function (e) {
                if ($('.js-view-zone').is(e.target) || $('.js-view-keyword').is(e.target)) {
                    $('[data-toggle="popover"]').each(function () {
                        if (!$(this).is(e.target)) {
                            $(this).popover('hide');
                        }
                    });
                    return;
                }
                var con = $('.zones-up');
                if (!con.is(e.target) && con.has(e.target).length === 0) {
                    $('[data-toggle="popover"]').popover('hide');
                }
            });
            $('#js-add-campaign').click(function () {
                /* eslint max-nested-callbacks: [0]*/
                _this._fnGetRevenueTypes(function () {
                    _this._fnGetMoneyLimits(function () { // 获取money_limit限制
                        // 获取广告位加价列表
                        _this._fnPost(API_URL.advertiser_zone_index, {campaignid: 0}, function (zonesRes) {
                            _this.zones = zonesRes.list ? zonesRes.list : [];
                            _this._fnGetPlatform(function () {
                                $('#js-campaign-modal .modal-body').html(doT.template($('#tpl-campaign').text())({}));
                                $('#js-app-platform').html($.tmpl('#tpl-platform', _this.platformRes));
                                _this._fnChangePlaceholder($('#js-app-platform').val());
                                $('#js-campaign-modal').modal({backdrop: false}).on('hidden.bs.modal', function () {
                                    // 隐藏js-app-list列表
                                    $('#js-app-list').html('').hide();
                                });
                            });
                        });
                    });
                });
            });
            var _fnGetAppList =  function () {
                var $appName = $('input[name=appinfos_app_name]');
                var $appPlatform = $('#js-app-platform');
                if ($appName.val() && $appName.val() !== '' && $appName.val().trim() !== '') {
                    // 请求应用列表接口
                    _this._fnPost(API_URL.advertiser_campaign_app_list, {wd: $appName.val(), platform: $appPlatform.val()}, function (json) {
                        json.platform = $appPlatform.val();
                        if (json.list && json.list.length > 0) {
                            _this.appList = json.list;
                            $('#js-app-list').html(doT.template($('#tpl-app-list').text())(json)).show();
                        }
                        else {
                            _this.appList = [];
                            $('input[name=appinfos_app_name]').focus();
                            $('#js-app-list').html(doT.template($('#tpl-app-list').text())(json)).show();
                        }
                    });
                }
            };
            $('#js-campaign-modal').delegate('input[name=appinfos_app_name]', 'keyup', function (e) { // 输入应用名称，请求应用列表接口
                _fnGetAppList();
            });
            $('#js-campaign-modal').delegate('#js-app-platform', 'change', function (e) { // 输入应用名称，请求应用列表接口
                _fnGetAppList();
            });

            $('#js-campaign-modal').delegate('#js-zone-table input[name=price_up]', 'blur', function () {
                if ($(this).val() === '') {
                    $(this).val(0);
                }
            });
            $('#js-campaign-modal').delegate('.js-keyword-content input[name=keyword]', 'blur', function () { // 不能添加重复关键字
                var _keywordObj = $('.js-keyword-content input[name=keyword]');
                var _keyword = $(this).val();
                if (_keyword !== '') { // 查看关键字是否重复
                    if ($.inArray(_keyword, window.sensitiveWord) > -1) {
                        $(this).next('.error-msg').remove();
                        $(this).after('<span class="help-block error-msg text-danger">关键字包含敏感词');
                        return;
                    }
                    var repeatN = 0;
                    _keywordObj.each(function () {
                        if ($(this).val() === _keyword) {
                            repeatN++;
                        }
                    });
                    if (repeatN > 1) {
                        $(this).next('.error-msg').remove();
                        $(this).after('<span class="help-block error-msg text-danger">关键字不能重复');
                        return;
                    }
                }
                $(this).next('.error-msg').remove();
            });
            $('#js-campaign-modal').delegate('.js-keyword-content input[name=price_up]', 'blur', function () {
                var _min = Number($(this).attr('min'));
                var _max = Number($(this).attr('max'));
                var errorMsg = '<span class="help-block error-msg text-danger">加价大于等于' + _min + '小于等于' + _max + ',保留一位小数点';
                if ($(this).val() === '' || isNaN($(this).val())) {
                    // 显示错误信息
                    $(this).next('.error-msg').remove();
                    $(this).after(errorMsg);
                    return;
                }
                var _index = $(this).val().indexOf('.');
                if (_index > 0 && $(this).val().substring(_index + 1).length > 1) {
                    $(this).next('.error-msg').remove();
                    $(this).after(errorMsg);
                    return;
                }
                if (Number($(this).val()) < _min || Number($(this).val()) > _max) {
                    $(this).next('.error-msg').remove();
                    $(this).after(errorMsg);
                    return;
                }
                $(this).next('.error-msg').remove();
            });
            $('#js-campaign-modal').delegates({
                '#js-app-list li': function () { // 点击列表展示，应用数据
                    // 显示应用详情，隐藏应用名称
                    $('#js-app-name').hide();
                    $('#js-appinfos').show();
                    _this.appListStr = _this.appList[$(this).attr('data-index')];
                    // 隐藏js-app-list列表
                    $('#js-app-list').hide();
                    if (_this.appListStr) {
                        var campaignModel = new $.fn.campaignmodel.Model(_this.appListStr).data;
                        var _resultZones = [];
                        var _platform = $('#js-app-platform').val();
                        if (_this.zones && _this.zones.length > 0) {
                            _this.zones.forEach(function (item, index) {
                                if (+item.platform === +_platform) {
                                    _resultZones.push(item);
                                }
                            });
                        }
                        campaignModel = $.extend(campaignModel, {zones: _resultZones});
                        campaignModel.revenue_type = _this.revenueTypes[0];
                        $('#js-appinfos .bd').html(doT.template($('#tpl-appinfos').text())({
                            model: campaignModel,
                            moneyLimits: _this.moneyLimits,
                            revenueTypes: _this.revenueTypes,
                            platform: _platform
                        }));
                        // 设置数据值
                        // $('input[name=app_list]').val(applistStr);
                        $('#js-zone-table').DataTable({searching: false, serverSide: false, ordering: false, info: false, pageLength: 5, paging: true, lengthChange: false});
                        $('#js-appinfos').validation();
                        $('.fancybox').fancybox();
                    }
                },
                '#js-modify-appname': function () { // 修改应用名称
                    // 隐藏应用详情，显示应用名称
                    $('#js-app-name').show();
                    $('#js-appinfos').hide();
                },
                '.js-add-keyword': function () { // 新增关键字
                    var _keywordTrs = $('.js-keyword-content .js-tr');
                    if (_keywordTrs && _keywordTrs.length === 50) {
                        Helper.fnPrompt('关键字不能超过50个');
                        return;
                    }
                    var _flag = false;
                    _keywordTrs.find('input[name=keyword]').each(function () {
                        if ($(this).val() === '') {
                            $(this).focus();
                            _flag = true;
                            return false;
                        }
                    });
                    if (_flag) {
                        return;
                    }
                    var keyHtml = '<div class="js-tr tr">';
                    keyHtml += '<div class="col-sm-5" style="padding-left:0;">'
                        + '<input class="form-control" name="keyword" placeholder="输入关键字" maxlength="10"></div>'
                        + '<div class="col-sm-4 input-number"><input class="form-control" type="text" name="price_up" placeholder="输入加价" value="0.1" step="0.1" decimal="1"'
                        + 'min="' + _this.moneyLimits[CONSTANT.revenue_type_cpd].key_min + '" max="' + _this.moneyLimits[CONSTANT.revenue_type_cpd].key_max + '">'
                        + '<div class="spin-wrap"><div class="spin" data-handle="up"><i class="fa fa-caret-up"></i></div>'
                        + '<div class="spin" data-handle="down"><i class="fa fa-caret-down"></i></div></div></div>'
                        + '<div class="col-sm-1 js-close close">x</div>';
                    keyHtml += '</div>';
                    $('#js-campaign-modal .js-keyword-content').append(keyHtml);
                },
                '.js-close': function () {
                    // 监听
                    if ($(this).attr('data-listener') === '1') {
                        $('#js-campaign-modal .js-keyword-content').attr('data-change', true);
                        $('#js-add-btn').prop('disabled', false);
                    }
                    $(this).parent('.js-tr').remove();
                },
                '#js-add-btn': function () { // 创建广告
                    var params = {};
                    params = $.extend({}, $('input[name=app_list]').val() && JSON.parse($('input[name=app_list]').val()));
                    if ($(this).attr('data-handle') === '2') {
                        params.campaignid = $('input[name=campaignid]').val();
                    }
                    else {
                        // params = $.extend({}, JSON.parse($('input[name=app_list]').val()));
                        params = $.extend({}, _this.appListStr);
                        params.campaignid = 0;
                    }
                    if (!$('#js-appinfos').valid()) {
                        return;
                    }
                    if ($('.error-msg') && $('.error-msg').length > 0) {
                        return;
                    }
                    params.revenue_type = $('input[name=revenue_type]:checked').val();
                    // 获取表单数据的值
                    ['revenue', 'total_limit', 'day_limit'].forEach(function (item, index) {
                        params[item] = $('[name=' + item + ']').val();
                    });
                    if (+params.revenue_type === CONSTANT.revenue_type_cpd) {
                        // 获取关键字加价
                        params.keywords = [];
                        $('#js-campaign-modal .js-keyword-content .js-tr').each(function () {
                            var _keyObj = $(this);
                            if (_keyObj.find('input[name=keyword]').val() !== '') {
                                var _keyVal = {};
                                ['id', 'keyword', 'price_up'].forEach(function (item, index) {
                                    var valObj = _keyObj.find('input[name=' + item + ']');
                                    if (valObj && valObj.length > 0) {
                                        _keyVal[item] = valObj.val();
                                    }
                                });
                                params.keywords.push(_keyVal);
                            }
                        });
                        // 获取广告位加价
                        params.zones = [];
                        var _zoneTable = $('#js-zone-table').DataTable();
                        var _zoneRows = _zoneTable.data();
                        var _priceUpObj = _zoneTable.$('input');
                        if (_zoneRows && _zoneRows.length > 0 && _priceUpObj) {
                            for (var i = 0, j = _zoneRows.length; i < j; i++) {
                                for (var ii = 0, jj = _priceUpObj.length; ii < jj; ii++) {
                                    var _priceObj = $(_priceUpObj[ii]);
                                    if (+_priceObj.attr('data-zoneid') === +_zoneRows[i][1]) {
                                        var _priceNum = Number(_priceObj.val());
                                        if (_priceObj && _priceObj.length > 0 && _priceNum !== Number(_priceObj.attr('data-original'))) {
                                            var _zoneVal = {};
                                            _zoneVal.price_up = _priceNum;
                                            if (_zoneRows[i][0]) {
                                                _zoneVal.id = _zoneRows[i][0];
                                            }
                                            _zoneVal.zoneid = _zoneRows[i][1];
                                            params.zones.push(_zoneVal);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if ($('input[name=link_url]') && $('input[name=link_url]').length > 0) {
                        params.link_url = $('input[name=link_url]').val();
                    }
                    if (+params.revenue_type === CONSTANT.revenue_type_cps || +params.revenue_type === CONSTANT.revenue_type_cpa) {
                        params.day_limit = '';
                        params.total_limit = '';
                        if (+params.revenue_type === CONSTANT.revenue_type_cps) {
                            params.revenue = '';
                        }
                    }
                    Helper.load_ajax();
                    _this._fnPost(API_URL.advertiser_campaign_self_store, params, function (json) {
                        // 隐藏modal
                        $('#js-campaign-modal').modal('hide');
                        dataTable.reload();
                    });
                },
                '.input-number .spin': function () {
                    var _parents = $(this).parents('.input-number');
                    var _input = _parents.find('input');
                    var step = _input.attr('step') ? Number(_input.attr('step')) : 1;
                    var min = _input.attr('min') ? Number(_input.attr('min')) : 0;
                    var max = _input.attr('max') ? Number(_input.attr('max')) : '';
                    var decimal = _input.attr('decimal') ? Number(_input.attr('decimal')) : 0;
                    var val = _input.val() ? Number(_input.val()) : 0;
                    if ($(this).attr('data-handle') === 'up') { // 加
                        if (_input.val() !== '') {
                            if (max) {
                                if ((val + step) >= max) {
                                    val = max;
                                }
                                else {
                                    val = val + step;
                                }
                            }
                            else {
                                val = val + step;
                            }
                        }
                        else {
                            val = min;
                        }
                    }
                    else { // 减
                        if (_input.val() !== '') {
                            if ((val - step) <= min) {
                                val = min;
                            }
                            else {
                                val = val - step;
                            }
                        }
                        else {
                            val = min;
                        }
                    }
                    _input.val(val.toFixed(decimal)).trigger('change').trigger('blur');
                },
                'input[name=revenue_type]': function () {
                    var _revenueObj = $('#js-campaign-modal .js-revenue-div');
                    var _totalLimitObj = $('#js-campaign-modal .js-totallimit-div');
                    var _dayLimitObj = $('#js-campaign-modal .js-daylimit-div');
                    var _keywordObj = $('#js-campaign-modal .js-keyword-div');
                    var _zoneObj = $('#js-campaign-modal .js-zone-div');
                    if (parseInt($(this).val(), 10) === CONSTANT.revenue_type_cpa) {
                        $('#js-campaign-modal .js-revenue-label').text('CPA出价');
                        // 隐藏日预算、总预算、关键字加价、广告位加价
                        _revenueObj.show();
                        _totalLimitObj.hide();
                        _dayLimitObj.hide();
                        _keywordObj.hide();
                        _zoneObj.hide();
                        _this._fnInitRevenueConf(_revenueObj, $(this).val());
                        _totalLimitObj.find('input[name=total_limit]').attr('check-type', '');
                        _dayLimitObj.find('input[name=day_limit]').attr('check-type', '');
                        _keywordObj.find('.error-msg').remove();
                    }
                    else if (parseInt($(this).val(), 10) === CONSTANT.revenue_type_cps) {
                        // 隐藏出价、日预算、总预算、关键字加价、广告位加价
                        _revenueObj.hide();
                        _totalLimitObj.hide();
                        _dayLimitObj.hide();
                        _keywordObj.hide();
                        _zoneObj.hide();
                        _revenueObj.find('input[name=revenue]').attr('check-type', '');
                        _totalLimitObj.find('input[name=total_limit]').attr('check-type', '');
                        _dayLimitObj.find('input[name=day_limit]').attr('check-type', '');
                        _keywordObj.find('.error-msg').remove();
                    }
                    else {
                        $('#js-campaign-modal .js-revenue-label').text('CPD出价');
                        _revenueObj.show();
                        _totalLimitObj.show();
                        _dayLimitObj.show();
                        _keywordObj.show();
                        _zoneObj.show();
                        _this._fnInitRevenueConf(_revenueObj, $(this).val());
                        _totalLimitObj.find('input[name=total_limit]').attr('check-type', 'required rangen stepn');
                        _dayLimitObj.find('input[name=day_limit]').attr('check-type', 'required rangen stepn');
                    }
                }
            });

            $('#js-campaign-modal').delegate('#js-app-platform', 'change', function () {
                _this._fnChangePlaceholder($(this).val());
            });

        },
        _fnBindSelect: function (mData, obj) {
            var _this = this;
            $('<select data-name="select_' + mData + '"><option value="">所有</option></select>').appendTo(obj).on('change', function (evt) {
                evt.stopPropagation();
                _this.filter[mData] = $(this).val();
                dataTable.reload();
            }).on('focus', function (evt) {
                $(this).val(_this.filter[mData]);
            });
        },
        _fnDrawCallback: function () { // 初始化弹出修改框
            $('[data-toggle="tooltip"]').tooltip();
            $('.fancybox').fancybox();
        },
        _fnInitComplete: function (settings, json, obj) {
            var self = this;
            var aoColumns = settings.aoColumns;
            var api = obj.api();
            for (var i = 0, j = aoColumns.length; i < j; i++) {
                var mData = aoColumns[i].mData;
                if (mData === 'platform') {
                    var column = api.column(i);
                    var $span = $('<span class="addselect">▾</span>').appendTo($(column.header()));
                    self._fnBindSelect(mData, $span);
                }
            }
            self._fnGetPlatform(function () {
                if ($('select[data-name=select_platform]') && $('select[data-name=select_platform]').length > 0) { // 获取平台
                    var objPlatform = $('select[data-name=select_platform]');
                    if (self.platformRes && self.platformRes.obj && self.platformRes.obj.length > 0) {
                        var options = '';
                        for (var ii = 0, jj = self.platformRes.obj.length; ii < jj; ii++) {
                            options += '<option value="' + self.platformRes.obj[ii] + '">' + LANG.platform_group[self.platformRes.obj[ii]] + '</option>';
                        }
                        objPlatform.append(options);
                    }
                }
            });
        },
        _fnFilter: function () {
            return JSON.stringify(this.filter);
        },
        fnInit: function () {
            var self = this;
            Helper.fnCreatTable('#js-campaign-table', self.oTitle, API_URL.campaign_list, function () {
            }, 'dataTable', {
                fnDrawCallback: function () {
                    self._fnDrawCallback();
                },
                fnInitComplete: function (settings, json) {
                    self._fnInitComplete(settings, json, this);
                },
                postData: {
                    filter: function () {
                        return self._fnFilter();
                    }
                }
            });
            self._fnInitHandle();
        }
    };
    return new CampaignList();
})(jQuery);
$(function () {
    CampaignList.fnInit();
});
