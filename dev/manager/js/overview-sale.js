/**
 * @file index.js
 * @description 运营概览
 * @author xiaokl songxing
 */
var Overview = (function ($) {
    var Overview = function () {
        this.chartColor = [
            '#0070c1',
            '#ffc100',
            '#00b1f1',
            '#7030a1',
            '#00b150',
            '#7e6000',
            '#93d150'
        ];
        this.pieChartColor = ['#44cef6', '#70f3ff', '#FFc64b', '#fff143', '#9ed900', '#bddd22', '#ff461f'];
        this.trendType = '0'; // 0:30天， 1:7天
        this.rankType = '0'; // 0:今日， 1:昨日， 2:本周，3：上周，4：本月，5：上月，6：累计
        this.ajaxIsOpen = true;
        this.table = null;

        this.renderData = [];
        this.maxSelectedLen = 9;
        this.selectedAd = [];
        this.date = null;
    };

    Overview.prototype = $.extend(Overview.prototype, {
        series: {
            type: 'line',
            categoryField: 'date',
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
            visible: false,
            axisCrossingValues: [0, 36]
        },

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
            $.get(API_URL.manager_stat_sale_trend, param, function (result) {
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
            this.date = data.obj;
            data = data.list ? data : {list: {summary: [], data: []}};
            this.renderData = [];
            var summary = {
                app_name: '总数',
                app_show_icon: '',
                campaignid: 0,
                child: data.list.summary
            };

            this.renderData.push(summary);
            this.renderData = this.renderData.concat(data.list.data);

            this._renderSelectAd(this.renderData);
        },

        // 渲染多选下拉框
        _renderSelectAd: function (data) {
            var html = '';
            var _this = this;
            for (var i = 0; i < data.length; i++) {
                html += '<option value="' + data[i].campaignid + '" ' + (i < this.maxSelectedLen ? 'selected' : '') + '>' + data[i].app_name + '</option>';
            }
            $('#select-camp').html(html).show().multiselect('rebuild').trigger('change');
            _this._changeOption();
        },

        _changeOption: function () {
            var _this = this;
            // Get selected options.
            var $ele = $('#select-camp');
            var selectedOptions = $ele.find('option:selected');
            var dropdown = $('#select-camp-wrapper').find('.multiselect-container');

            if (selectedOptions.length >= _this.maxSelectedLen) {
                // Disable all other checkboxes.
                var nonSelectedOptions = $ele.find('option').filter(function () {
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
                $ele.find('option').each(function () {
                    var input = dropdown.find('input[value="' + $(this).val() + '"]');
                    input.prop('disabled', false);
                    input.parent('li').removeClass('disabled');
                });
            }
        },

        _renderChart: function () {
            var renderData = this.renderData;
            var selectedAd = this.selectedAd;
            $('#overview-chart-wripper').html('');
            var tmp = null;
            for (var i = 0; i < renderData.length; i++) {
                tmp = renderData[i];
                if ($.inArray(String(tmp.campaignid), selectedAd) > -1) {
                    this._genLi(tmp);
                }
            }
        },

        _genLi: function (data) {
            var $li = $($.tmpl('#tpl-chart-li', data));
            $('#overview-chart-wripper').append($li);
            this._genChart(data, $li);
        },

        // 渲染报表
        _genChart: function (data, $li) {
            var series = [];
            var valueAxis = [];
            var opt = this.series;
            var initData = [
                {date: this.date.start},
                {date: this.date.end}
            ];
            var seriesData = initData.concat(data.child);
            var aggregate = function (newItems, obj, items) {
                var value = 0;
                var tmp = null;
                for (var i = 0; i < items.length; i++) {
                    tmp = items[i];
                    if (tmp[obj.field]) {
                        value += Number(tmp[obj.field]);
                    }
                }
                return value;
            };

            valueAxis.push($.extend({
                name: 'first'
            }, this.valueAxis));

            series.push($.extend({}, opt, {
                aggregate: aggregate,
                field: 'sum_revenue',
                name: '消耗',
                fformat: 'n2',
                axis: 'first',
                data: seriesData
            }));

            if (String(data.campaignid) === '0') {
                series.push($.extend({}, opt, {
                    aggregate: aggregate,
                    field: 'sum_clicks',
                    name: '下载量（上报）',
                    fformat: 'n0',
                    axis: 'first',
                    data: seriesData
                }));

                series.push($.extend({}, opt, {
                    aggregate: aggregate,
                    field: 'sum_cpc_clicks',
                    name: '点击量',
                    fformat: 'n0',
                    axis: 'first',
                    data: seriesData
                }));

                series.push($.extend({}, opt, {
                    aggregate: aggregate,
                    field: 'sum_cpa',
                    name: 'CPA量',
                    fformat: 'n0',
                    data: seriesData
                }));
            }
            else {
                valueAxis.push($.extend({}, this.valueAxis, {
                    name: 'second',
                    labels: {
                        format: '{0:n0}'
                    }
                }));

                if (Number(data.revenue_type) === CONSTANT.revenue_type_cpd) {
                    series.push($.extend({}, opt, {
                        aggregate: aggregate,
                        field: 'sum_clicks',
                        name: '下载量（上报）',
                        fformat: 'n0',
                        axis: 'second',
                        data: seriesData
                    }));
                }
                else if (Number(data.revenue_type) === CONSTANT.revenue_type_cpc) {
                    series.push($.extend({}, opt, {
                        aggregate: aggregate,
                        field: 'sum_cpc_clicks',
                        name: '点击量',
                        fformat: 'n0',
                        axis: 'second',
                        data: seriesData
                    }));
                }
                else if (Number(data.revenue_type) === CONSTANT.revenue_type_cpa) {
                    series.push($.extend({}, opt, {
                        aggregate: aggregate,
                        field: 'sum_cpa',
                        name: 'CPA量',
                        fformat: 'n0',
                        axis: 'second',
                        data: seriesData
                    }));
                }
            }

            $li.find('.js-chart').kendoChart({
                legend: {
                    position: 'bottom'
                },
                seriesColors: this.chartColor,
                series: series,
                valueAxis: valueAxis,
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

        // 获取广告主消耗
        _getRankReport: function () {
            var _this = this;
            var param = {
                date_type: _this.rankType
            };
            this._ajaxOpen();
            $.get(API_URL.manager_stat_sale_rank, param, function (result) {
                _this._ajaxClose();
                if (!result.res) {
                    _this._renderRankReport(result);
                }
                else {
                    Helper.fnAlert(result.msg);
                }
            }).fail(function () {
                _this._ajaxClose();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        _renderRankReport: function (oData) {
            var aData = $.isArray(oData.list) ? oData.list : [];
            var data = [];
            var tmp = null;
            var other = {category: '其他', value: 0};
            var len = aData.length;
            for (var i = 0; i < len; i++) {
                tmp = aData[i];
                if (i < 6 && (+tmp.sum_revenue > 0)) {
                    data.push({
                        category: tmp.app_name,
                        value: +tmp.sum_revenue
                    });
                }
                else {
                    other.value += (+tmp.sum_revenue);
                }
            }
            if (other.value > 0) {
                data.push(other);
            }
            this._genPieChart($('#pie-chart-wrapper'), data, '暂无广告主消耗数据');
            this._genTable(aData);
        },

        _genPieChart: function ($ele, data, nonoMsg) {
            if (data.length === 0) {
                $ele.html(nonoMsg);
                return;
            }
            $ele.kendoChart({
                legend: {
                    position: 'bottom'
                },
                seriesColors: this.pieChartColor,
                seriesDefaults: {
                    labels: {
                        template: '#= category # - #= kendo.format("{0:P2}", percentage)#',
                        position: 'outsideEnd',
                        visible: true,
                        background: 'transparent'
                    }
                },
                series: [{
                    type: 'pie',
                    overlay: {
                        gradient: 'none'
                    },
                    border: {
                        width: 0
                    },
                    data: data
                }],
                tooltip: {
                    visible: true,
                    background: '#fff',
                    color: '#000',
                    padding: 5,
                    border: {
                        width: 2
                    },
                    template: '#= category # - #= kendo.format("{0:P2}", percentage) # (#= kendo.format("{0:n2}", value) #)'
                }
            });
        },

        _genTable: function (aData) {
            if (aData.length > 10) {
                aData = aData.slice(0, 10);
            }
            if (this.table) {
                this.table.destroy();
                $('#rank-table-wrapper').empty();
            }
            /* eslint new-cap: [2, {"capIsNewExceptions": ["DataTable"]}] */
            this.table = $('#rank-table-wrapper').DataTable({
                data: aData,
                paging: false,
                searching: false,
                ordering: false,
                info: false,
                fixedHeader: false,
                columns: [
                    {title: '排行', data: 'ranking'},
                    {title: '广告名称', data: 'app_name'},
                    {title: '消耗（元）', data: 'sum_revenue', render: function (value) {
                        return kendo.toString(+value, 'n2');
                    }},
                    {title: '毛利', data: 'profit', render: function (value) {
                        return kendo.toString(+value, 'n2');
                    }},
                    {title: '展示量', data: 'sum_views', render: function (value) {
                        return kendo.toString(+value, 'n0');
                    }},
                    {title: '下载量', data: 'sum_clicks', render: function (value) {
                        return kendo.toString(+value, 'n0');
                    }},
                    {title: '点击量', data: 'sum_cpc_clicks', render: function (value) {
                        return kendo.toString(+value, 'n0');
                    }},
                    {title: 'CPA量', data: 'sum_cpa', render: function (value) {
                        return kendo.toString(+value, 'n0');
                    }},
                    {title: '名次变化', data: 'ranking'}
                ],

                columnDefs: [{
                    targets: 0,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(row + 1);
                    }
                }, {
                    targets: 8,
                    createdCell: function (td, cellData, rowData, row, col) {
                        if (cellData > 0) {
                            $(td).html('<span class="text-danger">↑</span>');
                        }
                        else if (cellData < 0) {
                            $(td).html('<span class="text-success">↓</span>');
                        }
                        else {
                            $(td).html('-');
                        }
                    }
                }]
            });
        },

        _renderFastSelectDay: function ($ele) {
            $ele.siblings().removeClass('cur');
            $ele.addClass('cur');
        },

        // 初始化函数
        fnInit: function () {
            var _this = this;
            this._getTrendReport();
            this._getRankReport();

            $('#select-camp').multiselect({
                selectedClass: 'multiselect-selected',
                buttonWidth: '80px',
                maxHeight: 300,
                dropRight: true,
                enableFiltering: true,
                filterPlaceholder: '搜索',
                buttonText: function (options, select) {
                    return '筛选';
                },
                onChange: function (option, checked) {
                    _this._changeOption();
                }
            });

            $('#select-camp').on('change', function () {
                _this.selectedAd = $(this).val();
                _this._renderChart();
            });

            $('#select-trend-type').on('change', function () {
                _this.trendType = $(this).val();
                $('#overview-chart-wripper').html('');
                _this._getTrendReport();
            });

            $('#chart-rank-header').on('click', '[data-day-type]', function () {
                var $ele = $(this);
                _this.rankType = $ele.attr('data-day-type');
                _this._renderFastSelectDay($ele);
                _this._getRankReport();
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
