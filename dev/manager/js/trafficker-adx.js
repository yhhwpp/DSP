/**
 * @file config.js
 * @author songxing
 */
var ManagerAdx = (function ($) {
    'use strict';
    var ManagerAdx = function () {
        this.allSales = {};
    };

    ManagerAdx.prototype = {
        _oColumnTitle: {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'affiliateid',
                title: 'id'
            }, {
                field: 'date_created',
                title: '创建时间'
            }, {
                field: 'name',
                title: 'Adx名称'
            }, {
                field: 'username',
                title: '登录账号'
            }, {
                field: 'contact',
                title: '联系人'
            }, {
                field: 'app_platform',
                title: 'Adx概况'
            }, {
                field: 'creator_uid',
                title: '销售顾问'
            }, {
                field: 'affiliates_status',
                title: '运营状态'
            }, {
                field: 'account_id',
                title: '操作'
            }]
        },
        _fnRun: function () {
            this._fnGetAllSales();
        },

        _fnGetAllSales: function () {
            var _this = this;
            $.post(API_URL.manager_common_sales, {account_type: 'TRAFFICKER'}, function (json) {
                if (json && json.res === 0) {
                    _this.allSales = json.obj ? json.obj : {};
                    _this._fnCreateTable();
                }
                _this = null;
            }).fail(function () {
                Helper.fnPrompt('服务器请求失败，请稍后重试！');
            });
        },

        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'name':
                    html += '<span>全称：' + sData + '</span><br/>';
                    html += '<span>简称：' + oData.brief_name + '</span>';
                    break;
                case 'contact':
                    html += '<span>姓名：' + sData + '</span><br/>';
                    html += '<span>邮箱：' + oData.email + '</span><br/>';
                    html += '<span>手机：' + oData.contact_phone + '</span><br/>';
                    html += '<span>QQ：' + oData.qq + '</span>';
                    break;
                case 'creator_uid':
                    html += '<span>';
                    html += (sData ? oData.creator_username : '');
                    html += '</span>';
                    break;
                case 'affiliates_status':
                    html += (+sData ? '运营中' : '已暂停');
                    break;
                case 'app_platform':
                    html += '<p style="margin:0;">平台类型：' + (LANG.platform_group[oData.app_platform] ? LANG.platform_group[oData.app_platform] : (function (app_platform) {
                        var text = '';
                        for (var key in LANG.platform) {
                            if (Number(key) & Number(app_platform)) {
                                text += '+' + LANG.platform_group[key];
                            }
                        }
                        text = text.substr(1);
                        return text;
                    })(oData.app_platform)) + '</p>';
                    html += '<p style="margin:0;">支持计费：' + LANG.revenue_type[oData.revenue_type] + '</p>';
                    html += '<p style="margin:0;">媒体折扣：' + oData.income_rate + '%</p>';
                    html += '<p style="margin:0;">累计采量：' + oData.income_amount + '</p>';
                    break;
                case 'account_id':
                    if (col > 1) {
                        if (+oData.affiliates_status) {
                            html += '<button type="button" class="btn btn-default js-account-edit" data-id="' + oData.affiliateid + '"><i class="fa fa-pencil-square-o"></i>修改</button>';
                            html += '<button type="button" class="btn btn-default js-account-stop" data-id="' + oData.affiliateid + '"><i class="fa fa-pause"></i>停用</button>';
                        }
                        else {
                            html += '<button type="button" class="btn btn-default js-account-start" data-id="' + oData.affiliateid + '"><i class="fa fa-play"></i>启用</button>';
                        }
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
        _fnCreateTable: function () {
            if (typeof window.dataTable === 'object') {
                window.dataTable.destroy();
                $('#js-affiliate-table').empty();
            }
            var _this = this;
            var columnTitle = $.extend({}, _this._oColumnTitle);
            Helper.fnCreatTable('#js-affiliate-table', columnTitle, API_URL.manager_trafficker_index, function (td, sData, oData, row, col, table) {
                _this._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                postData: {
                    affiliate_type: CONSTANT.affiliate_type_adx
                }
            });
        },

        _fnToggleAccountStatus: function (id, status) {
            this._fnAccountUpdate(id, 'affiliates_status', status, function (json) {
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
            var param = {
                affiliate_type: CONSTANT.affiliate_type_adx,
                id: id,
                field: field,
                value: value
            };
            Helper.load_ajax();
            $.post(API_URL.manager_trafficker_update, param, function (json) {
                Helper.close_ajax();
                callback(json);
            }).fail(function () {
                Helper.close_ajax();
                callback(-1);
            });
        },

        _fnOpenAddAccountPannel: function () {
            $('#edit-account-container').html($.tmpl('#tpl-addaccount', {
                allSales: this.allSales
            }));
            $('#adx-edit-pannel').modal({
                backdrop: 'static',
                show: true
            });
            $('#edit-account-container').validation({
                blur: false
            });
        },

        _fnOpenAccountEditPanel: function (id, data) {
            $('#edit-account-container').html($.tmpl('#tpl-editaccount', {
                info: data,
                allSales: this.allSales
            }));
            $('#adx-edit-pannel').modal({
                backdrop: 'static',
                show: true
            });
            $('#edit-account-container').validation({
                blur: false
            });
        },

        _fnAccountStore: function () {
            if (!$('#edit-account-container').valid()) {
                return false;
            }

            var platform = 0;
            $('#app-platform-wrapper input[name="app-platform"]:checked ').each(function () {
                platform += Number($(this).val());
            });
            var revenueType = $('#revenue-type-wrapper input[name="revenue-type"]:checked ').val();

            var param = {
                affiliate_type: CONSTANT.affiliate_type_adx,
                affiliateid: $('#affiliate-id').val(),
                name: $('#affiliate-name').val(),
                brief_name: $('#brief-name').val(),
                username: $('#act-username').val(),
                password: $('#password').val(),
                contact: $('#contact-name').val(),
                email: $('#email-address').val(),
                contact_phone: $('#phone').val(),
                qq: $('#qq').val(),
                app_platform: platform,
                revenue_type: revenueType,
                income_rate: $('#income-rate').val(),
                creator_uid: $('#select-creator').val(),
                kind: 1,
                mode: 4,
                audit: 1
            };

            Helper.load_ajax();
            $.post(API_URL.manager_trafficker_store, param, function (json) {
                Helper.close_ajax();
                if (0 === json.res) {
                    $('#adx-edit-pannel').modal('hide');
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

        fnInit: function () {
            var _this = this;
            var $wrapper = $('#affiliate-table-wrapper');
            $wrapper.on('click', '.js-account-stop', function () {
                _this._fnToggleAccountStatus($(this).attr('data-id'), 0);
            });

            $wrapper.on('click', '.js-account-start', function () {
                _this._fnToggleAccountStatus($(this).attr('data-id'), 1);
            });

            $wrapper.on('click', '.js-account-edit', function () {
                var id = $(this).attr('data-id');
                var data = dataTable.row($(this).parents('tr')[0]).data();
                _this._fnOpenAccountEditPanel(id, data);
            });

            $('#add-adx-btn').click(function () {
                _this._fnOpenAddAccountPannel();
            });

            $('#edit-adx-confirm').click(function () {
                _this._fnAccountStore();
            });

            this._fnRun();
        }
    };
    return new ManagerAdx();
})(jQuery);

$(function () {
    var accountType = Helper.fnGetHashParam('accountType');
    ManagerAdx.fnInit(accountType);
});
