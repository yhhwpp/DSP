/**
 * @file campaign-index.js
 * @author xiaokl
 */
var CampaignList = (function ($) {
    var CampaignList = function () {};

    CampaignList.prototype = {
        oTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'clientname',
                    title: '广告主'
                },
                {
                    field: 'products_name',
                    title: '推广产品'
                },
                {
                    field: 'products_type',
                    title: '推广类型'
                },
                {
                    field: 'appinfos_app_name',
                    title: '广告名称'
                },
                {
                    field: 'ad_type',
                    title: '广告类型'
                },
                {
                    field: 'platform',
                    title: '推广平台'
                },
                {
                    field: 'revenue_type',
                    title: '计费类型'
                },
                {
                    field: 'revenue',
                    title: '出价(元)'
                },
                {
                    field: 'keyword_price_up_count',
                    title: '关键字加价'
                },
                {
                    field: 'day_limit',
                    title: '日预算'
                },
                {
                    field: 'total_limit',
                    title: '总预算'
                },
                {
                    field: 'status',
                    title: '状态'
                },
                {
                    field: 'approve_time',
                    title: '最近审核',
                    column_set: [
                        'sortable'
                    ]
                }
            ]
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) { // 自定义列表显示
            var thisCol = table.nameList[col];
            if (thisCol === 'products_name') {
                if ((+oData.products_type) === CONSTANT.products_type_package) {
                    if (oData.appinfos_app_show_icon == null) {
                        $(td).html('<img src="" width="40" height="40"/>' + sData);
                    }
                    else {
                        $(td).html('<img src="' + oData.appinfos_app_show_icon + '" width="40" height="40"/>' + sData);
                    }
                }
                else {
                    $(td).html(sData);
                }
            }
            else if (thisCol === 'status') {
                var sApproveComment = '';
                if ((+sData) === CONSTANT.status_rejected || (+sData) === CONSTANT.status_suspended) {
                    var sTipsIcon = '<i class="fa fa-exclamation-circle text-warning"></i>';
                    if ((+sData) === CONSTANT.status_rejected) {
                        sApproveComment = oData.approve_comment;
                        sTipsIcon = '<i class="fa fa-exclamation-circle text-warning"></i>';
                        $(td).html(Helper.fnGetPopoverOrTooltip({
                            'data-toggle': 'tooltip',
                            'data-trigger': 'hover',
                            'data-placement': 'right',
                            'title': sApproveComment
                        }, LANG.campaign_status[sData] + '&nbsp;' + sTipsIcon));
                    }
                    else if ((+sData) === CONSTANT.status_suspended) {
                        oData.pause_status === CONSTANT.CAMPAIGN_PAUSE_STATUS_EXCEED_DAY_LIMIT_PROGRAM && (oData.pause_status = CONSTANT.CAMPAIGN_PAUSE_STATUS_MANAGER); // 程序化日预算显示运营暂停
                        $(td).html(LANG.CAMPAIGN_PAUSE_STATUS[oData.pause_status] ? LANG.CAMPAIGN_PAUSE_STATUS[oData.pause_status] : '');
                    }
                }
                else {
                    $(td).html(LANG.campaign_status[sData] ? LANG.campaign_status[sData] : '');
                }
            }
            else if (thisCol === 'keyword_price_up_count') {
                if ((+oData.ad_type) === 0) {
                    $(td).html(parseInt(sData, 10) > 0 ? '<span class="js-handleKey center-block text-warning cursor">查看</span>' : '-');
                }
                else {
                    $(td).html('-');
                }
            }
            else if (thisCol === 'revenue') {
                if (oData.ad_type === CONSTANT.ad_type_other || oData.revenue_type === CONSTANT.revenue_type_cps) {
                    $(td).html('-');
                }
                else {
                    // var nRevenue = (oData.revenue_type === CONSTANT.revenue_type_cpc || oData.revenue_type === CONSTANT.revenue_type_cpm) ? sData : (parseFloat(sData).toFixed(1));
                    var nRevenue = parseFloat(sData).toFixed(CONSTANT.revenue_type_conf[oData.revenue_type].decimal);
                    $(td).html('&nbsp;' + nRevenue);
                }
            }
            else if (thisCol === 'day_limit') {
                if (oData.ad_type === CONSTANT.ad_type_other || oData.revenue_type === CONSTANT.revenue_type_cps) {
                    $(td).html('-');
                }
                else {
                    $(td).html('￥&nbsp;' + parseInt(sData, 10));
                }
            }
            else if (thisCol === 'total_limit') {
                if (oData.ad_type === CONSTANT.ad_type_other || oData.revenue_type === CONSTANT.revenue_type_cps) {
                    $(td).html('-');
                }
                else {
                    $(td).html(parseInt(sData, 10) === 0 ? '不限' : '￥&nbsp;' + parseInt(sData, 10));
                }
            }
            else if (thisCol === 'platform') {
                $(td).html(LANG.platform_group[sData]);
            }
            else if (thisCol === 'ad_type') {
                $(td).html(LANG.ad_type[sData]);
            }
            else if (thisCol === 'revenue_type') {
                $(td).html(LANG.revenue_type[sData]);
            }
            else if (thisCol === 'products_type') {
                $(td).html(LANG.products_type[sData]);
            }
        },
        _fnInitHandle2: function () { // 初始化关键字加价操作
            // 关键字加价
            $('#js-campaigntable').delegate('.js-handleKey', 'click', function (e) {
                var innerSelf = $(this);
                var cid = dataTable.row(innerSelf.parents('tr')).data().campaignid;
                var Y = innerSelf.offset().top;
                var X = innerSelf.offset().left;
                var subtr = '';
                $('#floatertb tbody').empty();
                $('#zones-up').attr('cid', cid);
                Helper.load_ajax();
                var param = {
                    campaignid: cid,
                    t: Math.random()
                };
                $.post(API_URL.broker_keywords_list, param, function (json) {
                    Helper.close_ajax();
                    if (0 === json.res) {
                        var data = json.list;
                        for (var k = 0; k < data.length; k++) {
                            var row = data[k];
                            var star = '';
                            for (var i = 0; i !== parseInt(row.rank / 2, 10); i++) {
                                star += '<i class="fa fa-star text-warning"></i>';
                            }
                            if (row.rank % 2) {
                                star += '<i class="fa fa-star-half-o text-warning"></i>';
                            }
                            for (var j = 0; j !== 5 - Math.ceil(row.rank / 2); j++) {
                                star += '<i class="fa fa-star-o text-warning"></i>';
                            }
                            subtr += '<tr data-kid="' + row.id + '"><td>' + row.keyword + '</td>';
                            subtr += '<td><span class="table-edit price-edit" zone-id=' + data[k].id + ' cid=' + data[k].campaignid + ' rel="key_price" title="修改">' + row.price_up + '</span></td>';
                            subtr += '<td>' + star + '</td></tr>';
                        }
                        $(subtr).appendTo('#floatertb tbody');
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                    var $tb = $('#zones-up');
                    $tb.show();
                    var dheight = $(document).height();
                    if (dheight - Y - 50 > $tb.height()) {
                        $tb.css({
                            left: X,
                            top: Y
                        });
                    }
                    else {
                        $tb.css({
                            left: X,
                            top: Y - $tb.height()
                        });
                    }
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                });
                e.stopPropagation();
            });
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
        _fnBindSelect: function (mData, obj) {
            $('<select data-name="' + mData + '"><option value="">所有</option></select>').appendTo(obj).on('change', function (evt) {
                evt.stopPropagation();
                $('input[name=' + $(this).attr('data-name') + ']').val($(this).val());
                dataTable.reload();
            }).on('focus', function (evt) {
                $(this).val($('input[name=' + $(this).attr('data-name') + ']').val());
            });
        },
        _fnCreateSelect: function (element, json) { // 创建select
            var options = '';
            for (var key in json) {
                options += '<option value="' + key + '">' + json[key] + '</option>';
            }
            element.append(options);
        },
        _fnInitComplete: function (settings, json, obj) {
            var self = this;
            var aoColumns = settings.aoColumns;
            var api = obj.api();
            for (var i = 0, j = aoColumns.length; i < j; i++) {
                var mData = aoColumns[i].mData;
                if (mData === 'products_type' || mData === 'ad_type' || mData === 'platform' || mData === 'revenue_type' || mData === 'revenue' || mData === 'day_limit'  || mData === 'status') {
                    var column = api.column(i);
                    var $span = $('<span class="addselect">▾</span>').appendTo($(column.header()));
                    self._fnBindSelect(mData, $span);
                }
            }
            if ($('select[data-name=products_type]') && $('select[data-name=products_type]').length > 0) { // 获取推广类型
                self._fnCreateSelect($('select[data-name=products_type]'), LANG.products_type);
            }
            if ($('select[data-name=ad_type]') && $('select[data-name=ad_type]').length > 0) { // 获取广告类型
                self._fnCreateSelect($('select[data-name=ad_type]'), LANG.MANAGER_AD_TYPE);
            }
            if ($('select[data-name=platform]') && $('select[data-name=platform]').length > 0) { // 获取平台
                self._fnCreateSelect($('select[data-name=platform]'), LANG.platform_group);
            }
            if ($('select[data-name=revenue_type]') && $('select[data-name=revenue_type]').length > 0) { // 获取计费类型
                self._fnCreateSelect($('select[data-name=revenue_type]'), LANG.revenue_type);
            }
            if ($('select[data-name=revenue]') && $('select[data-name=revenue]').length > 0) { // 获取出价
                $.get(API_URL.broker_campaign_revenue, function (json) {
                    if (json && json.res === 0 && json.list) {
                        var revenueOptions = '';
                        for (var i = 0, j = json.list.length; i < j; i++) {
                            revenueOptions += '<option value="' + json.list[i].revenue + '">' + Helper.fnFormatMoney(json.list[i].revenue) + '</option>';
                        }
                        $('select[data-name=revenue]').append(revenueOptions);
                    }
                });
            }
            if ($('select[data-name=day_limit]') && $('select[data-name=day_limit]').length > 0) { // 获取出价
                $.get(API_URL.broker_campaign_day_limit, function (json) {
                    if (json && json.res === 0 && json.list) {
                        var dayLimitOptions = '';
                        for (var ii = 0, jj = json.list.length; ii < jj; ii++) {
                            dayLimitOptions += '<option value="' + json.list[ii].day_limit + '">' + parseInt(json.list[ii].day_limit, 10) + '</option>';
                        }
                        $('select[data-name=day_limit]').append(dayLimitOptions);
                    }
                });
            }
            if ($('select[data-name=status]') && $('select[data-name=status]').length > 0) { // 获取状态
                self._fnCreateSelect($('select[data-name=status]'), LANG.campaign_status_select);
            }
        },
        _fnFilter: function () {
            var oFilter = {
                products_type: $('input[name=products_type]').val(),
                ad_type: $('input[name=ad_type]').val(),
                platform: $('input[name=platform]').val(),
                revenue_type: $('input[name=revenue_type]').val(),
                day_limit: $('input[name=day_limit]').val(),
                status: $('input[name=status]').val()
            };
            return JSON.stringify(oFilter);
        },
        fnInit: function () {
            var self = this;
            Helper.fnCreatTable('#js-campaigntable', this.oTitle, API_URL.broker_campaign_index, function (td, sData, oData, row, col, table) {
                self._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                postData: {
                    filter: function () {
                        return self._fnFilter();
                    }
                },
                fnDrawCallback: function () {
                    $('[data-toggle="tooltip"]').tooltip();
                },
                fnInitComplete: function (settings, json) {
                    self._fnInitComplete(settings, json, this);
                }
            });

            self._fnInitHandle2();
        }
    };

    return new CampaignList();
})(jQuery);
$(function () {
    CampaignList.fnInit();
});
