/**
 * @file package-index.js
 * @author xiaokl
 * @description 渠道包管理
 */
var packageIndex = (function ($) {
    var PackageIndex = function () {
        this.oFilter = {
            business_type: ''
        };
    };
    PackageIndex.prototype = {
        oCampaignTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'clientname',
                    title: '广告主'
                },
                {
                    field: 'ad_type',
                    title: '广告类型',
                    render: function (data, type, full) {
                        return LANG.ad_type[data];
                    }
                },
                {
                    field: 'app_name',
                    title: '广告内容'
                },
                {
                    field: 'business_type',
                    title: '业务类型',
                    render: function (data) {
                        return LANG.business_type[data] || '-';
                    }
                },
                {
                    field: 'status',
                    title: '广告投放状态'
                },
                {
                    field: 'platform',
                    title: '推广平台',
                    render: function (data, type, full) {
                        return LANG.platform_group[data];
                    }
                },
                {
                    field: 'package_num',
                    title: '渠道包'
                },
                {
                    field: 'campaignid',
                    title: '操作',
                    render: function (data, type, full) {
                        return '<button type="button" class="btn btn-default js-btn-manage">管理</button>';
                    }
                }
            ]
        },
        oPackageTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'channel',
                    title: '渠道号'
                },
                {
                    field: 'real_name',
                    title: '渠道包'
                },
                {
                    field: 'contact_name',
                    title: '上传者'
                },
                {
                    field: 'version',
                    title: '版本号'
                },
                {
                    field: 'created_at',
                    title: '上传时间'
                },
                {
                    field: 'status',
                    title: '状态'
                },
                {
                    field: 'attach_id',
                    title: '操作'
                }
            ]
        },
        oAffiliateTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'brief_name',
                    title: '媒体商'
                },
                {
                    field: 'status',
                    title: '安装包使用情况'
                },
                {
                    field: 'affiliateid',
                    title: '投放'
                }
            ]
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'app_name') {
                $(td).html('<img src="' + oData.app_show_icon + '" width="40" height="40"/>' + sData);
            }
            else if (thisCol === 'package_num') {
                $(td).html(oData.compare_version === 1 ? '<span ' + (oData.status === CONSTANT.status_delivering ? 'class="text-warning"' : '') + '>非市场最新包</span>' : sData + '个渠道包使用中');
            }
            else if (thisCol === 'status') {
                if (sData === CONSTANT.status_suspended) {
                    $(td).html(LANG.CAMPAIGN_PAUSE_STATUS[oData.pause_status] ? LANG.CAMPAIGN_PAUSE_STATUS[oData.pause_status] : '');
                }
                else {
                    $(td).html(LANG.campaign_status[sData] ? LANG.campaign_status[sData] : '');
                }
            }
        },
        _fnGetExtension: function (platform) {
            if ($.inArray((+platform), CONSTANT.platform_android) > -1) {
                return 'apk';
            }
            else if ($.inArray((+platform), CONSTANT.platform_ios) > -1) {
                return 'ipa';
            }
            return 'apk,ipa';
        },
        _fnPackageCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'real_name') {
                $(td).html('<a class="text-warning" target="_blank" href="' + oData.package_download_url + '" title="' + sData + '">' + sData + '</a>');
            }
            else if (thisCol === 'channel') {
                // 获取最新版本号
                if (row === 0) {
                    $('#js-max-version').html(oData.max_version ? '市场上最新版本: ' + oData.max_version : '市场上最新版本: 未查找到最新版本');
                }
                $(td).html('<span class="table-edit ' + thisCol + '" data-title="渠道号" data-col="channel">' + (sData ? sData : '') + '</span>');
            }
            else if (thisCol === 'status') {
                if (CONSTANT.package_status_pending_approval === sData) {
                    $(td).html('<span class="text-danger">' + LANG.package_status[sData] + '</span>');
                }
                else if (CONSTANT.package_status_used === sData) {
                    $(td).html('<span class="text-success">' + LANG.package_status[sData] + '</span>');
                }
                else {
                    $(td).html(LANG.package_status[sData]);
                }
            }
            else if (thisCol === 'attach_id') {
                var html = '';
                if (CONSTANT.package_status_pending_approval === oData.status) {
                    html = '<a href="' + BOS.DOCUMENT_URI + '/manager/campaign/index.html#type=2&campaignid=' + $('#js-campaignid').val() + '" target="_blank" class="btn btn-default">在素材更新管理中审核</a>';
                }
                else if (CONSTANT.package_status_no_use === oData.status) {
                    html = '<button type="button" class="btn btn-default js-launch-media">投放媒体</button><button type="button" class="btn btn-default js-delete" data-value="0">弃用</button>';
                }
                else if (CONSTANT.package_status_used === oData.status) {
                    html = '<button type="button" class="btn btn-default js-launch-media">投放媒体</button>';
                }
                else if (CONSTANT.package_status_rejected === oData.status) {
                    html = '<button type="button" class="btn btn-default js-delete" data-value="1">删除</button>';
                }
                $(td).html(html);
            }
        },
        _fnAffiliateCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            var statusLabel = LANG.aff_pack_status[sData];
            if (thisCol === 'status') {
                if (sData === CONSTANT.aff_pack_status_used) {
                    $(td).html('<span class="text-success">' + statusLabel + '</span>');
                }
                else if (sData === CONSTANT.aff_pack_status_other) {
                    $(td).html('<span class="text-warning">' + statusLabel + oData.real_name + '</span>');
                }
                else {
                    $(td).html(statusLabel);
                }
            }
            else if (thisCol === 'affiliateid') {
                $(td).html(oData.status === CONSTANT.aff_pack_status_used ? '--' : '<button type="button" class="btn btn-default js-use-package">使用本包</button>');
            }
        },
        _fnInitCampaignHandle: function () { // 初始化推广计划渠道包按钮操作
            $('.table-edit.channel').editable({
                name: 'channel',
                title: '修改渠道号',
                placement: 'right',
                url: API_URL.manager_pack_update,
                params: function () {
                    return {
                        attach_id: window.packageTable.row($(this).parents('tr')[0]).data().attach_id
                    };
                },
                success: function (response) {
                    if (response.res === 0) {
                        window.packageTable.reload();
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                }
            });
        },
        _fnFreshNum: function () { // 刷新渠道包数量
            $.get(API_URL.manager_common_campaign_pending_audit, function (data) {
                var num = data.obj.camcnt ? data.obj.camcnt : 0;
                num += data.obj.meters_count ? data.obj.meters_count : 0;
                if (num > 0) {
                    $('#menu [data-type="manager-campaign"] .badge').html(num);
                }
            });
        },
        _fnBindTableHandle: function () { // 绑定表格操作
            var self = this;
            var up_datas;
            $('#js-package-modal').delegate('.js-add-package', 'click', function () { // 添加渠道包
                // 删除暂无数据这一列
                if ($('#js-campaign-package td.dataTables_empty') && $('#js-campaign-package td.dataTables_empty').length > 0) {
                    $('#js-campaign-package td.dataTables_empty').parents('tr').remove();
                }
                // 增加一列(input、button)
                var sHtml = '';
                sHtml += '<tr role="row"><td><input type="text" name="add-channel" style="padding:4px 0;"/></td>'
                     + '<td><button type="button" class="btn btn-default js-upload-file"><span class="js-btn-name">上传</span></button>'
                     + '<div class="btn-bg-div"><span class="btn-bg"></span></div></td>'
                     + '<td>-</td><td>-</td><td>-</td><td>-</td><td><button class="btn js-del-btn btn btn-default">删除</button></td></tr>';
                $('#js-campaign-package tbody').append(sHtml);
            });
            $('#js-package-table').delegate('.js-btn-manage', 'click', function () {
                var oData = dataTable.row($(this).parents('tr')[0]).data(); // 获取当前行数据
                // 初始化模态框标题显示
                $('#js-app-showicon').attr('src', oData.app_show_icon);
                $('#js-appname').html(oData.app_name);
                $('#js-extension').val(self._fnGetExtension(oData.platform));
                $('#js-campaignid').val(oData.campaignid);
                $('#js-clientid').val(oData.clientid);
                $('#js-max-version').html(''); // 清除最新版本显示
                // 获取推广计划挂载的渠道包列表
                if (window.packageTable) {
                    window.packageTable.reload();
                }
                else {
                    Helper.fnCreatTable('#js-campaign-package', self.oPackageTitle, API_URL.manager_pack_client_package, function (td, sData, oData, row, col, table) {
                        self._fnPackageCustomColumn(td, sData, oData, row, col, table);
                    }, 'packageTable', {
                        searching: false,
                        paging: false,
                        info: false,
                        fixedHeader: false,
                        postData: {
                            campaignid: function () {
                                return $('#js-campaignid').val();
                            }
                        },
                        fnDrawCallback: function () {
                            self._fnInitCampaignHandle();
                        }
                    });
                }
                $('#js-package-modal').modal({backdrop: 'static'});
                $('#js-file-up').uploadFile({
                    url: API_URL.file_upload,
                    fileName: 'file',
                    dynamicFormData: function () {
                        this.user_data = $.extend({}, up_datas || {});
                        delete up_datas.dom;
                        return $.extend({}, up_datas || {});
                    },
                    multiple: false,
                    allowedTypes: 'apk,ipa',
                    onFilter: function (file, error, dom) {
                        Helper.fnPrompt(error);
                    },
                    onError: function (files, json, xhr) {
                        $(this.user_data.dom).attr('disabled', false);
                        $(this.user_data.dom).parent().find('.btn-bg-div').hide();
                    },
                    onSuccess: function (files, json, xhr) {
                        $(this.user_data.dom).attr('disabled', false);
                        var data = json;
                        var oParentDom = $(this.user_data.dom).parent();
                        oParentDom.find('.btn-bg-div').hide();
                        oParentDom.find('.btn-bg').width('100%');
                        if (data.success && data.obj) {
                            window.packageTable.reload();
                            window.dataTable.reload(null, false);
                        }
                        else {
                            Helper.fnPrompt(data.msg);
                            $(this.user_data.dom).parent().find('.btn-bg-div').hide();
                        }
                    },
                    onProgress: function (percent) {
                        $(this.user_data.dom).attr('disabled', true);
                        $(this.user_data.dom).parent().find('.btn-bg-div').show();
                        $(this.user_data.dom).parent().find('.btn-bg').width(percent + '%');
                    }
                });
            });
            $('#js-campaign-package').delegate('.js-delete', 'click', function () { // 弃用、删除渠道包
                var self = $(this);
                Helper.fnConfirm('确认' + self.text() + '吗?', function () {
                    Helper.load_ajax();
                    $.post(API_URL.manager_pack_update, {
                        attach_id: window.packageTable.row(self.parents('tr')[0]).data().attach_id,
                        field: 'status',
                        value: self.attr('data-value')
                    }, function (json) {
                        if (json && json.res === 0) {
                            window.packageTable.reload();
                        }
                        else {
                            Helper.fnPrompt(json.msg);
                        }
                        Helper.close_ajax();
                    });
                });
            });
            $('#js-campaign-package').delegate('.js-launch-media', 'click', function () { // 投放媒体
                // 修改
                $('#js-package-modal').hide();
                $('#js-realname').html(window.packageTable.row($(this).parents('tr')[0]).data().real_name);
                $('#js-attachid').val(window.packageTable.row($(this).parents('tr')[0]).data().attach_id);
                if (window.packageSetTable) {
                    window.packageSetTable.reload();
                }
                else {
                    // 获取投放媒体数据
                    Helper.fnCreatTable('#js-packageset-table', self.oAffiliateTitle, API_URL.manager_pack_delivery_affiliate, function (td, sData, oData, row, col, table) {
                        self._fnAffiliateCustomColumn(td, sData, oData, row, col, table);
                    }, 'packageSetTable', {
                        paging: false,
                        info: false,
                        fixedHeader: false,
                        scrollY: '400px',
                        postData: {
                            attach_id: function () {
                                return $('#js-attachid').val();
                            }
                        },
                        fnDrawCallback: function () {
                            self._fnInitCampaignHandle();
                        }
                    });
                }
                // 打开模态框
                $('#js-package-set').show();
            });
            $('#js-campaign-package').delegate('.js-del-btn', 'click', function () { // 删除增加渠道包行
                $(this).parents('tr').remove();
            });
            $('#js-campaign-package').delegate('.js-upload-file', 'click', function () {
                up_datas = {};
                up_datas.dom = $(this);
                var channel = $.trim($(this).parents('tr').find('input[name="add-channel"]').val());
                up_datas.callback = API_URL.manager_pack_upload_callback + '?campaignid=' + $('#js-campaignid').val() + '&clientid=' + $('#js-clientid').val() + '&channel=' + channel + '&user_id=' + Helper.fnGetCookie('user_id');
                if (channel && channel !== '') {
                    $('.ajax-file-upload input[type=file]:last').trigger('click');
                }
                else {
                    $(this).parents('tr').find('input[name="add-channel"]').focus();
                    Helper.fnPrompt('请输入渠道号');
                }
            });
            $('#js-package-set').delegate('.js-close-set', 'click', function () {
                $('#js-package-modal').show();
                $('#js-package-set').hide();
            });
            $('#js-packageset-table').delegate('.js-use-package', 'click', function () { // 媒体商使用本包
                var oData = window.packageSetTable.row($(this).parents('tr')[0]).data();
                Helper.load_ajax();
                $.post(API_URL.manager_common_choose_package, {
                    affiliateid: oData.affiliateid,
                    campaignid: oData.campaignid,
                    attach_id: oData.attach_id,
                    ad_type: oData.ad_type,
                    old_attach_id: oData.old_attach_id
                }, function (json) {
                    if (json && json.res === 0) {
                        window.packageTable.reload();
                        window.packageSetTable.reload();
                        window.dataTable.reload();
                        self._fnFreshNum();
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                    Helper.close_ajax();
                });
            });
        },
        _fnUpdateBindSelect: function (mData, obj) {
            var _this = this;
            $('<select data-name="' + mData + '"><option value="">所有</option></select>').appendTo(obj).on('change', function (evt) {
                _this.oFilter[mData] = $(this).val();
                evt.stopPropagation();
                dataTable.reload();
            }).on('focus', function (evt) {
                $(this).val(_this.oFilter[mData]);
            });
        },
        _fnInitCampaignTable: function () { // 初始化表格
            var self = this;
            Helper.fnCreatTable('#js-package-table', self.oCampaignTitle, API_URL.manager_pack_index, function (td, sData, oData, row, col, table) {
                self._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                postData: {
                    filter: function () {
                        return JSON.stringify(self.oFilter);
                    }
                },
                fnInitComplete: function (settings, json) {
                    var _this = this;
                    var aoColumns = settings.aoColumns;
                    var api = _this.api();
                    for (var i = 0, j = aoColumns.length; i < j; i++) {
                        var mData = aoColumns[i].mData;
                        if (mData === 'business_type') {
                            var column = api.column(i);
                            var $span = $('<span class="addselect">▾</span>').appendTo($(column.header()));
                            self._fnUpdateBindSelect(mData, $span);
                        }
                    }

                    var items = $.extend({}, LANG.business_type);
                    delete items[0];
                    var key;
                    var html;
                    for (key in items) {
                        html += '<option value="' + key + '">' + items[key] + '</option>';
                    }
                    $('select[data-name="business_type"]').append(html);

                }
            });

        },
        fnInit: function () {
            this._fnInitCampaignTable();
            this._fnBindTableHandle();
        }
    };
    return new PackageIndex();
})(window.jQuery);
$(function () {
    packageIndex.fnInit(); // 初始化页面
});
