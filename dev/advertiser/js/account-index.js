/**
 * @file account-index.js
 * @author hehe
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
                    field: 'username',
                    title: '登录账号'
                },
                {
                    field: 'contact_name',
                    title: '联系人'
                },
                {
                    field: 'account_sub_type_id',
                    title: '部门'
                },
                {
                    field: 'operation_list',
                    title: '权限'
                },
                {
                    field: 'email_address',
                    title: '邮箱'
                },
                {
                    field: 'comments',
                    title: '备注'
                },
                {
                    field: 'active',
                    title: '操作'
                }
            ]
        },
        _fnInit: function () {
            var data = {};
            this._fnGetAccountSubType(data);
            $('#js-account-table').delegate('.active', 'click', function (event) {
                $.ajax({
                    type: 'post',
                    url: API_URL.advertiser_account_update,
                    data: {
                        id: dataTable.row($(this).parents('tr')[0]).data().user_id,
                        field: $(this).attr('data-label'),
                        value: $(this).attr('data-value') === 'false' ? 0 : 1
                    },
                    success: function (response) {
                        Helper.fnPrompt(response.msg);
                        dataTable.reload();
                    }
                });
            });
        },
        _fnGetAccountSubType: function (data) { // 获取用户二级类型
            var _this = this;
            $.get(API_URL.site_account_sub_type, {type: 'ADVERTISER'}, function (json) {
                if (json && json.res === 0) {
                    data = $.extend({}, data, {
                        departments: json.list
                    });
                }
                _this._fnGetPermissions(data);
                _this = null;
            }).fail(function () {
                Helper.fnPrompt('服务器请求失败，请稍后重试！');
            });
        },
        _fnGetPermissions: function (data) { // 获取广告主权限
            var _this = this;
            $.get(API_URL.site_operation, {type: 'ADVERTISER'}, function (json) {
                if (json && json.res === 0) {
                    data = $.extend({}, data, {
                        permissions: json.list
                    });
                }
                _this._fnInitAccoutList(data); // 初始化账号列表
                _this._fnAccountAdd(data); // 初始化新增账号模板
                _this = null;
            }).fail(function () {
                Helper.fnPrompt('服务器请求失败，请稍后重试！');
            });
        },
        _fnInitAccoutList: function (data) {
            // 初始化表格
            var _this = this;
            _this.data = data;
            Helper.fnCreatTable('#js-account-table', _this.oColumnTitle, API_URL.advertiser_account_list, function (td, sData, oData, row, col, table) {
                _this._fnCustomColumn(td, sData, oData, row, col, table, data);
            }, 'dataTable', {
                fnDrawCallback: function () {
                    _this._fnTableEdit(); // 表格编辑
                }
            });

        },
        _fnAccountAdd: function (data) { // 初始化模板
            var _this = this;
            var sBody = (doT.template($('#tpl-addaccount').text()))(data);

            $('.js-addaccount-btn').modalable({
                body: sBody,
                url: API_URL.advertiser_account_store,
                success: function (response) {
                    Helper.fnPrompt(response.msg);
                    !(response.res) && dataTable.reload();
                },
                params: _this._fnCreateAccount,
                btnHandle: function () {
                    var checkList = $('input[name="permission"][type="checkbox"]');
                    checkList.attr('checked', false);
                    if (!$('#allModal select.form-control').val()) {
                        return;
                    }

                    $.each($('#allModal select.form-control').val().split(','), function (index, el) {
                        $('input[name="permission"][type="checkbox"][value="' + this + '"]').attr('checked', true);
                    });
                    $('#allModal select.form-control').on('change', function () {
                        var aVal = $(this).val().split(',');
                        checkList.prop('checked', false);
                        $.each(aVal, function (index, el) {
                            $('input[name="permission"][type="checkbox"][value="' + this + '"]').prop('checked', true);
                        });
                    });

                }
            });
        },
        _fnCreateAccount: function () { // 创建账号
            var accountModel = new $.fn.accountmodel.Model();
            accountModel.setData('username', $('input[name="username"').val());
            accountModel.setData('password', $('input[data-name="password"').val());
            accountModel.setData('contact_name', $('input[name="contact_name"').val());
            accountModel.setData('email_address', $('input[name="email_address"').val());
            accountModel.setData('phone', $('input[name="phone"').val());
            accountModel.setData('comments', $('input[name="comments"').val());
            accountModel.setData('qq', $('input[name="qq"').val());
            accountModel.setData('account_sub_type_id', $('select[name="department"]').find('option:selected').attr('data-id'));
            var permissions = [];
            $('input[name="permission"]:checked').each(function () {
                permissions.push($(this).val());
            });
            accountModel.setData('operation_list', permissions.join(','));
            return accountModel.getPostData();
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table, data) { // 自定义列
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'username':
                case 'contact_name':
                case 'email_address':
                case 'comments':
                    html = '<span class="table-edit ' + thisCol + '" data-label ="' + thisCol + '">' + sData + '</span>';
                    break;
                case 'account_sub_type_id':
                    html = oData.account_sub_type_id_label;
                    break;
                case 'operation_list':
                    html = '<span class="table-edit ' + thisCol + '" data-label ="' + thisCol + '">';
                    var permissions = this.data.permissions;
                    var aOperationList = sData === 'all' ? permissions : sData.split(',');
                    $.each(aOperationList, function (index, el) {
                        var that = aOperationList[index];
                        $.each(permissions, function (index, el) {
                            that === this.name && (html += this.label + '<br>');
                        });
                    });
                    html += '</span>';
                    break;
                case 'active':
                    var sClass = (+sData) === 0 ? 'fa-play' : 'fa-stop';
                    var sName = (+sData) === 0 ? '启用' : '停用';
                    html = '<button type="button" class="am-btn am-btn-default am-btn-xs am-radius active" data-value="' + !sData + '" data-label="' + thisCol + '" > <i class="fa ' + sClass + '"></i> ' + sName + '</button>';
                    break;
                default:
                    html = sData;
                    break;
            }
            $(td).html(html);
        },
        _fnTableEdit: function () {
            var _this = this;
            var defaults = {
                type: 'text',
                clear: false,
                title: '修改账户信息',
                url: API_URL.advertiser_account_update,
                params: function () {
                    return {
                        id: dataTable.row($(this).parents('tr')[0]).data().user_id,
                        field: $(this).attr('data-label')
                    };
                },
                success: function (response) {
                    Helper.fnPrompt(response.msg);
                    !response.res && dataTable.reload();
                }
            };

            var oCheckboxJSON = _this.data.permissions;
            var aCheckboxData = [];

            for (var i = 0; i < oCheckboxJSON.length; i++) {
                var key = oCheckboxJSON[i].name;
                aCheckboxData[i] = {};
                aCheckboxData[i][key] = oCheckboxJSON[i].label;
            }
            var option = {};

            $('.table-edit').each(function (index, el) {
                option = '';
                if ($(this).hasClass('operation_list')) {
                    option = {
                        type: 'checkbox',
                        value: dataTable.row($(this).parents('tr')[0]).data().operation_list.split(','),
                        source: aCheckboxData,
                        placement: 'auto',
                        params: function () {
                            var aryValue = [];
                            $('input[type="checkbox"][name="checklist"]:checked').each(function (index, el) {
                                aryValue.push($(this).val());
                            });
                            return {
                                id: dataTable.row($(this).parents('tr')[0]).data().role_id,
                                field: $(this).attr('data-label'),
                                value: aryValue.join(',')
                            };
                        }
                    };
                }
                else if ($(this).hasClass('username') || $(this).hasClass('contact_name')) {
                    option = {
                        validate: function (value) {
                            if ($.trim(value) === '') {
                                return '不能为空';
                            }

                        }
                    };
                }
                else if ($(this).hasClass('email_address')) {
                    option = {
                        validate: function (value) {
                            if ($.trim(value) === '' || !Helper.fnIsEmail(value)) {
                                return '请输入正确的邮箱';
                            }

                        }
                    };
                }

                $(this).editable($.extend({}, defaults, option));
            });

        }
    };
    return new AccountIndex();
})(jQuery);
$(function () {
    accountIndex._fnInit();
});
