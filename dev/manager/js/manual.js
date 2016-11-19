/**
 * @file manual.js
 * @description 导入查看人工数据 ，导入查看广告主结算
 * @author hehe
 */
var manual = (function ($) {
    var Manual = function () {
        this._manualTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'name',
                title: '媒体'
            }, {
                field: 'zonename',
                title: '广告位'
            }, {
                field: 'product_name',
                title: '产品'
            }, {
                field: 'type',
                title: '产品类型'
            }, {
                field: 'app_name',
                title: '广告'
            }, {
                field: 'ad_type',
                title: '广告类型'
            }, {
                field: 'ad_revenue_type',
                title: '广告主计费方式'
            }, {
                field: 'af_revenue_type',
                title: '媒体商计费方式'
            }, {
                field: 'clicks',
                title: '点击量'
            }, {
                field: 'conversions',
                title: '下载量'
            }, {
                field: 'cpa',
                title: 'CPA量'
            }, {
                field: 'revenue',
                title: '广告主消耗'
            }, {
                field: 'expense',
                title: '媒体支出'
            }, {
                field: 'flag',
                title: '生成状态'
            }]
        };
        this._settleTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'product_name',
                title: '产品'
            }, {
                field: 'type',
                title: '产品类型'
            }, {
                field: 'app_name',
                title: '广告'
            }, {
                field: 'ad_type',
                title: '广告类型'
            }, {
                field: 'platform',
                title: '平台类型'
            }, {
                field: 'name',
                title: '媒体商'
            }, {
                field: 'channel',
                title: '渠道号'
            }, {
                field: 'cpa',
                title: '转化量'
            }, {
                field: 'consum',
                title: '广告主结算金额'
            }]
        };
        this.excelColumn = {
            clientID: '广告主（ID）',
            clientName: '广告主（全称）',
            adName: '广告名称',
            afName: '媒体商（全称）',
            date: '日期',
            cpa: 'CPA量',
            cpc: '点击量',
            cpd: '下载量',
            revenue: '广告主消耗',
            payment: '媒体支出'
        };
    };
    Manual.prototype = {
        _fnManualCustomColumn: function (td, sData, oData, row, col, table, data) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'clicks':
                case 'conversions':
                case 'expense':
                    if (oData.action_flag === 0 && oData.flag === '0' && oData.clicks === 0 && oData.conversions === 0) {
                        html = '';
                    }
                    else {
                        html = sData;
                    }
                    break;
                case 'type':
                    html += LANG.products_type[sData];
                    break;
                case 'ad_type':
                    html += LANG.ad_type[sData];
                    break;
                case 'ad_revenue_type':
                case 'af_revenue_type':
                    html += LANG.revenue_type[sData];
                    break;
                case 'flag':
                    var sName = '';
                    if (oData.clicks > 0 || oData.conversions > 0) {
                        sName = '生成中';
                    }
                    if (oData.action_flag === 1) {
                        sName = '失败';
                    }
                    else if (sData === 1) {
                        sName = '成功';
                    }
                    html += sName;
                    break;
                default:
                    html = sData;
                    break;
            }
            $(td).html(html);
        },
        _fnSettleCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'type':
                    html += LANG.products_type[sData];
                    break;
                case 'ad_type':
                    html += LANG.ad_type[sData];
                    break;
                case 'platform':
                    if (3 === sData) {
                        html += LANG.platform_group['7'];
                    }
                    else {
                        html += LANG.platform_group[sData];
                    }
                    break;
                default:
                    break;
            }
            html !== '' && $(td).html(html);
        },

        // 检测excel第一行标题栏是否符合标准
        _checkExcelTitle: function (type, sheet) {
            var flag = false;
            var column = this.excelColumn;
            var lastCol = sheet['!ref'].split(':')[1].substr(0, 1);
            switch (type) {
                case 'A-AD':
                    if (lastCol === 'E'
                        && sheet.A1 && sheet.A1.v === column.clientID
                        && sheet.B1 && sheet.B1.v === column.adName
                        && sheet.C1 && sheet.C1.v === column.date
                        && sheet.D1 && sheet.D1.v === column.cpa
                        && sheet.E1 && sheet.E1.v === column.revenue) {
                        flag = true;
                    }
                    break;
                case 'A2D-AF':
                    if (lastCol === 'F'
                        && sheet.A1 && sheet.A1.v === column.clientID
                        && sheet.B1 && sheet.B1.v === column.adName
                        && sheet.C1 && sheet.C1.v === column.afName
                        && sheet.D1 && sheet.D1.v === column.date
                        && sheet.E1 && sheet.E1.v === column.cpd
                        && sheet.F1 && sheet.F1.v === column.payment) {
                        flag = true;
                    }
                    break;
                case 'A2C-AF':
                    if (lastCol === 'F'
                        && sheet.A1 && sheet.A1.v === column.clientID
                        && sheet.B1 && sheet.B1.v === column.adName
                        && sheet.C1 && sheet.C1.v === column.afName
                        && sheet.D1 && sheet.D1.v === column.date
                        && sheet.E1 && sheet.E1.v === column.cpc
                        && sheet.F1 && sheet.F1.v === column.payment) {
                        flag = true;
                    }
                    break;
                case 'T2T':
                case 'S2S':
                    if (lastCol === 'F'
                        && sheet.A1 && sheet.A1.v === column.clientID
                        && sheet.B1 && sheet.B1.v === column.adName
                        && sheet.C1 && sheet.C1.v === column.afName
                        && sheet.D1 && sheet.D1.v === column.date
                        && sheet.E1 && sheet.E1.v === column.revenue
                        && sheet.F1 && sheet.F1.v === column.payment) {
                        flag = true;
                    }
                    break;
                case 'A2A':
                    if (lastCol === 'G'
                        && sheet.A1 && sheet.A1.v === column.clientID
                        && sheet.B1 && sheet.B1.v === column.adName
                        && sheet.C1 && sheet.C1.v === column.afName
                        && sheet.D1 && sheet.D1.v === column.date
                        && sheet.E1 && sheet.E1.v === column.cpa
                        && sheet.F1 && sheet.F1.v === column.revenue
                        && sheet.G1 && sheet.G1.v === column.payment) {
                        flag = true;
                    }
                    break;
                case 'C2C':
                    if (lastCol === 'G'
                        && sheet.A1 && sheet.A1.v === column.clientID
                        && sheet.B1 && sheet.B1.v === column.adName
                        && sheet.C1 && sheet.C1.v === column.afName
                        && sheet.D1 && sheet.D1.v === column.date
                        && sheet.E1 && sheet.E1.v === column.cpc
                        && sheet.F1 && sheet.F1.v === column.revenue
                        && sheet.G1 && sheet.G1.v === column.payment) {
                        flag = true;
                    }
                    break;
                case 'D2D':
                    if (lastCol === 'G'
                        && sheet.A1 && sheet.A1.v === column.clientID
                        && sheet.B1 && sheet.B1.v === column.adName
                        && sheet.C1 && sheet.C1.v === column.afName
                        && sheet.D1 && sheet.D1.v === column.date
                        && sheet.E1 && sheet.E1.v === column.cpd
                        && sheet.F1 && sheet.F1.v === column.revenue
                        && sheet.G1 && sheet.G1.v === column.payment) {
                        flag = true;
                    }
                    break;
                default:
                    break;
            }

            return flag;
        },

        // 检测具体cell内容
        _checkContent: function () {
            return {
                clientName: function (value) {
                    var msg = '';
                    var flag = true;
                    if (value === undefined) {
                        flag = false;
                        msg = '未填写';
                    }
                    else if (!/^[a-zA-Z0-9\u4e00-\u9fa5\@\s+\_\-\{\}\[\]\(\)\（\）\【\】\｛\｝\#\&]+$/.test($.trim(value))) {
                        flag = false;
                        msg = '格式不正确';
                    }
                    return {
                        valid: flag,
                        msg: msg
                    };
                },

                adName: function (value) {
                    var msg = '';
                    var flag = true;
                    if (value === undefined) {
                        flag = false;
                        msg = '未填写';
                    }
                    else if (!/^[a-zA-Z0-9\u4e00-\u9fa5\@\s+\_\-\{\}\[\]\(\)\（\）\【\】\｛\｝\#\&./:：]+$/.test($.trim(value))) {
                        flag = false;
                        msg = '格式不正确';
                    }
                    return {
                        valid: flag,
                        msg: msg
                    };
                },

                afName: function (value) {
                    var msg = '';
                    var flag = true;
                    if (value === undefined) {
                        flag = false;
                        msg = '未填写';
                    }
                    else if (!/^[a-zA-Z0-9\u4e00-\u9fa5\@\s+\_\-\{\}\[\]\(\)\（\）\【\】\｛\｝\#\&]+$/.test($.trim(value))) {
                        flag = false;
                        msg = '格式不正确';
                    }
                    return {
                        valid: flag,
                        msg: msg
                    };
                },

                date: function (value) {
                    var msg = '';
                    var flag = true;
                    if (value === undefined) {
                        flag = false;
                        msg = '未填写';
                    }
                    else if (!/^(\d{4})[\/|\-](\d{2})[\/|\-](\d{2})$/.test($.trim(value))) {
                        flag = false;
                        msg = '格式不正确（应为：YYYY-mm-dd）';
                    }
                    return {
                        valid: flag,
                        msg: msg
                    };
                },

                number: function (value) {
                    var msg = '';
                    var flag = true;
                    if (isNaN(value)) {
                        flag = false;
                        msg = '必须是数字';
                    }
                    return {
                        valid: flag,
                        msg: msg
                    };
                }
            };
        },

        // 检测表格内部数据
        _checkExcelContent: function (type, data) {
            var len = data.length;
            var item = null;
            var msg = [];
            var column = this.excelColumn;
            var checkContent = this._checkContent();
            var index = 1;
            var result;
            for (var i = 0; i < len; i++) {
                item = data[i];
                result = checkContent.number(item[column.clientID]);
                if (!result.valid) {
                    msg.push(index + '数据第' + (i + 1) + '行：' + column.clientID + result.msg);
                    index++;
                }
                // result = checkContent.adName(item[column.adName]);
                // if (!result.valid) {
                //     msg.push(index + '数据第' + (i + 1) + '行：' + column.adName + result.msg);
                //     index++;
                // }
                if (type !== 'A-AD') {
                    result = checkContent.afName(item[column.afName]);
                    if (!result.valid) {
                        msg.push(index + '数据第' + (i + 1) + '行：' + column.afName + result.msg);
                        index++;
                    }
                }
                result = checkContent.date(item[column.date]);
                if (!result.valid) {
                    msg.push(index + '数据第' + (i + 1) + '行：' + column.date + result.msg);
                    index++;
                }

                if (type === 'A2A' || type === 'A-AD') {
                    result = checkContent.number(item[column.cpa]);
                    if (!result.valid) {
                        msg.push(index + '数据第' + (i + 1) + '行：' + column.cpa + result.msg);
                        index++;
                    }
                }
                if (type === 'A2D-AF' || type === 'D2D') {
                    result = checkContent.number(item[column.cpd]);
                    if (!result.valid) {
                        msg.push(index + '数据第' + (i + 1) + '行：' + column.cpd + result.msg);
                        index++;
                    }
                }
                if (type === 'C2C' || type === 'A2C-AF') {
                    result = checkContent.number(item[column.cpc]);
                    if (!result.valid) {
                        msg.push(index + '数据第' + (i + 1) + '行：' + column.cpc + result.msg);
                        index++;
                    }
                }
                if (type !== 'A2D-AF' && type !== 'A2C-AF') {
                    result = checkContent.number(item[column.revenue]);
                    if (!result.valid) {
                        msg.push(index + '数据第' + (i + 1) + '行：' + column.revenue + result.msg);
                        index++;
                    }
                }
                if (type !== 'A-AD') {
                    result = checkContent.number(item[column.payment]);
                    if (!result.valid) {
                        msg.push(index + '数据第' + (i + 1) + '行：' + column.payment + result.msg);
                        index++;
                    }
                }
            }
            if (msg.length > 0) {
                return {
                    valid: false,
                    msg: msg
                };
            }
            return {
                valid: true,
                msg: msg
            };
        },

        _fnListeners: function () {
            var that = this;
            $('.select-pagesize-wripper').delegates({
                '#js-view-manual-data': function () {
                    $('.js-manual-modal').modal('show').off('shown.bs.modal').on('shown.bs.modal', function () {
                        that.datepicker.value(Date.today().add(-1).days()); // 日期初始化
                        $('.manual-aff-list select').val('0'); // 条件初始化
                        that._fnRefreshManualData();
                    });
                },
                '.js-import-data': function () {
                    $('#modal-export-pannel').modal('show');
                },
                '#js-view-settle-data': function () {
                    $('.js-settle-modal').modal('show');
                    $('.settle-platform-label').html($.tmpl('#tpl-settle-platform', LANG.platform_group));
                    that.datepicker2.value(Date.today().add(-1).days());
                    that._getStatProduct();
                }
            });
            $('.manual-filter').delegates({
                '.manual-aff-list select': {
                    change: function () {
                        that._fnRefreshManualData();
                        window.manualTb.selectVal = $(this).val();
                    }
                }
            });
            $('.settle-filter').delegates({
                '.settle-productid': {
                    change: function () {
                        that._getStatCampaign();
                    }
                },
                '.settle-campaignid': {
                    change: function () {
                        that._fnRefreshSettleData();
                    }
                },
                '.settle-platform': {
                    change: function () {
                        that._getStatProduct();
                    }
                }
            });

            $('#modal-export-pannel').delegates({
                '.js-modal-export-btn': function () {
                    var _this = this;
                    var _txt = $(this).text();
                    var type = $(this).attr('data-type');
                    Helper.fnConfirm('提交后将不能修改,是否确认要进行导入？', function () {
                        var flag = false;
                        var url = API_URL.manager_stat_manual_import;
                        $('#js-import-manual-bt').uploadFile({
                            url: url,
                            fileName: 'file',
                            multiple: false,
                            allowedTypes: 'xls,xlsx',
                            showAbort: true,
                            acceptFiles: '.XLS,.xlsx',
                            formData: {type: type},
                            onSelect: function (fileList) {
                                if (!flag) {
                                    if (window.FileReader) {
                                        var file = fileList[0];
                                        var reader = new FileReader();

                                        reader.onload = function (e) {
                                            var data = e.target.result;
                                            var workbook;
                                            var b = true;

                                            if (reader.readAsBinaryString) {
                                                /* globals XLSX */
                                                workbook = XLSX.read(data, {type: 'binary'});
                                            }
                                            else {
                                                var binary = '';
                                                var bytes = new Uint8Array(data);
                                                var length = bytes.byteLength;
                                                for (var i = 0; i < length; i++) {
                                                    binary += String.fromCharCode(bytes[i]);
                                                }
                                                workbook = XLSX.read(binary, {type: 'binary'});
                                            }

                                            for (var j = 0; j < workbook.SheetNames.length; j++) {
                                                // Here is your object
                                                var sheetName = workbook.SheetNames[j];
                                                var sheet = workbook.Sheets[sheetName];
                                                var XL_row_object = XLSX.utils.sheet_to_row_object_array(sheet);

                                                if (XL_row_object.length > 0) {
                                                    b = that._checkExcelTitle(type, sheet);
                                                    if (!b) {
                                                        var typeLabel = type;
                                                        if (typeLabel === 'A-AD') {
                                                            typeLabel = 'A广告主';
                                                        }
                                                        else if (typeLabel === 'A2D-AF') {
                                                            typeLabel = 'A2D-媒体商';
                                                        }
                                                        else if (typeLabel === 'A2C-AF') {
                                                            typeLabel = 'A2C-媒体商';
                                                        }
                                                        Helper.fnPrompt('数据格式不正确，请导入"' + typeLabel + '"的业务数据');
                                                        break;
                                                    }
                                                    else {
                                                        var feedback = that._checkExcelContent(type, XL_row_object);
                                                        if (!feedback.valid) {
                                                            b = false;
                                                            $('.excel-wrong-mes').html($.tmpl('#tpl-excel-mes', {msg: feedback.msg}));
                                                            $('#js-wrong-modal').modal('show');
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            if (b) {
                                                flag = true;
                                                $('.ajax-file-upload input[type="file"]:last').trigger('change');
                                            }
                                        };
                                        reader.readAsBinaryString ? reader.readAsBinaryString(file) : reader.readAsArrayBuffer(file);
                                    }
                                    else {
                                        return true;
                                    }
                                }
                                return flag;
                            },
                            onFilter: function (file, error, dom) {
                                Helper.fnPrompt(error);
                            },
                            onSuccess: function (files, json, xhr) {
                                $(_this).find('a').text(_txt).attr('disabled', false);
                                if (json.res === 1) { // 输出错误信息
                                    // json.msg = JSON.parse(json.msg);
                                    $('.excel-wrong-mes').html($.tmpl('#tpl-excel-mes', json));
                                    $('#js-wrong-modal').modal('show');
                                }
                                else {
                                    Helper.fnPrompt(json.msg);
                                }
                            },
                            onProgress: function (percent) {
                                $(_this).find('a').text('正在导入……').attr('disabled', true);
                            }
                        });
                        $('.ajax-file-upload input[type="file"]:last').trigger('click');
                    });
                }
            });
            $(window).resize(function () {
                window.manualTb && window.manualTb.columns.adjust();
                window.settleTb && window.settleTb.columns.adjust();
            });
        },
        _getStatProduct: function () {
            var that = this;
            var product_param = {
                date: $('#settle-date-start').val(),
                platform: $('.settle-platform').val()
            };
            $.post(API_URL.manager_stat_product, product_param, function (data) {
                $('.settle-product-label').html($.tmpl('#tpl-settle-product', data));
                that._getStatCampaign();
            });
        },
        _getStatCampaign: function () {
            var that = this;
            var campaign_param = {
                date: $('#settle-date-start').val(),
                platform: $('.settle-platform').val(),
                product_id: $('.settle-productid').val()
            };
            $.post(API_URL.manager_stat_campaign, campaign_param, function (data) {
                $('.settle-campaign-label').html($.tmpl('#tpl-settle-campaign', data));
                that._fnRefreshSettleData();
            });
        },
        _fnRefreshManualData: function () {
            var opt = {
                scrollY: '500px',
                scrollCollapse: true,
                fixedHeader: false,
                bLengthChange: false,
                postData: {
                    affiliateid: function () {
                        return $('.manual-aff-list select').val();
                    },
                    date: function () {
                        return $('#manual-date-start').val();
                    }
                },
                fnDrawCallback: function (oSettings) {
                    $('.manual-aff-list').html($.tmpl('#tpl-manual-aff-list', window.manualTb));
                },
                destroy: true
            };
            window.manualTb && window.manualTb.destroy();
            Helper.fnCreatTable('#js-manual-table', this._manualTitle, API_URL.manager_stat_manual_data, this._fnManualCustomColumn, 'manualTb', opt);
        },
        _fnRefreshSettleData: function () {
            var opt = {
                scrollY: '500px',
                scrollCollapse: true,
                fixedHeader: false,
                bLengthChange: false,
                postData: {
                    date: function () {
                        return $('#settle-date-start').val();
                    },
                    platform: function () {
                        return $('.settle-platform').val();
                    },
                    product_id: function () {
                        return $('.settle-productid').val();
                    },
                    campaignid: function () {
                        return $('.settle-campaignid').val();
                    }
                },
                fnDrawCallback: function (oSettings) {
                    $('.settle-list').html($.tmpl('#tpl-settle', window.settleTb));
                },
                destroy: true
            };
            window.settleTb && window.settleTb.destroy();
            Helper.fnCreatTable('#js-settle-table', this._settleTitle, API_URL.manager_stat_client_data, this._fnSettleCustomColumn, 'settleTb', opt);
        },
        fnInit: function () {
            var that = this;
            $('#manual-date-start').kendoDatePicker({
                format: 'yyyy-MM-dd',
                max: Date.today().add(-1).days(),
                value: Date.today().add(-1).days(),
                animation: false
            });
            that.datepicker = $('#manual-date-start').data('kendoDatePicker');
            that.datepicker.bind('change', function () {
                that._fnRefreshManualData();
            });
            $('#settle-date-start').kendoDatePicker({
                format: 'yyyy-MM-dd',
                max: Date.today().add(-1).days(),
                value: Date.today().add(-1).days(),
                animation: false
            });
            this._settleDate = $('#settle-date-start').val();
            that.datepicker2 = $('#settle-date-start').data('kendoDatePicker');
            that.datepicker2.bind('change', function () {
                that._getStatProduct();
            });
            this._fnListeners();


        }
    };
    return new Manual();
})(window.jQuery);
$(function () {
    manual.fnInit();
});
