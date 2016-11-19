/**
 * @file audit-index.js
 * @author xiaokl
 * @description 媒体商数据审计
 */
var auditIndex = (function ($) {
    var AuditIndex = function () {
    };
    AuditIndex.prototype = {
        fnInit: function () {
            new $.fn.commonindex.Obj({
                indexUrl: API_URL.manager_audit_trafficker_index,
                updateUrl: API_URL.manager_audit_trafficker_update,
                importUrl: API_URL.manager_audit_trafficker_import,
                exportUrl: API_URL.manager_audit_trafficker_export,
                extendsions: 'csv'
            }).fnInit();
        }
    };
    return new AuditIndex();
})(window.jQuery);
$(function () {
    auditIndex.fnInit();
});
