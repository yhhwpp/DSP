/**
 * @file config.js
 * @author songxing
 */
(function ($) {
    'use strict';
    var OperationListEdit = function (options) {
        this.init('operlistedit', options, OperationListEdit.defaults);
    };
     // inherit from checklist input
    $.fn.editableutils.inherit(OperationListEdit, $.fn.editabletypes.checkbox);
    $.extend(OperationListEdit.prototype, {
        renderList: function () {
            this.$tpl.empty();
            $(this.options.sBody).appendTo(this.$tpl);
            this.$input = this.$tpl.find('input[type="checkbox"]');
            this.setClass();
        }
    });

    OperationListEdit.defaults = $.extend({}, $.fn.editabletypes.checkbox.defaults, {
        sBody: ''
    });
    $.fn.editabletypes.operlistedit = OperationListEdit;
})(window.jQuery);
var ManagerAccount = (function ($) {
    'use strict';
    var ManagerAccount = function () {
        this.accountType = 'MANAGER';
        this.allOperation = {};
        this.accountSubType = {};
        this.operationSpan = 3; // 权限按多少列排列
    };

    ManagerAccount.prototype = {
        _oColumnTitle: {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [
                {
                    field: 'username',
                    title: '账号名称',
                    column_set: ['sortable']
                },
                {
                    field: 'name',
                    title: '联系人'
                },
                {
                    field: 'operation_list',
                    title: '权限列表'
                },
                {
                    field: 'user_id',
                    title: '操作'
                }
            ]
        },

        _fnRun: function () {
            this._fnGetOperationList();
            this._fnGetAccountSubType();
            this._fnCreateTable();
        },

        _fnGetOperationList: function () {
            var _this = this;
            if (!this.allOperation[this.accountType]) {
                var param = {
                    type: this.accountType
                };
                $.get(API_URL.site_operation, param, function (json) {
                    if (json && json.res === 0) {
                        _this.allOperation[_this.accountType] = json.list ? json.list : [];
                        _this._fnCreateTable();
                    }
                    _this = null;
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                });
            }
        },

        _fnGetAccountSubType: function () {
            var _this = this;
            if (!this.accountSubType[this.accountType]) {
                var param = {
                    type: this.accountType
                };
                $.get(API_URL.site_account_sub_type, param, function (json) {
                    if (json && json.res === 0) {
                        _this.accountSubType[_this.accountType] = json.list ? json.list : [];
                        _this._fnCreateTable();
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                    _this = null;
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                });
            }
        },
        _fnGenOperation: function (aOperationList) {
            var allOperation = this.allOperation[this.accountType];
            var span = this.operationSpan;
            var html = '';
            if (aOperationList === 'all') {
                for (var j = 0, len = allOperation.length; j < len; j++) {
                    html += allOperation[j].label + ((j + 1) % span !== 0 ? '&nbsp;&nbsp;' : '<br />');
                }
            }
            else if ($.isArray(aOperationList)) {
                for (var i = 0, l = aOperationList.length; i < l; i++) {
                    for (var ii = 0, ll = allOperation.length; ii < ll; ii++) {
                        if (allOperation[ii].name === aOperationList[i]) {
                            html += allOperation[ii].label + ((i + 1) % span !== 0 ? '&nbsp;&nbsp;' : '<br />');
                            break;
                        }
                    }
                }
            }
            return html;
        },
        _fnGenUserRole: function (roleId, oData) {
            var accountSubType = this.accountSubType[this.accountType];
            if (!$.isArray(accountSubType)) {
                return '';
            }
            var html = '<select data-type="select-role" data-id="' + oData.user_id + '">';
            var tmp = null;
            for (var i = 0, l = accountSubType.length; i < l; i++) {
                tmp = accountSubType[i];
                html += '<option value="' + tmp.account_sub_type_id + '" ' + (roleId === tmp.account_sub_type_id ? 'selected' : '') + '>' + tmp.name + '</option>';
            }
            html += '</select>';
            return html;
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'operation_list':
                    html += '<span class="table-edit ' + thisCol + '" data-label ="' + thisCol + '">';
                    var aOperationList = sData === 'all' ? sData : sData.split(',');
                    html += this._fnGenOperation(aOperationList);
                    html += '</span>';
                    break;
                case 'account_sub_type_id':
                    html += this._fnGenUserRole(sData, oData);
                    break;
                case 'user_id':
                    html += '<button data-id="' + sData + '" data-field="password" class="btn btn-default change-pass js-reset-passwd"><i class="fa fa-unlock-alt"></i> 重置密码</button>';
                    if (this.accountType === 'MANAGER') {
                        if (+oData.active) {
                            html += '<button type="button" class="btn btn-default js-account-stop" data-userid="' + oData.user_id + '" data-status="0"><i class="fa fa-pause"></i>停用</button>';
                        }
                        else {
                            html += '<button type="button" class="btn btn-default js-account-start" data-userid="' + oData.user_id + '" data-status="1"><i class="fa fa-play"></i>启用</button>';
                        }
                    }
                    break;
                case 'active':
                    html += LANG.affiliates_status[sData];
                    break;
                default:
                    html = sData;
                    break;
            }
            $(td).html(html);
        },

        _fnCreateTable: function () {
            if (!this.allOperation[this.accountType] || !this.accountSubType[this.accountType]) {
                return false;
            }
            if (typeof dataTable === 'object') {
                dataTable.destroy();
                $('#account-table').empty();
            }

            var _this = this;
            var columnTitle = $.extend({}, _this._oColumnTitle);
            if (this.accountType === 'MANAGER') {
                columnTitle.list = columnTitle.list.slice(0); // 克隆数组，不修改原数组
                columnTitle.list.splice(2, 0, {
                    field: 'account_sub_type_id',
                    title: '账号类型'
                });
                columnTitle.list.splice(4, 0, {
                    field: 'active',
                    title: '运营状态'
                });
            }
            Helper.fnCreatTable('#account-table', columnTitle, API_URL.manager_account_index, function (td, sData, oData, row, col, table) {
                _this._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                postData: {
                    type: this.accountType
                },
                fnDrawCallback: function () {
                    _this._fnTableEdit(); // 表格编辑
                }
            });
        },

        _fnTableEdit: function () {
            var _this = this;
            var defaults = {
                type: 'text',
                clear: false,
                title: '修改账户信息',
                url: API_URL.manager_account_update,
                params: function () {
                    return {
                        id: dataTable.row($(this).parents('tr')[0]).data().user_id,
                        field: $(this).attr('data-label')
                    };
                },
                success: function (response) {
                    Helper.fnPrompt(response.msg);
                    if (!response.res) {
                        dataTable.reload();
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                }
            };

            var oCheckboxJSON = this.allOperation[this.accountType];
            var aCheckboxData = [];

            for (var i = 0; i < oCheckboxJSON.length; i++) {
                var key = oCheckboxJSON[i].name;
                aCheckboxData[i] = {};
                aCheckboxData[i][key] = oCheckboxJSON[i].label;
            }
            var editType = 'checkbox';
            var sourceData = aCheckboxData;
            if (this.accountType === 'MANAGER') {
                editType = 'operlistedit';
                sourceData = this.allOperation[this.accountType];
            }
            var operationJson = this.allOperation[this.accountType];
            $('.table-edit').each(function (index, el) {
                var option = {};
                if ($(this).hasClass('operation_list')) {
                    option = {
                        type: editType,
                        value: dataTable.row($(this).parents('tr')[0]).data().operation_list.split(','),
                        sBody: doT.template($('#tpl-permissionlist').text())(operationJson),
                        source: sourceData,
                        placement: 'auto',
                        params: function () {
                            var aryValue = [];
                            $('input[type="checkbox"][name="checklist"]:checked').each(function (index, el) {
                                aryValue.push($(this).val());
                            });
                            return {
                                id: dataTable.row($(this).parents('tr')[0]).data().user_id,
                                field: $(this).attr('data-label'),
                                value: aryValue.join(',')
                            };
                        }
                    };
                }

                $(this).editable($.extend({}, defaults, option));
            });

            $('#account-table [data-type="select-role"]').on('change', function () {
                _this._fnSelectRole($(this));
            });
        },

        _fnSelectRole: function ($ele) {
            var val = $ele.val();
            var useId = $ele.attr('data-id');
            this._fnAccountUpdate(useId, 'account_sub_type_id', val, function (json) {
                dataTable.reload();
            });
        },

        _fnOpenResetPasswordPanel: function ($ele) {
            $('#user-id').val($ele.attr('data-id'));
            $('#new-passwd').val('');
            $('#reset-passwd-wrapper').modal('show');
        },

        _fnResetPassword: function () {
            var newPassword = $('#new-passwd').val();
            $('#show-tips').html('');
            if ('' === $.trim(newPassword)) {
                $('#show-tips').html('请输入密码');
                return;
            }

            var useId = $('#user-id').val();
            this._fnAccountUpdate(useId, 'password', newPassword, function (json) {
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

        _fnAccountUpdate: function (id, field, value, callback) {
            var param = {
                id: id,
                field: field,
                value: value
            };
            Helper.load_ajax();
            $.post(API_URL.manager_account_update, param, function (json) {
                Helper.close_ajax();
                callback(json);
            }).fail(function () {
                Helper.close_ajax();
                callback(-1);
            });
        },
        _fnChangeSelectAccountType: function ($ele) {
            var permissions = $ele.find('option:selected').attr('data-operation-list');
            permissions = permissions.split(',');
            var $checkboxs = $('input[name="permission"]');
            var tmp = null;
            for (var i = 0, l = $checkboxs.length; i < l; i++) {
                tmp = $checkboxs[i];
                if ($.inArray(tmp.value, permissions) > -1) {
                    tmp.checked = true;
                }
                else {
                    tmp.checked = false;
                }
            }
        },
        _fnOpenAddAccountPannel: function () {
            $('#add-account-container').html($.tmpl('#tpl-addaccount', {
                accountSubType: this.accountSubType[this.accountType],
                allOperation: this.allOperation[this.accountType]
            }));
            $('#add-account-panel').modal('show');
            $('#add-account-container').validation({
                blur: true
            });
            var _this = this;
            $('#account-type').change(function () {
                _this._fnChangeSelectAccountType($(this));
            }).trigger('change');
        },

        _fnAddAccount: function () {
            if (!($('#add-account-container').valid())) {
                return false;
            }
            var param = {
                username: $('#act-username').val(),
                password: $('#password').val(),
                contact_name: $('#contact-name').val(),
                email_address: $('#email-address').val(),
                contact_phone: $('#phone').val(),
                qq: $('#qq').val(),
                account_sub_type_id: $('#account-type').val()
            };

            var operationList = [];
            $('input[name="permission"]:checked').each(function () {
                operationList.push($(this).val());
            });
            param.operation_list = operationList.join(',');
            Helper.load_ajax();
            $.post(API_URL.manager_account_store, param, function (json) {
                Helper.close_ajax();
                if (0 === json.res) {
                    $('#add-account-panel').modal('hide');
                    dataTable.reload();
                }
                else {
                    Helper.fnAlert(json.msg);
                }
            }).fail(function () {
                Helper.close_ajax();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        // 菜单导航点击事件主体
        _fnChangeMenu: function ($ele) {
            $ele.siblings().removeClass('active');
            $ele.addClass('active');
            this.accountType = $ele.attr('data-account-type');
            if (this.accountType === 'MANAGER') {
                $('#addaccount-btn-wrapper').show();
            }
            else {
                $('#addaccount-btn-wrapper').hide();
            }
            this._fnRun();
        },
        _fnToggleAccountStatus: function (userid, status) {
            this._fnAccountUpdate(userid, 'active', status, function (json) {
                if (json === -1) {
                    Helper.fnAlert('服务器请求失败，请稍后重试');
                }
                else if (0 === json.res) {
                    dataTable.reload();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            });
        },
        fnInit: function () {
            var _this = this;

            $('#js-account-container').on('click', '[data-field="password"]', function () {
                _this._fnOpenResetPasswordPanel($(this));
            });

            $('#reset-passwd-confirm').click(function () {
                _this._fnResetPassword();
            });

            $('#accout-type-wrapper').on('click', '[data-account-type]', function () {
                _this._fnChangeMenu($(this));
            });

            $('#addaccount-btn').click(function () {
                _this._fnOpenAddAccountPannel();
            });

            $('#add-account-confirm').click(function () {
                _this._fnAddAccount();
            });

            $('#accout-type-wrapper [data-account-type="' + this.accountType + '"]').trigger('click');
            $('#account-table').delegate('.js-account-stop, .js-account-start', 'click', function () {
                _this._fnToggleAccountStatus($(this).attr('data-userid'), $(this).attr('data-status'));
            });
        }
    };
    return new ManagerAccount();
})(jQuery);

$(function () {
    ManagerAccount.fnInit();
});
