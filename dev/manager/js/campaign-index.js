/**
 * @file config.js
 * @author hehe songxing
 */
var CampaignIndex = (function ($) {
    var CampaignIndex = function () {
        this.tmlProInfor = {};
        this.oCampaignTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'brief_name',
                title: '客户'
            }, {
                field: 'products_name',
                title: '推广产品'
            }, {
                field: 'products_type',
                title: '类型'
            }, {
                field: 'appinfos_app_name',
                title: '广告信息'
            }, {
                field: 'equivalence',
                title: '等价广告'
            }, {
                field: 'revenue',
                title: '出价（元）'
            }, {
                field: 'day_limit',
                title: '预算（元）'
            }, {
                field: 'condition',
                title: '定向'
            }, {
                field: 'products_show_name',
                title: '媒体投放'
            }, {
                field: 'contact_phone',
                title: '30日消耗趋势',
                width: '190px'
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
        this.oAdxAffsetTitle = [
            {
                field: 'bidding_price',
                title: '竞价上限（元）'
            },
            {
                field: 'ad_spec',
                title: 'Adx素材规格'
            }
        ];
        this.oMaterialsTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'client_name',
                title: '广告主'
            }, {
                field: 'products_name',
                title: '推广产品'
            }, {
                field: 'products_type',
                title: '推广类型'
            }, {
                field: 'app_name',
                title: '广告名称'
            }, {
                field: 'ad_type',
                title: '广告类型'
            }, {
                field: 'status',
                title: '广告状态'
            }, {
                field: 'updated_at',
                title: '素材修改时间',
                column_set: ['sortable']
            }, {
                field: 'approve_time',
                title: '最近审核',
                column_set: ['sortable']
            }, {
                field: 'campaignid',
                title: '操作'
            }]
        };
        this.affsetTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'brief_name',
                title: '媒体商'
            }, {
                field: 'af_day_limit',
                title: '媒体日限额(元)',
                column_set: [
                    'sortable'
                ]
            }, {
                field: 'revenue_price',
                title: '广告主计费价(元)',
                column_set: [
                    'sortable'
                ]
            }, {
                field: 'media_price',
                title: '媒体价(元)',
                column_set: [
                    'sortable'
                ]
            }, {
                field: 'revenue_type',
                title: '计费类型'
            }, {
                field: 'app_id',
                title: 'appID'
            }, {
                field: 'flow_ratio',
                title: '流量变现比例'
            }, {
                field: 'category_id',
                title: '类别'
            }, {
                field: 'app_rank',
                title: '级别'
            }, {
                field: 'status',
                title: '投放状态'
            }, {
                field: 'channel',
                title: '渠道号',
                width: '80px'
            }, {
                field: 'file',
                title: '下载地址'
            }, {
                field: 'link_url',
                title: '推广链接'
            }, {
                field: 'updated_user',
                title: '最新操作',
                column_set: ['sortable']
            }, {
                field: 'contact',
                title: '操作'
            }]
        };
        this.revenueHistoryTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'revenue_no',
                title: 'No.'
            }, {
                field: 'current_revenue',
                title: '出价(￥)'
            }, {
                field: 'time',
                title: '出价时间'
            }]
        };
        this.equivalenceTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'clientname',
                title: '广告主'
            }, {
                field: 'name',
                title: '推广产品'
            }, {
                field: 'app_name',
                title: '广告名称'
            }, {
                field: 'revenue',
                title: '出价(元)'
            }, {
                field: 'day_limit',
                title: '日预算(元)'
            }, {
                field: 'total_limit',
                title: '总预算(元)'
            }, {
                field: 'status',
                title: '投放状态'
            }, {
                field: 'relation',
                title: '等价关系'
            }, {
                field: 'icon',
                title: '操作'
            }]
        };
        this.logTbTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'created_time',
                title: '时间'
            }]
        };
        this.tabType = 'campaign';
        this.campaignid = '';
        this.postData = {
            ad_type: '',
            platform: '',
            revenue_type: '',
            revenue: '',
            day_limit: '',
            status: '',
            business_type: '',
            products_type: '',
            status_stop: '1',
            creator_uid: '',
            operation_uid: '',
            created_at: ['', ''],
            operation_time: ['', '']
        };

        this.oMoneyLimit = {
            revenue_min: 1,
            revenue_max: 100,
            day_limit_min: 200,
            day_limit_max: 10000,
            key_min: 0,
            key_max: 100
        };
        this.oFilter = {
            products_type: '',
            status: ''
        };
    };
    CampaignIndex.prototype = {
        _fnAffsetCustomColumn: function (td, sData, oData, row, col, table, data) {
            var thisCol = table.nameList[col];
            var html = '';
            var setbutton = function (status, txt) {
                return '<button class="ctrl-bt btn btn-default" data-action="' + status + '">' + txt + '</button>';
            };
            var redClass = '';
            var n = null;
            var text = '';
            switch (thisCol) {
                case 'contact_phone':
                    html += '<div data-type="trend-report" data-bannerid="' + oData.bannerid + '">-</div>';
                    break;
                case 'brief_name': // 媒体商
                    var qq = oData.contact_qq ? ('<br>QQ：' + oData.contact_qq) : '';
                    var title = '联系人：' + oData.contact + '<br>邮箱：' + oData.email + '<br>手机：' + oData.contact_phone + '<br>全称：' + oData.affiliates_name + qq;
                    html = '<div data-toggle="tooltip" data-placement="right" title="' + title + '">' + sData + '</div>';
                    break;
                case 'af_day_limit': // 日限额
                    var afDayLimit = (+sData > 0) ? parseInt(sData, 10) : parseInt(window.oRowData.day_limit, 10);
                    if (window.oRowData.revenue_type === CONSTANT.revenue_type_cps) {
                        html += '-';
                    }
                    else if (window.oRowData.mode === CONSTANT.mode_adx && '' === oData.bidding_price) {
                        html += Helper.fnFormatMoney(afDayLimit, 0);
                    }
                    else {
                        html = '<span class="table-edit ' + thisCol + '" data-label ="' + thisCol + '" data-value="' + afDayLimit + '">' + Helper.fnFormatMoney(afDayLimit, 0) + '</span>';
                    }
                    break;
                case 'revenue_price': // 广告主计费价
                    redClass = Number(sData) !== Number(window.oRowData.revenue) ? 'text-warning' : ''; // 平台修改后标红
                    n = CONSTANT.revenue_type_conf[oData.revenue_type].decimal;
                    if (window.oRowData.revenue_type === CONSTANT.revenue_type_cps) {
                        html += '-';
                    }
                    else if (window.oRowData.mode === CONSTANT.mode_adx && '' === oData.bidding_price) {
                        html += Number(sData).toFixed(n);
                    }
                    else {
                        html = '<span class="table-edit ' + redClass + ' ' + thisCol + '" data-label ="' + thisCol + '">' + Number(sData).toFixed(n) + '</span>';
                    }

                    break;
                case 'media_price': // 媒体价
                    redClass = Number(oData.af_manual_price) !== Number(oData.default_media_price) ? 'text-warning' : ''; // 平台修改后标红
                    n = CONSTANT.revenue_type_conf[oData.revenue_type].decimal;
                    if (window.oRowData.revenue_type === CONSTANT.revenue_type_cps) {
                        html += '-';
                    }
                    else if (window.oRowData.mode === CONSTANT.mode_adx && '' === oData.bidding_price) {
                        html += Number(sData).toFixed(n);
                    }
                    else {
                        html = '<span class="table-edit ' + redClass + ' ' + thisCol + '" data-label ="' + thisCol + '">' + Number(sData).toFixed(n) + '</span>';
                    }
                    break;
                case 'revenue_type': // 计费类型
                    if (window.oRowData.mode === CONSTANT.mode_adx && '' === oData.bidding_price) {
                        html += LANG.revenue_type[sData];
                    }
                    else {
                        html = '<span class="table-edit ' + thisCol + '" data-label ="' + thisCol + '">' + LANG.revenue_type[sData] + '</span>';
                    }

                    break;
                case 'app_id': // appID
                    if (2 === oData.affiliates_type) { // 不入库不查询自动生成,无图标
                        html = sData ? sData : '-';
                    }
                    else { // 提交入库查询 与  入库直接查询 合并, 搜索的的时候 根据 affiliates_type,提交不同的参数
                        html = sData ? '<img width="30" height="30" src="' + oData.app_id_icon + '">' + sData + '<i class="fa fa-search fa-lg js-app-id-search" aria-hidden="true"></i>' : '-';
                    }
                    // if (2 === oData.status) { // 不入库不查询自动生成,无图标
                    //     html = (sData ? '<img width="30" height="30" src="' + oData.app_id_icon + '">' + sData : '-') + '<i class="fa fa-search fa-lg js-app-id-search" aria-hidden="true"></i>';
                    // }
                    // else {
                    //     html = sData ? sData : '-';
                    // }
                    $(td).addClass('app-id');
                    break;
                case 'flow_ratio': // 流量变现比例
                    text = sData ? Helper.fnFormatMoney(sData, 0) + '%' : '-';
                    html = '<span class="table-edit ' + thisCol + '" data-label ="' + thisCol + '"  data-value="' + Helper.fnFormatMoney(sData, 0) + '" >' + text + '</span>';
                    break;
                case 'bidding_price': // 竞价上限
                    var _v = sData ? Number(sData).toFixed(CONSTANT.revenue_type_conf[oData.revenue_type].decimal) : '-';
                    html = '<span class="table-edit ' + thisCol + '" data-label ="' + thisCol + '">' + _v + '</span>';
                    break;
                case 'ad_spec': // 素材规
                    html = sData && sData.length ? sData.join('<br/>') : '-';
                    break;
                case 'category_id': // 类别
                    text =  oData.category_name ? oData.category_name : '-';
                    html = CONSTANT.mode_storage_no === window.oRowData.mode ? '<span class="table-edit ' + thisCol + '" data-label ="' + thisCol + '">' + text + '</span>' : text; // 不入库的需要设置类别才能投放
                    break;
                case 'app_rank': // 级别
                    text = sData ? LANG.app_rank[sData] : '-';
                    html = CONSTANT.mode_storage_no === window.oRowData.mode ? '<span class="table-edit ' + thisCol + '" data-label ="' + thisCol + '">' + text + '</span>' : text; // 不入库的需要设置级别才能投放
                    break;
                case 'status': // 状态
                    if (CONSTANT.banner_status_suspended === sData) {
                        if (window.oRowData.status === CONSTANT.CAMPAIGN_STATUS_PAUSE) {
                            html += LANG.CAMPAIGN_BANNER_PAUSE_STATUS[window.oRowData.pause_status];
                        }
                        else {
                            html += LANG.manager_pause_status[oData.pause_status];
                        }
                    }
                    else if (CONSTANT.banner_status_put_in === sData) {
                        if (window.oRowData.status === CONSTANT.CAMPAIGN_STATUS_PAUSE) {
                            html += LANG.CAMPAIGN_BANNER_PAUSE_STATUS[window.oRowData.pause_status];
                        }
                        else {
                            html += LANG.manager_status[sData];
                        }
                    }
                    else if ((CONSTANT.banner_status_no_accepted === sData && CONSTANT.mode_adx === window.oRowData.mode) || (CONSTANT.banner_status_pending_media === sData && CONSTANT.mode_adx === window.oRowData.mode)) { // Adx 未通过审核，带需要展示原因
                        html += LANG.manager_status[sData] + '<i data-toggle="tooltip" title="' + (oData.comments ? oData.comments : '&nbsp;') + '" class="fa fa-exclamation-circle text-warning"></i>';
                    }
                    else {
                        html += LANG.manager_status[sData];
                    }
                    break;
                case 'channel': // 渠道号
                    text = sData ? sData : '';
                    html = CONSTANT.mode_artif === window.oRowData.mode ? '<span class="table-edit ' + thisCol + '" data-label ="' + thisCol + '">' + text + '</span>' : text; // 人工投放需要输入渠道号才能投放
                    break;
                case 'file': // 下载地址
                    if (window.oRowData.ad_type === CONSTANT.ad_type_app_store) { // 单独处理AppStore 显示连接地址
                        html = oData.link_url ? '<a href="' + oData.link_url + '" title="' + oData.link_url + '" target="_blank" class="text-warning">链接地址</a>' : '-';
                    }
                    else {
                        var tips = 1 === oData.compare_version ? '<span data-toggle="tooltip" data-placement="right" title="需更新包"><i class="fa fa-exclamation-circle text-warning" aria-hidden="true"></i></span>' : '';
                        html = sData ? '<a href="' + sData + '" title = "' + oData.real_name + '" class="text-warning" target="_blank">下载地址</a>' + tips : '待选包';
                    }
                    break;
                case 'link_url': // 链接地址
                    html = sData ? '<a href="' + sData + '" title="' + sData + '" target="_blank" class="text-warning">链接地址</a>' : '-';
                    break;
                case 'updated_user': // 最近操作
                    html = sData ? sData + '<br>' + oData.updated : '-';
                    if (oData.bannerid !== '') {
                        $(td).addClass('log').data('category', 120);
                    }
                    break;
                case 'contact': // 操作
                    if (0 === window.oRowData.products_type && window.oRowData.mode !== CONSTANT.mode_artif) {
                        html += '<button class="select-package btn btn-default">渠道包</button>'; // 安装包下载 -- 程序化投放需要选择渠道包才能投放
                    }
                    if (window.oRowData.status !== CONSTANT.CAMPAIGN_STATUS_PAUSE) {
                        var status = oData.status;
                        if (0 === status) { // 投放中
                            html += setbutton('2', '暂停');
                        }
                        else if (1 === status) { // 已暂停
                            if (0 === oData.pause_status || 3 === oData.pause_status) {
                                html += setbutton('2', '暂停');
                            }
                            else if (2 === oData.pause_status) {
                                html += setbutton('1', '继续投放');
                            }
                        }
                        else if (3 === status) { // 入库 -- 媒体未通过审核
                            var _vs = window.oRowData.mode === CONSTANT.mode_adx ? '提交' : '投放'; // Adx 显示提交
                            html += setbutton('1', _vs);
                        }
                        else if (6 === status) { // 入库, ADX -- 待媒体审核
                            window.oRowData.mode === CONSTANT.mode_adx ? (html += '') : (html += setbutton('0', '取消'));
                        }
                        else if (2 === status) { // 入库 -- 待选 appID
                            html += '<button class="select-app-id btn btn-default">选择appID</button>';
                        }
                        else if (7 === status || status === '') { // 待投放
                            if (0 === window.oRowData.products_type && window.oRowData.mode !== CONSTANT.mode_artif && !oData.file) {

                            }
                            else {
                                html += setbutton('1', '投放');
                            }
                        }
                        else if (8 === status) {
                            html += setbutton('1', '提交');
                        }
                    }
                    break;
                case 'condition':
                    if (sData == null || sData === '') {
                        html += '<span class="condition-banner cursor" data-affiliateid="' + oData.affiliateid + '">不限</span>';
                    }
                    else {
                        html += '<span class="text-warning condition-banner cursor" data-affiliateid="' + oData.affiliateid + '">查看/修改</span>';
                    }
                    break;
                default:
                    html = sData;
                    break;
            }
            $(td).html(html);
        },
        _fnlogCustomColumn: function (td, sData, oData, row, col, table, data) {
            var thisCol = table.nameList[col];
            if (thisCol === 'created_time') {
                html = '<div class="created_time">' + sData + '</div>';
                html += '<div class="row"><div class="col-sm-2"><div class="operator">' + oData.operator + '：</div></div>';
                html += '<div class="col-sm-10"><div class="message">' + oData.message + '</div></div>';
                $(td).html(html);
            }
        },
        _fnInitChannelChoose: function (attrName) {
            var channelObj = $('input[name=' + attrName + ']');
            var channelNum = channelObj.length;
            var checkedNum = channelObj.filter(':checked').length;
            if (checkedNum === 0) {
                $('input[name=' + attrName + '-radio]').prop('checked', true);
            }
            else {
                $('input[name=' + attrName + '-radio]').prop('checked', false);
            }
            if (channelNum === checkedNum) {
                $('#modal-direct-delivery-banner input[name="channel-checkbox"]').prop('checked', true);
            }
            else if (checkedNum === 0) {
                $('#modal-direct-delivery-banner input[name="channel-checkbox"]').prop({
                    checked: false,
                    indeterminate: false
                });
            }
            else {
                $('#modal-direct-delivery-banner input[name="channel-checkbox"]').prop({
                    checked: false,
                    indeterminate: true
                });
            }
        },
        _fnInitListeners: function () {
            var that = this;
            $('#tab-table').delegates({
                '.affset-bt': function () {
                    window.oRowData = dataTable.row($(this).parents('tr')[0]).data(); // 保存campaign的数据
                    var revenue_type = window.oRowData.revenue_type;
                    window.oRowData.revenue_type_label = LANG.revenue_type[revenue_type];

                    $.ajax({
                        url: API_URL.manager_campaign_consume,
                        type: 'POST',
                        data: {campaignid: window.oRowData.campaignid}
                    })
                    .done(function (response) {
                        if (0 === response.res) {
                            if (response.obj) {
                                $('.js-day-consume').text(response.obj.day_consume);
                                $('.js-total-consume').text(response.obj.total_consume);
                            }
                        }
                        else {
                            Helper.fnPrompt(response.msg);
                        }
                    });
                    $('.js-affset-modal .modal-title').html($.tmpl('#tpl-affset-title', window.oRowData));
                    $('.js-affset-modal .tabbox').html($.tmpl('#tpl-tab', window.oRowData));
                    $('.js-affset-modal .day-limit-program').html($.tmpl('#tpl-day-limit-program', window.oRowData));

                    var _nDayLimitProgram = parseInt(+window.oRowData.day_limit_program, 10);
                    $('.day-limit-program-num').text(_nDayLimitProgram); // 输出程序化日预算
                    $('.day-limit-program-edit').data('value', _nDayLimitProgram);
                    window.oRowData.status === CONSTANT.CAMPAIGN_STATUS_PAUSE ? $('.js-affset-modal .modal-content').addClass('bg-warning') : $('.js-affset-modal .modal-content').removeClass('bg-warning');
                    $('.js-affset-modal').modal({
                        backdrop: 'static',
                        show: true
                    }).off('shown.bs.modal').on('shown.bs.modal', function () {
                        $('.js-affset-modal .nav-tabs li').eq(0).trigger('click');
                        $('.day-limit-program-edit').editable({
                            type: 'number',
                            title: '修改程序化投放限额（元）',
                            clear: false,
                            displayVal: function () {
                                return $(this).find('.day-limit-program-num').text();
                            },
                            min: 0,
                            url: API_URL.manager_campaign_update,
                            params: function () {
                                return {
                                    campaignid: window.oRowData.campaignid,
                                    field: 'day_limit_program'
                                };
                            },
                            success: function (response) {
                                if (response.res === 0) {
                                    var _v =  Number($('.day-limit-program .editable-input input[type="number"').val());
                                    $(this).data('value', _v);
                                    $(this).find('.day-limit-program-num').text(_v);
                                }
                                else {
                                    Helper.fnPrompt(response.msg);
                                }
                            }
                        });
                    });
                },
                '.revenue-history': function () {// 查看历史出价
                    var _oRowData = dataTable.row($(this).parents('tr')[0]).data();
                    var revenueTbOpt = {
                        searching: false,
                        pageLength: 10,
                        bLengthChange: false,
                        postData: {
                            campaignid: function () {
                                return _oRowData.campaignid;
                            }
                        },
                        destroy: true
                    };
                    $('#js-revenue-history').empty();
                    $('#js-revenue-history-modal').modal('show').off('shown.bs.modal').on('shown.bs.modal', function () {
                        window.revenueTb && window.revenueTb.destroy();
                        Helper.fnCreatTable('#js-revenue-history', that.revenueHistoryTitle, API_URL.manager_campaign_revenue_history, that._fnRevenueHistoryCustomColumn, 'revenueTb', revenueTbOpt);
                    });
                },
                '.equivalence': function () { // 设置等价广告
                    window._oRowData = dataTable.row($(this).parents('tr')[0]).data();
                    $('#js-equivalence-modal').modal('show').off('shown.bs.modal').on('shown.bs.modal', function () {
                        $('.equivalence-type').html($.tmpl('#tpl-equivalence-type', window._oRowData));
                        window.equivalenceTb && window.equivalenceTb.destroy();
                        Helper.fnCreatTable('#js-equivalence-table', that.equivalenceTitle, API_URL.manager_campaign_equivalence_list, that._fnEquivalenceCustomColumn, 'equivalenceTb', {
                            pageLength: 10,
                            bLengthChange: false,
                            postData: {
                                campaignid: window._oRowData.campaignid,
                                platform: window._oRowData.platform,
                                revenue_type: window._oRowData.revenue_type,
                                ad_type: window._oRowData.ad_type
                            },
                            oSearch: {
                                sSearch: window._oRowData.products_name
                            },
                            destroy: true
                        });
                    });
                }
            });
            $('#js-affset-modal').delegates({
                '.nav-tabs li': function (e) { // tab加载不同媒体商列表
                    $('.js-affset-modal .nav-tabs li').removeClass('active');
                    $(this).addClass('active');
                    window.oRowData.mode = $(this).data('mode');
                    if (window.oRowData.mode === CONSTANT.mode_adx) {
                        $('#js-affset-modal .js-word2vec').show();
                    }
                    else {
                        $('#js-affset-modal .js-word2vec').hide();
                    }
                    var opt = {
                        dom: 'rftipl<"clear">',
                        scrollY: '400px',
                        scrollX: true,
                        scrollCollapse: true,
                        fixedHeader: false,
                        iDisplayLength: 50,
                        postData: {
                            campaignid: window.oRowData.campaignid,
                            products_type: window.oRowData.products_type,
                            ad_type: window.oRowData.ad_type,
                            mode: window.oRowData.mode
                        },
                        fnDrawCallback: function () {
                            that._fnTableCallback();
                        }
                    };
                    window.affsetTb && $('#js-affset-table').html() !== '' && window.affsetTb.destroy() && $('#js-affset-table').empty();
                    var _affsetTitle = that._fnSetTitle(window.oRowData.products_type, window.oRowData.ad_type, window.oRowData.mode); // 动态设置title
                    Helper.fnCreatTable('#js-affset-table', _affsetTitle, API_URL.manager_banner_affiliate, that._fnAffsetCustomColumn, 'affsetTb', opt);
                },
                '.js-app-id-search, .select-app-id': function (e) { // appid查询
                    e.stopPropagation();
                    $('#js-affset-table .app-search-list').remove();
                    var oAffsetRowData = window.affsetTb.row($(this).parents('tr')[0]).data();
                    var affiliates_type = oAffsetRowData.affiliates_type;
                    if (affiliates_type === 1) { // 提交入库查询
                        var param = {
                            words: oAffsetRowData.bannerid ? oAffsetRowData.bannerid : 0,
                            affiliateid: oAffsetRowData.affiliateid,
                            platform: window.oRowData.platform
                        };
                        $.post(API_URL.manager_banner_app_search, param, function (response) {
                            0 === response.res ? window.affsetTb.reload(null, !1) : Helper.fnPrompt(response.msg);
                        });
                    }
                    else { // 入库直接查询
                        var $appid = $(this).parents('tr').find('.app-id');
                        $appid.append($.tmpl('#tpl-app-search', window.oRowData));
                        $('.app-words-search').on('click', function () {
                            var words = $(this).prev('.app-search-text').val();
                            if ($.trim(words) === '') {
                                return !1;
                            }
                            var param = {
                                words: words,
                                affiliateid: oAffsetRowData.affiliateid,
                                platform: window.oRowData.platform
                            };
                            $.post(API_URL.manager_banner_app_search, param, function (response) {
                                if (0 === response.res) {
                                    $('.tb-list').html($.tmpl('#tpl-app-tb-list', response));
                                    $('.tb-list tr').off('click').on('click', function () {
                                        var postJson = {
                                            affiliatesid: oAffsetRowData.affiliateid,
                                            bannerid: oAffsetRowData.bannerid || 0,
                                            campaignid: window.oRowData.campaignid,
                                            app_id: $(this).data('appid'),
                                            app_icon: $(this).data('icon'),
                                            app_name: $(this).data('appname')
                                        };
                                        $.post(API_URL.manager_banner_app_update, postJson, function (res) {
                                            /* eslint max-nested-callbacks: [0] */
                                            0 === res.res ? (window.affsetTb.reload(null, !1), $('.app-search-list .close').trigger('click')) : Helper.fnPrompt(res.msg);
                                        });
                                    });
                                }
                                else {
                                    Helper.fnPrompt(response.msg);
                                }
                            });
                        });
                        $('.app-search-list .close').on('click', function () { // 关闭appsearch容器
                            $(this).parents('.app-search-list').remove();
                        });
                    }
                },
                '.ctrl-bt': function () { //  投放/取消/暂停/启用
                    var oAffsetRowData = window.affsetTb.row($(this).parents('tr')[0]).data();
                    var action = $(this).data('action');
                    if (action === 1) {
                        var flag = true;
                        var msg = '';
                        if (window.oRowData.ad_type === CONSTANT.ad_type_app_market) {
                            if (window.oRowData.mode === CONSTANT.mode_storage_no) {
                                if (!oAffsetRowData.category_id) {
                                    flag = false;
                                    msg = '请设置类别';
                                }
                                else if (!oAffsetRowData.app_rank) {
                                    flag = false;
                                    msg = '请设置级别';
                                }
                                else if (!oAffsetRowData.attach_id) {
                                    flag = false;
                                    msg = '请选择渠道包';
                                }
                            }
                            else if (window.oRowData.mode === CONSTANT.mode_storage_yes) {
                                if (!oAffsetRowData.attach_id) {
                                    flag = false;
                                    msg = '请选择渠道包';
                                }
                            }
                        }
                        else if (window.oRowData.revenue_type === CONSTANT.revenue_type_cpd) {
                            if (window.oRowData.mode === CONSTANT.mode_storage_no) {
                                if (!oAffsetRowData.attach_id) {
                                    flag = false;
                                    msg = '请选择渠道包';
                                }
                            }
                        }
                        if (window.oRowData.mode === CONSTANT.mode_adx) { // ADX投放需要判断竞价上限是否设置
                            if (oAffsetRowData.bidding_price === '') {
                                flag = false;
                                msg = '请设置竞价上限';
                            }
                        }
                        if (!flag) {
                            Helper.fnAlert(msg);
                            return;
                        }
                    }
                    var param = {
                        affiliateid: oAffsetRowData.affiliateid,
                        campaignid: window.oRowData.campaignid,
                        bannerid: oAffsetRowData.bannerid || 0,
                        status: oAffsetRowData.status,
                        action: $(this).data('action'),
                        mode: window.oRowData.mode
                    };
                    $.post(API_URL.manager_banner_release, param, function (response) {
                        0 === response.res ? window.affsetTb.reload(null, !1) : Helper.fnPrompt(response.msg);
                    });
                },
                '.select-package': function () { // 渠道包选择/修改
                    var oAffsetRowData = window.affsetTb.row($(this).parents('tr')[0]).data();
                    $.post(API_URL.manager_pack_client_package, {
                        campaignid: window.oRowData.campaignid
                    }, function (response) {
                        0 === response.res ? (response.attach_id = oAffsetRowData.attach_id, $('#package-select-modal .modal-body').html($.tmpl('#tpl-package-list', response))) : Helper.fnPrompt(response.msg);
                    });

                    $('#package-select-modal').modal({
                        backdrop: 'static',
                        show: true
                    });

                    $('#package-select-confirm').off('click').on('click', function () {
                        if (!$('#select-app-package').val()) {
                            return !1;
                        }
                        var param = {
                            campaignid: window.oRowData.campaignid,
                            affiliateid: oAffsetRowData.affiliateid,
                            bannerid: oAffsetRowData.bannerid || 0,
                            ad_type: window.oRowData.ad_type,
                            field: 'attach_id',
                            value: $('#select-app-package').val(),
                            old_attach_id: oAffsetRowData.attach_id
                        };
                        $.post(API_URL.manager_banner_affiliate_update, param, function (response) {
                            0 === response.res ? (window.affsetTb.reload(null, !1), $('#package-select-modal').modal('hide')) : Helper.fnPrompt(response.msg);
                        });
                    });
                },
                '.condition-banner': function () {
                    var oAffsetRowData = window.affsetTb.row($(this).parents('tr')[0]).data();
                    var initVal = {vid: '', channel: [], filter_tag_off_function: []};
                    if (oAffsetRowData.condition) {
                        initVal = $.extend({}, initVal, JSON.parse(oAffsetRowData.condition));
                    }
                    var conditionData = oAffsetRowData.condition_data ? JSON.parse(oAffsetRowData.condition_data) : '';
                    $('#modal-direct-delivery-banner').modal('show').off('shown.bs.modal').on('shown.bs.modal', function () {
                        // 加载定向投放内容
                        $('#js-directional-delivery-banner').html(doT.template($('#tpl-direct-delivery-banner').text())($.extend({}, initVal, {condition_data: conditionData})));
                        $('#modal-direct-delivery-banner input[name="channel-checkbox"]').prop('indeterminate', false);
                        // init channel checkbox
                        that._fnInitChannelChoose('channel');
                    }).on('hidden.bs.modal', function () {
                        $('#js-directional-delivery-banner').html('');
                    });
                    $('#js-save-directional-banner').off('click').on('click', function () {
                        var condition = {};
                        condition.vid = $('input[name=vid]').val();
                        if ($('#modal-direct-delivery-banner input[name=channel]') && $('#modal-direct-delivery-banner input[name=channel]').length > 0) {
                            var channelAry = [];
                            $('#modal-direct-delivery-banner input[name=channel]').filter(':checked').each(function () {
                                channelAry.push($(this).val());
                            });
                            condition.channel = channelAry;
                        }
                        var _target = [];
                        $('#modal-direct-delivery-banner input[name=filter_tag_off_function]').filter(':checked').each(function () {
                            _target.push($(this).val());
                        });
                        condition.filter_tag_off_function = _target;
                        var param = {
                            campaignid: window.oRowData.campaignid,
                            affiliateid: oAffsetRowData.affiliateid,
                            bannerid: oAffsetRowData.bannerid || 0,
                            ad_type: window.oRowData.ad_type,
                            field: 'condition',
                            value: JSON.stringify(condition)
                        };
                        $.post(API_URL.manager_banner_affiliate_update, param, function (response) {
                            0 === response.res ? (window.affsetTb.reload(null, !1), $('#modal-direct-delivery-banner').modal('hide')) : Helper.fnPrompt(response.msg);
                        });
                    });
                }
            });
            $('#modal-direct-delivery-banner').delegates({
                'input[data-handle="choose-radio"]': function () {
                    $('input[name=' + $(this).attr('name').replace('-radio', '') + ']').prop('checked', false);
                    $('input[name=' + $(this).attr('name').replace('-radio', '') + '-checkbox]').prop({
                        checked: false,
                        indeterminate: false
                    });
                },
                'input[data-handle=choose]': function () {
                    var attrName = $(this).attr('name');
                    that._fnInitChannelChoose(attrName);
                },
                '#js-expand': function () {
                    if ($(this).attr('aria-expanded') === 'false') {
                        $(this).html('-收起');
                    }
                    else {
                        $(this).html('+展开');
                    }
                },
                'input[name="channel-checkbox"]': function () {
                    var checked = $(this).is(':checked');
                    $('#modal-direct-delivery-banner input[name="channel-radio"]').prop('checked', !checked);
                    $('#modal-direct-delivery-banner input[name="channel"]').prop('checked', checked);
                }
            });
            $('#addad-btn-wrapper').delegates({
                '#addad-btn': function () {
                    $('.add-advertiser-form').html($.tmpl('#tpl-add-advertiser-form', {}));
                    $('#add-advertiser-platform').html($.tmpl('#tpl-add-platform', LANG.platform));
                    $('.add-advertiser-revenue-type input[name="revenue_type"]').eq(0).trigger('click');
                    $('#add-advertiser-panel .form-horizontal').validation({
                        blur: false
                    });
                    $('#add-advertiser-panel').modal({
                        backdrop: 'static',
                        show: true
                    });
                    that._fnDesUpload();
                }
            });
            $('#add-advertiser-panel').delegates({
                '.add-advertiser-revenue-type input[name="revenue_type"]': function () {
                    var _this = this;
                    $('input[name="clientid"]').val('');
                    that._fnAddProduct();
                    $.post(API_URL.manager_campaign_client_list, {
                        revenue_type: $(_this).val()
                    }, function (data, textStatus, xhr) { // 选择计费类型更新广告主及产品
                        if (data && data.res === 0 && data.obj.length > 0) {
                            $('#add-advertiser-advertiser').html($.tmpl('#tpl-add-advertiser-advertiser', data)).multiselect('destroy').multiselect({
                                enableFiltering: true,
                                buttonWidth: '100%',
                                maxHeight: 200,
                                onChange: function (option, checked, select) {
                                    that.clientid = $(option).val();
                                    $('input[name="clientid"]').val(that.clientid);
                                    $.post(API_URL.manager_campaign_product_list, {
                                        clientid: $(option).val()
                                    }, function (data, textStatus, xhr) {
                                        if (data && data.res === 0) {
                                            $('.add-advertiser-product-select-list').html($.tmpl('#tpl-add-advertiser-product', data));
                                            that._fnAddProduct();
                                        }
                                    });
                                }
                            });
                        }
                    });
                },
                '.js-des-thumb .fa-times-circle': function () { // 删除图标
                    var src = $(this).prev('img').attr('src');
                    $.post(API_URL.qiniu_del_file, {
                        imgName: src.substring(src.lastIndexOf('/') + 1)
                    });
                    $('.js-des-thumb').empty();
                    $('#js-upload-des').text(MSG.upload);
                    $('input[name="products_icon"]').val('');
                },
                '#add-advertiser-confirm': function () { // 创建CPA / CPT广告
                    var $panel = $('#add-advertiser-panel');
                    var products_id = $panel.find('input[name="products_id"]').val();
                    var clientid = $panel.find('input[name="clientid"]').val();
                    var platform = $panel.find('#add-advertiser-platform').val();
                    var products_icon = $panel.find('input[name="products_icon"]').val();
                    var appinfos_app_name = $panel.find('input[name="appinfos_app_name"]').val();
                    if (!($('#add-advertiser-panel .form-horizontal').valid())) {
                        return false;
                    }
                    var oPostJson = {
                        revenue_type: $panel.find('input[name="revenue_type"]:checked').val(),
                        products_name: $panel.find('input[name="products_name"]').val(),
                        products_id: products_id,
                        clientid: clientid,
                        platform: platform,
                        products_icon: products_icon,
                        appinfos_app_name: appinfos_app_name
                    };
                    $.post(API_URL.manager_campaign_store, oPostJson, function (response) {
                        if (0 === response.res) {
                            $('#add-advertiser-panel').modal('hide');
                            dataTable.reload();
                        }
                        else {
                            Helper.fnPrompt(response.msg);
                        }
                    });
                },
                '.add-advertiser-form-tips .close': function () {
                    $(this).parents('.add-advertiser-form-tips').remove();
                },
                '.add-advertiser-product-list': function () { // 选择已有的广告产品
                    that._fnSetClientProduct($(this).data('icon'), $(this).data('platform'), $(this).data('name'), $(this).data('id'));
                },
                '.add-advertiser-product-news': function () {
                    that._fnAddProduct();
                },
                'input[name="products_name"]': {
                    blur: function () {
                        if (!Helper.fnIsEmpty($(this).val())) {
                            $('input[name="appinfos_app_name"]').val($(this).val() + '-其他');
                        }
                    }
                }
            });
            $('#js-equivalence-modal').delegates({
                '.equivalence-action': function () {
                    var param = {
                        campaignid: window._oRowData.campaignid,
                        campaignid_relation: window.equivalenceTb.row($(this).parents('tr')[0]).data().campaignid,
                        action: $(this).data('action')
                    };
                    Helper.load_ajax();
                    $.post(API_URL.manager_campaign_equivalence, param, function (data, textStatus, xhr) {
                        Helper.close_ajax();
                        if (data.res === 0) {
                            window.equivalenceTb.reload(null, false);
                            window.dataTable.reload(null, false);
                        }
                        else {
                            Helper.fnPrompt(data.msg);
                        }
                    });
                },
                '#js-equivalence-table_filter input': {
                    keydown: function () {
                        window.equivalenceTb.reload();
                    }
                }
            });
            $('#modal-log').delegates({
                // 备忘录增加
                '.js-log-add': function () {
                    var sTxt = $('.js-log-txt').val();
                    if ($.trim(sTxt) === '') {
                        return false;
                    }
                    $.ajax({
                            url: API_URL.manager_common_log_store,
                            type: 'POST',
                            data: {
                                category: $('#modal-log input[name="category"]').val(),
                                target_id: $('#modal-log input[name="targetid"]').val(),
                                message: sTxt
                            }
                        })
                        .done(function (response) {
                            if (0 === response.res) {
                                window.logTb.reload();
                                $('.js-log-txt').val('');
                            }
                            else {
                                Helper.fnPrompt(response.msg);
                            }
                        })
                        .fail(function () {
                            Helper.fnPrompt('服务器请求失败，请稍后重试！');
                        });
                },
                // 备忘录筛选
                'select[name="log-filter"]': {
                    change: function () {
                        logTb.reload();
                    }
                }
            });
            $('#page-wrapper').delegates({
                '.log': function () { // 备忘录
                    var _category = $(this).data('category');
                    var _oTb =  _category === 110 ? dataTable : affsetTb;
                    var _oRowData = _oTb.row($(this).parents('tr')[0]).data();
                    var target_id = _category === 110 ? _oRowData.campaignid : _oRowData.bannerid;
                    $('select[name="log-filter"]').val('2');
                    var logTbOpt = {
                        searching: false,
                        pageLength: 50,
                        bLengthChange: false,
                        postData: {
                            target_id: target_id,
                            category: _category,
                            filter: function () {
                                return JSON.stringify({
                                    type: $('select[name="log-filter"]').val()
                                });
                            }
                        },
                        destroy: true,
                        fnDrawCallback: function () {
                            if (2 > logTb.page.info().pages) {
                                $('#tb-log_paginate').hide();
                            }
                        }
                    };
                    $('#modal-log .modal-title span').html($.tmpl('#tpl-log-title', $.extend({}, _oRowData, {
                        category: _category
                    })));

                    $('#tb-log').empty();
                    $('#modal-log').modal('show').off('shown.bs.modal').on('shown.bs.modal', function () {
                        var fnAutoHeight = function () {
                            var _h = $(window).height() - 180 + 'px';
                            $('#modal-log .modal-body').css('max-height', _h);
                        };
                        fnAutoHeight();
                        $(window).resize(function () {
                            fnAutoHeight();
                        });
                        window.logTb && window.logTb.destroy();
                        $('.js-log-txt').val('');
                        Helper.fnCreatTable('#tb-log', that.logTbTitle, API_URL.manager_common_log_index, that._fnlogCustomColumn, 'logTb', logTbOpt);
                    });
                }
            });
        },
        _fnSetClientProduct: function (icon, platform, name, id) {
            var $parent = $('#add-advertiser-panel');
            $parent.find('#add-advertiser-platform').val(platform).prop('disabled', true);
            $parent.find('input[name="products_name"]').val(name).prop('disabled', true);
            $parent.find('input[name="products_id"]').val(id);
            $parent.find('.add-advertiser-product-selected').text(name);
            $parent.find('input[name="appinfos_app_name"]').val(name + '-其他');
            $('.js-des-thumb').html('<img src="' + icon + '" width="80" height="auto">').show();
            $('input[name="products_icon"]').val(icon);
            $('#js-upload-des,.help-block').hide();
        },
        _fnAddProduct: function () {
            var $parent = $('#add-advertiser-panel');
            $parent.find('#add-advertiser-platform').removeAttr('disabled');
            $parent.find('input[name="products_name"]').removeAttr('disabled');
            $parent.find('.add-advertiser-product-selected').text('新建产品');
            $parent.find('input[name="products_name"]').val('');
            $parent.find('input[name="appinfos_app_name"]').val('');
            $parent.find('input[name="products_icon"]').val('');
            $('.help-block').show();
            $('#js-upload-des').show().text('上传');
            $('.js-des-thumb').html('').hide();
            $parent.find('input[name="products_id"]').val('0');
        },
        _fnQiniuUpload: function (options) {
            var settings = {
                runtimes: 'html5,flash,html4',
                browse_button: '',
                uptoken_url: API_URL.qiniu_uptoken_url,
                domain: API_URL.qiniu_domain,
                max_file_size: '2mb',
                max_retries: 3,
                dragdrop: true,
                chunk_size: '4mb',
                auto_start: true,
                multi_selection: false,
                init: {
                    BeforeUpload: function (up, file) {
                        var imgType;
                        var type = file.type;
                        if (-1 !== type.indexOf('image')) {
                            imgType = type.slice(6), 'png' !== imgType && 'gif' !== imgType && 'jpg' !== imgType && 'jpeg' !== imgType && (Helper.fnPrompt(MSG.upload_not_in_conformity), up.removeFile(file));
                        }
                        else {
                            Helper.fnPrompt(MSG.upload_not_in_conformity), up.removeFile(file);
                        }
                    },
                    UploadProgress: function (up, file) {
                        $('#' + options.browse_button).prop('disabled', !0).html(MSG.uploading), $('.datagrid-mask-msg').length <= 1;
                    },
                    Error: function (up, err, errTip) {
                        $('#' + options.browse_button).prop('disabled', !1).html(MSG.upload), -600 === err.code && Helper.fnPrompt(MSG.upload_up_to_two_mb);
                    },
                    Key: function (up, file) {
                        var key = file.id + '.jpg';
                        return key;
                    }
                }
            };
            return Qiniu.uploader($.extend({}, settings, options, {
                init: $.extend({}, settings.init, options.init ? options.init : {})
            }));
        },
        _fnDesUpload: function () {
            // 七牛上传
            this._fnQiniuUpload({
                browse_button: 'js-upload-des',
                init: {
                    FileUploaded: function (up, file, info) {
                        var res = JSON.parse(info);
                        var imgURL = API_URL.qiniu_domain + '/' + res.key;

                        $.get(imgURL + '?imageInfo', function (res) {
                            if (res.width === 512 && res.height === 512) {
                                $('input[name="products_icon"]').val(imgURL);
                                $('.js-des-thumb').html('<img src="' + imgURL + '" width="80" height="auto"><i class="fa fa-times-circle"></i>').show();
                                $('#js-upload-des').text(MSG.modify_img);
                            }
                            else {
                                Helper.fnPrompt(MSG.upload_spec_size_material);
                            }
                            $('#js-upload-des').prop('disabled', !1).html(MSG.upload);
                        });

                    }
                }
            });
        },
        _fnTableCallback: function () { // table加载回调
            $('#js-affset-modal [data-type="trend-report"]').each(function (index, el) {
                var bannerid = $(this).data('bannerid');
                if (bannerid) {
                    TrendBanner.getBannerTrend(bannerid);
                }
            });

            $('#js-affset-modal [data-toggle="tooltip"]').tooltip({
                html: true,
                delay: {hide: 100},
                placement: 'auto'
            }).on('shown.bs.tooltip', function (event) {
                var that = this;
                var $tooltip = $(this).parent().find('div.tooltip');
                $tooltip.on('mouseenter', function () {
                    $(that).attr('in', true);
                }).on('mouseleave', function () {
                    $(that).removeAttr('in');
                    $(this).removeClass('in');
                    $(that).popover('hide');
                });
            }).on('hide.bs.tooltip', function (event) {
                if ($(this).attr('in')) {
                    event.preventDefault();
                }
            });

            // 数组转化为table-edit可以初始化的json数组
            // var a2ja = function (arry, str) {
            //     var new_arry = [];
            //     $.each(arry, function (index, el) {
            //         new_arry[index] = {};
            //         new_arry[index].value = el;
            //         new_arry[index].text = LANG[str][el];
            //     });
            //     return new_arry;
            // };
            var defaults = {
                type: 'text',
                url: API_URL.manager_banner_affiliate_update,
                params: function () {
                    var oAffsetRowData = window.affsetTb.row($(this).parents('tr')[0]).data();
                    return {
                        campaignid: window.oRowData.campaignid,
                        affiliateid: oAffsetRowData.affiliateid,
                        bannerid: oAffsetRowData.bannerid || 0,
                        ad_type: window.oRowData.ad_type,
                        field: $(this).attr('data-label')
                    };
                },
                success: function (response) {
                    !response.res ? window.affsetTb.reload(null, false) : Helper.fnPrompt(response.msg);
                }
            };

            $('#js-affset-modal .table-edit').each(function () {
                var option = {};
                var oAffsetRowData = window.affsetTb.row($(this).parents('tr')[0]).data();
                if ($(this).hasClass('revenue_type')) {
                    option = {
                        type: 'select',
                        value: oAffsetRowData.revenue_type,
                        source: API_URL.manager_banner_revenue_type,
                        sourceCache: false,
                        sourceOptions: {
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                affiliateid: oAffsetRowData.affiliateid,
                                ad_type: window.oRowData.ad_type,
                                revenue_type: window.oRowData.revenue_type
                            }
                        }
                    };
                }
                else if ($(this).hasClass('app_rank')) {
                    option = {
                        type: 'select',
                        value: oAffsetRowData.app_rank,
                        source: API_URL.manager_banner_rank,
                        sourceCache: false,
                        sourceOptions: {
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                affiliateid: oAffsetRowData.affiliateid,
                                ad_type: window.oRowData.ad_type,
                                platform: window.oRowData.platform
                            }
                        },
                        sourceCallback: function (data) {
                            var source = [];
                            if (data && data.res === 0) {
                                var list = data.list ? data.list : [];
                                for (var i = 0; i < list.length; i++) {
                                    source.push({
                                        value: list[i].rank_limit,
                                        text: list[i].rank_limit_label
                                    });
                                }
                            }
                            return source;
                        },
                        validate: function (value) {
                            if (!value) {
                                return '请选择级别';
                            }
                        }
                    };
                }
                else if ($(this).hasClass('channel')) {
                    option = {
                        type: 'text'
                    };
                }
                else if ($(this).hasClass('category_id')) {
                    option = {
                        name: 'category',
                        title: '类别修改',
                        type: 'category',
                        value: function () {
                            var aCategory = oAffsetRowData.category_id ? oAffsetRowData.category_id.toString().split(',') : [];
                            return aCategory;
                        },
                        source: API_URL.manager_banner_category,
                        sourceCache: false,
                        placement: 'auto',
                        sourceOptions: {
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                affiliateid: oAffsetRowData.affiliateid,
                                ad_type: window.oRowData.ad_type
                            }
                        },
                        validate: function (value) {
                            var _v = $('.editable-container input[name="category"]').val();
                            if (!_v) {
                                return '请选择分类';
                            }
                        }
                    };
                }
                else if ($(this).hasClass('media_price')) {
                    option = {
                        validate: function (value) {
                            if ($.trim(value) === '') {
                                return '价格不能为空';
                            }
                            var _n = CONSTANT.revenue_type_conf[oAffsetRowData.revenue_type].decimal;
                            var _reg = new RegExp('^\\d+(\.\\d{1,' + _n + '})?$');
                            if (!_reg.test(value)) {
                                return '请填写数字，且最多' + _n + '位小数';
                            }
                            value = Number(value);
                            if (value < 0 || value > CONSTANT.REVENUE_MAX) {
                                return '价格必须大于等于0，小于等于' + CONSTANT.REVENUE_MAX;
                            }
                        }
                    };
                }
                else if ($(this).hasClass('revenue_price')) {
                    option = {
                        validate: function (value) {
                            if ($.trim(value) === '') {
                                return '价格不能为空';
                            }
                            var _n = CONSTANT.revenue_type_conf[oAffsetRowData.revenue_type].decimal;
                            var _reg = new RegExp('^\\d+(\.\\d{1,' + _n + '})?$');
                            if (!_reg.test(value)) {
                                return '请填写数字，且最多' + _n + '位小数';
                            }
                            value = Number(value);
                            if (value <= 0 || value > window.oRowData.revenue) {
                                return '价格必须大于0，小于等于' + window.oRowData.revenue;
                            }
                        }
                    };
                }
                else if ($(this).hasClass('af_day_limit')) {
                    option = {
                        value: function () {
                            return $(this).attr('data-value');
                        },
                        validate: function (value) {
                            if ($.trim(value) === '') {
                                return '日限额不能为空';
                            }
                            if (isNaN(value)) {
                                return '请填写有效的数值';
                            }
                            if (parseInt(value, 10) !== Number(value)) {
                                return '请输入整数';
                            }
                            if (value < 0 || value > 1000000) {
                                return '日限额必须大于等于0，小于等于1000000';
                            }
                        }
                    };
                }
                else if ($(this).hasClass('flow_ratio')) {
                    option = {
                        value: $(this).data('value'),
                        type: 'percent',
                        validate: function (value) {
                            if ($.trim(value) === '') {
                                return '数值不能为空';
                            }
                            if (isNaN(value)) {
                                return '请填写有效的数值';
                            }
                            if (value < 0 || value > 100 || !/^\d+$/.test(value)) {
                                return '数值必须大于等于0，小于等于100的正整数';
                            }
                        }
                    };
                }
                else if ($(this).hasClass('bidding_price')) {
                    option = {
                        value: function () {
                            return $(this).text() === '-' ? '' : $(this).text();
                        },
                        validate: function (value) {
                            if ($.trim(value) === '') {
                                return '数值不能为空';
                            }
                            var _n = CONSTANT.revenue_type_conf[oAffsetRowData.revenue_type].decimal;
                            var _reg = new RegExp('^\\d+(\.\\d{1,' + _n + '})?$');
                            if (value !== '' && !_reg.test(value)) {
                                return '请填写大于0的数字，且最多' + _n + '位小数';
                            }
                        }
                    };
                }

                $(this).editable($.extend({}, defaults, option));
            });
        },
        _fnSetTitle: function (products_type, ad_type, mode) { // 动态设置title
            var Json_title = $.extend(true, {}, this.affsetTitle);
            var title_list = Json_title.list = Json_title.list.slice(0);
            if (products_type === CONSTANT.products_type_package) {
                CONSTANT.mode_artif === mode && (title_list.splice(1, 3), title_list.splice(2, 4), title_list.splice(-5, 3));
                if (0 === ad_type) {
                    CONSTANT.mode_artif !== mode && title_list.splice(-3, 1);
                }
                else {
                    CONSTANT.mode_artif !== mode && (title_list.splice(5, 4), title_list.splice(-3, 1));
                }
                if (CONSTANT.mode_adx === mode) {
                    title_list.splice(3, 1, this.oAdxAffsetTitle[0]);
                    title_list.splice(5, 0, this.oAdxAffsetTitle[1]);
                    title_list[0].title = 'Adx简称';
                }
            }
            else if (products_type === CONSTANT.products_type_link) {
                if (CONSTANT.mode_storage_no === mode) {
                    if (CONSTANT.ad_type_app_store === ad_type) {
                        title_list.splice(-5, 1); // 去除渠道号一列
                        title_list.splice(-3, 1); // 去除连接推广一列
                        title_list[10] = {
                            field: 'file',
                            title: '推广链接'
                        };
                    }
                    else {
                        title_list.splice(5, 4), title_list.splice(-5, 2);
                    }
                }
                else {
                    if (CONSTANT.mode_artif === mode) {
                        title_list.splice(1, 3), title_list.splice(2, 4), title_list.splice(-5, 2);
                    }
                    else if (CONSTANT.mode_adx === mode) {
                        title_list.splice(5, 4), title_list.splice(-5, 2);
                        title_list.splice(3, 1, this.oAdxAffsetTitle[0]);
                        title_list.splice(5, 0, this.oAdxAffsetTitle[1]);
                        title_list[0].title = 'Adx简称';
                    }
                }
            }
            if (CONSTANT.mode_storage_yes === mode || CONSTANT.mode_storage_no === mode || CONSTANT.mode_adx === mode) {
                title_list.splice(-2, 0, {
                    field: 'condition',
                    title: '定向投放'
                });
            }
            title_list.unshift({
                field: 'bannerid',
                title: 'bannerid'
            });

            // 添加30日消耗趋势
            title_list.splice(-2, 0, {
                field: 'contact_phone',
                title: '30日消耗趋势',
                width: '190px'
            });
            return Json_title;
        },
        _fnFilter: function () {
            // var _this = this;
            // var oFilter = {
            //     ad_type: _this.postData.ad_type,
            //     platform: _this.postData.platform,
            //     status: _this.postData.status,
            //     day_limit: _this.postData.day_limit,
            //     revenue: _this.postData.revenue,
            //     business_type: _this.postData.business_type,
            //     revenue_type: _this.postData.revenue_type,
            // };
            return JSON.stringify(this.postData);
        },
        _fnCreatTable: function () {
            var _this = this;
            if (typeof dataTable === 'object') {
                dataTable.destroy();
                $('#tab-table').empty();
            }
            Helper.fnCreatTable('#tab-table', this.oCampaignTitle, API_URL.manager_campaign_index, function (td, sData, oData, row, col, table) {
                _this._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                sDom: '<\'row\'<\'col-sm-6\'><\'col-sm-6\'f>><\'row\'<\'col-sm-12\'tr>><\'row\'<\'col-sm-5\'i><\'col-sm-7 table-ll\'lp>>',
                searching: false,
                postData: {
                    search: function () {
                        return ($('input[name=select_search]') && $('input[name=select_search]').length > 0) ? $('input[name=select_search]').val() : '';
                    },
                    filter: function () {
                        return _this._fnFilter();
                    }
                },
                fnDrawCallback: function () {
                    _this._fnDrawCallback(); //  表格编辑
                }
                // fnInitComplete: function (settings, json) {
                //     _this._fnInitComplete(settings, json, this);
                // }
            });
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table, data) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'contact_phone':
                    html += '<div data-type="trend-report" data-campaignid="' + oData.campaignid + '">-</div>';
                    break;
                case 'brief_name':
                    html += '<div class="contact-info" data-type="brief_name">';
                    if (oData.broker_id) { // 代理获客广告主
                        html += '<div>代理商: ' + oData.broker_brief_name + '</div>'
                        + '<div>广告主:' + oData.brief_name + '</div>'
                        + '<div class="tooltip fade right in">'
                        + '<div class="tooltip-arrow" style="top: 20%;">'
                        + '</div><div class="tooltip-inner">'
                        + '<div class="text-left" style="margin-bottom: 4px;">代理商:'
                        + '<span class="ml block">联系人： ' + oData.broker_contact + '</span>'
                        + '<span class="ml block">邮箱： ' + oData.broker_email + '</span>'
                        + '<span class="ml block">手机： ' + oData.broker_contact_phone + '</span>'
                        + '<span class="ml block">QQ： ' + oData.broker_qq + '</span>'
                        + '</div>'
                        + '<div class="text-left" style="margin-bottom: 4px;">广告主:';
                    }
                    else {
                        html += '<div>直客</div>'
                        + '<div>广告主:' + oData.brief_name + '</div>'
                        + '<div class="tooltip fade right in">'
                        + '<div class="tooltip-arrow" style="top: 20%;">'
                        + '</div><div class="tooltip-inner">'
                        + '<div class="text-left" style="margin-bottom: 4px;">直客广告主:';
                    }
                    html += '<span class="ml block">联系人： ' + oData.contact + '</span>'
                        + '<span class="ml block">邮箱： ' + oData.email + '</span>'
                        + '<span class="ml block">手机： ' + oData.contact_phone + '</span>'
                        + '<span class="ml block">QQ： ' + oData.qq + '</span>'
                        + '</div>'
                        + '<div class="text-left" style="margin-bottom: 4px;">销售顾问: ' + oData.creator_name + '</div>'
                        + '<div class="text-left">运营顾问: ' + oData.operation_name + '</div>'
                        + '</div></div>';
                    html += '</div>';
                    break;
                case 'products_name':
                    html += '<div ' + (oData.status !== CONSTANT.CAMPAIGN_STATUS_APPROVE_WAITING && oData.status !== CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT && oData.ad_type !== CONSTANT.ad_type_other ? 'class="pointer"' : '') + ' data-campaignid="' + oData.campaignid + '" data-type="product-info">'
                        + (oData.icon && oData.products_type === CONSTANT.products_type_package ? '<img src="' + oData.icon + '" class="img-rounded app-icon">' : '')
                        + '<span>' + sData + '</span>'
                        + '</div>';
                    break;
                case 'products_type':
                    if (sData === CONSTANT.products_type_package) {
                        html += '<div class="text-center img-prod img-package"></div>';
                    }
                    else {
                        html += '<div class="text-center img-prod img-link"></div>';
                    }
                    break;
                case 'appinfos_app_name':
                    html += '<div>名称: ' + oData.appinfos_app_name + '</div>';
                    if (oData.status === CONSTANT.CAMPAIGN_STATUS_APPROVE_WAITING || oData.status === CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT) {
                        html += '<div>业务: ' + LANG.business_type[oData.business_type] + '</div>';
                    }
                    else {
                        html += '<span class="table-edit business_type" data-label ="business_type" data-campaignid="' + oData.campaignid + '" data-value="' + oData.business_type + '" data-field="business_type" >业务: ' + LANG.business_type[oData.business_type] + '</span>';
                    }
                    html += '<div>类型: ' + LANG.ad_type[oData.ad_type] + '</div>'
                    + '<div>平台: ' + (oData.platform === 3 ? LANG.platform_group[7] : LANG.platform_group[oData.platform]) + '</div>'
                    + '<div>计费: ' + LANG.revenue_type[oData.revenue_type] + '</div>'
                    + '<div>创建: ' + oData.created_at + '</div>';
                    break;
                case 'equivalence': // 等价关系
                    if (oData.status === CONSTANT.CAMPAIGN_STATUS_DELIVERY || oData.status === CONSTANT.CAMPAIGN_STATUS_PAUSE) {
                        if (oData.ad_type !== CONSTANT.ad_type_app_market) {
                            html += '-';
                        }
                        else {
                            $(td).addClass('cursor equivalence');
                        }
                    }
                    else {
                        html += '-';
                    }
                    break;
                // case 'contact':
                //     html += '<span class="js-word2vec center-block text-warning cursor" data-campaignid="' + oData.campaignid + '">管理</span>'; //  word2vec
                //     break;
                case 'condition':
                    if (sData == null || sData === '') {
                        html += '<span class="condition cursor" data-campaignid="' + oData.campaignid + '">不限</span>';
                    }
                    else {
                        html += '<span class="text-warning condition cursor" data-campaignid="' + oData.campaignid + '">查看/修改</span>';
                    }
                    break;
                case 'revenue':
                    if (oData.ad_type === CONSTANT.ad_type_other || oData.revenue_type === CONSTANT.revenue_type_cps) {
                        html += '<div>基础: -</div>';
                    }
                    else {
                        if (oData.status !== CONSTANT.CAMPAIGN_STATUS_APPROVE_WAITING) {
                            html += '<div class="revenue-history">基础: ';
                        }
                        else {
                            html += '<div>基础: ';
                        }
                        html += Helper.fnFormatMoney(sData, CONSTANT.revenue_type_conf[oData.revenue_type].decimal);
                        html += '</div>';
                    }
                    if ((oData.ad_type === CONSTANT.ad_type_app_market || oData.ad_type === CONSTANT.ad_type_app_store) && oData.revenue_type !== CONSTANT.revenue_type_cps) {
                        html += oData.keyword_price_up_count > 0 ? '<span data-campaignid="' + oData.campaignid + '" class="js-keyword-handle center-block cursor">加价: <span class="text-warning">查看</span></span>' : '加价:<span data-campaignid="' + oData.campaignid + '" class="js-keyword-handle add btn btn-default">增加</span>';
                    }
                    else {
                        html += '<div>加价: -</div>';
                    }
                    if (oData.ad_type === CONSTANT.ad_type_other) {
                        html += '<div>折扣: -</div>';
                    }
                    else {
                        var rate = oData.rate !== '' ? oData.rate : '100';
                        html += '<span class="table-edit rate" data-field="rate" data-campaignid="' + oData.campaignid + '" data-value="' + parseInt(rate, 10) + '">折扣: ' + parseInt(rate, 10) + '%</span>';
                    }
                    break;
                case 'day_limit':
                    html += '<div>日: ';
                    if (oData.ad_type === CONSTANT.ad_type_other || oData.revenue_type === CONSTANT.revenue_type_cps) {
                        html += '-';
                    }
                    else {
                        html += Helper.fnFormatMoney(oData.day_limit, 0);
                    }
                    html += '</div><div>总: ';
                    if (oData.ad_type === CONSTANT.ad_type_other || oData.revenue_type === CONSTANT.revenue_type_cps) {
                        html += '-';
                    }
                    else {
                        html += (!oData.total_limit || oData.total_limit === '0.00' || oData.total_limit === 0.00) ? '不限' : Helper.fnFormatMoney(oData.total_limit, 0);
                    }
                    html += '</div>';
                    break;
                case 'products_show_name':
                    var _tips = '';
                    if (oData.compare_version === 1) {
                        _tips = ' <i data-toggle="tooltip" title="需更新包" class="fa fa-exclamation-circle text-warning"></i>';
                    }
                    else if (oData.compare_version === 2) {
                        _tips = ' <i data-toggle="tooltip" title="失效的appstore推广链接" class="fa fa-exclamation-circle text-warning"></i>';
                    }
                    html += '<span style="white-space:nowrap;">';
                    html += (oData.status === CONSTANT.CAMPAIGN_STATUS_DELIVERY || oData.status === CONSTANT.CAMPAIGN_STATUS_PAUSE) ? '<span class="affset-bt pointer text-warning">' + oData.launched_media + '/' + oData.all_media + '</span>' + _tips : '-';
                    html += '</span>';
                    break;
                case 'status':
                    html += '<span style="white-space:nowrap;">';
                    if (sData === CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT) {
                        html += LANG.MANAGER_CAMPAIGN_STATUS[sData] + '<i data-toggle="tooltip" title="' + (oData.approve_comment ? oData.approve_comment : '&nbsp;') + '" class="fa fa-exclamation-circle text-warning"></i>';
                    }
                    else if (sData === CONSTANT.CAMPAIGN_STATUS_PAUSE) {
                        html += LANG.CAMPAIGN_PAUSE_STATUS[oData.pause_status];
                    }
                    else {
                        html += LANG.MANAGER_CAMPAIGN_STATUS[sData];
                    }
                    html += '</span>';
                    break;
                case 'operation_time':
                    html += oData.approve_user ? oData.approve_user + '<br />' + sData : '-';
                    $(td).addClass('log').data('category', 110);
                    break;
                case 'campaignid':
                    var status = oData.status;
                    if (status === CONSTANT.CAMPAIGN_STATUS_DELIVERY) {
                        html += '<button data-status="' + CONSTANT.CAMPAIGN_STATUS_PAUSE + '" data-campaignid="' + sData + '" class="btn btn-default js-btn-status"><i class="fa fa-pause"></i> 暂停</button>';
                        // html += '<a target="_blank" href="../stat/index.html#dayType=5&role=clients&audit=0&id=' + oData.campaignid + '&name=' + escape(oData.appinfos_app_name) + '" class="btn btn-default"><i class="fa fa-file-text-o"></i> 报表</a>';
                    }
                    else if (status === CONSTANT.CAMPAIGN_STATUS_PAUSE) {
                        var pauseStatus = oData.pause_status;
                        if (pauseStatus === CONSTANT.CAMPAIGN_PAUSE_STATUS_MANAGER) {
                            html += '<button data-status="' + CONSTANT.CAMPAIGN_STATUS_DELIVERY + '" data-campaignid="' + sData + '" class="btn btn-default js-btn-status"><i class="fa fa-plus-square"></i> 继续投放</button>';
                            html += '<button data-status="' + CONSTANT.CAMPAIGN_STATUS_STOP + '" data-campaignid="' + sData + '" class="btn btn-default js-btn-status"><i class="fa fa-minus-square"></i> 停止投放</button>';
                        }
                        else {
                            html += '<button data-status="' + CONSTANT.CAMPAIGN_STATUS_PAUSE + '" data-campaignid="' + sData + '" class="btn btn-default js-btn-status"><i class="fa fa-pause"></i> 暂停</button>';
                        }
                        // html += '<a target="_blank" href="../stat/index.html#dayType=5&role=clients&audit=0&id=' + oData.campaignid + '&name=' + escape(oData.appinfos_app_name) + '" class="btn btn-default"><i class="fa fa-file-text-o"></i> 报表</a>';
                    }
                    else if (status === CONSTANT.CAMPAIGN_STATUS_APPROVE_WAITING || status === CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT) {
                        html += '<button data-campaignid="' + sData + '" class="btn btn-default js-btn-approve"><i class="fa fa-check-square"></i> 审核</button>';
                    }
                    else if (status === CONSTANT.CAMPAIGN_STATUS_STOP) {
                        html += '<button data-status="' + CONSTANT.CAMPAIGN_STATUS_DELIVERY + '" data-campaignid="' + sData + '" class="btn btn-default js-btn-status"><i class="fa fa-plus-square"></i> 再次投放</button>';
                        // html += '<a target="_blank" href="../stat/index.html#dayType=5&role=clients&audit=0&id=' + oData.campaignid + '&name=' + escape(oData.appinfos_app_name) + '" class="btn btn-default"><i class="fa fa-file-text-o"></i> 报表</a>';
                    }
                    break;
                default:
                    break;
            }
            html !== '' && $(td).html(html);
        },
        _fnRevenueHistoryCustomColumn: function (td, sData, oData, row, col, table) {
            var map = window.revenueTb.map;
            var No = map.count - (map.pageNo - 1) * map.pageSize;
            var thisCol = table.nameList[col];
            if (thisCol === 'revenue_no') {
                $(td).html(No - row);
            }
        },
        _fnEquivalenceCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'name':
                    html += '<div>' + '<img src="' + oData.icon + '" class="img-rounded app-icon">'
                        + '<span>' + sData + '</span>'
                        + '</div>';
                    break;
                case 'revenue':
                    html += Helper.fnFormatMoney(sData, CONSTANT.revenue_type_conf[oData.revenue_type].decimal);
                    break;
                case 'day_limit':
                    html += Helper.fnFormatMoney(sData, 0);
                    break;
                case 'total_limit':
                    html += (!sData || sData === '0.00' || sData === 0.00) ? '不限' : Helper.fnFormatMoney(sData, 0);
                    break;
                case 'status':
                    if (sData === CONSTANT.CAMPAIGN_STATUS_PAUSE) {
                        html += LANG.CAMPAIGN_PAUSE_STATUS[oData.pause_status];
                    }
                    else {
                        html += LANG.MANAGER_CAMPAIGN_STATUS[sData];
                    }
                    break;
                case 'relation':
                    html += LANG.relation[sData];
                    break;
                case 'icon':
                    if (oData.relation === CONSTANT.relation_self) {
                        html += '-';
                    }
                    else if (oData.relation === CONSTANT.relation_ad) {
                        html += '<button class="btn btn-default equivalence-action" data-action=2>删除等价</button>';
                    }
                    else {
                        html += '<button class="btn btn-default equivalence-action" data-action=1>等价</button>';
                    }
                    break;
                default:
                    break;
            }
            html !== '' && $(td).html(html);
        },
        _fnDrawCallback: function () {
            $('#tab-table [data-toggle="tooltip"]').tooltip({
                placement: 'right',
                trigger: 'hover'
            });
            var defaults = {
                type: 'percent',
                title: '修改广告折扣',
                url: API_URL.manager_campaign_update,
                params: function () {
                    return {
                        campaignid: $(this).attr('data-campaignid'),
                        field: $(this).attr('data-field')
                    };
                },
                success: function (response) {
                    if (!response.res) {
                        dataTable.reload(null, false);
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                }
            };
            $('#tab-table [data-type="trend-report"]').each(function (index, el) {
                var data = dataTable.row($(this).parent()).data();
                if (data.status === CONSTANT.CAMPAIGN_STATUS_DELIVERY || data.status === CONSTANT.CAMPAIGN_STATUS_PAUSE) {
                    TrendReport.getMediaTrend($(this).attr('data-campaignid'));
                }
            });
            $('#tab-table .table-edit').each(function (index, el) {
                var option = {};
                if ($(this).hasClass('rate')) {
                    option = {
                        value: $(this).data('value'),
                        validate: function (value) {
                            if ($.trim(value) !== '' && isNaN(value)) {
                                return '请填写有效的广告折扣';
                            }
                            else if (value <= 0 || value > 100 || !/^\d+$/.test(value)) {
                                return '广告折扣值必须大于0且小于等于100的正整数';
                            }
                        }
                    };
                }
                else if ($(this).hasClass('business_type')) {
                    option = {
                        type: 'select',
                        title: '修改业务类型',
                        value: $(this).data('value'),
                        source: LANG.business_type
                    };
                }
                $(this).editable($.extend({}, defaults, option));
            });
            /* eslint no-undef: [0]*/
            $('#tab-table').delegate('.condition', 'click', function () {
                var _this = $(this);
                $('#modal-directional-delivery').modal('show').off('shown.bs.modal').on('shown.bs.modal', function () {
                    CampaignDirectional.fnInit(dataTable.row(_this.parent().parent()[0]).data());
                });
            });
        },

        // _fnBindSelect: function (mData, obj) {
        //     var _this = this;
        //     $('<select data-name="' + mData + '"><option value="">所有</option></select>').appendTo(obj).on('change', function (evt) {
        //         _this.postData[mData] = $(this).val();
        //         evt.stopPropagation();
        //         dataTable.reload();
        //     }).on('focus', function (evt) {
        //         $(this).val(_this.postData[mData]);
        //     });
        // },

        _fnUpdateBindSelect: function (mData, obj) {
            var _this = this;
            $('<select data-name="' + mData + '"><option value="">所有</option></select>').appendTo(obj).on('change', function (evt) {
                _this.oFilter[mData] = $(this).val();
                evt.stopPropagation();
                dataTable.reload();
            }).on('focus', function (evt) {
                $(this).val(_this.oFilter[mData]);
            });
        },

        // _fnInitComplete: function (settings, json, obj) {
        //     var _this = this;
        //     var aoColumns = settings.aoColumns;
        //     var api = obj.api();
        //     for (var i = 0, j = aoColumns.length; i < j; i++) {
        //         var mData = aoColumns[i].mData;
        //         if (mData === 'ad_type' || mData === 'platform' || mData === 'revenue_type' || mData === 'revenue' || mData === 'day_limit' || mData === 'status' || mData === 'business_type') {
        //             var column = api.column(i);
        //             var $span = $('<span class="addselect">▾</span>').appendTo($(column.header()));
        //             _this._fnBindSelect(mData, $span);
        //         }
        //     }

        //     var items = LANG.MANAGER_AD_TYPE;
        //     var key = null;
        //     var html = '';
        //     for (key in items) {
        //         html += '<option value="' + key + '">' + items[key] + '</option>';
        //     }
        //     $('select[data-name="ad_type"]').append(html);

        //     items = LANG.platform_group;
        //     html = '';
        //     for (key in items) {
        //         html += '<option value="' + key + '">' + items[key] + '</option>';
        //     }
        //     $('select[data-name="platform"]').append(html);

        //     items = LANG.revenue_type;
        //     html = '';
        //     for (key in items) {
        //         html += '<option value="' + key + '">' + items[key] + '</option>';
        //     }
        //     $('select[data-name="revenue_type"]').append(html);
        //     // items = LANG.MANAGER_CAMPAIGN_STATUS;
        //     items = $.extend({}, LANG.manager_status_select);
        //     delete items[4];
        //     html = '';
        //     for (key in items) {
        //         html += '<option value="' + key + '">' + items[key] + '</option>';
        //     }
        //     $('select[data-name="status"]').append(html);
        //     items = $.extend({}, LANG.business_type);
        //     delete items[0];
        //     html = '';
        //     for (key in items) {
        //         html += '<option value="' + key + '">' + items[key] + '</option>';
        //     }
        //     $('select[data-name="business_type"]').append(html);

        //     $.get(API_URL.manager_campaign_revenue, function (json) {
        //         if (json && json.res === 0 && json.list) {
        //             var html = '';
        //             for (var i = 0; i < json.list.length; i++) {
        //                 html += '<option value="' + json.list[i].revenue + '">' + Helper.fnFormatMoney(json.list[i].revenue) + '</option>';
        //             }
        //             $('select[data-name="revenue"]').append(html);
        //         }
        //     });

        //     $.get(API_URL.manager_campaign_day_limit, function (json) {
        //         if (json && json.res === 0 && json.list) {
        //             var html = '';
        //             for (var i = 0; i < json.list.length; i++) {
        //                 html += '<option value="' + json.list[i].day_limit + '">' + Helper.fnFormatMoney(json.list[i].day_limit, 0) + '</option>';
        //             }
        //             $('select[data-name="day_limit"]').append(html);
        //         }
        //     });
        // },
        _fnMaterialsInitComplete: function (settings, json, obj) {
            var _this = this;
            var aoColumns = settings.aoColumns;
            var api = obj.api();
            for (var i = 0, j = aoColumns.length; i < j; i++) {
                var mData = aoColumns[i].mData;
                if (mData === 'products_type' || mData === 'status') {
                    var column = api.column(i);
                    var $span = $('<span class="addselect">▾</span>').appendTo($(column.header()));
                    _this._fnUpdateBindSelect(mData, $span);
                }
            }

            var items = LANG.products_type;
            var key = null;
            var html = '';
            for (key in items) {
                html += '<option value="' + key + '">' + items[key] + '</option>';
            }
            $('select[data-name="products_type"]').append(html);
            items = LANG.MATERIALS_STATUS;
            html = '';
            for (key in items) {
                html += '<option value="' + key + '">' + items[key] + '</option>';
            }
            $('select[data-name="status"]').append(html);
        },

        _fnKeywordInitHandle: function () {
            var _this = this;
            var _fnreposition = function (X, Y, obj) {
                var dheight = $(document).height();
                if (dheight - Y - 50 > obj.height() || Y + 50 < obj.height()) {
                    obj.css({
                        left: X + 38,
                        top: Y
                    });
                }
                else {
                    obj.css({
                        left: X + 38,
                        top: Y - obj.height()
                    });
                }
            };
            var _fnAddWordVec = function () {
                return '<tr><td><textarea class="form-control" rows="3" name="word2vec-content"></textarea></td><td style="vertical-align: middle"><input type="number" name="word2vec-limit" value="60" max="100" min="0" style="width:80px" /></td><td class="word2vec-contrl"><span class="btn btn-default js-addVecBt mr">添加</span> <i class="fa fa-trash fa-lg js-deleteVec-edit"></i></td></tr>';
            };
            var _fnrealoadVec =  function (json) {
                var subtr = '';
                var data = json.list;
                if (!data) {
                    subtr = _fnAddWordVec();
                }
                else {
                    for (var k = 0; k < data.length; k++) {
                        var row = data[k];
                        subtr += '<tr data-kid="' + row.cid + '"><td class="word2vec-content"><span class="table-edit word2vec-edit" style="max-height:200px; overflow-y:auto">' + row.content + '</span></td>';
                        subtr += '<td class="word2vec-limit"><span class="table-edit word2vec-limit-edit">' + row.limit + '</span></td>';
                        subtr += '<td class="word2vec-contrl"><span class="js-deleteVec"><i class="fa fa-trash fa-lg"></i></span> <i class="fa fa-plus fa-lg js-addVec"></i></td>';
                        subtr += '</tr>';
                    }
                }
                $('#word2vec-manage tbody').html(subtr);
                _this._fnInitWordvec();
            };

            //  增加关键字
            $('#tab-table-wrapper').on('click', '.js-keyword-handle', function (e) {
                var innerSelf = $(this);
                var cid = innerSelf.data('campaignid');
                var Y = innerSelf.offset().top;
                var X = innerSelf.offset().left;
                var subtr = '';
                var moneyLimit = _this.oMoneyLimit;
                $('#floatertb tbody').empty();
                $('#zones-up').attr('cid', cid);
                if (innerSelf.hasClass('add')) {
                    var $th = $('<tr><td><input type="text" class="addKeyTxt" name="keyword" maxlength="30" /></td><td><input type="number" name="price_up" class="addKeyPrice" value="0" step="0.1" max="' + moneyLimit.key_max + '" min="' + moneyLimit.key_min + '" /></td><td><span class="btn btn-default js-addKeyBt mr">添加</span><i class="fa fa-trash fa-lg js-deleteKey-edit"></i></td></tr>');
                    $th.appendTo('#floatertb tbody');
                    var $tb = $('#zones-up');
                    $tb.show();
                    _fnreposition(X, Y, $tb);
                    return false;
                }

                Helper.load_ajax();
                var param = {
                    campaignid: cid,
                    t: Math.random()
                };
                $.post(API_URL.manager_keyword_index, param, function (json) {
                    Helper.close_ajax();
                    if (0 === json.res) {
                        var data = json.list;
                        for (var k = 0; k < data.length; k++) {
                            var row = data[k];
                            var star = '';

                            if (row.is_manager === 1) {
                                star += '运营添加';
                            }
                            else {
                                // for (var j = 0; j < (5 - (row.rank - 1)); j++) {
                                //     star += '<i class="fa fa-star text-warning"></i>';
                                // }
                                for (var i = 0; i !== parseInt(row.rank / 2, 10); i++) {
                                    star += '<i class="fa fa-star text-warning"></i>';
                                }
                                if (row.rank % 2) {
                                    star += '<i class="fa fa-star-half-o text-warning"></i>';
                                }
                                for (var j = 0; j !== 5 - Math.ceil(row.rank / 2); j++) {
                                    star += '<i class="fa fa-star-o text-warning"></i>';
                                }
                            }

                            subtr += '<tr data-kid="' + row.id + '"><td>' + row.keyword + '</td>';
                            subtr += '<td><span ' + (row.is_manager === 1 ? 'class="table-edit price-edit"' : '') + ' zone-id=' + data[k].id + ' cid=' + data[k].campaignid + ' rel="key_price" title="修改">' + Number(row.price_up).toFixed(1) + '</span></td>';
                            subtr += '<td>' + star + '<span class="pull-right"><i class="fa fa-plus fa-lg js-addKey"></i></span>' + (row.is_manager === 1 ? '<span class="js-deleteKey pull-right mr"><i class="fa fa-trash fa-lg"></i></span>' : '') + '</td></tr>';
                        }
                        $(subtr).appendTo('#floatertb tbody');
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                    var $tb = $('#zones-up');
                    $tb.show();
                    _fnreposition(X, Y, $tb);
                    _this._fnInitPriceUp();
                }).fail(function () {
                    Helper.close_ajax();
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                });
                e.stopPropagation();
            });
            $('#zones-up-close').on('click', function (e) {
                $('#zones-up').hide();
                e.stopPropagation();
            });
            $(document).click(function (e) {
                var con = $('#zones-up');
                if (!con.is(e.target) && con.has(e.target).length === 0) {
                    $('#zones-up').hide();
                }
            });

            $('#zones-up').on('click', '.js-addKey', function () {
                if ($('input[name="price_up"]').length > 0) {
                    return;
                }
                var moneyLimit = _this.oMoneyLimit;
                var th = $('<tr><td><input type="text" class="addKeyTxt" name="keyword" maxlength="30" /></td><td><input type="number" name="price_up" class="addKeyPrice" value="0" step="0.1" max="' + moneyLimit.key_max + '" min="' + moneyLimit.key_min + '" /></td><td><span class="btn btn-default js-addKeyBt mr">添加</span><i class="fa fa-trash fa-lg fr js-deleteKey-edit"></i></td></tr>');
                th.appendTo('#floatertb tbody');
                $('.addKeyTxt').focus();
            });

            $('#zones-up').delegate('input[name=price_up]', 'change', function () {
                var min = $(this).attr('min');
                var max = $(this).attr('max');
                if (parseFloat($(this).val()) < parseFloat(min)) {
                    $(this).val(min);
                }
                if (parseFloat($(this).val()) > parseFloat(max)) {
                    $(this).val(max);
                }
                $(this).val(parseFloat($(this).val()).toFixed(1));
            });

            $('#zones-up').delegate('.js-addKeyBt', 'click', function () {
                var $tr = $(this).parents('tr');
                var $addKeyPrice = $tr.find('input[name="price_up"]');
                var $addKeyTxt = $tr.find('input[name="keyword"]');
                var addKeyTxt = $.trim($addKeyTxt.val());
                var addKeyPrice = $addKeyPrice.val();
                if (addKeyTxt === '') {
                    $addKeyTxt.css('border-color', '#FC7603');
                    setTimeout(function () {
                        $addKeyTxt.css('border-color', '#ccc');
                        $addKeyTxt.focus();
                    }, 500);
                    return;
                }

                if (addKeyPrice === '') {
                    $addKeyPrice.css('border-color', '#FC7603');
                    setTimeout(function () {
                        $addKeyPrice.css('border-color', '#ccc');
                        $addKeyPrice.focus();
                    }, 500);
                    return;
                }

                var param = {
                    campaignid: $('#zones-up').attr('cid'),
                    keyword: addKeyTxt,
                    price_up: addKeyPrice,
                    t: Math.random()
                };

                Helper.load_ajax();
                $.post(API_URL.manager_keyword_store, param, function (json) {
                    Helper.close_ajax();
                    var subtr = '';
                    if (0 === json.res) {
                        $('#floatertb tbody').empty();
                        var data = json.list;
                        for (var k = 0; k < data.length; k++) {
                            var row = data[k];
                            var star = '';

                            if (row.is_manager === 1) {
                                star += '运营添加';
                            }
                            else {
                                for (var i = 0; i !== parseInt(row.rank / 2, 10); i++) {
                                    star += '<i class="fa fa-star text-warning"></i>';
                                }
                                if (row.rank % 2) {
                                    star += '<i class="fa fa-star-half-o text-warning"></i>';
                                }
                                for (var j = 0; j !== 5 - Math.ceil(row.rank / 2); j++) {
                                    star += '<i class="fa fa-star-o text-warning"></i>';
                                }
                            }

                            subtr += '<tr data-kid="' + row.id + '"><td>' + row.keyword + '</td>';
                            subtr += '<td><span ' + (row.is_manager === 1 ? 'class="table-edit price-edit"' : '') + ' zone-id=' + data[k].id + ' cid=' + data[k].campaignid + ' rel="key_price" title="修改">' + Number(row.price_up).toFixed(1) + '</span></td>';
                            subtr += '<td>' + star + '<span class="pull-right"><i class="fa fa-plus fa-lg js-addKey"></i></span>' + (row.is_manager === 1 ? '<span class="js-deleteKey pull-right mr"><i class="fa fa-trash fa-lg"></i></span>' : '') + '</td></tr>';
                        }
                        $(subtr).appendTo('#floatertb tbody');

                        _this._fnInitPriceUp();

                        if ($('#floatertb tbody tr').length === 1) {
                            dataTable.reload(null, false);
                        }
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                        $('.prompt').addClass('zones-up');
                    }
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                    Helper.close_ajax();
                });
            });

            $('#zones-up').delegate('.js-deleteKey', 'click', function (e) {
                $('.js-deleteKey').html('<i class="fa fa-trash fa-lg"></i>');
                $(this).html('<i class="js-deleKeyDown cursor">删除</i>');
                e.stopPropagation();
            });

            $('#zones-up').delegate('.js-deleKeyDown', 'click', function (e) {
                var $tr = $(this).parents('tr');
                var param = {
                    campaignid: $('#zones-up').attr('cid'),
                    id: $tr.attr('data-kid'),
                    t: Math.random()
                };
                Helper.load_ajax();
                $.post(API_URL.manager_keyword_delete, param, function (json) {
                    Helper.close_ajax();
                    if (0 === json.res) {
                        $tr.remove();
                        if ($('#floatertb tbody tr').length === 0) {
                            dataTable.reload(null, false);
                            $('#zones-up').hide();
                        }
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                    Helper.close_ajax();
                });
                e.stopPropagation();
            });

            $('#zones-up').delegate('.js-deleteKey-edit', 'click', function (e) {
                $(this).parents('tr').remove();
                if ($('#floatertb tbody tr').length === 0) {
                    $('#zones-up').hide();
                }
                e.stopPropagation();
            });
            // wordvec
            // $('#tab-table-wrapper').on('click', '.js-word2vec', function (e) {
            //     var innerSelf = $(this);
            //     var cid = innerSelf.data('campaignid');
            //     var Y = innerSelf.offset().top;
            //     var X = innerSelf.offset().left;
            //     $('#word2vec-manage').attr('cid', cid);
            //     Helper.load_ajax();
            //     var param = {
            //         campaignid: cid,
            //         t: Math.random()
            //     };
            //     $.post(API_URL.manager_campaign_word_list, param, function (json) {
            //         Helper.close_ajax();
            //         if (0 === json.res) {
            //             _fnrealoadVec(json);
            //         }
            //         else {
            //             Helper.fnPrompt(json.msg);
            //         }
            //         var $tb = $('#word2vec-manage');
            //         $tb.show();
            //         _fnreposition(X, Y, $tb);

            //     }).fail(function () {
            //         Helper.close_ajax();
            //         Helper.fnPrompt('服务器请求失败，请稍后重试！');
            //     });

            //     e.stopPropagation();
            // });
            $('#js-affset-modal').on('click', '.js-word2vec', function (e) {
                var innerSelf = $(this);
                var cid = window.oRowData.campaignid;
                var Y = innerSelf.offset().top;
                var X = innerSelf.offset().left;
                $('#word2vec-manage').attr('cid', cid);
                Helper.load_ajax();
                var param = {
                    campaignid: cid,
                    t: Math.random()
                };
                $.post(API_URL.manager_campaign_word_list, param, function (json) {
                    Helper.close_ajax();
                    if (0 === json.res) {
                        _fnrealoadVec(json);
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                    var $tb = $('#word2vec-manage');
                    $tb.show();
                    _fnreposition(X, Y, $tb);

                }).fail(function () {
                    Helper.close_ajax();
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                });

                e.stopPropagation();
            });
            $('#word2vec-manage-close').on('click', function (e) {
                $('#word2vec-manage').hide();
                e.stopPropagation();
            });

            $('#word2vec-manage').on('click', '.js-addVec', function () {
                var _s = _fnAddWordVec();
                var th = $(_s);
                th.appendTo('#word2vec-manage tbody');
                $('textarea[name="word2vec-content"]').focus();
            });

            $('#word2vec-manage').delegate('.js-addVecBt', 'click', function () {
                var $tr = $(this).parents('tr');
                var content = $tr.find('textarea[name="word2vec-content"]').val();
                var param = {
                    campaignid: $('#word2vec-manage').attr('cid'),
                    content: content,
                    limit: $tr.find('input[name="word2vec-limit"]').val(),
                    t: Math.random()
                };

                Helper.load_ajax();
                $.post(API_URL.manager_campaign_word_new, param, function (json) {
                    Helper.close_ajax();
                    if (0 === json.res) {
                        _fnrealoadVec(json);
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                        $('.prompt').addClass('zones-up');
                    }
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                    Helper.close_ajax();
                });
            });


            $('#word2vec-manage').delegate('.js-deleVecDown', 'click', function (e) {
                var $tr = $(this).parents('tr');
                var param = {
                    campaignid: $('#word2vec-manage').attr('cid'),
                    cid: $tr.attr('data-kid'),
                    t: Math.random()
                };
                Helper.load_ajax();
                $.post(API_URL.manager_campaign_word_delete, param, function (json) {
                    Helper.close_ajax();
                    if (0 === json.res) {
                        _fnrealoadVec(json);
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                    Helper.close_ajax();
                });
                e.stopPropagation();
            });

            $('#word2vec-manage').delegate('.js-deleteVec', 'click', function (e) {
                $('.js-deleteVec').html('<i class="fa fa-trash fa-lg"></i>');
                $(this).html('<i class="js-deleVecDown cursor">删除</i>');
                e.stopPropagation();
            });
            $('#word2vec-manage').delegate('.js-deleteVec-edit', 'click', function (e) {
                $(this).parents('tr').remove();
                if ($('#word2vec-manage tbody tr').length === 0) {
                    $('#word2vec-manage').hide();
                }
                e.stopPropagation();
            });

            $(document).click(function (e) {
                var con = $('#word2vec-manage');
                if (!con.is(e.target) && con.has(e.target).length === 0) {
                    $('#word2vec-manage').hide();
                }
            });
        },

        _fnInitPriceUp: function () { //  初始化修改关键字加价弹出框
            var moneyLimit = this.oMoneyLimit;
            $('#floatertb .table-edit.price-edit').editable({
                type: 'number',
                placement: 'right',
                clear: false,
                params: function () {
                    return {
                        id: $(this).attr('zone-id'),
                        campaignid: $(this).attr('cid'),
                        keyword: $(this).parents('td').prev('td').text(),
                        price_up: $('.editable-input input[type="number"').val()
                    };
                },
                url: API_URL.manager_keyword_store,
                success: function (response) {
                    if (response.res === 0) {
                        $(this).text(Number($('.editable-input input[type="number"').val()).toFixed(1));
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                },
                displayVal: function () {
                    return $(this).text();
                },
                name: 'price_up',
                title: '修改关键字加价',
                step: '0.1',
                max: moneyLimit.key_max,
                min: moneyLimit.key_min,
                validate: function (value) {
                    if ($.trim(value) === '') {
                        return '关键字加价必须大于等于' + moneyLimit.key_min + '小于等于' + moneyLimit.key_max;
                    }
                }
            });
        },
        _fnInitWordvec: function () { //  初始化修改关键字加价弹出框
            $('#word2vec-manage .table-edit.word2vec-edit').editable({
                type: 'textarea',
                placement: 'right',
                clear: false,
                url: API_URL.manager_campaign_word_modify,
                name: 'content',
                title: '修改广告文本',
                params: function () {
                    return {
                        campaignid: $('#word2vec-manage').attr('cid'),
                        cid: $(this).parents('tr').attr('data-kid')
                    };
                },
                displayVal: function () {
                    return $(this).text();
                },
                success: function (response) {
                    if (response.res === 0) {
                        $(this).text($('.word2vec-content  textarea').val());
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                }
            });

            $('#word2vec-manage .table-edit.word2vec-limit-edit').editable({
                type: 'number',
                placement: 'right',
                clear: false,
                params: function () {
                    return {
                        campaignid: $('#word2vec-manage').attr('cid'),
                        cid: $(this).parents('tr').attr('data-kid')
                    };
                },
                displayVal: function () {
                    return $(this).text();
                },
                url: API_URL.manager_campaign_word_modify,
                success: function (response) {
                    if (response.res === 0) {
                        $(this).text(Number($('.word2vec-limit input[type="number"').val()));
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                },
                name: 'limit',
                title: '修改阈值',
                step: '1',
                max: 100,
                min: 0,
                validate: function (value) {
                    var _v = $.trim(value);
                    if (_v === '' || _v < 0 || _v > 100) {
                        return '关键字加价必须大于等于0小于等于100';
                    }
                }
            });
        },

        _fnChangeStatus: function ($ele) {
            var campaignid = $ele.attr('data-campaignid');
            var status = $ele.attr('data-status');
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
            $.post(API_URL.manager_campaign_check, param, function (json) {
                Helper.close_ajax();
                callback(json);
            }).fail(function () {
                Helper.close_ajax();
                callback(-1);
            });
        },

        _fnOpenApprovePanel: function ($ele) {
            var campaignid = $ele.attr('data-campaignid');
            var param = {
                campaignid: campaignid
            };
            $.post(API_URL.manager_campaign_info, param, function (json) {
                if (0 === json.res) {
                    $('#approve-tpl-wrapper').html($.tmpl('#tpl-campaign-info', $.extend({info_type: 'approve', business: LANG.business_type}, (json.list ? json.list : {}))));
                    $('#approve-tpl-wrapper .js-err-msg').text('');
                    $('#approve-tpl-wrapper .fancybox').fancybox();
                    $('#approve-panel').modal({
                        backdrop: 'static',
                        show: true
                    });
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            }).fail(function () {
                Helper.close_ajax();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        _fnApproveAccept: function () {
            var flag = true;
            var data = {};
            var productType = +$('#approve-product-type').val();
            if (productType === CONSTANT.products_type_package) {
                var channel = $.trim($('#approve-channel').val());
                if (channel === '') {
                    $('#channel-err-msg').text('请输入渠道号');
                    flag = false;
                }
                else {
                    data.channel = channel;
                }
            }

            var rate = $.trim($('#approve-rate').val());
            if (rate === '' || isNaN(rate) || rate < 0 || rate > 100 || !/^\d+$/.test(rate)) {
                $('#rate-err-msg').text('请填写有效的广告折扣（正整数）');
                flag = false;
            }
            else {
                data.rate = rate;
            }

            if (!flag) {
                return;
            }
            data.business_type = $('select[name="business-type"]').val();
            var _this = this;
            var campaignid = $('#approve-campaignid').val();
            var status = CONSTANT.CAMPAIGN_STATUS_DELIVERY;
            this._fnCheckStatus(campaignid, status, data, function (json) {
                if (json === -1) {
                    Helper.fnAlert('服务器请求失败，请稍后重试');
                }
                else if (0 === json.res) {
                    $('#approve-panel').modal('hide');
                    dataTable.reload(null, false);
                    _this._fnFreshNum();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            });
        },

        _fnApproveReject: function () {
            $('#reject-content').val('');
            $('#reject-msg').text('');
            // $('#approve-reject-panel').fadeIn();
            $('#approve-reject-panel').modal({
                backdrop: 'static',
                show: true
            });
        },

        _fnApproveRejectAccept: function () {
            var comment = $('#reject-content').val();
            if ($.trim(comment) === '') {
                $('#reject-msg').text('请填写拒绝原因');
                return;
            }
            var campaignid = $('#approve-campaignid').val();
            var status = CONSTANT.CAMPAIGN_STATUS_APPROVE_REJECT;
            var data = {
                approve_comment: comment
            };
            var _this = this;
            this._fnCheckStatus(campaignid, status, data, function (json) {
                if (json === -1) {
                    Helper.fnAlert('服务器请求失败，请稍后重试');
                }
                else if (0 === json.res) {
                    // $('#approve-reject-panel').fadeOut();
                    $('#approve-reject-panel').modal('hide');
                    $('#approve-panel').modal('hide');
                    dataTable.reload(null, false);
                    _this._fnFreshNum();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            });
        },

        _fnOpenProductInfoPanel: function ($ele) {
            var campaignid = $ele.attr('data-campaignid');
            var param = {
                campaignid: campaignid
            };
            $.post(API_URL.manager_campaign_info, param, function (json) {
                if (0 === json.res) {
                    $('#info-tpl-wrapper').html($.tmpl('#tpl-campaign-info', $.extend({info_type: 'info'}, (json.list ? json.list : {}))));
                    $('#info-tpl-wrapper .fancybox').fancybox();
                    $('#product-info-panel').modal({
                        backdrop: 'static',
                        show: true
                    });
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            }).fail(function () {
                Helper.close_ajax();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },
        _fnReset: function () {
            this.postData = {
                ad_type: '',
                platform: '',
                revenue_type: '',
                revenue: '',
                day_limit: '',
                status: '',
                business_type: '',
                products_type: '',
                status_stop: '1',
                creator_uid: '',
                operation_uid: '',
                created_at: ['', ''],
                operation_time: ['', '']
            };
        },
        _fnCreatMaterialsTable: function () {
            var _this = this;
            if (typeof dataTable === 'object') {
                dataTable.destroy();
                $('#tab-table').empty();
            }
            Helper.fnCreatTable('#tab-table', this.oMaterialsTitle, API_URL.manager_material_index, function (td, sData, oData, row, col, table) {
                _this._fnMaterialsColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                postData: {
                    filter: function () {
                        return JSON.stringify(_this.oFilter);
                    }
                },
                fnInitComplete: function (settings, json) {
                    _this._fnMaterialsInitComplete(settings, json, this);
                }
            });
        },

        _fnMaterialsColumn: function (td, sData, oData, row, col, table, data) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'products_name':
                    html += '<div>' + (oData.icon ? '<img src="' + oData.icon + '" class="img-rounded app-icon">' : '')
                        + '<span>' + sData + '</span>'
                        + '</div>';
                    break;
                case 'products_type':
                    html += LANG.products_type[sData];
                    break;
                case 'ad_type':
                    html += LANG.ad_type[sData];
                    break;
                case 'status':
                    html += LANG.MATERIALS_STATUS[sData];
                    break;
                case 'approve_time':
                    html += oData.approve_user ? oData.approve_user + '<br />' + sData : '-';
                    break;
                case 'campaignid':
                    if (oData.status === CONSTANT.MATERIALS_STATUS_APPROVE_WAITING) {
                        html += '<button data-campaignid="' + sData + '" class="btn btn-default js-btn-material-approve" data-check=1 data-status=' + oData.status + '><i class="fa fa-check-square"></i> 审核</button>';
                    }
                    else {
                        html += '<button data-campaignid="' + sData + '" class="btn btn-default js-btn-material-approve" data-check=0 data-status=' + oData.status + '>查看更新</button>';
                    }
                    break;
                default:
                    break;
            }
            html !== '' && $(td).html(html);
        },

        _fnOpenMaterialApprovePanel: function ($ele) {
            var data = dataTable.row($ele.parent().parent()[0]).data();
            var defData = {
                products_type: data.products_type,
                campaignid: data.campaignid,
                ad_type: data.ad_type,
                platform: data.platform,
                total_consume: data.total_consume
            };
            var oldData = data.materials_data;
            var newData = data.materials_new;
            if (oldData) {
                oldData.total_limit = oldData.total_limit ? oldData.total_limit : '不限';
            }
            newData.total_limit = newData.total_limit ? newData.total_limit : '不限';
            var isNewPackage = 0;
            if (data.products_type === CONSTANT.products_type_package && oldData && oldData.package_md5 && oldData.package_md5 !== newData.package_md5) {
                isNewPackage = 1;
            }

            $('#material-approve-panel .modal-content').html($.tmpl('#tpl-material-approve-panel', {
                ischecked: $ele.data('check'),
                status: $ele.data('status')
            }));
            $('#material-old-tpl-container').html($.tmpl('#tpl-material-info', $.extend({}, defData, oldData, {
                status: $ele.data('status'),
                oldData: oldData,
                revenue_type: data.revenue_type
            })));
            $('#material-new-tpl-container').html($.tmpl('#tpl-material-info', $.extend({}, defData, newData, {
                isNew: 1,
                oldData: oldData,
                revenue_type: data.revenue_type
            })));
            $('#material-approve-panel').attr('data-new-package', isNewPackage).attr('data-campaignid', defData.campaignid).modal({
                backdrop: 'static',
                show: true
            });
            $('#material-approve-panel .fancybox').fancybox();
        },

        _fnMaterialApproveAccept: function () {
            var isNewPackage = $('#material-approve-panel').attr('data-new-package');
            var msg = '是否确定通过审核';
            if (+isNewPackage) {
                msg = '安装包有更新，确定后使用旧包的媒体，都将使用新包';
            }
            var _this = this;
            Helper.fnConfirm(msg, function () {
                var param = {
                    campaignid: $('#material-approve-panel').attr('data-campaignid'),
                    status: 1
                };
                _this._fnMaterialCheck(param);
            });
        },

        _fnMaterialApproveReject: function () {
            var param = {
                campaignid: $('#material-approve-panel').attr('data-campaignid'),
                status: 2
            };
            this._fnMaterialCheck(param);
        },

        _fnMaterialCheck: function (param) {
            var _this = this;
            $.post(API_URL.manager_material_check, param, function (json) {
                if (0 === json.res) {
                    $('#material-approve-panel').modal('hide');
                    dataTable.reload(null, false);
                    _this._fnFreshNum();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            }).fail(function () {
                Helper.close_ajax();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        _fnFreshNum: function () {
            $.get(API_URL.manager_common_campaign_pending_audit, function (data) {
                var cNum = data.obj.camcnt ? data.obj.camcnt : 0;
                var mNum = data.obj.meters_count ? data.obj.meters_count : 0;
                var num = cNum + mNum;
                if (num > 0) {
                    $('#menu [data-type="manager-campaign"] .badge').html(num);
                }

                if (cNum > 0) {
                    $('#tab-type-wrapper [data-type="campaign-num"]').html(cNum);
                }

                if (mNum > 0) {
                    $('#tab-type-wrapper [data-type="materials-num"]').html(mNum);
                }
            });
        },

        _fnChangeMenu: function ($ele) {
            var tabType = $ele.attr('data-tab-type');
            location.hash = 'type=' + tabType;
            $ele.siblings().removeClass('active');
            $ele.addClass('active');
            this.tabType = tabType;
            this._fnRun();
        },
        _fnInitDateOper: function (_elem) {
            if (_elem.attr('name') === 'created_at_start') {
                this.postData.created_at[0] = _elem.val();
            }
            else if (_elem.attr('name') === 'created_at_end') {
                this.postData.created_at[1] = _elem.val();
            }
            else if (_elem.attr('name') === 'operation_time_start') {
                this.postData.operation_time[0] = _elem.val();
            }
            else if (_elem.attr('name') === 'operation_time_end') {
                this.postData.operation_time[1] = _elem.val();
            }
            dataTable.reload();
        },
        _fnSetDate: function () {
            var _this = this;
            $('input[data-provide="datepicker"]').datepicker().on('clearDate', function () {
                _this._fnInitDateOper($(this));
            });
            $('input[data-provide="datepicker"]').datepicker().on('changeDate', function () {
                _this._fnInitDateOper($(this));
            });
        },
        _fnRun: function () {
            this._fnReset();
            if (this.tabType === 'campaign') {
                // 获取销售顾问和运营顾问
                var param = {
                    account_type: 'MANAGER'
                };
                var _this = this;
                $.post(API_URL.manager_common_sales, param, function (json) {
                    if (json && json.res === 0) {
                        $.post(API_URL.manager_common_operation, param, function (json2) {
                            if (json2 && json2.res === 0) {
                                $('#js-search-field').html(doT.template($('#tpl-search-field').text())({allSales: (json.obj ? json.obj : {}), allOpertions: (json2.obj ? json2.obj : {})})).show();
                                $('#addad-btn-wrapper').html('<span id="addad-btn" class="btn btn-primary"> + 新建A/T/S广告 </span>');
                                _this._fnCreatTable();
                                _this._fnSetDate();
                            }
                            _this = null;
                        }).fail(function () {
                            Helper.fnPrompt('服务器请求失败，请稍后重试！');
                        });
                    }
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                });
                // $('#materials-wrapper').hide();
                // $('#tab-table-wrapper').show();
            }
            else {
                $('#addad-btn-wrapper').html('');
                $('#js-search-field').html('').hide();
                // $('#materials-wrapper').show();
                // $('#tab-table-wrapper').hide();
                this._fnCreatMaterialsTable();
                this.campaignid = '';
            }
        },

        fnInit: function (type, campaignid) {
            switch (type) {
                case '1':
                case 'campaign':
                    this.tabType = 'campaign';
                    break;
                case 'materials':
                case '2':
                    this.tabType = 'materials';
                    break;
                default:
                    break;
            }
            if (campaignid) {
                this.campaignid = campaignid;
            }
            var _this = this;

            this._fnFreshNum();
            this._fnKeywordInitHandle();
            this._fnInitListeners();
            CampaignDirectional.fnInitHandle();

            $('#tab-table-wrapper').on('click', '.js-btn-status', function () {
                _this._fnChangeStatus($(this));
            });

            $('#tab-table-wrapper').on('click', '.js-btn-approve', function () {
                _this._fnOpenApprovePanel($(this));
            });
            $('#tab-table-wrapper').on('click', '.pointer[data-type="product-info"]', function () {
                _this._fnOpenProductInfoPanel($(this));
            });

            $('#tab-table-wrapper').on('click', '.js-btn-material-approve', function () {
                _this._fnOpenMaterialApprovePanel($(this));
            });

            $('#approve-accept').click(function () {
                _this._fnApproveAccept();
            });

            $('#approve-reject').click(function () {
                _this._fnApproveReject();
            });
            $('#approve-reject-accept').click(function () {
                _this._fnApproveRejectAccept();
            });
            $('#material-approve-panel').delegates({
                '#material-approve-accept': function () {
                    _this._fnMaterialApproveAccept();
                },
                '#material-approve-reject': function () {
                    _this._fnMaterialApproveReject();
                }
            });
            $('#approve-panel, #product-info-panel').on('click', '.js-img-tab', function () {
                var $ele = $(this);
                var url = $ele.attr('data-url');
                $ele.addClass('cur').siblings().removeClass('cur');
                if (url !== '') {
                    $('#approve-img-none').hide();
                    $('#approve-img img').attr('src', url);
                    $('#approve-img').attr('href', url).show();
                }
                else {
                    $('#approve-img').hide();
                    $('#approve-img-none').show();
                }
            });
            $('#tab-type-wrapper').on('click', '[data-tab-type]', function () {
                _this._fnChangeMenu($(this));
            });

            $('#js-affset-modal').on('hide.bs.modal', function (e) {
                window.affsetTb && $('#js-affset-table').html() !== '' && window.affsetTb.destroy() && $('#js-affset-table').empty();
                window.dataTable.reload(null, false);
            });

            $('#tab-type-wrapper [data-tab-type="' + this.tabType + '"]').trigger('click');

            $(window).resize(function (event) {
                if (window.affsetTb && $('#js-affset-table_wrapper').length) {
                    window.affsetTb.columns.adjust();
                }
            });

            // $('#package-select-modal .js-close').click(function () {
            //     $('#package-select-modal').fadeOut();
            // });

            // $('#approve-reject-panel .js-close').click(function () {
            //     $('#approve-reject-panel').fadeOut();
            // });

            // 双模态框，关闭一个后，样式修改bug
            $('#approve-reject-panel, #package-select-modal, #modal-log, #trend-banner-detail-panel').on('hidden.bs.modal', function () {
                if ($('.modal-backdrop').length > 0) {
                    $(document.body).addClass('modal-open');
                }
            });
            $(document).click(function (e) {
                var con = $('#js-affset-table .app-search-list');
                if (!con.is(e.target) && con.has(e.target).length === 0) {
                    con.remove();
                }
            });

            $('#js-search-field').delegate('input[name=select_business_type],input[name=select_platform],input[name=select_revenue_type],input[name=select_status],input[name=select_ad_type],input[name=select_products_type],input[name=select_status_stop],select[name=select_creator_uid],select[name=select_operation_uid]', 'change', function () {
                _this.postData[$(this).attr('name').substr(7)] = $(this).val();
                dataTable.reload();
            });
            $('#js-search-field').delegate('input[name=select_search]', 'input', function () {
                dataTable.reload();
            });
            $('#js-search-field').delegate('#js-high-expand', 'click', function () {
                if ($(this).attr('aria-expanded') === 'false') {
                    $(this).html('收起');
                    $('#js-search-row1').css('margin-bottom', '10px');
                }
                else {
                    $(this).html('高级');
                    $('#js-search-row1').css('margin-bottom', 0);
                }
            });
            $('#js-search-field').delegate('[data-provide=datepicker]', 'input, change', function () {
                if ($(this).val() && $(this).val().trim()) {
                    $(this).next('.time-close').show();
                }
                else {
                    $(this).next('.time-close').hide();
                }
            });
            $('#js-search-field').delegate('.time-close', 'click', function () {
                $(this).prev('input').val('');
                $(this).prev('input').datepicker('update');
            });
        }
    };
    return new CampaignIndex();
})(window.jQuery);
$(function () {
    var type = Helper.fnGetHashParam('type');
    var campaignid = Helper.fnGetHashParam('campaignid');
    CampaignIndex.fnInit(type, campaignid);
});
