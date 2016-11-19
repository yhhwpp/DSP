/**
 * @file trafficker-index.js
 * @author xiaokl
 * @description 渠道包管理
 */
var traffickerIndex = (function ($) {
    var TraffickerIndex = function () {
        this.filterAry = ['ad_type', 'revenue_type', 'affiliates_status', 'app_platform', 'creator_uid'];
    };
    TraffickerIndex.prototype = {
        oTraffickerTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'affiliateid',
                    title: 'id',
                    column_set: ['sortable'],
                    width: 50
                },
                {
                    field: 'date_created',
                    title: '创建时间',
                    column_set: ['sortable'],
                    width: 88
                },
                {
                    field: 'name',
                    title: '媒体名称',
                    width: 120,
                    render: function (data, type, full) {
                        return '<div>全称: ' + data + '</div><div>简称: ' + full.brief_name + '</div>';
                    }
                },
                {
                    field: 'username',
                    title: '登录账号',
                    column_set: ['sortable'],
                    width: 120
                },
                {
                    field: 'contact',
                    title: '联系人',
                    width: 80,
                    render: function (data, type, full) {
                        var sHtml = '';
                        sHtml += '<div>姓名: ' + data + '</div>';
                        sHtml += '<div>手机: ' + full.contact_phone + '</div>';
                        sHtml += '<div>QQ: ' + (full.qq ? full.qq : '') + '</div>';
                        sHtml += '<div>邮箱: ' + full.email + '</div>';
                        return sHtml;
                    }
                },
                {
                    field: 'kind',
                    title: '支持模式',
                    width: 80,
                    render: function (data, type, full) {
                        if (data === 0) {
                            return '';
                        }
                        else if (data === 1) {
                            return '<div>联盟模式</div>';
                        }
                        else if (data === 2) {
                            return '<div>自营模式</div>';
                        }
                        return '<div>联盟模式</div><div>自营模式</div>';
                    }
                },
                {
                    field: 'cdn',
                    title: '下载方式',
                    width: 60,
                    render: function (data, type, full) {
                        return LANG.cdn_type[data];
                    }
                },
                {
                    field: 'delivery',
                    title: '媒体概况',
                    width: 200
                },
                {
                    field: 'income_rate',
                    title: '联盟详情',
                    width: 150
                },
                {
                    field: 'alipay_account',
                    title: '自营详情',
                    width: 100
                },
                {
                    field: 'creator_uid',
                    title: '销售顾问',
                    width: 80,
                    render: function (data, type, full) {
                        return '<div class="" data-title="creator_uid">' + full.creator_username + '</div>' + full.creator_contact_phone;
                    }
                },
                {
                    field: 'affiliates_status',
                    title: '运营状态',
                    width: 55,
                    render: function (data, type, full) {
                        return LANG.affiliates_status[data];
                    }
                },
                {
                    field: 'creator_username',
                    title: '操作',
                    width: 50
                }
            ]
        },
        _fnGetPlatformAry: function (platform) {
            var aryPlatform = [];
            if (platform) {
                var aryPlatformType = CONSTANT.platform_type;
                for (var i = 0, j = aryPlatformType.length; i < j; i++) {
                    if (parseInt(platform, 10) & aryPlatformType[i]) {
                        aryPlatform.push(aryPlatformType[i]);
                    }
                }
            }
            return aryPlatform;
        },
        _fnAddValidation: function () { // 添加表单验证
            $.fn.validation.addMethod('isIncomeRate', function (value) {
                if ($('input[name=income_rate]:checked').length === 0) {
                    return true;
                }
                return false;
            }, '请选择收入分成');
            $.fn.validation.addMethod('isIncomeInput', function (value) {
                if ($('input[name=income_rate][class=income-custom]:checked').length > 0) {
                    if ($('input[name=income-custom-input]').val() == null || $('input[name=income-custom-input]').val() === '') {
                        return true;
                    }
                }
                return false;
            }, '请输入收入分成');
            $.fn.validation.addMethod('isAdtype', function (value) {
                if ($('input[name=ad_type]:checked').length === 0) {
                    return true;
                }
                return false;
            }, '请选择支持的投放');
            $.fn.validation.addMethod('isRevenueType', function (value) {
                var flag = false;
                if ($('input[name=ad_type]:checked').length > 0) {
                    $('input[name=ad_type]:checked').each(function () {
                        if ($('.js-adtype' + $(this).val() + ' input[name=revenue_type]:checked').length === 0) {
                            flag = true;
                            return;
                        }
                    });
                }
                return flag;
            }, '请选择支持的投放对应的计费类型');
        },
        _fnBtnAffHandle: function (obj) { // 绑定模态框表单操作
            $.fn.trafutils.bindIncomeOper(obj, function () {
                $('input[name=income-rate-valid]').blur();
            });
            $.fn.trafutils.bindDeliveryOper(obj, function () {
                $('input[name=delivery-valid]').blur();
            });
            $('input[name=mode]').change(function () {
                if (parseInt($(this).val(), 10) === 3) {
                    $('.js-audit').show();
                }
                else {
                    $('.js-audit').hide();
                }
            });
            $('input[name=app_platform]').click(function () {
                if ($('input[name=app_platform][value=' + CONSTANT.platform_type_android + ']').is(':checked')) {
                    $('.js-adtype71-div').hide();
                    $('input[name=ad_type][value=' + CONSTANT.ad_type_app_store + ']').prop('checked', false);
                    $('.js-adtype71 input[name=revenue_type]').prop('checked', false);
                }
                else if ($('input[name=app_platform][value=' + CONSTANT.platform_type_iphone_copyright + ']').is(':checked')
                        || $('input[name=app_platform][value=' + CONSTANT.platform_type_ipad + ']').is(':checked')) {
                    $('.js-adtype71-div').show();
                }
                else {
                    $('.js-adtype71-div').hide();
                    $('input[name=ad_type][value=' + CONSTANT.ad_type_app_store + ']').prop('checked', false);
                    $('.js-adtype71 input[name=revenue_type]').prop('checked', false);
                }
            });
        },
        _fnGetAffliate: function (kind) {
            var traffickerModel = {affiliate_type: CONSTANT.affiliate_type_adn};
            ['affiliateid', 'username', 'password', 'name', 'brief_name', 'contact', 'email', 'contact_phone', 'qq', 'creator_uid'].forEach(function (item, index) {
                var inputObj = $('#js-form-basic [data-name=' + item + ']');
                if (inputObj) {
                    traffickerModel[item] = inputObj.val();
                }
                else {
                    traffickerModel[item] = '';
                }
            });
            traffickerModel.cdn = $('input[name=cdn]:checked').val();
            var iPlatform = 0;
            $('input[name=app_platform]:checked').each(function () {
                iPlatform += parseInt($(this).val(), 10);
            });
            traffickerModel.app_platform = iPlatform;
            traffickerModel.delivery = $.fn.trafutils.getDelivery($('#js-trafficker-modal'));
            traffickerModel.kind = kind;
            if (kind & CONSTANT.kind_union) { // 获取联盟数据
                traffickerModel.income_rate = $('input[name=income_rate]:checked').val();
                var iMode = parseInt($('input[name=mode]:checked').val(), 10);
                traffickerModel.mode = iMode;
                if (iMode === CONSTANT.mode_storage_no) {
                    traffickerModel.audit = $('input[name=audit]:checked').val();
                }
                else {
                    traffickerModel.audit = 1;
                }
                var iDeliveryType = 0;
                $('input[name=delivery_type]:checked').each(function () {
                    iDeliveryType += parseInt($(this).val(), 10);
                });
                traffickerModel.delivery_type = iDeliveryType;
            }
            if (kind & CONSTANT.kind_self) {
                traffickerModel.alipay_account = $('input[name=alipay_account]').val();
            }
            return traffickerModel;
        },
        _fnSetFilter: function () {
            var filter = {};
            for (var i = 0, j = this.filterAry.length; i < j; i++) {
                filter[this.filterAry[i]] = $('input[name=select_' + this.filterAry[i] + ']').val();
            }
            $('input[name=filter]').val(JSON.stringify(filter));
        },
        _fnInitPlatformAndDelivery: function (oData, modalObj) { // 初始化平台和对接方式页面
            var platformAry = this._fnGetPlatformAry(oData.app_platform);
            if (platformAry && platformAry.length > 0) { // 平台显示
                platformAry.forEach(function (item, index) {
                    $('input[name=app_platform][value=' + item + ']').prop('checked', true);
                });
            }
            // 支持的广告
            var objDelivery = oData.delivery;
            if (objDelivery) {
                for (var i = 0, j = objDelivery.length; i < j; i++) {
                    if ($.inArray(objDelivery[i].ad_type, CONSTANT.ad_type_no_done) > -1) {
                        continue;
                    }
                    modalObj.find('[name=ad_type][value=' + objDelivery[i].ad_type + ']').prop('checked', true);
                    var oRevenueType = modalObj.find('.js-adtype' + objDelivery[i].ad_type + ' [name=revenue_type][value=' + objDelivery[i].revenue_type + ']');
                    oRevenueType.prop('checked', true);
                }
            }
            if (platformAry) {
                if ($.inArray(CONSTANT.platform_type_android, platformAry) > -1) {
                    modalObj.find('.js-adtype71-div').hide();
                    modalObj.find('input[name=ad_type][value=' + CONSTANT.ad_type_app_store + ']').prop('checked', false);
                    modalObj.find('.js-adtype71 input[name=revenue_type]').prop('checked', false);
                }
                else if ($.inArray(CONSTANT.platform_type_iphone_copyright, platformAry) > -1
                        || $.inArray(CONSTANT.platform_type_ipad, platformAry) > -1) {
                    modalObj.find('.js-adtype71-div').show();
                }
                else {
                    modalObj.find('.js-adtype71-div').hide();
                    modalObj.find('input[name=ad_type][value=' + CONSTANT.ad_type_app_store + ']').prop('checked', false);
                    modalObj.find('.js-adtype71 input[name=revenue_type]').prop('checked', false);
                }
            }
        },
        _fnInitIncomeRate: function (oData, modalObj) { // 收入分成
            if (!oData.income_rate) {
                return;
            }
            var iCheck = 0;
            modalObj.find('input[name=income_rate]').each(function () {
                if (Number(oData.income_rate) === Number($(this).val())) {
                    iCheck++;
                    $(this).prop('checked', true);
                    return;
                }
            });
            if (iCheck === 0) {
                modalObj.find('input.income-custom').val(oData.income_rate).prop('checked', true);
                modalObj.find('input[name=income-custom-input]').val(oData.income_rate);
            }
        },
        _fnInitMode: function (oData, modalObj) { // 对接方式
            if (!oData.mode) {
                return;
            }
            modalObj.find('input[name=mode][value=' + oData.mode + ']').prop('checked', true);
            if (+oData.mode === CONSTANT.mode_storage_no) {
                modalObj.find('.js-audit').show();
                modalObj.find('input[name=audit][value=' + oData.audit + ']').prop('checked', true);
            }
            else {
                modalObj.find('.js-audit').hide();
            }
        },
        _fnInitModal: function (oData) {
            var self = this;
            Helper._fnOnReadySales({
                toAry: true,
                ajaxOptions: {
                    url: API_URL.manager_common_sales,
                    data: {account_type: 'TRAFFICKER'}
                }
            }, function () {
                var data = {sales: this.sourceData};
                $('#js-trafficker-modal .modal-body').html((doT.template($('#tpl-new-affiliate').text(), undefined, {deliverytpl: $('#tpl-delivery').text(), incomeratetpl: $('#tpl-incomerate').text()}))($.extend({}, data, {model: oData})));
                if (oData.isEdit) { // 修改标题
                    $('#js-trafficker-modal .modal-title').text('修改媒体');
                }
                else {
                    $('#js-trafficker-modal .modal-title').text('新建媒体');
                }
                $('#js-trafficker-modal').modal({
                    backdrop: 'static',
                    show: true
                });
                $('#js-form-basic').validation();
                $('#js-from-kind').validation();
                $('#js-form-union').validation();
                $('#js-form-housead').validation();
                self._fnBtnAffHandle($('#js-trafficker-modal'));
                var modalObj = $('#js-trafficker-modal');
                self._fnInitPlatformAndDelivery(oData, modalObj);
                self._fnInitIncomeRate(oData, modalObj);
                self._fnInitMode(oData, modalObj);
                self = null;
            }, function () {});
        },
        _fnInitHandle: function () {
            var defaults = {
                username: '', // 登录账号
                password: '', // 密码
                name: '', // 媒体全称
                brief_name: '', // 媒体简称
                contact: '', // 联系人
                email: '', // 邮箱
                contact_phone: '', // 手机号
                qq: '', // QQ
                creator_uid: '', // 销售
                alipay_account: '',
                kind: 0, // 媒体类型
                affiliateid: 0
            };
            var self = this;
            self._fnAddValidation();
            $('#js-affiliate-table').delegate('.js-change-status', 'click', function () {
                Helper.load_ajax();
                $.post(API_URL.manager_trafficker_update, {affiliate_type: CONSTANT.affiliate_type_adn, id: dataTable.row($(this).parents('tr')[0]).data().affiliateid, field: 'affiliates_status', value: $(this).attr('data-value')}, function (json) {
                    if (json && json.res === 0) {
                        dataTable.reload();
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                    Helper.close_ajax();
                });
            });
            $('#js-affiliate-table').delegate('.js-change-account', 'click', function () { // 登录账号
                var tmp = window.open('');
                var oRowData = dataTable.row($(this).parents('tr')[0]).data();
                $.post(API_URL.site_change, {id: oRowData.user_id}, function (json) {
                    if (json && json.res === 0) {
                        if (CONSTANT.kind_union === oRowData.kind) {
                            if (oRowData.delivery_type === CONSTANT.delivery_type_game) {
                                tmp.location.href = BOS.DOCUMENT_URI + '/trafficker/stat/game.html';
                            }
                            else {
                                tmp.location.href = BOS.DOCUMENT_URI + '/trafficker';
                            }
                        }
                        else {
                            tmp.location.href = BOS.DOCUMENT_URI + '/housead/trafficker';
                        }
                    }
                    else {
                        tmp.location.href = API_URL.login_url;
                    }
                }).fail(function () {
                    tmp.location.href = API_URL.login_url;
                });
            });
            $('#js-affiliate-table').delegate('.js-edit', 'click', function () { // 修改资料
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                self._fnInitModal($.extend({}, defaults, oData, {isEdit: true}));
            });
            $('#js-trafficker-modal').delegate('input[name=kind]', 'click', function () {
                var iKind = $('input[name=ikind]').val() ? parseInt($('input[name=ikind]').val(), 10) : 0;
                if ($(this).prop('checked')) {
                    iKind += parseInt($(this).val(), 10);
                }
                else {
                    iKind -= parseInt($(this).val(), 10);
                }
                $('input[name=ikind]').val(iKind === 0 ? '' : (iKind + '')).trigger('blur');
                $('#js-classify-kind-' + $(this).val()).css('display', $(this).prop('checked') ? 'block' : 'none');
            });
            $('#js-trafficker-modal').delegate('#js-confirm', 'click', function () {
                var invalid = false;
                if (!$('#js-form-basic').valid()) {
                    invalid = true;
                }
                if (!$('#js-from-kind').valid()) {
                    invalid = true;
                }
                var kind = 0;
                $('input[name=kind]').filter(':checked').each(function () {
                    kind += parseInt($(this).val(), 10);
                    if (!$(this).parents('form').valid()) {
                        invalid = true;
                    }
                });
                if (invalid) {
                    return;
                }
                // 获取表单数据
                $.post(API_URL.manager_trafficker_store, self._fnGetAffliate(kind)).then(
                    function (json) {
                        if (json && json.res === 0) {
                            // 关闭modal、刷新表格
                            $('.js-audit').hide();
                            dataTable.reload();
                            $('#js-trafficker-modal').modal('hide');
                        }
                        else {
                            Helper.fnPrompt(json.msg);
                        }
                    },
                    function () {
                        Helper.fnPrompt(MSG.server_error);
                    }
                );
            });
            $('#js-add-affiliate').click(function () {
                self._fnInitModal(defaults);
            });
            $('#js-affiliate-table').delegate('[data-toggle=popover]', 'click', function () {
                $(this).popover('show');
            });
            $('body').delegate('.js-confirm-delivery, .js-cancel-delivery', 'click', function () {
                var parent = $(this).parents('.form-delivery');
                $('.popver-delivery').hide();
                $('body').removeClass('modal-open').css('padding-right', '0');
                if ($(this).attr('data-handle') === '1') { // 确定选择
                    $('input[name=select_app_platform]').val(parent.find('select[data-name=select_app_platform]').val());
                    $('input[name=select_ad_type]').val(parent.find('select[data-name=select_ad_type]').val());
                    $('input[name=select_revenue_type]').val(parent.find('select[data-name=select_revenue_type]').val());
                    // 设置filter的值
                    self._fnSetFilter();
                    dataTable.reload();
                }
                else {
                    $('select[data-name=select_app_platform]').val($('input[name=select_app_platform]').val());
                    $('select[data-name=select_ad_type]').val($('input[name=select_ad_type]').val());
                    $('select[data-name=select_revenue_type]').val($('input[name=select_revenue_type]').val());
                }
            });
            $(document).click(function (e) {
                if ($('[data-toggle="popover"]').is(e.target)) {
                    $('.popver-delivery').hide();
                    $('body').removeClass('modal-open').css('padding-right', '0');
                    $('[data-toggle="popover"]').each(function () {
                        if (!$(this).is(e.target)) {
                            $(this).popover('hide');
                        }
                    });
                    return;
                }
                if ($('.popover').is(e.target) || $('.popover').has(e.target).length > 0) {
                    return;
                }
                $('[data-toggle=popover]').popover('hide');
                if ($('.select-delivery').is(e.target)) {
                    return;
                }
                var con = $('.div-delivery');
                if (!con.is(e.target) && con.has(e.target).length === 0) {
                    $('.popver-delivery').hide();
                    $('body').removeClass('modal-open').css('padding-right', '0');
                }
            });
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) { // 自定义列显示
            var thisCol = table.nameList[col];
            var key = null;
            if (thisCol === 'income_rate') {
                if (oData.kind & CONSTANT.kind_union) {
                    var sHtml = '';
                    sHtml += '<div><label class="title">收入分成:</label><div class="content">' + oData.income_rate + '%</div></div>';
                    sHtml += '<div><label class="title">对接方式:</label><div class="content">' + '' + LANG.mode[oData.mode] + '';
                    if (+oData.mode === CONSTANT.mode_storage_no) {
                        sHtml += ',&nbsp;<span class="text-warning">' + LANG.audit[oData.audit] + '</span>';
                    }
                    sHtml += '</div></div>';
                    var sDeliveryType = '';
                    if (oData.delivery_type) {
                        for (key in LANG.delivery_type) {
                            if (oData.delivery_type & key) {
                                sDeliveryType += '<span style="display:block;">' + LANG.delivery_type[key] + '</span>';
                            }
                        }
                    }
                    sHtml += '<div><label class="title">投放类型:</label><div class="content">' + sDeliveryType + '</div></div>';
                    sHtml += '<div><label class="title">密钥:</label><div class="content"><a href="javascript:;" class="text-warning" data-toggle="popover" data-trigger="manual" title="" data-content="' + oData.crypt_key + '">点击查看</a></div></div>';
                    sHtml += '<div><label class="title">累计收入:</label><div class="content">' + oData.income_amount + '</div></div>';
                    sHtml += '<div><label class="title">有效广告位:</label><div class="content">' + oData.zone_count + '</div></div>';
                    $(td).html('<div class="table-group">' + sHtml + '</div>');
                }
                else {
                    $(td).html('-');
                }
            }
            else if (thisCol === 'delivery') {
                var dHtml = '';
                var sPlatform = '';
                if (oData.app_platform === 15 || oData.app_platform === 7) {
                    sPlatform = oData.app_platform ? LANG.platform_group[oData.app_platform] : '';
                }
                else {
                    var aryPlatform = this._fnGetPlatformAry(oData.app_platform);
                    if (aryPlatform && aryPlatform.length > 0) {
                        for (var i = 0, j = aryPlatform.length; i < j; i++) {
                            sPlatform += '<span style="display:block;">' + LANG.platform_group[aryPlatform[i]] + '</span>';
                        }
                    }
                }
                dHtml += '<div><label class="title">平台类型:</label><div class="content">' + sPlatform + '</div></div>';
                var deliveryHtml = '';
                var delivery = oData.delivery;
                if (delivery && delivery.length > 0) {
                    var oAds = {};
                    for (var ii = 0, jj = delivery.length; ii < jj; ii++) {
                        if ($.inArray(delivery[ii].ad_type, CONSTANT.ad_type_no_done) > -1) {
                            continue;
                        }
                        if (oAds[delivery[ii].ad_type]) {
                            oAds[delivery[ii].ad_type] += '&nbsp;&&nbsp;' + LANG.revenue_type[delivery[ii].revenue_type];
                        }
                        else {
                            oAds[delivery[ii].ad_type] = LANG.ad_type[delivery[ii].ad_type] + ',&nbsp;' + LANG.revenue_type[delivery[ii].revenue_type];
                        }
                    }
                    for (key in oAds) {
                        deliveryHtml += '<span style="display:block;">' + oAds[key] + '</span>';
                    }
                }
                dHtml += '<div><label class="title">支持投放:</label><div class="content">' + deliveryHtml + '</div></div>';
                $(td).html('<div class="table-group">' + dHtml + '</div>');
            }
            else if (thisCol === 'alipay_account') {
                if (oData.kind & CONSTANT.kind_self) {
                    var selfHtml = '';
                    selfHtml += '<div><label class="title">媒体类型:</label><div class="content">应用市场</div></div>';
                    selfHtml += '<div><label class="title">支付宝:</label><div class="content">' + oData.alipay_account + '</div></div>';
                    selfHtml += '<div><label class="title">累计收入:</label><div class="content">' + oData.self_income_amount + '</div></div>';
                    selfHtml += '<div><label class="title">有效广告位:</label><div class="content">' + oData.zone_count + '</div></div>';
                    $(td).html('<div class="table-group">' + selfHtml + '</div>');
                }
                else {
                    $(td).html('-');
                }
            }
            else if (thisCol === 'creator_username') {
                var operHtml = '';
                operHtml += '<button type="button" class="btn btn-default js-edit"><i class="fa fa-pencil-square-o"></i>修改</button>';
                if (oData.affiliates_status === CONSTANT.aff_status_pause) {
                    operHtml += '<button type="button" class="btn btn-default js-change-status" data-value="' + CONSTANT.aff_status_continue + '"><i class="fa fa-play"></i>启用</button>';
                }
                else {
                    operHtml += '<button type="button" class="btn btn-default js-change-status" data-value="' + CONSTANT.aff_status_pause + '"><i class="fa fa-pause"></i>停用</button>';
                }
                operHtml += '<button class="btn btn-default js-change-account"><i class="fa fa-user-plus"></i>登录账号</button>';
                $(td).html(operHtml);
            }
        },
        _fnDrawCallback: function () {
            // $('[data-toggle="popover"]').popover();
            // var defaults = {
            //     type: 'text',
            //     title: '修改媒体商信息',
            //     params: function () {
            //         return {
            //             id: dataTable.row($(this).parents('tr')[0]).data().affiliateid
            //         };
            //     },
            //     url: API_URL.manager_trafficker_update,
            //     success: function (response) {
            //         if (response.res === 0) {
            //             dataTable.reload(null, false);
            //         }
            //         else {
            //             Helper.fnPrompt(response.msg);
            //         }
            //     }
            // };
            // var oEditTxt = ['name', 'brief_name', 'app_platform', 'mode', 'income_rate', 'contact', 'contact_phone', 'email', 'qq', 'creator_uid', 'delivery'];
            // var self = this;
            // var modeTpl = (doT.template($('#tpl-mode').text()))(LANG.mode);
            // /* eslint no-loop-func: [0]*/
            // for (var i = 0, j = oEditTxt.length; i < j; i++) {
            //     var oConf = {
            //         name: oEditTxt[i],
            //         value: function () {
            //             return dataTable.row($(this).parents('tr')[0]).data()[oEditTxt[i]];
            //         },
            //         maxlength: 32
            //     };
            //     if (oEditTxt[i] === 'name') {
            //         oConf = $.extend(oConf, {
            //             validate: function (value) {
            //                 if (value === undefined || $.trim(value) === '') {
            //                     return '媒体全称必须填写';
            //                 }
            //                 if (!Helper.fnIsTraName(value)) {
            //                     return '媒体全称必须为32位以内的字母，中文，数字，下划线，@，#，横线和括号组成';
            //                 }
            //             }
            //         });
            //     }
            //     else if (oEditTxt[i] === 'brief_name') {
            //         oConf = $.extend(oConf, {
            //             validate: function (value) {
            //                 if (value === undefined || $.trim(value) === '') {
            //                     return '媒体简称必须填写';
            //                 }
            //                 if (!Helper.fnIsTraName(value)) {
            //                     return '媒体简称必须为32位以内的字母，中文，数字，下划线，@，#，横线和括号组成';
            //                 }
            //             }
            //         });
            //     }
            //     else if (oEditTxt[i] === 'app_platform') {
            //         oConf = {
            //             type: 'checkbox',
            //             title: '修改平台类型',
            //             source: LANG.platform,
            //             value: function () {
            //                 return self._fnGetPlatformAry(dataTable.row($(this).parents('tr')[0]).data()[oEditTxt[i]]);
            //             },
            //             validate: function (value) {
            //                 if (value === undefined || value == null || value.length === 0) {
            //                     return '请至少选择一个平台';
            //                 }
            //             },
            //             params: function () {
            //                 var iVal = 0;
            //                 $('input[type="checkbox"][name="checklist"]:checked').each(function (index, el) {
            //                     iVal += parseInt($(this).val(), 10);
            //                 });
            //                 return {
            //                     id: dataTable.row($(this).parents('tr')[0]).data().affiliateid,
            //                     value: iVal,
            //                     field: 'app_platform'
            //                 };
            //             }
            //         };
            //     }
            //     else if (oEditTxt[i] === 'mode') {
            //         oConf = $.extend(oConf, {
            //             type: 'modeedit',
            //             tpl: modeTpl,
            //             value: function () {
            //                 return {
            //                     mode: dataTable.row($(this).parents('tr')[0]).data().mode,
            //                     audit: dataTable.row($(this).parents('tr')[0]).data().audit
            //                 };
            //             },
            //             validate: function (value) {
            //                 if (value == null || value === '') {
            //                     return '请选择对接方式';
            //                 }
            //                 if (value === 'mode') {
            //                     return '请选择是否审核';
            //                 }
            //             }
            //         });
            //     }
            //     else if (oEditTxt[i] === 'income_rate') {
            //         oConf = $.extend(oConf, {
            //             type: 'rateedit',
            //             title: '修改收入分成',
            //             tpl: $('#tpl-incomerate').text(),
            //             validate: function (value) {
            //                 if (value === undefined || value == null || value === '') {
            //                     return '请选择收入分成';
            //                 }
            //             }
            //         });
            //     }
            //     else if (oEditTxt[i] === 'contact') {
            //         oConf = $.extend(oConf, {
            //             validate: function (value) {
            //                 if (value === undefined || $.trim(value) === '') {
            //                     return '联系人姓名必须填写';
            //                 }
            //                 if (!Helper.fnIsContact(value)) {
            //                     return '联系人姓名格式不正确';
            //                 }
            //             }
            //         });
            //     }
            //     else if (oEditTxt[i] === 'contact_phone') {
            //         oConf = $.extend(oConf, {
            //             validate: function (value) {
            //                 if (value === undefined || $.trim(value) === '') {
            //                     return '手机号必须填写';
            //                 }
            //                 if (!Helper.fnIsTelphone(value)) {
            //                     return '手机号码格式不正确';
            //                 }
            //             },
            //             maxlength: 11
            //         });
            //     }
            //     else if (oEditTxt[i] === 'email') {
            //         oConf = $.extend(oConf, {
            //             validate: function (value) {
            //                 if (value === undefined || $.trim(value) === '') {
            //                     return '邮箱必须填写';
            //                 }
            //                 if (!Helper.fnIsEmail(value)) {
            //                     return '邮箱格式不正确';
            //                 }
            //             },
            //             maxlength: 320
            //         });
            //     }
            //     else if (oEditTxt[i] === 'qq') {
            //         oConf = $.extend(oConf, {
            //             validate: function (value) {
            //                 if (value && !Helper.fnIsQQ(value)) {
            //                     return '邮箱格式不正确';
            //                 }
            //             },
            //             maxlength: 11
            //         });
            //     }
            //     else if (oEditTxt[i] === 'creator_uid') {
            //         oConf = $.extend(oConf, {
            //             type: 'select',
            //             title: '修改销售顾问',
            //             source: API_URL.manager_common_sales,
            //             sourceOptions: {data: {account_type: 'TRAFFICKER'}, type: 'post'}
            //         });
            //     }
            //     else if (oEditTxt[i] === 'delivery') {
            //         oConf = $.extend(oConf, {
            //             placement: 'auto',
            //             title: '支持投放',
            //             type: 'deliveryedit',
            //             tpl: doT.template($('#tpl-delivery').text())(null),
            //             value: function () {
            //                 return {
            //                     delivery: dataTable.row($(this).parents('tr')[0]).data().delivery,
            //                     app_platform: self._fnGetPlatformAry(dataTable.row($(this).parents('tr')[0]).data().app_platform)
            //                 };
            //             },
            //             validate: function (value) {
            //                 if (value === undefined || value == null) {
            //                     return '请选择支持投放';
            //                 }
            //                 else if (value === 'revenue_type') {
            //                     return '请选择支持投放对应的计费类型';
            //                 }
            //                 // else if (value === 'num') {
            //                 //     return 'CPC转换系数必须大于0且小于等于1000';
            //                 // }
            //             }
            //         });
            //     }
                // $('.table-edit.' + oEditTxt[i]).editable($.extend({}, defaults, oConf));
            // }
        },
        _fnBindSelect: function (mData, obj) {
            var self = this;
            $('<select data-name="select_' + mData + '"><option value="">所有</option></select>').appendTo(obj).on('change', function (evt) {
                evt.stopPropagation();
                $('input[name=' + $(this).attr('data-name') + ']').val($(this).val());
                self._fnSetFilter();
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
        _fnCreateDeliverySelect: function () {
            var deliveryCont = '<div class="form-horizontal form-delivery">';
            deliveryCont += '<div class="form-group"><label for="" class="col-sm-4 control-label">平台类型:</label>';
            deliveryCont += '<div class="col-sm-8"><select class="form-control" data-name="select_app_platform"><option value="">所有</option>'; // 添加平台
            for (var key in LANG.platform) {
                deliveryCont += '<option value="' + key + '">' + LANG.platform[key] + '</option>';
            }
            deliveryCont += '</select></div></div>';
            deliveryCont += '<div class="form-group"><label for="" class="col-sm-4 control-label">广告类型:</label>';
            deliveryCont += '<div class="col-sm-8"><select class="form-control" data-name="select_ad_type"><option value="">所有</option>';
            for (var adTypeKey in LANG.MANAGER_AD_TYPE) {
                deliveryCont += '<option value="' + adTypeKey + '">' + LANG.MANAGER_AD_TYPE[adTypeKey] + '</option>';
            }
            deliveryCont += '</select></div></div>';
            deliveryCont += '<div class="form-group"><label for="" class="col-sm-4 control-label">计费类型:</label>';
            deliveryCont += '<div class="col-sm-8"><select class="form-control" data-name="select_revenue_type"><option value="">所有</option>';
            for (var revenueTypeKey in LANG.revenue_type) {
                deliveryCont += '<option value="' + revenueTypeKey + '">' + LANG.revenue_type[revenueTypeKey] + '</option>';
            }
            deliveryCont += '</select></div></div>';
            deliveryCont += '<div class="form-group"><div class="col-sm-offset-4 col-sm-8">';
            deliveryCont += '<button type="button" class="btn btn-primary js-confirm-delivery" data-handle="1">确定</button>';
            deliveryCont += '<button type="button" class="btn btn-default js-cancel-delivery" data-handle="0">取消</button>';
            deliveryCont += '</div></div>';
            deliveryCont += '</div>';
            return deliveryCont;
        },
        _fnInitComplete: function (settings, json, obj) {
            var self = this;
            var aoColumns = settings.aoColumns;
            var api = obj.api();
            for (var i = 0, j = aoColumns.length; i < j; i++) {
                var mData = aoColumns[i].mData;
                if (mData === 'affiliates_status' || mData === 'creator_uid') {
                    var column = api.column(i);
                    var $span = $('<span class="addselect">▾</span>').appendTo($(column.header()));
                    self._fnBindSelect(mData, $span);
                }
                if (mData === 'delivery') {
                    var columnDelivery = api.column(i);
                    var span = '<span class="select-delivery">▾</span>';
                    span += '<div class="div-delivery" style="position:relative;"><div class="popver-delivery popover fade bottom in" role="tooltip" style="top: 1px;">';
                    span += '<div class="arrow" style="left: 50%;"></div>';
                    span += '<div class="popover-content">';
                    span += self._fnCreateDeliverySelect();
                    span += '</div>';
                    span += '</div></div>';
                    /* eslint no-loop-func: [0]*/
                    $(span).appendTo($(columnDelivery.header())).on('click', function (e) {
                        $('body').addClass('modal-open').css('padding-right', '17px');
                        $(this).next('.div-delivery').find('.popver-delivery').show();
                    });
                }
            }
            // if ($('select[data-name=select_app_platform]') && $('select[data-name=select_app_platform]').length > 0) { // 获取平台类型
            //     self._fnCreateSelect($('select[data-name=select_app_platform]'), LANG.platform);
            // }
            if ($('select[data-name=select_affiliates_status]') && $('select[data-name=select_affiliates_status]').length > 0) { // 获取运营状态
                self._fnCreateSelect($('select[data-name=select_affiliates_status]'), LANG.affiliates_status);
            }
            if ($('select[data-name=select_creator_uid]') && $('select[data-name=select_creator_uid]').length > 0) { // 获取运营状态
                $.get(API_URL.manager_trafficker_filter, function (json) {
                    if (json && json.res === 0) {
                        self._fnCreateSelect($('select[data-name=select_creator_uid]'), json.obj.creator_uid);
                    }
                });
            }
        },
        fnInit: function () {
            var self = this;
            Helper.fnCreatTable('#js-affiliate-table', this.oTraffickerTitle, API_URL.manager_trafficker_index, function (td, sData, oData, row, col, table) {
                self._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                fnDrawCallback: function () {
                    self._fnDrawCallback();
                },
                fnInitComplete: function (settings, json) {
                    self._fnInitComplete(settings, json, this);
                },
                postData: {
                    affiliate_type: CONSTANT.affiliate_type_adn,
                    filter: function () {
                        return $('input[name=filter]').val();
                    }
                }
            });
            self._fnInitHandle();
        }
    };
    return new TraffickerIndex();
})(window.jQuery);
$(function () {
    traffickerIndex.fnInit();
});
