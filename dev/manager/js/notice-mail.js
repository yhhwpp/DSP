/**
 * @file notice-mail.js
 * @author xiaokl
 * @description 直客广告主邮件
 */
var mailIndex = (function ($) {
    var MailIndex = function () {
        this.operationList = '';
    };
    MailIndex.prototype = {
        oTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'create_time',
                    title: '发布时间'
                }, {
                    field: 'title',
                    title: '邮件标题'
                }, {
                    field: 'content',
                    title: '文本正文'
                }, {
                    field: 'total',
                    title: '邮件送达'
                }, {
                    field: 'contact_name',
                    title: '发布人员'
                }, {
                    field: 'id',
                    title: '操作'
                }
            ]
        },
        _fnInitTab: function () { // 初始化Tab



            fnIsLogin(function (json) {
                var isReport = (json.obj.operation_list.indexOf(OPERATION_LIST.manager_mail_report_view) > -1 || json.obj.operation_list === 'all') ? 1 : 0;
                $('#js-mail-tab').html(doT.template($('#tpl-activity-notice-tab').text())({
                    report: isReport
                }));
            });

            $.post(API_URL.manager_notice_email_client, function (json) {
                if (json && json.res === 0) {
                    $('#js-advertiser-list').html(doT.template($('#tpl-advertiser-tab').text())(json.list));
                }
            });
            this._fnInitTable();
            this._fnInitHandle();
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'total') {
                if (oData.type === 'draft') {
                    $(td).html('未发送');
                }
                else if (oData.type === 'sent') {
                    $(td).html(sData + '/' + sData);
                }
                else {
                    $(td).html('-');
                }
            }
            else if (thisCol === 'id') {
                if (oData.type === 'draft') {
                    $(td).html('<button type="button" class="btn btn-default js-edit">编辑</button><button type="button" class="btn btn-default js-del">删除</button>');
                }
                else if (oData.type === 'sent') {
                    $(td).html('<button type="button" class="btn btn-default js-mail-detail">查看邮件</button>');
                }
                else {
                    $(td).html('-');
                }
            }
        },
        _fnInitTable: function () {
            var self = this;
            Helper.fnCreatTable('#js-mail-table', this.oTitle, API_URL.manager_notice_email_index, function (td, sData, oData, row, col, table) {
                self._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {});
        },
        _fnInitHandle: function () { // 初始化操作
            $('#js-mail-table').delegate('.js-del', 'click', function () { // 删除邮件
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                Helper.fnConfirm('确定要删除该邮件吗？', function () {
                    Helper.load_ajax();
                    $.post(API_URL.manager_notice_email_delete, {id: oData.id}, function (json) {
                        Helper.close_ajax();
                        if (json && json.res === 0) {
                            dataTable.reload();
                        }
                        else {
                            Helper.fnPrompt(json.msg);
                        }
                    }).fail(function () {
                        Helper.close_ajax();
                    });
                });
            });
            $('#js-mail-table').delegate('.js-edit', 'click', function () { // 编辑邮件
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                $('#js-notice-modal input[name=title]').val(oData.title);
                CKEDITOR.instances.content.setData(oData.content);
                $('#js-notice-modal input[name=mailid]').val(oData.id);
                $('#js-notice-modal input[type=checkbox]').prop('checked', false); // 初始化checkbox
                $('#js-notice-modal .error-msg').remove();
                if ($('#js-expand').attr('aria-expanded') === 'true') {
                    $('#js-expand').trigger('click');
                }
                $('#js-notice-modal').modal({backdrop: 'static'});
                if (oData.clients && oData.clients.length > 0) {
                    for (var i = 0, j = oData.clients.length; i < j; i++) {
                        $('#js-notice-modal input[name=advertiser][value=' + oData.clients[i].user_id + ']').prop('checked', true);
                    }
                    if (oData.clients.length === $('#js-notice-modal input[name=advertiser]').length) {
                        $('#js-select-all').prop('checked', true);
                    }
                }
            });
            $('#js-mail-table').delegate('.js-mail-detail', 'click', function () { // 查看邮件
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                $('#js-mail-detail-modal .js-title').html(oData.title);
                $('#js-mail-detail-modal #js-show-advertiser').html(doT.template($('#tpl-show-advertiser-tab').text())(oData.clients));
                CKEDITOR.instances.showcontent.setData(oData.content);
                $('#js-mail-detail-modal').modal('show');
            });
            $('#js-add-btn button').click(function () {
                $('#js-notice-modal input[name=mailid]').val(0);
                $('#js-notice-modal input[type=text]').val('');
                $('#js-notice-modal input[type=checkbox]').prop('checked', false);
                CKEDITOR.instances.content.setData('');
                if ($('#js-expand').attr('aria-expanded') === 'true') {
                    $('#js-expand').trigger('click');
                }
                $('#js-notice-modal .error-msg').remove();
                $('#js-notice-modal').modal({backdrop: 'static'});
            });
            $('#js-notice-modal').delegate('#js-expand', 'click', function () {
                if ($(this).attr('aria-expanded') === 'false') {
                    $(this).html('-收起有效广告主');
                }
                else {
                    $(this).html('+展开有效广告主');
                }
            });
            $('#js-notice-modal').delegate('#js-select-all', 'click', function () { // 全选/反选
                $('#js-advertiser-list input[name=advertiser]').prop('checked', $(this).is(':checked'));
            });
            $.fn.validation.addMethod('checkNum', function (value) {
                if ($('input[name=advertiser]:checked').length === 0) {
                    return true;
                }
                return false;
            }, '请选择广告主');
            $.fn.validation.addMethod('checkContent', function (value) {
                if (!CKEDITOR.instances.content.getData()) {
                    return true;
                }
                return false;
            }, '请填写正文');
            $('#js-notice-modal form').validation({blur: false});
            $('#js-notice-modal').delegate('#js-sent,#js-save-draft', 'click', function () {
                if (!$('#js-notice-modal form').valid()) {
                    return;
                }
                var aryClients = [];
                var objClient = {};
                $('input[name=advertiser]:checked').each(function () {
                    objClient = {};
                    objClient.user_id = $(this).val();
                    // objClient.email_address = $(this).attr('data-email_address');
                    // objClient.clientname = $(this).attr('data-clientname');
                    // objClient.account_id = $(this).attr('data-account_id');
                    aryClients.push(objClient);
                });
                var params = {
                    id: $('#js-notice-modal input[name=mailid]').val(),
                    title: $('#js-notice-modal input[name=title]').val(),
                    content: CKEDITOR.instances.content.getData(),
                    type: $(this).attr('data-type'),
                    clients: JSON.stringify(aryClients)
                };
                Helper.fnConfirm($(this).attr('data-tips'), function () {
                    Helper.load_ajax();
                    $.post(API_URL.manager_notice_email_store, params, function (json) {
                        Helper.close_ajax();
                        if (json && json.res === 0) {
                            $('#js-notice-modal').modal('hide');
                            dataTable.reload();
                        }
                        else {
                            Helper.fnPrompt(json.msg);
                        }
                    }).fail(function () {
                        Helper.close_ajax();
                    });
                });
            });
        },
        _fnInitEdit: function () {
            /* eslint no-undef: [0]*/
            CKEDITOR.replace('content');
            CKEDITOR.replace('showcontent', {readOnly: true});
            CKEDITOR.config.width = 642;
            CKEDITOR.config.height = 300;
        },
        fnInit: function () {
            this._fnInitTab();
            this._fnInitEdit();
        }
    };
    return new MailIndex();
})(window.jQuery);
$(function () {
    mailIndex.fnInit();
});
