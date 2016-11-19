/**
 * @file common.js
 * @author hehe
 */
$(function () {
    var BosPossword = {
        fnInit: function () {
            $.fn.validation.addMethod('fnEqpassword', function (value) {
                if ($(this).val() !== $('.password').val()) {
                    return true;
                }
                return false;
            }, '两次输入的密码不一致');
            $('.user-possword').validation({
                blur: true
            });
            this.fnInitListeners();
        },
        fnInitListeners: function () {
            $(document.body).delegates({
                '.user-possword-sbt': function () {
                    if (!($('.user-possword').valid())) {
                        return false;
                    }
                    $('.user-possword fieldset').prop('disabled', true);
                    Helper.load_ajax();
                    $.ajax({
                        type: 'post',
                        url: API_URL.password,
                        data: {
                            password_old: $('.js-password-old').val(),
                            password: $('.password').val(),
                            password_confirmation: $('.js-password-confirmation').val()
                        },
                        success: function (data) {
                            Helper.close_ajax();
                            // Helper.fnPrompt(data.msg);
                            // $('.user-possword fieldset').hide();
                            $('.text-danger').text(data.msg);
                            if (data.res) {
                                $('.user-possword fieldset').removeAttr('disabled');
                            }
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
    BosPossword.fnInit();
});
