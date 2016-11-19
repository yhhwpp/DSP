/**
 * @file config.js
 * @author songxing
 */
var ManagerAdvertiser = (function ($) {
    'use strict';
    var ManagerAdvertiser = function () {
        this.accountType = 0;
        this.allSales = null;
        this.filterAry = ['revenue_type', 'clients_status', 'creator_uid'];
    };

    ManagerAdvertiser.prototype = {
        _oColumnTitle: {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'clientid',
                title: 'id'
            }, {
                field: 'date_created',
                title: '创建时间'
            }, {
                field: 'brief_name',
                title: '广告主'
            }, {
                field: 'username',
                title: '登录账号'
            }, {
                field: 'contact',
                title: '联系人'
            }, {
                field: 'total',
                title: '账户余额'
            }, {
                field: 'creator_uid',
                title: '销售顾问'
            }, {
                field: 'clients_status',
                title: '运营状态'
            }, {
                field: 'clientid',
                title: '操作'
            }]
        },
        _oRechargeDetailColumnTitle: {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'date',
                title: '申请时间'
            }, {
                field: 'clientname',
                title: '充值对象'
            }, {
                field: 'amount',
                title: '充值金额'
            }, {
                field: 'contact_name',
                title: '申请人'
            }, {
                field: 'status',
                title: '状态',
                column_set: ['sortable']
            }]
        },
        _oGiftDetailColumnTitle: {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'created_at',
                title: '申请时间'
            }, {
                field: 'contact',
                title: '赠送对象'
            }, {
                field: 'amount',
                title: '赠送金额'
            }, {
                field: 'gift_info',
                title: '赠送原因'
            }, {
                field: 'contact_name',
                title: '申请人'
            }, {
                field: 'status',
                title: '状态',
                column_set: ['sortable']
            }]
        },

        _fnRun: function (type) {
            this._fnGetAllSales(type);
        },
        _fnGetAllSales: function (type) {
            var _this = this;
            $.get(API_URL.trafficker_advertiser_sales, function (json) {
                if (json && json.res === 0) {
                    _this.allSales = json.obj ? json.obj : {};
                    _this._fnCreateTable(type);
                }
                _this = null;
            }).fail(function () {
                Helper.fnPrompt('服务器请求失败，请稍后重试！');
            });
        },

        _fnCustomColumn: function (td, sData, oData, row, col, table, accountType) {

            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'brief_name':
                    var _name = accountType === 2 ?  oData.name : oData.clientname;
                    html += '<span class="clientname" data-field ="clientname" data-data="' + _name + '">全称：' + _name  + '</span><br/>';
                    html += '<span class="brief_name" data-field="brief_name" data-data="' + sData + '">简称：' + sData + '</span>';
                    break;
                case 'contact':
                    html += '<span class="contact" data-field ="contact" data-data="' + oData.contact + '">姓名：' + sData + '</span><br/>';
                    html += '<span class="email" data-field="email" data-data="' + oData.email + '">邮箱：' + oData.email + '</span><br/>';
                    html += '<span class="contact_phone" data-field="contact_phone" data-data="' + oData.contact_phone + '">手机：' + oData.contact_phone + '</span><br/>';
                    html += '<span class="qq" data-field="qq" data-data="' + oData.qq + '">QQ：' + oData.qq + '</span>';
                    break;
                case 'creator_uid':
                    html += '<span class="' + thisCol + '" data-data="' + sData + '" data-field ="' + thisCol + '">';
                    html += (sData ? oData.creator_name : '');
                    html += '</span>';
                    break;
                case 'clients_status':
                case 'status':
                    html += (+sData ? '运营中' : '已暂停');
                    break;
                case 'balance':
                case 'gift':
                case 'total':
                    var _id = accountType === 2 ? oData.brokerid : oData.clientid;
                    if (accountType !== 1) { //  获客广告主不显示总金额
                        html += '<p style="margin:0;">总金额：' + Helper.fnFormatMoney(oData.total) + '</p>';
                    }
                    html += '<p style="margin:0;">充值金：' + Helper.fnFormatMoney(oData.balance) + '</p>';
                    html += '<p style="margin:0;">赠送金：' + Helper.fnFormatMoney(oData.gift) + '</p>';
                    if (accountType !== 1) {
                        $(td).addClass('js-recharge-detail').attr('data-clientid', _id);
                    }

                    break;
                case 'clientid':
                case 'brokerid':

                    if (col > 1) {
                        var _showid = accountType === 2 ? oData.brokerid : oData.clientid;
                        var _showname = accountType === 2 ? oData.name : oData.clientname;
                        if (+oData.clients_status || +oData.status) {

                            if (accountType !== 1) {
                                html += '<button type="button" class="btn btn-default js-account-edit" data-clientid="' + _showid + '"><i class="fa fa-pencil-square-o"></i>修改</button>';
                            }
                            html += '<button type="button" class="btn btn-default js-account-ctrl" data-clientid="' + _showid + '" data-action="0"><i class="fa fa-pause"></i>停用</button>';
                            if (accountType !== 1) {
                                html += '<button type="button" class="btn btn-default js-recharge-apply" data-clientname="' + _showname + '" data-clientid="' + _showid + '"><i class="fa fa-cny"></i>充值/赠送申请</button>';
                                html += '<button type="button" class="btn btn-default js-reset-passwd" data-clientid="' + _showid + '"><i class="fa fa-unlock-alt"></i>重置密码</button>';
                            }
                        }
                        else {
                            html += '<button type="button" class="btn btn-default js-account-ctrl" data-clientid="' + _showid + '"  data-action="1"><i class="fa fa-play"></i>启用</button>';
                        }

                        html += '<button type="button" class="btn btn-default js-account-login" data-user-id="' + oData.user_id + '"><i class="fa fa-user-plus"></i>登录账号</button>';
                    }
                    else {
                        html += sData;
                    }
                    break;
                default:
                    html += sData;
                    break;
            }

            $(td).html(html);
        },
        _fnCreateTable: function (accountType) {
            if (!this.allSales) {
                return;
            }
            if (typeof window.dataTable === 'object') {
                window.dataTable.destroy();
                $('#advertiser-table').empty();
            }
            var _this = this;
            var columnTitle = $.extend(true, {}, _this._oColumnTitle);
            if (accountType === 1) {  // 获客广告主增加代理列
                columnTitle.list.splice(6, 0, {
                    field: 'broker_brief_name',
                    title: '代理商'
                });
            }
            else if (accountType === 2) { // 代理商自定义列
                columnTitle.list[0].field = 'brokerid';
                columnTitle.list[8].field = 'brokerid';
                columnTitle.list[2].title = '代理商';
                columnTitle.list[7].field = 'status';
                columnTitle.list[6].field = 'creator_username';

            }
            Helper.fnCreatTable('#advertiser-table', columnTitle, _this._fnChangeApi('index'), function (td, sData, oData, row, col, table) {
                _this._fnCustomColumn(td, sData, oData, row, col, table, accountType);
            }, 'dataTable', {
                postData: {
                    type: accountType
                }
            });
        },

        _fnToggleAccountStatus: function (clientid, status) {
            var _s = this.accountType === 2 ? 'status' : 'clients_status';
            this._fnAccountUpdate(clientid, _s, status, function (json) {
                if (json === -1) {
                    Helper.fnAlert('服务器请求失败，请稍后重试');
                }
                else if (0 === json.res) {
                    window.dataTable.reload();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            });
        },

        _fnAccountUpdate: function (id, field, value, callback) {
            var _this = this;
            var param = {
                id: id,
                field: field,
                value: value
            };
            Helper.load_ajax();
            $.post(_this._fnChangeApi('update'), param, function (json) {
                Helper.close_ajax();
                callback(json);
            }).fail(function () {
                Helper.close_ajax();
                callback(-1);
            });
        },

        _fnAddAccount: function () {
            if (!$('#add-account-container').valid()) {
                return false;
            }

            var _type = $('#addaccount-type-wrapper li.active').data('account-type');
            var _url;
            var param = {
                brief_name: $('#brief-name').val(),
                username: $('#act-username').val(),
                password: $('#password').val(),
                contact: $('#contact-name').val(),
                email: $('#email-address').val(),
                contact_phone: $('#phone').val(),
                qq: $('#qq').val(),
                creator_uid: $('#select-creator').val()
            };
            if (_type === 0) {
                _url = API_URL.trafficker_advertiser_store;
                param =  $.extend({}, param, {
                    clientid: $('#add-account-panel').attr('data-clientid'),
                    clientname: $('#client-name').val(),
                    type: _type
                });
            }
            else if (_type === 2) {
                _url = API_URL.trafficker_broker_store;
                param = $.extend({}, param, {
                    name: $('#client-name').val(),
                    brokerid: $('#add-account-panel').attr('data-clientid')
                });
            }
            Helper.load_ajax();
            $.post(_url, param, function (json) {
                Helper.close_ajax();
                if (0 === json.res) {
                    $('#add-account-panel').modal('hide');
                    window.dataTable.reload();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            }).fail(function () {
                Helper.close_ajax();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        _fnOpenRechargeApplyPanel: function ($ele) {
            var clientId = $ele.attr('data-clientid');
            var clientName = $ele.attr('data-clientname');
            var $panel = $('#recharge-apply-panel');
            $panel.find('.error-msg').remove();
            var $form = $panel.find('form');
            $form.each(function () {
                $(this).validation({
                    blur: false
                });
                this.reset();
            });
            $('#recharge-client').val(clientName).attr('data-clientid', clientId);
            $('#gift-client').val(clientName).attr('data-clientid', clientId);
            $('#recharge-date').datepicker('setDate', new Date());
            $panel.modal({
                backdrop: 'static',
                show: true
            });
        },
        _fnChangeApi: function (str) {
            var _url;
            var _type = this.accountType;
            if (_type === 0 || _type === 1) {
                _url = 'trafficker_advertiser_' + str;
            }
            else if (_type === 2) {
                _url = 'trafficker_broker_' + str;
            }
            return API_URL[_url];
        },
        _fnChangeParam: function (obj, id) {
            var oNewParam = {};
            var _type = this.accountType;
            if (_type === 0) {
                oNewParam = $.extend(true, {}, obj, {
                    clientid: id
                });
            }
            else if (_type === 2) {
                oNewParam = $.extend(true, {}, obj, {
                    brokerid: id
                });
            }
            return oNewParam;
        },
        _fnRechargeApply: function () {
            if (!$('#recharge-apply-panel form[data-role="recharge-form"]').valid()) {
                return false;
            }
            var _this = this;
            var param = {
                way: $('#select-recharge-type').val(),
                account_info: $('#recharge-account').val(),
                date: $('#recharge-date').val(),
                amount: +$('#recharge-amount').val()
            };
            param = _this._fnChangeParam(param, $('#recharge-client').attr('data-clientid'));
            Helper.load_ajax();
            $.post(_this._fnChangeApi('recharge_apply'), param, function (json) {
                Helper.close_ajax();
                if (0 === json.res) {
                    Helper.fnPrompt('充值成功');
                    $('#recharge-apply-panel').modal('hide');
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

        _fnOpenRechargeDetailPanel: function ($ele) {
            if (typeof window.rechargeDetailTable === 'object') {
                window.rechargeDetailTable.destroy();
                $('#recharge-detail-table').empty();
            }
            if (typeof window.giftDetailTable === 'object') {
                window.giftDetailTable.destroy();
                $('#gift-detail-table').empty();
            }
            var _this = this;
            var clientid = $ele.attr('data-clientid');
            var postData = {};
            var _title = {};
            if (_this.accountType === 2) {
                postData = {brokerid: clientid};
                _title = $.extend(true, {}, _this._oRechargeDetailColumnTitle);
                _title.list[1].field = 'name';
            }
            else {
                postData =  {clientid: clientid};
                _title = $.extend(true, {}, _this._oRechargeDetailColumnTitle);
            }
            $('#recharge-apply-detail-panel').modal({
                backdrop: 'static',
                show: true
            }).off('shown.bs.modal').on('shown.bs.modal', function () {
                Helper.fnCreatTable('#recharge-detail-table', _title, _this._fnChangeApi('recharge_detail'), function (td, sData, oData, row, col, table) {
                    _this._fnRechargeDetailColumn(td, sData, oData, row, col, table);
                }, 'rechargeDetailTable', {
                    searching: false,
                    scrollY: '500px',
                    scrollCollapse: true,
                    fixedHeader: false,
                    postData: postData,
                    fnDrawCallback: function () {
                        $('#recharge-detail-table [data-toggle="tooltip"]').tooltip({
                            placement: 'left',
                            trigger: 'hover'
                        });
                    }
                });


                Helper.fnCreatTable('#gift-detail-table', _this._oGiftDetailColumnTitle, _this._fnChangeApi('gift_detail'), function (td, sData, oData, row, col, table) {
                    _this._fnGiftDetailColumn(td, sData, oData, row, col, table);
                }, 'giftDetailTable', {
                    searching: false,
                    scrollY: '500px',
                    scrollCollapse: true,
                    fixedHeader: false,
                    postData: postData,
                    fnDrawCallback: function () {
                        $('#gift-detail-table [data-toggle="tooltip"]').tooltip({
                            placement: 'left',
                            trigger: 'hover'
                        });
                    }
                });
            });
        },

        _fnRechargeDetailColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'amount':
                    html += '<span class="text-success">￥' + Helper.fnFormatMoney(sData) + '</span>';
                    break;
                case 'status':
                    if (sData === 1) {
                        html += '待审核';
                    }
                    else if (sData === 2) {
                        html += '<span class="text-success">审核通过</span>';
                    }
                    else if (sData === 3) {
                        html += '<span data-toggle="tooltip" title="' + oData.comment + '" class="text-danger">已驳回 </span><i class="fa fa-warning"></i>';
                    }
                    else {
                        html += sData;
                    }
                    break;
                default:
                    html += sData;
                    break;
            }
            $(td).html(html);
        },

        // _fnOpenGiftApplyPanel: function ($ele) {
        //     var clientId = $ele.attr('data-clientid');
        //     var clientName = $ele.attr('data-clientname');
        //     var $panel = $('#gift-apply-panel');
        //     $panel.find('.error-msg').remove();
        //     var $form = $panel.find('form').validation({
        //         blur: false
        //     });
        //     $form[0].reset();
        //     $('#gift-client').val(clientName).attr('data-clientid', clientId);
        //     $panel.modal({
        //         backdrop: 'static',
        //         show: true
        //     });
        // },

        _fnGiftApply: function () {
            if (!$('#recharge-apply-panel form[data-role="gift-form"]').valid()) {
                return false;
            }
            var _this = this;
            var param = {
                amount: +$('#gift-amount').val(),
                gift_info: $('#gift-info').val()
            };
            param = _this._fnChangeParam(param, $('#gift-client').attr('data-clientid'));
            Helper.load_ajax();
            $.post(_this._fnChangeApi('gift_apply'), param, function (json) {
                Helper.close_ajax();
                if (0 === json.res) {
                    Helper.fnPrompt('赠送成功');
                    $('#recharge-apply-panel').modal('hide');
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

        _fnOpenGiftDetailPanel: function ($ele) {
            if (typeof window.giftDetailTable === 'object') {
                window.giftDetailTable.destroy();
                $('#gift-detail-table').empty();
            }
            var _this = this;
            var clientid = $ele.attr('data-clientid');
            $('#gift-apply-detail-panel').modal({
                backdrop: 'static',
                show: true
            }).off('shown.bs.modal').on('shown.bs.modal', function () {
                Helper.fnCreatTable('#gift-detail-table', _this._oGiftDetailColumnTitle, API_URL.trafficker_advertiser_gift_detail, function (td, sData, oData, row, col, table) {
                    _this._fnGiftDetailColumn(td, sData, oData, row, col, table);
                }, 'giftDetailTable', {
                    searching: false,
                    scrollY: '500px',
                    scrollCollapse: true,
                    fixedHeader: false,
                    postData: {
                        clientid: clientid
                    },
                    fnDrawCallback: function () {
                        $('#gift-detail-table [data-toggle="tooltip"]').tooltip({
                            placement: 'left',
                            trigger: 'hover'
                        });
                    }
                });
            });
        },

        _fnGiftDetailColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'amount':
                    html += '<span class="text-success">￥' + Helper.fnFormatMoney(sData) + '</span>';
                    break;
                case 'status':
                    if (sData === 1) {
                        html += '待审核';
                    }
                    else if (sData === 2) {
                        html += '<span class="text-success">审核通过</span>';
                    }
                    else if (sData === 3) {
                        html += '<span data-toggle="tooltip" title="' + oData.gift_info + '" class="text-danger">已驳回 </span><i class="fa fa-warning"></i>';
                    }
                    else {
                        html += sData;
                    }
                    break;
                default:
                    html += sData;
                    break;
            }
            $(td).html(html);
        },

        _fnAutoComplete: function ($ele) {
            var _this = this;
            var param = {
                way: $('#select-recharge-type').val()
            };
            param = _this._fnChangeParam(param, $('#recharge-client').attr('data-clientid'));
            $.post(_this._fnChangeApi('recharge_history'), param, function (json) {
                if (0 === json.res) {
                    var list = json.list ? json.list : [];
                    var i = 0;
                    var l = list.length;
                    if (l > 0) {
                        var $ele = $('#recharge-account-auto-list');
                        var html = '';
                        for (; i < l; i++) {
                            html += '<li>' + list[i].account_info + '</li>';
                        }
                        $ele.html(html).show();
                    }
                }
            });
        },

        _fnLoginAccount: function ($ele) {
            var userId = $ele.attr('data-user-id');
            var tmp = window.open('');
            var _this = this;
            $.post(API_URL.site_change, {
                id: userId
            }, function (json) {
                var _type = _this.accountType;
                var _url = _type === 2 ? 'broker' : 'advertiser';
                if (json && json.res === 0) {
                    tmp.location.href = BOS.DOCUMENT_URI + '/housead/' + _url;
                }
                else {
                    tmp.location.href = API_URL.login_url;
                }
            }).fail(function () {
                tmp.location.href = API_URL.login_url;
            });
        },

        _fnOpenAccountEditPanel: function (action, clientid, data) {
            var _this = this;
            $('#add-account-container').html($.tmpl('#tpl-editaccount', {
                action: action,
                info: data,
                allSales: this.allSales,
                name: $('#accout-type-wrapper li.active').attr('data-name'),
                type: _this.accountType
            }));
            $('#add-account-panel').attr('data-clientid', clientid).modal({
                backdrop: 'static',
                show: true
            });
            $('#add-account-container').validation({
                blur: false
            });
        },

        // 打开重置密码弹层
        _fnOpenResetPasswordPanel: function ($ele) {
            $('#reset-pw-clientid').val($ele.attr('data-clientid'));
            $('#new-passwd').val('');
            $('#reset-passwd-wrapper').modal('show');
        },

        // 修改密码
        _fnResetPassword: function () {
            var newPassword = $('#new-passwd').val();
            $('#show-tips').html('');
            if ('' === $.trim(newPassword)) {
                $('#show-tips').html('请输入密码');
                return;
            }

            var clientid = $('#reset-pw-clientid').val();
            this._fnAccountUpdate(clientid, 'password', newPassword, function (json) {
                if (json === -1) {
                    Helper.fnAlert('服务器请求失败，请稍后重试');
                }
                else if (0 === json.res) {
                    Helper.fnPrompt('密码重置成功');
                    $('#reset-passwd-wrapper').modal('hide');
                     // 关闭密码修改框
                }
                else {
                    $('#show-tips').html(json.msg);
                }
            });
        },

        _fnFreshNum: function () {
            $.get(API_URL.trafficker_common_balance_pending_audit, function (data) {
                var cNum = data.obj.recharge_count ? data.obj.recharge_count : 0;
                var mNum = data.obj.gift_count ? data.obj.gift_count : 0;
                var num = cNum + mNum;
                $('#menu [data-type="trafficker-self-balance"] .badge').html(num > 0 ? num : '');
            });
        },

        fnInit: function () {
            var _this = this;

            var $advTableWrapper = $('#advertiser-table-wrapper');
            $advTableWrapper.on('click', '.js-account-ctrl', function () {
                _this._fnToggleAccountStatus($(this).attr('data-clientid'), $(this).data('action'));
            });

            $advTableWrapper.on('click', '.js-recharge-apply', function () {
                _this._fnOpenRechargeApplyPanel($(this));
            });

            $advTableWrapper.on('click', '.js-recharge-detail', function () {
                _this._fnOpenRechargeDetailPanel($(this));
            });

            // $advTableWrapper.on('click', '.js-gift-apply', function () {
            //     _this._fnOpenGiftApplyPanel($(this));
            // });

            // $advTableWrapper.on('click', '.js-gift-detail', function () {
            //     _this._fnOpenGiftDetailPanel($(this));
            // });

            $advTableWrapper.on('click', '.js-account-login', function () {
                _this._fnLoginAccount($(this));
            });

            $advTableWrapper.on('click', '.js-account-edit', function () {
                var clientid = $(this).attr('data-clientid');
                var data = dataTable.row($(this).parents('tr')[0]).data();
                _this._fnOpenAccountEditPanel('edit', clientid, data);
            });

            $advTableWrapper.on('click', '.js-reset-passwd', function () {
                _this._fnOpenResetPasswordPanel($(this));
            });

            $('#reset-passwd-confirm').click(function () {
                _this._fnResetPassword();
            });

            $('#recharge-apply').click(function () {
                if ($('#recharge-apply-panel').attr('data-role') === 'recharge') {
                    _this._fnRechargeApply();
                }
                else {
                    _this._fnGiftApply();
                }
            });

            // $('#gift-apply').click(function () {
            //     _this._fnGiftApply();
            // });

            $('#addaccount-btn-wrapper').on('click', '#addaccount-btn', function () {
                // _this._fnOpenAddAccountPannel();
                var _data = {
                    clientname: '',
                    name: '',
                    brief_name: '',
                    username: '',
                    contact: '',
                    email: '',
                    contact_phone: '',
                    qq: ''
                };
                _this._fnOpenAccountEditPanel('add', 0, _data);
            });

            $('#add-account-confirm').click(function () {
                _this._fnAddAccount();
            });

            $('#recharge-account').on('focus', function () {
                _this._fnAutoComplete($(this));
            });

            $('#recharge-account').on('blur', function () {
                setTimeout(function () {
                    $('#recharge-account-auto-list').hide().html('');
                }, 200);
            });

            $('#recharge-account-auto-list').on('click', 'li', function () {
                $('#recharge-account').val($(this).html());
                $('#recharge-account-auto-list').hide();
            });

            $('#recharge-apply-panel').on('click', 'li[data-role]', function () {
                var $this = $(this);
                var $pannel = $('#recharge-apply-panel').attr('data-role', $this.attr('data-role'));
                $this.addClass('active').siblings().removeClass('active');
                $pannel.find('form[data-role]').hide();
                $pannel.find('form[data-role="' + $this.attr('data-role') + '-form"]').show();
            });

            $('#recharge-apply-detail-panel').on('click', 'li[data-role]', function () {
                var $this = $(this);
                $this.addClass('active').siblings().removeClass('active');
                $('#recharge-detail-table-wrapper').hide();
                $('#gift-detail-table-wrapper').hide();
                $('#' + $this.attr('data-role') + '-detail-table-wrapper').show();
                if ($this.attr('data-role') === 'gift') {
                    window.giftDetailTable.columns.adjust();
                }
                else {
                    window.rechargeDetailTable.columns.adjust();
                }
            });

            // 充值金额，赠送金额限制
            $('#recharge-amount, #gift-amount').on('input propertychange', function () {
                Helper.fnInputCheckNumber(this);
                var value = +this.value;
                if (value >= 100000000) {
                    $(this).val('99999999');
                }
                else if (value < 0) {
                    $(this).val(Math.abs(value));
                }
            });

            $('#addaccount-type-wrapper').delegates({
                '.nav-tabs li': function (e) {
                    $('#addaccount-type-wrapper .nav-tabs li').removeClass('active');
                    $(this).addClass('active');
                    var _accountType = $(this).data('account-type');
                    _this._fnRun(_accountType);
                    _this._showBt(_accountType);
                    _this.accountType = _accountType;
                }
            });
            $('#addaccount-type-wrapper .nav-tabs li').eq(0).trigger('click');
        },
        _showBt: function (type) {
            $('#addaccount-btn-wrapper').html($.tmpl('#tpl-addaccount-btn', {
                type: type
            }));
        }
    };
    return new ManagerAdvertiser();
})(jQuery);

$(function () {
    var accountType = Helper.fnGetHashParam('accountType');
    ManagerAdvertiser.fnInit(accountType);
});
