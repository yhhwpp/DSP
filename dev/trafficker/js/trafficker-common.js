/**
 *  @file trafficker-common.js
 *  @author xiaokl
 */
var TraffickerCommon = TraffickerCommon || {};
TraffickerCommon = {
    _fnInitCategoryHandle: function (obj, objParam) {
        obj.delegate('select[name=category]', 'change', function () {
            if ($(this).val() == null || $(this).val() === '') {
                $('input[name=category-input]').val('');
                $('.js-category-div').attr('data-parent', $(this).attr('data-parent'));
                $('.js-category-div').show();
            }
            else {
                $('.js-category-div').hide();
            }
        });

        obj.delegate('#js-confirm-category', 'click', function () {
            var sCategory = $('input[name=category-input]').val();
            if (sCategory == null || sCategory === '' || $.trim(sCategory) === '') {
                $('input[name=category-input]').focus();
                return;
            }
            var params = $.extend({
                action: 0,
                name: sCategory,
                parent: $('.js-category-div').attr('data-parent')
            }, objParam);
            $.post(API_URL.trafficker_zone_category_store, params, function (json) {
                if (json && json.res === 0 && json.obj) {
                    var option = '<option value="' + json.obj.category + '">' + json.obj.name + '</option>';
                    obj.find('select[name=category][data-parent=' + $('.js-category-div').attr('data-parent') + ']').append(option);
                    obj.find('select[name=category][data-parent=' + $('.js-category-div').attr('data-parent') + ']').val(json.obj.category);
                    $('.js-category-div').hide();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            });
        });

        obj.delegate('#js-cancel-category', 'click', function () {
            $('.js-category-div').hide();
            obj.find('select[name=category]').val(-1);
        });
    },
    _fnCheckcategory: function (obj) {
        $.fn.validation.addMethod('checkcategory', function (value) {
            var oParent = obj.find('input[name=parent]:checked');
            if (oParent && parseInt(oParent.val(), 10) > 0) {
                var category = obj.find('select[name=category][data-parent=' + oParent.val() + ']');
                if (category === 'undefined' || category.val() == null || category.val() === '' || parseInt(category.val(), 10) <= 0) {
                    return true;
                }
            }
            return false;
        }, '请选择分类');
    }
};
