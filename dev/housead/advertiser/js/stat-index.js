/**
 * @file stat-index.js
 * @description 统计报表
 * @author songxing
*/
var Stat = (function ($) {
    var Stat = function () {
        this.ajaxIsOpen = true;
        this.isFirst = true;
        this.selectedAd = 'all'; // 选择的广告
        this.selectedName = ''; // 广告名称
        this.selectedZone = 'all'; // 选择的广告位
        this.selectedItems = ['sum_revenue_trafficker']; // 显示数据字段选择
        this.span = 2; // 横轴坐标类型1:小时   //2:天  //3:月
        this.dayType = 5; // 默认显示最近7天，1:今天；2：昨天；3：前一天；4：后一天；5：最近七天；6：上周；7：本月；8：历史12月；9：select
        this.dateRenge = { // 报表查询时间
            from: '2015-10-01',
            to: '2015-11-01'
        };
        // 数据
        this.oDataInfo = {
            // 原始数据
            aRawData: [],
            // 广告数据
            oAdData: {},
            // 广告位数据
            oZoneData: {},
            // 展示数据
            aShowData: []
        };
        this.oRenderChart = null;

        this.dataSourceSchema = {
            model: {
                fields: {
                    time: {
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
            sum_views: {field: 'sum_views', name: '展示量', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', hidden: false},
            sum_clicks: {field: 'sum_clicks', name: '下载量', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', hidden: false},
            sum_cpc_clicks: {field: 'sum_cpc_clicks', name: '点击量', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', hidden: false},
            sum_cpa: {field: 'sum_cpa', name: 'CPA量', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', hidden: true},
            ctr: {field: 'ctr', name: '下载转化率', chart_type: 'line', format: 'p2', is_default: 0, field_type: 'calculation', arithmetic: ['sum_clicks', '/', 'sum_views'], hidden: false},
            sum_revenue_trafficker: {field: 'sum_revenue_trafficker', name: '消耗（总数）', chart_type: 'column', format: 'n2', is_default: 1, field_type: 'basics', hidden: false},
            sum_revenue: {field: 'sum_revenue', name: '消耗（充值金）', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', hidden: false},
            sum_revenue_gift: {field: 'sum_revenue_gift', name: '消耗（赠送金）', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', hidden: false},
            sum_revenue_cpd: {field: 'sum_revenue_cpd', name: '消耗（CPD）', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', hidden: true},
            sum_revenue_cpa: {field: 'sum_revenue_cpa', name: '消耗（CPA）', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', hidden: true},
            clicks_cpd: {field: 'clicks_cpd', name: 'CPD单价', chart_type: 'line', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['(', 'sum_revenue_cpd', ')', '/', 'sum_clicks'], hidden: false},
            cpa_cpd: {field: 'cpa_cpd', name: 'CPA单价', chart_type: 'line', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['(', 'sum_revenue_cpa', ')', '/', 'sum_cpa'], hidden: true},
            ecpm: {field: 'ecpm', name: 'eCPM', chart_type: 'line', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['(', 'sum_revenue', '+', 'sum_revenue_gift', ')', '/', 'sum_views', '*', 1000], hidden: false}
        };

        this.dateList = [];
        this.pageSize = 25;
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

        // 设置数据模型
        _setSchema: function () {
            var itemList = this.itemList;
            for (var key in itemList) {
                if (itemList.hasOwnProperty(key)) {
                    this.dataSourceSchema.model.fields[key] = {type: 'number'};
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
                categoryField: 'time'
            };
            return $.extend(options, opt);
        },

        _setCategoryAxis: function () {
            var dateArr = [];
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
        _convertArrayToObj: function (arr, key1, name1, key2, name2) {
            var obj = {};
            var tmp = null;
            for (var i = 0, l = arr.length; i < l; i++) {
                tmp = arr[i];
                if (obj[tmp[key1]] === undefined) {
                    obj[tmp[key1]] = {child: {}};
                    obj[tmp[key1]][key1] = tmp[key1];
                    obj[tmp[key1]][name1] = tmp[name1];
                }
                if (obj[tmp[key1]].child[key2] === undefined) {
                    obj[tmp[key1]].child[key2] = {data: []};
                    obj[tmp[key1]].child[key2][key2] = tmp[key2];
                    obj[tmp[key1]].child[key2][name2] = tmp[name2];
                }

                obj[tmp[key1]].child[key2].data.push(tmp);
            }
            return obj;
        },

        // 原始数据处理
        _fixBasicData: function (data) {
            var tmp = null;
            for (var i = 0, len = data.length; i < len; i++) {
                tmp = data[i];
                tmp.sum_revenue_trafficker = Number(tmp.sum_revenue_gift) + Number(tmp.sum_revenue);
                tmp.sum_revenue_cpd = 0;
                tmp.sum_revenue_cpa = 0;
                if (Number(tmp.revenue_type) === CONSTANT.revenue_type_cpd) {
                    tmp.sum_revenue_cpd = Number(tmp.sum_revenue_gift) + Number(tmp.sum_revenue);
                    tmp.sum_revenue_cpa = 0;
                }
                else if (Number(tmp.revenue_type) === CONSTANT.revenue_type_cpa) {
                    tmp.sum_revenue_cpa = Number(tmp.sum_revenue_gift) + Number(tmp.sum_revenue);
                    tmp.sum_revenue_cpd = 0;
                }
            }
            return data;
        },

        _getRevenueType: function () {
            var _this = this;
            this._ajaxOpen();
            $.post(API_URL.common_affiliate_revenue_type, function (result) {
                if (!result.res) {
                    _this._ajaxClose();
                    if (result.obj && $.isArray(result.obj.revenue_type) && $.inArray(CONSTANT.revenue_type_cpa, result.obj.revenue_type) > -1) {
                        _this.itemList.sum_cpa.hidden = false;
                        _this.itemList.cpa_cpd.hidden = false;
                    }
                    _this._renderSelectItem();
                    _this._fastSelectDay(_this.dayType);
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

        _getGeneralData: function () {
            var _this = this;
            var param = {
                period_start: _this.dateRenge.from,
                period_end: _this.dateRenge.to,
                span: _this.span,
                zone_offset: '-8'
            };
            this._ajaxOpen();
            $.get(API_URL.advertiser_stat_self_index, param, function (result) {
                if (!result.res) {
                    _this._ajaxClose();
                    _this.oDataInfo.aRawData = _this._fixBasicData($.isArray(result.list) ? result.list : []);
                    _this.oDataInfo.oAdData = _this._convertArrayToObj(_this.oDataInfo.aRawData, 'campaignid', 'app_name', 'zoneid', 'zonename');
                    _this.oDataInfo.oZoneData = _this._convertArrayToObj(_this.oDataInfo.aRawData, 'zoneid', 'zonename', 'campaignid', 'app_name');
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

        _renderSelectAd: function () {
            var selectedAd = this.selectedAd;
            var data = this.selectedZone === 'all' ? this.oDataInfo.oAdData : this.oDataInfo.oZoneData[this.selectedZone].child;
            var html = '<option value="all">所有广告</option>';
            var tmp = null;
            var selectedFlag = '';
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    tmp = data[key];
                    selectedFlag = '';
                    if (String(tmp.campaignid) === selectedAd) {
                        selectedFlag = 'selected="selected"';
                    }
                    html += '<option value="' + tmp.campaignid + '" ' + selectedFlag + '>' + tmp.app_name + '</option>';
                }
            }
            if (selectedFlag === '' && this.selectedName !== '') {
                html += '<option value="' + selectedAd + '" selected="selected">' + this.selectedName + '</option>';
                this.selectedName = '';
            }
            $('#select-campaign').html(html);

            this.selectedAd = $('#select-campaign').val();
        },

        _renderSelectZone: function () {
            var selectedZone = this.selectedZone;
            var data = this.selectedAd === 'all' ? this.oDataInfo.oZoneData : (this.oDataInfo.oAdData[this.selectedAd] ? this.oDataInfo.oAdData[this.selectedAd].child : this.oDataInfo.oZoneData);
            var html = '<option value="all">所有广告位</option>';
            var tmp = null;
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    tmp = data[key];
                    html += '<option value="' + tmp.zoneid + '" ' + (String(tmp.zoneid) === selectedZone ? 'selected="selected"' : '') + '>' + tmp.zonename + '</option>';
                }
            }
            $('#select-zone').html(html);
            this.selectedZone = $('#select-zone').val();
        },

        _genChart: function () {
            this._renderSelectAd();
            this._renderSelectZone();
            this._screenData();
        },

        _screenData: function () {
            var arr = [];
            var selectedAd = this.selectedAd;
            var selectedZone = this.selectedZone;
            var aRawData = this.oDataInfo.aRawData;
            var len = aRawData.length;
            var i;
            if (selectedAd === 'all' && selectedZone === 'all') {
                arr = aRawData;
            }
            else if (selectedZone === 'all') {
                for (i = 0; i < len; i++) {
                    if (String(aRawData[i].campaignid) === selectedAd) {
                        arr.push(aRawData[i]);
                    }
                }
            }
            else if (selectedAd === 'all') {
                for (i = 0; i < len; i++) {
                    if (String(aRawData[i].zoneid) === selectedZone) {
                        arr.push(aRawData[i]);
                    }
                }
            }
            else {
                for (i = 0; i < len; i++) {
                    if (String(aRawData[i].zoneid) === selectedZone && String(aRawData[i].campaignid) === selectedAd) {
                        arr.push(aRawData[i]);
                    }
                }
            }

            this.oDataInfo.aShowData = arr;
            var itemList = this.itemList;
            var tmp = null;
            var aggregates = [];
            for (var k in itemList) {
                if (itemList.hasOwnProperty(k)) {
                    tmp = itemList[k];
                    if (tmp.field_type === 'basics') {
                        aggregates.push({field: tmp.field, aggregate: 'sum'});
                    }
                }
            }
            var seriesDataSource = new kendo.data.DataSource({
                data: arr,
                schema: this.dataSourceSchema,
                group: [
                    // group by "time" and then by "id"
                    {field: 'time', dir: 'asc', aggregates: aggregates}
                ]
            });
            seriesDataSource.read();
            this.seriesDataSource = seriesDataSource;
            this._renderDaysTable();
            this._renderChart();
        },

        _renderChart: function () {
            var aShowData = this.oDataInfo.aShowData;
            var selectedItems = this.selectedItems;
            var len = selectedItems.length;
            var categoryAxis = this.categoryAxis;
            var series = [];
            var valueAxis = [];

            var field = this.selectedItems[0];
            var itemList = this.itemList;
            var item = itemList[field];
            var type = len > 1 ? 'column' : item.chart_type;

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

            series.push(this._setSeries({
                idx: 0,
                type: type,
                field: field,
                axis: valueAxisName,
                mformat: item.format,
                fieldName: item.name,
                data: initData.concat(aShowData)
            }));

            if (len > 1) {
                field = this.selectedItems[1];
                item = itemList[field];
                type = 'line';

                valueAxisName = 'second';
                valueAxis.push(this._setValueAjax(valueAxisName, item.name, item.format));

                series.push(this._setSeries({
                    color: CONSTANT.chart_line_color,
                    idx: 1,
                    type: type,
                    field: field,
                    axis: valueAxisName,
                    mformat: item.format,
                    fieldName: item.name,
                    data: initData.concat(aShowData)
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
                val = this.fnCalculate(summary, itemInfo.arithmetic);
            }
            return val;
        },

        fnCalculate: function (summary, arithmetic, attr) {
            if (!$.isArray(arithmetic)) {
                arithmetic = JSON.parse(arithmetic);
            }
            var arr = [];
            var tmp = null;
            var val = 0;
            for (var i = 0, l = arithmetic.length; i < l; i++) {
                tmp = arithmetic[i];
                if (summary.hasOwnProperty(tmp)) {
                    arr.push(attr ? summary[tmp][attr] : summary[tmp]);
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

        // 设置每行的数据
        _setRowData: function (data) {
            var itemList = this.itemList;
            var summary = {};
            var tmp = null;
            for (var key in itemList) {
                if (itemList.hasOwnProperty(key)) {
                    tmp = itemList[key];
                    if (tmp.field_type === 'basics') {
                        summary[tmp.field] = data[tmp.field] ? data[tmp.field] : 0;
                    }
                    else {
                        summary[tmp.field] = this.fnCalculate(data, tmp.arithmetic);
                    }
                }
            }
            return summary;
        },

        // 创建每日报表,此处可优化，设置分页时可不用再次计算数据（未优化）
        _renderDaysTable: function () {
            var view = this.seriesDataSource.view();
            var dateList = this.dateList;
            var itemList = this.itemList;
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
            var aggregate = [];
            var pageSize = this.pageSize;

            for (var key in itemList) {
                if (itemList.hasOwnProperty(key)) {
                    tmp = itemList[key];
                    defaultSummary[tmp.field] = 0;

                    var footerTemplate = '-';
                    if (tmp.field_type === 'basics') {
                        aggregate.push({
                            field: tmp.field,
                            aggregate: 'sum'
                        });
                        footerTemplate = '#: kendo.toString(sum, "' + tmp.format + '") #';
                    }
                    else {
                        footerTemplate = '#: kendo.toString(Stat.fnCalculate(data, \'' + JSON.stringify(tmp.arithmetic) + '\', "sum"), "' + tmp.format + '") #';
                    }

                    if (!tmp.hidden) {
                        columns.push({
                            field: tmp.field,
                            title: tmp.name,
                            format: '{0:' + tmp.format + '}',
                            footerTemplate: footerTemplate
                        });
                    }
                }
            }
            for (i = 0, l = dateList.length; i < l; i++) {
                tmpSummary = $.extend({}, defaultSummary);
                var tmpTime = Date.parse(dateList[i]);
                for (var ii = 0, ll = view.length; ii < ll; ii++) {
                    tmp = view[ii];
                    if (tmpTime.equals(Date.parse(tmp.value))) {
                        for (key in tmp.aggregates) {
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
                format: dateFormat,
                footerTemplate: '汇总'
            });

            $('#day-grid').kendoGrid({
                dataSource: {
                    data: dataArr,
                    schema: this.dataSourceSchema,
                    aggregate: aggregate,
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
                if (items.hasOwnProperty(key) && !items[key].hidden) {
                    tmp = items[key];
                    if (len > 0) {
                        html += '<option value="' + tmp.field + '" ' + ($.inArray(tmp.field, selectedItems) >= 0 ? 'selected' : '') + '>' + tmp.name + '</option>';
                    }
                    else {
                        html += '<option value="' + tmp.field + '" ' + ((+tmp.is_default) ? 'selected' : '') + '>' + tmp.name + '</option>';
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
                this.span = 1;
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
            this.span = 2; // 天
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
            this._getGeneralData();
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
            this._renderChart();
        },

        // 更改广告
        _changeAd: function ($ele) {
            this.selectedAd = $ele.val();
            this._renderSelectZone();
            this._screenData();
        },

        // 更改广告位
        _changeZone: function ($ele) {
            this.selectedZone = $ele.val();
            this._renderSelectAd();
            this._screenData();
        },

        fnInit: function (dayType, id, name) {
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
            if (id) {
                this.selectedAd = id;
                this.selectedName = name;
            }

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
            $('#select-campaign').on('change', function () {
                _this._changeAd($(this));
                _this._screenData();
            });

            // 次分类事件驱动
            $('#select-zone').on('change', function () {
                _this._changeZone($(this));
                _this._screenData();
            });

            $('.js-day-select').on('click', '[data-type="select-day"]', function () {
                _this._fastSelectDay($(this).data('day-type'));
            });

            $('#select-grid-pagesize').change(function () {
                _this.pageSize = +$(this).val();
                _this._renderDaysTable();
            });

            $('#export-report-btn').click(function () {
                var url = API_URL.advertiser_stat_self_zone_excel
                        + '?campaignid=' + (_this.selectedAd === 'all' ? 0 : _this.selectedAd)
                        + '&zoneid=' + (_this.selectedZone === 'all' ? 0 : _this.selectedZone)
                        + '&period_start=' + _this.dateRenge.from
                        + '&period_end=' + _this.dateRenge.to
                        + '&zone_offset=-8';
                window.location = url;
            });

            $(window).resize(function (event) {
                if (_this.oRenderChart) {
                    _this.oRenderChart.resize();
                }
            });

            $(window).scroll(function () {
                Helper.fnFixedHead($('#day-grid'));
            });

            this._setSchema();
            this._getRevenueType();
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
    var id = Helper.fnGetHashParam('campaignid');
    var name = Helper.fnGetHashParam('name');
    location.hash = '';
    Stat.fnInit(dayType, id, name);
});
