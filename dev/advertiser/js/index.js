/**
 * @file index.js
 * @description 推广概览
 * @author xiaokl songxing
 */
var ExtensionOverview = (function ($) {
    var ExtensionOverview = function () {
        this.oOverviewData = null;
        this.color = ['#ed7c30', '#5a9bd5'];
    };

    ExtensionOverview.prototype = $.extend(ExtensionOverview.prototype, {
        // 获取概况报表信息
        _getData: function () {
            var _this = this;
            $.get(API_URL.stat_report, function (result) {
                if (!result.res) {
                    _this.oOverviewData = result;
                    _this._renderOverview();
                    Helper.close_ajax();
                }
                else {
                    _this.oOverviewData = null;
                    Helper.close_ajax();
                    Helper.fnAlert(result.msg);
                }
            }).fail(function () {
                _this.oOverviewData = null;
                Helper.close_ajax();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        // 构造报表
        _genLi: function (oData, itemKey) {
            var name = '';
            var color = '';
            switch (itemKey) {
                case 'sum_revenue':
                    name = '消耗';
                    color = this.color[0];
                    break;
                case 'sum_clicks':
                    name = oData.type === 0 ? '下载量' : '点击量';
                    color = this.color[1];
                    break;
                default:
                    itemKey = 'sum_revenue';
                    color = this.color[0];
                    name = '消耗';
                    break;
            }
            var oSeries = {
                type: 'line',
                field: itemKey,
                name: name,
                oData: oData,
                color: color,
                aggregate: 'sum',
                categoryField: 'time',
                markers: {
                    visible: false
                }
            };
            oData.itemKey = itemKey;
            var $li = $($.tmpl('#tpl-chart-wirpper', oData));
            $li.append(this._genChart(oData, oSeries));
            $('#overview-chart-wripper').append($li);
        },

        // 渲染报表
        _genChart: function (oData, oSeries) {
            var aSeries = [oSeries];
            var dataSource = new kendo.data.DataSource({
                data: oData.data,
                schema: {
                    model: {
                        fields: {
                            time: {
                                type: 'date'
                            },
                            sum_views: {
                                type: 'number'
                            },
                            sum_clicks: {
                                type: 'number'
                            },
                            sum_revenue: {
                                type: 'number'
                            }
                        }
                    }
                }
            });
            var chart = $('<div class="chart" style="height:300px;"></div>').kendoChart({
                dataSource: dataSource,
                series: aSeries,
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    visible: true,
                    background: 'grba(0,0,0,0)',
                    border: {
                        width: 0
                    },
                    template: kendo.template($('#tpl-chart-tooltip').html())
                },
                valueAxis: {
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
                }
            });
            return chart;
        },

        // 显示报表
        _renderOverview: function () {
            var dataObj = this.oOverviewData;
            if (!dataObj) {
                return;
            }

            var aData = $.isArray(dataObj.list) ? dataObj.list : [];
            var tmp = null;
            for (var i = 0, l = aData.length; i < l; i++) {
                tmp = aData[i];
                this._genLi(tmp, 'sum_revenue');
                this._genLi(tmp, 'sum_clicks');
            }
            this._refreshChart();
        },
        // resize表格
        _refreshChart: function () {
            $('#overview-chart-wripper .chart').each(function () {
                $(this).data('kendoChart').resize();
            });
        },

        // 显示账户明细余额
        _renderBlance: function () {
            $.get(API_URL.balance_value, function (json) {
                $('.js-overall').html($.tmpl('#tpl-overall', json));
            }, 'json').fail(function () {
                $('.js-overall').html($.tmpl('#tpl-overall', null));
            });
        },

        // 初始化函数
        fnInit: function () {
            this._renderBlance();
            this._getData();
            $(window).resize(function (event) {
                /* Act on the event */
                $('#overview-chart-wripper .chart').each(function () {
                    $(this).data('kendoChart').resize();
                });
            });
        }
    });

    return new ExtensionOverview();
})(jQuery);

/**
*   页面入口
*/
$(function () {
    var url = '../js/plugins/kendo.dataviz.min.js';
    try {
        url = __uri('../js/plugins/kendo.dataviz.min.js');
    }
    catch (e) {}
    Helper.fnLoadScript(url, function () {
        ExtensionOverview.fnInit();
    });
});
