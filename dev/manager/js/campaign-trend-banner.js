/**
 * @file campaign-trend-report.js
 * @description 广告趋势
 * @author songxing
 */
/* eslint no-unused-vars: [0]*/
var TrendBanner = (function ($) {
    var TrendBanner = function (data) {
        this.initFlag = false; // 是否初始化
        this.date = {}; // 30起止时间
        this.trendData = {}; // 缓存数据变量
        this.renderList = []; // 未初始化时，待渲染队列
    };

    TrendBanner.prototype = {
        chartColor: [
            '#0070c1',
            '#ffc100',
            '#00b1f1',
            '#7030a1',
            '#00b150',
            '#7e6000',
            '#93d150'
        ],
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
            visible: false
        },

        // 获取30天趋势数据
        getBannerTrend: function (bannerid) {
            var _this = this;
            var param = {
                bannerid: bannerid
            };
            // 判断趋势数据是否已经缓存
            if (this.trendData[bannerid]) {
                this._renderTrendBanner(bannerid);
            }
            else {
                $.get(API_URL.manager_banner_trend, param, function (result) {
                    if (!result.res) {
                        // 记录起止日期
                        if (!_this.date.start) {
                            _this.date.start = result.obj.start;
                            _this.date.end = result.obj.end;
                        }
                        var trendData = result.list ? result.list : {summary: []};
                        // 缓存数据
                        _this.trendData[bannerid] = trendData;
                        _this._renderTrendBanner(bannerid);
                    }
                });
            }
        },

        // 在表格中渲染30天趋势
        _renderTrendBanner: function (bannerid) {
            // 判断kendo插件是否加载完成，未初始化时，进入待渲染队列
            if (!this.initFlag) {
                // 判断待渲染队列中是否已经存在该值
                if ($.inArray(bannerid, this.renderList) < 0) {
                    // 进入待渲染队列
                    this.renderList.push(bannerid);
                }
                return;
            }
            // 获取chart容器
            var $ele = $('#js-affset-modal [data-type="trend-report"][data-bannerid="' + bannerid + '"]');
            // 判断容器是否存在，以及容器是否已经渲染
            if ($ele.length < 1 || $ele.hasClass('trend-done')) {
                return;
            }
            var data = this.trendData[bannerid];
            var initData = [
                {date: this.date.start},
                {date: this.date.end}
            ];
            var seriesBase = this.series;

            var valueAxis = {
                labels: {
                    format: '{0:n2}'
                },
                line: {
                    visible: false
                },
                majorGridLines: {
                    visible: false
                },
                minorTicks: {
                    visible: false
                },
                visible: false
            };

            var categoryAxis = this.categoryAxis;

            var series = [];
            series.push($.extend({}, seriesBase, {
                aggregate: this._aggregate,
                field: 'revenue',
                name: '总数',
                data: [].concat(data.summary, initData)
            }));

            $ele.addClass('trend-done').kendoChart({
                legend: {
                    visible: false
                },
                seriesColors: this.chartColor,
                series: series,
                valueAxis: valueAxis,
                categoryAxis: categoryAxis
            });
            window.affsetTb.columns.adjust();
        },

        _openTrendDetailPanel: function ($ele) {
            var _this = this;
            // 获取campaign数据
            var campaignData = window.oRowData;
            // banner数据
            var data = window.affsetTb.row($ele.parent()).data();
            var bannerid = data.bannerid;
            // 构建header 结构
            var html = (campaignData.icon && campaignData.products_type === CONSTANT.products_type_package ? '<img src="' + campaignData.icon + '" class="trend-header-img">' : '')
                + '<span class="trend-header-name">' + campaignData.appinfos_app_name + '，在' + data.brief_name + '（媒介：' + data.creator_name + '）投放趋势</span>'
                + '<a class="trend-header-link" target="_blank" href="../stat/index.html#dayType=5&role=clients&audit=0&id=' + campaignData.campaignid + '&name=' + escape(campaignData.appinfos_app_name) + '">报表详情</a>';
            $('#trend-banner-header').html(html);
            // 清空body内容
            $('#trend-banner-body').html('');
            // 显示模态框，待动画执行完成后，渲染chart表
            $('#trend-banner-detail-panel').modal('show').off('shown.bs.modal').on('shown.bs.modal', function () {
                _this._renderTrendChart(bannerid);
                bannerid = null;
                _this = null;
            });
        },

        _aggregate: function (newItems, obj, items) {
            var value = 0;
            var tmp = null;
            for (var i = 0; i < items.length; i++) {
                tmp = items[i];
                if (tmp.revenue) {
                    value += Number(tmp.revenue);
                }
            }
            return value;
        },

        _renderTrendChart: function (bannerid) {
            var series = [];
            var data = this.trendData[bannerid];
            var seriesBase = this.series;
            var initData = [
                {date: this.date.start},
                {date: this.date.end}
            ];
            series.push($.extend({}, seriesBase, {
                aggregate: this._aggregate,
                field: 'revenue',
                name: '总数',
                fformat: 'n2',
                data: [].concat(data.summary, initData)
            }));
            var tmp = null;
            if ($.isArray(data.data)) {
                var len = data.data.length;
                var end = len > 5 ? 5 : len;
                for (var i = 0; i < end; i++) {
                    tmp = data.data[i];
                    series.push($.extend({}, seriesBase, {
                        aggregate: this.aggregate,
                        field: 'revenue',
                        name: tmp.zonename,
                        fformat: 'n2',
                        data: [].concat(tmp.child, initData)
                    }));
                }
            }

            $('#trend-banner-body').kendoChart({
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

        init: function () {
            this.initFlag = true;
            var _this = this;
            var list = this.renderList;
            // 待渲染队列依次出队执行
            while (list.length > 0) {
                var item = list.shift();
                this._renderTrendBanner(item);
            }

            // 30天消耗趋势点击事件
            $('#js-affset-modal').on('click', '.trend-done', function () {
                _this._openTrendDetailPanel($(this));
            });
        }
    };
    return new TrendBanner();
})(jQuery);
