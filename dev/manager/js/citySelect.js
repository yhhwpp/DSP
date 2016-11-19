/**
 * @file citySelect.js
 * @author hehe
 */
(function ($) {
    $.fn.extend({
        cityslect: function (options) {
            var fnIsSelectArea = function (id) {
                var $_p = id.find('.province-label input');
                var _l = $_p.length;
                var _n = 0;
                for (var i = 0; i < $_p.length; i++) {
                    if (!$_p[i].checked) {
                        id.find('.region-select-box-area input').prop('checked', !1);
                    }
                    else {
                        _n++;
                    }
                    if (_n === _l) {
                        id.find('.region-select-box-area input').prop('checked', !0);
                        $_p.prop('indeterminate', false);
                    }
                }
            };

            var fnIsSelectCity = function (id) {
                var $_c = id.find('.postclass');
                var _l = $_c.length;
                var _n = 0;
                var $_p = id.prev('.province-label').find('input');
                $_p.prop('indeterminate', false);
                for (var i = 0; i < $_c.length; i++) {
                    if (!$_c[i].checked) {
                        $_p.prop('checked', !1);
                    }
                    else {
                        _n++;
                    }
                    if (_n === _l) {
                        $_p.prop('checked', !0);
                    }
                }
                if (_n === _l) {
                    $_p.prop('checked', !0);
                    $_p.prop('indeterminate', false);
                }
                else if (_n > 0) {
                    $_p.prop('indeterminate', true);
                }
            };

            // 省份选择
            $('.province-label input').on('change', function () {
                fnIsSelectArea($(this).parents('.region-select-box'));
                var _check = $(this)[0].checked;
                $(this).parents('.region-province-haved').find('.region-locator input').prop('checked', _check);
            });

            //  省份选择市区
            $('.region-province-haved').hover(function () {
                $(this).addClass('item-active');
            }, function () {
                $(this).removeClass('item-active');
            });

            // 区域选择
            $('.region-select-box-area input').on('change', function () {
                if ($(this)[0].checked) {
                    $('input[data-group=' + $(this).val() + ']').prop({
                        checked: true,
                        indeterminate: false
                    });
                }
                else {
                    $('input[data-group=' + $(this).val() + ']').prop('checked', $(this)[0].checked);
                }
            });

            // 市区选择
            $('.region-locator input').on('click', function () {
                fnIsSelectCity($(this).parents('.region-locator'));
                fnIsSelectArea($(this).parents('.region-select-box'));
            });

            // 区域选择
            $('.region-group input').on('change', function () {
                if ($(this).val() === '1') {
                    $('#region-select span').text('部分地区');
                    $('.region-select-data').show();
                }
                else {
                    $('#region-select span').text('全部地区');
                    $('.region-select-data').hide();
                }
            });

            // select 地区选择
            $('#region-select').on('click', function () {
                $('.region-select-layer').slideToggle('fast');
            });

            $('#region-select-confirm').on('click', function () {
                var select_city = '';
                if ($('input[name=region-group]:checked').val() === '1') {
                    var $slected = $('.region-select-content').find('.postclass:checked');
                    $.each($slected, function (index, el) {
                        select_city += $slected[index].getAttribute('data-name') + ',';
                    });
                    select_city = select_city.substring(0, select_city.length - 1);
                    $('#region-select span').text(select_city);
                }
                $('.region-select-layer').hide();

            });

            $('#region-select-cancel').on('click', function () {
                $('.region-select-layer').hide();
            });
        }
    });
})(jQuery);
