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
        this.selectedSecondary = 'all'; // 二级分类
        this.selectedThird = 'all'; // 三级分类

        this.selectedCtRt = 'all'; // 选择的广告主计费类型
        this.selectedAfRt = 'all'; // 选择的媒体商计费类型

        this.span = 2; // 横轴坐标类型1:小时   //2:天  //3:月 // 4:周
        this.dayType = 5; // 默认显示最近7天，1:今天；2：昨天；3：前一天；4：后一天；5：最近七天；6：上周；7：本月；8：历史12月；9：select； 10：本周
        this.dateRenge = { // 报表查询时间
            from: '2015-10-01',
            to: '2015-11-01'
        };

        // chart数据
        this.oChartInfo = {};
        this.oGridInfo = {};

        // 图表对象
        this.oRenderChart = null;
        // 报表对象
        this.oRenderGrid = null;
        // 默认最多显示多少长度
        this.defaultLength = 6;
        this.dataSourceSchema = {
            model: {
                fields: {
                    date: {
                        type: 'date'
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
            game_client_usernum: {field: 'game_client_usernum', name: '新增用户数', chart_type: 'column', format: 'n0', is_default: 1, field_type: 'basics', aggregate: 'sum'},
            before_game_client_usernum: {field: 'before_game_client_usernum', name: '昨日新增用户数', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', hidden: true, aggregate: 'sum'},
            usernum_rate: {field: 'usernum_rate', name: '新增环比', chart_type: 'line', format: 'p2', is_default: 0, field_type: 'calculation', arithmetic: ['(', 'game_client_usernum', '-', 'before_game_client_usernum', ')', '/', 'before_game_client_usernum']},
            game_charge: {field: 'game_charge', name: '充值金额', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', aggregate: 'sum'},
            before_game_charge: {field: 'before_game_charge', name: '昨日充值金额', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', hidden: true, aggregate: 'sum'},
            charge_rate: {field: 'charge_rate', name: '充值环比', chart_type: 'line', format: 'p2', is_default: 0, field_type: 'calculation', arithmetic: ['(', 'game_charge', '-', 'before_game_charge', ')', '/', 'before_game_charge']},
            game_client_price: {field: 'game_client_price', name: '广告主单价', chart_type: 'line', format: 'n2', is_default: 0, field_type: 'basics', aggregate: 'average'},
            game_client_amount: {field: 'game_client_amount', name: '广告主结算金额', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', aggregate: 'sum'},
            game_af_price: {field: 'game_af_price', name: '渠道单价', chart_type: 'line', format: 'n2', is_default: 0, field_type: 'basics', aggregate: 'average'},
            game_af_amount: {field: 'game_af_amount', name: '渠道结算金额', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', aggregate: 'sum'},
            game_af_usernum: {field: 'game_af_usernum', name: '渠道新增用户数', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', aggregate: 'sum'},
            arpu: {field: 'arpu', name: '客户端ARPU', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['game_charge', '/', 'game_client_usernum']},
            profit: {field: 'profit', name: '毛利', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', aggregate: 'sum'},
            profit_rate: {field: 'profit_rate', name: '毛利率', chart_type: 'line', format: 'p2', is_default: 0, field_type: 'calculation', arithmetic: ['profit', '/', 'game_client_amount']}
        };

        this.columnList = [
            {field: 'date', name: '日期', menu: 0, width: '100px'},
            {field: 'app_name', name: '游戏', menu: 0, width: '100px'},
            {field: 'af_brief_name', name: '渠道', menu: 0, width: '100px'},
            {field: 'game_client_usernum', name: '新增用户数', menu: 1, format: 'n0', width: '80px'},
            {field: 'usernum_rate', name: '新增环比', menu: 1, format: 'p2', width: '80px'},
            {field: 'game_charge', name: '充值金额', menu: 1, format: 'n2', width: '80px'},
            {field: 'charge_rate', name: '充值环比', menu: 1, format: 'p2', width: '80px'},
            {field: 'game_client_price', name: '广告主单价', menu: 1, format: 'n2', width: '80px'},
            {field: 'game_client_amount', name: '广告主结算金额', menu: 1, format: 'n2', width: '80px'},
            {field: 'game_af_price', name: '渠道单价', menu: 1, format: 'n2', width: '80px'},
            {field: 'game_af_amount', name: '渠道结算金额', menu: 1, format: 'n2', width: '80px'},
            {field: 'game_af_usernum', name: '渠道新增用户数', menu: 1, format: 'n0', width: '80px'},
            {field: 'arpu', name: '客户端ARPU', menu: 1, format: 'n2', width: '80px'},
            {field: 'profit', name: '毛利', menu: 1, format: 'n2', width: '80px'},
            {field: 'profit_rate', name: '毛利率', menu: 1, format: 'p2', width: '52px'}
        ];

        this.summaryField = [
            {field: 'game_client_usernum', aggregate: 'sum', format: 'n0'},
            {field: 'game_charge', aggregate: 'sum', format: 'n2'},
            {field: 'game_client_amount', aggregate: 'sum', format: 'n2'},
            {field: 'game_af_amount', aggregate: 'sum', format: 'n2'},
            {field: 'game_af_usernum', aggregate: 'sum', format: 'n0'},
            {field: 'profit', aggregate: 'sum', format: 'n2'}
        ];

        this.summaryData = [];

        this.fieldKey = {
            majorField: 'clientid',
            majorLabel: 'client_brief_name',
            secondaryField: 'campaignid',
            secondaryLabel: 'app_name',
            thirdField: 'affiliateid',
            thirdLabel: 'af_brief_name'
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

        this.dateList = [];
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

        _setSchema: function () {
            var fields = this.dataSourceSchema.model.fields;
            var itemList = this.itemList;
            for (var key in itemList) {
                if (itemList.hasOwnProperty(key)) {
                    var tmp = itemList[key];
                    if (tmp.field_type === 'basics') {
                        fields[tmp.field] = {type: 'number'};
                    }
                }
            }
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
                categoryField: 'date'
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
                dateArr = Helper.fnWeekScope(this.dateRenge.from, this.dateRenge.to);
            }
            else {
                this.categoryAxis.labels.format = '{0:t}';
                this.categoryAxis.baseUnit = 'hours';
                this.categoryAxis.crosshair.tooltip.format = 't';
                this.categoryAxis.labels.step = 1;
                this.categoryAxis.majorGridLines.step = 3;
                dateArr = Helper.fnHourScope(this.dateRenge.from, this.dateRenge.to);
                this.dateList = dateArr;
                return;
            }
            this.dateList = dateArr;
            var cl = dateArr.length;
            var step = 1;
            if (cl > 86) {
                step = 5;
            }
            else if (cl > 66) {
                step = 4;
            }
            else if (cl > 44) {
                step = 3;
            }
            else if (cl > 22) {
                step = 2;
            }

            this.categoryAxis.labels.step = step;
            this.categoryAxis.majorGridLines.step = step;
        },

        // 对象转数组
        _objToSortArr: function (obj) {
            var key = null;
            var arr = [];
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    arr.push(obj[key]);
                }
            }

            arr.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            return arr;
        },

        // 数据整理
        _serializeData: function (data) {
            var fieldKey = this.fieldKey;
            var tmp = null;
            var majorInfo = {};
            var secondaryInfo = {};
            var thirdInfo = {};
            for (var i = 0, l = data.length; i < l; i++) {
                tmp = data[i];
                tmp.game_client_price = Number(tmp.game_client_price);
                tmp.game_af_price = Number(tmp.game_af_price);
                tmp.profit = Number(tmp.game_client_amount) - Number(tmp.game_af_amount);
                // 第一个下拉框
                if (!majorInfo[tmp[fieldKey.majorField]]) {
                    majorInfo[tmp[fieldKey.majorField]] = {
                        id: tmp[fieldKey.majorField],
                        name: tmp[fieldKey.majorLabel]
                    };
                }

                // 第二个下拉框
                if (!secondaryInfo[tmp[fieldKey.secondaryField]]) {
                    secondaryInfo[tmp[fieldKey.secondaryField]] = {
                        id: tmp[fieldKey.secondaryField],
                        name: tmp[fieldKey.secondaryLabel]
                    };
                }

                // 第三个下拉框
                if (!thirdInfo[tmp[fieldKey.thirdField]]) {
                    thirdInfo[tmp[fieldKey.thirdField]] = {
                        id: tmp[fieldKey.thirdField],
                        name: tmp[fieldKey.thirdLabel]
                    };
                }
            }

            // 对象转排序数组
            var majorArr = this._objToSortArr(majorInfo);
            var secondaryArr = this._objToSortArr(secondaryInfo);
            var thirdArr = this._objToSortArr(thirdInfo);

            this.oChartInfo = {
                aRawData: data,
                majorInfo: majorInfo,
                secondaryInfo: secondaryInfo,
                thirdInfo: thirdInfo,
                majorArr: majorArr,
                secondaryArr: secondaryArr,
                thirdArr: thirdArr
            };
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
            $.get(API_URL.manager_stat_game_report, param, function (result) {
                if (!result.res) {
                    _this._ajaxClose();
                    _this._serializeData(result.list ? result.list : []);
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

        _genChart: function () {
            this._renderSelectMajor();
            this._renderSelectSecondary();
            this._renderSelectThird();
            this._screenData();
        },

        _renderSelectMajor: function (arr) {
            var sourceArr = this.oChartInfo.majorArr;
            var selected = this.selectedMajor;
            var html = '';
            var isArray = $.isArray(arr) && arr.length > 0;
            var tmp = null;
            for (var i = 0, l = sourceArr.length; i < l; i++) {
                tmp = sourceArr[i];
                if (!isArray || $.inArray(String(tmp.id), arr) > -1) {
                    html += '<option value="' + tmp.id + '" ' + ($.inArray(String(tmp.id), selected) > -1 ? 'selected' : '') + '>' + tmp.name + '</option>';
                }
            }
            $('#select-major').html(html).multiselect('rebuild');

            var value = $('#select-major').val();
            if (!value) {
                this.selectedMajor = [];
            }
            else {
                this.selectedMajor = value;
            }
        },

        _renderSelectSecondary: function (arr) {
            var sourceArr = this.oChartInfo.secondaryArr;
            var selected = this.selectedSecondary;
            var html = '';
            var isArray = $.isArray(arr) && arr.length > 0;
            var tmp = null;
            for (var i = 0, l = sourceArr.length; i < l; i++) {
                tmp = sourceArr[i];
                if (!isArray || $.inArray(String(tmp.id), arr) > -1) {
                    html += '<option value="' + tmp.id + '" ' + ($.inArray(String(tmp.id), selected) > -1 ? 'selected' : '') + '>' + tmp.name + '</option>';
                }
            }
            $('#select-secondary').html(html).multiselect('rebuild');

            var value = $('#select-secondary').val();
            if (!value) {
                this.selectedSecondary = [];
            }
            else {
                this.selectedSecondary = value;
            }
        },

        _renderSelectThird: function (arr) {
            var sourceArr = this.oChartInfo.thirdArr;
            var selected = this.selectedThird;
            var html = '';
            var isArray = $.isArray(arr) && arr.length > 0;
            var tmp = null;
            for (var i = 0, l = sourceArr.length; i < l; i++) {
                tmp = sourceArr[i];
                if (!isArray || $.inArray(String(tmp.id), arr) > -1) {
                    html += '<option value="' + tmp.id + '" ' + ($.inArray(String(tmp.id), selected) > -1 ? 'selected' : '') + '>' + tmp.name + '</option>';
                }
            }
            $('#select-third').html(html).multiselect('rebuild');

            var value = $('#select-third').val();
            if (!value) {
                this.selectedThird = [];
            }
            else {
                this.selectedThird = value;
            }
        },

        // 主选择项筛选数据
        _screenData: function () {
            var selectedMajor = this.selectedMajor;
            var selectedSecondary = this.selectedSecondary;
            var selectedThird = this.selectedThird;
            var aRawData = this.oChartInfo.aRawData;
            var fieldKey = this.fieldKey;
            var firstLevel = [];
            var i = 0;
            var l = 0;
            if (selectedMajor.length === 0) {
                firstLevel = [].concat(aRawData);
            }
            else {
                for (i = 0, l = aRawData.length; i < l; i++) {
                    if ($.inArray(String(aRawData[i][fieldKey.majorField]), selectedMajor) > -1) {
                        firstLevel.push(aRawData[i]);
                    }
                }
            }

            var secondLevel = [];
            if (selectedSecondary.length === 0) {
                secondLevel = [].concat(firstLevel);
            }
            else {
                for (i = 0, l = firstLevel.length; i < l; i++) {
                    if ($.inArray(String(firstLevel[i][fieldKey.secondaryField]), selectedSecondary) > -1) {
                        secondLevel.push(firstLevel[i]);
                    }
                }
            }

            var thirdLevel = [];
            if (selectedThird.length === 0) {
                thirdLevel = secondLevel;
            }
            else {
                for (i = 0, l = secondLevel.length; i < l; i++) {
                    if ($.inArray(String(secondLevel[i][fieldKey.thirdField]), selectedThird) > -1) {
                        thirdLevel.push(secondLevel[i]);
                    }
                }
            }

            this.oChartInfo.aChartData = thirdLevel;
            this._filterDataByRevenueType();
        },

        // 计费类型筛选数据
        _filterDataByRevenueType: function () {
            var aChartData = this.oChartInfo.aChartData;
            var selectedCtRt = this.selectedCtRt;
            var selectedAfRt = this.selectedAfRt;
            var arr = [];
            var tmp = null;

            if (selectedCtRt === 'all' && selectedAfRt === 'all') {
                arr = aChartData;
            }
            else {
                for (var i = 0; i < aChartData.length; i++) {
                    tmp = aChartData[i];
                    if ((selectedCtRt === 'all' || tmp.game_client_revenue_type === undefined || String(tmp.game_client_revenue_type) === selectedCtRt)
                        && (selectedAfRt === 'all' || tmp.game_af_revenue_type === undefined || String(tmp.game_af_revenue_type) === selectedAfRt)) {
                        arr.push(tmp);
                    }
                }
            }

            this.oChartInfo.renderData = arr;
            this._renderChart();
            this._showGrid();
        },

        _sortChartData: function (aChartData, field) {
            var schema = $.extend({}, this.dataSourceSchema);
            var itemList = this.itemList;
            var aggregates = [];
            var tmp = null;
            for (var k in itemList) {
                if (itemList.hasOwnProperty(k)) {
                    tmp = itemList[k];
                    if (tmp.field_type === 'basics') {
                        aggregates.push({field: tmp.field, aggregate: tmp.aggregate});
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
            var aChartData = this._cloneObj(this.oChartInfo.renderData);
            var fieldKey = this.fieldKey;
            var selectedSecondary = this.selectedSecondary;
            var selectedThird = this.selectedThird;
            var dataField = fieldKey.secondaryField;
            var nameKey = fieldKey.secondaryLabel;
            if (selectedSecondary.length === 1 && selectedThird.length !== 1) {
                dataField = fieldKey.thirdField;
                nameKey = fieldKey.thirdLabel;
            }

            var view = this._sortChartData(aChartData, dataField);
            var ll = view.length;
            var categoryAxis = this.categoryAxis;
            var series = [];
            var valueAxis = [];
            var aggregates = [];

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

            var initData = [{date: Date.parse(dateFrom)}, {date: Date.parse(dateEnd)}];
            var valueAxisName = 'first';
            valueAxis.push(this._setValueAjax(valueAxisName, item.name, item.format));

            var fieldType = item.field_type;
            var aggregate = item.aggregate;
            var arithmetic = item.arithmetic;
            view.sort(function (a, b) {
                if (fieldType === 'basics') {
                    return b.aggregates[field][aggregate] - a.aggregates[field][aggregate];
                }
                return _this.fnCalculate(b.aggregates, arithmetic, 'sum') - _this.fnCalculate(a.aggregates, arithmetic, 'sum');
            });

            var tmpSeries = null;
            var selectedCtRt = this.selectedCtRt;
            var selectedAfRt = this.selectedAfRt;
            for (var i = 0; i < end; i++) {
                tmpData = view[i].items;
                tmpSeries = this._setSeries({
                    idx: 0,
                    type: type,
                    field: field,
                    stack: stack,
                    data: initData.concat(tmpData),
                    axis: valueAxisName,
                    mformat: item.format,
                    fieldName: item.name,
                    agg: item.aggregate,
                    name: tmpData[0][nameKey]
                });
                if (field === 'game_client_price') {
                    if (selectedCtRt === 'all') {
                        tmpSeries.data = [].concat(initData);
                    }
                    else {
                        tmpSeries.aggregate = 'avg';
                    }
                }

                if (field === 'game_af_price') {
                    if (selectedAfRt === 'all') {
                        tmpSeries.data = [].concat(initData);
                    }
                    else {
                        tmpSeries.aggregate = 'avg';
                    }
                }

                series.push(tmpSeries);
            }

            if (ll > defaultLength) {
                tmpData = [];
                for (var j = defaultLength; j < ll; j++) {
                    tmpData = tmpData.concat(view[j].items);
                }
                tmpSeries = this._setSeries({
                    idx: 0,
                    type: type,
                    field: field,
                    stack: stack,
                    axis: valueAxisName,
                    mformat: item.format,
                    fieldName: item.name,
                    agg: item.aggregate,
                    name: '其它',
                    data: initData.concat(tmpData)
                });

                if (field === 'game_client_price') {
                    if (selectedCtRt === 'all') {
                        tmpSeries.data = [].concat(initData);
                    }
                    else {
                        tmpSeries.aggregate = 'avg';
                    }
                }

                if (field === 'game_af_price') {
                    if (selectedAfRt === 'all') {
                        tmpSeries.data = [].concat(initData);
                    }
                    else {
                        tmpSeries.aggregate = 'avg';
                    }
                }
                series.push(tmpSeries);
            }

            var tmp = null;
            for (var k in itemList) {
                if (itemList.hasOwnProperty(k)) {
                    tmp = itemList[k];
                    if (tmp.field_type === 'basics') {
                        aggregates.push({field: tmp.field, aggregate: tmp.aggregate});
                    }
                }
            }

            var seriesDataSource = new kendo.data.DataSource({
                data: aChartData,
                group: [
                    // group by "time" and then by "id"
                    {field: 'date', dir: 'asc', aggregates: aggregates},
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
                            num1 = tmpView.aggregates[field1][itemList[field1].aggregate];
                        }
                        else {
                            num1 = this.fnCalculate(tmpView.aggregates, itemList[field1].arithmetic, 'sum');
                        }
                        if (itemList[field2].field_type === 'basics') {
                            num2 = tmpView.aggregates[field2][itemList[field2].aggregate];
                        }
                        else {
                            num2 = this.fnCalculate(tmpView.aggregates, itemList[field2].arithmetic, 'sum');
                        }
                        max1 = max1 < num1 ? num1 : max1;
                        max2 = max2 < num2 ? num2 : max2;
                    }

                    var rate = max1 / max2;
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

                tmpSeries = this._setSeries({
                    color: CONSTANT.chart_line_color,
                    idx: 1,
                    type: type,
                    field: field,
                    axis: valueAxisName,
                    mformat: item.format,
                    fieldName: item.name,
                    agg: item.aggregate,
                    data: initData.concat(aChartData)
                });

                if (field === 'game_client_price') {
                    if (selectedCtRt === 'all') {
                        tmpSeries.data = [].concat(initData);
                    }
                    else {
                        tmpSeries.aggregate = 'avg';
                    }
                }

                if (field === 'game_af_price') {
                    if (selectedAfRt === 'all') {
                        tmpSeries.data = [].concat(initData);
                    }
                    else {
                        tmpSeries.aggregate = 'avg';
                    }
                }
                series.push(tmpSeries);
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
                if (itemInfo.field === 'usernum_rate' && summary.before_game_client_usernum <= 0 && summary.game_client_usernum > 0) {
                    val = 1;
                }
                else if (itemInfo.field === 'charge_rate' && summary.before_game_charge <= 0 && summary.game_charge > 0) {
                    val = 1;
                }
                else {
                    val = this.fnCalculate(summary, itemInfo.arithmetic);
                }
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
            var data = this.oChartInfo.renderData;
            var formatData = this._formatGridData(data);
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
            var tmpDate = null;
            var tmpData = null;
            var key = null;
            var itemList = this.itemList;

            for (var i = 0; i < dateList.length; i++) {
                obj[dateList[i]] = {};
            }

            for (var j = 0; j < data.length; j++) {
                tmpData = data[j];
                tmpDate = this._formatTime(tmpData.date);
                if (obj[tmpDate][tmpData.campaignid] === undefined) {
                    obj[tmpDate][tmpData.campaignid] = {
                        campaignid: tmpData.campaignid,
                        app_name: tmpData.app_name,
                        child: {}
                    };
                }

                var child = obj[tmpDate][tmpData.campaignid].child;
                var t = $.extend({}, tmpData);
                delete t.app_name;
                delete t.date;
                var idx = 0;
                var tmp = null;
                if (child[tmpData.affiliateid] === undefined) {
                    child[tmpData.affiliateid] = t;
                    tmp = child[tmpData.affiliateid];
                    for (key in itemList) {
                        if (itemList.hasOwnProperty(key) && itemList[key].field_type === 'basics') {
                            tmp[key] = Number(tmp[key]);
                        }
                    }
                    idx++;
                }
                else {
                    tmp = child[tmpData.affiliateid];
                    for (key in itemList) {
                        if (itemList.hasOwnProperty(key) && itemList[key].field_type === 'basics') {
                            tmp[key] = Number(tmp[key]) + Number(t[key]);
                        }
                    }
                    idx++;
                }
                tmp.game_client_price = isFinite(tmp.game_client_price / idx) ? tmp.game_client_price / idx : 0;
                tmp.game_af_price = isFinite(tmp.game_af_price / idx) ? tmp.game_af_price / idx : 0;
            }
            return obj;
        },

        // 数据转为数组数据
        _gridDataToArr: function (data) {
            var itemList = this.itemList;
            var arr = [];
            var summary = {};
            for (var key in itemList) {
                if (itemList.hasOwnProperty(key) && itemList[key].field_type === 'basics') {
                    summary[key] = 0;
                }
            }
            for (var date in data) {
                if (data.hasOwnProperty(date)) {
                    var id1 = Math.random();
                    var summaryData = $.extend({date: date, parentId: null, id: id1, _num: 0}, summary);
                    for (var first in data[date]) {
                        if (data[date].hasOwnProperty(first)) {
                            var tmpFirst = data[date][first];
                            var id2 = Math.random();
                            var summaryFirstData = $.extend({
                                campaignid: first,
                                app_name: tmpFirst.app_name,
                                parentId: id1,
                                id: id2,
                                _num: 0
                            }, summary);
                            var tmpArr = [];
                            var tmpD = null;
                            for (var second in tmpFirst.child) {
                                if (tmpFirst.child.hasOwnProperty(second)) {
                                    var tmpSecond = tmpFirst.child[second];
                                    tmpD = $.extend({parentId: id2}, tmpSecond);
                                    tmpD = this._calculatData(tmpD);
                                    tmpArr.push(tmpD);
                                    summaryFirstData = this._setSummaryData(summaryFirstData, tmpD, summary);
                                }
                            }

                            arr = arr.concat(tmpArr);
                            arr.push(this._calculatSummaryData(summaryFirstData));
                            summaryData = this._setSummaryData(summaryData, summaryFirstData, summary);
                        }
                    }

                    arr.push(this._calculatSummaryData(summaryData));
                }
            }
            return arr;
        },


        // 计算数据
        _calculatData: function (data) {
            if (data.before_game_client_usernum <= 0 && data.game_client_usernum <= 0) {
                data.usernum_rate = 0;
            }
            else if (data.before_game_client_usernum <= 0 && data.game_client_usernum > 0) {
                data.usernum_rate = 1;
            }
            else {
                data.usernum_rate = isFinite((data.game_client_usernum - data.before_game_client_usernum) / data.before_game_client_usernum) ? (data.game_client_usernum - data.before_game_client_usernum) / data.before_game_client_usernum : 0;
            }

            if (data.before_game_charge <= 0 && data.game_charge <= 0) {
                data.charge_rate = 0;
            }
            else if (data.before_game_charge <= 0 && data.game_charge > 0) {
                data.charge_rate = 1;
            }
            else {
                data.charge_rate = isFinite((data.game_charge - data.before_game_charge) / data.before_game_charge) ? (data.game_charge - data.before_game_charge) / data.before_game_charge : 0;
            }

            data.arpu = isFinite(data.game_charge / data.game_client_usernum) ? data.game_charge / data.game_client_usernum : 0;
            data.profit_rate = isFinite(data.profit / data.game_client_amount) ? data.profit / data.game_client_amount : 0;
            return data;
        },

        // 计算汇总数据
        _calculatSummaryData: function (data) {
            data = this._calculatData(data);

            data.game_client_price = isFinite(data.game_client_price / data._num) ? data.game_client_price / data._num : 0;
            data.game_af_price = isFinite(data.game_af_price / data._num) ? data.game_af_price / data._num : 0;
            return data;
        },

        // 计算报表树状数据
        _setSummaryData: function (summary, data, baseData) {
            for (var key in baseData) {
                if (baseData.hasOwnProperty(key)) {
                    summary[key] += (+data[key]);
                }
            }
            summary._num++;
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
            var _this = this;
            var columns = [];
            var tabColumns = this.columnList;
            var tmp = null;
            var col = null;
            var html = '<tfoot><tr id="table-summary" class="k-footer-template" data-parentid="null">';
            var span = this.span;
            var templateCPFun = function (obj) {
                if (_this.selectedCtRt !== 'all' || !obj.id) {
                    return kendo.toString(obj.game_client_price, 'n2');
                }
                return '-';
            };

            var templateAPFun = function (obj) {
                if (_this.selectedAfRt !== 'all' || !obj.id) {
                    return kendo.toString(obj.game_af_price, 'n2');
                }
                return '-';
            };
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
                    else {
                        _date1 = 'Date.parse(data.date).toString("yyyy-MM-dd")';
                        _date2 = 'Date.parse(data.date).toString("yyyy-MM-dd")';
                    }
                    col.template = '#if (data.date){ # <span title="#: ' + _date1 + ' #" data-id="#:data.id#"> #: ' + _date2 + '# </span> # } #';
                }
                else {
                    col.headerAttributes = {'class': 'k-header hidden-menu'};
                }

                if (tmp.field === 'game_client_price') {
                    col.template = templateCPFun;
                }

                if (tmp.field === 'game_af_price') {
                    col.template = templateAPFun;
                }

                if(tmp.field === 'usernum_rate' || tmp.field === 'charge_rate') {
                    col.template = '<span style="color: #: data.' + tmp.field + ' > 0 ? \"red\" : \"green\"#;"> #:kendo.toString(data.' + tmp.field + ', "' + tmp.format + '")# </span>';
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
                else {
                    opt.sort = [
                        {field: 'date', dir: 'desc'},
                        {field: 'game_client_usernum', dir: 'desc'}
                    ];
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

        _genSelectRevenueType: function () {
            var revenueType = LANG.revenue_type;
            var html = '';
            for (var key in revenueType) {
                if (revenueType.hasOwnProperty(key)) {
                    html += '<option value="' + key + '">' + revenueType[key] + '</option>';
                }
            }
            return html;
        },

        // 渲染广告主计费类型
        _renderSelectedCtRt: function () {
            $('#select-client-revenue-type').append(this._genSelectRevenueType());
        },

        // 渲染媒体商计费类型
        _renderSelectedAfRt: function () {
            $('#select-affiliate-revenue-type').append(this._genSelectRevenueType());
        },

        // 设置多选最多选择两项，最少选择一项
        _multiselectChange: function () {
            var $ele = $('#select-item');
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
                if (span === 3) {
                    $('.js-span-select [data-span="3"]').addClass('cur').siblings().removeClass('cur');
                }
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
            var value = $ele.val() ? $ele.val() : [];
            this.selectedMajor = value;

            var len = value.length;
            var aRawData = this.oChartInfo.aRawData;
            var sArr = [];
            var tArr = [];
            var fieldKey = this.fieldKey;
            var majorField = fieldKey.majorField;
            var secondaryField = fieldKey.secondaryField;
            var thirdField = fieldKey.thirdField;
            for (var i = 0, l = aRawData.length; i < l; i++) {
                if (len < 1 || $.inArray(String(aRawData[i][majorField]), value) > -1) {
                    if ($.inArray(String(aRawData[i][secondaryField]), sArr) < 0) {
                        sArr.push(String(aRawData[i][secondaryField]));
                    }
                    if ($.inArray(String(aRawData[i][thirdField]), tArr) < 0) {
                        tArr.push(String(aRawData[i][thirdField]));
                    }
                }
            }

            this._renderSelectSecondary(sArr);
            this._renderSelectThird(tArr);
        },

        // 更改次分类
        _changeSecondary: function ($ele) {
            var value = $ele.val() ? $ele.val() : [];
            this.selectedSecondary = value;

            var len = value.length;
            var aRawData = this.oChartInfo.aRawData;
            var tArr = [];
            var fieldKey = this.fieldKey;
            var secondaryField = fieldKey.secondaryField;
            var thirdField = fieldKey.thirdField;
            for (var i = 0, l = aRawData.length; i < l; i++) {
                if (len < 1 || $.inArray(String(aRawData[i][secondaryField]), value) > -1) {
                    if ($.inArray(String(aRawData[i][thirdField]), tArr) < 0) {
                        tArr.push(String(aRawData[i][thirdField]));
                    }
                }
            }
            this._renderSelectThird(tArr);
        },

        // 更改次分类
        _changeThird: function ($ele) {
            var value = $ele.val() ? $ele.val() : [];
            this.selectedThird = value;

            var len = value.length;
            var aRawData = this.oChartInfo.aRawData;
            var mArr = [];
            var sArr = [];
            var fieldKey = this.fieldKey;
            var majorField = fieldKey.majorField;
            var secondaryField = fieldKey.secondaryField;
            var thirdField = fieldKey.thirdField;
            for (var i = 0, l = aRawData.length; i < l; i++) {
                if (len < 1 || $.inArray(String(aRawData[i][thirdField]), value) > -1) {
                    if ($.inArray(String(aRawData[i][secondaryField]), sArr) < 0) {
                        sArr.push(String(aRawData[i][secondaryField]));
                    }
                    if ($.inArray(String(aRawData[i][majorField]), mArr) < 0) {
                        mArr.push(String(aRawData[i][majorField]));
                    }
                }
            }

            this._renderSelectMajor(mArr);
            this._renderSelectSecondary(sArr);
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

            $('#select-major, #select-secondary, #select-third').prop('multiple', 'multiple').multiselect({
                selectAllText: '全部',
                selectedClass: 'multiselect-selected',
                buttonWidth: '100%',
                maxHeight: 300,
                enableFiltering: true,
                filterPlaceholder: '搜索',
                enableClickableOptGroups: true,
                includeSelectAllOption: true,
                nonSelectedText: '请选择',
                optionClass: function () {
                    return 'group-li';
                },
                buttonText: function (options, select) {
                    if (options.length === 0) {
                        var text = '';
                        var id = select.attr('id');
                        if (id === 'select-major') {
                            text = '广告主';
                        }
                        else if (id === 'select-secondary') {
                            text = '游戏';
                        }
                        else {
                            text = '渠道';
                        }
                        return '请选择' + text;
                    }
                    if (options.length > 3) {
                        return '已选择' + options.length + '项';
                    }
                    var labels = [];
                    options.each(function () {
                        if ($(this).attr('label') !== undefined) {
                            labels.push($(this).attr('label'));
                        }
                        else {
                            labels.push($(this).html());
                        }
                    });
                    return labels.join(', ') + '';
                }
            });

            $('#query').click(function () {
                _this._selectDay();
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

            $('#select-secondary').on('change', function () {
                _this._changeSecondary($(this));
                _this._screenData();
            });

            $('#select-third').on('change', function () {
                _this._changeThird($(this));
                _this._screenData();
            });

            $('#select-client-revenue-type').on('change', function () {
                _this._changeSelectedCtRt($(this));
                _this._filterDataByRevenueType();
            });

            $('#select-affiliate-revenue-type').on('change', function () {
                _this._changeSelectedAfRt($(this));
                _this._filterDataByRevenueType();
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

            $('#export-report-btn').click(function () {
                window.location = API_URL.manager_stat_game_report_excel
                                + '?clientid=' + _this.selectedMajor.join(',')
                                + '&campaignid=' + _this.selectedSecondary.join(',')
                                + '&affiliateid=' + _this.selectedThird.join(',')
                                + '&af_revenue_type=' + (_this.selectedAfRt === 'all' ? 0 : _this.selectedAfRt)
                                + '&client_revenue_type=' + (_this.selectedCtRt === 'all' ? 0 : _this.selectedCtRt)
                                + '&period_start=' + _this.dateRenge.from
                                + '&period_end=' + _this.dateRenge.to
                                + '&span=' + _this.span
                                + '&zone_offset=-8';
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
            this._renderSelectItem();
            this._renderSelectedCtRt();
            this._renderSelectedAfRt();
            this._setSchema();
            $('#data-search').val(''); // chrome下点击浏览器后退按钮，该处会被赋值，这里重新初始化
            this._getGeneralData();
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
