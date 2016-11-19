/**
 *  @file zone-index.js
 *  @author hehe
 */
var zoneList = (function ($) {
    var ZoneList = function () {
        this.postData = {
            platform: '',
            listtypeid: ''
        };
        // 应用广告位tittle
        this.oAppTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'zone_name',
                title: '广告位名称'
            }, {
                field: 'zone_id',
                title: '广告位ID',
                column_set: [
                    'sortable'
                ]
            },  {
                field: 'listtypeid',
                title: '所属模块'
            }, {
                field: 'description',
                title: '示意图'
            }, {
                field: 'platform',
                title: '所属平台',
                render: function (data, type, full) {
                    return LANG.platform[data];
                }
            }, {
                field: 'rank_limit',
                title: '级别',
                render: function (data, type, full) {
                    return LANG.app_rank[data];
                },
                column_set: [
                    'sortable'
                ]
            }, {
                field: 'type',
                title: '广告位类型',
                render: function (data, type, full) {
                    return LANG.module_type_self[data];
                },
                column_set: [
                    'sortable'
                ]
            }, {
                field: 'category',
                title: '类别',
                width: '220'
            }, {
                field: 'status',
                title: '状态',
                label: 'status_label',
                column_set: [
                    'sortable'
                ]
            }, {
                field: 'action',
                title: '操作'
            }]
        };
        // Banner广告位tittle
        this.oBannerTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'zone_name',
                title: '广告位名称'
            }, {
                field: 'zone_id',
                title: '广告位ID'
            }, {
                field: 'ad_type',
                title: '广告位类型',
                render: function (data, type, full) {
                    return LANG.zone_ad_type[data];
                }
            }, {
                field: 'status',
                title: '状态',
                label: 'status_label'
            }, {
                field: 'ad_refresh',
                title: '刷新频率',
                label: 'ad_refresh_label'
            }, {
                field: 'action',
                title: '操作'
            }]
        };
        // Feeds,插屏广告位tittle
        this.oFeedsTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'zone_name',
                title: '广告位名称'
            }, {
                field: 'zone_id',
                title: '广告位ID'
            }, {
                field: 'ad_type',
                title: '广告位类型',
                render: function (data, type, full) {
                    return LANG.zone_ad_type[data];
                }
            }, {
                field: 'status',
                title: '状态',
                label: 'status_label'
            }, {
                field: 'action',
                title: '操作'
            }]
        };
        this.oRowData = {}; // table行的数组
        this.position = {
            0: 150,
            1: 100
        }; // 应用广告位的位置配置,需要请求
        this.platform = 1; // campaign任务的platform
    };
    ZoneList.prototype = {
        _fnShowSelectOption: function (obj, id) {
            var s = '';
            for (var key in obj) {
                s += '<option value=' + key + '>' + obj[key] + '</option>';
            }
            $(id).html(s);
        },
        _fnShowPostion: function (num, id) {
            var i;
            var s = '<option value>选择相对位置</option>';
            for (i = 1; num >= i; i++) {
                s += '<option value="' + i + '">' + i + '</option>';
            }
            $(id).html(s);
        },
        _fnShowListType: function (array, id) {
            var i;
            var s = '<option value="">选择模块</option><option value="" class="js-new-list-type">+ 新建模块</option>';
            for (i = 0; i < array.length; i++) {
                s += '<option value="' + array[i].listtypeid + '" data-name="' + array[i].name + '">' + array[i].name + '(id:' + array[i].listtypeid + ')</option>';
            }

            $(id).html(s);
        },
        _fnQiniuUpload: function (options) {
            var settings = {
                runtimes: 'html5,flash,html4',
                browse_button: '',
                uptoken_url: API_URL.qiniu_uptoken_url,
                domain: API_URL.qiniu_domain,
                max_file_size: '2mb',
                max_retries: 3,
                dragdrop: true,
                chunk_size: '4mb',
                auto_start: true,
                multi_selection: false,
                init: {
                    BeforeUpload: function (up, file) {
                        var imgType;
                        var type = file.type;
                        if (-1 !== type.indexOf('image')) {
                            imgType = type.slice(6), 'png' !== imgType && 'gif' !== imgType && 'jpg' !== imgType && 'jpeg' !== imgType && (Helper.fnPrompt(MSG.upload_not_in_conformity), up.removeFile(file));
                        }
                        else {
                            Helper.fnPrompt(MSG.upload_not_in_conformity), up.removeFile(file);
                        }
                    },
                    UploadProgress: function (up, file) {
                        $('#' + options.browse_button).prop('disabled', !0).html(MSG.uploading), $('.datagrid-mask-msg').length <= 1;
                    },
                    Error: function (up, err, errTip) {
                        $('#' + options.browse_button).prop('disabled', !1).html(MSG.upload), -600 === err.code && Helper.fnPrompt(MSG.upload_up_to_two_mb);
                    },
                    Key: function (up, file) {
                        var key = file.id + '.jpg';
                        return key;
                    }
                }
            };
            return Qiniu.uploader($.extend({}, settings, options, {
                init: $.extend({}, settings.init, options.init ? options.init : {})
            }));
        },
        _fnDesUpload: function () {
            // 七牛上传
            this._fnQiniuUpload({
                browse_button: 'js-upload-des',
                init: {
                    FileUploaded: function (up, file, info) {
                        // Helper.close_ajax();
                        var res;
                        var imgURL;
                        $('#js-upload-des').prop('disabled', !1).html(MSG.upload), res = JSON.parse(info), imgURL = API_URL.qiniu_domain + '/' + res.key, $('input[name="description"]').val(imgURL), $('.js-des-thumb').html('<img src="' + imgURL + '" width="120" height="auto"><i class="fa fa-times-circle"></i>'), $('#js-upload-des').text(MSG.modify_img);
                    }
                }
            });
        },
        _fnShowZoneName: function () {
            var name;
            var $position = $('select[name="position"]');
            var $listType = $('select[name="listtypeid"]');
            var $zoneName = $('input[name="zone_name"]');
            if ('' === $listType.val() || '' === $position.val()) {
                return $zoneName.val(''), !1;
            }
            name = $('select[name="listtypeid"]').find('option:selected').data('name') + '第' + $position.val() + '位', $zoneName.val(name);
        },
        _fnTableCallback: function () {
            $('.fancybox').fancybox();
        },
        _fnInitListeners: function () {
            var _this = this;
            $('#js-zones-table').delegates({
                // 修改广告位
                '.js-zones-edit': function () {
                    var oRowData = dataTable.row($(this).parents('tr')[0]).data();
                    _this.oRowData = oRowData;
                    _this.platform = _this.oRowData.platform;

                    $.get(API_URL.trafficker_campaign_category, {ad_type: _this.type}, function (a) {
                        0 === a.res && (_this.categoryInfo = a.obj);
                        $('.js-zones-modal .modal-body').html(doT.template($('#tpl-zone-edit').text(), undefined, {
                            // category: $('#tpl-category').text()
                        })(_this));
                        if (_this.type === '0' || (+_this.type) === CONSTANT.ad_type_app_store) {
                            _this._fnShowSelectOption(_this.rank_limit, 'select[name="rank_limit"]');
                            _this._fnShowSelectOption(_this.oAllplatform, 'select[name="platform"]');
                            _this._fnShowPostion(_this.position[_this.oRowData.type], 'select[name="position"]');
                            _this._fnShowListType(_this.list_type[_this.oRowData.type], 'select[name="listtypeid"]');
                            $('select[name="platform"]').val(_this.oRowData.platform);
                            $('select[name="rank_limit"]').val(_this.oRowData.rank_limit);
                            $('select[name="position"]').val(_this.oRowData.position);
                            $('select[name="listtypeid"]').val(_this.oRowData.listtypeid);
                            if (_this.oRowData.type === 1) { // 若为搜索结果广告位，无需设置类别分类
                                $('.common-zone').remove();
                            }
                            else {
                                // 通用广告位
                                $('#category-list').categoryList(_this.categoryInfo);
                                $('#category-list').categoryList('select', oRowData.category.toString().split(','));
                            }
                        }
                        _this._fnDesUpload();
                        $('.js-zones-modal').modal('show');
                        _this.oRowData = {};
                    });
                },
                // 广告位停启用操作
                '.js-status-ctrl': function () {
                    var oRowData = dataTable.row($(this).parents('tr')[0]).data();
                    var param = {
                        zone_id: oRowData.zone_id,
                        action: Number(!oRowData.action)
                    };
                    $.post(API_URL.trafficker_zone_check, param, function (response) {
                        response.res === 0 && dataTable.reload(null, false);
                    });
                }
            });
            $('.table-ctl').delegates({
                // 新建广告位弹出
                '.js-zones-ads': function () {
                    $.get(API_URL.trafficker_campaign_category, {ad_type: _this.type}, function (a) {
                        0 === a.res && (_this.categoryInfo = a.obj);
                        $.get(API_URL.trafficker_module_list, {ad_type: _this.type}, function (a) {
                            0 === a.res && (_this.list_type = a.obj);
                            $('.js-zones-modal .modal-body').html(doT.template($('#tpl-zone-edit').text(), undefined, {
                                // category: $('#tpl-category').text()
                            })(_this));

                            _this._fnShowSelectOption(_this.rank_limit, 'select[name="rank_limit"]');
                            _this._fnShowSelectOption(_this.oAllplatform, 'select[name="platform"]');
                            _this._fnShowPostion(_this.position['0'], 'select[name="position"]');
                            if (_this.list_type) {
                                _this._fnShowListType(_this.list_type[0], 'select[name="listtypeid"]');
                            }
                            // $('input[name="parent"][value="0"]').prop('checked', !0);
                            $('.js-zones-modal').modal('show');
                            $.fn.initDom();
                            _this._fnDesUpload();
                            $('#category-list').categoryList(_this.categoryInfo);
                            // 表单验证
                            $('.js-zones-modal .form-horizontal').validation({
                                blur: false
                            });
                            // TraffickerCommon._fnCheckcategory($('.js-zones-modal'));
                        });
                    });
                },
                // 新建模块弹出
                '.js-list-type-manage': function () {
                    $('.js-list-type-modal .js-li-search-zone').show();
/*                    if ((+$(this).attr('data-ad_type')) === CONSTANT.ad_type_app_store) { // 隐藏AppStore搜索广告位
                        $('.js-list-type-modal .js-li-search-zone').hide();
                    }*/
                    $.get(API_URL.trafficker_module_list, {ad_type: _this.type}, function (a) {
                        0 === a.res && (_this.list_type = a.obj);
                        _this._fnListTypeModalShow();
                    });
                }
            });
            $('.js-zones-modal').delegates({
                // 删除示意图
                '.js-des-thumb .fa-times-circle': function () {
                    var src = $(this).prev('img').attr('src');
                    $.post(API_URL.qiniu_del_file, {
                        imgName: src.substring(src.lastIndexOf('/') + 1)
                    });
                    $('.js-des-thumb').empty();
                    $('#js-upload-des').text(MSG.upload);
                    $('input[name="description"]').val('');
                },
                // 提交数据
                '.js-zones-save': function () {
                    var oPostJson = $('.js-zones-modal .form-horizontal').serializeJson();
                    '' === oPostJson.ad_refresh && (oPostJson.ad_refresh = $('.ad_refresh-select').val());
                    var zoneType = $('input[name="type"]:checked').val();
                    if (zoneType === '0') {
                        oPostJson.category = $('#category-list input[name=category]').val();
                    }
                    else {
                        oPostJson.category = 0;
                    }
                    if (!($('.js-zones-modal .form-horizontal').valid())) {
                        return false;
                    }
                    if ((+oPostJson.ad_type) === CONSTANT.ad_type_app_store) {
                        oPostJson.platform = 3;
                    }
                    $.post(API_URL.trafficker_zone_store, oPostJson, function (response) {
                        0 === response.res ? (oPostJson.zone_id || Helper.fnPrompt('请将本广告ID(' + response.obj.zone_id + ')告诉贵公司的技术人员，跟进落实本广告位的接入。'), $('.js-zones-modal').modal('hide'), dataTable.reload(null, !1)) : Helper.fnPrompt(response.msg);
                    });
                },
                // 刷新频率选择
                'input[name="ad_refresh"]': {
                    change: function () {
                        '0' === $(this).val() ? $('.ad_refresh-select-label').hide() : $('.ad_refresh-select-label').show();
                    }
                },
                // 广告位类型选择
                '.js-zone-type-banner input[name="ad_type"]': {
                    change: function () {
                        $(this).val() === CONSTANT.zone_type_banner ? $('.js-material-support').show() : $('.js-material-support').hide();
                    }
                },
                // 半屏全屏选择
                '.js-screen input[name="ad_type"]': {
                    change: function () {
                        $('.screen-view').hide();
                        CONSTANT.ad_type_screen_half === +$(this).val() ? $('.screen-view-5').show() : $('.screen-view-6').show();
                    }
                },
                // 选择模块
                '.list_type_label': function () {
                    var name = $(this).attr('data-list_type_name');
                    var id = $(this).attr('data-listtypeid');
                    $('.list_type_show_name').text(name);
                    $('input[name="list_type"]').val(id);
                    _this._fnShowZoneName();
                    $('.list_type').removeClass('open');
                    return false;
                },
                'select[name="listtypeid"]': {
                    change: function () {
                        _this._fnShowZoneName();
                        // 新建模块
                        if ($(this).find('option:selected')[0].className === 'js-new-list-type') {
                            $('.js-list-type-name').show();
                            $('.js-list-type-name-input,.js-list-type-id-input').val('');
                        }
                        else {
                            $('.js-list-type-name').hide();
                        }
                    }
                },
                // 选择相对位置
                'select[name="position"]': {
                    change: function () {
                        _this._fnShowZoneName();
                    }
                },
                // 应用推广切换类型
                '.js-app input[name="type"]': {
                    change: function () {
                        var v = $(this).val();
                        _this._fnShowPostion(_this.position[v], 'select[name="position"]');
                        _this._fnShowListType(_this.list_type[v], 'select[name="listtypeid"]');
                        var $category = $('#category-list input[name=category]');
                        var _vcate = $category.val();
                        // '0' === v ? $('.common-zone').show() : $('.common-zone').hide(); // 类别显示与否
                        if ('0' === v) {
                            $('.common-zone').show();
                            $category.val(_vcate);
                        }
                        else {
                            $('.common-zone').hide();
                            $category.val('0');
                        }
                        $('input[name="zone_name"]').val('');
                        $('.js-list-type-name').hide();
                    }
                },
                '.js-list-type-name-ad': function () {
                    var that = _this;
                    var name = $.trim($('.js-list-type-name-input').val());
                    var listtypeid = $.trim($('.js-list-type-id-input').val());
                    if ('' === name) {
                        return $('.js-list-type-name-input').focus(), !1;
                    }
                    if ('' === listtypeid) {
                        return $('.js-list-type-id-input').focus(), !1;
                    }

                    var param = {
                        listtypeid: $('.js-list-type-id-input').val(),
                        action: 0,
                        name: name,
                        type: $('input[name="type"]:checked').val(),
                        ad_type: _this.type
                    };
                    $.post(API_URL.trafficker_module_store, param, function (response) {
                        if (response.res === 0) {
                            var option = '<option value="' + response.obj.listtypeid + '" data-name="' + response.obj.name + '">' + response.obj.name + '(id:' + response.obj.listtypeid + ')</option>';
                            $('select[name="listtypeid"]').append(option).val(response.obj.listtypeid);
                            _this.list_type[$('input[name="type"]:checked').val()].push({
                                listtypeid: response.obj.listtypeid,
                                name: response.obj.name,
                                already_used: 0
                            });
                            that._fnShowZoneName();
                            $('.js-list-type-name').hide();
                        }
                        else {
                            Helper.fnPrompt(response.msg);
                        }
                    });
                },
                '.js-list-type-name-cancel': function () {
                    $('.js-list-type-name').hide();
                }
            });

            $('.js-list-type-modal').delegates({
                // 模块新建修改删除
                '.js-list-type-edit': function () {
                    var $input = $(this).parents('li').find('.form-control').eq(0);
                    var $id = $(this).parents('li').find('.form-control').eq(1);
                    var listtypeid = $.trim($(this).parents('li').find('.form-control').eq(1).val());
                    var name = $.trim($input.val());
                    var type = $input.data('zone-type');
                    var action = $(this).data('action');
                    var sModuleUrl = API_URL.trafficker_module_store;
                    if (1 === action || 0 === action) {
                        if ('' === name) {
                            return $input.focus(), !1;
                        }
                        if ('' === listtypeid) {
                            return $id.focus(), !1;
                        }
                    }
                    else if (2 === action) {
                        if (!$input.data('id')) {
                            return $(this).parent('.new-add').remove(), !1;
                        }
                        sModuleUrl = API_URL.trafficker_zone_module_delete;
                    }
                    var param = {
                        listtypeid: listtypeid,
                        action: $(this).data('action'),
                        name: name,
                        type: type,
                        ad_type: _this.type,
                        id: $input.attr('data-zone-list-type-id')
                    };
                    var that = this;
                    $.post(sModuleUrl, param, function (response) {
                        if (0 === response.res) {
                            if (2 === action) {
                                $(that).parent('li').remove();
                            }
                            else {
                                var oAttr = {
                                    'data-name': name
                                };
                                0 === action && (oAttr['data-id'] = response.obj.listtypeid, oAttr['data-zone-list-type-id'] = response.obj.id, $id.prop('disabled', !0).val(response.obj.listtypeid)), $input.attr(oAttr).val(name), $(that).parent('.new-add').removeClass('new-add'), $(that).data('action', 1);
                                dataTable.reload(); // 刷新表格
                            }
                        }
                        Helper.fnPrompt(response.msg);
                    });
                },
                '.js-list-type-add': function () {
                    var $oi = $(this).prev('.form-inline').find('ol');
                    if ($oi.find('.new-add').length) {
                        return false;
                    }
                    var type = $(this).parents('.tab-pane').data('zone-type');
                    var li = '<li class="new-add">';
                    li += '<div class="form-group">模块名称：<input type="text" class="form-control" data-zone-list-type-id=""  data-zone-type="' + type + '"></div> ';
                    li += 'id：<div class="form-group"><input type="text" class="form-control list-type-id-input"></div> ';
                    li += '<button class="btn btn-default js-list-type-edit" data-action="0">保存</button> ';
                    li += '<button class="btn btn-default js-list-type-edit" data-action="2">删除</button> ';
                    li += '</li>';
                    $oi.append(li);
                }

            });
        },
        _fnListTypeModalShow: function () {
            // 模块管理
            $('#common-zone .form-inline').html($.tmpl('#tpl-list-type', this));
            $('#search-zone .form-inline').html('');
            $('.search-zone-list').appendTo('#search-zone .form-inline');
            $('.js-list-type-modal').modal('show');
        },
        _fnCategoryModalShow: function () {
            // 分类管理
            $('#app .form-inline').html($.tmpl('#tpl-category-list', this));
            $('#game .form-inline').html('');
            $('.game-category').appendTo('#game .form-inline');
            $('.js-category-modal').modal('show');
        },
        _fnInitComplete: function (settings, json, obj) {
            var _this = this;
            var aoColumns = settings.aoColumns;
            var api = obj.api();
            for (var i = 0, j = aoColumns.length; i < j; i++) {
                var mData = aoColumns[i].mData;
                if (mData === 'platform' || mData === 'listtypeid') {
                    var column = api.column(i);
                    var $span = $('<span class="addselect">▾</span>').appendTo($(column.header()));
                    _this._fnBindSelect(mData, $span);
                }
            }
            var items = LANG.platform;
            var key = null;
            var html = '';
            for (key in items) {
                html += '<option value="' + key + '">' + LANG.platform[key] + '</option>';
            }
            $('select[data-name="platform"]').append(html);

            items = _this.list_type;
            if (items && items.length > 0) {
                html = '';
                for (var m = 0; m < items.length; m++) {
                    var list = items[m];
                    for (var p = 0; p < list.length; p++) {
                        html += '<option value="' + list[p].id + '">' + list[p].name + '</option>';
                    }
                }
                $('select[data-name="listtypeid"]').append(html);
            }
        },
        _fnBindSelect: function (mData, obj) {
            var _this = this;
            $('<select data-name="' + mData + '"><option value="">所有</option></select>').appendTo(obj).on('change', function (evt) {
                _this.postData[mData] = $(this).val();
                evt.stopPropagation();
                dataTable.reload();
            }).on('focus', function (evt) {
                $(this).val(_this.postData[mData]);
            });
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table, data) { // 自定义列
            var thisCol = table.nameList[col];
            switch (thisCol) {
                case 'listtypeid':
                    $(td).html(oData.list_type_name + ' (id: ' + oData.listtypeid + ')');
                    break;
                case 'description':
                    sData ? $(td).html('<a href=' + sData + ' class="fancybox"><img src=' + sData + ' class="pic-thumb" /></a>') : $(td).html('');
                    break;
                case 'action':
                    var sCtrltext = 0 === oData.status ? '停用' : '启用';
                    $(td).html('<span class="btn btn-default js-zones-edit">修改</span><span class="btn btn-default js-status-ctrl">' + sCtrltext + '</span>');
                    break;
                case 'category':
                    var _txt = oData.category_label ? oData.category_label : '不限';
                    $(td).html(_txt);
                default:
                    break;
            }
        },
        _fnGetData: function () {
            var that = this;
            // 获取级别
            // $.get(API_URL.trafficker_campaign_rank, function (a) {
            //     0 === a.res && (that.rank_limit = a.obj);
            // });
            that.rank_limit = LANG.app_rank;
            // 获取平台
            // $.get(API_URL.campaign_platform, function (a) {
            //     0 === a.res && (that.oAllplatform = a.obj);
            // });
            that.oAllplatform = LANG.platform;

            // 获取所有分类
            $.get(API_URL.trafficker_campaign_category, {ad_type: that.type}, function (a) {
                0 === a.res && (that.categoryInfo = a.obj);
                if (that.categoryInfo) {
                    that.categoryInfo.parent['0'] = '不限';
                }
            });
            // 获取所有模块
            $.get(API_URL.trafficker_module_list, {ad_type: that.type}, function (a) {
                0 === a.res && (that.list_type = a.obj);
            });
            // 获取素材规格
            $.get(API_URL.campaign_banner_demand, function (a) {
                if (0 === a.res) {
                    var oSpecList = a.obj;
                    that.material_specs = {};
                    for (var k in oSpecList) {
                        that.material_specs[k] = '';
                        for (var m in oSpecList[k]) {
                            var _s = that.material_specs[k] ? ', ' + oSpecList[k][m] : oSpecList[k][m];
                            that.material_specs[k] += _s;
                        }
                    }
                }
            });
        },
        _fnInitPage: function () {
            var _this = this;
            $.get(API_URL.trafficker_zone_ad_type, function (json) {
                if (json && json.res === 0 && json.obj) {
                    var aryAdType = json.obj.ad_type;
                    if (aryAdType) {
                        if ($.inArray('71', aryAdType) > -1) {
                            $('.js-zone-type [data-type=71]').show();
                        }
                        else {
                            $('.js-zone-type [data-type=71]').hide();
                        }
                    }
                    else {
                        $('.js-zone-type [data-type=71]').hide();
                    }
                }
            });
            // TAB选中
            var type = Helper.fnGetQueryParam('ad_type');
            var $tabli = $('.js-zone-type li');
            var oTableTitle;
            type || (type = '0');
            this.type = type;
            _this._fnGetData();
            var opt = {
                postData: {
                    ad_type: type,
                    filter: function () {
                        return JSON.stringify({
                            platform: $('select[data-name="platform"]').val() || '',
                            listtypeid: $('select[data-name="listtypeid"]').val() || '',
                            rank_limit: '',
                            type: '',
                            status: ''
                        });
                    }
                },
                fnDrawCallback: this._fnTableCallback.call(this),
                fnInitComplete: function (settings, json) {
                    _this._fnInitComplete(settings, json, this);
                }
            };
            $tabli.removeClass('active');
            $('.js-zone-type li[data-type="' + type + '"]').addClass('active');
            // 获取title
            switch (type) {
                case '1':
                    oTableTitle = this.oBannerTitle;
                    break;
                case '2':
                case '3':
                    oTableTitle = this.oFeedsTitle;
                    break;
                default:
                    oTableTitle = this.oAppTitle;
                    break;
            }
            // 输出按钮
            if (CONSTANT.zone_type_app === type || CONSTANT.ad_type_app_store === (+type)) {
                var oBtn = '<span class="btn btn-primary pull-right js-list-type-manage" data-ad_type="' + type + '">广告位模块管理</span><span class="btn btn-primary pull-right js-category-manage">广告位分类管理</span>';
                $(oBtn).appendTo('.table-ctl');
            }
            // 输出表格数据
            Helper.fnCreatTable('#js-zones-table', oTableTitle, API_URL.trafficker_zone_index, this._fnCustomColumn, 'dataTable', opt);
            // 获得初始化数据

            // 绑定事件
            this._fnInitListeners();
            TraffickerCommon._fnInitCategoryHandle($('.js-zones-modal'), {ad_type: this.type});
        },
        fnInit: function () {
            this._fnInitPage();
        }
    };
    return new ZoneList();
}(window.jQuery));
$(function () {
    zoneList.fnInit();
});
