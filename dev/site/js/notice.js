/**
 * @file common.js
 * @author songxing
 */
$(function () {
    var fnCustomColumn = function (td, sData, oData, row, col, table) {
        var thisCol = table.nameList[col];
        if (thisCol === 'id') {
            $(td).html('<input type="checkbox" data-type="check-item" data-col="' + col + '" value="' + oData.id + '" />');
        }
        else if (thisCol === 'title') {
            if (oData.type === 2) {
                $(td).html('<a class="tb-underline" href="activeDetail.html?id=' + oData.id + '&from_id=' + oData.content.from_id + '" target="_black">' + oData.title + '</a>');
            }
        }
        else if (thisCol === 'content.body') {
            if (oData.type === 2) {
                $(td).html('<a class="tb-underline" href="activeDetail.html?id=' + oData.id + '&from_id=' + oData.content.from_id + '" target="_black">' + oData.content.body + '</a>');
            }
        }
        else if (thisCol === 'type') {
            if (oData.type === 2) {
                $(td).html('活动');
            }
            else {
                $(td).html('站内信');
            }
        }
        else if (thisCol === 'status') {
            if (oData.status === 1 || oData.type === 1) {
                $(td).html('已读');
            }
            else {
                $(td).html('未读');
            }
        }

    };

    // 刷新头部信息
    var fnRefreshTopNotice = function () {
        $.post(API_URL.notice_list, {status: 0}, function (data) {
            $('#head .js-notice').replaceWith($.tmpl('#tpl-notice', data));
        }, 'json');
    };

    var fnDrawCallback = function (table) {
        var aoData = table.aoData;
        var ids = [];
        for (var i = 0, l = aoData.length; i < l; i++) {
            var tmp = aoData[i]._aData;
            if (tmp.type === 1 && tmp.status === 0) {
                ids.push(tmp.id);
            }

        }
        if (ids.length > 0) {
            var param = {
                ids: ids.join(','),
                status: 1
            };
            $.post(API_URL.notice_store, param, function (data) {
                fnRefreshTopNotice();
            });
        }
    };

    var noticeTitle = {
        res: 0,
        msg: '操作成功',
        list: [{
            field: 'id',
            title: '',
            column_set: ['checkall'],
            width: 20
        }, {
            field: 'create_time',
            title: '创建时间',
            column_set: ['orderable']
        }, {
            field: 'title',
            title: '标题'
        }, {
            field: 'content.body',
            title: '内容'
        }, {
            field: 'type',
            title: '类型'
        }, {
            field: 'status',
            title: '状态'
        }],
        map: null
    };

    Helper.fnCreatTable('#mtable', noticeTitle, API_URL.notice_list, fnCustomColumn, 'dataTable', {
        fnDrawCallback: fnDrawCallback
    });

    $('#notice-del').click(function () {
        var deLength = $('input[data-type="check-item"]:checked').length;
        if (deLength === 0) {
            Helper.fnAlert('请至少选择一条记录');
            return false;
        }

        Helper.fnConfirm('确定要删除所选消息吗?', function () {
            var aCheckedList = [];
            $('input[data-type="check-item"]:checked').each(function () {
                aCheckedList.push($(this).val());
            });
            var param = {
                ids: aCheckedList.join(','),
                status: 2
            };
            aCheckedList = null;
            Helper.load_ajax();
            $.post(API_URL.notice_store, param, function (data) {
                Helper.close_ajax();
                if (data.res === 0) {
                    Helper.fnPrompt(data.msg, location.href);
                }
                else {
                    Helper.fnPrompt(data.msg);
                }
            }).fail(function () {
                Helper.close_ajax();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        });
    });

    $(document).delegate('input[data-type="checkall"]', 'click', function () {
        var _this = $(this);
        var checked = _this[0].checked;
        $('#mtable input[data-type="check-item"][data-col="' + _this.attr('data-col') + '"]').each(function () {
            $(this)[0].checked = checked;
        });
        _this = null;
        checked = null;
    });
});
