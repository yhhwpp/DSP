/**
 * @file stat-index.js
 * @description 统计报表
 * @author songxing
*/
var Stat = (function ($) {
    var Stat = function () {
        this.ajaxIsOpen = true;
        this.selectedItems = []; // 显示数据字段选择
        this.selectedMajor = []; // 一级分类,此处可多选，故用数组
        this.span = 2; // 横轴坐标类型1:小时   //2:天  //3:月 // 4:周
        this.dayType = 5; // 默认显示最近7天，1:今天；2：昨天；3：前一天；4：后一天；5：最近七天；6：上周；7：本月；8：历史12月；9：select； 10：本周
        this.dateRenge = { // 报表查询时间
            from: '2015-10-01',
            to: '2015-11-01'
        };
        this.operationList = '';
        this.operationClicks = false;
        // 图表对象
        this.oRenderChart = null;
        // 报表对象
        this.oRenderGrid = null;
        // 默认最多显示多少长度
        this.defaultLength = 6;
        this.dataSourceSchema = {
            model: {
                fields: {
                    time: {
                        type: 'date'
                    },
                    bid_number: {
                        type: 'number'
                    },
                    win_number: {
                        type: 'number'
                    },
                    win_rate: {
                        type: 'number'
                    },
                    impressions: {
                        type: 'number'
                    },
                    clicks: {
                        type: 'number'
                    },
                    clicks_rate: {
                        type: 'number'
                    },
                    af_income: {
                        type: 'number'
                    },
                    ecpm: {
                        type: 'number'
                    },
                    w_number: {
                        type: 'number'
                    },
                    sum_views: {
                        type: 'number'
                    },
                    sum_cpc_clicks: {
                        type: 'number'
                    },
                    sum_download_complete: {
                        type: 'number'
                    },
                    sum_cpa: {
                        type: 'number'
                    },
                    cpd: {
                        type: 'number'
                    },
                    sum_revenue: {
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

        this.itemList = {
            bid_number: {field: 'bid_number', name: '竞价数', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics'},
            win_number: {field: 'win_number', name: '成功数', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics'},
            win_rate: {field: 'win_rate', name: '成功率', chart_type: 'line', format: 'p2', is_default: 0, field_type: 'calculation', arithmetic: ['win_number', '/', 'bid_number']},
            impressions: {field: 'impressions', name: '展示量', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics'},
            clicks: {field: 'clicks', name: '点击量', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics'},
            clicks_rate: {field: 'clicks_rate', name: '点击率', chart_type: 'line', format: 'p2', is_default: 0, field_type: 'calculation', arithmetic: ['clicks', '/', 'impressions']},
            af_income: {field: 'af_income', name: '花费', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics'},
            ecpm: {field: 'ecpm', name: 'eCPM', chart_type: 'line', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['af_income', '/', 'impressions', '*', 1000]},
            w_number: {field: 'w_number', name: '成功数-监控', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics'},
            // sum_download_requests: {field: 'sum_download_requests', name: '请求数-监控', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics'},
            sum_views: {field: 'sum_views', name: '展示-监控', chart_type: 'column', format: 'n0', is_default: 1, field_type: 'basics'},
            sum_cpc_clicks: {field: 'sum_cpc_clicks', name: '点击-监控', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics'},
            sum_cpc_clicks_rate: {field: 'sum_cpc_clicks_rate', name: '点击率-监控', chart_type: 'line', format: 'p2', is_default: 0, field_type: 'calculation', arithmetic: ['sum_cpc_clicks', '/', 'sum_views']},
            sum_download_complete: {field: 'sum_download_complete', name: '下载-监控', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics'},
            sum_cpa: {field: 'sum_cpa', name: 'CPA', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics'},
            cpd: {field: 'cpd', name: '平均单价', chart_type: 'line', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['sum_revenue', '/', '(', 'sum_download_complete', '+', 'sum_cpc_clicks', '+', 'sum_cpa', ')']},
            sum_revenue: {field: 'sum_revenue', name: '广告主消耗', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics'}
        };

        this.columnList = [
            {field: 'date', name: '日期', menu: 0, width: '100px'},
            {field: 'brief_name', name: 'Adx(计费方式)', menu: 1, width: '75px'},
            {field: 'external_zone_id', name: '广告位ID', menu: 1, width: '50px'},
            {field: 'size', name: '广告位说明(尺寸)', menu: 1, width: '70px'},
            {field: 'bid_number', name: '竞价数', menu: 1, format: 'n0', width: '80px'},
            {field: 'win_number', name: '成功数', menu: 1, format: 'n0', width: '80px'},
            {field: 'win_rate', name: '成功率', menu: 1, format: 'p2', width: '52px'},
            {field: 'impressions', name: '展示量', menu: 1, format: 'n0', width: '80px'},
            {field: 'clicks', name: '点击量', menu: 1, format: 'n0', width: '80px'},
            {field: 'clicks_rate', name: '点击率', menu: 1, format: 'p2', width: '52px'},
            {field: 'af_income', name: '花费', menu: 1, format: 'n2', width: '100px'},
            {field: 'ecpm', name: 'eCPM', menu: 1, format: 'n2', width: '55px'},
            {field: 'bannerid', name: 'BannerID（广告名）（计费方式）', menu: 1},
            {field: 'w_number', name: '成功数-监控', menu: 1, format: 'n0', width: '80px'},
            {field: 'sum_views', name: '展示-监控', menu: 1, format: 'n0', width: '80px'},
            {field: 'sum_cpc_clicks', name: '点击-监控', menu: 1, format: 'n0', width: '80px'},
            {field: 'sum_cpc_clicks_rate', name: '点击率-监控', menu: 1, format: 'p2', width: '52px'},
            {field: 'sum_download_complete', name: '下载-监控', menu: 1, format: 'n0', width: '80px'},
            {field: 'sum_cpa', name: 'CPA', menu: 1, format: 'n0', width: '70px'},
            {field: 'cpd', name: '平均单价', menu: 1, format: 'n2', width: '60px'},
            {field: 'sum_revenue', name: '广告主消耗', menu: 1, format: 'n2', width: '80px'},
            {field: 'win_error', name: '成功偏差', menu: 1, format: 'p2', width: '52px'},
            {field: 'profit', name: '毛利', menu: 1, format: 'n2', width: '80px'},
            {field: 'profit_rate', name: '毛利率', menu: 1, format: 'p2', width: '52px'}
        ];

        this.summaryField = [
            {field: 'bid_number', aggregate: 'sum', format: 'n0'},
            {field: 'win_number', aggregate: 'sum', format: 'n0'},
            {field: 'impressions', aggregate: 'sum', format: 'n0'},
            {field: 'clicks', aggregate: 'sum', format: 'n0'},
            {field: 'af_income', aggregate: 'sum', format: 'n2'},
            {field: 'w_number', aggregate: 'sum', format: 'n0'},
            {field: 'sum_views', aggregate: 'sum', format: 'n0'},
            {field: 'sum_cpc_clicks', aggregate: 'sum', format: 'n0'},
            {field: 'sum_download_complete', aggregate: 'sum', format: 'n0'},
            {field: 'sum_cpa', aggregate: 'sum', format: 'n0'},
            {field: 'sum_revenue', aggregate: 'sum', format: 'n2'}
        ];

        this.summaryData = [];

        this.oChartInfo = {
            oRawData: {},
            aformatData: [],
            aChartData: [],
            aChartView: []
        };

        this.adxBaseData = {
            bid_number: 0,
            win_number: 0,
            impressions: 0,
            clicks: 0,
            af_income: 0
        };

        this.clientBaseData = {
            w_number: 0,
            sum_views: 0,
            sum_cpa: 0,
            sum_revenue: 0,
            sum_download_complete: 0,
            sum_cpc_clicks: 0
        };

        this.fieldKey = {
            majorField: 'affiliateid',
            majorFieldLabel: 'brief_name'
        };

        // 报表信息
        this.oGridInfo = {
            // 分页信息
            oPageInfo: {
                currentPage: 1,
                totalPage: 1,
                totalNO: 0,
                pageSize: 50
            }
        };

        this.Yrate = 2;
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

        _cloneObj: function (json) {
            return JSON.parse(JSON.stringify(json));
        },

        fnWeekScope: function (from, to) {
            var arr = [];
            var start = Date.parse(from).moveToDayOfWeek(0).addWeeks(-1);
            var end = Date.parse(to).moveToDayOfWeek(0).addWeeks(-1);
            while (Date.compare(start, end) !== 1) {
                arr.push(start.toString('yyyy-MM-dd'));
                start = start.addWeeks(1);
            }
            return arr;
        },

        fnHourScope: function (from, to) {
            var arr = [];
            for (var i = 0; i < 24; i++) {
                arr.push(from + ' ' + (i < 10 ? '0' : '') + i + ':00:00');
            }
            return arr;
        },

        // 设置纵轴坐标系
        _setValueAjax: function (name, title, format) {
            return {
                name: name,
                labels: {
                    format: '{0:' + format + '}'
                },
                title: {text: Helper.fnInsertString(title.replace('(', '').replace(')', ''), '\n'), font: '12px', rotation: 0},
                // title: {text: title, font: '12px', rotation: -90},
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
            delete this.categoryAxis.labels.template;
            if (this.span === 2) {
                this.categoryAxis.labels.format = '{0:MM月dd日}';
                this.categoryAxis.baseUnit = 'days';
                this.categoryAxis.crosshair.tooltip.format = 'MM月dd日';
                dateArr = Helper.fnDateScope(this.dateRenge.from, this.dateRenge.to);
            }
            else if (this.span === 3) {
                this.categoryAxis.labels.format = '{0:MM月}';
                this.categoryAxis.baseUnit = 'months';
                this.categoryAxis.crosshair.tooltip.format = 'MM月';
                dateArr = Helper.fnMonthScope(this.dateRenge.from, this.dateRenge.to);
            }
            else if (this.span === 4) {
                this.categoryAxis.labels.format = '{0:MM月dd日}';
                this.categoryAxis.labels.template = function (obj) {
                    var date = Date.parse(obj.value.toString('yyyy-MM-dd'));
                    return date.toString('MM-dd') + ' ~ ' + date.addDays(6).toString('dd');
                };
                this.categoryAxis.baseUnit = 'weeks';
                this.categoryAxis.crosshair.tooltip.format = 'MM月dd日';
                dateArr = this.fnWeekScope(this.dateRenge.from, this.dateRenge.to);
            }
            else {
                this.categoryAxis.labels.format = '{0:t}';
                this.categoryAxis.baseUnit = 'hours';
                this.categoryAxis.crosshair.tooltip.format = 't';
                this.categoryAxis.majorGridLines.step = 3;
                dateArr = this.fnHourScope(this.dateRenge.from, this.dateRenge.to);
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

            // if (!this.categoryAxis.crosshair.template) {
            //     this.categoryAxis.crosshair.tooltip.template = function (obj) {
            //         return _this._renderCrosshairTooltip(obj);
            //     };
            // }
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

        _getGeneralData: function () {
            var _this = this;
            var param = {
                period_start: _this.dateRenge.from,
                period_end: _this.dateRenge.to,
                span: _this.span === 1 ? 1 : 2,
                zone_offset: '-8'
            };
            this._ajaxOpen();
            $.get(API_URL.manager_stat_adx_report, param, function (result) {
                if (!result.res) {
                    _this._ajaxClose();
                    _this.oChartInfo.oRawData = result.list ? result.list : {};
                    _this.oChartInfo.aformatData = _this._formatChartData(_this.oChartInfo.oRawData);
                    _this._setCategoryAxis();
                    _this._genChart();
                }
                else {
                    _this._ajaxClose();
                    Helper.fnAlert(result.msg);
                }
                _this = null;
            }).fail(function () {
                _this._ajaxClose();
                Helper.fnAlert('服务器请求失败，请稍后重试');
                _this = null;
            });
        },

        // 格式化图表数据
        _formatChartData: function (data) {
            var arr = [];
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    for (var key1 in data[key]) {
                        if (data[key].hasOwnProperty(key1)) {
                            var tmp = data[key][key1];
                            var tmpData = {time: tmp.time, affiliateid: tmp.affiliateid, brief_name: tmp.brief_name, media_revenue_type: tmp.media_revenue_type};
                            var i = 0;
                            if (tmp.child.adx) {
                                for (i = 0; i < tmp.child.adx.length; i++) {
                                    arr.push($.extend({}, tmp.child.adx[i], tmpData));
                                }
                            }
                            if (tmp.child.client) {
                                for (i = 0; i < tmp.child.client.length; i++) {
                                    arr.push($.extend({}, tmp.child.client[i], tmpData));
                                }
                            }
                        }
                    }
                }
            }
            return arr;
        },

        _genChart: function () {
            var aRawData = this.oChartInfo.aformatData;
            this._renderSelectMajor(this._cloneObj(aRawData));
            this._screenData();
        },

        _renderSelectMajor: function (data) {
            var selectedMajor = this.selectedMajor;
            var schema = this.schema;
            var fieldKey = this.fieldKey;
            var dataSource = new kendo.data.DataSource({
                data: data,
                group: {
                    field: fieldKey.majorField,
                    aggregates: [
                        {field: 'af_income', aggregate: 'sum'}
                    ]
                },
                schema: schema
            });
            dataSource.read();
            var view = dataSource.view();
            view.sort(function (a, b) {
                return b.aggregates.af_income.sum - a.aggregates.af_income.sum;
            });

            var html = '<option value="all">请选择adx</option>';
            var tmp = null;
            for (var i = 0; i < view.length; i++) {
                tmp = view[i].items[0];
                html += '<option value="' + tmp[fieldKey.majorField] + '" ' + (String(tmp[fieldKey.majorField]) === selectedMajor ? 'selected' : '') + '>' + tmp[fieldKey.majorFieldLabel] + '</option>';
            }
            $('#select-major').html(html);

            this.selectedMajor = $('#select-major').val();
        },

        _screenData: function () {
            var selectedMajor = this.selectedMajor;
            var aRawData = this.oChartInfo.aformatData;
            var fieldKey = this.fieldKey;
            var aChartData = [];
            if (selectedMajor === 'all') {
                aChartData = aRawData;
            }
            else {
                for (var i = 0; i < aRawData.length; i++) {
                    if (String(aRawData[i][fieldKey.majorField]) === selectedMajor) {
                        aChartData.push(aRawData[i]);
                    }
                }
            }
            this.oChartInfo.aChartData = aChartData;
            this.oChartInfo.aChartView = this._sortChartData(this._cloneObj(aChartData), this.fieldKey.majorField);
            this._renderChart();
            this._showGrid();
        },

        _sortChartData: function (aChartData, field) {
            var schema = $.extend({}, this.dataSourceSchema);
            var itemList = this.itemList;
            var aggregates = [];
            for (var k in itemList) {
                if (itemList.hasOwnProperty(k)) {
                    tmp = itemList[k];
                    if (tmp.field_type === 'basics') {
                        aggregates.push({field: tmp.field, aggregate: 'sum'});
                    }
                }
            }
            var stocksDataSource = new kendo.data.DataSource({
                data: aChartData,
                group: {
                    field: field,
                    aggregates: aggregates
                },
                schema: schema
            });
            stocksDataSource.read();
            var view = stocksDataSource.view();
            return view;
        },

        _renderChart: function () {
            var len = this.selectedItems.length;
            if (len <= 0) {
                return;
            }
            var _this = this;
            var view = this.oChartInfo.aChartView;
            var ll = view.length;
            var aChartData = [];
            var categoryAxis = this.categoryAxis;
            var series = [];
            var valueAxis = [];
            var aggregates = [];
            var dataField = this.fieldKey.majorField;
            var nameKey = this.fieldKey.majorFieldLabel;

            var field = this.selectedItems[0];
            var itemList = this.itemList;
            var item = itemList[field];
            var type = len > 1 ? 'column' : item.chart_type;
            var stack = type === 'line' ? false :  field;

            var defaultLength = this.defaultLength;
            var end = ll < defaultLength ? ll : defaultLength;
            var dateRenge = this.dateRenge;
            var tmpData = [];
            var dateFrom = dateRenge.from;
            var dateEnd = dateRenge.to;
            if (this.span === 1) {
                dateFrom = dateRenge.from + ' 00:00:00';
                dateEnd = dateRenge.to + ' 23:59:59';
            }

            var initData = [{time: Date.parse(dateFrom)}, {time: Date.parse(dateEnd)}];
            var valueAxisName = 'first';
            valueAxis.push(this._setValueAjax(valueAxisName, item.name, item.format));

            var fieldType = itemList[field].field_type;
            var arithmetic = itemList[field].arithmetic;
            view.sort(function (a, b) {
                if (fieldType === 'basics') {
                    return b.aggregates[field].sum - a.aggregates[field].sum;
                }
                return _this.fnCalculate(b.aggregates, arithmetic, 'sum') - _this.fnCalculate(a.aggregates, arithmetic, 'sum');
            });

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
                        field: dataField,
                        aggregates: aggregates
                    }
                ]
            });
            seriesDataSource.read();
            this.seriesDataSource = seriesDataSource;

            if (len > 1) {
                field = this.selectedItems[1];
                item = itemList[field];
                type = 'line';

                var field1 = this.selectedItems[0];
                var field2 = this.selectedItems[1];
                var mergeFlag = false;
                var format = '';
                if (itemList[field1].format === 'p2' && itemList[field2].format === 'p2') {
                    mergeFlag = true;
                }
                else if (itemList[field1].format !== 'p2' && itemList[field2].format !== 'p2') {
                    var max1 = 0;
                    var max2 = 0;
                    var num1 = 0;
                    var num2 = 0;
                    var tmpView = null;
                    var seriesView = seriesDataSource.view();
                    for (i = 0; i < seriesView.length; i++) {
                        tmpView = seriesView[i];
                        if (itemList[field1].field_type === 'basics') {
                            num1 = tmpView.aggregates[field1].sum;
                        }
                        else {
                            num1 = this.fnCalculate(tmpView.aggregates, itemList[field1].arithmetic, 'sum');
                        }
                        if (itemList[field2].field_type === 'basics') {
                            num2 = tmpView.aggregates[field2].sum;
                        }
                        else {
                            num2 = this.fnCalculate(tmpView.aggregates, itemList[field2].arithmetic, 'sum');
                        }
                        max1 = max1 < num1 ? num1 : max1;
                        max2 = max2 < num2 ? num2 : max2;
                    }
                    // 合并待继续优化
                    var rate = isFinite(max1 / max2) ? max1 / max2 : 0;
                    if (rate <= this.Yrate && rate >= (1 / this.Yrate)) {
                        mergeFlag = true;
                    }
                    if (itemList[field1].format !== itemList[field2].format) {
                        format = itemList[field1].format > itemList[field2].format ? itemList[field1].format : itemList[field2].format;
                    }
                }

                if (mergeFlag) {
                    valueAxisName = 'first';
                    valueAxis[0].title = null;
                    if (format) {
                        valueAxis[0].labels.format = '{0:' + format + '}';
                    }
                }
                else {
                    valueAxisName = 'second';
                    valueAxis.push(this._setValueAjax(valueAxisName, item.name, item.format));
                }

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
        },

        _renderCrosshairTooltip: function (obj) {
            var selectedItems = this.selectedItems;
            var itemList = this.itemList;
            var len = selectedItems.length;
            var categoryAxis = this.categoryAxis;

            if (obj.value && this.selectedMajor === 'all' && len === 1 && itemList[selectedItems[0]].chart_type === 'column') {
                var date = obj.value;
                var view = this.seriesDataSource.view();
                var tmp = null;
                var curDate = Date.parse(date.toString('yyyy-MM-dd HH:mm:ss')); // 直接复制对象，后面日期累加时，原对象也会累加
                var dataItem = {};
                var summary = {};
                var field = selectedItems[0];
                var itemInfo = itemList[field];
                var val = 0;
                var hasValue = false;
                for (var i = 0, l = view.length; i < l; i++) {
                    tmp = view[i];
                    if (Date.parse(tmp.value).compareTo(curDate) === 0) {
                        dataItem = tmp.aggregates;
                        hasValue = true;
                        break;
                    }
                }
                if (hasValue) {
                    for (var key in dataItem) {
                        if (dataItem.hasOwnProperty(key)) {
                            summary[key] = dataItem[key].sum;
                        }
                    }
                    if (itemInfo.field_type === 'basics') {
                        val = summary[field];
                    }
                    else {
                        val = this.fnCalculate(summary, itemInfo.arithmetic);
                    }
                }
                return kendo.toString(val, itemInfo.format);
            }

            return kendo.toString(obj.value, categoryAxis.crosshair.tooltip.format);
        },

        _aggregateFunc: function (values, series, dataItems, category) {
            var itemList = this.itemList;
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
                if (itemList.hasOwnProperty(k) && itemList[k].field_type === 'basics') {
                    summary[itemList[k].field] = 0;
                }
            }
            for (i = 0; i < l; i++) {
                tmp = dataItems[i];
                for (var key in summary) {
                    if (summary.hasOwnProperty(key)) {
                        summary[key] += tmp[key] ? (+tmp[key]) : 0;
                    }
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

        fnCalculate: function (summary, arithmetic, field) {
            var arr = [];
            var tmp = null;
            var val = 0;
            for (var i = 0, l = arithmetic.length; i < l; i++) {
                tmp = arithmetic[i];
                if (summary.hasOwnProperty(tmp)) {
                    if (field) {
                        arr.push(summary[tmp][field]);
                    }
                    else {
                        arr.push(summary[tmp]);
                    }
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

        // 显示报表
        _showGrid: function () {
            var oRawData = this.oChartInfo.aChartData;
            var formatData = this._formatGridData(oRawData);
            var aGridData = this._gridDataToArr(formatData);
            this.oGridInfo.aShowData = aGridData;
            this._renderGrid();
        },

        _formatTime: function (time) {
            var span = this.span;
            if (span === 1 || span === 2) {
                return time;
            }
            if (span === 3) {
                return Date.parse(time).moveToFirstDayOfMonth().toString('yyyy-MM-dd');
            }
            if (span === 4) {
                return Date.parse(time).moveToDayOfWeek(0).addWeeks(-1).toString('yyyy-MM-dd');
            }
        },

        _formatGridData: function (data) {
            var obj = {};
            var dateList = this.dateList;
            dateList = dateList.reverse();
            var adxBaseData = this.adxBaseData;
            var clientBaseData = this.clientBaseData;
            var tmpDate = null;
            var tmpData = null;
            var key = null;

            for (var i = 0; i < dateList.length; i++) {
                obj[dateList[i]] = {};
            }

            for (var j = 0; j < data.length; j++) {
                tmpData = data[j];
                tmpDate = this._formatTime(tmpData.time);
                if (obj[tmpDate][tmpData.affiliateid] === undefined) {
                    obj[tmpDate][tmpData.affiliateid] = {
                        affiliateid: tmpData.affiliateid,
                        brief_name: tmpData.brief_name,
                        media_revenue_type: tmpData.media_revenue_type,
                        child: {
                            adx: {},
                            client: {}
                        }
                    };
                }
                if (tmpData.bannerid) {
                    if (obj[tmpDate][tmpData.affiliateid].child.client[tmpData.bannerid] === undefined) {
                        obj[tmpDate][tmpData.affiliateid].child.client[tmpData.bannerid] = $.extend({}, tmpData);
                    }
                    else {
                        for (key in clientBaseData) {
                            obj[tmpDate][tmpData.affiliateid].child.client[tmpData.bannerid][key] = Number(obj[tmpDate][tmpData.affiliateid].child.client[tmpData.bannerid][key]) + Number(tmpData[key]);
                        }
                    }
                }
                else {
                    if (obj[tmpDate][tmpData.affiliateid].child.adx[tmpData.external_zone_id] === undefined) {
                        obj[tmpDate][tmpData.affiliateid].child.adx[tmpData.external_zone_id] = $.extend({}, tmpData);
                    }
                    else {
                        for (key in adxBaseData) {
                            obj[tmpDate][tmpData.affiliateid].child.adx[tmpData.external_zone_id][key] = Number(obj[tmpDate][tmpData.affiliateid].child.adx[tmpData.external_zone_id][key]) + Number(tmpData[key]);
                        }
                    }
                }
            }
            return obj;
        },

        // 数据转为数组数据
        _gridDataToArr: function (data) {
            var arr = [];
            var adxBaseData = this.adxBaseData;
            var clientBaseData = this.clientBaseData;
            var baseData = $.extend({}, adxBaseData, clientBaseData);
            for (var date in data) {
                if (data.hasOwnProperty(date)) {
                    var id1 = Math.random();
                    var summaryData = $.extend({date: date, parentId: null, id: id1, cpd: 0, _num: 0}, baseData);
                    for (var affiliateid in data[date]) {
                        if (data[date].hasOwnProperty(affiliateid)) {
                            var tmpAf = data[date][affiliateid];
                            var id2 = Math.random();
                            var summaryAfData = $.extend({
                                affiliateid: affiliateid,
                                brief_name: tmpAf.brief_name,
                                media_revenue_type: tmpAf.media_revenue_type,
                                parentId: id1,
                                id: id2,
                                cpd: 0,
                                _num: 0
                            }, baseData);
                            var tmpArr = [];
                            var tmpD = null;
                            for (var bannerid in tmpAf.child.client) {
                                if (tmpAf.child.client.hasOwnProperty(bannerid)) {
                                    var tmpClient = tmpAf.child.client[bannerid];
                                    tmpD = $.extend({parentId: id2}, tmpClient);
                                    delete tmpD.brief_name;
                                    tmpD = this._calculatClientData(tmpD);
                                    tmpArr.push(tmpD);
                                    summaryAfData = this._setSummaryData(summaryAfData, tmpD, clientBaseData);
                                }
                            }

                            var index = 0;
                            for (var zoneid in tmpAf.child.adx) {
                                if (tmpAf.child.adx.hasOwnProperty(zoneid)) {
                                    var tmpAdx = tmpAf.child.adx[zoneid];
                                    if (tmpArr[index] !== undefined) {
                                        tmpD = $.extend({}, tmpArr[index], tmpAdx);
                                        delete tmpD.brief_name;
                                        tmpArr[index] = $.extend({}, tmpArr[index], tmpD);
                                    }
                                    else {
                                        tmpD = $.extend({parentId: id2}, tmpAdx);
                                        delete tmpD.brief_name;
                                        tmpArr.push(this._calculatAdxData(tmpD));
                                    }
                                    summaryAfData = this._setSummaryData(summaryAfData, tmpAdx, adxBaseData);
                                    index++;
                                }
                            }

                            arr = arr.concat(tmpArr);
                            arr.push(this._calculatSummaryData(summaryAfData));
                            summaryData = this._setSummaryData(summaryData, summaryAfData, baseData);
                        }
                    }

                    arr.push(this._calculatSummaryData(summaryData));
                }
            }
            return arr;
        },

        // 计算adx数据
        _calculatAdxData: function (data) {
            data.bid_number = Number(data.bid_number);
            data.win_number = Number(data.win_number);
            data.impressions = Number(data.impressions);
            data.clicks = Number(data.clicks);
            data.af_income = Number(data.af_income);
            data.sum_payment = Number(data.sum_payment);

            data.win_rate = isFinite(data.win_number / data.bid_number) ? data.win_number / data.bid_number : 0;
            data.clicks_rate = isFinite(data.clicks / data.impressions) ? data.clicks / data.impressions : 0;
            data.ecpm = isFinite(data.af_income / data.impressions * 1000) ? data.af_income / data.impressions * 1000 : 0;

            return data;
        },

        // 计算clinet数据
        _calculatClientData: function (data) {
            data.w_number = Number(data.w_number);
            data.sum_views = Number(data.sum_views);
            data.sum_cpa = Number(data.sum_cpa);
            data.sum_revenue = Number(data.sum_revenue);
            data.sum_download_complete = Number(data.sum_download_complete);
            data.sum_cpc_clicks = Number(data.sum_cpc_clicks);
            data.sum_cpc_clicks_rate = isFinite(data.sum_cpc_clicks / data.sum_views) ? data.sum_cpc_clicks / data.sum_views : 0;

            if (data.client_revenue_type === CONSTANT.revenue_type_cpc) {
                data.cpd = isFinite(data.sum_revenue / data.sum_cpc_clicks) ? data.sum_revenue / data.sum_cpc_clicks : 0;
            }
            else if (data.client_revenue_type === CONSTANT.revenue_type_cpm) {
                data.cpd = isFinite(data.sum_revenue / (data.sum_views / 1000)) ? data.sum_revenue / (data.sum_views / 1000) : 0;
            }
            else if (data.client_revenue_type === CONSTANT.revenue_type_cpd) {
                data.cpd = isFinite(data.sum_revenue / data.sum_download_complete) ? data.sum_revenue / data.sum_download_complete : 0;
            }
            else if (data.client_revenue_type === CONSTANT.revenue_type_cpa) {
                data.cpd = isFinite(data.sum_revenue / data.sum_cpa) ? data.sum_revenue / data.sum_cpa : 0;
            }
            else {
                data.cpd = 0;
            }
            return data;
        },

        // 计算汇总数据
        _calculatSummaryData: function (data) {
            data.win_rate = isFinite(data.win_number / data.bid_number) ? data.win_number / data.bid_number : 0;
            data.clicks_rate = isFinite(data.clicks / data.impressions) ? data.clicks / data.impressions : 0;
            data.ecpm = isFinite(data.af_income / data.impressions * 1000) ? data.af_income / data.impressions * 1000 : 0;

            data.cpd = isFinite(data.cpd / data._num) ? data.cpd / data._num : 0;

            data.profit = data.sum_revenue - data.af_income;
            data.profit_rate = isFinite(data.profit / data.sum_revenue) ? data.profit / data.sum_revenue : 0;
            data.win_error = isFinite((data.win_number - data.w_number) / data.win_number) ? (data.win_number - data.w_number) / data.win_number : 0;
            data.sum_cpc_clicks_rate = isFinite(data.sum_cpc_clicks / data.sum_views) ? data.sum_cpc_clicks / data.sum_views : 0;
            return data;
        },

        // 计算报表树状数据
        _setSummaryData: function (summary, data, baseData) {
            for (var key in baseData) {
                if (baseData.hasOwnProperty(key)) {
                    summary[key] += (+data[key]);
                }
            }
            if (data.cpd !== undefined) {
                summary.cpd +=  (+data.cpd);
                summary._num++;
            }
            return summary;
        },

        // 重置分页信息
        _resetPage: function (data) {
            var aData = data ? data : this.dateList;
            var pageSize = +$('#select-grid-pagesize').val();
            var len = aData.length;
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
            var tabColumns = this.columnList;
            var tmp = null;
            var col = null;
            var html = '<tfoot><tr id="table-summary" class="k-footer-template" data-parentid="null">';
            var span = this.span;
            for (var i = 0, l = tabColumns.length; i < l; i++) {
                tmp = tabColumns[i];
                col = {
                    field: tmp.field,
                    title: tmp.name,
                    menu: !!(+tmp.menu)
                };
                if (i === 0) {
                    var _date1 = 'data.date';
                    var _date2 = 'data.date';
                    if (span === 1) {
                        _date1 = 'data.date';
                        _date2 = 'Date.parse(data.date).toString("HH:mm")';
                    }
                    else if (span === 3) {
                        _date1 = 'Date.parse(data.date).toString("yyyy-MM")';
                        _date2 = 'Date.parse(data.date).toString("yyyy-MM")';
                    }
                    else if (span === 4) {
                        _date1 = 'Date.parse(data.date).toString("yyyy-MM-dd") + " ~ " + Date.parse(data.date).addDays(6).toString("yyyy-MM-dd")';
                        _date2 = 'Date.parse(data.date).toString("MM-dd") + " ~ " + Date.parse(data.date).addDays(6).toString("dd")';
                    }
                    col.template = '#if (data.date){ # <span title="#: ' + _date1 + ' #" data-id="#:data.id#"> #: ' + _date2 + '# </span> # } #';
                }
                else {
                    col.headerAttributes = {'class': 'k-header hidden-menu'};
                }
                if (tmp.field === 'brief_name') {
                    col.template = '#if (data.brief_name){ # <span title="#: data.brief_name #(#: LANG.adx_revenue_type[data.media_revenue_type]#)"> #: data.brief_name# (#: LANG.adx_revenue_type[data.media_revenue_type]#)</span> # } #';
                }
                else if (tmp.field === 'bannerid') {
                    col.template = '#if (data.bannerid){ # <span title="#: data.bannerid ##: data.app_name #(#: LANG.revenue_type[data.client_revenue_type]#)"> #: data.bannerid #(#: data.app_name #)(#: LANG.revenue_type[data.client_revenue_type]#)</span> # } #';
                }
                else if (tmp.field === 'size') {
                    col.template = '#if (data.size){ # <span title="#: data.size #"> #: data.size# </span> # } #';
                }

                if (tmp.format) {
                    col.format = '{0:' + tmp.format + '}';
                }
                if (tmp.width) {
                    col.width = tmp.width;
                }

                html += '<td data-type="' + tmp.field + '" role="gridcell">'
                    + (i === 0 ? '<span class="k-icon k-i-none"></span>汇总' : '-')
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
            this.oGridInfo.pagerEvent = true;
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
            schema.model.id = 'id';
            schema.model.parentId = 'parentId';
            var opt = {
                data: aShowData,
                schema: schema
            };
            var search = $.trim($('#data-search').val());
            if (search !== '') {
                var filters = [];
                var tabColumns = this.columnList[this.role];
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

            var dataSource = new kendo.data.TreeListDataSource(opt);
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
            if (this.oRenderGrid) {
                this.oRenderGrid.destroy();
                $('#treelist').html('');
            }

            schema.model.id = 'id';
            schema.model.parentId = 'parentId';
            schema.parse = function (response) {
                response = _this._setData();
                var i = 0;
                var l = 0;
                var idArr = [];
                var showIds = [];
                var data = [];
                var tmp = null;
                var summaryArr = [];
                for (i = 0, l = response.length; i < l; i++) {
                    if (response[i].parentId === null) {
                        tmp = response[i];
                        idArr.push(tmp.id);
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
                var threeLevelParentIds = [];
                var allData = response;
                showIds = idArr.slice(start, start + pageSize);
                for (i = 0, l = allData.length; i < l; i++) {
                    tmp = allData[i];
                    // 汇总数据
                    if (tmp.parentId === null) {
                        summaryArr.push(tmp);
                    }
                    // 一级
                    if ($.inArray(tmp.id, showIds) > -1) {
                        data.push(tmp);
                    }
                    // 二级
                    if ($.inArray(tmp.parentId, showIds) > -1) {
                        data.push(tmp);
                        threeLevelParentIds.push(tmp.id);
                    }
                }

                for (i = 0, l = allData.length; i < l; i++) {
                    tmp = allData[i];
                    // 三级
                    if ($.inArray(tmp.parentId, threeLevelParentIds) > -1) {
                        data.push(tmp);
                    }
                }

                _this._renderPage();
                _this.summaryData = summaryArr;
                _this._renderSummary();
                return data;
            };

            var dataSource = new kendo.data.TreeListDataSource({
                data: aShowData,
                serverSorting: true,
                sort: {field: 'date', dir: 'desc'},
                schema: schema
            });

            var gridInfo = this._genGrid();
            $('#treelist').kendoTreeList({
                dataSource: dataSource,
                columns: gridInfo.columns,
                columnMenu: true,
                resizable: true,
                sortable: true,
                columnResizeHandleWidth: 10,
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
            $('#treelist .k-grid-content table').append(gridInfo.footHtml);
            this._renderSummary();

            if (_this.oRenderChart) {
                _this.oRenderChart.resize();
            }
        },
        // 显示汇总列
        _showColumn: function (e) {
            $('#table-summary [data-type="' + e.column.field + '"]').show();
            this._recordColumn(e, 'show');
        },
        // 隐藏汇总列
        _hideColumn: function (e) {
            $('#table-summary [data-type="' + e.column.field + '"]').hide();
            this._recordColumn(e, 'hide');
        },

        _recordColumn: function (e, action) {
            var localStorage = window.localStorage;
            var role = this.role;
            var flag = false;
            var storage = localStorage[role] ? JSON.parse(localStorage[role]) : [];

            for (var i = 0; i < storage.length; i++) {
                if (storage[i].field === e.column.field) {
                    flag = true;
                    storage[i].hidden = !(action === 'show');
                    break;
                }
            }

            if (!flag) {
                storage.push({
                    field: e.column.field,
                    hidden: !(action === 'show')
                });
            }
            localStorage[role] = JSON.stringify(storage);
        },

        _renderSummary: function () {
            if ($('#table-summary').length > 0) {
                var data = this.summaryData;
                var schema = $.extend({}, this.dataSourceSchema);
                var summaryField = this.summaryField;
                var stocksDataSource = new kendo.data.DataSource({
                    data: data,
                    aggregate: summaryField,
                    schema: schema
                });

                stocksDataSource.read();
                var summary = stocksDataSource.aggregates();
                for (var i = 0, l = summaryField.length; i < l; i++) {
                    var tmp = summaryField[i];
                    $('#table-summary [data-type="' + tmp.field + '"]').html(kendo.toString(summary[tmp.field].sum, tmp.format));
                }
            }
        },

        // 创建头部导航
        _renderMenu: function () {
            var _this = this;
            /* eslint no-undef: [0]*/
            fnIsLogin(function (json) {
                if (json && json.res === 0) {
                    var html = '';
                    var operationList = json.obj.operation_list;
                    _this.operationList = operationList;
                    _this._renderSelectItem();
                    if (operationList.indexOf(OPERATION_LIST.manager_stats_income_trafficker) > -1) {
                        html += '<span class="btn-m" data-role="zones" data-audit="0">收入报表-媒体商</span>';
                    }
                    if (operationList.indexOf(OPERATION_LIST.manager_stats_income_client) > -1) {
                        html += '<span class="btn-m" data-role="clients" data-audit="0">收入报表-广告主</span>';
                    }
                    if (operationList.indexOf(OPERATION_LIST.manager_stats_audit_trafficker) > -1) {
                        html += '<span class="btn-m" data-role="zones" data-audit="1">审计收入-媒体商</span>';
                    }
                    if (operationList.indexOf(OPERATION_LIST.manager_stats_audit_client) > -1) {
                        html += '<span class="btn-m" data-role="clients" data-audit="1">审计收入-广告主</span>';
                    }
                    html += '<span class="btn-m cur" data-role="adx">Adx报表</span>';
                }
                $('#nav-menu-wrapper').html(html);
                _this._getGeneralData();
                _this = null;
            });
        },

        // 创建字段选择框
        _renderSelectItem: function () {
            var _this = this;
            var items = this.itemList;
            var html = '';
            var tmp = null;
            var selectedItems = this.selectedItems;
            var len = selectedItems.length;
            var $ele = $('#select-item').prop('multiple', 'multiple');
            for (var key in items) {
                if (items.hasOwnProperty(key)) {
                    tmp = items[key];
                    if (!tmp.hidden) {
                        if (len > 0) {
                            html += '<option value="' + tmp.field + '" ' + ($.inArray(tmp.field, selectedItems) >= 0 ? 'selected' : '') + '>' + tmp.name + '</option>';
                        }
                        else {
                            html += '<option value="' + tmp.field + '" ' + ((+tmp.is_default) ? 'selected' : '') + '>' + tmp.name + '</option>';
                        }
                    }
                }
            }
            $ele.html(html);
            var val = $ele.val();
            if (!val) {
                $ele.find('option').eq(0).attr('selected', true);
            }
            $ele.multiselect({
                selectedClass: 'multiselect-selected',
                buttonWidth: '100%',
                nonSelectedText: '请选择',
                onChange: function (option, checked) {
                    _this._multiselectChange();
                }
            }).trigger('change', 'render');
            _this._multiselectChange();
        },

        // 设置多选最多选择两项，最少选择一项
        _multiselectChange: function () {
            $ele = $('#select-item');
            var selectedOptions = $ele.find('option:selected');
            var dropdown = $ele.parent().find('.multiselect-container');

            var nonSelectedOptions = $ele.find('option').filter(function () {
                return !$(this).is(':selected');
            });

            if (selectedOptions.length >= 2) {
                // enable 已选定的两项
                selectedOptions.each(function () {
                    var input = dropdown.find('input[value="' + $(this).val() + '"]');
                    input.prop('disabled', false);
                    input.parent('li').removeClass('disabled');
                });

                // Disable 其它未选中的
                nonSelectedOptions.each(function () {
                    var input = dropdown.find('input[value="' + $(this).val() + '"]');
                    input.prop('disabled', true);
                    input.parent('li').addClass('disabled');
                });
            }
            else if (selectedOptions.length === 1) {
                // Disable 选中的一项
                var input = dropdown.find('input[value="' + $(selectedOptions).val() + '"]');
                input.prop('disabled', true);
                input.parent('li').addClass('disabled');

                // enable 其它未选中的
                nonSelectedOptions.each(function () {
                    var input = dropdown.find('input[value="' + $(this).val() + '"]');
                    input.prop('disabled', false);
                    input.parent('li').removeClass('disabled');
                });
            }
            else {
                // Enable all checkboxes.
                nonSelectedOptions.each(function () {
                    var input = dropdown.find('input[value="' + $(this).val() + '"]');
                    input.prop('disabled', false);
                    input.parent('li').removeClass('disabled');
                });
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

            var span = this.span;
            if (span === 1) {
                $('.js-span-select').hide();
            }
            else {
                $('.js-span-select [data-span]').hide();
                if (Date.parse(from).moveToDayOfWeek(0).addWeeks(-1).getWeek() !== Date.parse(to).moveToDayOfWeek(0).addWeeks(-1).getWeek()) {
                    $('.js-span-select [data-span="4"]').show();
                }
                if (Date.parse(from).getMonth() !== Date.parse(to).getMonth()) {
                    $('.js-span-select [data-span="3"]').show();
                }
                $('.js-span-select [data-span="2"]').show().addClass('cur').siblings().removeClass('cur');
                $('.js-span-select').show();
            }
        },

        // 快速选择功能实现
        _fastSelectDay: function (nDayType) {
            var sDayFrom = '';
            var sDayTo = '';
            var oDay = null;
            this.span = 2; // 天
            switch (nDayType) {
                case 1: // 今天
                    sDayFrom = sDayTo = Date.today().toString('yyyy-MM-dd');
                    break;
                case 2: // 昨日
                    sDayFrom = sDayTo = Date.today().add(-1).days().toString('yyyy-MM-dd');
                    break;
                case 3: // 前一天
                    oDay = new Date(this.dateRenge.from.replace(/-/g, '/'));
                    sDayFrom = sDayTo = oDay.add(-1).days().toString('yyyy-MM-dd');
                    break;
                case 4: // 后一天
                    oDay = new Date(this.dateRenge.from.replace(/-/g, '/'));
                    sDayFrom = sDayTo = oDay.add(1).days().toString('yyyy-MM-dd');
                    break;
                case 5: // 最近7天
                    oDay = Date.today();
                    sDayTo = oDay.toString('yyyy-MM-dd');
                    sDayFrom = oDay.add(-6).days().toString('yyyy-MM-dd');
                    break;
                case 6: // 上周
                    oDay = Date.sunday(); // 周日
                    sDayFrom = oDay.add(-7).days().toString('yyyy-MM-dd');
                    sDayTo = oDay.add(6).days().toString('yyyy-MM-dd');
                    break;
                case 8: // 最近12个月
                    sDayFrom = Date.today().addMonths(-12).moveToFirstDayOfMonth().toString('yyyy-MM-dd');
                    sDayTo = Date.today().addMonths(-1).moveToLastDayOfMonth().toString('yyyy-MM-dd');
                    this.span = 3;
                    break;
                case 10: // 本周
                    sDayFrom = Date.sunday().toString('yyyy-MM-dd');
                    sDayTo = Date.today().toString('yyyy-MM-dd');
                    break;
                default: // 本月 默认type为7
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
            this._getGeneralData();
        },

        // 更改字段选择处理函数
        _changeItem: function ($ele) {
            this.selectedItems = $ele.val();
            if (!this.selectedItems) {
                this.selectedItems = [];
            }
        },

        // 更改主分类
        _changeMajor: function ($ele) {
            var value = $ele.val();
            if (!value) {
                this.selectedMajor = [];
            }
            else {
                this.selectedMajor = value;
            }
            $('#select-secondary').html('').parent().hide();
            $('#select-third').html('').parent().hide();
            this.selectedSecondary = 'all';
            this.selectedThird = 'all';
        },

        // 更改次分类
        _changeSecondary: function ($ele) {
            this.selectedSecondary = $ele.val();
            $('#select-third').html('').parent().hide();
            this.selectedThird = 'all';
        },

        // 更改次分类
        _changeThird: function ($ele) {
            this.selectedThird = $ele.val();
        },

        // 菜单导航点击事件主体
        _changeMenu: function ($ele) {
            var role = $ele.attr('data-role');
            var audit = $ele.attr('data-audit');
            if (role !== 'adx') {
                window.location = './index.html#role=' + role + '&audit=' + audit;
            }
        },

        // 业务类型改变时
        _changeSelectedBusinessType: function ($ele) {
            this.selectedBusinessType = $ele.val();
        },

        // 广告主计费类型改变时
        _changeSelectedCtRt: function ($ele) {
            this.selectedCtRt = $ele.val();
        },

        // 媒体商计费类型改变时
        _changeSelectedAfRt: function ($ele) {
            this.selectedAfRt = $ele.val();
        },

        fnInit: function (dayType) {
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
                case 10:
                    this.dayType = dayType;
                    break;
                default:
                    break;
            }

            $('#query').click(function () {
                _this.selectedThird = 'all';
                $('#select-third').html('').parent().hide();
                _this._selectDay();
            });

            // 导航菜单事件驱动
            $('#nav-menu-wrapper').on('click', '[data-role]', function () {
                _this._changeMenu($(this));
                _this._getGeneralData();
            });

            // 数据列表事件驱动
            $('#select-item').on('change', function (e, type) {
                _this._changeItem($(this));
                if (type !== 'render') {
                    _this._renderChart();
                }
            });

            // 主分类事件驱动
            $('#select-major').on('change', function () {
                _this._changeMajor($(this));
                _this._screenData();
            });

            $('#page-wripper').on('click', 'a[data-page]', function (e) {
                if (!$(this).hasClass('k-state-disabled')) {
                    _this._gotoPage($(this).data('page'));
                    $(document).scrollTop($(document).height());
                }
            });

            $('#select-grid-pagesize').change(function (event) {
                _this._resetPage();
                _this._refreshGrid();
            });

            $('.js-day-select').on('click', '[data-type="select-day"]', function () {
                _this._fastSelectDay($(this).data('day-type'));
                _this._getGeneralData();
            });

            $('.js-span-select').on('click', '[data-type="select-span"]', function () {
                $(this).addClass('cur').siblings().removeClass('cur');
                _this.span = +$(this).data('span');
                _this._setCategoryAxis();
                _this._renderChart();
                _this._showGrid();
            });

            // 搜索框事件
            $('#data-search').on('input propertychange', function () {
                _this._refreshGrid();
            });

            $(window).resize(function (event) {
                if (_this.oRenderChart) {
                    _this.oRenderChart.resize();
                }
            });

            $(window).scroll(function () {
                Helper.fnFixedHead($('#treelist'));
                var y = $(document).scrollTop();
                y > 10 ? $('#goto-top-btn').fadeIn() : $('#goto-top-btn').fadeOut();
                (y < $(document).height() - $(window).height())  ? $('#goto-bottom-btn').fadeIn() : $('#goto-bottom-btn').fadeOut();
            });

            $('#goto-top-btn').on('click', function () {
                $(document).scrollTop(0);
            });

            $('#goto-bottom-btn').on('click', function () {
                $(document).scrollTop(document.body.scrollHeight);
            });

            // IE下特殊处理
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                $('#ui-goto-wrapper').css({right: '20px'});
            }

            this._fastSelectDay(this.dayType);
            $('#data-search').val(''); // chrome下点击浏览器后退按钮，该处会被赋值，这里重新初始化
            this._renderMenu();
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

    kendo.culture('zh-CN');
    var dayType = +Helper.fnGetHashParam('dayType');
    Stat.fnInit(dayType);
});
