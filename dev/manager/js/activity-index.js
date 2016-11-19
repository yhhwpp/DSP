/**
 * @file activity-index.js
 * @author xiaokl
 * @description 活动
 */
var activityIndex = (function ($) {
    var ActivityIndex = function () {
        this.operationList = '';
        this.reportTitle = {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'date',
                    title: '日报日期'
                }, {
                    field: 'receiver',
                    title: '收件人',
                    width: '600px'
                }, {
                    field: 'status',
                    title: '发送状态'
                }, {
                    field: 'send_time',
                    title: '发送时间'
                }, {
                    field: 'id',
                    title: '操作'
                }
            ]
        };
    };
    ActivityIndex.prototype = {
        oTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'publishtime',
                    title: '发布时间'
                }, {
                    field: 'title',
                    title: '活动名称'
                }, {
                    field: 'imageurl',
                    title: '活动图片'
                }, {
                    field: 'startdate',
                    title: '开始时间'
                }, {
                    field: 'enddate',
                    title: '结束时间'
                }, {
                    field: 'status',
                    title: '状态',
                    render: function (data, type, full) {
                        if (data === CONSTANT.act_status_unpubished) {
                            return '未发布';
                        }
                        return '已发布';
                    }
                }, {
                    field: 'contact_name',
                    title: '操作人员'
                }, {
                    field: 'id',
                    title: '操作'
                }
            ]
        },
        _fnInitTab: function () { // 初始化Tab
            var that = this;
            var tab = Helper.fnGetQueryParam('tab');
            tab = tab ? tab : '';
            var role = 'A';
            $('#js-activity-modal .modal-title').html('发布直客广告主活动');
            if (tab && tab === 'trafficker') {
                role = 'M';
                $('#js-activity-modal .modal-title').html('发布媒体商活动');
            }
            $('input[name=role]').val(role);
            /* eslint no-undef: [0]*/
            fnIsLogin(function (json) {

                var report = {
                    bDaily: 0,
                    bWeekly: 0
                };
                if (json.obj.operation_list.indexOf(OPERATION_LIST.manager_mail_report_view) > -1 || json.obj.operation_list === 'all') {
                    report.bDaily = 1;
                }
                if (json.obj.operation_list.indexOf(OPERATION_LIST.manager_weekly_report_view) > -1 || json.obj.operation_list === 'all') {
                    report.bWeekly = 1;
                }
                if (tab === '') {
                    if (1 === report.bDaily) {
                        tab = 'dailyReport';
                    }
                    else if (1 === report.bWeekly) {
                        tab = 'weeklyReport';
                    }
                    else {
                        tab = 'advertiser';
                    }
                }
                $('#js-activity-tab').html(doT.template($('#tpl-activity-notice-tab').text())({
                    tab: tab,
                    report: report
                }));
                $('#js-add-btn').html(doT.template($('#tpl-add-btn').text())({tab: tab}));
                that._fnInitTable(role, tab);
                that._fnInitHandle();
            });


        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'imageurl') {
                sData ? $(td).html('<a href=' + sData + ' class="fancybox" title="点击预览大图" alt="点击预览大图"><img src=' + sData + ' class="pic-thumb"/></a>') : $(td).html('');
            }
            else if (thisCol === 'id') {

                var sHtml = '<button type="button" class="btn btn-default js-preview"><i class="fa fa-desktop"></i>预览</button>';
                if (oData.status === CONSTANT.act_status_unpubished) {
                    sHtml += '<button type="button" class="btn btn-default js-publish" data-tips="确定要发布该项优惠活动吗？" data-value="1"><i class="fa fa-bullhorn"></i>发布</button>';
                    sHtml += '<button type="button" class="btn btn-default js-modify"><i class="fa fa-pencil-square-o"></i>修改</button>';
                }
                else {
                    sHtml += '<button type="button" class="btn btn-default js-offline" data-tips="确定要下线该项优惠活动吗？" data-value="0"><i class="fa fa-times"></i>下线</button>';
                }
                $(td).html(sHtml);
            }
        },
        _fnReportCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'receiver') {
                $(td).html(sData ? '<div style="max-width:600px">' + sData + '</div>' : '-').addClass('receiver').css({
                    'word-wrap': 'break-word',
                    'word-break': 'normal'
                });
            }
            else if (thisCol === 'send_time') {
                $(td).html(sData ? sData : '-');
            }

            else if (thisCol === 'status') {
                if (sData === CONSTANT.daily_status_wait || sData === CONSTANT.daily_status_stop) {
                    $(td).html('-');
                }
                else if (sData === CONSTANT.daily_status_seed) {
                    $(td).html('成功').addClass('text-success');
                }
                else if (sData === CONSTANT.daily_status_fail) {
                    $(td).html('失败').addClass('text-danger');
                }
            }
            else if (thisCol === 'id') {
                if (oData.status === CONSTANT.daily_status_wait) {
                    $(td).html('<button type="button" class="btn btn-default send-ctrl">发送</button>');
                }
                else if (oData.status === CONSTANT.daily_status_fail) {
                    $(td).html('<button type="button" class="btn btn-default send-ctrl">重新发送</button>');
                }
                else {
                    $(td).html('-');
                }
            }
        },
        _fnInitTable: function (role, tab) {
            var self = this;
            var url = API_URL.manager_activity_index;
            var title = self.oTitle;
            var opt = {
                postData: {
                    role: role
                },
                fnDrawCallback: function () {
                    $('.fancybox').fancybox();
                }
            };

            if (tab === 'dailyReport' || tab === 'weeklyReport') {
                url = API_URL.manager_activity_report_list;
                title = self.reportTitle;
                var type = tab === 'dailyReport' ? 1 : 2;
                opt = {
                    postData: {
                        type: type
                    }
                };
            }

            Helper.fnCreatTable('#js-activity-table', title, url, function (td, sData, oData, row, col, table) {
                if (tab === 'dailyReport' || tab === 'weeklyReport') {
                    self._fnReportCustomColumn(td, sData, oData, row, col, table);
                }
                else {
                    self._fnCustomColumn(td, sData, oData, row, col, table);
                }
            }, 'dataTable', opt);


        },
        _fnActivityUpdate: function (params, tips) {
            Helper.fnConfirm(tips, function () {
                Helper.load_ajax();
                $.post(API_URL.manager_activity_deal, params, function (json) {
                    Helper.close_ajax();
                    if (json && json.res === 0) {
                        dataTable.reload(null, false);
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                }).fail(function () {
                    Helper.close_ajax();
                });
            });
        },
        _fnQiniuUpload: function (options) {
            var settings = {
                runtimes: 'html5,flash,html4', // 上传模式,依次退化
                browse_button: '', // 上传选择的点选按钮，**必需**
                uptoken_url: API_URL.qiniu_uptoken_url, // Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
                domain: API_URL.qiniu_domain, // bucket 域名，下载资源时用到，**必需**
                max_file_size: '2mb', // 最大文件体积限制
                max_retries: 3, // 上传失败最大重试次数
                dragdrop: true, // 开启可拖曳上传
                chunk_size: '4mb', // 分块上传时，每片的体积
                auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
                multi_selection: false,
                init: {
                    BeforeUpload: function (up, file) {
                        var type = file.type;
                        if (type.indexOf('image') !== -1) {
                            var imgType = type.slice(6);
                            if (imgType !== 'png' && imgType !== 'gif' && imgType !== 'jpg' && imgType !== 'jpeg') {
                                Helper.fnPrompt(MSG.upload_not_in_conformity);
                                up.removeFile(file);
                            }
                        }
                        else {
                            Helper.fnPrompt(MSG.upload_not_in_conformity);
                            up.removeFile(file);
                        }
                    },
                    UploadProgress: function (up, file) {
                        $('#' + options.browse_button).prop('disabled', true).html(MSG.uploading);
                        if ($('.datagrid-mask-msg').length <= 1) {
                            Helper.load_ajax();
                        }

                    },
                    Error: function (up, err, errTip) {
                        $('#' + options.browse_button).prop('disabled', false).html(MSG.upload);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);
                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    },
                    Key: function (up, file) {
                        var key = '';
                        key = file.id + Helper.fnGetCookie('user_id') + '.jpg';
                        return key;
                    }
                }
            };

            return Qiniu.uploader($.extend({}, settings, options, {
                init: $.extend({}, settings.init, options.init ? options.init : {})
            }));
        },
        _fnInitModal: function (model) {
            model.setData('role', $('input[name=role]').val());
            if (parseInt(model.data.id, 10) === 0) {
                $('#js-publish-btn').html('发布');
            }
            else {
                $('#js-activity-modal .modal-title').html('修改优惠活动');
                $('#js-publish-btn').html('保存');
            }
            $('#js-activity-modal form').html(doT.template($('#tpl-add-activity').text())({modelInfo: model.data}));
            $('#js-activity-modal').modal({backdrop: 'static'});
            $('#js-activity-modal form').validation({blur: false});
            this._fnQiniuUpload({
                browse_button: 'js-upload',
                init: {
                    FileUploaded: function (up, file, info) {
                        Helper.close_ajax();
                        $('#js-upload').prop('disabled', false).html(MSG.upload);
                        var res = JSON.parse(info);
                        var imgURL = API_URL.qiniu_domain + '/' + res.key;
                        $.get(imgURL + '?imageInfo', function (ret) {
                            // 素材上传尺寸限定
                            if (ret.width === 1000 && ret.height === 150) {
                                $('input[name=imageurl]').val(imgURL);
                                $('#js-des-thumb').html('<img src="' + imgURL + '" width="120" height="auto"><i class="fa fa-times-circle"></i>');
                            }
                            else {
                                Helper.fnPrompt(MSG.upload_spec_size_material);
                                up.removeFile(file);
                            }
                        }, 'json');

                    }
                }
            });
        },
        _fnStore: function (model) {
            model.save({
                url: API_URL.manager_activity_store,
                data: model.getPostData()
            }, function (json) {
                if (json && json.res === 0) {
                    $('#js-activity-modal').modal('hide');
                    dataTable.reload();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
                Helper.close_ajax();
            });
        },
        _fnInitHandle: function () { // 初始化操作
            var self = this;
            $('#js-activity-table').delegate('.js-publish,.js-offline', 'click', function () { // 发布，下线
                self._fnActivityUpdate({
                    id: dataTable.row($(this).parents('tr')[0]).data().id,
                    status: $(this).attr('data-value'),
                    role: $('input[name=role]').val()
                }, $(this).attr('data-tips'));
            });
            $('#js-activity-table').delegate('.js-preview', 'click', function () { // 预览活动
                $('#js-preview-modal .modal-body').html(doT.template($('#tpl-activity-detail').text())(dataTable.row($(this).parents('tr')[0]).data()));
                $('#js-preview-modal').modal('show');
            });
            $('#js-add-btn button').click(function () { // 发布活动
                if ($(this)[0].id === 'js-set-recipient') {
                    $.ajax({
                        url: API_URL.manager_activity_account_list,
                        type: 'GET'
                    })
                    .done(function (data) {
                        if (data.res === 0) {
                            var _html = '';
                            if (data.obj && data.obj.length > 0) {
                                for (var i = 0; i < data.obj.length; i++) {
                                    var isChecked = data.obj[i].status ? 'checked' : '';
                                    _html += '<label class="checkbox-inline"><input type="checkbox" value=' + data.obj[i].user_id + ' ' + isChecked + '>' + data.obj[i].username + '</label>';
                                }
                            }
                            $('#js-recipient-modal .modal-body').html(_html);
                        }
                    });
                    $('#js-recipient-modal').modal('show');
                }
                else {
                    var model = new $.fn.activitymodel.Model();
                    self._fnInitModal(model);
                }
            });
            $('#js-activity-table').delegate('.js-modify', 'click', function () { // 修改活动
                // 获取活动
                $.post(API_URL.manager_activity_get, {id: dataTable.row($(this).parents('tr')[0]).data().id}, function (json) {
                    if (json && json.res === 0) {
                        var model = new $.fn.activitymodel.Model();
                        $.extend(model.data, json.obj);
                        self._fnInitModal(model);
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                });
            });
            $('#js-activity-modal').delegate('#js-publish-btn', 'click', function () {
                if (!$('#js-activity-modal form').valid()) {
                    return;
                }
                Helper.load_ajax();
                var model = new $.fn.activitymodel.Model();
                model.setData('role', $('input[name=role]').val());
                model.setModel($('#js-activity-modal form'));
                if (parseInt($('input[name=id]').val(), 10) === 0) {
                    Helper.fnConfirm('您确定要发布该优惠活动吗？', function () {
                        self._fnStore(model);
                    });
                }
                else {
                    self._fnStore(model);
                }
            });
            $('#js-activity-table').delegate('.send-ctrl', 'click', function (event) {
                var id = dataTable.row($(this).parents('tr')[0]).data().id;
                var url = API_URL.manager_activity_resend_mail;
                Helper.load_ajax();
                $.ajax({
                        url: url,
                        type: 'POST',
                        data: {
                            id: id
                        }
                    })
                    .done(function (data) {
                        Helper.close_ajax();
                        if (data.res === 0) {
                            dataTable.reload(null, false);
                        }
                    })
                    .fail(function () {
                        Helper.close_ajax();
                    });
            });
             // 点击删除图片
            $('#js-activity-modal').delegate('#js-des-thumb i', 'click', function () {
                $('#js-des-thumb').empty();
                $('input[name=imageurl]').val('');
            });

            $('#js-recipient-modal').delegates({
                'input[type=checkbox]': {
                    change: function () {
                        Helper.load_ajax();
                        var that = this;
                        var check = +$(this)[0].checked;
                        $.ajax({
                                url: API_URL.manager_activity_update_mail_receiver,
                                type: 'POST',
                                data: {
                                    user_id: $(that).val(),
                                    status: +$(that)[0].checked
                                }
                            })
                            .done(function (data) {
                                Helper.close_ajax();
                                if (data.res !== 0) {
                                    $(that)[0].checked = !check;
                                }
                            })
                            .fail(function () {
                                Helper.close_ajax();
                                $(that)[0].checked = !check;
                            });
                    }
                }
            });
        },
        fnInit: function () {
            this._fnInitTab();
        }
    };
    return new ActivityIndex();
})(window.jQuery);
$(function () {
    activityIndex.fnInit();
});
