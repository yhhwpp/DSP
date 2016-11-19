/**
 * @file account-index.js
 * @author songxing
 */
var ManagerAccount = (function ($) {
    'use strict';
    var ManagerAccount = function () {
        this.roleInfo = {};
        this.operationList = {};
        this.roleList = {}; // 权限按多少列排列
        this.kind = CONSTANT.kind_self;
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
                    title: '登陆账号',
                    column_set: ['sortable']
                },
                {
                    field: 'role_name',
                    title: '角色'
                },
                {
                    field: 'contact_name',
                    title: '联系人'
                },
                {
                    field: 'email_address',
                    title: '邮箱'
                },
                {
                    field: 'contact_phone',
                    title: '手机号'
                },
                {
                    field: 'qq',
                    title: 'QQ号'
                },
                {
                    field: 'date_created',
                    title: '创建时间'
                },
                {
                    field: 'active',
                    title: '状态'
                },
                {
                    field: 'user_id',
                    title: '操作'
                }
            ]
        },

        _fnRun: function () {
            this._fnGetRoleList();
            this._fnGetAccountSubType();
            this._fnCreateTable();
        },

        // 对象数组按某个字段值转化为json对象,该字段必须唯一，否则后面的数据会覆盖前面的数据
        _convertArrayToObj: function (arr, key) {
            var obj = {};
            var tmp = null;
            for (var i = 0, l = arr.length; i < l; i++) {
                tmp = arr[i];
                obj[tmp[key]] = tmp;
            }
            return obj;
        },

        _formatOperationList: function (arr) {
            var obj = {self: {}};
            var tmp = null;
            for (var i = 0, l = arr.length; i < l; i++) {
                tmp = arr[i];
                if (tmp.name.indexOf('-self-') > -1) {
                    obj.self[tmp.name] = tmp;
                }
                else {
                    if (obj.union === undefined) {
                        obj.union = {};
                    }
                    obj.union[tmp.name] = tmp;
                }
            }
            return obj;
        },

        _fnGetRoleIndex: function (callback) {
            var _this = this;
            $.post(API_URL.trafficker_role_index, function (json) {
                if (json && json.res === 0) {
                    _this.roleList = json.list ? _this._convertArrayToObj(json.list, 'id') : {};
                    callback && callback(_this.roleList);
                }
                _this = null;
            }).fail(function () {
                Helper.fnPrompt('服务器请求失败，请稍后重试！');
            });
        },

        _fnGetOperationList: function () {
            var _this = this;
            $.get(API_URL.trafficker_role_operation_list, function (json) {
                if (json && json.res === 0) {
                    _this.operationList = json.list ? _this._formatOperationList(json.list) : {};
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
                case 'active':
                    html += (+sData) === 1 ? '启用中' : '已暂停';
                    break;
                case 'user_id':
                    if (+oData.active === 1) {
                        html += '<button type="button" class="btn btn-default js-account-edit" data-userid="' + oData.user_id + '"><i class="fa fa-pencil-square-o"></i>修改</button>';
                        html += '<button type="button" class="btn btn-default js-account-stop" data-userid="' + oData.user_id + '" data-status="0"><i class="fa fa-pause"></i>停用</button>';
                        html += '<button type="button" class="btn btn-default js-reset-passwd" data-userid="' + oData.user_id + '"><i class="fa fa-unlock-alt"></i>重置密码</button>';
                    }
                    else {
                        html += '<button type="button" class="btn btn-default js-account-start" data-userid="' + oData.user_id + '" data-status="1"><i class="fa fa-play"></i>启用</button>';
                        html += '<button type="button" class="btn btn-default js-account-del" data-userid="' + oData.user_id + '"><i class="fa fa-minus-square"></i>删除</button>';
                    }
                    html += '<button type="button" class="btn btn-default js-account-login" data-userid="' + oData.user_id + '"><i class="fa fa-user-plus"></i>登陆账号</button>';
                    break;
                default:
                    html += sData;
                    break;
            }
            $(td).html(html);
        },

        _fnCreateTable: function () {
            if (typeof dataTable === 'object') {
                dataTable.destroy();
                $('#account-table').empty();
            }

            var _this = this;
            Helper.fnCreatTable('#account-table', _this._oColumnTitle, API_URL.trafficker_account_index, function (td, sData, oData, row, col, table) {
                _this._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable');
        },

        // 打开重置密码弹层
        _fnOpenResetPasswordPanel: function ($ele) {
            $('#user-id').val($ele.attr('data-userid'));
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

        _fnAccountStore: function () {
            if (!($('#add-account-container').valid())) {
                return false;
            }
            var param = {
                user_id: $('#add-account-panel').attr('userid'),
                role_id: $('#account-role-wrapper input[name="role"]:checked ').val(),
                username: $('#act-username').val(),
                password: $('#password').val(),
                contact_name: $('#contact-name').val(),
                email_address: $('#email-address').val(),
                contact_phone: $('#phone').val(),
                qq: $('#qq').val(),
                active: 1
            };

            Helper.load_ajax();
            $.post(API_URL.trafficker_account_store, param, function (json) {
                Helper.close_ajax();
                if (0 === json.res) {
                    $('#add-account-panel').modal('hide');
                    $('#edit-account-panel').modal('hide');
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

        // 新增用户
        _fnOpenAccountAddPanel: function () {
            $('#add-account-container').html($.tmpl('#tpl-addaccount', {roleList: this.roleList}));
            $('#add-account-panel').attr('userid', 0).modal('show');
            $('#add-account-container').validation({
                blur: true
            });
        },

        // 编辑用户信息
        _fnOpenAccountEditPanel: function (userid, data) {
            $('#add-account-container').html($.tmpl('#tpl-editaccount', {userInfo: data, roleList: this.roleList}));
            $('#add-account-panel').attr('userid', userid).modal('show');
            $('#add-account-container').validation({
                blur: true
            });
        },

        // 更新帐号状态
        _fnToggleAccountStatus: function ($ele) {
            var userid = $ele.attr('data-userid');
            var status = $ele.attr('data-status');
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

        // 更新帐号信息
        _fnAccountUpdate: function (id, field, value, callback) {
            var param = {
                id: id,
                field: field,
                value: value
            };
            Helper.load_ajax();
            $.post(API_URL.trafficker_account_update, param, function (json) {
                Helper.close_ajax();
                callback(json);
            }).fail(function () {
                Helper.close_ajax();
                callback(-1);
            });
        },

        _fnAccountDel: function ($ele) {
            var userid = $ele.attr('data-userid');
            var param = {
                user_id: userid
            };
            Helper.load_ajax();
            $.post(API_URL.trafficker_account_delete, param, function (json) {
                Helper.close_ajax();
                if (json === -1) {
                    Helper.fnAlert('服务器请求失败，请稍后重试');
                }
                else if (0 === json.res) {
                    dataTable.reload();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            }).fail(function () {
                Helper.close_ajax();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        _fnOpenRoleEditPanel: function (roleid) {
            $('#edit-role-container').html($.tmpl('#tpl-edit-role', {roleList: this.roleList, operationList: this.operationList}));
            $('#modify-permissions').modal('show');
            $('#edit-role-container').validation({
                blur: true
            });
            $('#pre-role-list-wrapper li a[data-roleid="' + roleid + '"]').click();
        },

        _fnChangeRole: function (roleid) {
            $('#modify-permissions').attr('data-roleid', roleid);
            if (roleid !== '0') {
                var role = this.roleList[roleid];
                var operationList = role.operation_list.split(',');
                $('#pre-role-name').val(role.name);
                $('#permission-list-wrapper input[type="checkbox"]').prop('checked', false);
                for (var i = 0, l = operationList.length; i < l; i++) {
                    $('#permission-list-wrapper input[value="' + operationList[i] + '"]').prop('checked', 'checked');
                }

                this._refreshSelfPermission();
                this._refreshUnionPermission();
            }
            else {
                $('#pre-role-name').val('');
                $('#permission-list-wrapper input[type="checkbox"]').prop('checked', false);
            }
        },

        _fnRoleStore: function () {
            if (!($('#edit-role-container').valid())) {
                return false;
            }
            var _this = this;
            var roleid = $('#modify-permissions').attr('data-roleid');
            var permissionList = [];
            $('#permission-list-wrapper input[data-type="role-permissions"]:checked').each(function () {
                permissionList.push($(this).val());
            });
            var param = {
                id: roleid,
                name: $('#pre-role-name').val(),
                operation_list: permissionList.join(',')
            };
            Helper.load_ajax();
            $.post(API_URL.trafficker_role_store, param, function (json) {
                Helper.close_ajax();
                if (json === -1) {
                    Helper.fnAlert('服务器请求失败，请稍后重试');
                }
                else if (0 === json.res) {
                    $('#modify-permissions').modal('hide');
                    _this._fnGetRoleIndex();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            }).fail(function () {
                Helper.close_ajax();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        _fnLoginAccount: function ($ele) {
            var userId = $ele.attr('data-userid');
            var tmp = window.open('');
            $.post(API_URL.site_change, {
                id: userId
            }, function (json) {
                if (json && json.res === 0) {
                    tmp.location.href = BOS.DOCUMENT_URI + '/housead/trafficker';
                }
                else {
                    tmp.location.href = API_URL.login_url;
                }
            }).fail(function () {
                tmp.location.href = API_URL.login_url;
            });
        },

        _refreshSelfPermission: function () {
            var $wrapper = $('#permission-list-wrapper ul[data-type="role-permissions-list"]');
            var checksLen = $wrapper.find('input[data-role="self"]').length;
            var checkedLen = $wrapper.find('input[data-role="self"]:checked').length;
            if (checkedLen > 0 && checkedLen === checksLen) {
                $('#permission-list-wrapper [data-type="toggle-select-self"]').prop('checked', 'checked');
            }
            else {
                $('#permission-list-wrapper [data-type="toggle-select-self"]').prop('checked', false);
            }
        },

        _refreshUnionPermission: function () {
            var $wrapper = $('#permission-list-wrapper ul[data-type="role-permissions-list"]');
            var checksLen = $wrapper.find('input[data-role="union"]').length;
            var checkedLen = $wrapper.find('input[data-role="union"]:checked').length;
            if (checkedLen > 0 && checkedLen === checksLen) {
                $('#permission-list-wrapper [data-type="toggle-select-union"]').prop('checked', 'checked');
            }
            else {
                $('#permission-list-wrapper [data-type="toggle-select-union"]').prop('checked', false);
            }
        },

        fnInit: function () {
            var _this = this;
            /* eslint no-undef: [0]*/
            fnIsLogin(function (data) {
                _this.kind = data.obj.kind;
            });
            this._fnGetOperationList();
            this._fnGetRoleIndex();
            this._fnCreateTable();

            var $ele = $('#table-wrapper');
            $ele.on('click', '.js-account-edit', function () {
                var userid = $(this).attr('data-userid');
                var data = dataTable.row($(this).parents('tr')[0]).data();
                _this._fnOpenAccountEditPanel(userid, data);
            });

            $ele.on('click', '.js-reset-passwd', function () {
                _this._fnOpenResetPasswordPanel($(this));
            });

            $ele.on('click', '.js-account-start, .js-account-stop', function () {
                _this._fnToggleAccountStatus($(this));
            });

            $ele.on('click', '.js-account-del', function () {
                _this._fnAccountDel($(this));
            });

            $ele.on('click', '.js-account-login', function () {
                _this._fnLoginAccount($(this));
            });

            $('#addaccount-btn').click(function () {
                _this._fnOpenAccountAddPanel();
            });

            $('#add-account-confirm').click(function () {
                _this._fnAccountStore();
            });

            $('#reset-passwd-confirm').click(function () {
                _this._fnResetPassword();
            });

            $('#role-edit-btn').click(function () {
                _this._fnOpenRoleEditPanel($(this).attr('data-roleid'));
            });

            $('#add-account-panel, #edit-account-panel').on('click', '[data-type="open-role-edit-btn"]', function () {
                $('#add-account-panel').modal('hide');
                $('#edit-account-panel').modal('hide');
                _this._fnOpenRoleEditPanel($(this).attr('data-roleid'));
            });

            $('#edit-role-container').on('click', 'li a[data-roleid]', function () {
                // alert($(this).attr('data-roleid'))
                $(this).parent().addClass('active').siblings().removeClass('active');
                _this._fnChangeRole($(this).attr('data-roleid'));
            });

            $('#edit-role-container').on('click', '[data-type="toggle-select-self"], [data-type="toggle-select-union"]', function () {
                var $this = $(this);
                $ele = $this.parent().parent();
                if ($this.is(':checked')) {
                    $ele.find('input[data-type="role-permissions"]').prop('checked', 'checked');
                }
                else {
                    $ele.find('input[data-type="role-permissions"]').prop('checked', false);
                }
            });

            $('#edit-role-container').on('click', 'input[data-type="role-permissions"]', function () {
                var $this = $(this);
                if ($this.attr('data-role') === 'self') {
                    _this._refreshSelfPermission();
                }
                else {
                    _this._refreshUnionPermission();
                }
            });

            $('#modify-permissions-confirm').click(function () {
                _this._fnRoleStore();
            });
        }
    };
    return new ManagerAccount();
})(jQuery);

$(function () {
    ManagerAccount.fnInit();
});
