/**
 *  @file campaign-index.js
 *  @author hehe
 */
var campaignList = (function ($) {
    var CampaignList = function () {
        this.sTitle = {
            res: 0,
            obj: null,
            map: null,
            list: [{
                field: 'brief_name',
                title: '广告主'
            }, {
                field: 'appinfos_app_name',
                title: '广告名称'
            }, {
                field: 'platform',
                title: '推广平台'
            }, {
                field: 'revenue_type',
                title: '计费类型'
            }, {
                field: 'revenue',
                title: '出价（元）'
            }, {
                field: 'keyword_price_up_count',
                title: '关键字加价'
            }, {
                field: 'zone_price_up_count',
                title: '广告位加价'
            }, {
                field: 'day_limit',
                title: '日预算（元）'
            }, {
                field: 'total_limit',
                title: '总预算（元）'
            }, {
                field: 'app_rank',
                title: '级别'
            }, {
                field: 'category',
                title: '类别'
            }, {
                field: 'status',
                title: '状态'
            }, {
                field: 'operation_time',
                title: '最近操作',
                column_set: ['sortable']
            }, {
                field: 'campaignid',
                title: '操作'
            }]
        };
        this.keywordth = '<tr><th width="220">关键字</th><th width="150">竞争力</th><th width="130">加价（元）</th><th width="120">类型</th></tr>';
        this.zoneth = '<tr><th width="220">广告位</th><th width="150">示意图</th><th width="130">加价（元）</th><th width="120">日曝光</th><th width="120">竞争力</tr>';
        this.postData = {
            status: '',
            platform: ''
        };
    };
    CampaignList.prototype = {
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'brief_name':
                    var title = '全称：' + oData.clientname + '<br>联系人：' + oData.contact + '<br>手机：' + oData.contact_phone + '<br>邮箱：' + oData.email;
                    html = '<div data-toggle="tooltip" data-placement="right" title="' + title + '" style="text-align:left !important">' + sData + '</div>';
                    $(td).addClass('js-affset-modal');
                    break;
                case 'appinfos_app_name':
                    html = '<img src="' + oData.appinfos_app_show_icon + '" width="40" height="40"/>' + sData;
                    break;
                case 'revenue_type':
                    html = LANG.revenue_type[sData];
                    break;
                case 'platform':
                    html = LANG.platform[sData];
                    break;
                case 'revenue':
                    if (oData.revenue_type === CONSTANT.revenue_type_cps) {
                        html = '-';
                    }
                    else {
                        html = Helper.fnFormatMoney(sData, CONSTANT.revenue_type_conf[oData.revenue_type].decimal);
                    }
                    break;
                case 'keyword_price_up_count':
                    html = sData > 0 ? '<span class="js-handle-key center-block text-warning cursor" data-type="keyword">查看</span>' : '-';
                    break;
                case 'zone_price_up_count':
                    html = sData > 0 ? '<span class="js-handle-key center-block text-warning cursor" data-type="zone">查看</span>' : '-';
                    break;
                case 'day_limit':
                    if (oData.revenue_type === CONSTANT.revenue_type_cps) {
                        html = '-';
                    }
                    else {
                        html = Helper.fnFormatMoney(sData, 0);
                    }
                    break;
                case 'total_limit':
                    if (oData.revenue_type === CONSTANT.revenue_type_cps) {
                        html = '-';
                    }
                    else {
                        html += (!sData || sData === '0.00' || sData === 0.00) ? '不限' : Helper.fnFormatMoney(sData, 0);
                    }
                    break;
                case 'app_rank':
                    html = sData ? '<span class="table-edit ' + thisCol + '">' + LANG.app_rank[oData.app_rank] + '</span>' : '-';
                    break;
                case 'category':
                    html = (sData && sData !== '0') ? '<span class="table-edit ' + thisCol + '">' + oData.category_label + '</span>' : '-';
                    break;
                case 'status':
                    html = sData === CONSTANT.CAMPAIGN_STATUS_PAUSE ? LANG.CAMPAIGN_PAUSE_STATUS[oData.pause_status] : LANG.MANAGER_CAMPAIGN_STATUS[sData];
                    if (sData === CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT) {
                        html += '<i data-toggle="tooltip" title="' + oData.approve_comment + '" class="fa fa-exclamation-circle text-warning"></i>';
                    }
                    break;
                case 'operation_time':
                    html += oData.approve_user ? oData.approve_user + '<br />' + sData : '-';
                    $(td).addClass('log');
                    break;
                case 'campaignid':
                    var _fnShowBt = function (name, id) {
                        return '<button class="btn btn-default js-btn-status" data-status=' + id + ' data-campaignid=' + sData + ' >' + name + '</button>';
                    };
                    if (oData.status === CONSTANT.CAMPAIGN_STATUS_APPROVE_WAITING) { // 待审核
                        html = '<button class="btn btn-default js-btn-approve" data-campaignid=' + sData + '>通过</button> <button class="btn btn-default js-btn-reject" data-campaignid=' + sData + '>驳回</button>';
                    }
                    else if (oData.status === CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT) { // 未通过审核
                        html = '<button class="btn btn-default js-btn-approve" data-campaignid=' + sData + '>通过</button>';
                    }
                    else {
                        if (oData.status === CONSTANT.CAMPAIGN_STATUS_DELIVERY) { // 投放中
                            html = _fnShowBt('暂停', 1);
                        }
                        else if (oData.status === CONSTANT.CAMPAIGN_STATUS_STOP) { // 停止投放
                            html = _fnShowBt('再投', 0);
                        }
                        else if (oData.status === CONSTANT.CAMPAIGN_STATUS_PAUSE) { // 暂停状态
                            if (oData.pause_status === CONSTANT.CAMPAIGN_PAUSE_STATUS_MANAGER) { // 运营手动暂停
                                html = _fnShowBt('继续', 0) + _fnShowBt('停止', 15);
                            }
                            else if (oData.pause_status === CONSTANT.CAMPAIGN_PAUSE_STATUS_ADVERTISER) { // 广告主暂停
                                html = '';
                            }
                            else {
                                html = _fnShowBt('暂停', 0);
                            }
                        }
                        html += '<a target="_blank" href="../stat/index.html#campaignid=' + oData.campaignid + '&name=' + escape(oData.appinfos_app_name) + '" class="btn btn-default">报表</a>';
                    }
                    break;
                default:
                    html = sData;
                    break;
            }
            $(td).html(html);
        },
        _fnInitComplete: function (settings, json, obj) {
            var self = this;
            var aoColumns = settings.aoColumns;
            var api = obj.api();
            for (var i = 0, j = aoColumns.length; i < j; i++) {
                var mData = aoColumns[i].mData;
                if (mData === 'status' || mData === 'platform') {
                    var column = api.column(i);
                    var $span = $('<span class="addselect">▾</span>').appendTo($(column.header()));
                    self._fnBindSelect(mData, $span);
                }
            }
            var items = LANG.campaign_status_select;
            delete items[4];
            var html = '';
            for (var key in items) {
                html += '<option value="' + key + '">' + items[key] + '</option>';
            }
            $('select[data-name="status"]').append(html);
            $.get(API_URL.trafficker_common_platform, function (response) {
                if (response && response.res === 0 && response.obj && response.obj.length > 0) {
                    var options = '';
                    for (var ii = 0, jj = response.obj.length; ii < jj; ii++) {
                        options += '<option value="' + response.obj[ii] + '">' + LANG.platform_group[response.obj[ii]] + '</option>';
                    }
                    $('select[data-name=platform]').append(options);
                }
            });
        },
        _fnBindSelect: function (mData, obj) {
            var _this = this;
            $('<select data-name="' + mData + '"><option value="">所有</option></select>').appendTo(obj).on('change', function (evt) {
                evt.stopPropagation();
                _this.postData[mData] = $(this).val();
                dataTable.reload();
            }).on('focus', function (evt) {
                $(this).val(_this.postData[mData]);
            });
        },
        _fnInitHandle: function () {
            var defaults = {
                url: API_URL.trafficker_campaign_self_update, // 修改媒体广告管理列表字段
                params: function () {
                    var oDatas = dataTable.row($(this).parents('tr')[0]).data();
                    return {
                        campaignid: oDatas.campaignid
                    };
                },
                success: function (response) {
                    if (response.res === 0) {
                        dataTable.reload(null, false);
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                }
            };
            $('.table-edit.app_rank').editable($.extend({
                name: 'app_rank',
                title: '级别修改',
                type: 'select',
                source: LANG.app_rank,
                value: function () {
                    return dataTable.row($(this).parents('tr')[0]).data().app_rank;
                }
            }, defaults));
            $('.table-edit.category').editable($.extend({
                name: 'category',
                title: '类别修改',
                type: 'category',
                value: function () {
                    var oData = dataTable.row($(this).parents('tr')[0]).data();
                    return oData.category.toString().split(',');
                },
                placement: 'auto',
                source: API_URL.trafficker_campaign_category,
                sourceOptions: {
                    data: {
                        ad_type: 0
                    }
                },
                validate: function (value) {
                    var _v = $('.editable-container input[name="category"]').val();
                    if (!_v) {
                        return '请选择分类';
                    }
                }
            }, defaults));
            $('[data-toggle="tooltip"]').tooltip({
                html: true
            });
        },
        _fnInitPage: function () {
            var self = this;
            var objPostOpt = {
                postData: {
                    filter: function () {
                        return JSON.stringify(self.postData);
                    }
                },
                fnDrawCallback: function () {
                    self._fnInitHandle();
                },
                fnInitComplete: function (settings, json) {
                    self._fnInitComplete(settings, json, this);
                }
            };

            Helper.fnCreatTable('#js-campaign-table', self.sTitle, API_URL.trafficker_campaign_self_index, function (td, sData, oData, row, col, table) {
                self._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', objPostOpt);
        },
        _fnInitListeners: function () {
            var _this = this;
            $('#js-campaign-table').delegates({
                '.js-btn-status': function () {
                    _this._fnChangeStatus($(this)); // 广告操作
                },
                '.js-btn-reject': function () { // 驳回
                    $('#reject-content').val('');
                    $('#reject-msg').text('');
                    $('#approve-reject-panel').modal({
                        backdrop: 'static',
                        show: true
                    });
                    $('input[name="approve-reject-campaignid"]').val($(this).data('campaignid'));
                },
                '.js-btn-approve': function () { // 通过审核
                    $('.rank-set .col-sm-9').html($.tmpl('#tpl-trafficler-rank', {}));
                    $('#approve-panel').modal({
                        backdrop: 'static',
                        show: true
                    });
                    $.get(API_URL.trafficker_campaign_category, {
                        ad_type: 0
                    }, function (a) {
                        if (0 === a.res) {
                            $('#category-list').categoryList(a.obj); // 输出html
                        }
                    });


                    $('input[name="approve-reject-campaignid"]').val($(this).data('campaignid'));
                    $('#approve-panel .form-horizontal').validation();
                },
                '.js-handle-key': function (e) { // 查看关键字加价
                    var Y = $(this).offset().top;
                    var X = $(this).offset().left;
                    var _data =  dataTable.row($(this).parents('tr')).data();
                    var params = {
                        campaignid: _data.campaignid,
                        t: Math.random()
                    };
                    var _status = _data.status;
                    var _type = $(this).data('type');
                    var _url = _type === 'keyword' ? API_URL.trafficker_keywords_list : API_URL.trafficker_campaign_zone_list;
                    $.post(_url, params, function (data) {
                        if (data.res === 0) {
                            if (data.list && data.list.length > 0) {
                                var sTr = '';
                                var _title = _type === 'keyword' ? _this.keywordth : _this.zoneth;
                                for (var i = 0, j = data.list.length; i < j; i++) {
                                    if (_type === 'keyword') {
                                        var type = data.list[i].type;
                                        sTr += '<tr><td>' + data.list[i].keyword + '</td><td>' + _this._fnGetStar(data.list[i].rank, _status) + '</td><td>' + data.list[i].price_up + '</td>';
                                        var _typeHtml = '<select class="js-keyword-update" data-id=' + data.list[i].id + ' data-value=' + type + '>';
                                        for (var m in LANG.keyword_type) {
                                            var s = (+m) === type ? 'selected' : '';
                                            _typeHtml += '<option ' + s + ' value=' + m + '>' + LANG.keyword_type[m] + '</option>';
                                        }
                                        _typeHtml += '</select>';
                                        sTr += '<td>' + _typeHtml + '</td></tr>';
                                    }
                                    else {
                                        sTr += '<tr><td>' + data.list[i].zonename + '</td><td><a class="fancybox" href="' + data.list[i].description + '">查看</a></td><td>' + Helper.fnFormatMoney(data.list[i].price_up, CONSTANT.revenue_type_conf[_data.revenue_type].decimal)  + '</td><td>' + Helper._fnGetImpressionsText(data.list[i].impressions) + '</td><td>' + _this._fnGetStar(data.list[i].rank, _status) + '</td>';
                                        _this._fnInitFancybox();
                                    }
                                }
                                $('#floatertb tbody').html(sTr);
                                var $tb = $('#zones-up');
                                $tb.find('thead').html(_title);
                                $tb.show();
                                if ($(document).height() - Y - 50 > $tb.height()) {
                                    $tb.css({
                                        left: X + 38,
                                        top: Y
                                    });
                                }
                                else {
                                    $tb.css({
                                        left: X + 38,
                                        top: Y - $tb.height()
                                    });
                                }
                            }
                        }
                    });
                    e.stopPropagation();
                }
            });
            $('#zones-up').delegates({
                '.js-keyword-update': {
                    change: function () {
                        var that = this;
                        var _v = $(this).data('value');
                        Helper.load_ajax();
                        $.post(API_URL.trafficker_keyword_update, {
                            id: $(that).data('id'),
                            type: $(that).val()
                        }, function (response) {
                            Helper.close_ajax();
                            if (response.res === 0) {
                                _v = $(this).val();
                            }
                            Helper.fnPrompt(response.msg);
                        }).fail(function () {
                            Helper.close_ajax();
                            $(that).val(_v).data('value', _v);
                            Helper.fnPrompt('服务器请求失败，请稍后重试！');
                        });
                    }
                }
            });
            $('#approve-reject-panel').delegates({
                '#approve-reject-accept': function () {
                    var comment = $('#reject-content').val();
                    if ($.trim(comment) === '') {
                        $('#reject-msg').text('请填写拒绝原因');
                        return;
                    }
                    var campaignid = $('input[name="approve-reject-campaignid"]').val();
                    var status = CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT;
                    var data = {
                        approve_comment: comment
                    };
                    _this._fnCheckStatus(campaignid, status, data, function (json) {
                        if (json === -1) {
                            Helper.fnAlert('服务器请求失败，请稍后重试');
                        }
                        else if (0 === json.res) {
                            $('#approve-reject-panel').modal('hide');
                            $('#approve-panel').modal('hide');
                            dataTable.reload(null, false);
                            _this._fnFreshNum();
                        }
                        else {
                            Helper.fnPrompt(json.msg);
                        }
                    });
                }
            });
            $('#approve-panel').delegates({
                '.label-rank': function () {
                    var $parent = $(this).parent('.label-rank-container');
                    $parent.find('.label-rank').removeClass('actived');
                    $(this).addClass('actived');
                    $parent.find('input[name="app-rank-set"]').val($(this).attr('data-value'));
                },
                '#approve-accept': function () {
                    if (!($('#approve-panel .form-horizontal').valid())) {
                        return false;
                    }
                    var campaignid = $('input[name="approve-reject-campaignid"]').val();
                    var status = CONSTANT.CAMPAIGN_STATUS_DELIVERY;
                    var _data = {
                        app_rank: $('input[name=app-rank-set]').val(),
                        category: $('#category-list').data('value')
                    };
                    _this._fnCheckStatus(campaignid, status, _data, function (json) {
                        if (json === -1) {
                            Helper.fnAlert('服务器请求失败，请稍后重试');
                        }
                        else if (0 === json.res) {
                            dataTable.reload(null, false);
                            $('#approve-panel').modal('hide');
                            _this._fnFreshNum();
                        }
                        else {
                            Helper.fnPrompt(json.msg);
                        }
                    });
                }
            });
            Helper.fnInitKeyHandle();
        },
        _fnInitFancybox: function () {
            $('.fancybox').fancybox();
        },
        _fnApproveReject: function () {
            $('#reject-content').val('');
            $('#reject-msg').text('');
            $('#approve-reject-panel').modal({
                backdrop: 'static',
                show: true
            });
        },
        _fnGetStar: function (rank, status) {
            var star = '';
            for (var k = 0; k !== parseInt(rank / 2, 10); k++) {
                star += '<i class="fa fa-star text-warning"></i>';
            }
            if (rank % 2) {
                star += '<i class="fa fa-star-half-o text-warning"></i>';
            }

            for (var l = 0; l !== 5 - Math.ceil(rank / 2); l++) {
                star += '<i class="fa fa-star-o text-warning"></i>';
            }
            return status === CONSTANT.CAMPAIGN_STATUS_DELIVERY ? (rank ? star : '十分钟后有效') : '广告未投放';
        },
        _fnChangeStatus: function ($ele) {
            var campaignid = $ele.data('campaignid');
            var status = $ele.data('status');
            this._fnCheckStatus(campaignid, status, {}, function (json) {
                if (json === -1) {
                    Helper.fnAlert('服务器请求失败，请稍后重试');
                }
                else if (0 === json.res) {
                    dataTable.reload(null, false);
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            });
        },
        _fnCheckStatus: function (campaignid, status, data, callback) {
            var param = {
                campaignid: campaignid,
                status: status
            };
            $.extend(param, data ? data : {});
            Helper.load_ajax();
            $.post(API_URL.trafficker_campaign_self_check, param, function (json) {
                Helper.close_ajax();
                callback(json);
            }).fail(function () {
                Helper.close_ajax();
                callback(-1);
            });
        },
        _fnFreshNum: function () {
            $.get(API_URL.trafficker_common_campaign_pending_audit, function (data) {
                var num = data.obj.count ? data.obj.count : '';
                $('#menu [data-type="trafficker_self_campaign"] .badge').html(num);
            });
        },
        fnInit: function () {
            this._fnInitPage();
            this._fnInitListeners();
        }
    };
    return new CampaignList();
}(window.jQuery));
$(function () {
    campaignList.fnInit();
});
