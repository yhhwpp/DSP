/**
 * @file stat_index.js
 * @author songxing
 */
var Campaigns = (function ($) {
    var Campaigns = function () {
        this.isInit = false; // 是否初始化
        this.productType = '0'; // 0:安装包下载，1：链接推广
        this.dataList = []; // 报表原始数据
        this.itemType = ['sum_clicks', 'sum_revenue']; // 显示数据字段选择
        this.categoriesType = 2; // 横轴坐标类型1:小时   //2:天  //3:月
        this.chartCategories = []; // 横轴坐标
        this.dayType = 5; // 默认显示最近7天，1:今天；2：昨天；3：前一天；4：后一天；5：最近七天；6：上周；7：本月；8：历史12月；9：select
        this.dateRenge = { // 报表查询时间
            from: '2015-09-01',
            to: '2015-09-03'
        };
        this.adPlanList = {}; // 所有的计划
        this.adProductList = {}; // 所有的广告
        this.adPlanId = '0'; // 选择的计划
        this.adProductId = '0'; // 选择的广告
        this.dataObj = {}; // 按时间对数据进行格式化
        this.chartShowData = [];
        this.showSelectAds = {}; // 广告列表
        this.chartSeriesItem = {
            0: {
                sum_views: {
                    name: '展示量'
                },
                sum_clicks: {
                    name: '下载量'
                },
                sum_revenue: {
                    name: '支出'
                },
                download_rate: {
                    name: '下载转化率'
                },
                download_price: {
                    name: '下载均价'
                }
            },
            1: {
                sum_views: {
                    name: '展示量'
                },
                sum_cpc_clicks: {
                    name: '点击量'
                },
                click_rate: {
                    name: '点击转化率'
                },
                sum_revenue: {
                    name: '支出'
                },
                download_price: {
                    name: '平均单价'
                }
            }
        };
        this.seriesDataSource = null;

        this.chartSeriesItemInit = false;

        this.oRenderChart = null;

        // 报表信息
        this.oGridInfo = {
            // 报表原始数据
            aRawData: [],
            // 报表显示的数据
            aShowData: [],
            // 汇总数据
            oSummary: {},
            // 分页事件
            pagerEvent: false,
            // 分页信息
            oPageInfo: {
                currentPage: 1,
                totalPage: 1,
                totalNO: 0,
                pageSize: 25
            }
        };
        // 报表对象
        this.oRenderGrid = null;
        this.oRenderDayGrid = null;
        // 默认最多显示多少个广告
        this.defaultLength = 6;

        // 表格类型
        this.tableType = 'time';
        this.summaryData = [];
        this.summaryField = [
            {field: 'sum_views', aggregate: 'sum', format: 'n0'},
            {field: 'sum_cpc_clicks', aggregate: 'sum', format: 'n0'},
            {field: 'sum_clicks', aggregate: 'sum', format: 'n0'},
            {field: 'sum_revenue', aggregate: 'sum', format: 'n2'}
        ];
    };

    Campaigns.prototype = {
        // 获取基础数据
        _getData: function () {
            var _this = this;
            var param = {
                period_start: _this.dateRenge.from,
                period_end: _this.dateRenge.to,
                span: _this.categoriesType,
                type: _this.productType,
                zone_offset: '-8'
            };
            if (this.isInit) {
                Helper.load_ajax();
            }
            else {
                this.isInit = true;
            }
            $.get(API_URL.advertiser_stat_index, param, function (result) {
                Helper.close_ajax();
                if (!result.res) {
                    _this.dataList = $.isArray(result.list.statChart) ? result.list.statChart : [];
                    _this.oGridInfo.aRawData = $.isArray(result.list.statData) ? result.list.statData : [];
                    _this.oGridInfo.oSummary = result.obj ? result.obj : {};
                    _this._getCategories();
                    _this._screenData();
                    $('#select-adv').trigger('change');
                }
                else {
                    Helper.fnAlert(result.msg);
                }
            }).fail(function () {
                Helper.close_ajax();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },
        // 获取横轴坐标系
        _getCategories: function () {
            var dateRenge = this.dateRenge;
            if (this.categoriesType === 2) {
                this.chartCategories = Helper.fnDateScope(dateRenge.from, dateRenge.to);
            }
            else if (this.categoriesType === 3) {
                this.chartCategories = Helper.fnMonthScope(dateRenge.from, dateRenge.to);
            }

        },
        // 创建字段选择框
        _renderSelectItem: function () {
            var chartSeriesItem = this.chartSeriesItem[this.productType];
            var html = '';
            var len = this.itemType.length;
            for (var key in chartSeriesItem) {
                var tmp = chartSeriesItem[key];
                if ($.inArray(key, this.itemType) >= 0) {
                    if (len === 1) {
                        html += '<option value="' + key + '" selected disabled>' + tmp.name + '</option>';
                    }
                    else {
                        html += '<option value="' + key + '" selected>' + tmp.name + '</option>';
                    }
                }
                else {
                    if (len === 2) {
                        html += '<option value="' + key + '" disabled>' + tmp.name + '</option>';
                    }
                    else {
                        html += '<option value="' + key + '">' + tmp.name + '</option>';
                    }
                }
            }
            $('#select-item-type').attr('multiple', 'multiple').html(html);
            if (!this.chartSeriesItemInit) {
                $('#select-item-type').selectpicker({
                    iconBase: '',
                    tickIcon: '',
                    noneSelectedText: '请选择',
                    maxOptions: 2,
                    maxOptionsText: ['超出限制 (最多选择{n}项)', '组选择超出限制(最多选择{n}组)']
                });
                this.chartSeriesItemInit = true;
            }
            else {
                $('#select-item-type').selectpicker('refresh');
            }
        },
        // 创建产品选择框
        _renderSelectPlan: function () {
            var html = '<option value="0">推广产品</option>';
            for (var key in this.adPlanList) {
                var tmp = this.adPlanList[key];
                if (key === this.adPlanId) {
                    html += '<option value="' + key + '" selected>' + tmp.product_name + '</option>';
                }
                else {
                    html += '<option value="' + key + '">' + tmp.product_name + '</option>';
                }
            }
            $('#select-plan').html(html);
            this.adPlanId = $('#select-plan').val();
        },
        // 创建广告选择框
        _renderSelectAd: function () {
            var html = '<option value="0">所有广告</option>';
            var adProductList = {};
            if (this.adPlanId === '0') {
                adProductList = this.adProductList;
            }
            else {
                var pList = this.adPlanList[this.adPlanId].adListObj;
                for (var k in pList) {
                    adProductList[k] = {
                        id: pList[k].id,
                        name: pList[k].name
                    };
                }
            }
            this.showSelectAds = adProductList;
            for (var key in adProductList) {
                var tmp = adProductList[key];
                if (key === this.adProductId) {
                    html += '<option value="' + key + '" selected>' + tmp.name + '</option>';
                }
                else {
                    html += '<option value="' + key + '">' + tmp.name + '</option>';
                }
            }
            $('#select-adv').html(html);
            this.adProductId = $('#select-adv').val();
        },
        // 更改广告选择处理函数
        _changeSelectAd: function () {
            var val = $('#select-adv').val();
            this.adProductId = val;
            this._getSeries();
            this._showGrid();
        },
        // 更改产品选择处理函数
        _changeSelectPlan: function () {
            var val = $('#select-plan').val();
            this.adPlanId = val;
            this.adProductId = '0';
            this._renderSelectAd();
            $('#select-adv').trigger('change');
        },
        // 更改字段选择处理函数
        _changeItem: function () {
            var val = [];
            var $this = $('#select-item-type');
            var ele = $this.find('option:selected');
            var len = ele.length;
            if (len === 1) {
                $this.find('option').removeAttr('disabled');
                ele.attr('disabled', 'disabled');
                $this.selectpicker('refresh');
            }
            else if (len === 2) {
                $this.find('option').attr('disabled', 'disabled');
                ele.removeAttr('disabled');
                $this.selectpicker('refresh');
            }
            $this.find('option:selected').each(function () {
                val.push($(this).attr('value'));
            });
            this.itemType = val != null ? val : [];
            this._renderCharts();
        },
        // 原始数据汇总处理
        _screenData: function () {
            var dataList = this.dataList;
            var adPlanList = {};
            var adProductList = {};
            var dataObj = {};

            for (var i = 0, l = dataList.length; i < l; i++) {
                var tmp = dataList[i];
                if (this.categoriesType === 2) {
                    tmp.time = Date.parse(tmp.time).toString('yyyy-MM-dd');
                }
                else {
                    tmp.time = Date.parse(tmp.time).toString('yyyy-MM') + '-01';
                }

                if (!dataObj[tmp.time]) {
                    dataObj[tmp.time] = {};
                }

                if (!dataObj[tmp.time][tmp.id]) {
                    dataObj[tmp.time][tmp.id] = tmp;
                }
                else {
                    dataObj[tmp.time][tmp.id].sum_views = Number(dataObj[tmp.time][tmp.id].sum_views) + Number(tmp.sum_views);
                    dataObj[tmp.time][tmp.id].sum_clicks = Number(dataObj[tmp.time][tmp.id].sum_clicks) + Number(tmp.sum_clicks);
                    dataObj[tmp.time][tmp.id].sum_cpc_clicks = Number(dataObj[tmp.time][tmp.id].sum_cpc_clicks) + Number(tmp.sum_cpc_clicks);
                    dataObj[tmp.time][tmp.id].sum_revenue = Number(dataObj[tmp.time][tmp.id].sum_revenue) + Number(tmp.sum_revenue);
                }
                if (!adPlanList[tmp.product_id]) {
                    adPlanList[tmp.product_id] = {
                        product_id: tmp.product_id,
                        product_name: tmp.product_name,
                        adListObj: {}
                    };
                }

                if (!adPlanList[tmp.product_id].adListObj[tmp.id]) {
                    adPlanList[tmp.product_id].adListObj[tmp.id] = {
                        id: tmp.id,
                        name: tmp.name
                    };
                }

                if (!adProductList[tmp.id]) {
                    adProductList[tmp.id] = {
                        id: tmp.id,
                        name: tmp.name
                    };
                }

            }
            this.adPlanList = adPlanList;
            this.adProductList = adProductList;
            this.dataObj = dataObj;
            this._renderSelectItem();
            this._renderSelectPlan();
            this._renderSelectAd();
        },
        // 图表显示数据格式化
        _getSeries: function () {
            var dataObj = this.dataObj;
            var chartCategories = this.chartCategories;
            var showSelectAds = this.showSelectAds;
            var obj = {
                name: '空',
                sum_views: 0,
                sum_clicks: 0,
                sum_cpc_clicks: 0,
                click_rate: 0,
                sum_revenue: 0,
                download_rate: 0,
                download_price: 0
            };
            var dataList = [];
            var download_rate = 0;
            var download_price = 0;
            var click_rate = 0;
            var tmpDate = '';
            var tmp1 = {};
            if (this.adProductId === '0') {
                for (var i = 0, l = chartCategories.length; i < l; i++) {
                    tmpDate = chartCategories[i];
                    var hasProp = false;
                    for (var key in showSelectAds) {
                        hasProp = true;
                        download_rate = 0;
                        download_price = 0;
                        click_rate = 0;
                        if (dataObj[tmpDate] && dataObj[tmpDate][key]) {
                            tmp1 = dataObj[tmpDate][key];
                            if (tmp1.sum_views > 0) {
                                download_rate = (tmp1.sum_clicks / tmp1.sum_views).toFixed(4);
                                click_rate = (tmp1.sum_cpc_clicks / tmp1.sum_views).toFixed(4);
                            }

                            if (this.productType === '0' && tmp1.sum_clicks > 0) {
                                download_price = (tmp1.sum_revenue / tmp1.sum_clicks).toFixed(2);
                            }
                            else if (this.productType === '1' && tmp1.sum_cpc_clicks > 0) {
                                download_price = (tmp1.sum_revenue / tmp1.sum_cpc_clicks).toFixed(2);
                            }

                            dataList.push($.extend({
                                download_rate: download_rate,
                                download_price: download_price,
                                click_rate: click_rate
                            }, dataObj[tmpDate][key]));
                        }
                        else {
                            dataList.push($.extend({
                                time: tmpDate
                            }, obj, showSelectAds[key]));
                        }
                    }
                    if (!hasProp) {
                        dataList.push($.extend({
                            time: tmpDate
                        }, obj));
                    }

                }
            }
            else {
                var productInfo = showSelectAds[this.adProductId] ? showSelectAds[this.adProductId] : {};
                for (var j = 0, ll = chartCategories.length; j < ll; j++) {
                    tmpDate = chartCategories[j];
                    if (dataObj[tmpDate] && dataObj[tmpDate][this.adProductId]) {
                        tmp1 = dataObj[tmpDate][this.adProductId];
                        download_rate = 0;
                        download_price = 0;
                        click_rate = 0;
                        if (tmp1.sum_views > 0) {
                            download_rate = (tmp1.sum_clicks / tmp1.sum_views).toFixed(4);
                            click_rate = (tmp1.sum_cpc_clicks / tmp1.sum_views).toFixed(4);
                        }

                        if (this.productType === '0' && tmp1.sum_clicks > 0) {
                            download_price = (tmp1.sum_revenue / tmp1.sum_clicks).toFixed(2);
                        }
                        else if (this.productType === '1' && tmp1.sum_cpc_clicks > 0) {
                            download_price = (tmp1.sum_revenue / tmp1.sum_cpc_clicks).toFixed(2);
                        }

                        dataList.push($.extend({
                            download_rate: download_rate,
                            download_price: download_price,
                            click_rate: click_rate
                        }, dataObj[tmpDate][this.adProductId]));
                    }
                    else {
                        dataList.push($.extend({
                            time: tmpDate
                        }, obj, productInfo));
                    }
                }
            }
            this.chartShowData = dataList;
            this._renderCharts();
            this._renderDaysTable();
        },

        // 创建图表chart
        _renderCharts: function () {
            // 数据对象格式化
            var dataList = this.chartShowData;
            var _this = this;
            var schema = {
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
                        sum_cpc_clicks: {
                            type: 'number'
                        },
                        sum_revenue: {
                            type: 'number'
                        },
                        download_rate: {
                            type: 'number'
                        },
                        click_rate: {
                            type: 'number'
                        },
                        download_price: {
                            type: 'number'
                        }
                    }
                }
            };
            var seriesDataSource = new kendo.data.DataSource({
                data: dataList,
                group: [
                    // group by "time" and then by "id"
                    {field: 'time', dir: 'asc'},
                    {
                        field: 'id',
                        aggregates: [
                            {field: 'sum_views', aggregate: 'sum'},
                            {field: 'sum_revenue', aggregate: 'sum'},
                            {field: 'sum_clicks', aggregate: 'sum'},
                            {field: 'sum_cpc_clicks', aggregate: 'sum'}
                        ]
                    }
                ]
            });
            seriesDataSource.read();
            this.seriesDataSource = seriesDataSource;

            var stocksDataSource = new kendo.data.DataSource({
                data: dataList,
                group: {
                    field: 'id',
                    aggregates: [
                        {field: 'sum_clicks', aggregate: 'sum'},
                        {field: 'sum_cpc_clicks', aggregate: 'sum'}
                    ]
                },

                sort: {
                    field: 'time',
                    dir: 'asc'
                },
                schema: schema
            });

            stocksDataSource.read();
            var view = stocksDataSource.view();
            if (this.productType === '0') {
                view.sort(function (a, b) {
                    return b.aggregates.sum_clicks.sum - a.aggregates.sum_clicks.sum;
                });
            }
            else {
                view.sort(function (a, b) {
                    return b.aggregates.sum_cpc_clicks.sum - a.aggregates.sum_cpc_clicks.sum;
                });
            }

            if (this.oRenderChart) {
                this.oRenderChart.destroy();
                $('#chart').html('');
            }

            var aggregateFunc = function (values, series, dataItems, category) {
                var summary = {
                    sum_views: 0,
                    sum_clicks: 0,
                    sum_cpc_clicks: 0,
                    sum_revenue: 0,
                    click_rate: 0,
                    download_rate: 0,
                    download_price: 0
                };
                var tmp = null;
                for (var i = 0, l = dataItems.length; i < l; i++) {
                    tmp = dataItems[i];
                    summary.sum_views += Number(tmp.sum_views);
                    summary.sum_clicks += Number(tmp.sum_clicks);
                    summary.sum_cpc_clicks += Number(tmp.sum_cpc_clicks);
                    summary.sum_revenue += Number(tmp.sum_revenue);
                }
                if (summary.sum_views > 0) {
                    summary.download_rate = (summary.sum_clicks / summary.sum_views);
                    summary.click_rate = (summary.sum_cpc_clicks / summary.sum_views);
                }

                if (_this.productType === '0' && summary.sum_clicks > 0) {
                    summary.download_price = (summary.sum_revenue / summary.sum_clicks);
                }
                else if (_this.productType === '1' && summary.sum_cpc_clicks > 0) {
                    summary.download_price = (summary.sum_revenue / summary.sum_cpc_clicks);
                }
                return summary[series.field];
            };

            var categoryAxis = {
                name: 'category',
                type: 'date',
                labels: {
                    format: '{0:MM月dd日}',
                    rotation: -50
                },
                crosshair: {
                    tooltip: {
                        format: '{0:MM月dd日}',
                        border: {
                            width: 1
                        },
                        visible: true
                    },
                    visible: true
                },
                majorGridLines: {
                    step: 1
                },
                maxDateGroups: 100,
                baseUnitStep: 'auto',
                autoBaseUnitSteps: {
                    days: [1, 2, 3]
                },
                axisCrossingValues: [0, 1000]
            };
            if (this.categoriesType === 3) {
                categoryAxis.labels.format = '{0:MM月}';
                categoryAxis.crosshair.tooltip.format = '{0:MM月}';
            }
            var cl = this.chartCategories.length;
            if (cl > 86) {
                categoryAxis.labels.step = 5;
                categoryAxis.majorGridLines.step = 5;
            }
            else if (cl > 66) {
                categoryAxis.labels.step = 4;
                categoryAxis.majorGridLines.step = 4;
            }
            else if (cl > 44) {
                categoryAxis.labels.step = 3;
                categoryAxis.majorGridLines.step = 3;
            }
            else if (cl > 22) {
                categoryAxis.labels.step = 2;
                categoryAxis.majorGridLines.step = 2;
            }

            var itemType = this.itemType;
            var len = itemType.length;
            if (len < 1) {
                if (this.productType === '0') {
                    itemType = ['sum_clicks', 'sum_revenue'];
                }
                else {
                    itemType = ['sum_cpc_clicks', 'sum_revenue'];
                }
                this.itemType = itemType;
                len = itemType.length;
            }
            len = len > 2 ? 2 : len;

            var series = [];
            var valueAxis = [];
            var tmp = '';
            var fieldName = '';
            var axis = '';
            var format = '';
            var stack = '';
            var type = 'column';
            var tmpData = '';
            for (var i = 0; i < len; i++) {
                tmp = itemType[i];
                stack = tmp;
                axis = 'number';
                format = '{0:n0}';
                switch (tmp) {
                    case 'sum_views':
                        fieldName = '展示量';
                        break;
                    case 'sum_clicks':
                        fieldName = '下载量';
                        break;
                    case 'sum_cpc_clicks':
                        fieldName = '点击量';
                        break;
                    case 'sum_revenue':
                        fieldName = '支出';
                        format = '{0:n2}';
                        break;
                    case 'download_rate':
                        fieldName = '下载转化率';
                        type = 'line';
                        stack = false;
                        format = '{0:p2}';
                        break;
                    case 'click_rate':
                        type = 'line';
                        stack = false;
                        fieldName = '点击转化率';
                        format = '{0:p2}';
                        break;
                    case 'download_price':
                        type = 'line';
                        stack = false;
                        fieldName = '下载均价';
                        format = '{0:n2}';
                        break;
                    default:
                        break;
                }
                if (i === 0) {
                    if (len > 1) {
                        stack = tmp;
                        type = 'column';
                    }
                    valueAxis.push({
                        name: 'number',
                        labels: {
                            format: format
                        },
                        title: {text: Helper.fnInsertString(fieldName, '\n'), rotation: 0},
                        line: {
                            visible: false
                        }
                    });
                    var ll = view.length;
                    var defaultLength = this.defaultLength;
                    var end = ll < defaultLength ? ll : defaultLength;
                    for (var ii = 0; ii < end; ii++) {
                        tmpData = view[ii].items;
                        series.push({
                            overlay: {
                                gradient: 'none'
                            },
                            border: {
                                width: 0
                            },
                            idx: i,
                            type: type,
                            field: tmp,
                            stack: stack,
                            data: tmpData,
                            fieldName: fieldName,
                            aggregate: aggregateFunc,
                            categoryField: 'time',
                            axis: axis,
                            name: tmpData[0].name
                        });
                    }
                    if (ll > defaultLength) {
                        tmpData = [];
                        for (var j = defaultLength; j < ll; j++) {
                            tmpData = tmpData.concat(view[j].items);
                        }
                        series.push({
                            overlay: {
                                gradient: 'none'
                            },
                            border: {
                                width: 0
                            },
                            idx: i,
                            type: type,
                            field: tmp,
                            stack: stack,
                            data: tmpData,
                            fieldName: fieldName,
                            aggregate: aggregateFunc,
                            categoryField: 'time',
                            axis: axis,
                            name: '其它'
                        });
                    }
                }
                else {
                    type = 'line';
                    axis = 'line';
                    valueAxis.push({
                        name: 'line',
                        labels: {
                            format: format
                        },
                        title: {text: Helper.fnInsertString(fieldName, '\n'), rotation: 0},
                        line: {
                            visible: false
                        }
                    });
                    series.push({
                        overlay: {
                            gradient: 'none'
                        },
                        color: CONSTANT.chart_line_color,
                        idx: i,
                        type: type,
                        field: tmp,
                        axis: axis,
                        aggregate: aggregateFunc,
                        data: dataList,
                        fieldName: fieldName,
                        categoryField: 'time'
                    });
                }
            }

            $('#chart').kendoChart({
                series: series,
                seriesColors: CONSTANT.chartColor,
                legend: {
                    position: 'bottom'
                },
                valueAxis: valueAxis,
                tooltip: {
                    visible: true,
                    template: kendo.template($('#tpl-chart-tooltip').html())
                    // template: '# if (data.series.name){ # #: data.series.name+"("+data.series.fieldName+")" # # } else { # #: data.series.fieldName # # } # : #: value #'
                },
                legendItemClick: function (e) {
                    _this._chartRefreshLine(e);
                },
                categoryAxis: categoryAxis
            });
            this.oRenderChart = $('#chart').data('kendoChart');
        },

        _chartRefreshLine: function (e) {
            var oRenderChart = this.oRenderChart;
            if (!oRenderChart) {
                return;
            }

            var itemType = this.itemType;
            var len = itemType.length;
            if (len < 2) {
                return;
            }

            var series = oRenderChart.options.series;
            var l = series.length;
            var last = l - 1;
            var data = [];
            var tmp = null;
            for (var i = 0; i < l; i++) {
                tmp = series[i];
                if (tmp.idx === 0) {
                    if (e.seriesIndex !== tmp.index) {
                        if (tmp.visible) {
                            Array.prototype.push.apply(data, tmp.data);
                        }
                    }
                    else {
                        if (!tmp.visible) {
                            Array.prototype.push.apply(data, tmp.data);
                        }
                    }
                }
            }
            oRenderChart.options.series[last].data = data;
            oRenderChart.redraw();
        },
        // 创建每日报表
        _renderDaysTable: function () {
            var dataList = this.chartShowData;
            var len = dataList.length;
            var pageSize = this.oGridInfo.oPageInfo.pageSize;
            var arr = [];
            var obj = {};
            var tmp = null;
            var time = null;
            for (var i = 0; i < len; i++) {
                tmp = dataList[i];
                time = tmp.time.toString('yyyy-MM-dd');
                if (!obj[time]) {
                    obj[time] = {
                        sum_views: 0,
                        sum_clicks: 0,
                        sum_cpc_clicks: 0,
                        sum_revenue: 0,
                        click_rate: 0,
                        download_rate: 0,
                        download_price: 0
                    };
                }
                obj[time].sum_views += Number(tmp.sum_views);
                obj[time].sum_clicks += Number(tmp.sum_clicks);
                obj[time].sum_cpc_clicks += Number(tmp.sum_cpc_clicks);
                obj[time].sum_revenue += Number(tmp.sum_revenue);
            }

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    tmp = obj[key];
                    if (tmp.sum_views > 0) {
                        tmp.download_rate = (tmp.sum_clicks / tmp.sum_views);
                        tmp.click_rate = (tmp.sum_cpc_clicks / tmp.sum_views);
                    }

                    if (this.productType === '0' && tmp.sum_clicks > 0) {
                        tmp.download_price = (tmp.sum_revenue / tmp.sum_clicks);
                    }
                    else if (this.productType === '1' && tmp.sum_cpc_clicks > 0) {
                        tmp.download_price = (tmp.sum_revenue / tmp.sum_cpc_clicks);
                    }
                    arr.push($.extend({time: key}, tmp));
                }
            }
            if (this.oRenderDayGrid) {
                this.oRenderDayGrid.destroy();
                $('#day-grid').html('');
            }
            var clickField = 'sum_clicks';
            var clickFieldLabel = '下载量';
            var ctrField = 'download_rate';
            var ctrFieldLabel = '下载转化率';
            var dateFormat = '{0:yyyy-MM-dd}';
            if (this.productType === '1') {
                clickField = 'sum_cpc_clicks';
                clickFieldLabel = '点击量';
                ctrField = 'click_rate';
                ctrFieldLabel = '点击转化率';
            }

            if (this.categoriesType === 3) {
                dateFormat = '{0:yyyy-MM}';
            }

            $('#day-grid').kendoGrid({
                dataSource: {
                    data: arr,
                    schema: {
                        model: {
                            fields: {
                                time: {type: 'date'}
                            }
                        }
                    },
                    sort: {field: 'time', dir: 'desc'}
                },
                serverPaging: true,
                serverSorting: true,
                sortable: true,
                pageable: {
                    pageSize: pageSize,
                    buttonCount: 5
                },
                columns: [{
                    field: 'time',
                    title: '时间',
                    format: dateFormat
                },
                {
                    field: 'sum_views',
                    title: '展示量',
                    format: '{0:n0}'

                },
                {
                    field: clickField,
                    title: clickFieldLabel,
                    format: '{0:n0}'
                },
                {
                    field: ctrField,
                    title: ctrFieldLabel,
                    format: '{0:p2}'
                },
                {
                    field: 'sum_revenue',
                    title: '投放消耗',
                    format: '{0:n2}'
                },
                {
                    field: 'download_price',
                    title: '平均单价',
                    format: '{0:n2}'
                }]
            });

            this.oRenderDayGrid = $('#day-grid').data('kendoGrid');
        },

        // 显示报表
        _showGrid: function () {
            var aGridDataObj = this.oGridInfo.aRawData;
            var arr = [];
            var tmp = {};
            if (this.adProductId === '0') {
                for (var i = 0, l = aGridDataObj.length; i < l; i++) {
                    tmp = aGridDataObj[i];
                    if (this.showSelectAds[tmp.id]) {
                        arr.push(tmp);
                    }
                }
            }
            else {
                for (var ii = 0, ll = aGridDataObj.length; ii < ll; ii++) {
                    tmp = aGridDataObj[ii];
                    if (String(tmp.id) === this.adProductId) {
                        arr.push(tmp);
                    }
                }
            }
            if (this.productType === '0') {
                arr.sort(function (a, b) {
                    return (+b.sum_clicks) - (+a.sum_clicks);
                });
            }
            else {
                arr.sort(function (a, b) {
                    return (+b.sum_cpc_clicks) - (+a.sum_cpc_clicks);
                });
            }
            // for (var j=0; j<arr.length; j++) {
            //     arr[j]._child = $.extend({}, arr[j].child);
            // }
            this.oGridInfo.aShowData = this._formatGridData(arr);
            this._renderGrid();
        },
        // 报表对象数组格式化，数据改为treelist
        _formatGridData: function (aData) {
            var arr = [];
            for (var i = 0, l = aData.length; i < l; i++) {
                var tmp = aData[i];
                var o = $.extend({
                    parentId: null
                }, tmp);
                o.channel = '';
                delete o.child;
                arr.push(o);
                for (var ii in tmp.child) {
                    var id = Math.random();
                    arr.push($.extend({}, tmp.child[ii], {
                        parentId: tmp.id,
                        id: id
                    }));
                }
            }
            return arr;
        },
        // 重置分页信息
        _resetPage: function (data) {
            var aShowData = data ? data : this.oGridInfo.aShowData;
            var pageSize = +$('#select-grid-pagesize').val();
            var len = aShowData.length;
            this.oGridInfo.oPageInfo.pageSize = pageSize;
            this.oGridInfo.oPageInfo.currentPage = 1;
            this.oGridInfo.oPageInfo.totalNO = len;
            this.oGridInfo.oPageInfo.totalPage = (len > 0) ? Math.ceil(len / pageSize) : 1;
        },
        // 创建分页
        _renderPage: function () {
            var pageInfo = $.extend({}, this.oGridInfo.oPageInfo);
            var currentPage = pageInfo.currentPage;
            var totalPage = pageInfo.totalPage;
            var start = currentPage - 2;
            start = start > 0 ? start : 1;
            var end = start + 4;
            end = end <= totalPage ? end : totalPage;
            start = end - 4;
            start = start > 0 ? start : 1;
            pageInfo.start = start;
            pageInfo.end = end;

            $('#page-wripper').html($.tmpl('#tpl-page', pageInfo));
        },
        // 分页跳转
        _gotoPage: function (page) {
            this.oGridInfo.oPageInfo.currentPage = page;
            this.oGridInfo.pagerEvent = true; // 设置分页跳转事件标志，防止重置分页信息
            this._refreshGrid();
        },

        // 刷新表格，用于分页和设置页码调用
        _refreshGrid: function () {
            if (this.oRenderGrid) {
                this.oRenderGrid.dataSource.read();
            }
        },

        // 设置报表数据，sort，filter，pager
        _setData: function () {
            var aShowData = this.oGridInfo.aShowData;
            var opt = {
                data: aShowData,
                schema: {
                    model: {
                        fields: {
                            sum_views: {
                                type: 'number'
                            },
                            sum_clicks: {
                                type: 'number'
                            },
                            sum_cpc_clicks: {
                                type: 'number'
                            },
                            sum_revenue: {
                                type: 'number'
                            },
                            ctr: {
                                type: 'number'
                            },
                            cpc_ctr: {
                                type: 'number'
                            },
                            cpd: {
                                type: 'number'
                            }
                        }
                    }
                }
            };
            var search = $.trim($('#data-search').val());
            if (search !== '') {
                var filters = [
                    {field: 'product_name', operator: 'contains', value: search},
                    {field: 'name', operator: 'contains', value: search}

                ];
                opt = $.extend(opt, {
                    filter: {
                        logic: 'or',
                        filters: filters
                    }
                });
            }

            if (this.oRenderGrid) {
                var options = this.oRenderGrid.dataSource;
                if (options._sort) {
                    opt.sort = options._sort;
                }
            }

            var dataSource = new kendo.data.TreeListDataSource(opt);
            dataSource.read();
            var data = dataSource.view();
            var arr = [];
            for (var i = 0; i < data.length; i++) {
                arr.push($.extend({}, data[i]));
            }
            return arr;
        },

        // 创建报表
        _renderGrid: function () {
            var _this = this;
            var aShowData = this.oGridInfo.aShowData;
            if (this.oRenderGrid) {
                $('#treelist').html('');
                this.oRenderGrid.destroy();
            }
            var summaryData = [];
            for (var i = 0; i < aShowData.length; i++) {
                if (aShowData[i].parentId === null) {
                    summaryData.push(aShowData[i]);
                }
            }
            this.summaryData = summaryData;
            var dataSource = new kendo.data.TreeListDataSource({
                data: aShowData,
                serverSorting: true,
                schema: {
                    model: {
                        fields: {
                            sum_views: {
                                type: 'number'
                            },
                            sum_clicks: {
                                type: 'number'
                            },
                            sum_cpc_clicks: {
                                type: 'number'
                            },
                            sum_revenue: {
                                type: 'number'
                            },
                            ctr: {
                                type: 'number'
                            },
                            cpc_ctr: {
                                type: 'number'
                            },
                            cpd: {
                                type: 'number'
                            }
                        },

                        id: 'id',
                        parentId: 'parentId'
                    },
                    parse: function (response) {
                        if (_this.oRenderGrid) {
                            response = _this._setData();
                        }
                        var i = 0;
                        var l = 0;
                        var idArr = [];
                        var tmpId = null;
                        var showIds = [];
                        var data = [];
                        var tmp = null;
                        for (i = 0, l = response.length; i < l; i++) {
                            if (response[i].parentId === null) {
                                tmpId = response[i].id;
                                idArr.push(tmpId);
                            }
                        }
                        if (_this.oGridInfo.pagerEvent) {
                            _this.oGridInfo.pagerEvent = false;
                        }
                        else {
                            _this._resetPage(idArr);
                        }

                        var currentPage = _this.oGridInfo.oPageInfo.currentPage;
                        var pageSize = _this.oGridInfo.oPageInfo.pageSize;
                        var start = (currentPage - 1) * pageSize;
                        var summaryData = [];
                        showIds = idArr.slice(start, start + pageSize);
                        for (i = 0, l = response.length; i < l; i++) {
                            tmp = response[i];
                            if ($.inArray(tmp.id, showIds) > -1) {
                                summaryData.push(tmp);
                                data.push(tmp);
                            }
                            if ($.inArray(tmp.parentId, showIds) > -1) {
                                data.push(tmp);
                            }
                        }
                        // _this.summaryData = summaryData;
                        // _this._renderSummary();
                        _this._renderPage();
                        return data;
                    }
                }
            });

            var columns = [];
            if (this.productType === '0') {
                columns = [
                    {
                        field: 'product_name',
                        title: '推广名称',
                        menu: false,
                        width: '220px',
                        template: '# if (data.product_icon){ # <img width=\'40\' height=\'40\' src=\'#: data.product_icon #\'> # } # #: (data.product_name ? data.product_name : "") #'
                    },
                    {
                        field: 'name',
                        menu: false,
                        width: '200px',
                        title: '广告名称'
                    },
                    {
                        field: 'ad_type',
                        title: '广告类型'
                    },
                    {
                        field: 'platform',
                        title: '所属平台'
                    },
                    {
                        field: 'channel',
                        title: '渠道'
                    },
                    {
                        field: 'sum_views',
                        title: '展示量',
                        format: '{0:n0}'
                    },
                    {
                        field: 'sum_clicks',
                        title: '下载量',
                        format: '{0:n0}'
                    },
                    {
                        field: 'ctr',
                        title: '下载转化率',
                        format: '{0:n2}%'
                    },
                    {
                        field: 'sum_revenue',
                        title: '支出',
                        format: '{0:n2}'
                    },
                    {
                        field: 'cpd',
                        title: '下载均价',
                        format: '{0:n2}'
                    }
                ];
            }
            else {
                columns = [
                    {
                        field: 'product_name',
                        title: '推广名称',
                        menu: false,
                        width: '220px',
                        template: '# if (data.product_icon){ # <img width=\'40\' height=\'40\' src=\'#: data.product_icon #\'> # } # #: (data.product_name ? data.product_name : "") #'
                    },
                    {
                        field: 'name',
                        menu: false,
                        width: '200px',
                        title: '广告名称'
                    },
                    {
                        field: 'ad_type',
                        title: '广告类型'
                    },
                    {
                        field: 'platform',
                        title: '所属平台'
                    },
                    {
                        field: 'channel',
                        title: '渠道'
                    },
                    {
                        field: 'sum_views',
                        title: '展示量',
                        format: '{0:n0}'
                    },
                    {
                        field: 'sum_cpc_clicks',
                        title: '点击量',
                        format: '{0:n0}'
                    },
                    {
                        field: 'cpc_ctr',
                        title: '点击转化率',
                        format: '{0:n2}%'
                    },
                    {
                        field: 'sum_revenue',
                        title: '支出',
                        format: '{0:n2}'
                    },
                    {
                        field: 'cpd',
                        title: '平均单价',
                        format: '{0:n2}'
                    }
                ];
            }
            $('#treelist').kendoTreeList({
                dataSource: dataSource,
                columnMenu: true,
                sortable: true,
                resizable: true,
                columns: columns,
                messages: {
                    noRows: '无数据'
                },
                expand: function (e) {
                    if (_this.oRenderChart) {
                        _this.oRenderChart.resize();
                    }
                },
                columnShow: function (e) {
                    _this._showColumn(e); // displays the field of the hidden column
                },
                columnHide: function (e) {
                    _this._hideColumn(e); // displays the field of the visible column
                }
            });
            this.oRenderGrid = $('#treelist').data('kendoTreeList');
            if (aShowData.length > 0) {
                var summary = {
                    id: 0,
                    parentId: null,
                    name: '汇总',
                    product_name: '-',
                    ad_type: '-',
                    type: '-',
                    platform: '-',
                    channel: '-',
                    sum_views: 0,
                    sum_clicks: 0,
                    sum_cpc_clicks: 0,
                    ctr: '-',
                    cpc_str: '-',
                    sum_revenue: 0,
                    cpd: '-',
                    product_type: _this.productType
                };
                $('#treelist .k-grid-content table').append($.tmpl('#tpl-summary', summary));
                this._renderSummary();
            }

            if (_this.oRenderChart) {
                _this.oRenderChart.resize();
            }
        },
        // 显示汇总列
        _showColumn: function (e) {
            $('#table-summary [data-type="' + e.column.field + '"]').show();
        },
        // 隐藏汇总列
        _hideColumn: function (e) {
            $('#table-summary [data-type="' + e.column.field + '"]').hide();
        },
        // 更新汇总数据
        _renderSummary: function () {
            if ($('#table-summary').length > 0) {
                var data = this.summaryData;
                var summaryField = this.summaryField;
                var stocksDataSource = new kendo.data.DataSource({
                    data: data,
                    aggregate: summaryField,
                    schema: {
                        model: {
                            fields: {
                                sum_views: {
                                    type: 'number'
                                },
                                sum_clicks: {
                                    type: 'number'
                                },
                                sum_revenue: {
                                    type: 'number'
                                },
                                sum_cpc_clicks: {
                                    type: 'number'
                                }
                            }
                        }
                    }
                });

                stocksDataSource.read();
                var summary = stocksDataSource.aggregates();
                for (var i = 0, l = summaryField.length; i < l; i++) {
                    var tmp = summaryField[i];
                    $('#table-summary [data-type="' + tmp.field + '"]').html(kendo.toString(summary[tmp.field].sum, tmp.format));
                }
            }
        },
        // 快速选择效果渲染
        _renderFastSelect: function (from, to) {
            if (from === to) {
                $('.js-day-select [data-day-type="3"]').show();
                if (Date.today().compareTo(Date.parse(from)) === 1) {
                    $('.js-day-select [data-day-type="4"]').show();
                }
                else {
                    $('.js-day-select [data-day-type="4"]').hide();
                }
            }
            else {
                $('.js-day-select [data-day-type="3"]').hide();
            }
        },
        // 快速选择功能实现
        _fastSelectDay: function (nDayType) {
            var sDayFrom = '';
            var sDayTo = '';
            var oDay = null;
            this.categoriesType = 2; // 月
            switch (nDayType) {
                case 1:
                    sDayFrom = sDayTo = Date.today().toString('yyyy-MM-dd');
                    break;
                case 2:
                    sDayFrom = sDayTo = Date.today().add(-1).days().toString('yyyy-MM-dd');
                    break;
                case 3:
                    oDay = new Date(this.dateRenge.from.replace(/-/g, '/'));
                    sDayFrom = sDayTo = oDay.add(-1).days().toString('yyyy-MM-dd');
                    break;
                case 4:
                    oDay = new Date(this.dateRenge.from.replace(/-/g, '/'));
                    sDayFrom = sDayTo = oDay.add(1).days().toString('yyyy-MM-dd');
                    break;
                case 5:
                    oDay = Date.today();
                    sDayTo = oDay.toString('yyyy-MM-dd');
                    sDayFrom = oDay.add(-6).days().toString('yyyy-MM-dd');
                    break;
                case 6:
                    oDay = Date.monday(); // 周一
                    sDayFrom = oDay.add(-7).days().toString('yyyy-MM-dd');
                    sDayTo = oDay.add(6).days().toString('yyyy-MM-dd');
                    break;
                case 8:
                    sDayFrom = Date.today().addMonths(-12).moveToFirstDayOfMonth().toString('yyyy-MM-dd');
                    sDayTo = Date.today().addMonths(-1).moveToLastDayOfMonth().toString('yyyy-MM-dd');
                    this.categoriesType = 3;
                    break;
                default: // 默认type为7
                    nDayType = 7;
                    oDay = Date.today();
                    sDayTo = oDay.toString('yyyy-MM-dd');
                    sDayFrom = oDay.moveToFirstDayOfMonth().toString('yyyy-MM-dd');
                    break;
            }
            this.dayType = nDayType;
            $('.js-day-select [data-type="select-day"]').removeClass('cur');
            if (nDayType !== 3 && nDayType !== 4) {
                $('.js-day-select [data-day-type="' + nDayType + '"]').addClass('cur');
            }

            this.dateRenge.from = sDayFrom;
            this.dateRenge.to = sDayTo;
            $('#date-start').val(sDayFrom);
            $('#date-end').val(sDayTo);
            this._renderFastSelect(sDayFrom, sDayTo);
            this._getData();
        },
        // 日期选择功能实现
        _selectDay: function () {
            $('.js-day-select [data-type="select-day"]').removeClass('cur');
            var from = $('#date-start').val();
            var to = $('#date-end').val();
            if (!Helper.fnCheckDay(from) || !Helper.fnCheckDay(to)) {
                alert('日期格式错误');
                return;
            }

            var odayFrom = Date.parse(from);
            var odayTo = Date.parse(to);
            if (odayFrom.compareTo(odayTo) > 0) {
                alert('日期选择错误');
                return;
            }

            if (odayFrom.compareTo(odayTo.addMonths(-3)) < 0) {
                alert('报表查询范围为三个月以内');
                return;
            }

            this.dayType = 9;
            this.categoriesType = 2;
            this.dateRenge.from = from;
            this.dateRenge.to = to;
            this._renderFastSelect(from, to);
            this._getData();
        },

        _changeProductType: function (type) {
            this.dataList = []; // 报表原始数据
            this.adPlanList = {}; // 所有的计划
            this.adProductList = {}; // 所有的广告
            this.adPlanId = '0'; // 选择的计划
            this.adProductId = '0'; // 选择的广告
            this.dataObj = {}; // 按时间对数据进行格式化
            this.chartShowData = []; // 图表显示的数据
            this.showSelectAds = {}; // 广告列表
            this.oGridInfo.aRawData = [];
            this.oGridInfo.aShowData = [];
            this.oGridInfo.oSummary = {};
            this.oGridInfo.oPageInfo.currentPage = 1;
            this.oGridInfo.oPageInfo.totalPage = 1;
            this.oGridInfo.oPageInfo.totalNO = 0;
            this.productType = type;
            $('#data-search').val('');
            if (type === '1') {
                this.itemType = ['sum_cpc_clicks', 'sum_revenue']; // 显示数据字段选择
            }
            else {
                this.itemType = ['sum_clicks', 'sum_revenue']; // 显示数据字段选择
            }
            this._getData();
        },

        fnInit: function (type, item) {
            var _this = this;
            switch (type) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    this.dayType = type;
                    break;
                default:
                    break;
            }
            switch (item) {
                case 'sum_clicks':
                    this.itemType = [item];
                    break;
                case 'sum_revenue':
                    this.itemType = [item];
                    break;
                default:
                    break;
            }
            this._fastSelectDay(this.dayType);

            $('#select-item-type').on('change', function () {
                _this._changeItem();
            });

            $('#select-plan').change(function () {
                _this._changeSelectPlan();
            });

            $('#select-adv').change(function () {
                _this._changeSelectAd();
            });
            $('.js-day-select').on('click', '[data-type="select-day"]', function () {
                _this._fastSelectDay($(this).data('day-type'));
            });
            $('#query').click(function () {
                _this._selectDay();
            });

            $('#page-wripper').on('click', 'a[data-page]', function () {
                if (!$(this).hasClass('k-state-disabled')) {
                    _this._gotoPage($(this).data('page'));
                }
            });

            $('#select-grid-pagesize').change(function (event) {
                /* Act on the event */
                _this._resetPage();
                _this._refreshGrid();
                _this._renderDaysTable();
            });

            $('#product-type-wripper [data-product-type]').click(function (event) {
                /* Act on the event */
                var ele = $(this);
                ele.siblings().removeClass('cur');
                ele.addClass('cur');
                _this._changeProductType(ele.attr('data-product-type'));
            });

            $('#by-time').click(function () {
                _this.tableType = 'time';
                $('#by-campaign').removeClass('active');
                $(this).addClass('active');

                $('#treelist').hide();
                $('#page-wripper').hide();
                $('#data-search-wrapper').hide();
                $('#daily-export-report-btn').hide();

                $('#day-grid').show();
            });

            $('#by-campaign').click(function () {
                _this.tableType = 'ad';
                $('#by-time').removeClass('active');
                $(this).addClass('active');

                $('#day-grid').hide();

                $('#treelist').show();
                $('#page-wripper').show();
                $('#data-search-wrapper').show();
                $('#daily-export-report-btn').show();
            });

            // 搜索框事件
            $('#data-search').on('input propertychange', function () {
                _this._refreshGrid();
            });

            $('#daily-export-report-btn').click(function () {
                var odayFrom = Date.parse(_this.dateRenge.from);
                var odayTo = Date.parse(_this.dateRenge.to);
                if (odayFrom.compareTo(odayTo.addMonths(-3)) < 0) {
                    alert('报表导出范围为三个月以内');
                    return;
                }
                var url = API_URL.advertiser_stat_daily_campaign_excel
                    + '?period_start=' + _this.dateRenge.from
                    + '&period_end=' + _this.dateRenge.to
                    + '&zone_offset=-8&type=' + _this.productType
                    + '&product_id=' + (_this.adPlanId === '0' ? '' : _this.adPlanId)
                    + '&campaign_id=' + (_this.adProductId === '0' ? '' : _this.adProductId)
                    + '&span=' + _this.categoriesType;
                window.location = url;
            });

            $('#export-report-btn').click(function () {
                var url = '';
                if (_this.tableType === 'time') {
                    url = API_URL.advertiser_stat_time_campaign_excel
                        + '?period_start=' + _this.dateRenge.from
                        + '&period_end=' + _this.dateRenge.to
                        + '&zone_offset=-8&type=' + _this.productType
                        + '&product_id=' + (_this.adPlanId === '0' ? '' : _this.adPlanId)
                        + '&campaign_id=' + (_this.adProductId === '0' ? '' : _this.adProductId)
                        + '&span=' + _this.categoriesType;
                }
                else {
                    url = API_URL.advertiser_stat_campaign_excel
                        + '?period_start=' + _this.dateRenge.from
                        + '&period_end=' + _this.dateRenge.to
                        + '&zoneOffset=-8&type=' + _this.productType
                        + '&product_id=' + (_this.adPlanId === '0' ? '' : _this.adPlanId)
                        + '&campaign_id=' + (_this.adProductId === '0' ? '' : _this.adProductId)
                        + '&span=' + _this.categoriesType;
                }
                window.location = url;
            });

            $(window).resize(function (event) {
                /* Act on the event */
                if (_this.oRenderChart) {
                    _this.oRenderChart.resize();
                }
            });

            $(window).scroll(function () {
                Helper.fnFixedHead($('#day-grid'));
                Helper.fnFixedHead($('#treelist'));
            });
        }
    };

    return new Campaigns();
})(jQuery);

$(function () {
    // 日期框处理
    (function ($) {
        var $from = $('#date-start');
        var $end = $('#date-end');
        var $dateFrom = null;
        var $dateEnd = null;
        $from.kendoDatePicker({
            format: 'yyyy-MM-dd',
            max: new Date(),
            animation: false,
            change: function (e) {
                $dateEnd.open();
            }
        });
        $end.kendoDatePicker({
            format: 'yyyy-MM-dd',
            max: new Date(),
            animation: false,
            open: function (e) {
                $dateEnd.min(Date.parse($from.val()));
            }
        });

        $dateFrom = $from.data('kendoDatePicker');
        $dateEnd = $end.data('kendoDatePicker');

        $from.click(function () {
            $dateFrom.open();
        });
        $end.click(function () {
            $dateEnd.open();
        });
    })(jQuery);

    Helper.load_ajax();
    kendo.culture('zh-CN');
    var type = Number(Helper.fnGetQueryParam('type'));
    var item = Helper.fnGetQueryParam('item');
    Campaigns.fnInit(type, item);
});
