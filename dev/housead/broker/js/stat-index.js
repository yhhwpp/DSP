/**
 * @file stat-index.js
 * @description 统计报表
 * @author songxing
*/
var Stat = (function ($) {
    var Stat = function () {
        this.ajaxIsOpen = true;
        this.isFirst = false;
        this.revenueType = ''; // 0:安装包下载（cpd：10） 1：链接推广（cpc：2）
        this.selectedItems = []; // 显示数据字段选择
        this.selectedMajor = 'all'; // 主分类选择
        this.selectedSecondary = 'all'; // 次分类选择
        this.selectedThreeLevel = 'all'; // 三级分类
        this.selectedThreeLevelName = ''; // 三级分类
        this.span = 2; // 横轴坐标类型1:小时   //2:天  //3:月
        this.dayType = 5; // 默认显示最近7天，1:今天；2：昨天；3：前一天；4：后一天；5：最近七天；6：上周；7：本月；8：历史12月；9：select
        this.dateRenge = { // 报表查询时间
            from: '2015-09-01',
            to: '2015-09-03'
        };
        // 表格类型
        this.tableType = 'time';

        this.fieldKey = {
            major: 'client_id',
            majorLabel: 'client_name',
            secondary: 'product_id',
            secondaryLabel: 'product_name',
            threeLevel: 'ad_id',
            threeLevelLabel: 'ad_name'
        };
        // 图表数据
        this.oChartInfo = {
            // 显示的字段
            aItem: [],
            ofItem: {},
            // 图表原始数据
            aRawData: [],
            aMajorData: [],
            view: []
        };
        this.oRenderChart = null;

        // 报表信息
        this.oGridInfo = {
            // 报表显示列
            aColumn: [],
            // 报表原始数据
            aRawData: [],
            // 报表显示的数据
            aShowData: [],
            // 汇总数据
            oSummary: {},
            // 分页跳转事件标志
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
        this.dataSourceSchema = {
            model: {
                fields: {
                    time: {
                        type: 'date',
                        parse: function (val) {
                            if (typeof val === 'string' && val !== '') {
                                return Date.parse(val);
                            }
                            return val;
                        }
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
                    sum_cpa: {
                        type: 'number'
                    },
                    sum_revenue: {
                        type: 'number'
                    },
                    ctr: {
                        type: 'number'
                    },
                    cpd: {
                        type: 'number'
                    }
                }
            }
        };

        this.categoryAxis = {
            name: 'category',
            type: 'date',
            labels: {
                format: '{0:MM月dd日}',
                rotation: -50
            },
            baseUnit: 'days',
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

            axisCrossingValues: [0, 1000]
        };

        this.dateList = [];
        this.summaryData = [];
        this.summaryField = [
            {field: 'sum_views', aggregate: 'sum', format: 'n0'},
            {field: 'sum_clicks', aggregate: 'sum', format: 'n0'},
            {field: 'sum_revenue', aggregate: 'sum', format: 'n2'}
        ];
    };

    Stat.prototype = {
        // 开启ajax遮罩
        _ajaxOpen: function () {
            if (!this.ajaxIsOpen) {
                Helper.load_ajax();
                this.ajaxIsOpen = true;
            }
        },
        // 关闭ajax遮罩
        _ajaxClose: function () {
            Helper.close_ajax();
            this.ajaxIsOpen = false;
        },

        // 设置纵轴坐标系
        _setValueAjax: function (name, title, format) {
            return {
                name: name,
                labels: {
                    format: '{0:' + format + '}'
                },
                title: {text: Helper.fnInsertString(title, '\n'), rotation: 0},
                line: {
                    visible: false
                }
            };
        },

        // 设置数据
        _setSeries: function (opt) {
            var _this = this;
            var options = {
                overlay: {
                    gradient: 'none'
                },
                border: {
                    width: 0
                },
                aggregate: function () {
                    return _this._aggregateFunc.apply(_this, arguments);
                },
                missingValues: 'zero',
                categoryField: 'time'
            };
            return $.extend(options, opt);
        },

        _setCategoryAxis: function () {
            var dateArr = [];
            if (this.span === 2) {
                this.categoryAxis.labels.format = '{0:MM月dd日}';
                this.categoryAxis.baseUnit = 'days';
                this.categoryAxis.crosshair.tooltip.format = '{0:MM月dd日}';
                dateArr = Helper.fnDateScope(this.dateRenge.from, this.dateRenge.to);
            }
            else if (this.span === 3) {
                this.categoryAxis.labels.format = '{0:MM月}';
                this.categoryAxis.baseUnit = 'months';
                this.categoryAxis.crosshair.tooltip.format = '{0:MM月}';
                dateArr = Helper.fnMonthScope(this.dateRenge.from, this.dateRenge.to);
            }
            else if (this.span === 1) {
                this.categoryAxis.labels.format = '{0:t}';
                this.categoryAxis.baseUnit = 'hours';
                this.categoryAxis.crosshair.tooltip.format = 't';
                this.categoryAxis.majorGridLines.step = 3;
                dateArr = Helper.fnHourScope(this.dateRenge.from, this.dateRenge.to);
                this.dateList = dateArr;
                return;
            }
            this.dateList = dateArr;
            var cl = dateArr.length;
            if (cl > 86) {
                this.categoryAxis.labels.step = 5;
                this.categoryAxis.majorGridLines.step = 5;
            }
            else if (cl > 66) {
                this.categoryAxis.labels.step = 4;
                this.categoryAxis.majorGridLines.step = 4;
            }
            else if (cl > 44) {
                this.categoryAxis.labels.step = 3;
                this.categoryAxis.majorGridLines.step = 3;
            }
            else if (cl > 22) {
                this.categoryAxis.labels.step = 2;
                this.categoryAxis.majorGridLines.step = 2;
            }
            else {
                this.categoryAxis.labels.step = 1;
                this.categoryAxis.majorGridLines.step = 1;
            }
        },

        // 对象数组按某个字段值转化为json对象,该字段必须唯一，否则后面的数据会覆盖前面的数据
        _convertArrayToObj: function (arr, key) {
            var obj = {};
            var tmp = null;
            for (var i = 0, l = arr.length; i < l; i++) {
                tmp = arr[i];
                obj[tmp[key]] = tmp;
            }
            return obj;
        },

        _getItem: function () {
            var _this = this;
            this._ajaxOpen();
            var param = {
                type: _this.revenueType
            };
            $.get(API_URL.broker_stat_column_list, param, function (result) {
                if (!result.res) {
                    _this.oChartInfo.aItem = $.isArray(result.list.chart_item) ? result.list.chart_item : [];
                    _this.oChartInfo.ofItem = _this._convertArrayToObj(_this.oChartInfo.aItem, 'field');
                    _this.oGridInfo.aColumn = $.isArray(result.list.table_column_item) ? result.list.table_column_item : [];
                    _this._renderSelectItem(result.list);
                    _this._getData();
                }
                else {
                    _this._ajaxClose();
                    Helper.fnAlert(result.msg);
                }
            }).fail(function (e) {
                _this._ajaxClose();
                Helper.fnAlert('服务器请求失败，请稍后重试');
            });
        },

        _getData: function () {
            var _this = this;
            var param = {
                type: _this.revenueType,
                period_start: _this.dateRenge.from,
                period_end: _this.dateRenge.to,
                span: _this.span,
                zone_offset: '-8'
            };
            this._ajaxOpen();
            $.get(API_URL.broker_stat_index, param, function (result) {
                if (!result.res) {
                    _this._ajaxClose();
                    _this.oChartInfo.aRawData = $.isArray(result.list.statChart) ? result.list.statChart : [];
                    _this.oGridInfo.aRawData = $.isArray(result.list.statData) ? result.list.statData : [];
                    _this.oGridInfo.oSummary = result.obj ? result.obj : {};
                    _this._setCategoryAxis();
                    _this._genChart();
                    _this._showGrid();
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

        _genChart: function () {
            var aRawData = this.oChartInfo.aRawData;
            this._renderSelectMajor(aRawData);
            this._screenMajorData();
        },

        _renderSelectMajor: function (data) {
            var selectedMajor = this.selectedMajor;
            var fieldKey = this.fieldKey;
            var html = '';
            var tmp = null;
            html += '<option value="all">所有广告主</option>';
            for (var i = 0, l = data.length; i < l; i++) {
                tmp = data[i];
                html += '<option value="' + tmp[fieldKey.major] + '" ' + (String(tmp[fieldKey.major]) === selectedMajor ? 'selected' : '') + '>' + tmp[fieldKey.majorLabel] + '</option>';
            }
            $('#select-major').html(html);
            this.selectedMajor = $('#select-major').val();
        },

        _renderSelectSecondary: function (data) {
            var selectedSecondary = this.selectedSecondary;
            var fieldKey = this.fieldKey;
            var html = '';
            var tmp = null;
            var len = data.length;
            html += '<option value="all">所有推广产品</option>';
            for (var i = 0; i < len; i++) {
                tmp = data[i];
                html += '<option value="' + tmp[fieldKey.secondary] + '" ' + (String(tmp[fieldKey.secondary]) === selectedSecondary ? 'selected' : '') + '>' + tmp[fieldKey.secondaryLabel] + '</option>';
            }
            $('#select-secondary').html(html);
            this.selectedSecondary = $('#select-secondary').val();
        },

        _renderSelectThreeLevel: function (view) {
            var selectedThreeLevel = this.selectedThreeLevel;
            var fieldKey = this.fieldKey;
            var html = '';
            var tmp = null;
            var len = view.length;
            var flag = false;
            html += '<option value="all">所有广告</option>';
            for (var i = 0; i < len; i++) {
                tmp = view[i].items[0];
                if (String(tmp[fieldKey.threeLevel]) === selectedThreeLevel) {
                    html += '<option value="' + tmp[fieldKey.threeLevel] + '" selected>' + tmp[fieldKey.threeLevelLabel] + '</option>';
                    flag = true;
                }
                else {
                    html += '<option value="' + tmp[fieldKey.threeLevel] + '">' + tmp[fieldKey.threeLevelLabel] + '</option>';
                }
            }
            if (!flag && this.selectedThreeLevelName !== '' && this.selectedThreeLevel !== 'all') {
                html += '<option value="' + this.selectedThreeLevel + '" selected>' + this.selectedThreeLevelName + '</option>';
            }
            $('#select-three-level').html(html);
            this.selectedThreeLevel = $('#select-three-level').val();
        },

        _screenMajorData: function () {
            var aRawData = this.oChartInfo.aRawData;
            var selectedMajor = this.selectedMajor;
            var fieldKey = this.fieldKey;
            var aData = [];
            var i;
            var l;
            if (selectedMajor === 'all') {
                for (i = 0, l = aRawData.length; i < l; i++) {
                    aData = aData.concat(aRawData[i].product_list);
                }
            }
            else {
                for (i = 0, l = aRawData.length; i < l; i++) {
                    if (String(aRawData[i][fieldKey.major]) === selectedMajor) {
                        aData = aData.concat(aRawData[i].product_list);
                        break;
                    }
                }
            }
            this.oChartInfo.aMajorData = aData;
            this._renderSelectSecondary(aData);
            this._screenSecondaryData();
        },

        _screenSecondaryData: function () {
            var aRawData = this.oChartInfo.aMajorData;
            var selectedSecondary = this.selectedSecondary;
            var fieldKey = this.fieldKey;
            var aChartData = [];
            var i;
            var l;
            if (selectedSecondary === 'all') {
                for (i = 0, l = aRawData.length; i < l; i++) {
                    aChartData = aChartData.concat(aRawData[i].ad_list);
                }
            }
            else {
                for (i = 0, l = aRawData.length; i < l; i++) {
                    if (String(aRawData[i][fieldKey.secondary]) === selectedSecondary) {
                        aChartData = aChartData.concat(aRawData[i].ad_list);
                        break;
                    }
                }
            }
            var schema = $.extend({}, this.dataSourceSchema);
            var field = this.fieldKey.threeLevel;
            var stocksDataSource = new kendo.data.DataSource({
                data: aChartData,
                group: {
                    field: field,
                    aggregates: [
                        {field: 'sum_clicks', aggregate: 'sum'}
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
            view.sort(function (a, b) {
                return b.aggregates.sum_clicks.sum - a.aggregates.sum_clicks.sum;
            });
            this._renderSelectThreeLevel(view);
            this.oChartInfo.view = view;
            this._renderChart();
        },

        _renderChart: function () {
            var _this = this;
            var view = this.oChartInfo.view;
            var ll = view.length;
            var aChartData = [];
            var selectedItems = this.selectedItems;
            var selectedThreeLevel = this.selectedThreeLevel;
            var categoryAxis = this.categoryAxis;
            var len = selectedItems.length;
            var series = [];
            var valueAxis = [];
            var aggregates = [];
            var field = selectedItems[0];
            var itemList = this.oChartInfo.ofItem;
            var item = itemList[field];
            var fieldKey = this.fieldKey.threeLevel;
            var nameKey = this.fieldKey.threeLevelLabel;
            var type = len > 1 ? 'column' : item.chart_type;
            var stack = type === 'line' ? false :  field;
            var defaultLength = this.defaultLength;
            var end = ll < defaultLength ? ll : defaultLength;
            var tmpData = [];

            var dateRenge = this.dateRenge;
            var dateFrom = dateRenge.from;
            var dateEnd = dateRenge.to;
            if (this.span === 1) {
                dateFrom = dateRenge.from + ' 00:00:00';
                dateEnd = dateRenge.to + ' 23:59:59';
            }
            var initData = [{time: Date.parse(dateFrom)}, {time: Date.parse(dateEnd)}];
            var valueAxisName = 'first';
            valueAxis.push(this._setValueAjax(valueAxisName, item.name, item.format));

            if (selectedThreeLevel === 'all') {
                for (var i = 0; i < end; i++) {
                    tmpData = view[i].items;
                    aChartData = aChartData.concat(tmpData);
                    series.push(this._setSeries({
                        idx: 0,
                        type: type,
                        field: field,
                        stack: stack,
                        data: initData.concat(tmpData),
                        axis: valueAxisName,
                        mformat: item.format,
                        fieldName: item.name,
                        name: tmpData[0][nameKey]
                    }));
                }
                if (ll > defaultLength) {
                    tmpData = [];
                    for (var j = defaultLength; j < ll; j++) {
                        tmpData = tmpData.concat(view[j].items);
                    }
                    aChartData = aChartData.concat(tmpData);
                    series.push(this._setSeries({
                        idx: 0,
                        type: type,
                        field: field,
                        stack: stack,
                        axis: valueAxisName,
                        mformat: item.format,
                        fieldName: item.name,
                        name: '其它',
                        data: initData.concat(tmpData)
                    }));
                }
            }
            else {
                for (var ii = 0; ii < ll; ii++) {
                    tmpData = view[ii].items;
                    if (String(tmpData[0][fieldKey]) === selectedThreeLevel) {
                        aChartData = aChartData.concat(tmpData);
                        series.push(this._setSeries({
                            idx: 0,
                            type: type,
                            field: field,
                            stack: stack,
                            axis: valueAxisName,
                            mformat: item.format,
                            fieldName: item.name,
                            name: tmpData[0][nameKey],
                            data: initData.concat(tmpData)
                        }));
                        break;
                    }
                }
            }

            if (len > 1) {
                field = selectedItems[1];
                item = this.oChartInfo.ofItem[field];
                valueAxisName = 'second';
                valueAxis.push(this._setValueAjax(valueAxisName, item.name, item.format));
                type = 'line';
                series.push(this._setSeries({
                    color: CONSTANT.chart_line_color,
                    idx: 1,
                    type: type,
                    field: field,
                    axis: valueAxisName,
                    mformat: item.format,
                    fieldName: item.name,
                    data: initData.concat(aChartData)
                }));
            }

            var tmp = null;
            for (var k in itemList) {
                if (itemList.hasOwnProperty(k)) {
                    tmp = itemList[k];
                    if (tmp.field_type === 'basics') {
                        aggregates.push({field: tmp.field, aggregate: 'sum'});
                    }
                }
            }

            var seriesDataSource = new kendo.data.DataSource({
                data: aChartData,
                group: [
                    // group by "time" and then by "id"
                    {field: 'time', dir: 'asc', aggregates: aggregates},
                    {
                        field: fieldKey,
                        aggregates: aggregates
                    }
                ]
            });
            seriesDataSource.read();
            this.seriesDataSource = seriesDataSource;

            $('#chart').kendoChart({
                series: series,
                seriesColors: CONSTANT.chart_color,
                legend: {
                    position: 'bottom'
                },
                valueAxis: valueAxis,
                tooltip: {
                    visible: true,
                    template: kendo.template($('#tpl-chart-tooltip').html())
                },
                legendItemClick: function (e) {
                    _this._chartRefreshLine(e);
                },
                categoryAxis: categoryAxis
            });
            this.oRenderChart = $('#chart').data('kendoChart');

            this._renderDaysTable();
        },

        _aggregateFunc: function (values, series, dataItems, category) {
            var itemList = this.oChartInfo.ofItem;
            var itemInfo = itemList[series.field];
            var val = 0;
            var i = 0;
            var l = dataItems.length;
            if (l < 1) {
                return 0;
            }
            var tmp = null;
            var summary = {};
            for (var k in itemList) {
                if (itemList.hasOwnProperty(k)) {
                    tmp = itemList[k];
                    if (tmp.field_type === 'basics') {
                        summary[tmp.field] = 0;
                    }
                }
            }
            for (; i < l; i++) {
                tmp = dataItems[i];
                for (var key in summary) {
                    summary[key] += tmp[key] ? (+tmp[key]) : 0;
                }
            }
            if (itemInfo.field_type === 'basics') {
                val = summary[itemInfo.field];
            }
            else {
                val = this.fnCalculate(summary, itemInfo.arithmetic);
            }
            return val;
        },

        fnCalculate: function (summary, arithmetic) {
            var arr = [];
            var tmp = null;
            var val = 0;
            for (var i = 0, l = arithmetic.length; i < l; i++) {
                tmp = arithmetic[i];
                if (summary.hasOwnProperty(tmp)) {
                    arr.push(summary[tmp]);
                }
                else {
                    arr.push(tmp);
                }
            }
            val = Helper.fnEval(arr.join(''));
            if (typeof val === 'number' && isFinite(val)) {
                return val;
            }
            return 0;
        },

        _chartRefreshLine: function (e) {
            var oRenderChart = this.oRenderChart;
            if (!oRenderChart) {
                return;
            }

            var selectedItems = this.selectedItems;
            var len = selectedItems.length;
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

        // 设置每行的数据
        _setRowData: function (data) {
            var itemList = this.oChartInfo.aItem;
            var summary = {};
            var tmp = null;
            for (var i = 0, l = itemList.length; i < l; i++) {
                tmp = itemList[i];
                if (tmp.field_type === 'basics') {
                    summary[tmp.field] = data[tmp.field] ? data[tmp.field] : 0;
                }
                else {
                    summary[tmp.field] = this.fnCalculate(data, tmp.arithmetic);
                }
            }
            return summary;
        },

        // 创建每日报表,此处可优化，设置分页时可不用再次计算数据（未优化）
        _renderDaysTable: function () {
            var view = this.seriesDataSource.view();
            var pageSize = this.oGridInfo.oPageInfo.pageSize;
            var dateList = this.dateList;
            var itemList = this.oChartInfo.aItem;
            var dateFormat = '{0:yyyy-MM-dd}';
            if (this.span === 3) {
                dateFormat = '{0:yyyy-MM}';
            }
            else if (this.span === 1) {
                dateFormat = '{0:t}';
            }
            var tmp = null;
            var i = 0;
            var l = 0;
            var defaultSummary = {};
            var tmpSummary = {};
            var dataArr = [];
            var columns = [];

            for (i = 0, l = itemList.length; i < l; i++) {
                tmp = itemList[i];
                defaultSummary[tmp.field] = 0;
                columns.push({
                    field: tmp.field,
                    title: tmp.name,
                    format: '{0:' + tmp.format + '}'
                });
            }

            for (i = 0, l = dateList.length; i < l; i++) {
                tmpSummary = $.extend({}, defaultSummary);
                var tmpTime = Date.parse(dateList[i]);
                for (var ii = 0, ll = view.length; ii < ll; ii++) {
                    tmp = view[ii];
                    if (tmpTime.equals(tmp.value)) {
                        for (var key in tmp.aggregates) {
                            tmpSummary[key] = tmp.aggregates[key].sum;
                        }
                        tmpSummary = this._setRowData($.extend({}, tmpSummary));
                        break;
                    }
                }
                dataArr.push($.extend({time: tmpTime}, tmpSummary));
            }

            if (this.oRenderDayGrid) {
                this.oRenderDayGrid.destroy();
                $('#day-grid').html('');
            }
            columns.unshift({
                field: 'time',
                title: '时间',
                format: dateFormat
            });

            $('#day-grid').kendoGrid({
                dataSource: {
                    data: dataArr,
                    schema: {
                        model: {
                            fields: {
                                time: {type: 'date'}
                            }
                        }
                    },
                    sort: {field: 'time', dir: 'desc'}
                },
                sortable: true,
                pageable: {
                    pageSize: pageSize,
                    buttonCount: 5
                },
                columns: columns
            });

            this.oRenderDayGrid = $('#day-grid').data('kendoGrid');
        },

        // 显示报表
        _showGrid: function () {
            var aGridData = this.oGridInfo.aRawData;
            var selectedMajor = this.selectedMajor;
            var selectedSecondary = this.selectedSecondary;
            var selectedThreeLevel = this.selectedThreeLevel;
            var arr = [];
            var tmp = {};
            var i = 0;
            var l = aGridData.length;
            var fieldKey = this.fieldKey;
            if (selectedThreeLevel !== 'all') {
                for (i = 0; i < l; i++) {
                    tmp = aGridData[i];
                    if (String(tmp[fieldKey.threeLevel]) === selectedThreeLevel) {
                        arr.push(tmp);
                    }
                }
            }
            else if (selectedSecondary !== 'all') {
                for (i = 0; i < l; i++) {
                    tmp = aGridData[i];
                    if (String(tmp[fieldKey.secondary]) === selectedSecondary) {
                        arr.push(tmp);
                    }
                }
            }
            else if (selectedMajor !== 'all') {
                for (i = 0; i < l; i++) {
                    tmp = aGridData[i];
                    if (String(tmp[fieldKey.major]) === selectedMajor) {
                        arr.push(tmp);
                    }
                }
            }
            else {
                arr = arr.concat(aGridData);
            }

            this.oGridInfo.aShowData = this._formatGridData(arr);
            this._renderGrid();
        },
        // 报表对象数组格式化，数据改为treelist
        _formatGridData: function (aData) {
            var arr = [];
            var fieldKey = this.fieldKey;
            for (var i = 0, l = aData.length; i < l; i++) {
                var tmp = aData[i];
                var o = $.extend({
                    parentId: null
                }, tmp);
                delete o.child;
                arr.push(o);
                // for (var ii = 0, ll = tmp.child.length; ii < ll; ii++) {
                //     var childId = Math.random();
                //     var ttmp = tmp.child[ii];
                //     var obj = {parentId: tmp[fieldKey.threeLevel]};
                //     obj[fieldKey.threeLevel] = childId;
                //     arr.push($.extend({}, ttmp, obj));
                // }

                for (var key in tmp.child) {
                    var childId = Math.random();
                    var ttmp = tmp.child[key];
                    var obj = {parentId: tmp[fieldKey.threeLevel]};
                    obj[fieldKey.threeLevel] = childId;
                    arr.push($.extend({}, ttmp, obj));
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

        _genGrid: function () {
            var columns = [];
            var tabColumns = this.oGridInfo.aColumn;
            var tmp = null;
            var col = null;
            var html = '<tfoot><tr id="table-summary" class="k-footer-template" data-parentid="null">';
            for (var i = 0, l = tabColumns.length; i < l; i++) {
                tmp = tabColumns[i];
                col = {
                    field: tmp.field,
                    title: tmp.name,
                    menu: !!(+tmp.menu)
                };
                if (tmp.width) {
                    col.width = tmp.width;
                }
                if (tmp.field === 'product_name') {
                    col.template = '#if (data.product_icon){ # <img width=\'40\' height=\'40\' src=\'#: data.product_icon #\'> #: data.product_name # # } else { # #: data.product_name ? data.product_name : "" # # } #';
                }
                if (tmp.format) {
                    if (tmp.field === 'ctr') {
                        col.format = '{0:' + tmp.format + '}%';
                    }
                    else {
                        col.format = '{0:' + tmp.format + '}';
                    }
                }
                html += '<td data-type="' + tmp.field + '" role="gridcell">'
                    + (i === 0 ? '<span class="k-icon k-i-none"></span>汇总' : ((+tmp.summary) ? (this.oGridInfo.oSummary[tmp.field] ? (tmp.format ? kendo.toString(this.oGridInfo.oSummary[tmp.field], tmp.format) : this.oGridInfo.oSummary[tmp.field]) : 0) : '-'))
                    + '</td>';
                columns.push(col);
            }
            html += '</tr></tfoot>';
            return {
                columns: columns,
                footHtml: html
            };
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
            var schema = Helper.fnDeepCopy(this.dataSourceSchema);
            var fieldKey = this.fieldKey;
            schema.model.id = fieldKey.threeLevel;
            schema.model.parentId = 'parentId';
            var opt = {
                data: aShowData,
                schema: schema
            };

            var search = $.trim($('#data-search').val());
            if (search !== '') {
                var filters = [];
                var tabColumns = this.oGridInfo.aColumn;
                var tmp = null;
                for (var i = 0, l = tabColumns.length; i < l; i++) {
                    tmp = tabColumns[i];
                    if (tmp.search) {
                        filters.push({
                            field: tmp.field,
                            operator: 'contains',
                            value: search
                        });
                    }
                }
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

            var dataSource = new kendo.data.DataSource(opt);
            dataSource.read();
            var data = dataSource.view();
            var arr = [];
            for (var j = 0; j < data.length; j++) {
                arr.push($.extend({}, data[j]));
            }
            return arr;
        },

        // 创建报表
        _renderGrid: function () {
            var _this = this;
            var aShowData = this.oGridInfo.aShowData;
            var schema = Helper.fnDeepCopy(this.dataSourceSchema);
            var fieldKey = this.fieldKey;
            aShowData.sort(function (a, b) {
                return Number(b.sum_clicks) - Number(a.sum_clicks);
            });
            schema.model.id = fieldKey.threeLevel;
            schema.model.parentId = 'parentId';
            schema.parse = function (response) {
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
                var fieldKey = _this.fieldKey.threeLevel;
                for (i = 0, l = response.length; i < l; i++) {
                    if (response[i].parentId === null) {
                        tmpId = response[i][fieldKey];
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
                    if ($.inArray(tmp[fieldKey], showIds) > -1) {
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
            };

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
                schema: schema
            });
            var gridInfo = this._genGrid();
            $('#treelist').kendoTreeList({
                dataSource: dataSource,
                columnMenu: true,
                sortable: true,
                resizable: true,
                columns: gridInfo.columns,
                messages: {
                    noRows: '无数据'
                },
                expand: function (e) {
                    setTimeout(function () {
                        if (_this.oRenderChart) {
                            _this.oRenderChart.resize();
                        }
                    }, 10); // 异步延迟执行，expend执行在表格展开之前
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
                $('#treelist .k-grid-content table').append(gridInfo.footHtml);
                _this._renderSummary();
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
                this.span = 1;
            }
            else {
                $('.js-day-select [data-day-type="3"]').hide();
            }
        },

        // 创建字段选择框
        _renderSelectItem: function () {
            var items = this.oChartInfo.aItem;
            var html = '';
            var tmp = null;
            var selectedItems = this.selectedItems;
            var len = selectedItems.length;
            for (var i = 0, l = items.length; i < l; i++) {
                tmp = items[i];
                if (len > 0) {
                    html += '<option value="' + tmp.field + '" ' + ($.inArray(tmp.field, selectedItems) >= 0 ? 'selected' : '') + '>' + tmp.name + '</option>';
                }
                else {
                    html += '<option value="' + tmp.field + '" ' + ((+tmp.default) ? 'selected' : '') + '>' + tmp.name + '</option>';
                }
            }
            $('#select-item').attr('multiple', 'multiple').html(html);
            if (!this.chartSeriesItemInit) {
                $('#select-item').selectpicker({
                    iconBase: '',
                    tickIcon: '',
                    noneSelectedText: '请选择',
                    maxOptions: 2,
                    maxOptionsText: ['超出限制 (最多选择{n}项)', '组选择超出限制(最多选择{n}组)']
                });
                this.chartSeriesItemInit = true;
            }
            else {
                $('#select-item').selectpicker('refresh');
            }
            this._changeItem();
        },

        // 快速选择功能实现
        _fastSelectDay: function (nDayType) {
            var sDayFrom = '';
            var sDayTo = '';
            var oDay = null;
            this.span = 2; // 月
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
                    this.span = 3;
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
            this.span = 2;
            this.dateRenge.from = from;
            this.dateRenge.to = to;
            this._renderFastSelect(from, to);
            this._getData();
        },

        // 重置数据
        _reset: function () {
            this.selectedItems = [];
            this.selectedMajor = 'all';
            this.selectedSecondary = 'all';
            this.selectedThreeLevel = 'all';
            this.selectedThreeLevelName = '';
            // 图表数据
            this.oChartInfo = {
                // 显示的字段
                aItem: [],
                ofItem: {},
                // 图表原始数据
                aRawData: [],
                aMajorData: [],
                view: []
            };
            this.oGridInfo.oColumn = {};
            this.oGridInfo.aRawData = [];
            this.oGridInfo.aShowData = [];
            this.oGridInfo.oSummary = {};
            this.oGridInfo.oPageInfo.currentPage = 1;
            this.oGridInfo.oPageInfo.totalPage = 1;
            this.oGridInfo.oPageInfo.totalNO = 1;
            $('#data-search').val('');
        },

        // 更改字段选择处理函数
        _changeItem: function () {
            var val = [];
            var $this = $('#select-item');
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
            this.selectedItems = val;
        },

        // 更改主分类
        _changeMajor: function ($ele) {
            this.selectedMajor = $ele.val();
            this.selectedSecondary = 'all';
        },

        // 更改次分类
        _changeSecondary: function ($ele) {
            this.selectedSecondary = $ele.val();
            this.selectedThreeLevel = 'all';
        },

        // 更改三级分类
        _changeThreeLevel: function ($ele) {
            this.selectedThreeLevel = $ele.val();
        },

        // 菜单导航点击事件主体
        _changeMenu: function ($ele) {
            $ele.siblings().removeClass('cur');
            $ele.addClass('cur');
            this.revenueType = $ele.attr('data-revenue-type');
            if (this.isFirst) {
                this._reset();
            }
            else {
                this.isFirst = true;
            }
            this._getItem();
        },

        fnInit: function (dayType, revenueType, id, name) {
            var _this = this;
            switch (dayType) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    this.dayType = dayType;
                    break;
                default:
                    break;
            }
            switch (revenueType) {
                case '0':
                case '1':
                    this.revenueType = revenueType;
                    break;
                default:
                    break;
            }
            if (id) {
                this.selectedThreeLevel = id;
                this.selectedThreeLevelName = name;
            }

            this._fastSelectDay(this.dayType);

            // 事件注册
            $('#query').click(function () {
                _this._selectDay();
            });

            // 导航菜单事件驱动
            $('#nav-menu-wrapper').on('click', '[data-revenue-type]', function () {
                _this._changeMenu($(this));
            });

            // 数据列表事件驱动
            $('#select-item').on('change', function () {
                _this._changeItem();
                _this._renderChart();
            });

            // 主分类事件驱动
            $('#select-major').on('change', function () {
                _this._changeMajor($(this));
                _this._screenMajorData();
                _this._showGrid();
            });

            // 次分类事件驱动
            $('#select-secondary').on('change', function () {
                _this._changeSecondary($(this));
                _this._screenSecondaryData();
                _this._showGrid();
            });

            // 三级分类事件驱动
            $('#select-three-level').on('change', function () {
                _this._changeThreeLevel($(this));
                _this._renderChart();
                _this._showGrid();
            });

            $('#page-wripper').on('click', 'a[data-page]', function (e) {
                if (!$(this).hasClass('k-state-disabled')) {
                    _this._gotoPage($(this).data('page'));
                    $(document).scrollTop($(document).height());
                }
            });

            $('#select-grid-pagesize').change(function (event) {
                /* Act on the event */
                _this._resetPage();
                _this._refreshGrid();
                _this._renderDaysTable();
            });

            $('.js-day-select').on('click', '[data-type="select-day"]', function () {
                _this._fastSelectDay($(this).data('day-type'));
                _this._getData();
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
                var url = API_URL.broker_stat_daily_campaign_excel
                    + '?period_start=' + _this.dateRenge.from
                    + '&period_end=' + _this.dateRenge.to
                    + '&zone_offset=-8&type=' + _this.revenueType
                    + '&client_id=' + (_this.selectedMajor === 'all' ? '' : _this.selectedMajor)
                    + '&product_id=' + (_this.selectedSecondary === 'all' ? '' : _this.selectedSecondary)
                    + '&campaign_id=' + (_this.selectedThreeLevel === 'all' ? '' : _this.selectedThreeLevel)
                    + '&span=' + _this.span;
                window.location = url;
            });

            $('#export-report-btn').click(function () {
                var url = '';
                if (_this.tableType === 'time') {
                    url = API_URL.broker_stat_time_campaign_excel
                        + '?period_start=' + _this.dateRenge.from
                        + '&period_end=' + _this.dateRenge.to
                        + '&zone_offset=-8&type=' + _this.revenueType
                        + '&client_id=' + (_this.selectedMajor === 'all' ? '' : _this.selectedMajor)
                        + '&product_id=' + (_this.selectedSecondary === 'all' ? '' : _this.selectedSecondary)
                        + '&campaign_id=' + (_this.selectedThreeLevel === 'all' ? '' : _this.selectedThreeLevel)
                        + '&span=' + _this.span;
                }
                else {
                    url = API_URL.broker_stat_campaign_excel
                        + '?period_start=' + _this.dateRenge.from
                        + '&period_end=' + _this.dateRenge.to
                        + '&zone_offset=-8&type=' + _this.revenueType
                        + '&client_id=' + (_this.selectedMajor === 'all' ? '' : _this.selectedMajor)
                        + '&product_id=' + (_this.selectedSecondary === 'all' ? '' : _this.selectedSecondary)
                        + '&campaign_id=' + (_this.selectedThreeLevel === 'all' ? '' : _this.selectedThreeLevel)
                        + '&span=' + _this.span;
                }
                window.location = url;
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

            // 驱动入口
            if (this.revenueType !== '') {
                $('#nav-menu-wrapper [data-revenue-type="' + this.revenueType + '"]').trigger('click');
            }
            else {
                $('#nav-menu-wrapper [data-revenue-type]').eq(0).trigger('click');
            }
        }
    };

    return new Stat();
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
    var dayType = +Helper.fnGetQueryParam('dayType');
    var revenueType = Helper.fnGetQueryParam('revenue_type');
    var id = Helper.fnGetQueryParam('id');
    var name = Helper.fnGetQueryParam('name');
    Stat.fnInit(dayType, revenueType, id, name);
});
