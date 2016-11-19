/**
 * @file config.js
 * @author hehe
 */

var GameInput = (function ($) {
    'use strict';
    var GameInput = function () {
        this.oTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [
                {
                    field: 'date',
                    title: '日期'
                },
                {
                    field: 'clientname',
                    title: '广告主'
                },
                {
                    field: 'app_name',
                    title: '游戏'
                },
                {
                    field: 'affiliatename',
                    title: '渠道'
                },
                {
                    field: 'game_client_usernum',
                    title: '新增用户数'
                },
                {
                    field: 'game_charge',
                    title: '充值金额'
                },
                {
                    field: 'game_client_revenue_type',
                    title: '广告主计费方式',
                    render: function (v) {
                        return LANG.game_revenue_type[v];
                    }
                },
                {
                    field: 'game_client_price',
                    title: '广告主单价'
                },
                {
                    field: 'game_client_amount',
                    title: '广告主结算金额'
                },
                {
                    field: 'game_af_revenue_type',
                    title: '渠道计费方式',
                    render: function (v) {
                        return LANG.game_revenue_type[v];
                    }
                },
                {
                    field: 'game_af_price',
                    title: '渠道单价'
                },
                {
                    field: 'game_af_amount',
                    title: '渠道结算金额'
                },
                {
                    field: 'game_af_usernum',
                    title: '渠道新增用户数'
                },
                {
                    field: 'campaignid',
                    title: '操作',
                    render: function () {
                        return '<button class="btn btn-default js-record-edit" data-type="edit">修改</button><button class="btn btn-default js-record-delete">删除</button>';
                    }
                }
            ]
        };
        this.oStoreData = {
            affiliateid: '',
            campaignid: '',
            clientid: '',
            date: '',
            game_af_amount: '',
            game_af_price: '',
            game_af_revenue_type: '',
            game_af_usernum: '',
            game_charge: '',
            game_client_amount: '',
            game_client_price: '',
            game_client_revenue_type: '',
            game_client_usernum: ''
        },
        this.oFilter = {
            date: [Date.today().add(-7).days().toString('yyyy-MM-dd'), Date.today().toString('yyyy-MM-dd')],
            clientid: '',
            campaignid: '',
            affiliateid: ''
        };
    };

    GameInput.prototype = {

        _fnCustomColumn: function (td, sData, oData, row, col, table) {
        },

        _fnCreateTable: function () {
            var _this = this;
            Helper.fnCreatTable('#game-input-table', _this.oTitle, API_URL.manager_game_index, _this._fnCustomColumn, 'dataTable', {
                postData: {
                    filter: function () {
                        return JSON.stringify(_this.oFilter);
                    }
                },
                dom: 'rftipl<"clear">'
            });
        },
        _fnInitListeners: function () {
            var _this = this;
            $('#game-input').delegates({
                '.js-game-add': function () {
                    $('.js-game-add-modal .form-horizontal').html($.tmpl('#tpl-game-add-modal', {}));
                    $('.js-game-add-modal .form-horizontal').validation({
                        blur: false
                    });
                    $('.js-game-add-modal').modal('show');
                    $('.js-game-add-modal .clientid-select').html($.tmpl('#tpl-game-add-clients', _this)).multiselect('destroy').multiselect({
                        enableFiltering: true,
                        buttonWidth: '100%',
                        maxHeight: 200,
                        onChange: function (option, checked, select) {
                            $('input[name="clientid"]').val($(option).val());
                        }
                    });
                },

                '.js-game-import': function () {
                    $('.ajax-file-upload input[type="file"]:last').trigger('click');
                }

            });

            $('.js-game-add-modal').delegates({
                '.js-game-add-save': function () { // 新建游戏
                    var $panel = $('.js-game-add-modal');
                    var clientid = $panel.find('input[name="clientid"]').val();
                    var appinfos_app_name = $panel.find('input[name="appinfos_app_name"]').val();
                    if (!($('.js-game-add-modal .form-horizontal').valid())) {
                        return false;
                    }
                    $.post(API_URL.manager_game_game_store, {clientid: clientid, appinfos_app_name: appinfos_app_name}, function (response) {
                        if (0 === response.res) {
                            $('.js-game-add-modal').modal('hide');
                        }
                        else {
                            Helper.fnPrompt(response.msg);
                        }
                    });
                }

            });
            $('.js-record-add-modal').delegates({
                '.js-record-add-save': function () { // 保存数据
                    var $form = $('.js-record-add-modal .form-horizontal');
                    var oPostJson = $form.serializeJson();

                    if (!($('.js-record-add-modal .form-horizontal').valid())) {
                        return false;
                    }
                    if (oPostJson.game_client_usernum === '' && oPostJson.game_charge === '' && oPostJson.game_client_price === '' && oPostJson.game_client_amount === '' && oPostJson.game_af_price === '' && oPostJson.game_af_amount === '' && oPostJson.game_af_usernum === '') {
                        Helper.fnPrompt('表单输入框必须填写至少一项');
                        return false;
                    }
                    $.post(API_URL.manager_game_store, oPostJson, function (response) {
                        if (response.res === 0) {
                            $('.js-record-add-modal').modal('hide');
                            dataTable.reload();
                        }
                        else {
                            Helper.fnPrompt(response.msg);
                        }
                    });

                }
            });

            var _fnGetGameList = function (_v, obj) {
                $('.js-record-add-modal input[name="clientid"]').val(_v);
                $.post(API_URL.manager_game_game_index, {
                    clientid: _v
                }, function (data) {
                    if (data && data.res === 0) {
                        var _data = obj ? $.extend({}, data, obj) : data;
                        $('.js-record-add-modal .campaignid-select').html($.tmpl('#tpl-game-list', _data)).multiselect('destroy').multiselect({
                            enableFiltering: true,
                            buttonWidth: '100%',
                            maxHeight: 200,
                            onChange: function (option, checked, select) {
                                var _vv = $(option).val();
                                $('.js-record-add-modal input[name="campaignid"]').val(_vv);
                            }
                        });
                    }
                });
            };

            $('#game-input-wrapper').delegates({
                '.js-record-edit': function () { // 新建修改数据
                    var type = $(this).data('type');
                    var _title;
                    var oFormData = {};
                    if (type === 'add') {
                        _title = '新增数据';
                        oFormData = $.extend(true, {}, _this.oStoreData);
                    }
                    else {
                        _title = '修改数据';
                        oFormData = dataTable.row($(this).parents('tr')[0]).data();
                        _fnGetGameList(oFormData.clientid, oFormData);
                    }
                    $('.js-record-add-modal .form-horizontal').html($.tmpl('#tpl-record-add-modal', oFormData));

                    $('.js-record-add-modal .modal-title').text(_title);
                    $('select[name="game_af_revenue_type"]').html($.tmpl('#tpl-revenue-type', LANG.game_revenue_type)).val(oFormData.game_af_revenue_type);
                    $('select[name="game_client_revenue_type"]').html($.tmpl('#tpl-revenue-type', LANG.game_revenue_type)).val(oFormData.game_client_revenue_type);
                    var option = {
                        enableFiltering: true,
                        buttonWidth: '100%',
                        maxHeight: 200
                    };
                    var gameDate = $('.game-date').kendoDatePicker({
                        format: 'yyyy-MM-dd',
                        animation: false,
                        change: function () {
                            $('.js-record-add-modal input[name="date"]').val(kendo.toString(this.value(), 'yyyy-MM-dd'));
                        }
                    }).data('kendoDatePicker');
                    gameDate.max(new Date());

                    $('.js-record-add-modal .campaignid-select').multiselect('destroy').multiselect(option);

                    $('.js-record-add-modal .affiliateid-select').html($.tmpl('#tpl-affiliate-list', $.extend({}, _this, oFormData))).multiselect('destroy').multiselect({
                        enableFiltering: true,
                        buttonWidth: '100%',
                        maxHeight: 200,
                        onChange: function (option, checked, select) {
                            $('.js-record-add-modal input[name="affiliateid"]').val($(option).val());
                        }
                    });
                    $('.js-record-add-modal .clientid-select').html($.tmpl('#tpl-game-add-clients', $.extend({}, _this, oFormData))).multiselect('destroy').multiselect({
                        enableFiltering: true,
                        buttonWidth: '100%',
                        maxHeight: 200,
                        onChange: function (option, checked, select) {
                            _fnGetGameList($(option).val());
                        }
                    });
                    $('.js-record-add-modal').modal('show');
                    if (type === 'edit') {
                        gameDate.enable(false);
                        $('.js-record-add-modal .campaignid-select').multiselect('disable');
                        $('.js-record-add-modal .affiliateid-select').multiselect('disable');
                        $('.js-record-add-modal .clientid-select').multiselect('disable');
                    }
                    $('.js-record-add-modal .form-horizontal').validation({
                        blur: false
                    });
                }
            });

            $('#game-input-table').delegates({
                '.js-record-delete': function () { // 删除记录
                    var data = dataTable.row($(this).parents('tr')[0]).data();
                    var $that = $(this);
                    Helper.fnConfirm('您确定要删除吗?', function () {
                        $that .prop('disabled', true);
                        $.post(API_URL.manager_game_delete, {date: data.date, campaignid: data.campaignid, affiliateid: data.affiliateid}, function (response) {
                            if (response.res === 0) {
                                dataTable.reload();
                            }
                            else {
                                Helper.fnPrompt(response.msg);
                            }
                            $that .prop('disabled', false);
                        }).fail(function () {
                            $that .prop('disabled', false);
                            Helper.fnPrompt('服务器请求失败，请稍后重试！');
                        });
                    });

                }
            });
            $('#js-game-import-button').uploadFile({
                url: API_URL.manager_game_import,
                fileName: 'file',
                multiple: false,
                allowedTypes: 'xls,xlsx',
                showAbort: true,
                acceptFiles: '.XLS,.xlsx',
                onFilter: function (file, error, dom) {
                    Helper.fnPrompt(error);
                },
                onSuccess: function (files, json, xhr) {
                    $('.js-game-import').text('批量导入').attr('disabled', false);
                    if (json.res === 0) {
                        Helper.fnPrompt(json.msg);
                    }
                    else if (json.res === 1) {
                        $('.js-record-messages-modal .modal-body').html($.tmpl('#tpl-record-messages', json.msg));
                        $('.js-record-messages-modal').modal('show');
                    }
                },
                onProgress: function (percent) {
                    $('.js-game-import').text('正在导入……').attr('disabled', true);
                }
            });



            // $('.game-filter-start-date').kendoDatePicker({
            //     format: 'yyyy-MM-dd',
            //     animation: false,
            //     change: function () {
            //         _this.oFilter.date = kendo.toString(this.value(), 'yyyy-MM-dd');
            //         dataTable.reload();
            //     }
            // });
            //
            // $('.game-filter-end-date').kendoDatePicker({
            //     format: 'yyyy-MM-dd',
            //     animation: false,
            //     change: function () {
            //         _this.oFilter.date = kendo.toString(this.value(), 'yyyy-MM-dd');
            //         dataTable.reload();
            //     }
            // });

            var start = $('.game-filter-start-date').val(Date.today().add(-7).days().toString('yyyy-MM-dd')).kendoDatePicker({
                format: 'yyyy-MM-dd',
                change: startChange
            }).data('kendoDatePicker');

            var end = $('.game-filter-end-date').val(Date.today().toString('yyyy-MM-dd')).kendoDatePicker({
                format: 'yyyy-MM-dd',
                change: endChange
            }).data('kendoDatePicker');


            end.max(new Date());
            start.max(new Date());
            function startChange() {
                var startDate = start.value();
                var endDate = end.value();
                end.max(new Date());
                start.max(new Date());
                if (startDate) {
                    startDate = new Date(startDate);
                    startDate.setDate(startDate.getDate());
                    end.min(startDate);
                }
                else if (endDate) {
                    start.max(new Date(endDate));
                }
                else {
                    endDate = new Date();
                    start.max(endDate);
                    end.min(endDate);
                }

                _this.oFilter.date[0] = kendo.toString(startDate, 'yyyy-MM-dd') || '';
                dataTable.reload();
            }

            function endChange() {
                var endDate = end.value();
                var startDate = start.value();

                if (endDate) {
                    endDate = new Date(endDate);
                    endDate.setDate(endDate.getDate());
                    start.max(endDate);
                }
                else if (startDate) {
                    end.min(new Date(startDate));
                }
                else {
                    endDate = new Date();
                    start.max(endDate);
                    end.min(endDate);
                }
                _this.oFilter.date[1] = kendo.toString(endDate, 'yyyy-MM-dd') || '';
                dataTable.reload();
            }


            start.max(end.value());
            end.min(start.value());


            // 请求筛选广告主列表
            $.post(API_URL.manager_game_filter, {type: 1}, function (response) {
                if (response.res === 0) {
                    response.clients = response.obj;
                    $('.game-filter-client').html($.tmpl('#tpl-game-add-clients', response)).multiselect('rebuild');
                    dataTable.reload();
                }
            });
            $('.game-filter-client').multiselect('destroy').multiselect({
                enableFiltering: true,
                buttonWidth: '150px',
                maxHeight: 200,
                onChange: function (option, checked, select) {
                    _this.oFilter.clientid = $(option).val();
                    _this.oFilter.campaignid = '';
                    _this.oFilter.affiliateid = '';
                    $.post(API_URL.manager_game_filter, {type: 2, clientid: _this.oFilter.clientid}, function (response) {
                        if (response.res === 0) {
                            $('.game-filter-campaign').html($.tmpl('#tpl-game-list', response)).multiselect('rebuild');
                            $('.game-filter-affiliate').html($.tmpl('#tpl-affiliate-list', {})).multiselect('rebuild');
                            dataTable.reload();
                        }
                    });
                }
            });
            $('.game-filter-campaign').multiselect('destroy').multiselect({
                enableFiltering: true,
                buttonWidth: '150px',
                maxHeight: 200,
                onChange: function (option, checked, select) {
                    _this.oFilter.campaignid = $(option).val();
                    $.post(API_URL.manager_game_filter, {type: 3, clientid: _this.oFilter.clientid, campaignid: _this.oFilter.campaignid}, function (response) {
                        if (response.res === 0) {
                            response.affiliates = response.obj;
                            $('.game-filter-affiliate').html($.tmpl('#tpl-affiliate-list', response)).multiselect('rebuild');
                            dataTable.reload();
                        }
                    });
                }
            });
            $('.game-filter-affiliate').multiselect('destroy').multiselect({
                enableFiltering: true,
                buttonWidth: '150px',
                maxHeight: 200,
                onChange: function (option, checked, select) {
                    _this.oFilter.affiliateid = $(option).val();
                    dataTable.reload();
                }
            });


        },
        _fnGetData: function () {
            var _this = this;
            $.post(API_URL.manager_game_client_list, function (response) {
                if (response.res === 0) {
                    _this.clients = response.obj;
                }
            });
            $.post(API_URL.manager_game_affiliate_list, function (response) {
                if (response.res === 0) {
                    _this.affiliates = response.obj;
                }
            });
        },
        fnInit: function () {
            kendo.culture('zh-CN');
            this._fnGetData();
            this._fnCreateTable();
            this._fnInitListeners();
        }
    };
    return new GameInput();
})(jQuery);

$(function () {
    GameInput.fnInit();
});
