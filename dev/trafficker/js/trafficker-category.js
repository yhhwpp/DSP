/**
 *  @file trafficker-category.js
 *  @author hehe
 */

Helper.fnCategoryTransformTree = function (obj) { // 组装成前端可以处理的格式
    var o = {
        parent: obj.parent,
        category: {}
    };
    for (var k in obj.parent) {
        o.category[k] = [];
    }
    var _c = obj.category;
    var o_c = o.category;
    for (var i = 0; i < _c.length; i++) {
        if (o_c.hasOwnProperty(_c[i].parent)) { // 二级分类
            o_c[_c[i].parent].push(_c[i]);
            continue;
        }
        // 三级分类
        innerloop:
            for (var m in o.category) {
                var _child = o.category[m];
                for (var j = 0; j < _child.length; j++) {
                    if (_child[j].category_id === _c[i].parent) {
                        if (!_child[j].child) {
                            _child[j].child = [];
                        }
                        _child[j].child.push(_c[i]);
                        break innerloop;
                    }

                }
            }

    }
    return o;
};


var traffickerCategory = (function ($) {
    var TraffickerCategory = function () {
        this.type = 0;
    };
    TraffickerCategory.prototype = {
        _fnInitListeners: function () {
            var _this = this;
            $('.table-ctl').delegates({
                // 新建分类弹出
                '.js-category-manage': function () {
                    $.get(API_URL.trafficker_campaign_category, {
                        ad_type: _this.type
                    }, function (a) {
                        if (0 === a.res) {
                            _this.categoryInfo = Helper.fnCategoryTransformTree(a.obj);
                            _this._fnCategoryModalShow();
                        }
                    });
                }
            });
            $('.js-category-modal').delegates({
                // 分类新建修改删除
                '.js-category-edit': function () {
                    var that = this;
                    var $input = $(that).parent('li').find('.form-control').eq(0);
                    var category = $input.data('id');
                    var name = $.trim($input.val());
                    var parent = $input.data('parent');
                    var action = $(that).data('action');
                    var type = $(that).data('type');

                    var sCategoryUrl = API_URL.trafficker_zone_category_store; // 新建修改

                    if (1 === action || 0 === action) {
                        if ('' === name || '' === $.trim(name)) {
                            return $input.focus(), !1;
                        }
                        _fncallback();
                    }
                    else if (2 === action) {
                        sCategoryUrl = API_URL.trafficker_zone_category_delete; // 删除
                        if (type === 'child') {
                            var subli = $(that).parent('li').find('.sub-category').find('li').filter(function (index, el) {
                                return !$(el).attr('class');
                            });
                            if (subli.length) {
                                Helper.fnConfirm('该分类下面有子分类，确认删除吗', _fncallback);
                            }
                            else {
                                $input.data('name') ? _fncallback() : $(that).parent('.new-add').remove();
                            }
                        }
                        else if (type === 'grandchild') {
                            if (!$input.data('name')) {
                                return $(that).parent('.new-add').remove(), !1;
                            }
                            _fncallback();
                        }
                    }

                    function _fncallback() {
                        var param = {
                            category: category,
                            action: action,
                            name: name,
                            parent: parent,
                            ad_type: _this.type
                        };
                        $.post(sCategoryUrl, param, function (response) {
                            if (0 === response.res) {
                                if (2 === action) {
                                    $(that).parent('li').remove();
                                }
                                else {
                                    $(that).parent('.new-add').removeClass('new-add');
                                    var oAttr = {
                                        'data-name': name,
                                        'data-parent': parent
                                    };
                                    var _category = category || response.obj.category;
                                    // 0 === action && (oAttr['data-id'] = response.obj.category), $input.attr(oAttr).val(name), $(that).attr('data-action', 1) ;
                                    if (0 === action) {
                                        oAttr['data-id'] = _category;
                                        $input.attr(oAttr).val(name);
                                        $(that).attr('data-action', 1);
                                    }
                                    if (type === 'child' && (!$(that).parent('li').find('.sub-category').length)) {
                                        var sSubhtml = '<div class="sub-category" style="padding:5px 0"> <ol data-parent="' + _category + '"> </ol> <button class="btn btn-default js-category-sub-add btn-sm" type="button" style="margin-left:40px;">+ 添加子分类</button> </div>';
                                        $(that).parent('li').append(sSubhtml);
                                    }
                                    dataTable.reload();
                                }
                            }
                            Helper.fnPrompt(response.msg);
                        });
                    }

                },
                '.js-category-add': function () { // 一级增加
                    var $oi = $(this).prev('.form-inline').find('ol.categoryall');
                    _this._fnAppendCategoryList($oi, 'child');
                },
                '.js-category-sub-add': function () { // 二级增加
                    var $oi = $(this).prev('ol');
                    _this._fnAppendCategoryList($oi, 'grandchild');
                },
                '.open-sub-category': function () { // 二级分类展开收回
                    var $sub = $(this).next('.sub-category');
                    if ($(this).text() === '展开子分类') {
                        $(this).text('收起子分类');
                    }
                    else {
                        $(this).text('展开子分类');
                    }
                    if ($sub.is(':hidden')) {
                        $sub.show();
                    }
                    else {
                        $sub.hide();
                    }
                }
            });
        },
        _fnAppendCategoryList: function ($oi, type) {
            if ($oi.find('.new-add').length) {
                return false;
            }
            var parent = $oi.data('parent');
            var li = '<li class="new-add">';
            li += '<div class="form-group"><input type="text" class="form-control" data-parent="' + parent + '"></div>';
            li += ' <button class="btn btn-default js-category-edit" data-action="0" data-type=' + type + '>保存</button>';
            li += ' <button class="btn btn-default js-category-edit" data-action="2" data-type=' + type + '>删除</button>';
            li += '</li>';
            $oi.append(li);
        },
        _fnCategoryModalShow: function () {
            // 分类管理
            $('#app .form-inline').html($.tmpl('#tpl-category-list', this));
            $('#game .form-inline').html('');
            $('.game-category').appendTo('#game .form-inline');
            $('.js-category-modal').modal('show');
        },
        _fnInitPage: function () {
            this._fnInitListeners();
        },
        fnInit: function () {
            this._fnInitPage();
        }
    };
    return new TraffickerCategory();
}(window.jQuery));
$(function () {
    traffickerCategory.fnInit();
});
