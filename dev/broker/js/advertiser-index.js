/**
 * @file account-index.js
 * @author xiaokl
 */
var accountIndex = (function ($) {
    var AccountIndex = function () {};
    AccountIndex.prototype = {
        oColumnTitle: {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [
                {
                    field: 'clientname',
                    title: '广告主名称'
                },
                {
                    field: 'brief_name',
                    title: '广告主简称'
                },
                {
                    field: 'username',
                    title: '登录账号'
                },
                {
                    field: 'contact',
                    title: '联系人'
                },
                {
                    field: 'email',
                    title: '邮箱'
                },
                {
                    field: 'phone',
                    title: '手机号'
                },
                {
                    field: 'revenue_type',
                    title: '支持计费方式',
                    bVisible: false
                },
                {
                    field: 'balance',
                    title: '推广金',
                    column_set: ['sortable']
                },
                {
                    field: 'gift',
                    title: '赠送金',
                    column_set: ['sortable']
                },
                {
                    field: 'clients_status',
                    title: '状态'
                },
                {
                    field: 'total',
                    title: '总余额',
                    column_set: ['sortable']
                },
                {
                    field: 'client_id',
                    title: '操作'
                }
            ]
        },
        _fnCreateAdvertiser: function () { // 创建账号
            var advertiserModel = new $.fn.advertisermodel.Model();
            advertiserModel.setAdModel($('#allModal'));
            return advertiserModel.getPostData();
        },
        _fnGetBalanceShow: function () {
            return {
                11: '.js-broker-balance',
                12: '.js-broker-gift',
                21: '.js-advertiser-balance',
                22: '.js-advertiser-gift'
            };
        },
        _fnGetAction: function (action) {
            if ((+action) === 1) {
                return '总账户 -> <b class="text-danger">' + $('#brief-name').val() + '</b>（广告主）';
            }
            return '<b class="text-danger">' + $('#brief-name').val() + '</b>（广告主） -> 总账户';
        },
        _fnInitRemit: function () {
            $('#js-account-table').delegate('.js-remit', 'click', function () { // 划账
                var oDataTable = dataTable.row($(this).parents('tr')[0]).data();
                $('#client-id').val(oDataTable.client_id);
                $('#brief-name').val(oDataTable.brief_name);
                var objAction = {
                    1: '总账户 -> ' + oDataTable.brief_name,
                    2: oDataTable.brief_name + '-> 总账户'
                };
                $.post(API_URL.broker_advertiser_balance_value, {client_id: oDataTable.client_id}, function (json) {
                    if (json && json.res === 0 && json.obj) {
                        $('#js-remit-modal form').html((doT.template($('#tpl-remit').text()))($.extend({}, json.obj, {actions: objAction})));
                        $('#js-remit-modal').modal({backdrop: 'static'});
                        $('#js-remit-modal form').validation();
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                });
            });
            var oBalanceShow = this._fnGetBalanceShow();
            $('#js-remit-modal').delegate('select[name=action], input[name=account_type]', 'change', function () { // 余额显示
                var sObj = '';
                if ($(this).attr('name') === 'action') {
                    sObj += $(this).val();
                    sObj += $('input[name=account_type]:checked').val();
                }
                else {
                    sObj += $('select[name=action]').val();
                    sObj += $(this).val();
                }
                $('form .js-balance').hide();
                var oBalance = oBalanceShow[sObj];
                $(oBalance).show();
                var iBalance = $(oBalance).find('.js-balance-text').text();
                $('input[name=balance]').attr({
                    'data-max-value': iBalance
                });
            });
            // 添加划账金额验证函数
            $.fn.validation.addMethod('nobalance', function (value) {
                if (Number($('input[name=balance]').attr('data-max-value')) === 0 || Number(value) > Number($('input[name=balance]').attr('data-max-value'))) {
                    return true;
                }
                return false;
            }, '余额不足');
            $.fn.validation.addMethod('balancelimit', function (value) {
                if (Number(value) <= 0) {
                    return true;
                }
                return false;
            }, '划账金额大于0');
            $('#js-remit-modal').delegate('input[name=balance]', 'change', function () {
                if ($(this).val() != null && $(this).val() !== '') {
                    $(this).val(parseFloat($(this).val()).toFixed(2));
                }
            });
            var self = this;
            $('#js-remit-modal').delegate('#js-confirm', 'click', function () { // 提交划账
                if (!$('#js-remit-modal form').valid()) {
                    return false;
                }
                // 修改弹出确认框信息
                $('#js-confirm-modal .js-balance').html($('input[name=balance]').val());
                // 获取划账方向
                $('#js-confirm-modal .js-action').html(self._fnGetAction($('select[name=action]').val()));
                // 弹出确认框
                $('#js-confirm-modal').show();
            });
            // 绑定划账按钮
            $('#js-confirm-modal').delegate('#js-confirm-remit', 'click', function () { // 确认划账，提交划账信息
                Helper.load_ajax();
                // 关闭确认划账窗口
                $('#js-confirm-modal').hide();
                var params = {
                    client_id: $('#client-id').val(),
                    action: $('select[name=action]').val(),
                    account_type: $('input[name=account_type]:checked').val(),
                    balance: $('input[name=balance]').val()
                };
                // 提交划账信息
                $.post(API_URL.broker_advertiser_transfer, params, function (json) {
                    if (json && json.res === 0) {
                        // 关闭划账窗口
                        $('#js-remit-modal').modal('hide');
                        // 刷新当前页面
                        location.reload();
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                    Helper.close_ajax();
                });
            });
            $('#js-confirm-modal').delegate('#js-cancel', 'click', function () { // 取消划账
                // 关闭确认划账窗口
                $('#js-confirm-modal').hide();
            });
        },
        _fnInitAddAccountModal: function (sBody) {
            var _this = this;
            $('.js-addaccount-btn').modalable({ // 初始化模板
                body: sBody,
                url: API_URL.broker_advertiser_store,
                success: function (response) {
                    !(response.res) && dataTable.reload();
                },
                params: _this._fnCreateAdvertiser,
                btnHandle: function () {
                    $('#allModal').on('hide.bs.modal', function (e) {
                        $('#allModal input[data-name=password]').attr('type', 'text');
                    });
                }
            });
        },
        _fnInitHandle: function (data) {
            var _this = this;
            Helper._fnOnReadySales({
                toAry: false,
                ajaxOptions: {
                    type: 'get',
                    url: API_URL.broker_campaign_revenue_type
                }
            }, function () {
                var revenueTypeJson = this.sourceData;
                if (revenueTypeJson && revenueTypeJson.revenue_type && revenueTypeJson.revenue_type.length > 0) {
                    _this._fnInitAddAccountModal((doT.template($('#tpl-addaccount').text(), undefined, {revenuetypetpl: $('#tpl-revenue-type').text()}))({revenue_type_val: revenueTypeJson.revenue_type}));
                }
                else {
                    _this._fnInitAddAccountModal((doT.template($('#tpl-addaccount').text(), undefined, {revenuetypetpl: ''}))(data));
                }
            }, function () {
                _this._fnInitAddAccountModal((doT.template($('#tpl-addaccount').text(), undefined, {revenuetypetpl: ''}))(data));
            });
            $('#js-account-table').delegate('.js-change-status', 'click', function () { // 修改广告主账号状态
                var params = {
                    client_id: dataTable.row($(this).parents('tr')[0]).data().client_id,
                    field: 'clients_status',
                    value: $(this).attr('data-value')
                };
                $.post(API_URL.broker_advertiser_update, params, function (json) {
                    if (json && json.res === 0) {
                        dataTable.reload(null, false);
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                });
            });
            this._fnInitRemit();
            $('#js-account-table').delegate('.js-change-account', 'click', function () { // 登录账号
                var tmp = window.open('');
                $.post(API_URL.site_change, {id: dataTable.row($(this).parents('tr')[0]).data().user_id}, function (json) {
                    if (json && json.res === 0) {
                        tmp.location.href = BOS.DOCUMENT_URI + '/advertiser';
                    }
                    else {
                        tmp.location.href = API_URL.login_url;
                    }
                }).fail(function () {
                    tmp.location.href = API_URL.login_url;
                });
            });
        },
        _fnGetRevenueTypeAry: function (revenueType) {
            var aryRes = [];
            if (revenueType) {
                for (var i = 0, j = CONSTANT.revenue_type_array.length; i < j; i++) {
                    if (parseInt(revenueType, 10) & CONSTANT.revenue_type_array[i]) {
                        aryRes.push(CONSTANT.revenue_type_array[i]);
                    }
                }
            }
            return aryRes;
        },
        _fnInitEditRevenueType: function (tpl) {
            var _this = this;
            $('.table-edit.revenue_type').editable({
                type: 'revenuetypeedit',
                tpl: tpl,
                title: '修改支持的计费方式',
                params: function () {
                    return {
                        client_id: dataTable.row($(this).parents('tr')[0]).data().client_id,
                        field: 'revenue_type'
                    };
                },
                url: API_URL.broker_advertiser_update,
                value: function () {
                    return _this._fnGetRevenueTypeAry(dataTable.row($(this).parents('tr')[0]).data().revenue_type);
                },
                success: function (response) {
                    if (response.res === 0) {
                        dataTable.reload();
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                }
            });
        },
        _fnDrawCallback: function () {
            var _this = this;
            var defaults = {
                type: 'text',
                clear: false,
                title: '修改广告主信息',
                url: API_URL.broker_advertiser_update,
                maxlength: 32,
                params: function () {
                    return {
                        client_id: dataTable.row($(this).parents('tr')[0]).data().client_id,
                        field: $(this).attr('data-title')
                    };
                },
                success: function (response) {
                    if (response.res === 0) {
                        dataTable.reload();
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                }
            };
            var aryEdit = ['clientname', 'brief_name', 'contact', 'email', 'phone'];
            for (var i = 0, j = aryEdit.length; i < j; i++) {
                /* eslint no-loop-func: [0]*/
                $('.table-edit.' + aryEdit[i]).editable($.extend({}, defaults, {
                    validate: function (value) {
                        if (value === '' || $.trim(value) === '') {
                            return '不能为空';
                        }
                        if ($(this).attr('data-title') === 'clientname') {
                            if (!Helper.fnIsTraName(value) || value.length > 32 || value.length < 2) {
                                return '请输入广告主名称';
                            }
                        }
                        else if ($(this).attr('data-title') === 'brief_name') {
                            if (!Helper.fnIsTraName(value) || value.length > 32 || value.length < 2) {
                                return '请输入广告主简称';
                            }
                        }
                        else if ($(this).attr('data-title') === 'contact') {
                            if (!Helper.fnIsTraLg(value) || value.length > 32) {
                                return '请输入联系人';
                            }
                        }
                        else if ($(this).attr('data-title') === 'email') {
                            if (!Helper.fnIsEmail(value)) {
                                return '请输入邮箱';
                            }
                        }
                        else if ($(this).attr('data-title') === 'phone') {
                            if (!Helper.fnIsTelphone(value) || value.length !== 11) {
                                return '请输入手机号码';
                            }
                        }
                    }
                }));
            }
            Helper._fnOnReadySales({
                toAry: false,
                ajaxOptions: {
                    type: 'get',
                    url: API_URL.broker_campaign_revenue_type
                }
            }, function () {
                _this._fnInitEditRevenueType(doT.template($('#tpl-revenue-type').text())({revenue_type_val: this.sourceData.revenue_type}));
            }, function () {
                _this._fnInitEditRevenueType(doT.template($('#tpl-revenue-type').text())(null));
            });
            $('[data-toggle="tooltip"]').tooltip();
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) { // 自定义列
            var self = this;
            var thisCol = table.nameList[col];
            if (thisCol === 'clientname' || thisCol === 'brief_name' || thisCol === 'contact' || thisCol === 'email' || thisCol === 'phone') {
                $(td).html('<span class="table-edit ' + thisCol + '" data-title="' + thisCol + '">' + sData + '</span>');
            }
            else if (thisCol === 'clients_status') {
                if (sData === 0) {
                    $(td).html('暂停');
                }
                else {
                    $(td).html('投放中');
                }
            }
            else if (thisCol === 'client_id') {
                var sHtml = '';
                // if (oData.clients_status === 0) {
                //     sHtml += '<button type="button" class="btn btn-default js-change-status" data-value="1">启用</button>';
                // }
                // else {
                //     sHtml += '<button type="button" class="btn btn-default js-change-status" data-value="0">暂停</button>';
                // }
                sHtml += '<button class="btn btn-default js-change-account">登录账号</button>';
                sHtml += '<button type="button" class="btn btn-default js-remit">划账</button>';
                $(td).html(sHtml);
            }
            else if (thisCol === 'revenue_type') {
                var sRevenueType = '';
                var aryRevenueType = self._fnGetRevenueTypeAry(sData);
                if (aryRevenueType && aryRevenueType.length > 0) {

                    for (var i = 0, j = aryRevenueType.length; i < j; i++) {
                        sRevenueType += '<span style="display:block;">' + LANG.revenue_type[aryRevenueType[i]] + '</span>';
                    }
                    $(td).html('<span class="table-edit ' + thisCol + '" data-title="' + thisCol + '">' + sRevenueType + '</span>');
                }
                else {
                    $(td).html('-');
                }
            }
        },
        _fnInitTable: function () {
            var _this = this;
            Helper.fnCreatTable('#js-account-table', _this.oColumnTitle, API_URL.broker_advertiser_index, function (td, sData, oData, row, col, table) {
                _this._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                fnDrawCallback: function () {
                    _this._fnDrawCallback(); // 表格编辑
                }
            });
        },
        _fnInitAccoutList: function () {
            // 初始化表格
            var _this = this;
            Helper._fnOnReadySales({
                toAry: false,
                ajaxOptions: {
                    type: 'get',
                    url: API_URL.broker_campaign_revenue_type
                }
            }, function () {
                var revenueTypeJson = this.sourceData;
                if (revenueTypeJson && revenueTypeJson.revenue_type && revenueTypeJson.revenue_type.length > 0
                    && ($.inArray(CONSTANT.revenue_type_cpa, revenueTypeJson.revenue_type) > -1 || $.inArray(CONSTANT.revenue_type_cpt, revenueTypeJson.revenue_type) > -1)) {
                    _this.oColumnTitle.list[6].bVisible = true;
                    _this._fnInitTable();
                }
                else {
                    _this._fnInitTable();
                }
            }, function () {
                _this._fnInitTable();
            });
        },
        _fnInit: function () {
            this._fnInitHandle();
            this._fnInitAccoutList();
        }
    };
    return new AccountIndex();
})(jQuery);
$(function () {
    accountIndex._fnInit();
});
