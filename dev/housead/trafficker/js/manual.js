/**
 * @file manual.js
 * @description 导入查看人工数据 ，导入查看广告主结算
 * @author hehe
 */
var manual = (function ($) {
    var Manual = function () {
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
        // 检测excel第一行标题栏是否符合标准
        _checkExcelTitle: function (type, sheet) {
            var flag = false;
            var column = this.excelColumn;
            var lastCol = sheet['!ref'].split(':')[1].substr(0, 1);
            switch (type) {
                case 'S2S':
                    if (lastCol === 'D'
                        && sheet.A1 && sheet.A1.v === column.clientID
                        && sheet.B1 && sheet.B1.v === column.adName
                        && sheet.C1 && sheet.C1.v === column.date
                        && sheet.D1 && sheet.D1.v === column.revenue) {
                        flag = true;
                    }
                    break;
                case 'A2A':
                    if (lastCol === 'E'
                        && sheet.A1 && sheet.A1.v === column.clientID
                        && sheet.B1 && sheet.B1.v === column.adName
                        && sheet.C1 && sheet.C1.v === column.date
                        && sheet.D1 && sheet.D1.v === column.revenue
                        && sheet.E1 && sheet.E1.v === column.cpa) {
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
                result = checkContent.date(item[column.date]);
                if (!result.valid) {
                    msg.push(index + '数据第' + (i + 1) + '行：' + column.date + result.msg);
                    index++;
                }

                result = checkContent.number(item[column.revenue]);
                if (!result.valid) {
                    msg.push(index + '数据第' + (i + 1) + '行：' + column.revenue + result.msg);
                    index++;
                }

                if (type === 'A2A') {
                    result = checkContent.number(item[column.cpa]);
                    if (!result.valid) {
                        msg.push(index + '数据第' + (i + 1) + '行：' + column.cpa + result.msg);
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

        fnInit: function () {
            var that = this;
            $('#import-cpa, #import-cps').on('click', function () {
                var _this = this;
                var type = $(this).attr('data-type');
                var _txt = $(this).text();
                Helper.fnConfirm('提交后将不能修改,是否确认要进行导入？', function () {
                    var flag = false;
                    var url = API_URL.trafficker_manual_import;
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
            });
        }
    };
    return new Manual();
})(window.jQuery);
$(function () {
    manual.fnInit();
});
