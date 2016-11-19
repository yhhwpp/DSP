/**
 * @file operation-index.js
 * @author xiaokl
 * @description 运营明细
 */
var operationIndex = (function ($) {
    var OperationIndex = function () {
    };
    OperationIndex.prototype = {
        fnInit: function () {
            new $.fn.commonindex.Obj({
                indexUrl: API_URL.manager_balance_trafficker_index,
                updateUrl: API_URL.manager_balance_trafficker_update,
                importUrl: API_URL.manager_balance_trafficker_import,
                exportUrl: API_URL.manager_balance_trafficker_export,
                extendsions: 'csv'
            }).fnInit();
        }
    };
    return new OperationIndex();
})(window.jQuery);
$(function () {
    operationIndex.fnInit();
});
