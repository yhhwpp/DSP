/**
 * @file system-set.js
 * @author hehe
 * @description 系统设置
 */
var systemSet = (function ($) {
    var SystemSet = function () {};
    SystemSet.prototype = {
        _fnSortOrder: function (obj1, obj2) {
            return obj1.sort_order !== obj2.sort_order ? obj1.sort_order - obj2.sort_order : obj1.id - obj2.id;
        },
        _fnCreatArray: function (obj) {
            obj.data = [];
            obj.data[0] = {
                id: obj.id,
                type: obj.type,
                code: obj.code,
                value: obj.value,
                sort_order: obj.sort_order,
                label: obj.label,
                store_range: obj.store_range
            };
        },
        _fnBindFun: function () {
            $('#system-set').tab('show');
            $('#system-set').delegates({
                '.nav-tabs li': function () {
                    $('.tab-pane').hide();
                    $('.tab-pane').eq($(this).index()).show();
                },
                '.system-update': function () {
                    var _data = {};
                    var $form = $('.tab-pane:visible form');
                    if (!($form.valid())) {
                        return false;
                    }
                    if ($form.find('.form-group[data-code="alipayConfig"]').length) {
                        _data.alipayConfig = $form.serializeJson();
                    }
                    else if ($form.find('.form-group[data-code="ad_spec"]').length) {
                        _data.ad_spec = {};
                        var $spec = $form.find('.spec');
                        $spec.each(function (index, el) {
                            var k = $(el).data('adtype');
                            _data.ad_spec[k] = {};
                            var $list = $(el).find('.spec-list');
                            $list.each(function (i, v) {
                                var j = $(v).data('type');
                                var $input = $(v).find('input[type="text"]');
                                _data.ad_spec[k][j] = $.trim($input[0].value) + '*' + $.trim($input[1].value);
                            });
                        });
                    }
                    else {
                        _data = $form.serializeJson();
                    }
                    $.ajax({
                            url: API_URL.manager_setting_store,
                            type: 'POST',
                            data: {
                                data: JSON.stringify(_data)
                            }
                        })
                        .done(function (response) {
                            Helper.fnPrompt(response.msg);
                        })
                        .fail(function () {
                            Helper.fnPrompt('服务器请求失败，请稍后重试！');
                        });
                },
                '.add': function () {
                    var $container = $(this).prev('.spec-container');
                    var $spec = $(this).parents('.spec');
                    var $list = $container.find('.spec-list');
                    var list_max = $.makeArray($list).reduce(function (pre, cur, index, a) {
                        return Math.max(pre, $(cur).data('type'));
                    }, -1);
                    var dir_json = $(this).parents('.store-dir').data('dir') || {};
                    var dir_max = 0;
                    if (!$.isEmptyObject(dir_json)) {
                        var dir_arry = [];
                        for (var k in dir_json) {
                            dir_arry.push(k);
                        }
                        dir_max = Math.max.apply(null, dir_arry);
                    }
                    var _type = Math.max(list_max, dir_max) + 1;
                    var $lastspec = $container.find('.spec-list:last').find('input[type="text"]');
                    if ($container.find('.spec-list').length) {
                        if ($.trim($lastspec[0].value) === '' || $.trim($lastspec[1].value) === '') {
                            return false;
                        }
                    }
                    var add_html = '<div class="row form-group spec-list" data-type=' + _type + '><div class="col-sm-4"><input type="text" class="form-control"/></div><div class="col-sm-4"><input type="text" class="form-control" /></div><div class="col-sm-1 delete">×</div></div>';
                    $container.append(add_html);
                    if ($spec.data('adtype') === CONSTANT.ad_type_feeds && $container.find('.spec-list').length > 0) {
                        $(this).remove();
                    }
                },
                '.delete': function () {
                    var $specontainer = $(this).parents('.spec-container');
                    var $spec = $(this).parents('.spec');
                    $(this).parents('.spec-list').remove();
                    if ($spec.data('adtype') === CONSTANT.ad_type_feeds && $specontainer.find('.spec-list').length === 0) {
                        $specontainer.parent('.col-sm-9').append('<button class="btn btn-primary add" type="button">增加</button>');
                    }
                }
            });
        },
        fnGetData: function () {
            var _this = this;
            $.ajax({
                    url: API_URL.manager_setting_index,
                    type: 'POST'
                })
                .done(function (response) {
                    if (0 === response.res) {
                        var title_json = response.obj.filter(function (index) {
                            return index.type === 'group';
                        });
                        title_json.sort(_this._fnSortOrder);
                        var content_json = response.obj.filter(function (index) {
                            return index.type !== 'group';
                        });
                        var new_con_json = [];
                        for (var i = 0; i < content_json.length; i++) {
                            if (!new_con_json.length) {
                                _this._fnCreatArray(content_json[i]);
                                new_con_json.push(content_json[i]);
                                continue;
                            }
                            for (var j = 0; j < new_con_json.length; j++) {
                                var value = new_con_json[j];
                                if (content_json[i].parent_id === value.parent_id) {
                                    value.data.push(content_json[i]);
                                    break;
                                }
                                else if (j === new_con_json.length - 1) {
                                    _this._fnCreatArray(content_json[i]);
                                    new_con_json.push(content_json[i]);
                                    break;
                                }
                            }
                        }
                        new_con_json.sort(function (obj1, obj2) {
                            return obj1.parent_id - obj2.parent_id;
                        });
                        new_con_json.forEach(function (value, index) {
                            value.data.sort(_this._fnSortOrder);
                        });
                        $('.nav-tabs').html($.tmpl('#tpl-tabs-li', title_json));
                        $('.tab-content').html($.tmpl('#tpl-tabs-con', new_con_json));
                        $('.form-horizontal').validation({
                            blur: false
                        });
                        _this._fnBindFun();
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                })
                .fail(function () {
                    Helper.fnPrompt('服务器请求失败，请稍后重试！');
                });
        },
        fnInit: function () {
            this.fnGetData();
        }
    };
    return new SystemSet();
})(window.jQuery);
$(function () {
    systemSet.fnInit();
});
