/**
 *  @file campaign-index.js
 *  @author xiaokl
 */
var campaignList = (function ($) {
    var CampaignList = function () {
        this.rankInfo = {};
    };

    CampaignList.prototype = {
        _oAppColumn: {
            res: 0,
            obj: null,
            map: null,
            list: [
                {
                    field: 'products_name',
                    title: '推广产品'
                },
                {
                    field: 'package_name',
                    title: '包名',
                    render: function (data, type, full) {
                        return (data == null || data === '') ? '-' : data;
                    }
                },
                {
                    field: 'products_type',
                    title: '推广类型',
                    render: function (data, type, full) {
                        return (data != null && data !== '') ? LANG.products_type[data] : '';
                    }
                },
                {
                    field: 'appinfos_app_name',
                    title: '广告名称'
                },
                {
                    field: 'platform',
                    title: '推广平台',
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
                    field: 'af_income',
                    title: '出价(元)',
                    column_set: [
                        'sortable'
                    ],
                    render: function (data, type, full) {
                        return full.revenue_type === CONSTANT.revenue_type_cps ? '-' : data;
                    }
                },
                {
                    field: 'keyword_price_up_count',
                    title: '关键字加价(元)'
                },
                {
                    field: 'category',
                    title: '分类'
                },
                {
                    field: 'app_rank',
                    title: '等级'
                },
                {
                    field: 'flow_ratio',
                    title: '流量变现比例',
                    render: function (data, type, full) {
                        if (data == null || data === '' || +full.mode === CONSTANT.mode_artif) {
                            return '-';
                        }
                        return parseInt(data, 10) + '%';
                    }
                },
                {
                    field: 'status',
                    title: '状态'
                },
                {
                    field: 'affiliate_checktime',
                    title: '最近审核',
                    column_set: ['sortable']
                },
                {
                    field: 'campaignid',
                    title: '操作'
                }
            ]
        },
        _oOthersColumn: {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [
                {
                    field: 'products_name',
                    title: '推广产品'
                },
                {
                    field: 'products_type',
                    title: '推广类型',
                    render: function (data, type, full) {
                        return (data != null && data !== '') ? LANG.products_type[data] : '';
                    }
                },
                {
                    field: 'appinfos_app_name',
                    title: '广告名称'
                },
                {
                    field: 'platform',
                    title: '推广平台',
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
                    field: 'af_income',
                    title: '出价(元)',
                    column_set: [
                        'sortable'
                    ],
                    render: function (data, type, full) {
                        return full.revenue_type === CONSTANT.revenue_type_cps ? '-' : data;
                    }
                },
                {
                    field: 'status',
                    title: '状态'
                },
                {
                    field: 'affiliate_checktime',
                    title: '最近审核',
                    column_set: ['sortable']
                },
                {
                    field: 'campaignid',
                    title: '操作'
                }
            ]
        },
        _fnGetTplWithBtn: function (oData) {
            return {
                1: '<button class="btn btn-default js-check-campaign">审核</button>',
                2: '<span>可联系联盟运营经理加速审核 </span>',
                3: '<button class="btn btn-default js-changestatus" data-value="off">暂停投放</button>',
                4: '<button class="btn btn-default js-changestatus" data-value="on">继续投放</button>',
                5: '<a class="btn btn-default js-view-report" href="../stat/index.html?dayType=5' + '&id=' + oData.campaignid
                + '&revenue_type=' + oData.revenue_type
                + '&name=' + escape(oData.appinfos_app_name) + '&item_num=2" target="_blank">查看报表</a>',
                6: '<a class="btn btn-default" href="' + oData.download_url + '" target="_blank">下载安装包</a>',
                7: '<button class="btn btn-default js-view-campaign">查看</button>'
            };
        },
        _fnGetPauseTpl: function (adType, pauseStatus, campaigns_status, oTpl) { // 根据广告类型获取暂停投放模版
            var sTpl = '';
            if (pauseStatus === CONSTANT.pause_status_media_manual) {
                if ((+campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_PAUSE && (+campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_STOP) {
                    sTpl += oTpl[4];
                }
            }
            else if (pauseStatus === CONSTANT.pause_status_trafficker_daylimit) {
                // if ((+campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_PAUSE && (+campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_STOP) {
                //     sTpl += oTpl[3];
                // }
            }

            sTpl += oTpl[5];
            if (adType !== CONSTANT.ad_type_app_market) {
                sTpl += oTpl[7];
            }
            // if (pauseStatus === CONSTANT.pause_status_media_manual) {
            //     if ((+campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_PAUSE && (+campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_STOP) {
            //         sTpl += oTpl[4];
            //     }
            //     sTpl += oTpl[5];
            //     if (adType !== CONSTANT.ad_type_app_market) {
            //         sTpl += oTpl[7];
            //     }
            // }
            // else {
            //     if (adType === CONSTANT.ad_type_app_market) {
            //         sTpl += oTpl[5];
            //     }
            //     else {
            //         sTpl += oTpl[7];
            //     }
            // }
            return sTpl;
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'campaignid') {
                var sTpl = '';
                var oTpl = this._fnGetTplWithBtn(oData);
                if (+oData.mode === CONSTANT.mode_storage_yes) { // 媒体商入库
                    if (oData.ad_type === CONSTANT.ad_type_app_market) { // 应用市场
                        if (oData.status === CONSTANT.banner_status_put_in) { // 投放中
                            if ((+oData.campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_PAUSE && (+oData.campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_STOP) {
                                sTpl += oTpl[3];
                            }
                            sTpl += oTpl[5] + oTpl[6];
                        }
                        else if (oData.status === CONSTANT.banner_status_suspended) { // 已暂停
                            sTpl = this._fnGetPauseTpl(oData.ad_type, oData.pause_status, oData.campaigns_status, oTpl) + oTpl[6];
                        }
                        else if (oData.status === CONSTANT.banner_status_no_accepted || oData.status === CONSTANT.banner_status_pending_media) { // 未接受、待媒体审核
                            sTpl += oTpl[1];
                        }
                        else if (oData.status === CONSTANT.banner_status_pending_put_in) {
                            sTpl += oTpl[2] + oTpl[6];
                        }
                        else {
                            sTpl = '-';
                        }
                    }
                }
                else if (+oData.mode === CONSTANT.mode_artif) { // 人工投放
                    if (oData.status === CONSTANT.banner_status_put_in) {
                        if ((+oData.campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_PAUSE && (+oData.campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_STOP) {
                            sTpl += oTpl[3];
                        }
                        sTpl += oTpl[5];
                        if (oData.ad_type !== CONSTANT.ad_type_app_market) {
                            sTpl += oTpl[7];
                        }
                        if (oData.products_type === CONSTANT.products_type_package) {
                            sTpl += oTpl[6];
                        }
                    }
                    else if (oData.status === CONSTANT.banner_status_suspended) {
                        sTpl = this._fnGetPauseTpl(oData.ad_type, oData.pause_status, oData.campaigns_status, oTpl);
                        if (oData.products_type === CONSTANT.products_type_package) {
                            sTpl += oTpl[6];
                        }
                    }
                    else {
                        sTpl = '-';
                    }
                }
                else if (+oData.mode === CONSTANT.mode_storage_no) { // 媒体商不入库
                    if (oData.status === CONSTANT.banner_status_put_in) {
                        if ((+oData.campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_PAUSE && (+oData.campaigns_status) !== CONSTANT.CAMPAIGN_STATUS_STOP) {
                            sTpl += oTpl[3];
                        }
                        sTpl += oTpl[5];
                        if (oData.ad_type === CONSTANT.ad_type_app_market) {
                            // sTpl += oTpl[6];
                        }
                        else {
                            sTpl += oTpl[7];
                        }
                        if (oData.products_type === CONSTANT.products_type_package) {
                            sTpl += oTpl[6];
                        }
                    }
                    else if (oData.status === CONSTANT.banner_status_suspended) {
                        sTpl = this._fnGetPauseTpl(oData.ad_type, oData.pause_status, oData.campaigns_status, oTpl);
                        if (oData.products_type === CONSTANT.products_type_package) {
                            sTpl += oTpl[6];
                        }
                    }
                    else if (oData.status === CONSTANT.banner_status_no_accepted || oData.status === CONSTANT.banner_status_pending_media) { // 未接受、待媒体审核
                        sTpl += oTpl[1];
                    }
                    else {
                        sTpl = '-';
                    }
                }
                else {
                    sTpl = '-';
                }
                $(td).html(sTpl);
            }
            else if (thisCol === 'keyword_price_up_count') {
                if (sData > 0) {
                    $(td).html('<span class="js-handle-key center-block text-warning cursor">查看</span>');
                }
                else {
                    $(td).html('-');
                }
            }
            else if (thisCol === 'products_name') {
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
            else if (thisCol === 'app_rank') {
                if (+oData.mode === CONSTANT.mode_artif) {
                    $(td).html('-');
                }
                else {
                    if (oData.app_rank && oData.app_rank > 0) {
                        $(td).html('<span class="table-edit ' + thisCol + '">' + LANG.app_rank[oData.app_rank] + '</span>');
                    }
                    else {
                        $(td).html('-');
                    }
                }
            }
            else if (thisCol === 'category') {
                if (+oData.mode === CONSTANT.mode_artif) {
                    $(td).html('-');
                }
                else {
                    if (sData && sData !== '0') {
                        $(td).html('<div class="category-width"><span class="table-edit ' + thisCol + '">' + oData.category_label + '</span></div>');
                    }
                    else {
                        $(td).html('-');
                    }
                }
            }
            else if (thisCol === 'status') {
                if ((+sData) === CONSTANT.banner_status_suspended) { // 已暂停
                    if ((+oData.campaigns_status) === CONSTANT.CAMPAIGN_STATUS_PAUSE || (+oData.campaigns_status) === CONSTANT.CAMPAIGN_STATUS_STOP) {
                        $(td).html('广告暂停投放');
                    }
                    else {
                        if ($.inArray((+oData.pause_status), CONSTANT.pause_status_all) > -1) {
                            $(td).html(LANG.trafficker_pause_status[oData.pause_status]);
                        }
                        else {
                            $(td).html('');
                        }
                    }
                }
                else if ((+sData) === CONSTANT.banner_status_put_in) { // 投放中
                    if ((+oData.campaigns_status) === CONSTANT.CAMPAIGN_STATUS_PAUSE || (+oData.campaigns_status) === CONSTANT.CAMPAIGN_STATUS_STOP) {
                        $(td).html('广告暂停投放');
                    }
                    else {
                        $(td).html(LANG.banner_status[sData]);
                    }
                }
                else {
                    var statusLabel = LANG.banner_status[sData];
                    $(td).html(statusLabel);
                }
            }
        },
        _fnKeyHandle: function () {
            $('#js-campaign-table').delegate('.js-handle-key', 'click', function (e) {
                var Y = $(this).offset().top;
                var X = $(this).offset().left;
                var params = {
                    campaignid: dataTable.row($(this).parents('tr')).data().campaignid,
                    t: Math.random()
                };
                $.post(API_URL.trafficker_keywords_list, params, function (data) {
                    if (data.res === 0) {
                        if (data.list && data.list.length > 0) {
                            var sTr = '';
                            for (var i = 0, j = data.list.length; i < j; i++) {
                                sTr += '<tr><td>' + data.list[i].keyword + '</td>';
                                var rank = data.list[i].rank;
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
                                sTr += '<td>' + star + '</td>';
                                sTr += '<td>' + data.list[i].price_up + '</td></tr>';
                            }
                            $('#floatertb tbody').html(sTr);
                            var $tb = $('#zones-up');
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
            });
        },
        _fnInitHandle: function () {
            var defaults = {
                url: API_URL.trafficker_campaign_update, // 修改媒体广告管理列表字段
                params: function () {
                    var oDatas = dataTable.row($(this).parents('tr')[0]).data();
                    return {
                        bannerid: oDatas.bannerid
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
                source: API_URL.trafficker_campaign_category,
                placement: 'auto',
                sourceOptions: {
                    data: {
                        ad_type: $('input[name=js-adtype]').val()
                    }
                },
                validate: function (value) {
                    var _v = $('.editable-container input[name="category"]').val();
                    if (!_v) {
                        return '请选择分类';
                    }
                }
            }, defaults));
            $('[data-toggle="tooltip"]').tooltip();
        },
        _fnGetCommonTpl: function (option, pHtml) {
            if (option.autohide) {
                return '';
            }
            var html = '<div class="form-group">';
            html += '<label class="col-sm-2 control-label">' + option.label + '</label>';
            html += '<div class="col-sm-10">';
            html += '<p class="form-control-static ' + (option.className ? option.className : '') + '">';
            html += pHtml;
            html += '</p>';
            html += '</div>';
            html += '</div>';
            return html;
        },
        _fnGetStarTpl: function (option) {
            var html = '<div class="form-group">';
            html += '<label class="col-sm-2 control-label">' + option.label + '</label>';
            html += '<div class="col-sm-10">';
            html += '<ul class="star-level">';
            html += '<% if(it.' + option.name + ' && it.' + option.name + ' > 0) { %>';
            html += '<% for(var i = 0; i< it.' + option.name + '; i++) { %>';
            html += '<li><i class="fa fa-star"></i></li>';
            html += '<% } %>';
            html += '<% for(var i = 0; i< (5-it.' + option.name + '); i++) { %>';
            html += '<li><i class="fa fa-star-o"></i></li>';
            html += '<% } %>';
            html += '<% } else { %>';
            html += '<li><i class="fa fa-star-o"></i></li>';
            html += '<li><i class="fa fa-star-o"></i></li>';
            html += '<li><i class="fa fa-star-o"></i></li>';
            html += '<li><i class="fa fa-star-o"></i></li>';
            html += '<li><i class="fa fa-star-o"></i></li>';
            html += '<% } %></ul>';
            html += '</div>';
            html += '</div>';
            return html;
        },
        _fnGetMaterialTpl: function (option) {
            var html = '<div class="form-group">';
            html += '<label class="col-sm-2 control-label">' + option.label + '</label>';
            html += '<div class="col-sm-10">';
            html += '<div class="material-list js-banner-material material-list2" style="max-width:720px;width:auto;">';
            html += '<div class="hd" style="width: auto; height: 37px; position: inherit;">';
            html += '<ul class="nav nav-pills" style="position:absolute;left:0;">';
            html += '<% if (it.' + option.name + ' && it.' + option.name + '.length > 0) {%>';
            html += '<% for (var i = 0, j = it.' + option.name + '.length; i < j; i++) {%>';
            html += '<% if (it.' + option.name + '[i].url) {%>';
            html += '<li class="has" data-key="<%=it.' + option.name + '[i].ad_spec%>" data-url="<%=it.' + option.name + '[i].url%>"><%=it.' + option.name + '[i].width%>*<%=it.' + option.name + '[i].height%></li>';
            html += '<%} else{%>';
            html += '<li data-key="<%=it.' + option.name + '[i].ad_spec%>" data-url=""><%=it.' + option.name + '[i].width%>*<%=it.' + option.name + '[i].height%></li>';
            html += '<%}%>';
            html += '<%}%>';
            html += '<% } %>';
            html += '</ul>';
            html += '</div>';
            html += '<div class="slide-btnprev" style="display: none;"><i data-handle="0"></i></div>';
            html += '<div class="slide-btnnext" style="display: none;"><i data-handle="1"></i></div>';
            html += '<div class="bd" style="position: relative;margin-top:20px;">';
            html += '<div class="img_view">';
            html += '<p>广告主尚未上传对应素材</p>';
            html += '<a href="" class="fancybox" title="点击预览大图" alt="点击预览大图" style="display:none;">';
            html += '<img src="" style="margin: 0px auto 10px;" alt="广告主尚未上传对应素材">';
            html += '</a>';
            html += '</div></div></div>';
            html += '</div>';
            html += '</div>';
            return html;
        },
        _fnGetStaticTpl: function (option) {
            var html = '';
            if (option.render) {
                html = '<%=' + option.render + '[it.' + option.name + ']%>';
            }
            else {
                html = '<%=it.' + option.name + '%>';
            }
            return this._fnGetCommonTpl(option, html);
        },
        _fnGetATpl: function (option) {
            var html = '<a href="<%=it.' + option.name + '%>" target="_blank">' + (option.text ? option.text : '<%=it.' + option.name + '%>') + '</a>';
            return this._fnGetCommonTpl(option, html);
        },
        _fnGetImgTpl: function (option) {
            var html = '<a href="<%=it.' + option.name + '%>" class="fancybox" title="点击预览大图" alt="点击预览大图" style="float: left"><img src="<%=it.' + option.name + '%>" /></a>';
            return this._fnGetCommonTpl(option, html);
        },
        _fnGetFancyboxTpl: function (option) {
            var html = '<% if (it.' + option.name + ' && it.' + option.name + '.length > 0) {%>';
            html += '<% for (var i = 0, j = it.' + option.name + '.length; i < j; i++) {%>';
            html += '<span>';
            html += '<a href="<%=it.' + option.name + '[i].url%>" class="fancybox" title="点击预览大图" alt="点击预览大图" style="float: left"><img alt="广告主尚未上传对应素材" src="<%=it.' + option.name + '[i].url%>" /></a>';
            html += '</span>';
            html += '<%}%>';
            html += '<% } %>';
            return this._fnGetCommonTpl(option, html);
        },
        _fnGeneratorTpl: function (options) {
            if (options && typeof options === 'object' && options.length > 0) {
                var html = '';
                for (var i = 0, j = options.length; i < j; i++) {
                    if (options[i].widget) {
                        if (options[i].widget === 'a') {
                            html += this._fnGetATpl(options[i]);
                        }
                        else if (options[i].widget === 'material') {
                            html += this._fnGetMaterialTpl(options[i]);
                        }
                        else if (options[i].widget === 'star') {
                            html += this._fnGetStarTpl(options[i]);
                        }
                        else if (options[i].widget === 'img') {
                            html += this._fnGetImgTpl(options[i]);
                        }
                        else if (options[i].widget === 'fancybox') {
                            html += this._fnGetFancyboxTpl(options[i]);
                        }
                    }
                    else {
                        html += this._fnGetStaticTpl(options[i]);
                    }
                }
                return html;
            }
            return '';
        },
        _fnGetPackageConf: function () {
            return [{
                label: '广告主:',
                name: 'clientname'
            }, {
                label: '应用:',
                name: 'appinfos_app_name'
            }, {
                label: '应用显示名称:',
                name: 'products_show_name'
            }, {
                label: '应用包:',
                name: 'download_url',
                widget: 'a',
                className: 'text-warning',
                text: '下载地址'
            }, {
                label: '图标:',
                name: 'appinfos_app_show_icon',
                widget: 'img',
                className: 'icon-w text-warning'
            }];
        },
        _fnGetLinkConf: function () {
            return [{
                label: '广告主:',
                name: 'clientname'
            }, {
                label: '推广站点名称:',
                name: 'link_name'
            }, {
                label: '推广链接:',
                name: 'link_url',
                widget: 'a',
                className: 'text-warning'
            }];
        },
        _fnGetCommonConf: function () {
            return [{
                label: '推广平台:',
                name: 'platform',
                render: 'LANG.platform_group'
            }, {
                label: '计费类型:',
                name: 'revenue_type',
                render: 'LANG.revenue_type'
            }, {
                label: '基础出价:',
                name: 'af_income'
            }];
        },
        _fnGetFeedsConf: function (productsType) {
            if (productsType === CONSTANT.products_type_package) {
                return [{
                    label: '星级:',
                    name: 'star',
                    widget: 'star'
                }, {
                    label: '一句话描述:',
                    name: 'profile'
                }, {
                    label: '广告图:',
                    name: 'appinfos_images',
                    widget: 'fancybox',
                    className: 'material-w'
                }];
            }
            return [{
                label: '图标:',
                name: 'appinfos_app_show_icon',
                widget: 'img',
                className: 'icon-w text-warning'
            }, {
                label: '标题:',
                name: 'title'
            }, {
                label: '吸引力文案:',
                name: 'profile'
            }, {
                    label: '广告图:',
                    name: 'appinfos_images',
                    widget: 'fancybox',
                    className: 'material-w'
                }];
        },
        _fnGetMaterialConf: function () {
            return [{
                label: '素材样式:',
                name: 'appinfos_images',
                widget: 'material'
            }];
        },
        _fnGetTextLinkConf: function () {
            return [{
                label: '广告方案:',
                name: 'profile'
            }];
        },
        _fnGetConf: function (adType, productsType, revenue_type) {
            var conf = [];
            if (productsType === CONSTANT.products_type_package) {
                conf = conf.concat(this._fnGetPackageConf());
            }
            else {
                conf = conf.concat(this._fnGetLinkConf());
            }
            var oNeCommonConf = this._fnGetCommonConf().slice(0);
            if (revenue_type === CONSTANT.revenue_type_cps) {
                oNeCommonConf.pop();
            }
            conf = conf.concat(oNeCommonConf);
            if (adType === CONSTANT.ad_type_feeds) {
                conf = conf.concat(this._fnGetFeedsConf(productsType));
            }
            else {
                if (adType === CONSTANT.ad_type_banner_textlink) {
                    conf = conf.concat(this._fnGetTextLinkConf());
                }
                else {
                    conf = conf.concat(this._fnGetMaterialConf());
                }
            }
            return conf;
        },
        _fnCampaignCheck: function (params, callback) { // 审核
            $.post(API_URL.trafficker_campaign_check, params, function (json) {
                if (json && json.res === 0) {
                    if (typeof callback === 'function') {
                        callback.call(null, json);
                    }
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            });
        },
        _fnGetKeyworkds: function (oData, callback) {
            // 查看关键字列表
            var params = {
                campaignid: oData.campaignid,
                t: Math.random()
            };
            $.post(API_URL.trafficker_keywords_list, params, function (data) {
                callback && typeof callback === 'function' && callback.call(this, data);
            });
        },
        _fnInitFancybox: function () {
            $('.fancybox').fancybox();
        },
        _fnGetCheckAppModal: function (oData) {
            var self = this;
            $.get(API_URL.trafficker_campaign_category, {ad_type: $('input[name=js-adtype]').val()}, function (json) {
                if (json && json.res === 0 && json.obj) {
                    self._fnGetKeyworkds(oData, function (data) {
                        var oKeywords = [];
                        if (data && data.res === 0) {
                            oKeywords = data.list;
                        }
                        var appothers = $('#tpl-app-package').text();
                        if (oData.ad_type === CONSTANT.ad_type_app_store) {
                            appothers = $('#tpl-appstore-addr').text();
                        }
                        $('#js-check-campaign-modal form').html(doT.template($('#tpl-app').text(), undefined, {appothers: appothers})($.extend({}, oData, {rankInfo: LANG.app_rank, categoryInfo: json.obj}, {keywords: oKeywords})));
                        $('#category-list').categoryList(json.obj); // 三级分类
                        $('#js-check-campaign-modal').modal('show').on('hidden.bs.modal', function () {
                            $('#js-check-campaign-modal form').empty();
                        });
                        // TraffickerCommon._fnCheckcategory($('#js-check-campaign-modal'));
                        $('#js-check-campaign-modal form').validation({blur: false});
                        $.fn.initDom();
                        self._fnInitFancybox();
                        if (+oData.mode === CONSTANT.mode_storage_no) {
                            $('#category-list').categoryList('select', oData.category.split(',')); // 不入库已经有分类数据
                            if (oData.app_rank) {
                                $('#js-check-campaign-modal select[name=app_rank]').val(oData.app_rank);
                            }
                        }
                    });
                }
            });
        },
        // _fnGetCheckAppStoreModal: function (oData) {
        //     var self = this;
        //     $.get(API_URL.trafficker_campaign_category, {ad_type: $('input[name=js-adtype]').val()}, function (json) {
        //         $('#js-check-campaign-modal form').html(doT.template($('#tpl-app').text(), undefined, {category: $('#tpl-category').text(), appothers: $('#tpl-appstore-addr').text()})($.extend({}, oData, {rankInfo: LANG.app_rank, categoryInfo: json.obj})));
        //         $('#js-check-campaign-modal').modal('show').on('hidden.bs.modal', function () {
        //             $('#js-check-campaign-modal form').empty();
        //         });
        //         TraffickerCommon._fnCheckcategory($('#js-check-campaign-modal'));
        //         $('#js-check-campaign-modal form').validation({blur: false});
        //         $.fn.initDom();
        //         self._fnInitFancybox();
        //         if (oData.mode === '3') {
        //             if (oData.parent && oData.category) {
        //                 $('#js-check-campaign-modal input[name=parent][value=' + oData.parent + ']').trigger('click');
        //                 $('#js-check-campaign-modal [aria-labelledby=js-parent' + oData.parent + '] select[name=category]').val(oData.category);
        //             }
        //             if (oData.app_rank) {
        //                 $('#js-check-campaign-modal select[name=app_rank]').val(oData.app_rank);
        //             }
        //         }
        //     });
        // },
        _fnFreshNum: function () {
            $.get(API_URL.trafficker_common_campaign_pending_audit, function (data) {
                var num = data.obj.count ? data.obj.count : 0;
                if (num > 0) {
                    $('#menu [data-type="trafficker_campaign"]').append('<span class="badge left" style="">' + num + '</span>');
                }
            });
        },
        _fnInitLazyHandle: function () {
            var self = this;
            $('#js-campaign-table').delegate('.js-changestatus', 'click', function () { // 修改状态
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                var params = {
                    field: 'status',
                    value: $(this).attr('data-value'),
                    bannerid: oData.bannerid
                };
                $.post(API_URL.trafficker_campaign_update, params, function (json) {
                    if (json && json.res === 0) {
                        dataTable.reload(null, false);
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                });
            });

            $('#js-campaign-table').delegate('.js-view-campaign', 'click', function () {
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                // 生成模板
                var tpl = '';
                if (oData.ad_type === CONSTANT.ad_type_app_store) {
                    self._fnGetKeyworkds(oData, function (data) {
                        var oKeywords = [];
                        if (data && data.res === 0) {
                            oKeywords = data.list;
                        }
                        $('#js-campaign-modal form').html(doT.template($('#tpl-app').text(), undefined, {category: '', appothers: $('#tpl-appstore-addr').text()})($.extend({}, oData, {isEdit: true}, {keywords: oKeywords})));
                        $('#js-campaign-modal').modal('show').on('hidden.bs.modal', function () {
                            $('#js-campaign-modal form').empty();
                        });
                        self._fnInitFancybox();
                    });
                }
                else {
                    tpl = self._fnGeneratorTpl(self._fnGetConf(oData.ad_type, oData.products_type, oData.revenue_type));
                    $('#tpl-view-campaign').html(tpl);
                    $('#js-campaign-modal form').html((doT.template($('#tpl-view-campaign').text()))(oData));
                    $('#js-campaign-modal').modal('show').on('hidden.bs.modal', function () {
                        $('#js-campaign-modal form').empty();
                    }).on('shown.bs.modal', function () {
                        var _banner = $('#js-campaign-modal .js-banner-material');
                        if (_banner && _banner.length > 0) {
                            if (_banner[0].offsetWidth < _banner.find('ul')[0].offsetWidth) {
                                _banner.find('.slide-btnnext').show();
                            }
                        }
                    });
                    self._fnInitFancybox();
                }
                if (oData.ad_type === CONSTANT.ad_type_banner || oData.ad_type === CONSTANT.ad_type_screen_half || oData.ad_type === CONSTANT.ad_type_screen_full) {
                    $('.js-banner-material li').eq(0).click();
                    if (oData.appinfos_images && oData.appinfos_images.length > 0) {
                        var iWidthH = 72 * oData.appinfos_images.length - oData.appinfos_images.length;
                        $('.js-banner-material ul').width(iWidthH);
                    }
                }
            });
            $('#js-campaign-modal,#js-check-campaign-modal').delegate('.slide-btnnext i, .slide-btnprev i', 'click', function () {
                var parent = $(this).parents('.campaign-modal');
                var objHd = parent.find('.js-banner-material ul');
                var objBanner = parent.find('.js-banner-material');
                var iLeft = $(this).attr('data-handle') === '1' ? (objHd[0].offsetLeft - 72) : (objHd[0].offsetLeft + 72);
                objHd.css('left', iLeft + 'px');
                if (objHd[0].offsetLeft < 0) {
                    parent.find('.slide-btnprev').show();
                }
                else {
                    parent.find('.slide-btnprev').hide();
                }
                if (objHd[0].offsetWidth + objHd[0].offsetLeft < objBanner[0].offsetWidth) {
                    parent.find('.slide-btnnext').hide();
                }
                else {
                    parent.find('.slide-btnnext').show();
                }
            });

            $('#js-campaign-modal,#js-check-campaign-modal').delegate('.js-banner-material li', 'click', function () {
                $('.js-banner-material li').removeClass('cur');
                $(this).addClass('cur');
                if ($(this).attr('data-url')) {
                    $('.js-banner-material p').hide();
                    $('.js-banner-material a').show();
                    $('.js-banner-material a').attr('href', $(this).attr('data-url'));
                    $('.js-banner-material img').attr('src', $(this).attr('data-url'));
                }
                else {
                    $('.js-banner-material p').show();
                    $('.js-banner-material a').hide();
                }
            });
            // 审核
            $('#js-campaign-table').delegate('.js-check-campaign', 'click', function () {
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                var mode = oData.mode;
                $('input[name=mode]').val(mode);
                if (+mode === CONSTANT.mode_storage_yes) {
                    self._fnGetCheckAppModal(oData);
                }
                else {
                    if (oData.ad_type === CONSTANT.ad_type_app_market || oData.ad_type === CONSTANT.ad_type_app_store) {
                        self._fnGetCheckAppModal(oData);
                    }
                    // else if (oData.ad_type === CONSTANT.ad_type_app_store) {
                    //     self._fnGetCheckAppStoreModal(oData);
                    // }
                    else {
                        var tpl = self._fnGeneratorTpl(self._fnGetConf(oData.ad_type, oData.products_type, oData.revenue_type));
                        $('#tpl-view-campaign').html('<input type="hidden" value="<%=it.bannerid%>" name="bannerid"><div class="campaign-modal">' + tpl + '</div>');
                        $('#js-check-campaign-modal form').html((doT.template($('#tpl-view-campaign').text()))(oData));
                        $('#js-check-campaign-modal').modal('show').on('hidden.bs.modal', function () {
                            $('#js-check-campaign-modal form').empty();
                        }).on('shown.bs.modal', function () {
                            var _banner = $('#js-check-campaign-modal .js-banner-material');
                            if (_banner && _banner.length > 0) {
                                if (_banner[0].offsetWidth < _banner.find('ul')[0].offsetWidth) {
                                    _banner.find('.slide-btnnext').show();
                                }
                            }
                        });
                        if (oData.ad_type === CONSTANT.ad_type_banner || oData.ad_type === CONSTANT.ad_type_screen_half || oData.ad_type === CONSTANT.ad_type_screen_full) {
                            $('.js-banner-material li').eq(0).click();
                            if (oData.appinfos_images && oData.appinfos_images.length > 0) {
                                var iWidthH = 72 * oData.appinfos_images.length - oData.appinfos_images.length;
                                $('.js-banner-material ul').width(iWidthH);
                            }
                        }
                        self._fnInitFancybox();
                    }
                }
            });
            // 接受审核
            $('#js-check-campaign-modal').delegate('#js-accept', 'click', function () {
                if (!$('#js-check-campaign-modal form').valid()) {
                    return false;
                }
                self._fnCampaignCheck({
                    bannerid: $('input[name=bannerid]').val(),
                    action: 2,
                    category: $('#category-list input[name=category]').val(),
                    appinfos_app_rank: $('#js-check-campaign-modal').find('select[name=app_rank]').val()
                }, function (json) {
                    if (json && json.res === 0) {
                        $('#js-check-campaign-modal').modal('hide');
                        dataTable.reload();
                        self._fnFreshNum();
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                });
            });
            TraffickerCommon._fnInitCategoryHandle($('#js-check-campaign-modal'), {ad_type: $('input[name=js-adtype]').val()});
            // 拒绝审核
            $('#js-check-campaign-modal').delegate('#js-reject', 'click', function () {
                self._fnCampaignCheck({
                    bannerid: $('input[name=bannerid]').val(),
                    action: 3
                }, function (json) {
                    if (json && json.res === 0) {
                        $('#js-check-campaign-modal').modal('hide');
                        dataTable.reload();
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                });
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
        _fnInitComplete: function (settings, json, obj) {
            var self = this;
            var aoColumns = settings.aoColumns;
            var api = obj.api();
            for (var i = 0, j = aoColumns.length; i < j; i++) {
                var mData = aoColumns[i].mData;
                if (mData === 'platform' || mData === 'category' || mData === 'app_rank' || mData === 'status') {
                    var column = api.column(i);
                    var $span = $('<span class="addselect">▾</span>').appendTo($(column.header()));
                    self._fnBindSelect(mData, $span);
                }
            }
            if ($('select[data-name=platform]') && $('select[data-name=platform]').length > 0) { // 获取平台
                var objPlatform = $('select[data-name=platform]');
                var adtype = Helper.fnGetQueryParam('ad_type');
                var platforms = LANG.platform;
                if (!(adtype == null || adtype === '' || (+adtype) === CONSTANT.ad_type_app_market)) {
                    platforms = LANG.platform_group;
                }
                var options = '';
                for (var key in platforms) {
                    options += '<option value="' + key + '">' + platforms[key] + '</option>';
                }
                objPlatform.append(options);
            }
            if ($('select[data-name=category]') && $('select[data-name=category]').length > 0) { // 获取分类
                $.get(API_URL.trafficker_campaign_category, {ad_type: $('input[name=js-adtype]').val()}, function (json) {
                    if (json && json.res === 0 && json.obj && json.obj.parent) {
                        var obj = $('select[data-name=category]');
                        var options = '';
                        for (var key in json.obj.parent) {
                            options += '<option value="' + key + '">' + json.obj.parent[key] + '</option>';
                        }
                        obj.append(options);
                    }
                });
            }
            if ($('select[data-name=app_rank]') && $('select[data-name=app_rank]').length > 0) { // 获取等级
                var objRank = $('select[data-name=app_rank]');
                var rankOptions = '';
                for (var rankKey in LANG.app_rank) {
                    rankOptions += '<option value="' + rankKey + '">' + LANG.app_rank[rankKey] + '</option>';
                }
                objRank.append(rankOptions);
            }
            if ($('select[data-name=status]') && $('select[data-name=status]').length > 0) { // 获取状态
                var objStatus = $('select[data-name=status]');
                var statusOptions = '';
                for (var statusKey in LANG.banner_status) {
                    statusOptions += '<option value="' + statusKey + '">' + LANG.banner_status[statusKey] + '</option>';
                }
                objStatus.append(statusOptions);
            }
        },
        _fnInitPage: function () {
            // 显示TAB项(应用、Banner、Feeds、插屏)
            // 根据url参数获取tab页
            var adtype = Helper.fnGetQueryParam('ad_type');
            if (adtype == null || adtype === '') {
                adtype = CONSTANT.ad_type_app_market;
            }
            $('input[name=js-adtype]').val(adtype);
            var sTitle = this._oOthersColumn;
            if ((+adtype) === CONSTANT.ad_type_app_market || (+adtype) === CONSTANT.ad_type_app_store) {
                sTitle = this._oAppColumn;
                if ((+adtype) === CONSTANT.ad_type_app_store) { // 隐藏关键字加价
                    sTitle.list[1].bVisible = false;
                    // sTitle.list[7].bVisible = false;
                }
            }

            var self = this;
            $('.tabbox').html((doT.template($('#tpl-adtype').text()))(adtype));
            // 初始化表格数据
            var objPostOpt = {
                postData: {
                    filter: function () {
                        return JSON.stringify({
                            ad_type: adtype,
                            platform: $('input[name=platform]').val(),
                            category: $('.addselect select[data-name=category]').val(),
                            app_rank: $('input[name=app_rank]').val(),
                            status: $('input[name=status]').val()
                        });
                    }
                },
                fnDrawCallback: function () {
                    self._fnInitHandle();
                },
                fnInitComplete: function (settings, json) {
                    self._fnInitComplete(settings, json, this);
                }
            };

            Helper.fnCreatTable('#js-campaign-table', sTitle, API_URL.trafficker_campaign_index, function (td, sData, oData, row, col, table) {
                self._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', objPostOpt);

            this._fnKeyHandle();
            Helper.fnInitKeyHandle();
            this._fnInitLazyHandle();
        },
        fnInit: function () { // 初始化页面显示
            this._fnInitPage();
        }
    };
    return new CampaignList();
}(window.jQuery));
$(function () {
    campaignList.fnInit();
});
