/**
 * @file agency.js
 * @description admin 账号管理
 * @author hehe
 */
var agency = (function ($) {
    var Agency = function () {};
    Agency.prototype = {
        fnInit: function () {
            $.get(API_URL.admin_agency_index, function (data) {
                if (0 === data.res) {
                    $('#js-admin-acount').html($.tmpl('#tpl-admin-agency', data));
                }
            });
            $('#js-admin-acount').delegate('.switch-account', 'click', function (event) {
                var user_id = $(this).data('user');
                var role = $(this).data('role');
                var newTab = window.open('about:blank');
                var kind = $(this).data('kind');
                var link = (kind === 2 || kind === 3) ? 'housead/' + role : role;
                $.post(API_URL.account_change, {
                    id: user_id
                }, function (json) {
                    if (0 === json.res) {
                        Helper.fnRemoveCookie('user_id');
                        Helper.fnRemoveCookie('cur_url');
                        var new_url = BOS.DOCUMENT_URI + '/' + link;
                        if (json.obj.delivery_type === 2) {
                            new_url += '/stat/game.html';
                        }
                        newTab.location.href = new_url;
                    }
                });
            });
        }
    };
    return new Agency();
})(window.jQuery);
$(function () {
    agency.fnInit();
});
