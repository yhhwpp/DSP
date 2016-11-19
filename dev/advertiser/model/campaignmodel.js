/**
 * @file campaignmodel.js
 * @description 推广计划对象
 * @author xiaokl
 */
(function ($) {
    'use strict';

    $.fn.campaignmodel = {};

    var CampaignModel = function (data) {
        this.data = $.extend({}, CampaignModel.defaults, data || {});
    };

    $.fn.basemodelutils.inherit(CampaignModel, $.fn.basemodel.abstractmodel);

    $.extend(CampaignModel.prototype, {
        setAdsCampaign: function (formObj) {
            var inputObj;
            for (var key in CampaignModel.adType) {
                inputObj = formObj.find('[data-name=' + key + ']');
                if (inputObj && inputObj.length > 0) {
                    if (key === 'revenue_type') {
                        this.setData(key, formObj.find('[data-name=' + key + ']:checked').val());
                    }
                    else {
                        this.setData(key, inputObj.val());
                    }
                }
                inputObj = null;
            }
        }
    });

    CampaignModel.defaults = {
        id: null, // 推广计划id
        products_id: null, // 产品id
        products_type: 0, // 推广类型
        products_name: '', // 应用名称
        products_show_name: '', // 应用显示名称
        products_icon: '', // 应用图标
        platform: '', // 目标平台(string,[])
        action: CONSTANT.action_save_draft, // 操作
        status: CONSTANT.status_draft, // 默认草稿状态
        ad_type: 0, // 广告类型
        revenue_type: CONSTANT.revenue_type_cpd, // 计费类型
        revenue: '', // 出价
        day_limit: '', // 日限额
        appinfos_app_name: '', // 广告名称
        appinfos_description: '', // 应用介绍
        appinfos_profile: '', // 一句话简介
        appinfos_update_des: '', // 更新说明
        appinfos_images: [], // 应用截图
        keywords: null, // 加价关键字
        star: '', // 星级
        link_name: '', // 链接名称
        link_url: '', // 链接地址
        link_title: '', // 链接标题
        package_file: '', // 安装包
        total_limit: '', // 总预算
        application_id: '', // 应用ID
        video: '' // 视频素材
    };

    CampaignModel.adType = {
        products_icon: '', // 应用图标
        revenue_type: null, // 计费类型
        revenue: '', // 出价
        day_limit: '', // 日限额
        appinfos_app_name: '', // 广告名称
        appinfos_description: '', // 应用介绍
        appinfos_profile: '', // 一句话简介
        appinfos_update_des: '', // 更新说明
        star: 0, // 星级
        link_name: '', // 链接名称
        link_url: '', // 链接地址
        link_title: '', // 链接标题
        package_file: null, // 安装包
        video: null // 视频
    };

    $.extend($.fn.campaignmodel, {
        Model: CampaignModel
    });

}(window.jQuery));
