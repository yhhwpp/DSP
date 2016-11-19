/**
 * @file campaign_index.js
 * @author xiaokl
 */
var CampaignList = (function ($) {
    var CampaignList = function () {
        this.oMoneyLimit = {
            // revenue_min: 1,
            // revenue_max: 100,
            // day_limit_min: 200,
            // day_limit_max: 10000,
            // key_min: 0.1,
            // key_max: 100
        };
    };

    CampaignList.prototype = {
        _fnGetMoneyLimit: function () { // 获取出价、日预算、关键字加价配置
            var self = this;
            $.get(API_URL.campaign_money_limit, function (json) {
                if (json && json.res === 0 && json.list) {
                    $.extend(self.oMoneyLimit, json.list);
                    Helper.fnCreatTable('#js-campaigntable', API_URL.campaign_column_list, API_URL.campaign_list, function (td, sData, oData, row, col, table) {
                        self._fnCustomColumn(td, sData, oData, row, col, table);
                    }, 'dataTable', {
                        fnDrawCallback: function () {
                            self._fnInitHandle();
                        }
                    });

                    self._fnInitHandle2();
                }

            });
        },
        _fnCanModify: function (status, materialStatus) {
            var canModify = false;
            if ((+status) === CONSTANT.status_draft || (+status) === CONSTANT.status_rejected) {
                canModify = true;
            }
            else if ((+status) === CONSTANT.status_pending_approval || (+status) === CONSTANT.CAMPAIGN_STATUS_STOP) {
            }
            else {
                if (materialStatus !== 1) {
                    canModify = true;
                }
            }
            return canModify;
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) { // 自定义列表显示
            var thisCol = table.nameList[col];
            if (thisCol === 'revenue') {
                if (oData.ad_type === CONSTANT.ad_type_other || oData.revenue_type === CONSTANT.revenue_type_cps) {
                    $(td).html('-');
                }
                else {
                    var nRevenue = parseFloat(sData).toFixed(CONSTANT.revenue_type_conf[oData.revenue_type].decimal);
                    $(td).html(this._fnCanModify(oData.status, oData.appinfos_materials_status) ? '<a class="table-edit ' + thisCol + '" href="edit.html?cid=' + oData.campaignid + '&editType=revenue">￥&nbsp;' + nRevenue + '</a>' : '￥&nbsp;' + nRevenue);
                }
            }
            else if (thisCol === 'day_limit') {
                if (oData.ad_type === CONSTANT.ad_type_other || oData.revenue_type === CONSTANT.revenue_type_cps) {
                    $(td).html('-');
                }
                else {
                    $(td).html(this._fnCanModify(oData.status, oData.appinfos_materials_status) ? '<a class="table-edit ' + thisCol + '" href="edit.html?cid=' + oData.campaignid + '&editType=day_limit">￥&nbsp;' + parseInt(sData, 10) + '</a>' : '￥&nbsp;' + parseInt(sData, 10));
                }
            }
            else if (thisCol === 'total_limit') {
                if (oData.ad_type === CONSTANT.ad_type_other || oData.revenue_type === CONSTANT.revenue_type_cps) {
                    $(td).html('-');
                }
                else {
                    $(td).html(this._fnCanModify(oData.status, oData.appinfos_materials_status) ? '<a class="table-edit ' + thisCol + '" href="edit.html?cid=' + oData.campaignid + '&editType=total_limit">' + (parseInt(sData, 10) === 0 ? '不限' : '￥&nbsp;' + parseInt(sData, 10)) + '</a>' : ((parseInt(sData, 10) === 0 ? '不限' : '￥&nbsp;' + parseInt(sData, 10))));
                }
            }
            else if (thisCol === 'products_name') {
                if ((+oData.products_type) === CONSTANT.products_type_package) {
                    if (oData.appinfos_app_show_icon == null) {
                        $(td).html('<img src="" width="40" height="40"/>' + sData);
                    }
                    else {
                        $(td).html('<img src="' + oData.appinfos_app_show_icon + '" width="40" height="40"/>' + sData);
                    }
                }
                else {
                    $(td).html(sData);
                }
            }
            else if (thisCol === 'status') {
                var sApproveComment = '';
                if ((+sData) === CONSTANT.status_rejected || (+sData) === CONSTANT.status_suspended) {
                    var sTipsIcon = '<i class="fa fa-exclamation-circle text-warning"></i>';
                    if ((+sData) === CONSTANT.status_rejected) {
                        sApproveComment = oData.approve_comment;
                        sTipsIcon = '<i class="fa fa-exclamation-circle text-warning"></i>';
                        $(td).html(Helper.fnGetPopoverOrTooltip({
                            'data-toggle': 'tooltip',
                            'data-trigger': 'hover',
                            'data-placement': 'right',
                            'title': sApproveComment
                        }, LANG.campaign_status[sData] + '&nbsp;' + sTipsIcon));
                    }
                    else if ((+sData) === CONSTANT.status_suspended) { // 已暂停
                        oData.pause_status === CONSTANT.CAMPAIGN_PAUSE_STATUS_EXCEED_DAY_LIMIT_PROGRAM && (oData.pause_status = CONSTANT.CAMPAIGN_PAUSE_STATUS_MANAGER); // 程序化日预算显示运营暂停
                        $(td).html(LANG.CAMPAIGN_PAUSE_STATUS[oData.pause_status] ? LANG.CAMPAIGN_PAUSE_STATUS[oData.pause_status] : '');
                    }
                }
                else {
                    $(td).html(LANG.campaign_status[sData] ? LANG.campaign_status[sData] : '');
                }
            }
            else if (thisCol === 'keyword_price_up_count') {
                if (+oData.revenue_type === CONSTANT.revenue_type_cps) {
                    $(td).html('-');
                }
                else if ((+oData.ad_type) === CONSTANT.ad_type_app_market || (+oData.ad_type) === CONSTANT.ad_type_app_store) {
                    $(td).html(parseInt(sData, 10) > 0 ? '<span class="js-handleKey center-block text-warning cursor">查看</span>' : '<span class="js-handleKey add btn btn-default">增加</span>');
                }
                else {
                    $(td).html('-');
                }
            }
            else if (thisCol === 'campaignid') {
                if ((+oData.ad_type) === CONSTANT.ad_type_other) {
                    if ((+oData.status) === CONSTANT.status_draft) {
                        $(td).html('<a class="btn btn-default" href="edit.html?cid=' + oData.campaignid + '"><i class="fa fa-edit"></i> 修改</a> <button class="btn btn-default js-delcampaignst" data="' + oData.campaignid + '"><i class="fa fa-warning"></i> 删除</button>');
                    }
                    else {
                        $(td).html('-');
                    }
                }
                else {
                    if ($.inArray((+oData.status), CONSTANT.status_array) > -1) {
                        if ((+oData.status) === CONSTANT.status_draft || (+oData.status) === CONSTANT.status_rejected) {
                            $(td).html('<a class="btn btn-default" href="edit.html?cid=' + oData.campaignid + '"><i class="fa fa-edit"></i> 修改</a> <button class="btn btn-default js-delcampaignst" data="' + oData.campaignid + '"><i class="fa fa-warning"></i> 删除</button>');
                        }
                        else if ((+oData.status) === CONSTANT.status_pending_approval) {
                            $(td).html('<span class="btn btn-default" data-toggle="modal" data-target="#sales-con" >联系销售顾问加速审核</span>');
                        }
                        else if ((+oData.status) === CONSTANT.status_delivering) {
                            if (oData.appinfos_materials_status === 1) {
                                $(td).html('新素材审核中');
                            }
                            else {
                                $(td).html('<a class="btn btn-default" href="edit.html?cid=' + oData.campaignid + '"><i class="fa fa-edit"></i> 修改素材</a> <span class="btn btn-default" data-toggle="modal" data-target="#sales-con" >暂停请联系销售顾问</span>');
                            }
                        }
                        else if ((+oData.status) === CONSTANT.status_suspended) {
                            if (oData.appinfos_materials_status === 1) {
                                $(td).html('新素材审核中');
                            }
                            else {
                                $(td).html('<a class="btn btn-default" href="edit.html?cid=' + oData.campaignid + '"><i class="fa fa-edit"></i> 修改素材</a> <span class="btn btn-default" data-toggle="modal" data-target="#sales-con">继续投放请联系销售顾问</span>');
                            }
                        }
                        else if ((+oData.status) === CONSTANT.CAMPAIGN_STATUS_STOP) {
                            $(td).html('-');
                        }
                        else {
                            if (oData.appinfos_materials_status === 1) {
                                $(td).html('新素材审核中');
                            }
                            else {
                                $(td).html('<a class="btn btn-default" href="edit.html?cid=' + oData.campaignid + '"><i class="fa fa-edit"></i> 修改素材</a>');
                            }
                        }
                    }
                    else {
                        $(td).html('-');
                    }
                }
            }
            else if (thisCol === 'platform') {
                $(td).html(LANG.platform_group[sData]);
            }
            else if (thisCol === 'ad_type') {
                $(td).html(LANG.ad_type[sData]);
            }
            else if (thisCol === 'revenue_type') {
                $(td).html(LANG.revenue_type[sData]);
            }
            else if (thisCol === 'products_type') {
                $(td).html(LANG.products_type[sData]);
            }
        },

        _fnInitHandle: function () { // 初始化弹出修改框
            // var moneyLimit = this.oMoneyLimit;
            // var defaults = {
            //     type: 'number',
            //     clear: false,
            //     step: '1',
            //     params: function () {
            //         return {
            //             id: dataTable.row($(this).parents('tr')[0]).data().campaignid,
            //             type: dataTable.row($(this).parents('tr')[0]).data().revenue_type
            //         };
            //     },
            //     url: API_URL.campaign_update,
            //     success: function (response) {
            //         if (response.res === 0) {
            //             dataTable.reload(null, false);
            //         }
            //         else {
            //             Helper.fnPrompt(response.msg);
            //         }
            //     }
            // };
/*            $('.table-edit.revenue').editable($.extend({}, defaults, {
                name: 'revenue',
                title: '修改出价',
                value: function () {
                    return dataTable.row($(this).parents('tr')[0]).data().revenue;
                },
                step: function () {
                    return dataTable.row($(this).parents('tr')[0]).data().revenue_type === CONSTANT.revenue_type_cpc ? '0.01' : '0.1';
                },
                max: function () {
                    if (moneyLimit[CONSTANT.revenue_type_cpd] && moneyLimit[CONSTANT.revenue_type_cpc]) {
                        if (dataTable.row($(this).parents('tr')[0]).data().revenue_type === CONSTANT.revenue_type_cpc) {
                            return moneyLimit[CONSTANT.revenue_type_cpc].revenue_max;
                        }
                        return moneyLimit[CONSTANT.revenue_type_cpd].revenue_max;
                    }

                    return moneyLimit.revenue_max;

                },
                min: function () {
                    if (moneyLimit[CONSTANT.revenue_type_cpd] && moneyLimit[CONSTANT.revenue_type_cpc]) {
                        if (dataTable.row($(this).parents('tr')[0]).data().revenue_type === CONSTANT.revenue_type_cpc) {
                            return moneyLimit[CONSTANT.revenue_type_cpc].revenue_min;
                        }
                        return moneyLimit[CONSTANT.revenue_type_cpd].revenue_min;
                    }

                    return moneyLimit.revenue_min;

                },
                validate: function (value) {
                    if ($.trim(value) === '') {
                        return '出价不能为空';
                    }
                }
            }));*/

            // $('.table-edit.day_limit').editable($.extend({}, defaults, {
            //     name: 'day_limit',
            //     title: '修改日预算',
            //     value: function () {
            //         return parseInt(dataTable.row($(this).parents('tr')[0]).data().day_limit, 10);
            //     },
            //     max: function () {
            //         if (moneyLimit[CONSTANT.revenue_type_cpd] && moneyLimit[CONSTANT.revenue_type_cpc]) {
            //             if (dataTable.row($(this).parents('tr')[0]).data().revenue_type === CONSTANT.revenue_type_cpc) {
            //                 return moneyLimit[CONSTANT.revenue_type_cpc].day_limit_max;
            //             }
            //             return moneyLimit[CONSTANT.revenue_type_cpd].day_limit_max;
            //         }

            //         return moneyLimit.day_limit_max;

            //     },
            //     min: function () {
            //         if (moneyLimit[CONSTANT.revenue_type_cpd] && moneyLimit[CONSTANT.revenue_type_cpc]) {
            //             if (dataTable.row($(this).parents('tr')[0]).data().revenue_type === CONSTANT.revenue_type_cpc) {
            //                 return moneyLimit[CONSTANT.revenue_type_cpc].day_limit_min;
            //             }
            //             return moneyLimit[CONSTANT.revenue_type_cpd].day_limit_min;
            //         }

            //         return moneyLimit.day_limit_min;

            //     },
            //     validate: function (value) {
            //         if ($.trim(value) === '') {
            //             return '日预算不能为空';
            //         }

            //     }
            // }));
            // $('.table-edit.total_limit').editable($.extend({}, defaults, {
            //     type: 'limitedit',
            //     title: '修改总预算',
            //     name: 'total_limit',
            //     datamax: function () {
            //         if (moneyLimit[CONSTANT.revenue_type_cpd] && moneyLimit[CONSTANT.revenue_type_cpc]) {
            //             if (dataTable.row($(this).parents('tr')[0]).data().revenue_type === CONSTANT.revenue_type_cpc) {
            //                 return moneyLimit[CONSTANT.revenue_type_cpc].day_limit_max;
            //             }

            //             return moneyLimit[CONSTANT.revenue_type_cpd].day_limit_max;
            //         }

            //         return moneyLimit.day_limit_max;
            //     },
            //     clear: true,
            //     value: function () {
            //         return parseInt(dataTable.row($(this).parents('tr')[0]).data().total_limit, 10);
            //     },
            //     validate: function (value) {
            //         if (value === null || $.trim(value) === '' || isNaN(value)) {
            //             return '总预算大于200小于等于' + (value.substr(1));
            //         }
            //     }
            // }));

            $('[data-toggle="tooltip"]').tooltip();
        },

        _fnInitHandle2: function () { // 初始化关键字加价操作
            var moneyLimit = this.oMoneyLimit;
            var self = this;
            // 关键字加价
            $('#js-campaigntable').delegate('.js-handleKey', 'click', function (e) {
                var innerSelf = $(this);
                var cid = dataTable.row(innerSelf.parents('tr')).data().campaignid;
                var Y = innerSelf.offset().top;
                var X = innerSelf.offset().left;
                var subtr = '';
                $('#floatertb tbody').empty();
                $('#zones-up').attr('cid', cid);
                if (innerSelf.hasClass('add')) {
                    var $th = $('<tr><td><input type="text" class="addKeyTxt" name="keyword" maxlength="30" /></td><td><input type="number" name="price_up" class="addKeyPrice" value="0.1" step="0.1" max="' + moneyLimit[CONSTANT.revenue_type_cpd].key_max + '" min="' + moneyLimit[CONSTANT.revenue_type_cpd].key_min + '" /></td><td><span class="btn btn-default js-addKeyBt mr">添加</span><i class="fa fa-trash fa-lg js-deleteKey-edit"></i></td></tr>');
                    $th.appendTo('#floatertb tbody');
                    var $tb = $('#zones-up');
                    $tb.show();
                    var dheight = $(document).height();
                    if (dheight - Y - 50 > $tb.height()) {
                        $tb.css({
                            left: X + 38,
                            top: Y
                        });
                    }
                    else {
                        $tb.css({
                            left: X + 38,
                            top: Y - $tb.height()
                        });
                    }
                    return false;
                }

                Helper.load_ajax();
                var param = {
                    campaignid: cid,
                    t: Math.random()
                };
                $.post(API_URL.keywords_list, param, function (json) {
                    Helper.close_ajax();
                    if (0 === json.res) {
                        var data = json.list;
                        for (var k = 0; k < data.length; k++) {
                            var row = data[k];
                            var star = '';
                            for (var i = 0; i !== parseInt(row.rank / 2, 10); i++) {
                                star += '<i class="fa fa-star text-warning"></i>';
                            }
                            if (row.rank % 2) {
                                star += '<i class="fa fa-star-half-o text-warning"></i>';
                            }

                            for (var j = 0; j !== 5 - Math.ceil(row.rank / 2); j++) {
                                star += '<i class="fa fa-star-o text-warning"></i>';
                            }
                            subtr += '<tr data-kid="' + row.id + '"><td>' + row.keyword + '</td>';
                            subtr += '<td><span class="table-edit price-edit" zone-id=' + data[k].id + ' cid=' + data[k].campaignid + ' rel="key_price" title="修改">' + Number(row.price_up).toFixed(1) + '</span></td>';
                            subtr += '<td>' + star + '<span class="pull-right"><i class="fa fa-plus fa-lg js-addKey"></i></span><span class="js-deleteKey pull-right mr"><i class="fa fa-trash fa-lg"></i></span></td></tr>';
                        }
                        $(subtr).appendTo('#floatertb tbody');
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                    var $tb = $('#zones-up');
                    $tb.show();
                    var dheight = $(document).height();
                    if (dheight - Y - 50 > $tb.height()) {
                        $tb.css({
                            left: X + 38,
                            top: Y
                        });
                    }
                    else {
                        $tb.css({
                            left: X + 38,
                            top: Y - $tb.height()
                        });
                    }

                    self._fnInitPriceUp();
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                });
                e.stopPropagation();
            });
            // 关闭
            $('.floater-close').on('click', function (e) {
                $(this).parents('#zones-up').hide();
                e.stopPropagation();
            });

            $(document).click(function (e) {
                var con = $('.zones-up');
                if (!con.is(e.target) && con.has(e.target).length === 0) {
                    $('#zones-up').hide();
                }

            });

            // 增加关键字
            $('#zones-up').delegate('.js-addKey', 'click', function () {
                if ($('input[name="price_up"]').length > 0) {
                    return;
                }

                var th = $('<tr><td><input type="text" class="addKeyTxt" name="keyword" maxlength="30" /></td><td><input type="number" name="price_up" class="addKeyPrice" value="0.1" step="0.1" max="' + moneyLimit[CONSTANT.revenue_type_cpd].key_max + '" min="' + moneyLimit[CONSTANT.revenue_type_cpd].key_min + '" /></td><td><span class="btn btn-default js-addKeyBt mr">添加</span><i class="fa fa-trash fa-lg fr js-deleteKey-edit"></i></td></tr>');
                th.appendTo('#floatertb tbody');
                $('.addKeyTxt').focus();
            });

            $('#zones-up').delegate('input[name=price_up]', 'change', function () {
                var min = $(this).attr('min');
                var max = $(this).attr('max');
                if (parseFloat($(this).val()) < parseFloat(min)) {
                    $(this).val(min);
                }
                if (parseFloat($(this).val()) > parseFloat(max)) {
                    $(this).val(max);
                }
                $(this).val(parseFloat($(this).val()).toFixed(1));
            });

            $('#zones-up').delegate('.js-addKeyBt', 'click', function () {
                var $tr = $(this).parents('tr');
                var $addKeyPrice = $tr.find('input[name="price_up"]');
                var $addKeyTxt = $tr.find('input[name="keyword"]');
                var addKeyTxt = $.trim($addKeyTxt.val());
                var addKeyPrice = $addKeyPrice.val();
                if (addKeyTxt === '') {
                    $addKeyTxt.css('border-color', '#FC7603');
                    setTimeout(function () {
                        $addKeyTxt.css('border-color', '#ccc');
                        $addKeyTxt.focus();
                    }, 500);
                    return;
                }

                if (addKeyPrice === '') {
                    $addKeyPrice.css('border-color', '#FC7603');
                    setTimeout(function () {
                        $addKeyPrice.css('border-color', '#ccc');
                        $addKeyPrice.focus();
                    }, 500);
                    return;
                }

                var param = {
                    campaignid: $('#zones-up').attr('cid'),
                    keyword: addKeyTxt,
                    price_up: addKeyPrice,
                    t: Math.random()
                };

                Helper.load_ajax();
                $.post(API_URL.keywords_store, param, function (json) {
                    Helper.close_ajax();
                    var subtr = '';
                    if (0 === json.res) {
                        $('#floatertb tbody').empty();
                        var data = json.list;
                        for (var k = 0; k < data.length; k++) {
                            var row = data[k];
                            var star = '';
                            for (var i = 0; i !== parseInt(row.rank / 2, 10); i++) {
                                star += '<i class="fa fa-star text-warning"></i>';
                            }
                            if (row.rank % 2) {
                                star += '<i class="fa fa-star-half-o text-warning"></i>';
                            }

                            for (var j = 0; j !== 5 - Math.ceil(row.rank / 2); j++) {
                                star += '<i class="fa fa-star-o text-warning"></i>';
                            }
                            subtr += '<tr data-kid="' + row.id + '"><td>' + row.keyword + '</td>';
                            subtr += '<td><span class="table-edit price-edit" zone-id=' + data[k].id + ' cid=' + data[k].campaignid + ' title="修改">' + Number(row.price_up).toFixed(1) + '</span></td>';
                            subtr += '<td>' + star + '<span class="pull-right"><i class="fa fa-plus fa-lg js-addKey"></i></span><span class="js-deleteKey pull-right mr"><i class="fa fa-trash fa-lg"></i></span></td></tr>';
                        }
                        $(subtr).appendTo('#floatertb tbody');

                        self._fnInitPriceUp();

                        if ($('#floatertb tbody tr').length === 1) {
                            dataTable.reload(null, false);
                        }
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                        $('.prompt').addClass('zones-up');
                    }
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                    Helper.close_ajax();
                });
            });

            $('#zones-up').delegate('.js-deleteKey', 'click', function (e) {
                $('.js-deleteKey').html('<i class="fa fa-trash fa-lg"></i>');
                $(this).html('<i class="js-deleKeyDown cursor">删除</i>');
                e.stopPropagation();
            });

            $('#zones-up').delegate('.js-deleKeyDown', 'click', function (e) {
                var $tr = $(this).parents('tr');
                var param = {
                    campaignid: $('#zones-up').attr('cid'),
                    id: $tr.attr('data-kid'),
                    t: Math.random()
                };
                Helper.load_ajax();
                $.post(API_URL.keywords_delete, param, function (json) {
                    Helper.close_ajax();
                    if (0 === json.res) {
                        $tr.remove();
                        if ($('#floatertb tbody tr').length === 0) {
                            dataTable.reload(null, false);
                            $('#zones-up').hide();
                        }
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                }).fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                    Helper.close_ajax();
                });
                e.stopPropagation();
            });

            $('#zones-up').delegate('.js-deleteKey-edit', 'click', function (e) {
                $(this).parents('tr').remove();
                if ($('#floatertb tbody tr').length === 0) {
                    $('#zones-up').hide();
                }

                e.stopPropagation();
            });

            $('#js-campaigntable').delegate('.js-delcampaignst', 'click', function () {
                var cid = dataTable.row($(this).parents('tr')[0]).data().campaignid;
                Helper.fnConfirm('是否删除该应用?', function () {
                    $.post(API_URL.campaign_delete, {
                        campaignid: cid
                    }, function (json) {
                        if (json.res === 0) {
                            dataTable.reload();
                        }
                        else {
                            Helper.fnPrompt(json.msg);
                        }
                    }).fail(function () {
                        Helper.fnPrompt('服务器请求失败，请稍后重试！');
                    });
                });
            });
        },

        _fnInitPriceUp: function () { // 初始化修改关键字加价弹出框
            var moneyLimit = this.oMoneyLimit;
            $('.table-edit.price-edit').editable({
                type: 'number',
                placement: 'right',
                clear: false,
                displayVal: function () {
                    return $(this).text();
                },
                params: function () {
                    return {
                        id: $(this).attr('zone-id'),
                        campaignid: $(this).attr('cid'),
                        keyword: $(this).parents('td').prev('td').text(),
                        price_up: $('.editable-input input[type="number"').val()
                    };
                },
                url: API_URL.keywords_store,
                success: function (response) {
                    if (response.res === 0) {
                        $(this).text(Number($('.editable-input input[type="number"').val()).toFixed(1));
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                },
                name: 'price_up',
                title: '修改关键字加价',
                step: '0.1',
                max: moneyLimit[CONSTANT.revenue_type_cpd].key_max,
                min: moneyLimit[CONSTANT.revenue_type_cpd].key_min,
                validate: function (value) {
                    if ($.trim(value) === '') {
                        return '关键字加价必须大于等于' + moneyLimit[CONSTANT.revenue_type_cpd].key_min + '小于等于' + moneyLimit[CONSTANT.revenue_type_cpd].key_max;
                    }

                }
            });
        },

        fnInit: function () {
            this._fnGetMoneyLimit();
        }
    };

    return new CampaignList();
})(jQuery);
$(function () {
    CampaignList.fnInit();
});
