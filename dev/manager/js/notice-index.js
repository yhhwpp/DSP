/**
 * @file notice-index.js
 * @author xiaokl
 * @description 活动
 */
var noticeIndex = (function ($) {
    var NoticeIndex = function () {};
    NoticeIndex.prototype = {
        oTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'create_time',
                    title: '发布时间'
                }, {
                    field: 'title',
                    title: '标题'
                }, {
                    field: 'content',
                    title: '正文'
                }, {
                    field: 'read_cnt',
                    title: '通知到达状态',
                    render: function (data, type, full) {
                        return data + '/' + full.total;
                    }
                }, {
                    field: 'contact_name',
                    title: '发布人员'
                }
            ]
        },
        _fnInitTab: function () { // 初始化Tab
            var tab = Helper.fnGetQueryParam('tab');
            tab = tab ? tab : 'advertiser';
            var role = 'A';
            $('#js-notice-modal .modal-title').html('群发直客广告主通知');
            if (tab && tab === 'trafficker') {
                role = 'M';
                $('#js-notice-modal .modal-title').html('群发媒体商通知');
            }
            $('input[name=role]').val(role);
            $('#js-add-btn').html(doT.template($('#tpl-add-btn').text())({tab: tab}));
            /* eslint no-undef: [0]*/
            fnIsLogin(function (json) {
                var isReport = (json.obj.operation_list.indexOf(OPERATION_LIST.manager_mail_report_view) > -1 || json.obj.operation_list === 'all') ? 1 : 0;
                $('#js-activity-tab').html(doT.template($('#tpl-activity-notice-tab').text())({
                    tab: tab,
                    report: isReport
                }));
            });
            // $('#js-activity-tab').html(doT.template($('#tpl-activity-notice-tab').text())({tab: tab}));
            this._fnInitTable(role);
            this._fnInitHandle();

        },
        _fnInitTable: function (role) {
            Helper.fnCreatTable('#js-notice-table', this.oTitle, API_URL.manager_notice_index, function (td, sData, oData, row, col, table) {
            }, 'dataTable', {
                postData: {
                    role: role
                }
            });
        },
        _fnInitHandle: function () { // 初始化操作
            $('#js-notice-modal form').validation();
            $('#js-notice-modal').delegate('#js-publish-btn', 'click', function () {
                if (!$('#js-notice-modal form').valid()) {
                    return;
                }
                Helper.fnConfirm('您确定要发布该群发通知吗？', function () {
                    Helper.load_ajax();
                    $.post(API_URL.manager_notice_store, {
                        title: $('input[name=title]').val(),
                        content: $('textarea[name=content]').val(),
                        role: $('input[name=role]').val()
                    }, function (json) {
                        Helper.close_ajax();
                        if (json && json.res === 0) {
                            dataTable.reload(null, false);
                            $('#js-notice-modal').modal('hide');
                        }
                        else {
                            Helper.fnPrompt(json.msg);
                        }
                    }).fail(function () {
                        Helper.close_ajax();
                    });
                });
            });
            $('#js-add-btn button').click(function () {
                $('#js-notice-modal').modal('show');
                $('#js-notice-modal input').val('');
                $('#js-notice-modal textarea').val('');
                $('#js-notice-modal .error-msg').remove();
            });
        },
        fnInit: function () {
            this._fnInitTab();
        }
    };
    return new NoticeIndex();
})(window.jQuery);
$(function () {
    noticeIndex.fnInit();
});
