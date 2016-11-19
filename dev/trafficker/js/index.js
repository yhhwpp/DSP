/**
 * @file index.js
 * @description 运营概览
 * @author xiaokl songxing
 */
var Overview = (function ($) {
    var Overview = function () {
        this.lineChartColor = '#5a9bd5';
        this.pieChartColor = ['#44cef6', '#70f3ff', '#FFc64b', '#fff143', '#9ed900', '#bddd22', '#ff461f'];
        this.zoneDayType = '5';  // 1:本周，2：上周，3：本月，4：上月，5：累计
        this.clientDayType = '5'; // 1:本周，2：上周，3：本月，4：上月，5：累计
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
        _getReport: function () {
            var _this = this;
            this._ajaxOpen();
            $.get(API_URL.trafficker_stat_report, function (result) {
                if (!result.res) {
                    _this._renderReport(result);
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

        // 获取广告位
        _getZoneReport: function () {
            var _this = this;
            var param = {
                date_type: _this.zoneDayType
            };
            this._ajaxOpen();
            $.get(API_URL.trafficker_stat_zone_report, param, function (result) {
                if (!result.res) {
                    _this._renderZoneReport(result);
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

        // 获取广告主消耗
        _getClientReport: function () {
            var _this = this;
            var param = {
                date_type: _this.clientDayType
            };
            this._ajaxOpen();
            $.get(API_URL.trafficker_stat_client_report, param, function (result) {
                if (!result.res) {
                    _this._renderClientReport(result);
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

        _renderClientReport: function (oData) {
            var aData = $.isArray(oData.list) ? oData.list : [];
            var data = [];
            var tmp = null;
            for (var i = 0, l = aData.length; i < l; i++) {
                tmp = aData[i];
                data.push({
                    category: tmp.client_name,
                    value: +tmp.sum_revenue
                });
            }
            this._genPieChart($('#chart-client'), data, '暂无广告主消耗数据');
        },

        _renderZoneReport: function (oData) {
            var aData = $.isArray(oData.list) ? oData.list : [];
            var data = [];
            var tmp = null;
            for (var i = 0, l = aData.length; i < l; i++) {
                tmp = aData[i];
                data.push({
                    category: tmp.zone_name,
                    value: +tmp.sum_revenue
                });
            }
            this._genPieChart($('#chart-zone'), data, '暂无广告位收入数据');
        },

        // 渲染30天收入概览报表
        _renderReport: function (oData) {
            var aData = $.isArray(oData.list) ? oData.list : [];
            var oSeries = {
                type: 'line',
                field: 'revenue',
                color: this.lineChartColor,
                aggregate: 'sum',
                data: aData,
                categoryField: 'time',
                missingValues: 'zero',
                markers: {
                    visible: false
                }
            };
            $('#chart-30-days').kendoChart({
                series: [oSeries],
                tooltip: {
                    visible: true,
                    background: 'grba(0,0,0,0)',
                    border: {
                        width: 0
                    },
                    template: kendo.template($('#tpl-line-chart-tooltip').html())
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
                }
            });
        },

        _renderFastSelectDay: function ($ele) {
            $ele.siblings().removeClass('cur');
            $ele.addClass('cur');
        },

        // 初始化函数
        fnInit: function () {
            var _this = this;
            this._getReport();
            this._getZoneReport();
            this._getClientReport();

            $('#chart-zone-header').on('click', '[data-day-type]', function () {
                var $ele = $(this);
                _this.zoneDayType = $ele.attr('data-day-type');
                _this._renderFastSelectDay($ele);
                _this._getZoneReport();
            });

            $('#chart-client-header').on('click', '[data-day-type]', function () {
                var $ele = $(this);
                _this.clientDayType = $ele.attr('data-day-type');
                _this._renderFastSelectDay($ele);
                _this._getClientReport();
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
    var url = '../js/plugins/kendo.dataviz.min.js';
    try {
        url = __uri('../js/plugins/kendo.dataviz.min.js');
    }
    catch (e) {}
    Helper.fnLoadScript(url, function () {
        Overview.fnInit();
    });
});
