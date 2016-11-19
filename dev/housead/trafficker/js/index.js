/**
 * @file index.js
 * @description 运营概览
 * @author songxing
 */
var Overview = (function ($) {
    var Chart = function (data) {
        this.chartColor = [
            '#0070c1',
            '#ffc100',
            '#00b1f1',
            '#7030a1',
            '#00b150',
            '#7e6000',
            '#93d150'
        ];
        this.data = data.data;
        this.sortData = [];
        this.selectedItem = [];
        this.field = data.field;
        this.title = data.title;
        this.date = data.date;
        this.format = data.format;
        this.multiple = data.multiple;
        this.name = data.name;
        this.$li = null;
        this.maxSelectedLen = 6;
        this._init();
    };

    Chart.prototype = {
        series: {
            type: 'line',
            categoryField: 'time',
            missingValues: 'zero',
            markers: {
                visible: false
            }
        },

        valueAxis: {
            labels: {
                format: '{0:n2}'
            },
            line: {
                visible: false
            }
        },

        categoryAxis: {
            type: 'date',
            baseUnit: 'days',
            majorGridLines: {
                visible: false
            },
            majorTicks: {
                visible: false
            },
            visible: false
        },

        _genLi: function () {
            var _this = this;
            var html = $.tmpl('#tpl-chart-li', {multiple: this.multiple, title: this.title, data: this.sortData});
            this.$li = $(html);

            $('#overview-chart-wripper').append(this.$li);
            if (this.multiple) {
                this.$li.find('.js-select-item').on('change', function () {
                    _this._changeItem($(this));
                }).multiselect({
                    selectedClass: 'multiselect-selected',
                    buttonWidth: '80px',
                    maxHeight: 300,
                    dropRight: true,
                    buttonText: function (options, select) {
                        return '筛选';
                    },
                    onChange: function (option, checked) {
                        _this._changeOption();
                    }
                }).trigger('change');
                this._changeOption();
            }
            else {
                this._renderChart();
            }
        },

        _changeOption: function () {
            var _this = this;
            // Get selected options.
            var selectedOptions = _this.$li.find('.js-select-item option:selected');
            var dropdown = _this.$li.find('.js-select-item').parent().find('.multiselect-container');

            if (selectedOptions.length >= _this.maxSelectedLen) {
                // Disable all other checkboxes.
                var nonSelectedOptions = _this.$li.find('.js-select-item option').filter(function () {
                    return !$(this).is(':selected');
                });

                nonSelectedOptions.each(function () {
                    var input = dropdown.find('input[value="' + $(this).val() + '"]');
                    input.prop('disabled', true);
                    input.parent('li').addClass('disabled');
                });
            }
            else if (selectedOptions.length === 1) {
                var input = dropdown.find('input[value="' + $(selectedOptions).val() + '"]');
                input.prop('disabled', true);
                input.parent('li').addClass('disabled');
            }
            else {
                // Enable all checkboxes.
                _this.$li.find('.js-select-item option').each(function () {
                    var input = dropdown.find('input[value="' + $(this).val() + '"]');
                    input.prop('disabled', false);
                    input.parent('li').removeClass('disabled');
                });
            }
        },

        _changeItem: function ($ele) {
            this.selectedItem = $ele.val();
            this._renderChart();
        },

        _renderChart: function () {
            var _this = this;
            var data = this.data;
            var selectedItem = this.selectedItem;
            var tmp = null;
            var series = [];
            var opt = this.series;
            var initData = [
                {time: this.date.start},
                {time: this.date.end}
            ];
            var aggregate = function (newItems, obj, items) {
                var value = 0;
                var tmp = null;
                for (var i = 0; i < items.length; i++) {
                    tmp = items[i];
                    if (tmp[_this.field]) {
                        value += Number(tmp[_this.field]);
                    }
                }
                return value;
            };
            if (this.multiple) {
                for (var i = 0; i < selectedItem.length; i++) {
                    if (selectedItem[i] === '0') {
                        series.push($.extend({}, opt, {
                            aggregate: aggregate,
                            field: this.field,
                            name: '总数',
                            fformat: this.format,
                            data: [].concat(data.summary, initData)
                        }));
                    }
                    else {
                        tmp = data.data[selectedItem[i]];
                        series.push($.extend({}, opt, {
                            aggregate: aggregate,
                            field: this.field,
                            name: tmp.brief_name,
                            fformat: this.format,
                            data: [].concat(tmp.child, initData)
                        }));
                    }
                }
            }
            else {
                series.push($.extend({}, opt, {
                    aggregate: aggregate,
                    field: this.field,
                    name: this.name,
                    fformat: this.format,
                    data: [].concat(data, initData)
                }));
            }

            this.$li.find('.js-chart').kendoChart({
                legend: {
                    position: 'bottom'
                },
                seriesColors: this.chartColor,
                series: series,
                valueAxis: this.valueAxis,
                categoryAxis: this.categoryAxis,
                tooltip: {
                    visible: true,
                    background: 'grba(0,0,0,0)',
                    border: {
                        width: 0
                    },
                    shared: true,
                    sharedTemplate: kendo.template($('#tpl-line-chart-tooltip').html())
                }
            });
        },

        _sortData: function () {
            if (this.multiple) {
                var oData = this.data.data;
                var aData = [];
                var key = null;
                var tmp = null;
                var summary = 0;
                var field = this.field;
                for (key in oData) {
                    if (oData.hasOwnProperty(key)) {
                        summary = 0;
                        tmp = oData[key];
                        for (var i = 0; i < tmp.child.length; i++) {
                            summary += (+tmp.child[i][field]);
                        }
                        aData.push({
                            afid: key,
                            brief_name: tmp.brief_name,
                            summary: summary
                        });
                    }
                }
                aData.sort(function (a, b) {
                    return b.summary - a.summary;
                });
                this.sortData = aData;
            }
        },

        _init: function () {
            this.valueAxis.labels.format = this.format;
            this._sortData();
            this._genLi();
        }
    };
    var Overview = function () {
        this.pieChartColor = ['#44cef6', '#70f3ff', '#FFc64b', '#fff143', '#9ed900', '#bddd22', '#ff461f'];
        this.trendType = '0'; // 0:30天， 1:7天
        this.rankType = '0'; // 0:今日， 1:昨日， 2:本周，3：上周，4：本月，5：上月，6：累计
        this.ajaxIsOpen = true;
        this.table = null;
    };

    Overview.prototype = $.extend(Overview.prototype, {
        // 开启ajax遮罩
        _ajaxOpen: function () {
            if (!this.ajaxIsOpen) {
                Helper.load_ajax();
                this.ajaxIsOpen = true;
            }
        },
        // 关闭ajax遮罩
        _ajaxClose: function () {
            if (this.ajaxIsOpen) {
                Helper.close_ajax();
                this.ajaxIsOpen = false;
            }
        },
        // 获取30天收入概览
        _getTrendReport: function () {
            var _this = this;
            this._ajaxOpen();
            var param = {
                type: this.trendType
            };
            $.get(API_URL.trafficker_stat_self_trend, param, function (result) {
                if (!result.res) {
                    _this._renderTrendReport(result);
                    _this._ajaxClose();
                }
                else {
                    _this._ajaxClose();
                    Helper.fnAlert(result.msg);
                }
            }).fail(function () {
                _this._ajaxClose();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        // 渲染报表
        _renderTrendReport: function (data) {
            var oData = data.list ? data.list : {};
            new Chart({
                multiple: true,
                data: oData.revenue ? oData.revenue : {summary: [], data: {}},
                field: 'revenue',
                title: '广告主消耗（元）',
                format: 'n2',
                date: data.obj
            });
            new Chart({
                multiple: true,
                data: oData.views ? oData.views : {summary: [], data: {}},
                field: 'views',
                title: '展示量',
                format: 'n0',
                date: data.obj
            });

            new Chart({
                multiple: true,
                data: oData.clicks ? oData.clicks : {summary: [], data: {}},
                field: 'clicks',
                title: '下载量',
                format: 'n0',
                date: data.obj
            });

            new Chart({
                multiple: false,
                data: oData.recharge ? oData.recharge : [],
                field: 'amount',
                title: '有效充值（元）',
                name: '广告主',
                format: 'n2',
                date: data.obj
            });

            new Chart({
                multiple: false,
                data: oData.cpd ? oData.cpd : [],
                field: 'sum_ad',
                title: '有效CPD广告（下载>10的广告）',
                name: '有效CPD广告',
                format: 'n0',
                date: data.obj
            });
        },

        _getStatIndex: function () {
            var _this = this;
            this._ajaxOpen();
            $.get(API_URL.trafficker_stat_self_index, function (result) {
                _this._ajaxClose();
                if (!result.res) {
                    $('#summary-data-wrapper').html($.tmpl('#tpl-yesterday-summary', result));
                }
                else {
                    Helper.fnAlert(result.msg);
                }
            }).fail(function () {
                _this._ajaxClose();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        // 初始化函数
        fnInit: function () {
            var _this = this;
            this._getStatIndex();
            this._getTrendReport();

            $('#select-trend-type').on('change', function () {
                _this.trendType = $(this).val();
                $('#overview-chart-wripper').html('');
                _this._getTrendReport();
            });

            $(window).resize(function (event) {
                /* Act on the event */
                $('#overview .js-chart').each(function () {
                    if ($(this).data('kendoChart')) {
                        $(this).data('kendoChart').resize();
                    }
                });
            });
        }
    });

    return new Overview();
})(jQuery);

/**
*   页面入口
*/
$(function () {
    // var url = '../../js/plugins/kendo.dataviz.min.js';
    // try {
    //     url = __uri('../../js/plugins/kendo.dataviz.min.js');
    // }
    // catch (e) {}
    // Helper.fnLoadScript(url, function () {
    //     Overview.fnInit();
    // });
    Overview.fnInit();
});
