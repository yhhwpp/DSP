/**
 * @file stat-index.js
 * @description 统计报表
 * @author songxing
*/
var Stat = (function ($) {
    var Stat = function () {
        this.ajaxIsOpen = true;
        this.isFirst = true;
        this.role = '';
        this.audit = '0';
        this.selectedBusinessType = 'all'; // 选择的业务类型
        this.selectedCtRt = 'all'; // 选择的广告主计费类型
        this.selectedAfRt = 'all'; // 选择的媒体商计费类型
        this.selectedItems = ['sum_clicks']; // 显示数据字段选择
        this.selectedMajor = []; // 一级分类,此处可多选，故用数组
        this.selectedSecondary = 'all'; // 二级分类
        this.selectedSecondaryName = '';
        this.selectedThird = 'all'; // 三级分类
        this.span = 2; // 横轴坐标类型1:小时   //2:天  //3:月
        this.dayType = 5; // 默认显示最近7天，1:今天；2：昨天；3：前一天；4：后一天；5：最近七天；6：上周；7：本月；8：历史12月；9：select
        this.dateRenge = { // 报表查询时间
            from: '2015-10-01',
            to: '2015-11-01'
        };
        this.operationList = '';
        this.operationClicks = false;
        // 图表数据
        this.oChartInfo = {
            // 图表原始数据
            aRawData: [],
            oRawData: {},
            aShowData: [],
            field: null,
            view: []
        };
        this.oRenderChart = null;

        // 报表信息
        this.oGridInfo = {
            // 报表原始数据
            oRawData: {},
            // 报表显示的数据
            aShowData: [],
            // 汇总数据
            oSummary: {},
            // 分页信息
            oPageInfo: {
                currentPage: 1,
                totalPage: 1,
                totalNO: 0,
                pageSize: 50
            }
        };
        // 报表对象
        this.oRenderGrid = null;
        // 默认最多显示多少个广告
        this.defaultLength = 6;
        this.dataSourceSchema = {
            model: {
                fields: {
                    time: {
                        type: 'date'
                    },
                    sum_views: {
                        type: 'number'
                    },
                    sum_download_requests: {
                        type: 'number'
                    },
                    sum_clicks: {
                        type: 'number'
                    },
                    sum_download_complete: {
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
                    },
                    sum_payment: {
                        type: 'number'
                    },
                    sum_cpa: {
                        type: 'number'
                    },
                    sum_consum: {
                        type: 'number'
                    },
                    media_cpd: {
                        type: 'number'
                    },
                    sum_cpc_clicks: {
                        type: 'number'
                    },
                    sum_payment_gift: {
                        type: 'number'
                    },
                    sum_revenue_gift: {
                        type: 'number'
                    },
                    cpc_ctr: {
                        type: 'number'
                    },
                    ecpm: {
                        type: 'number'
                    },
                    sum_revenue_client: {
                        type: 'number'
                    },
                    sum_payment_trafficker: {
                        type: 'number'
                    },
                    profit: {
                        type: 'number'
                    },
                    profit_rate: {
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

        this.fieldKey = {
            zones: {major: 'affiliateid', majorLabel: 'brief_name', secondary: 'zoneid', secondaryLabel: 'zonename', third: 'bannerid', thirdLabel: 'app_name', firstList: 'aff_list', secondList: 'zone_list', thirdList: 'ad_list'},
            clients: {major: 'product_id', majorLabel: 'product_name', secondary: 'campaignid', secondaryLabel: 'app_name', third: 'bannerid', thirdLabel: 'brief_name', firstList: 'product_list', secondList: 'campaign_list', thirdList: 'aff_list'}
        };

        this.itemList = {
            sum_views: {field: 'sum_views', name: '展示量', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', hidden: true},
            sum_cpc_clicks: {field: 'sum_cpc_clicks', name: '点击量', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', hidden: true},
            sum_download_requests: {field: 'sum_download_requests', name: '下载请求(监控)', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', hidden: true},
            sum_download_complete: {field: 'sum_download_complete', name: '下载完成(监控)', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', hidden: true},
            sum_clicks: {field: 'sum_clicks', name: '下载量(上报)', chart_type: 'column', format: 'n0', is_default: 1, field_type: 'basics', hidden: true},
            sum_cpa: {field: 'sum_cpa', name: 'CPA量', chart_type: 'column', format: 'n0', is_default: 0, field_type: 'basics', hidden: true},
            ctr: {field: 'ctr', name: '下载转化率', chart_type: 'line', format: 'p2', is_default: 0, field_type: 'calculation', arithmetic: ['sum_clicks', '/', 'sum_views'], hidden: true},
            cpc_ctr: {field: 'cpc_ctr', name: '点击转化率', chart_type: 'line', format: 'p2', is_default: 0, field_type: 'calculation', arithmetic: ['sum_clicks', '/', 'sum_views'], hidden: true},
            sum_revenue_client: {field: 'sum_revenue_client', name: '广告主消耗（总数）', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['sum_revenue', '+', 'sum_revenue_gift'], hidden: true},
            sum_revenue: {field: 'sum_revenue', name: '广告主消耗（充值金）', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', hidden: true},
            sum_revenue_gift: {field: 'sum_revenue_gift', name: '广告主消耗（赠送金）', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', hidden: true},
            sum_payment_trafficker: {field: 'sum_payment_trafficker', name: '媒体支出（总数）', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['sum_payment', '+', 'sum_payment_gift'], hidden: true},
            sum_payment: {field: 'sum_payment', name: '媒体支出（充值金）', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', hidden: true},
            sum_payment_gift: {field: 'sum_payment_gift', name: '媒体支出（赠送金）', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'basics', hidden: true},
            cpd: {field: 'cpd', name: '平均单价(广告主)', chart_type: 'line', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['(', 'sum_revenue', '+', 'sum_revenue_gift', ')', '/', '(', 'sum_clicks', '+', 'sum_cpc_clicks', '+', 'sum_cpa', ')'], hidden: true},
            media_cpd: {field: 'media_cpd', name: '平均单价(媒体商)', chart_type: 'line', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['(', 'sum_payment', '+', 'sum_payment_gift', ')', '/', '(', 'sum_clicks', '+', 'sum_cpc_clicks', '+', 'sum_cpa', ')'], hidden: true},
            ecpm: {field: 'ecpm', name: 'eCPM', chart_type: 'line', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['(', 'sum_revenue', '+', 'sum_revenue_gift', ')', '/', 'sum_views', '*', 1000], hidden: true},
            profit: {field: 'profit', name: '毛利', chart_type: 'column', format: 'n2', is_default: 0, field_type: 'calculation', arithmetic: ['sum_revenue', '-', 'sum_payment', '-', 'sum_payment_gift'], hidden: true},
            profit_rate: {field: 'profit_rate', name: '毛利率', chart_type: 'line', format: 'p2', is_default: 0, field_type: 'calculation', arithmetic: ['(', 'sum_revenue', '-', 'sum_payment', '-', 'sum_payment_gift', ')', '/', 'sum_revenue'], hidden: true}
        };

        this.columnList = {
            zones: [
                {field: 'brief_name', name: '媒体商', menu: 0, search: 1, width: '90px'},
                {field: 'name', name: '媒体商(全称)', menu: 1, search: 1, width: '120px'},
                {field: 'zonename', name: '广告位', menu: 1, width: '60px'},
                {field: 'zone_type', name: '广告位类别', menu: 1, hidden: true, width: '60px'},
                {field: 'platform', name: '所属平台', menu: 1, width: '60px'},
                {field: 'product_name', name: '推广产品', menu: 1, width: '80px'},
                {field: 'product_type', name: '推广类型', menu: 1, width: '60px'},
                {field: 'app_name', name: '广告名称', menu: 1, width: '70px'},
                {field: 'business_type', name: '业务类型', menu: 1, width: '70px'},
                {field: 'ad_type', name: '广告类型', menu: 1, width: '60px'},
                {field: 'channel', name: '渠道号', menu: 1, hidden: true, width: '60px'}
            ],

            clients: [
                {field: 'clientname', name: '广告主', menu: 0, search: 1, width: '70px'},
                {field: 'product_name', name: '推广产品', menu: 1, search: 1, width: '80px'},
                {field: 'type', name: '推广类型', menu: 1, width: '60px'},
                {field: 'app_name', name: '广告名称', menu: 1, search: 1, width: '60px'},
                {field: 'business_type', name: '业务类型', menu: 1, width: '70px'},
                {field: 'ad_type', name: '广告类型', menu: 1, width: '60px'},
                {field: 'channel', name: '渠道号', menu: 1, hidden: true, width: '55px'},
                {field: 'brief_name', name: '媒体商', menu: 1, width: '60px'},
                {field: 'name', name: '媒体商(全称)', menu: 1, width: '120px'},
                {field: 'zonename', name: '广告位', menu: 1, width: '60px'},
                {field: 'zone_type', name: '广告位类别', menu: 1, hidden: true, width: '60px'},
                {field: 'platform', name: '所属平台', menu: 1, width: '60px'}
            ]
        };

        this.summaryField = [
            {field: 'sum_views', aggregate: 'sum', format: 'n0'},
            {field: 'sum_cpc_clicks', aggregate: 'sum', format: 'n0'},
            {field: 'sum_download_requests', aggregate: 'sum', format: 'n0'},
            {field: 'sum_download_complete', aggregate: 'sum', format: 'n0'},
            {field: 'sum_clicks', aggregate: 'sum', format: 'n0'},
            {field: 'sum_payment', aggregate: 'sum', format: 'n2'},
            {field: 'sum_payment_gift', aggregate: 'sum', format: 'n2'},
            {field: 'sum_revenue', aggregate: 'sum', format: 'n2'},
            {field: 'sum_revenue_gift', aggregate: 'sum', format: 'n2'},
            {field: 'sum_cpa', aggregate: 'sum', format: 'n0'},
            {field: 'sum_revenue_client', aggregate: 'sum', format: 'n2'},
            {field: 'sum_payment_trafficker', aggregate: 'sum', format: 'n2'},
            {field: 'profit', aggregate: 'sum', format: 'n2'}
            // {field: 'sum_consum', aggregate: 'sum', format: 'n2'}
        ];

        this.summaryData = [];
        this.changeTab = true;
        this.Yrate = 2; // 双纵坐标合并比例
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

        _setOperation: function (operationList) {
            var column = null;
            if (operationList.indexOf(OPERATION_LIST.manager_sum_views) > -1) {
                this.itemList.sum_views.hidden = false;
                column = {field: 'sum_views', name: '展示量', menu: 1, format: 'n0', width: '110px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_sum_cpc_clicks) > -1) {
                this.itemList.sum_cpc_clicks.hidden = false;
                column = {field: 'sum_cpc_clicks', name: '点击量', menu: 1, format: 'n0', width: '80px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_sum_download_requests) > -1) {
                this.itemList.sum_download_requests.hidden = false;
                column = {field: 'sum_download_requests', name: '下载请求（监控）', menu: 1, format: 'n0', width: '80px', hidden: true};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_sum_download_complete) > -1) {
                this.itemList.sum_download_complete.hidden = false;
                column = {field: 'sum_download_complete', name: '下载完成（监控）', menu: 1, format: 'n0', width: '80px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_sum_clicks) > -1) {
                this.operationClicks = true;
                this.itemList.sum_clicks.hidden = false;
                column = {field: 'sum_clicks', name: '下载量（上报）', menu: 1, format: 'n0', width: '80px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_sum_cpa) > -1) {
                this.itemList.sum_cpa.hidden = false;
                column = {field: 'sum_cpa', name: 'CPA量', menu: 1, format: 'n0', width: '70px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_ctr) > -1) {
                this.itemList.ctr.hidden = false;
                column = {field: 'ctr', name: '下载转化率', menu: 1, format: 'p2', width: '65px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_cpc_ctr) > -1) {
                this.itemList.cpc_ctr.hidden = false;
                column = {field: 'cpc_ctr', name: '点击转化率', menu: 1, format: 'p2', width: '65px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }

            if (operationList.indexOf(OPERATION_LIST.manager_sum_revenue_client) > -1) {
                this.itemList.sum_revenue_client.hidden = false;
                column = {field: 'sum_revenue_client', name: '广告主消耗（总数）', menu: 1, format: 'n2', width: '100px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }

            if (operationList.indexOf(OPERATION_LIST.manager_sum_revenue) > -1) {
                this.itemList.sum_revenue.hidden = false;
                column = {field: 'sum_revenue', name: '广告主消耗（充值金）', menu: 1, format: 'n2', width: '100px', hidden: true};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_sum_revenue_gift) > -1) {
                this.itemList.sum_revenue_gift.hidden = false;
                column = {field: 'sum_revenue_gift', name: '广告主消耗（赠送金）', menu: 1, format: 'n2', width: '80px', hidden: true};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }

            column = {field: 'client_revenue_type', name: '计费方式(广告主)', menu: 1, width: '60px'};
            this.columnList.zones.push(column);
            this.columnList.clients.push(column);

            if (operationList.indexOf(OPERATION_LIST.manager_sum_payment_trafficker) > -1) {
                this.itemList.sum_payment_trafficker.hidden = false;
                column = {field: 'sum_payment_trafficker', name: '媒体支出（总数）', menu: 1, format: 'n2', width: '100px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }

            if (operationList.indexOf(OPERATION_LIST.manager_sum_payment) > -1) {
                this.itemList.sum_payment.hidden = false;
                column = {field: 'sum_payment', name: '媒体支出（充值金）', menu: 1, format: 'n2', width: '100px', hidden: true};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_sum_payment_gift) > -1) {
                this.itemList.sum_payment_gift.hidden = false;
                column = {field: 'sum_payment_gift', name: '媒体支出(赠送金)', menu: 1, format: 'n2', width: '80px', hidden: true};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            column = {field: 'media_revenue_type', name: '计费方式(媒体商)', menu: 1, width: '60px'};
            this.columnList.zones.push(column);
            this.columnList.clients.push(column);

            if (operationList.indexOf(OPERATION_LIST.manager_cpd) > -1) {
                this.itemList.cpd.hidden = false;
                column = {field: 'cpd', name: '平均单价(广告主)', menu: 1, format: 'n2', width: '60px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_media_cpd) > -1) {
                this.itemList.media_cpd.hidden = false;
                column = {field: 'media_cpd', name: '平均单价(媒体商)', menu: 1, format: 'n2', width: '60px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }
            if (operationList.indexOf(OPERATION_LIST.manager_ecpm) > -1) {
                this.itemList.ecpm.hidden = false;
                column = {field: 'ecpm', name: 'eCPM', menu: 1, format: 'n2', width: '50px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }

            if (operationList.indexOf(OPERATION_LIST.manager_profit) > -1) {
                this.itemList.profit.hidden = false;
                column = {field: 'profit', name: '毛利', menu: 1, format: 'n2', width: '100px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
            }

            if (operationList.indexOf(OPERATION_LIST.manager_profit_rate) > -1) {
                this.itemList.profit_rate.hidden = false;
                column = {field: 'profit_rate', name: '毛利率', menu: 1, format: 'p2', width: '70px'};
                this.columnList.zones.push(column);
                this.columnList.clients.push(column);
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
            var _this = this;
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
            else {
                this.categoryAxis.labels.format = '{0:t}';
                this.categoryAxis.baseUnit = 'hours';
                this.categoryAxis.crosshair.tooltip.format = 't';
                this.categoryAxis.majorGridLines.step = 3;
                return;
            }
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

            if (!this.categoryAxis.crosshair.template) {
                this.categoryAxis.crosshair.tooltip.template = function (obj) {
                    return _this._renderCrosshairTooltip(obj);
                };
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

        _getGeneralData: function () {
            var _this = this;
            var param = {
                audit: _this.audit,
                period_start: _this.dateRenge.from,
                period_end: _this.dateRenge.to,
                span: _this.span,
                zone_offset: '-8'
            };
            var url = this.role === 'zones' ? API_URL.manager_stat_zone : API_URL.manager_stat_client;
            this._ajaxOpen();
            $.get(url, param, function (result) {
                if (!result.res) {
                    _this._ajaxClose();
                    var field = _this.fieldKey[_this.role].major;
                    _this.oChartInfo.aRawData = $.isArray(result.list.statChart) ? result.list.statChart : [];
                    _this.oChartInfo.oRawData = _this._convertArrayToObj(_this.oChartInfo.aRawData, field);
                    _this.oGridInfo.oRawData = _this._convertArrayToObj($.isArray(result.list.statData) ? result.list.statData : [], _this.role === 'zones' ? field : _this.fieldKey[_this.role].secondary);
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

        _getDetailData: function (data, callback) {
            var _this = this;
            var param = {
                audit: this.audit,
                period_start: this.dateRenge.from,
                period_end: this.dateRenge.to,
                span: this.span,
                zone_offset: '-8'
            };
            var url = '';
            var chartItem = this.role === 'zones' ? this.oChartInfo.oRawData[data.id] : this.oChartInfo.oRawData[data.parentId];
            var gridItem = this.oGridInfo.oRawData[data.id];
            if (this.role === 'zones') {
                param.affiliateid = data.id;
                url = API_URL.manager_stat_zone_affiliate;
            }
            else {
                param.campaignid = data.id;
                url = API_URL.manager_stat_client_campaign;
            }

            this._ajaxOpen();
            $.get(url, param, function (result) {
                if (!result.res) {
                    _this._ajaxClose();
                    var statChart = result.list.statChart ? result.list.statChart : {};
                    var statData = result.list.statData ? result.list.statData : [];
                    gridItem.child = statData;
                    if (_this.role === 'zones') {
                        var dataList = [];
                        for (var key in statChart) {
                            if (statChart.hasOwnProperty(key)) {
                                dataList = dataList.concat(statChart[key]);
                            }
                        }
                        chartItem.child_list = dataList;
                        callback(dataList, statData);
                    }
                    else {
                        if (!chartItem.child_list) {
                            chartItem.child_list = {};
                        }
                        $.extend(chartItem.child_list, statChart);
                        callback(statChart, statData);
                    }

                    chartItem = null;
                    gridItem = null;
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

        // 渲染业务类型
        _renderSelectedBusinessType: function () {
            var businessType = LANG.business_type;
            var html = '';
            for (var key in businessType) {
                if (businessType.hasOwnProperty(key)) {
                    html += '<option value="' + key + '">' + businessType[key] + '</option>';
                }
            }
            $('#select-business-type').append(html);
        },

        // 渲染广告主计费类型
        _renderSelectedCtRt: function () {
            $('#select-client-revenue-type').append(this._genSelectRevenueType());
        },

        // 渲染媒体商计费类型
        _renderSelectedAfRt: function () {
            $('#select-affiliate-revenue-type').append(this._genSelectRevenueType());
        },

        _renderSelectMajor: function (data) {
            var selectedMajor = this.selectedMajor;
            var fieldKey = this.fieldKey[this.role];
            data.sort(function (a, b) {
                return a[fieldKey.majorLabel].localeCompare(b[fieldKey.majorLabel]);
            });
            var html = '';
            var tmp = null;
            if (this.role === 'zones') {
                var groupObj = {};
                for (var i = 0; i < data.length; i++) {
                    tmp = data[i];
                    if (groupObj[tmp.mode] !== undefined) {
                        groupObj[tmp.mode].push(tmp);
                    }
                    else {
                        groupObj[tmp.mode] = [tmp];
                    }
                }
                var groupHtml = '';
                var tmpArr = null;
                for (var key in groupObj) {
                    if (groupObj.hasOwnProperty(key)) {
                        groupHtml = '<optgroup label="' + LANG.mode[String(key)] + '">';
                        tmpArr = groupObj[key];
                        for (var j = 0; j < tmpArr.length; j++) {
                            tmp = tmpArr[j];
                            groupHtml += '<option value="' + tmp[fieldKey.major] + '" ' + ($.inArray(String(tmp[fieldKey.major]), selectedMajor) > -1 ? 'selected="selected"' : '') + '>' + tmp[fieldKey.majorLabel] + '</option>';
                        }
                        groupHtml += '</optgroup>';
                        html += groupHtml;
                    }
                }
            }
            else {
                for (var ii = 0; ii < data.length; ii++) {
                    tmp = data[ii];
                    html += '<option value="' + tmp[fieldKey.major] + '" ' + ($.inArray(String(tmp[fieldKey.major]), selectedMajor) > -1 ? 'selected="selected"' : '') + '>' + tmp[fieldKey.majorLabel] + '</option>';
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

        _renderSelectSecondary: function (data) {
            if (this.role === 'clients') {
                var selectedSecondary = this.selectedSecondary;
                var fieldKey = this.fieldKey[this.role];
                var html = '';
                var tmp = null;
                var flag = false;
                html += '<option value="all">所有广告</option>';
                var arr = this._sortClients(data);
                for (var i = 0; i < arr.length; i++) {
                    tmp = arr[i];
                    if (this.selectedBusinessType !== 'all' && this.selectedBusinessType !== String(tmp.business_type)) {
                        continue;
                    }
                    if (String(tmp[fieldKey.secondary]) === selectedSecondary) {
                        flag = true;
                        html += '<option value="' + tmp[fieldKey.secondary] + '" selected>' + tmp[fieldKey.secondaryLabel] + '</option>';
                    }
                    else {
                        html += '<option value="' + tmp[fieldKey.secondary] + '">' + tmp[fieldKey.secondaryLabel] + '</option>';
                    }
                }
                if (!flag && this.selectedSecondaryName !== '' && selectedSecondary !== 'all') {
                    html += '<option value="' + selectedSecondary + '" selected>' + this.selectedSecondaryName + '</option>';
                }
                $('#select-secondary').html(html).parent().show();
                this.selectedSecondary = $('#select-secondary').val();
            }
            else {
                $('#select-secondary').html('').parent().hide();
                this.selectedSecondary = 'all';
            }
        },

        _renderSelectThird: function (data) {
            var selectedThird = this.selectedThird;
            var fieldKey = this.fieldKey[this.role];
            var html = '';
            var tmp = null;
            var len = data.length;
            if (this.role === 'zones') {
                html += '<option value="all">所有广告</option>';
            }
            else {
                html += '<option value="all">所有媒体</option>';
            }
            for (var i = 0; i < len; i++) {
                tmp = data[i].items[0];
                if (this.role === 'zones' && this.selectedBusinessType !== 'all' && this.selectedBusinessType !== String(tmp.business_type)) {
                    continue;
                }
                html += '<option value="' + tmp[fieldKey.third] + '" ' + (String(tmp[fieldKey.third]) === selectedThird ? 'selected' : '') + '>' + tmp[fieldKey.thirdLabel] + '</option>';
            }

            $('#select-third').html(html).parent().show();
            this.selectedThird = $('#select-third').val();
        },

        // 对广告排序
        _sortClients: function (data) {
            var arr = [];
            var fieldKey = this.fieldKey[this.role];
            var tmp = null;
            var tmp1 = null;
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    tmp = data[key][fieldKey.firstList];
                    for (var key1 in tmp) {
                        if (tmp.hasOwnProperty(key1)) {
                            tmp1 = tmp[key1];
                            arr.push(tmp1);
                        }
                    }
                }
            }

            arr.sort(function (a, b) {
                return a[fieldKey.secondaryLabel].localeCompare(b[fieldKey.secondaryLabel]);
            });

            return arr;
        },

        _genChart: function () {
            var aRawData = this.oChartInfo.aRawData;
            this._renderSelectMajor(aRawData);
            this._screenData(1);
        },

        _screenData: function (level) {
            var oRawData = this.oChartInfo.oRawData;
            var selectedMajor = this.selectedMajor;
            var selectedSecondary = this.selectedSecondary;
            var selectedThird = this.selectedThird;
            var aChartData = [];
            var fieldKey = this.fieldKey[this.role];
            var majorField = fieldKey.major;
            var firstList = fieldKey.firstList;
            var secondList = fieldKey.secondList;
            var _this = this;
            var tmp = null;
            var key = null;
            var field = null;
            var len = selectedMajor.length;
            if (this.role === 'zones') {
                if (selectedThird === 'all') {
                    if (len === 1) {
                        var affiliateid = selectedMajor[0];
                        var mediaInfo = oRawData[affiliateid];
                        tmp = mediaInfo[firstList];

                        for (key in tmp) {
                            if (tmp.hasOwnProperty(key)) {
                                aChartData = aChartData.concat(tmp[key][secondList]);
                            }
                        }
                        field = fieldKey.secondary;
                        if (!mediaInfo.child_list) {
                            this._getDetailData({id: affiliateid}, function (dataList) {
                                _this._renderSelectThird(_this._setSeriesData(dataList, fieldKey.third));
                                fieldKey = null;
                                _this._showGrid();
                            });
                        }
                        else {
                            if (level !== 3) {
                                this._renderSelectThird(_this._setSeriesData(mediaInfo.child_list, fieldKey.third));
                            }
                        }
                    }
                    else if (len === 0) {
                        for (key in oRawData) {
                            if (oRawData.hasOwnProperty(key)) {
                                tmp = oRawData[key][firstList];
                                for (key in tmp) {
                                    if (tmp.hasOwnProperty(key)) {
                                        aChartData = aChartData.concat(tmp[key][secondList]);
                                    }
                                }
                            }
                        }
                        field = majorField;
                    }
                    else {
                        for (key in oRawData) {
                            if (oRawData.hasOwnProperty(key)) {
                                if ($.inArray(String(oRawData[key][majorField]), selectedMajor) > -1) {
                                    tmp = oRawData[key][firstList];
                                    for (key in tmp) {
                                        if (tmp.hasOwnProperty(key)) {
                                            aChartData = aChartData.concat(tmp[key][secondList]);
                                        }
                                    }
                                }
                            }
                        }
                        field = majorField;
                    }
                }
                else {
                    var id = selectedMajor[0];
                    var dataList = oRawData[id].child_list;
                    this._renderSelectThird(this._setSeriesData(dataList, fieldKey.third));
                    for (var i = 0; i < dataList.length; i++) {
                        tmp = dataList[i];
                        if (String(tmp[fieldKey.third]) === selectedThird) {
                            aChartData.push(tmp);
                        }
                    }
                    field = fieldKey.secondary;
                }
            }
            else {
                var tmp1Data = {};
                var key1 = null;
                field = fieldKey.secondary;
                if (len === 0) {
                    tmp1Data = oRawData;
                }
                else {
                    for (var k = 0; k < len; k++) {
                        tmp = selectedMajor[k];
                        tmp1Data[tmp] = oRawData[tmp];
                    }
                }
                // 初始化二级下拉框
                if (level === 1) {
                    this._renderSelectSecondary(tmp1Data);
                }
                if (selectedThird === 'all') {
                    if (selectedSecondary === 'all') {
                        for (key in tmp1Data) {
                            if (tmp1Data.hasOwnProperty(key)) {
                                tmp = tmp1Data[key][fieldKey.firstList];
                                for (key1 in tmp) {
                                    if (tmp.hasOwnProperty(key1)) {
                                        aChartData = aChartData.concat(tmp[key1][fieldKey.secondList]);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        var getDetailData = function (statChart) {
                            // 初始化三级下拉框
                            _this._renderSelectThird(_this._setSeriesData(statChart[selectedSecondary], fieldKey.third));
                            _this._showGrid();
                        };
                        for (key in tmp1Data) {
                            if (tmp1Data.hasOwnProperty(key)) {
                                tmp = tmp1Data[key][fieldKey.firstList];
                                if (tmp[selectedSecondary]) {
                                    aChartData = aChartData.concat(tmp[selectedSecondary][fieldKey.secondList]);
                                    if (!tmp1Data[key].child_list || !tmp1Data[key].child_list[selectedSecondary]) {
                                        this._getDetailData({id: selectedSecondary, parentId: key}, getDetailData);
                                    }
                                    else {
                                        // 初始化三级下拉框
                                        this._renderSelectThird(_this._setSeriesData(tmp1Data[key].child_list[selectedSecondary], fieldKey.third));
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
                else {
                    for (key in tmp1Data) {
                        if (tmp1Data.hasOwnProperty(key)) {
                            tmp = tmp1Data[key].child_list;
                            var item = tmp1Data[key][fieldKey.firstList];
                            if (tmp && tmp[selectedSecondary]) {
                                var tmp1 = tmp[selectedSecondary];
                                for (var j = 0; j < tmp1.length; j++) {
                                    var tmp2 = tmp1[j];
                                    if (String(tmp2[fieldKey.third]) === selectedThird) {
                                        aChartData.push($.extend({
                                            app_name: item[selectedSecondary][fieldKey.secondaryLabel]
                                        }, tmp2));
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }
            this.oChartInfo.aShowData = aChartData;
            this.oChartInfo.field = field;
            this._filterDataByRevenueType();
            this._showGrid();
        },

        _filterDataByRevenueType: function () {
            var aShowData = this.oChartInfo.aShowData;
            var field = this.oChartInfo.field;
            var selectedCtRt = this.selectedCtRt;
            var selectedAfRt = this.selectedAfRt;
            var selectedBusinessType = this.selectedBusinessType;
            var aChartData = [];
            var arr = [];
            var tmp = null;
            var itemList = this.itemList;
            var fieldKey = this.fieldKey[this.role];
            var dataField = this.role === 'clients' ? fieldKey.secondary : fieldKey.major;
            if (selectedCtRt === 'all' && selectedAfRt === 'all') {
                arr = aShowData;
            }
            else {
                for (var i = 0; i < aShowData.length; i++) {
                    tmp = aShowData[i];
                    if ((selectedCtRt === 'all' || tmp.client_revenue_type === undefined || String(tmp.client_revenue_type) === selectedCtRt)
                        && (selectedAfRt === 'all' || tmp.media_revenue_type === undefined || String(tmp.media_revenue_type) === selectedAfRt)) {
                        arr.push(tmp);
                    }
                }
            }

            if (selectedBusinessType === 'all') {
                aChartData = arr;
            }
            else {
                for (var j = 0; j < arr.length; j++) {
                    tmp = arr[j];
                    if (tmp.business_type === undefined || selectedBusinessType === String(tmp.business_type)) {
                        aChartData.push(tmp);
                    }
                }
            }

            this.oChartInfo.renderData = aChartData;
            var aggregates = [];
            for (var k in itemList) {
                if (itemList.hasOwnProperty(k)) {
                    tmp = itemList[k];
                    if (tmp.field_type === 'basics') {
                        aggregates.push({field: tmp.field, aggregate: 'sum'});
                    }
                }
            }

            var renderDataSource = new kendo.data.DataSource({
                data: aChartData,
                schema: $.extend({}, this.dataSourceSchema),
                group: [
                    // group by "time" and then by "id"
                    {
                        field: dataField,
                        aggregates: aggregates
                    }
                ]
            });
            renderDataSource.read();
            this.oChartInfo.renderDataSource = renderDataSource;
            this.oChartInfo.view = this._sortChartData(aChartData, field);
            this._renderChart();
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

        _setSeriesData: function (aChartData, field) {
            var schema = $.extend({}, this.dataSourceSchema);
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
            return view;
        },

        _renderChart: function () {
            var len = this.selectedItems.length;
            if (len <= 0) {
                return;
            }
            var _this = this;
            var view = this.oChartInfo.view;
            var ll = view.length;
            var aChartData = [];
            var categoryAxis = this.categoryAxis;
            var series = [];
            var valueAxis = [];
            var aggregates = [];
            var fieldKey = this.fieldKey[this.role];
            var dataField = fieldKey.secondary;
            var nameKey = fieldKey.secondaryLabel;
            if (this.role === 'zones' && this.selectedMajor.length !== 1) {
                dataField = fieldKey.major;
                nameKey = fieldKey.majorLabel;
            }

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

            if (obj.value && this.selectedSecondary === 'all' && len === 1 && itemList[selectedItems[0]].chart_type === 'column') {
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
            var oRawData = this.oGridInfo.oRawData;
            var selectedMajor = this.selectedMajor;
            var selectedSecondary = this.selectedSecondary;
            var selectedThird = this.selectedThird;
            var len = selectedMajor.length;
            var tmp1Data = {};
            var data = {};
            var tmp = null;
            var tmp1 = null;
            var fieldKey = this.fieldKey[this.role];
            if (this.role === 'zones') {
                if (len === 0) {
                    tmp1Data = oRawData;
                }
                else {
                    for (var i = 0; i < len; i++) {
                        tmp = selectedMajor[i];
                        tmp1Data[tmp] = oRawData[tmp];
                    }
                }

                if (selectedThird === 'all') {
                    data = tmp1Data;
                }
                // 不为all的时候，selectedMajor数组长度为1
                else {
                    var key = null;
                    var key1 = null;
                    var key2 = null;

                    for (key in tmp1Data) {
                        if (tmp1Data.hasOwnProperty(key)) {
                            tmp = tmp1Data[key];
                            var o = $.extend({}, tmp);
                            delete o.child;
                            data[key] = $.extend({child: {}}, o);
                            for (key1 in tmp.child) {
                                if (tmp.child.hasOwnProperty(key1)) {
                                    tmp1 = tmp.child[key1];
                                    for (key2 in tmp1.child) {
                                        if (tmp1.child.hasOwnProperty(key2) && String(tmp1.child[key2][fieldKey.third]) === selectedThird) {
                                            if (!data[key].child[key1]) {
                                                var oo = $.extend({}, tmp1);
                                                delete oo.child;
                                                data[key].child[key1] = $.extend({child: {}}, oo);
                                            }
                                            data[key].child[key1].child[key2] = tmp1.child[key2];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {
                if (selectedSecondary === 'all') {
                    if (len === 0) {
                        tmp1Data = oRawData;
                    }
                    else {
                        for (var k in oRawData) {
                            if (oRawData.hasOwnProperty(k)) {
                                tmp = oRawData[k];
                                if ($.inArray(String(tmp[fieldKey.major]), selectedMajor) > -1) {
                                    tmp1Data[k] = tmp;
                                }
                            }
                        }
                    }
                }
                else {
                    tmp1Data[selectedSecondary] = oRawData[selectedSecondary];
                }

                if (selectedThird === 'all') {
                    data = tmp1Data;
                }
                // 不为all时，selectedSecondary值不为all
                else {
                    tmp = tmp1Data[selectedSecondary];
                    var ob = $.extend({}, tmp);
                    delete ob.child;
                    data[selectedSecondary] = $.extend({child: {}}, ob);
                    for (var k1 in tmp.child) {
                        if (tmp.child.hasOwnProperty(k1)) {
                            tmp1 = tmp.child[k1];
                            if (String(tmp1[fieldKey.third]) === selectedThird) {
                                data[selectedSecondary].child[k1] = tmp1;
                            }
                        }
                    }
                }
            }
            this.oGridInfo.aShowData = this._formatGridData(data);
            this._renderGrid();
        },
        // 计费类型检测
        _checkRevenueType: function (data) {
            var selectedCtRt = this.selectedCtRt;
            var selectedAfRt = this.selectedAfRt;
            if (selectedCtRt === 'all' && selectedAfRt === 'all') {
                return true;
            }
            if ((selectedCtRt === 'all' || data.client_revenue_type === undefined || String(data.client_revenue_type) === selectedCtRt)
                && (selectedAfRt === 'all' || data.media_revenue_type === undefined || String(data.media_revenue_type) === selectedAfRt)) {
                return true;
            }
            return false;
        },

        _checkBusinessType: function (data) {
            var businessType = this.selectedBusinessType;
            if (businessType === 'all' || data.business_type === undefined || String(data.business_type) === businessType) {
                return true;
            }
            return false;
        },

        // 更新过滤后数据
        _updateFilterRtData: function (data) {
            var fieldKey = this.fieldKey[this.role];
            var dataField = this.role === 'clients' ? fieldKey.secondary : fieldKey.major;
            var view = this.oChartInfo.renderDataSource.view();
            var item = null;
            var obj = {
                sum_views: 0,
                sum_download_requests: 0,
                sum_clicks: 0,
                sum_download_complete: 0,
                sum_revenue: 0,
                sum_payment: 0,
                sum_cpa: 0,
                sum_cpc_clicks: 0,
                sum_payment_gift: 0,
                sum_revenue_gift: 0
            };
            for (var i = 0; i < view.length; i++) {
                if (view[i].value === data[dataField]) {
                    item = view[i].aggregates;
                }
            }
            for (var key in item) {
                if (item.hasOwnProperty(key)) {
                    obj[key] = item[key].sum;
                }
            }
            return obj;
        },

        // 计算报表树状数据
        _setSummaryData: function (summary, data) {
            for (var key in summary) {
                if (summary.hasOwnProperty(key)) {
                    summary[key] += (+data[key]);
                }
            }
            return summary;
        },

        // 计算所有数据，消耗、支出、毛利、毛利率
        _setCalculatData: function (data) {
            data.sum_views = Number(data.sum_views);
            data.sum_download_requests = Number(data.sum_download_requests);
            data.sum_clicks = Number(data.sum_clicks);
            data.sum_download_complete = Number(data.sum_download_complete);
            data.sum_revenue = Number(data.sum_revenue);
            data.sum_payment = Number(data.sum_payment);
            data.sum_cpa = Number(data.sum_cpa);
            data.sum_cpc_clicks = Number(data.sum_cpc_clicks);
            data.sum_payment_gift = Number(data.sum_payment_gift);
            data.sum_revenue_gift = Number(data.sum_revenue_gift);

            data.ctr = isFinite(data.sum_clicks / data.sum_views) ? data.sum_clicks / data.sum_views : 0;
            data.cpc_ctr = isFinite(data.sum_cpc_clicks / data.sum_views) ? data.sum_cpc_clicks / data.sum_views : 0;

            data.sum_revenue_client = data.sum_revenue + data.sum_revenue_gift;
            data.sum_payment_trafficker = data.sum_payment + data.sum_payment_gift;

            if (data.client_revenue_type === CONSTANT.revenue_type_cpc) {
                data.cpd = isFinite(data.sum_revenue_client /  data.sum_cpc_clicks) ? data.sum_revenue_client / data.sum_cpc_clicks : 0;
            }
            else if (data.client_revenue_type === CONSTANT.revenue_type_cpd) {
                data.cpd = isFinite(data.sum_revenue_client /  data.sum_clicks) ? data.sum_revenue_client / data.sum_clicks : 0;
            }
            else if (data.client_revenue_type === CONSTANT.revenue_type_cpa) {
                data.cpd = isFinite(data.sum_revenue_client / data.sum_cpa) ? data.sum_revenue_client / data.sum_cpa : 0;
            }
            else if (data.client_revenue_type === CONSTANT.revenue_type_cpm) {

            }
            else {
                data.cpd = '';
            }

            if (data.media_revenue_type === CONSTANT.revenue_type_cpc) {
                data.media_cpd = isFinite(data.sum_payment_trafficker /  data.sum_cpc_clicks) ? data.sum_payment_trafficker / data.sum_cpc_clicks : 0;
            }
            else if (data.media_revenue_type === CONSTANT.revenue_type_cpd) {
                data.media_cpd = isFinite(data.sum_payment_trafficker /  data.sum_clicks) ? data.sum_payment_trafficker / data.sum_clicks : 0;
            }
            else if (data.media_revenue_type === CONSTANT.revenue_type_cpa) {
                data.cpd = isFinite(data.sum_payment_trafficker / data.sum_cpa) ? data.sum_payment_trafficker / data.sum_cpa : 0;
            }
            else if (data.media_revenue_type === CONSTANT.revenue_type_cpm) {
                data.media_cpd = isFinite(data.sum_payment_trafficker /  (data.sum_views / 1000)) ? data.sum_payment_trafficker / (data.sum_views / 1000) : 0;
            }
            else {
                data.media_cpd = '';
            }
            // var num = data.sum_clicks + data.sum_cpc_clicks + data.sum_cpa;
            // data.cpd = isFinite(data.sum_revenue_client / num) ? data.sum_revenue_client / num : 0;
            // data.media_cpd = isFinite(data.sum_payment_trafficker / num) ? data.sum_payment_trafficker / num : 0;
            data.ecpm = isFinite(data.sum_revenue_client / data.sum_views * 1000) ? data.sum_revenue_client / data.sum_views * 1000 : 0;

            data.profit = data.sum_revenue - data.sum_payment_trafficker;
            data.profit_rate = isFinite(data.profit / data.sum_revenue) ? data.profit / data.sum_revenue : 0;
            return data;
        },

        // 检测数据是否都是0
        _checkNotZero: function (data) {
            if (Number(data.sum_views) + Number(data.sum_download_requests) + Number(data.sum_clicks)
                + Number(data.sum_download_complete) + Number(data.sum_revenue) + Number(data.sum_payment)
                + Number(data.sum_cpa) +  Number(data.sum_cpc_clicks) +  Number(data.sum_payment_gift) + Number(data.sum_revenue_gift) > 0) {
                return true;
            }
            return false;
        },

        // 报表对象数组格式化，数据改为treelist
        _formatGridData: function (data, parentId) {
            var arr = [];
            var key = null;
            var key1 = null;
            var defaultData = {
                sum_views: 0,
                sum_download_requests: 0,
                sum_clicks: 0,
                sum_download_complete: 0,
                sum_revenue: 0,
                sum_payment: 0,
                sum_cpa: 0,
                sum_cpc_clicks: 0,
                sum_payment_gift: 0,
                sum_revenue_gift: 0
            };
            for (key in data) {
                if (data.hasOwnProperty(key) && data[key] && this._checkRevenueType(data[key]) && this._checkBusinessType(data[key])) {
                    var tmp = data[key];
                    var id = Math.random();
                    var o = $.extend({
                        parentId: parentId ? parentId : null,
                        id: id
                    }, tmp);
                    delete o.child;
                    if (tmp.child) {
                        var summary1 = $.extend({}, defaultData);
                        for (key1 in tmp.child) {
                            if (tmp.child.hasOwnProperty(key1) && this._checkRevenueType(tmp.child[key1]) && this._checkBusinessType(tmp.child[key1])) {
                                var id1 = Math.random();
                                var ttmp = tmp.child[key1];
                                var oo = $.extend({
                                    parentId: id,
                                    id: id1
                                }, ttmp);
                                delete oo.child;

                                if (ttmp.child) {
                                    var summary2 = $.extend({}, defaultData);
                                    for (var key2 in ttmp.child) {
                                        if (ttmp.child.hasOwnProperty(key2) && this._checkRevenueType(ttmp.child[key2]) && this._checkBusinessType(ttmp.child[key2])) {
                                            summary2 = this._setSummaryData(summary2, ttmp.child[key2]);
                                            arr.push($.extend({parentId: id1, id: Math.random()}, this._setCalculatData(ttmp.child[key2])));
                                        }
                                    }
                                    oo = $.extend(oo, summary2);
                                }
                                // 检测数据是否都不是0
                                if (this._checkNotZero(oo)) {
                                    arr.push(this._setCalculatData(oo));
                                    summary1 = this._setSummaryData(summary1, oo);
                                }
                            }
                        }
                        o = $.extend(o, summary1);
                    }
                    else {
                        if (!parentId) {
                            o.hasChildren = true;
                        }
                        o = $.extend({}, o, this._updateFilterRtData(o));
                    }
                    if (this._checkNotZero(o)) {
                        arr.push(this._setCalculatData(o));
                    }
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
            var tabColumns = this.columnList[this.role];
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
                if (i === 0) {
                    col.template = '#if (data.' + tmp.field + '){ # <span title="#: data.' + tmp.field + ' #" data-id="#:data.id#"> #: data.' + tmp.field + '# </span> # } #';
                }
                else {
                    col.headerAttributes = {'class': 'k-header hidden-menu'};
                    if (tmp.field === 'brief_name') {
                        col.template = '#if (data.' + tmp.field + '){ # <span title="#: data.' + tmp.field + ' #"> #: data.' + tmp.field + '# </span> # } #';
                    }
                }
                if (tmp.field === 'product_name') {
                    col.template = '';
                    if (i === 1) {
                        col.template += '#if (data.product_icon){ # <img width=\'40\' height=\'40\' src=\'#: data.product_icon #\'> # } #';
                    }
                    col.template += '#if(data.product_name){#<span title="#:data.product_name#">#:data.product_name#</span>#}else{##}#';
                }
                else if (tmp.field === 'app_name' || tmp.field === 'channel' || tmp.field === 'zonename') {
                    col.template = '#if (data.' + tmp.field + '){ # <span title="#: data.' + tmp.field + ' #"> #: data.' + tmp.field + '# </span> # } #';
                }
                else if (tmp.field === 'business_type') {
                    col.template = '#if (data.' + tmp.field + '){ # #: LANG.business_type[data.' + tmp.field + ']# # } else { #-# } #';
                }
                else if (tmp.field === 'client_revenue_type' || tmp.field === 'media_revenue_type') {
                    col.template = '#if (data.' + tmp.field + '){ # #: LANG.revenue_type[data.' + tmp.field + ']# # } else { #-# } #';
                }
                else if (tmp.field === 'platform') {
                    col.template = '#if (data.platform){#<span title="#:LANG.platform_group[data.platform]#">#:LANG.platform_group[data.platform]#</span>#}#';
                }
                else if (tmp.field === 'product_type' || tmp.field === 'type') {
                    col.template = '#if (data.' + tmp.field + ' !== undefined && data.' + tmp.field + ' !== null){#<span title="#:LANG.products_type[data.' + tmp.field + ']#">#:LANG.products_type[data.' + tmp.field + ']#</span>#}#';
                }
                else if (tmp.field === 'ad_type') {
                    col.template = '#if (data.ad_type !== undefined && data.ad_type !== null){#<span title="#:LANG.ad_type[data.ad_type]#">#:LANG.ad_type[data.ad_type]#</span>#}#';
                }
                else if (tmp.field === 'zone_type') {
                    col.template = '#if (data.zone_type !== undefined && data.zone_type !== null){#<span title="#:LANG.ZONE_TYPE[data.zone_type]#">#:LANG.ZONE_TYPE[data.zone_type]#</span>#}#';
                }
                else if (tmp.field === 'cpd' || tmp.field === 'media_cpd') {
                    col.template = '#if (data.' + tmp.field + ' !== "" && data.' + tmp.field + ' !== null && !isNaN(data.' + tmp.field + ')){# #: kendo.toString(data.' + tmp.field + ', "' + tmp.format + '")# #} else {#-#}#';
                }

                if (tmp.format && tmp.field !== 'cpd' && tmp.field !== 'media_cpd') {
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
            // if (this.operationClicks) {
            //     opt.sort = [
            //         {dir: 'desc', field: 'sum_revenue_client'},
            //         {dir: 'asc', field: this.role === 'zones' ? 'brief_name' : 'app_name'}
            //     ];
            // }
            // if (this.oRenderGrid) {
            //     var options = this.oRenderGrid.dataSource;
            //     if (options._sort) {
            //         opt.sort = options._sort;
            //     }
            // }
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
                if (!this.changeTab) {
                    this.summaryData = [];
                    this._refreshGrid();
                    return;
                }
                this.oRenderGrid.destroy();
                $('#treelist').html('');
            }

            schema.model.id = 'id';
            schema.model.parentId = 'parentId';
            schema.parse = function (response) {
                if (_this.oRenderGrid) {
                    response = _this._setData();
                }
                var i = 0;
                var l = 0;
                var idArr = [];
                var showIds = [];
                var data = [];
                var tmp = null;
                var summaryArr = [];
                var sortData = [];
                for (i = 0, l = response.length; i < l; i++) {
                    if (response[i].parentId === null) {
                        tmp = response[i];
                        sortData.push(tmp);
                    }
                }
                sortData.sort(function (a, b) {
                    var res = 0;
                    if (_this.oRenderGrid && _this.oRenderGrid.dataSource && _this.oRenderGrid.dataSource._sort && _this.oRenderGrid.dataSource._sort[0]) {
                        var sort = _this.oRenderGrid.dataSource._sort[0];
                        var field = sort.field;
                        if (_this.dataSourceSchema.model.fields[sort.field]) {
                            res = sort.dir === 'asc' ? Number(a[field]) - Number(b[field]) : Number(b[field]) - Number(a[field]);
                        }
                        else {
                            res = sort.dir === 'asc' ? (a[field] && b[field] ? a[field].toString().localeCompare(b[field]) : 0) : (a[field] && b[field] ? b[field].toString().localeCompare(a[field]) : 0);
                        }
                    }
                    else {
                        res = Number(b.sum_revenue_client) - Number(a.sum_revenue_client);
                    }
                    if (res === 0) {
                        var f = _this.role === 'zones' ? 'brief_name' : 'app_name';
                        if (!a[f]) {
                            res = 1;
                        }
                        else if (!b[f]) {
                            res = -1;
                        }
                        else {
                            res = a[f].localeCompare(b[f]);
                        }
                    }
                    return res;
                });
                for (i = 0; i < sortData.length; i++) {
                    idArr.push(sortData[i].id);
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
                var allData = _this.oGridInfo.aShowData;
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

                data.sort(function (a, b) {
                    var res = 0;
                    if (_this.oRenderGrid && _this.oRenderGrid.dataSource && _this.oRenderGrid.dataSource._sort && _this.oRenderGrid.dataSource._sort[0]) {
                        var sort = _this.oRenderGrid.dataSource._sort[0];
                        var field = sort.field;
                        if (_this.dataSourceSchema.model.fields[sort.field]) {
                            res = sort.dir === 'asc' ? Number(a[field]) - Number(b[field]) : Number(b[field]) - Number(a[field]);
                        }
                        else {
                            res = sort.dir === 'asc' ? (a[field] && b[field] ? a[field].toString().localeCompare(b[field]) : 0) : (a[field] && b[field] ? b[field].toString().localeCompare(a[field]) : 0);
                        }
                    }
                    else {
                        res = Number(b.sum_revenue_client) - Number(a.sum_revenue_client);
                    }
                    if (res === 0) {
                        var f = _this.role === 'zones' ? 'brief_name' : 'app_name';
                        if (!a[f]) {
                            res = 1;
                        }
                        else if (!b[f]) {
                            res = -1;
                        }
                        else {
                            res = a[f].localeCompare(b[f]);
                        }
                    }
                    return res;
                });

                _this._renderPage();
                _this.summaryData = summaryArr;
                _this._renderSummary();
                return data;
            };

            var dataSource = new kendo.data.TreeListDataSource({
                data: aShowData,
                serverSorting: true,
                sort: {field: 'sum_revenue_client', dir: 'desc'},
                schema: schema
            });

            var gridInfo = this._genGrid();
            $('#treelist').kendoTreeList({
                dataSource: dataSource,
                columnMenu: true,
                sortable: true,
                resizable: true,
                columns: gridInfo.columns,
                columnResizeHandleWidth: 10,
                // scrollable: false,
                messages: {
                    noRows: '无数据'
                },
                expand: function (e) {
                    _this._getDetailRow(e);
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
            this.changeTab = false;
            var tabColumns = window.localStorage[this.role] ? JSON.parse(window.localStorage[this.role]) : this.columnList[this.role];
            for (var j = 0; j < tabColumns.length; j++) {
                var tmp = tabColumns[j];
                if (tmp.hidden) {
                    this.oRenderGrid.hideColumn(tmp.field);
                }
            }

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

        _getDetailRow: function (e) {
            if (e.model.parentId === null) {
                var fieldKey = this.fieldKey[this.role];
                var field = this.role === 'zones' ? fieldKey.major : fieldKey.secondary;
                var keyId = e.model[field];
                var id = e.model.id;
                var dataItem = this.oGridInfo.oRawData[keyId];
                var _this = this;

                if (!dataItem.child) {
                    e.preventDefault();
                    var param = {
                        id: keyId
                    };
                    if (this.role === 'clients') {
                        param.parentId = e.model[fieldKey.major];
                    }
                    this._getDetailData(param, function (dataList, statData) {
                        var addRow = _this._formatGridData(statData, id);
                        _this.oGridInfo.aShowData = _this._refreshParentData(id, addRow);
                        _this.oGridInfo.aShowData = _this.oGridInfo.aShowData.concat(addRow);
                        _this.oGridInfo.pagerEvent = true;
                        _this._refreshGrid();
                        _this.oRenderGrid.expand($('#treelist td [data-id="' + id + '"]').parent().parent());
                    });
                }
            }
        },

        // 二次请求，刷新父节点数据
        _refreshParentData: function (id, data) {
            var aShowData = this.oGridInfo.aShowData;
            var summary = {
                sum_views: 0,
                sum_download_requests: 0,
                sum_clicks: 0,
                sum_download_complete: 0,
                sum_revenue: 0,
                sum_payment: 0,
                sum_cpa: 0,
                sum_cpc_clicks: 0,
                sum_payment_gift: 0,
                sum_revenue_gift: 0
            };
            for (var i = 0, l = aShowData.length; i < l; i++) {
                if (aShowData[i].id === id) {
                    for (var ii = 0, ll = data.length; ii < ll; ii++) {
                        if (data[ii].parentId === id) {
                            summary = this._setSummaryData(summary, data[ii]);
                        }
                    }
                    aShowData[i] = this._setCalculatData($.extend({}, aShowData[i], summary));
                    // 没有child的时候，修改父节点的hasChildren为false
                    if (ll < 1) {
                        aShowData[i].hasChildren = false;
                    }
                    break;
                }
            }

            return aShowData;
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
                    _this._setOperation(operationList);
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
                }
                html += '<span class="btn-m" data-role="adx">Adx报表</span>';
                $('#nav-menu-wrapper').html(html);
                if (_this.role !== '') {
                    $('#nav-menu-wrapper [data-role="' + _this.role + '"][data-audit="' + _this.audit + '"]').trigger('click');
                }
                else {
                    $('#nav-menu-wrapper [data-role]').eq(0).trigger('click');
                }
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
                if (this.audit === '0') {
                    this.span = 1;
                }
                else {
                    this.span = 2;
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

        // 重置数据
        _reset: function () {
            // this.selectedItems = ['sum_clicks'];
            this.selectedMajor = [];
            this.selectedSecondary = 'all';
            this.selectedSecondaryName = '';
            this.selectedThird = 'all';
            // 图表数据
            this.oChartInfo = {
                aRawData: [],
                oRawData: {},
                aShowData: [],
                field: null,
                view: []
            };
            this.changeTab = true;
            this.oGridInfo.oRawData = {};
            this.oGridInfo.aShowData = [];
            this.oGridInfo.oSummary = {};
            this.oGridInfo.oPageInfo.currentPage = 1;
            this.oGridInfo.oPageInfo.totalPage = 1;
            this.oGridInfo.oPageInfo.totalNO = 1;
            $('#data-search').val('');

            $('#select-secondary').html('').parent().hide();
            $('#select-third').html('').parent().hide();
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
            if ($ele.attr('data-role') === 'adx') {
                window.location = './adx.html';
                return;
            }
            $ele.siblings().removeClass('cur');
            $ele.addClass('cur');
            this.role = $ele.attr('data-role');
            this.audit = $ele.attr('data-audit');
            if (!this.isFirst) {
                this._reset();
            }
            else {
                this.isFirst = false;
            }
            var operationList = this.operationList;
            $('#js-view-manual-data').hide();
            $('#js-import-data-zones').hide();

            // $('#js-view-settle-data').hide();
            // $('#js-import-data-clients').hide();
            if (this.audit === '0') {
                if (this.role === 'zones' && operationList.indexOf(OPERATION_LIST.manager_add_delivery_data) > -1) {
                    $('#js-view-manual-data').show();
                    $('#js-import-data-zones').show();
                }
                // else  if (this.role === 'clients' && operationList.indexOf(OPERATION_LIST.manager_add_client_data) > -1) {
                //     $('#js-view-settle-data').show();
                //     $('#js-import-data-clients').show();
                // }
            }
            this._renderFastSelect(this.dateRenge.from, this.dateRenge.to);
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

        fnInit: function (dayType, role, audit, id, name) {
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
            switch (role) {
                case 'zones':
                case 'clients':
                    this.role = role;
                    break;
                default:
                    break;
            }
            switch (audit) {
                case '0':
                case '1':
                    this.audit = audit;
                    break;
                default:
                    break;
            }
            if (id) {
                this.selectedSecondary = id;
                this.selectedSecondaryName = name;
            }

            $('#select-major').prop('multiple', 'multiple').multiselect({
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
                        return '请选择';
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
                // 主分类事件驱动
                // onChange: function () {
                //     _this._changeMajor($('#select-major'));
                //     _this._screenData(1);
                // }
            });

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

            $('#select-business-type').on('change', function () {
                _this._changeSelectedBusinessType($(this));
                // _this._filterDataByRevenueType();
                _this._genChart();
                // _this._showGrid();
            });

            $('#select-client-revenue-type').on('change', function () {
                _this._changeSelectedCtRt($(this));
                _this._filterDataByRevenueType();
                _this._showGrid();
            });

            $('#select-affiliate-revenue-type').on('change', function () {
                _this._changeSelectedAfRt($(this));
                _this._filterDataByRevenueType();
                _this._showGrid();
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
                _this._screenData(1);
            });

            // 次分类事件驱动
            $('#select-secondary').on('change', function () {
                _this._changeSecondary($(this));
                _this._screenData(2);
            });

            $('#select-third').on('change', function () {
                _this._changeThird($(this));
                _this._screenData(3);
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
                _this.selectedThird = 'all';
                $('#select-third').html('').parent().hide();
                _this._fastSelectDay($(this).data('day-type'));
                _this._getGeneralData();
            });

            // 搜索框事件
            $('#data-search').on('input propertychange', function () {
                _this._refreshGrid();
            });

            $('#export-report-btn').click(function () {
                var url = '';
                if (_this.role === 'zones') {
                    url += API_URL.manager_stat_zone_excel
                        + '?affiliateid=' + _this.selectedMajor.join(',')
                        + '&bannerid=' + (_this.selectedThird === 'all' ? 0 : _this.selectedThird);
                }
                else {
                    url += API_URL.manager_stat_client_excel
                        + '?productid=' + _this.selectedMajor.join(',')
                        + '&campaignid=' + (_this.selectedSecondary === 'all' ? 0 : _this.selectedSecondary)
                        + '&bannerid=' + (_this.selectedThird === 'all' ? 0 : _this.selectedThird);
                }
                window.location = url
                                + '&business_type=' + _this.selectedBusinessType
                                + '&media_revenue_type=' + (_this.selectedAfRt === 'all' ? 0 : _this.selectedAfRt)
                                + '&client_revenue_type=' + (_this.selectedCtRt === 'all' ? 0 : _this.selectedCtRt)
                                + '&period_start=' + _this.dateRenge.from
                                + '&period_end=' + _this.dateRenge.to
                                + '&zone_offset=-8&audit=' + _this.audit;
            });

            $('#export-daily-report-btn').click(function () {
                var url = '';
                var odayFrom = Date.parse(_this.dateRenge.from);
                var odayTo = Date.parse(_this.dateRenge.to);
                if (odayFrom.compareTo(odayTo.addMonths(-1)) < 0) {
                    alert('报表导出范围为一个月以内');
                    return;
                }
                if (_this.role === 'zones') {
                    url += API_URL.manager_stat_zone_daily_excel
                        + '?affiliateid=' + _this.selectedMajor.join(',')
                        + '&bannerid=' + (_this.selectedThird === 'all' ? 0 : _this.selectedThird);
                }
                else {
                    url += API_URL.manager_stat_client_daily_excel
                        + '?productid=' + _this.selectedMajor.join(',')
                        + '&campaignid=' + (_this.selectedSecondary === 'all' ? 0 : _this.selectedSecondary)
                        + '&bannerid=' + (_this.selectedThird === 'all' ? 0 : _this.selectedThird);
                }
                window.location = url
                                + '&business_type=' + _this.selectedBusinessType
                                + '&media_revenue_type=' + (_this.selectedAfRt === 'all' ? 0 : _this.selectedAfRt)
                                + '&client_revenue_type=' + (_this.selectedCtRt === 'all' ? 0 : _this.selectedCtRt)
                                + '&period_start=' + _this.dateRenge.from
                                + '&period_end=' + _this.dateRenge.to
                                + '&zone_offset=-8&audit=' + _this.audit;
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
            this._renderSelectedBusinessType();
            this._renderSelectedCtRt();
            this._renderSelectedAfRt();
            this._renderMenu();

            // 重置多选下拉框滚动条位置
            $('#select-major').parent().on('click', '.multiselect.dropdown-toggle', function () {
                setTimeout(function () {
                    $('#select-major').parent().find('.multiselect-container').scrollTop(0);
                }, 1);
            });
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
    var revenueType = Helper.fnGetHashParam('role');
    var itemNum = Helper.fnGetHashParam('audit');
    var id = Helper.fnGetHashParam('id');
    var name = Helper.fnGetHashParam('name');
    Stat.fnInit(dayType, revenueType, itemNum, id, name);
});
