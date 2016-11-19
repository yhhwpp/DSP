/**
 * @file common.js
 * @author hehe, songxing
 */
$(function () {
    var BosProfile = {
        fnInit: function () {
            $('.user-profile').validation({
                blur: true
            });
            // 获取用户资料
            $.get(API_URL.profile_view, function (data) {
                if (!data.res && data.obj) {
                    $('.js-contact-name').val(data.obj.contact_name);
                    $('.js-email-address').val(data.obj.email_address);
                    $('.js-contact-phone').val(data.obj.contact_phone);
                    $('.js-qq').val(data.obj.qq);
                }
            }, 'json');
            this.fnInitListeners();
        },
        fnInitListeners: function () {
            $(document.body).delegates({
                '.user-profile-sbt': function () {
                    if (!($('.user-profile').valid())) {
                        return false;
                    }
                    Helper.load_ajax();
                    $.ajax({
                        type: 'post',
                        url: API_URL.profile,
                        data: {
                            contact_name: $('.js-contact-name').val(),
                            email_address: $('.js-email-address').val(),
                            contact_phone: $('.js-contact-phone').val(),
                            qq: $('.js-qq').val()
                        },
                        success: function (data) {
                            Helper.close_ajax();
                            $('.text-danger').text(data.msg);
                            // var accountType = Helper.fnGetCookie('account_type');
                            // if (accountType) {
                            //     var forwardUrl = '';
                            //     if (accountType === 'MANAGER') {
                            //         forwardUrl = BOS.MGMT_URI + '/main';
                            //     }
                            //     else if (accountType === 'ADVERTISER') {
                            //         forwardUrl = BOS.DOCUMENT_URI + '/advertiser/';
                            //     }
                            //     else if (accountType === 'BROKER') {
                            //         forwardUrl = BOS.DOCUMENT_URI + '/broker/';
                            //     }
                            //     else if (accountType === 'TRAFFICKER') {
                            //         forwardUrl = BOS.DOCUMENT_URI + '/trafficker/';
                            //     }
                            //     if (forwardUrl) {
                            //         location.href = forwardUrl;
                            //     }
                            // }
                            // location.href = BOS.DOCUMENT_URI + '/advertiser/';
                        },
                        error: function () {
                            Helper.close_ajax();
                            $('.text-danger').text('请求失败，请稍后重试');
                            Helper.fnPrompt('请求失败，请稍后重试');
                        }
                    });
                }
            });
        }
    };
    BosProfile.fnInit();
});
