/**
 * @file index.js
 * @description 运营概览
 * @author xiaokl songxing
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
        this.data = data.data ? data.data : {summary: [], data: {}};
        this.sortData = [];
        this.selectedItem = [];
        this.field = data.field;
        this.title = data.title;
        this.date = data.date;
        this.format = data.format;
        this.valueAxisTemplate = data.valueAxisTemplate;
        this.categoryAxisBaseUnit = data.categoryAxisBaseUnit;
        this.multiple = data.multiple;
        this.name = data.name;
        this.$li = data.container;
        this.maxSelectedLen = 6;
        this.sharedTemplate = data.sharedTemplate;

        this.valueAxis = {
            labels: {
                format: '{0:n2}'
            },
            line: {
                visible: false
            }
        };
        this.categoryAxis = {
            type: 'date',
            baseUnit: 'days',
            majorGridLines: {
                visible: false
            },
            majorTicks: {
                visible: false
            },
            visible: false
        };
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

        _genLi: function () {
            var _this = this;
            this.$li.html($.tmpl('#tpl-chart-li', {multiple: this.multiple, title: this.title, data: this.sortData})).show();

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
                    sharedTemplate: this.sharedTemplate ? this.sharedTemplate : kendo.template($('#tpl-line-chart-tooltip').html())
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
            if (this.valueAxisTemplate) {
                this.valueAxis.labels.template = this.valueAxisTemplate;
            }
            if (this.categoryAxisBaseUnit) {
                this.categoryAxis.baseUnit = this.categoryAxisBaseUnit;
            }
            this._sortData();
            this._genLi();
        }
    };

    var WeekRetain = function () {
        this.chartColor = [
            '#0070c1',
            '#ffc100',
            '#00b1f1',
            '#7030a1',
            '#00b150',
            '#7e6000',
            '#93d150'
        ];
        this.date = Date.today().addDays(-8).toString('yyyy-MM-dd');
        this.$li = $('#week-retain');
        this.field = 'num';
        this.format = 'n2';
    };
    WeekRetain.prototype = {
        valueAxis: {
            max: 100,
            min: 0,
            labels: {
                format: '{0:n2}',
                template: '#: kendo.toString(value, "n2") #%'
            },
            line: {
                visible: false
            }
        },

        series: {
            type: 'line',
            missingValues: 'zero',
            markers: {
                visible: false
            }
        },

        categoryAxis: {
            categories: ['当天', '第1天', '第2天', '第3天', '第4天', '第5天', '第6天', '第7天'],
            majorGridLines: {
                visible: false
            },
            majorTicks: {
                visible: false
            },
            visible: true
        },

        _getTraffickerWeekRetain: function () {
            var _this = this;
            var param = {
                date: this.date
            };
            $.get(API_URL.manager_stat_trafficker_week_retain, param, function (result) {
                if (!result.res) {
                    _this._renderTraffickerWeekRetain(result);
                }
                else {
                    Helper.fnAlert(result.msg);
                }
            }).fail(function () {
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        _renderTraffickerWeekRetain: function (data) {
            var _this = this;
            this.data = data.list ? data.list : {data: {}, summary: []};
            var sortData = this._sortData(this.data.data);
            this.$li.html($.tmpl('#tpl-week-chart-li', {title: '7日留存', data: sortData, date: this.date})).show();

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

            $('#week-select-date').datepicker({
                format: 'yyyy-mm-dd',
                endDate: '-1d',
                language: 'zh-CN',
                autoclose: true
            }).on('changeDate', function  (e) {
                _this.date = $(this).val();
                _this._getTraffickerWeekRetain();
            });
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
            this.selectedItem = $ele.val() ? $ele.val() : [];
            this._renderChart();
        },

        _renderChart: function () {
            var data = this.data;
            var opt = this.series;
            var selectedItem = this.selectedItem;
            var tmp = null;
            var series = [];
            var initData = {
                num: 100
            };
            for (var i = 0; i < selectedItem.length; i++) {
                if (selectedItem[i] === '0') {
                    series.push($.extend({}, opt, {
                        field: this.field,
                        name: '总数',
                        fformat: this.format,
                        data: [].concat(initData, data.summary)
                    }));
                }
                else {
                    tmp = data.data[selectedItem[i]];
                    series.push($.extend({}, opt, {
                        field: this.field,
                        name: tmp.brief_name,
                        fformat: this.format,
                        data: [].concat(initData, tmp.child)
                    }));
                }
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
                    sharedTemplate: kendo.template($('#tpl-line-week-chart-tooltip').html())
                }
            });
        },

        _sortData: function (oData) {
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
            return aData;
        },

        fnInit: function () {
            this._getTraffickerWeekRetain();
        }
    };
    var Overview = function () {
        this.trendType = '0'; // 0:30天， 1:7天
        this.ajaxIsOpen = true;
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
            $.get(API_URL.manager_stat_trafficker_trend, param, function (result) {
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
                container: $('#payment'),
                multiple: true,
                data: oData.payment,
                field: 'payment',
                title: '媒体收入',
                format: 'n2',
                date: data.obj
            });

            new Chart({
                container: $('#clicks'),
                multiple: true,
                data: oData.clicks,
                field: 'clicks',
                title: '下载量',
                format: 'n0',
                date: data.obj
            });

            new Chart({
                container: $('#cpc-clicks'),
                multiple: true,
                data: oData.cpc_clicks,
                field: 'cpc_clicks',
                title: '点击量',
                format: 'n0',
                date: data.obj
            });

            new Chart({
                container: $('#views'),
                multiple: true,
                data: oData.views,
                field: 'views',
                title: '展示量',
                format: 'n0',
                date: data.obj
            });
        },

        // 获取广告主消耗
        _getTraffickerDaily: function () {
            var _this = this;
            this._ajaxOpen();
            var param = {
                type: this.trendType
            };
            $.get(API_URL.manager_stat_trafficker_daily, param, function (result) {
                if (!result.res) {
                    _this._renderTraffickerDaily(result);
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

        _renderTraffickerDaily: function (data) {
            var oData = data.list ? data.list : {};
            new Chart({
                container: $('#daily-new'),
                multiple: true,
                data: oData.daily_new,
                field: 'num',
                title: '日新增',
                format: 'n0',
                date: data.obj
            });

            new Chart({
                container: $('#daily-active'),
                multiple: true,
                data: oData.daily_active,
                field: 'num',
                title: '日活',
                format: 'n0',
                date: data.obj
            });

            new Chart({
                container: $('#daily-retain'),
                multiple: true,
                data: oData.daily_retain,
                field: 'num',
                title: '次日留存',
                format: 'n2',
                valueAxisTemplate: '#: kendo.toString(value, "n2") #%',
                sharedTemplate: kendo.template($('#tpl-line-chart-tooltip-p').html()),
                date: data.obj
            });
        },

         // 获取广告主消耗
        _getTraffickerMonth: function () {
            var _this = this;
            this._ajaxOpen();
            $.get(API_URL.manager_stat_trafficker_month, function (result) {
                if (!result.res) {
                    _this._renderTraffickerMonth(result);
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

        _renderTraffickerMonth: function (data) {
            var oData = data.list ? data.list : {};
            if (oData.month_active) {
                new Chart({
                    container: $('#month-active'),
                    multiple: true,
                    data: oData.month_active,
                    field: 'num',
                    title: '月活',
                    format: 'n0',
                    categoryAxisBaseUnit: 'months',
                    sharedTemplate: kendo.template($('#tpl-line-chart-tooltip-month').html()),
                    date: data.obj
                });
            }

            if (oData.month_new) {
                new Chart({
                    container: $('#month-new'),
                    multiple: true,
                    data: oData.month_new,
                    field: 'num',
                    title: '月新增',
                    format: 'n0',
                    categoryAxisBaseUnit: 'months',
                    sharedTemplate: kendo.template($('#tpl-line-chart-tooltip-month').html()),
                    date: data.obj
                });
            }
        },

        // 初始化函数
        fnInit: function () {
            var _this = this;
            this._getTrendReport();
            this._getTraffickerDaily();
            var weekRetain = new WeekRetain();
            weekRetain.fnInit();
            this._getTraffickerMonth();

            $('#select-trend-type').on('change', function () {
                _this.trendType = $(this).val();
                $('#overview-chart-wripper').html('');
                _this._getTrendReport();
                _this._getTraffickerDaily();
            });

            $(window).resize(function (event) {
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
    var url = '../../js/plugins/kendo.dataviz.min.js';
    try {
        url = __uri('../../js/plugins/kendo.dataviz.min.js');
    }
    catch (e) {}
    Helper.fnLoadScript(url, function () {
        Overview.fnInit();
    });
});
