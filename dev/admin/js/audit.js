/**
 * @file audit.js
 * @description 提款审核
 * @author hehe
 */

var audit = (function ($) {
    var Audit = function () {
        this._auditTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'create_time',
                title: '申请时间'
            }, {
                field: 'name',
                title: '媒体商'
            }, {
                field: 'money',
                title: '提款金额（￥）'
            }, {
                field: 'bank',
                title: '银行名称'
            }, {
                field: 'payee',
                title: '提款人'
            }, {
                field: 'bank_account',
                title: '银行账号'
            }, {
                field: 'status',
                title: '状态'
            }]
        };
    };
    Audit.prototype = {
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            var html = '';
            switch (thisCol) {
                case 'bank':
                    html = sData + '<br>' + oData.payee + '<br>' + oData.bank_account;
                    break;
                case 'status':
                    html = LANG.admin_withdrawal_status[sData];
                    break;
                default:
                    html = sData;
                    break;
            }
            $(td).html(html);
        },
        fnInit: function () {
            Helper.fnCreatTable('#js-admin-audit', this._auditTitle, API_URL.admin_withdrawal_index, this._fnCustomColumn, 'dataTable');
        }
    };
    return new Audit();
})(window.jQuery);
$(function () {
    audit.fnInit();
});
