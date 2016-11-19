/**
 * @file campaign_edit.js
 * @author xiaokl
 */
var CampaignModify = (function ($) {
    var CampaignModify = function () {
        this.products = [];
    };

    CampaignModify.prototype = {
        // 获取推广目标平台
        _fnGetPlatform: function () {
            // var self = this;
            // $.get(API_URL.campaign_platform, function (json) {
            //     if (json && json.res === 0) {
            //         self._fnInitPage($.extend(json, {
            //             platform: json.obj
            //         }));
            //         self = null;
            //     }

            // }, 'json');
            this._fnInitPage({platform: LANG.platform});
        },
        // 初始化页面
        _fnInitPage: function (data) {
            var self = this;
            var campaignid = Helper.fnGetQueryParam('cid');
            var oCampaign = new $.fn.campaignmodel.Model();

            data = $.extend({}, data, {
                campaignInfo: $.extend({}, oCampaign.data, {
                    disabled: ''
                })
            });

            if (campaignid && campaignid > 0) {
                $('#campaignid').val(campaignid);
                // 获取推广计划数据
                var params = {
                    id: campaignid
                };
                data = $.extend({}, data, {
                    campaignid: campaignid
                });
                $.post(API_URL.campaign_view, params, function (json) {
                    if (json && json.res === 0) {
                        $('#js-status').val(json.obj.status);
                        oCampaign = new $.fn.campaignmodel.Model(json.obj);
                        if (json.obj.status === CONSTANT.status_draft || json.obj.status === CONSTANT.status_rejected) {
                            data = $.extend({}, data, {
                                campaignInfo: $.extend({}, oCampaign.data, {
                                    disabled: 'disabled',
                                    hidden: false
                                })
                            });
                        }
                        else {
                            data = $.extend({}, data, {
                                campaignInfo: $.extend({}, oCampaign.data, {
                                    disabled: 'disabled',
                                    hidden: true
                                })
                            });
                        }
                    }

                    self._fnInitTemplate(data);
                    self._fnInitMaterial(data);
                    self = null;
                }, 'json');
            }
            else {
                this._fnInitTemplate(data);
                this._fnInitMaterial(data);
            }
        },
        _fnGetRevenueType: function (productsType) {
            $.get(API_URL.advertiser_campaign_revenue_type, function (revenueJson) {
                if (revenueJson && revenueJson.res === 0 && revenueJson.obj.revenue_type && revenueJson.obj.revenue_type.length > 0) {
                    if ($.inArray(CONSTANT.revenue_type_cpa, revenueJson.obj.revenue_type) > -1
                        || $.inArray(CONSTANT.revenue_type_cpt, revenueJson.obj.revenue_type) > -1
                        || $.inArray(CONSTANT.revenue_type_cpm, revenueJson.obj.revenue_type) > -1
                        || $.inArray(CONSTANT.revenue_type_cps, revenueJson.obj.revenue_type) > -1) {
                        if (productsType === CONSTANT.products_type_package) {
                            $('.js-adtype-other-label').show();
                            if ($.inArray(CONSTANT.revenue_type_cpt, revenueJson.obj.revenue_type) === -1) {
                                $('.js-revenue-type-cpt').remove();
                            }
                        }
                        if ($.inArray(CONSTANT.revenue_type_cpa, revenueJson.obj.revenue_type) === -1) {
                            $('.js-revenue-type-cpa').remove();
                        }
                        if ($.inArray(CONSTANT.revenue_type_cpm, revenueJson.obj.revenue_type) === -1) {
                            $('.js-revenue-type-cpm').remove();
                        }
                        if ($.inArray(CONSTANT.revenue_type_cps, revenueJson.obj.revenue_type) === -1) {
                            $('.js-revenue-type-cps').remove();
                        }
                    }
                    else {
                        $('.js-revenue-type-cpa').remove();
                        $('.js-revenue-type-cpm').remove();
                        $('.js-revenue-type-cps').remove();
                        if (productsType === CONSTANT.products_type_package) {
                            $('.js-revenue-type-cpt').remove();
                        }
                    }
                }
            });
        },
        /*
         * 初始化模版
         */
        _fnInitTemplate: function (data) {
            $('.step1-cont').html((doT.template($('#tpl-step1').text()))(data));

            $('#js-PackageForm').html((doT.template($('#tpl-step1-package').text()))(data)); // 加载安装包下载表单
            $('#js-LinkForm').html((doT.template($('#tpl-step1-link').text()))(data)); // 加载推广链接表单
            this._fnInitProductsTypeTpl(data); // 初始化产品列表
            if (data.campaignid && data.campaignid > 0) {
                if ((+data.campaignInfo.products_type) === 0) {
                    $('.js-body-form').html((doT.template($('#tpl-step2').text()))(data)); // 加载第二步表单内容
                    this._fnInitPackageFormTpl(data);
                }
                else {
                    $('.js-body-form').html((doT.template($('#tpl-step2-link').text()))(data)); // 加载第二步表单内容
                    this._fnInitLinkFromTpl(data);
                }
                this._fnGetRevenueType(+data.campaignInfo.products_type);
                if (data.campaignInfo.revenue_type === CONSTANT.revenue_type_cps) {
                    $('.js-MoneyLimit').hide();
                    $('.js-keyword-div').hide();
                }
            }
            else {
                $('.js-body-form').html((doT.template($('#tpl-step2').text()))(data) + (doT.template($('#tpl-step2-link').text()))($.extend({}, data, {
                        campaignInfo: $.extend({}, data.campaignInfo, {
                            ad_type: CONSTANT.ad_type_banner
                        })
                    }))); // 加载第二步表单内容
                this._fnInitPackageFormTpl(data);
                this._fnInitLinkFromTpl($.extend({}, data, {
                    campaignInfo: $.extend({}, data.campaignInfo, {
                        ad_type: CONSTANT.ad_type_banner
                    })
                }));
                this._fnGetRevenueType(CONSTANT.products_type_package);
            }
            $('.js-body-btn').html((doT.template($('#tpl-btn').text()))(data)); // 加载按钮
        },
        _fnInitProductsTypeTpl: function (data) { // 初始化产品类型模板
            if (data.campaignid && data.campaignid > 0) {
                if (data.campaignInfo.products_type === CONSTANT.products_type_package) {
                    // 请求安装包下载产品列表
                    this._fnInitProductsPackageTpl(data);
                }
                else {
                    // 请求推广链接产品列表
                    this._fnInitProductsLinkTpl(data);
                }
            }
            else {
                this._fnInitProductsPackageTpl(data);
                this._fnInitProductsLinkTpl(data);
            }
        },
        _fnInitPostProduct: function (options, callback) { // 初始化请求产品列表
            $.ajax($.extend({
                url: API_URL.campaign_product_list,
                dataType: 'json',
                type: 'POST',
                success: function (result) {
                    typeof callback === 'function' && callback.call(this, result);
                }
            }, options));
        },
        _fnInitProductsPackageTpl: function (data) { // 初始化请求安装包下载产品列表
            this._fnInitPostProduct({
                data: {
                    products_type: CONSTANT.products_type_package
                }
            }, function (json) {
                if (json && json.res === 0) {
                    data = $.extend({}, data, {
                        appProductsList: json
                    });
                    $('.js-dropDownMenuApp').append((doT.template($('#tpl-appproducts').text()))(data));
                }

            });
        },
        _fnInitProductsLinkTpl: function (data) { // 初始化请求链接推广产品列表
            this._fnInitPostProduct({
                data: {
                    products_type: CONSTANT.products_type_link
                }
            }, function (json) {
                if (json && json.res === 0) {
                    data = $.extend({}, data, {
                        linkProductList: json
                    });
                    $('.js-linkProducts').append((doT.template($('#tpl-linkproducts').text()))(data));
                }

            });
        },
        _fnCreatePackageStepTpl: function (objPackageData) {
            $('.js-PackageStep2 .js-Adtype_app .js-body').html((doT.template($('#tpl-app').text(), undefined, {tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objPackageData, {ad_type: CONSTANT.ad_type_app_market})));
            $('.js-PackageStep2 .js-Adtype_banner .js-form-purepic .js-body').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-materials').text(), preview: $('#tpl-banner-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objPackageData, {ad_type: CONSTANT.ad_type_banner})));
            $('.js-PackageStep2 .js-Adtype_banner .js-form-textlink .js-body').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-banner-textlink').text(), preview: $('#tpl-banner-textlink-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objPackageData, {ad_type: CONSTANT.ad_type_banner_textlink})));
            $('.js-PackageStep2 .js-Adtype_feeds .js-body').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-feeds').text(), preview: $('#tpl-feeds-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objPackageData, {ad_type: CONSTANT.ad_type_feeds})));
            $('.js-PackageStep2 .js-adtype-screen .js-screenhalf').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-materials').text(), preview: $('#tpl-banner-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objPackageData, {ad_type: CONSTANT.ad_type_screen_half})));
            $('.js-PackageStep2 .js-adtype-screen .js-screenfull').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-materials').text(), preview: $('#tpl-banner-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objPackageData, {ad_type: CONSTANT.ad_type_screen_full})));
            $('.js-PackageStep2 .js-adtype-other .js-body').html((doT.template($('#tpl-other').text(), undefined, {tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objPackageData, {ad_type: CONSTANT.ad_type_other})));
            $('.js-PackageStep2 .js-adtype-video .js-body').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-video').text(), preview: $('#tpl-video-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objPackageData, {revenue_type_val: [CONSTANT.revenue_type_cpa, CONSTANT.revenue_type_cpm, CONSTANT.revenue_type_cps]}, {ad_type: CONSTANT.ad_type_video})));
        },
        _fnInitPackageFormTpl: function (data) { // 初始化安装包下载表单
            var self = this;
            var objPackageData = $.extend({}, data, {
                revenue_type: {
                    value: CONSTANT.revenue_type_cpd,
                    label: 'CPD(按下载次数计费)'
                },
                products_type: CONSTANT.products_type_package,
                revenue_type_val: CONSTANT.revenue_type_array
            });
            self._fnCreatePackageStepTpl(objPackageData);
        },
        _fnInitLinkFromTpl: function (data) { // 初始化链接表单
            var objLinkData = $.extend({}, data, {
                revenue_type: {
                    value: CONSTANT.revenue_type_cpc,
                    label: 'CPC(按点击计费)'
                },
                products_type: CONSTANT.products_type_link,
                revenue_type_val: [CONSTANT.revenue_type_cpa, CONSTANT.revenue_type_cpm, CONSTANT.revenue_type_cps]
            });
            if (!data.campaignInfo.id) {
                objLinkData = $.extend({}, objLinkData, {campaignInfo: $.extend({}, objLinkData.campaignInfo, {revenue_type: CONSTANT.revenue_type_cpc})});
            }
            $('.js-linkStep2 .js-Adtype_banner .js-form-purepic .js-body').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-materials').text(), preview: $('#tpl-banner-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objLinkData, {ad_type: CONSTANT.ad_type_banner})));
            $('.js-linkStep2 .js-Adtype_banner .js-form-textlink .js-body').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-banner-textlink').text(), preview: $('#tpl-banner-textlink-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objLinkData, {ad_type: CONSTANT.ad_type_banner_textlink})));
            $('.js-linkStep2 .js-Adtype_feeds .js-body').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-feeds-link').text(), preview: $('#tpl-feeds-link-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objLinkData, {ad_type: CONSTANT.ad_type_feeds})));
            $('.js-linkStep2 .js-adtype-screen .js-screenhalf').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-materials').text(), preview: $('#tpl-banner-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objLinkData, {ad_type: CONSTANT.ad_type_screen_half})));
            $('.js-linkStep2 .js-adtype-screen .js-screenfull').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-materials').text(), preview: $('#tpl-banner-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objLinkData, {ad_type: CONSTANT.ad_type_screen_full})));
            $('.js-linkStep2 .js-adtype-appstore .js-body').html(doT.template($('#tpl-appstore').text())($.extend({}, objLinkData, {ad_type: CONSTANT.ad_type_app_store})));
            $('.js-linkStep2 .js-adtype-video .js-body').html((doT.template($('#tpl-banner').text(), undefined, {materials: $('#tpl-video').text(), preview: $('#tpl-video-preview').text(), tpl_revenue_type: $('#tpl-revenue-type').text()}))($.extend({}, objLinkData, {ad_type: CONSTANT.ad_type_feeds})));
        },
        // 获取Banner广告尺寸
        _fnInitMaterial: function (data) {
            var self = this;
            $.get(API_URL.campaign_banner_demand, function (json) {
                if (json.res === 0 && json.obj) {
                    data = $.extend({}, data, {
                        bannerDemand: json.obj
                    });
                    var evalText = doT.template($('#tpl-materiallist').text());
                    if (json.obj[CONSTANT.ad_type_banner]) {
                        var iBLen = 0;
                        $.each(json.obj[CONSTANT.ad_type_banner], function () {
                            iBLen++;
                        });
                        var iWidthB = 82 * iBLen - iBLen;
                        $('.js-Adtype_banner .js-BannerMaterial').find('ul').html(evalText($.extend({}, data, {demand: json.obj[CONSTANT.ad_type_banner]})));
                        $('.js-Adtype_banner .js-BannerMaterial').width(iWidthB);
                    }
                    if (json.obj[CONSTANT.ad_type_screen_half]) {
                        var iWidthH = 82 * json.obj[CONSTANT.ad_type_screen_half].length - json.obj[CONSTANT.ad_type_screen_half].length;
                        $('.js-adtype-screen .js-screenhalf .js-BannerMaterial').find('ul').html(evalText($.extend({}, data, {demand: json.obj[CONSTANT.ad_type_screen_half]})));
                        $('.js-adtype-screen .js-screenhalf .js-BannerMaterial').width(iWidthH);
                    }

                    if (json.obj[CONSTANT.ad_type_screen_full]) {
                        var iWidthF = 82 * json.obj[CONSTANT.ad_type_screen_full].length - json.obj[CONSTANT.ad_type_screen_full].length;
                        $('.js-adtype-screen .js-screenfull .js-BannerMaterial').find('ul').html(evalText($.extend({}, data, {
                            demand: json.obj[CONSTANT.ad_type_screen_full]
                        })));

                        $('.js-adtype-screen .js-screenfull .js-BannerMaterial').width(iWidthF);
                    }

                    if (data && data.campaignInfo && (data.campaignInfo.ad_type === CONSTANT.ad_type_banner || data.campaignInfo.ad_type === CONSTANT.ad_type_screen_half || data.campaignInfo.ad_type === CONSTANT.ad_type_screen_full)) {
                        self._fnGetBannerAryToJson(data.campaignInfo.appinfos_images);
                    }
                    if (json.obj[CONSTANT.ad_type_app_market]) {
                        $('.js-Adtype_app .js-ShortAppIcon').html(doT.template($('#tpl-app-materials').text())($.extend({}, data, {demand: json.obj[CONSTANT.ad_type_app_market], adType: CONSTANT.ad_type_app_market})));
                    }
                    if (json.obj[CONSTANT.ad_type_app_store]) {
                        $('.js-adtype-appstore .js-shortappstoreicon').html(doT.template($('#tpl-app-materials').text())($.extend({}, data, {demand: json.obj[CONSTANT.ad_type_app_store], adType: CONSTANT.ad_type_app_store})));
                    }
                    if (json.obj[CONSTANT.ad_type_feeds]) {
                        $('.js-Adtype_feeds .js-feedsLinkIcon').html(doT.template($('#tpl-feeds-materiallist').text())($.extend({}, data, {demand: json.obj[CONSTANT.ad_type_feeds], products_type: CONSTANT.products_type_link})));
                        $('.js-Adtype_feeds .js-feedsIcon').html(doT.template($('#tpl-feeds-materiallist').text())($.extend({}, data, {demand: json.obj[CONSTANT.ad_type_feeds], products_type: CONSTANT.products_type_package})));
                    }
                }
                self._fnInitMoneyLimit(data);
                self = null;
            }, 'json').fail(function () {
                Helper.fnPrompt(MSG.server_error);
                self = null;
            });
        },
        // 获取banner图片json格式
        _fnGetBannerAryToJson: function (images) {
            // jsBannerMaterial
            if (images && typeof images === 'object' && images.length > 0) {
                for (var i = 0; i < images.length; i++) {
                    $('.js-BannerMaterial li[data-key =' + images[i].ad_spec + ']').addClass('has').attr({
                        'data-url': images[i].url
                    });
                }
            }

        },
        // 获取出价
        _fnInitMoneyLimit: function (data, callback) {
            var self = this;
            $.get(API_URL.campaign_money_limit, function (json) {
                var evalText = doT.template($('#tpl-moneylimit').text());
                var keyLimit = doT.template($('#tpl-keylimit').text());

                if (json.res === 0 && json.list) {
                    data = $.extend({}, data, {
                        money_limit: json.list
                    });

                    $('.js-PackageStep2 .js-KeyPriceInput').attr('min', json.list[CONSTANT.revenue_type_cpd].key_min);
                    $('.js-PackageStep2 .js-KeyPriceInput').attr('max', json.list[CONSTANT.revenue_type_cpd].key_max);

                    $('.js-linkStep2 .js-KeyPriceInput').attr('min', json.list[CONSTANT.revenue_type_cpc].key_min);
                    $('.js-linkStep2 .js-KeyPriceInput').attr('max', json.list[CONSTANT.revenue_type_cpc].key_max);
                }

                if (data.money_limit) {
                    var revenueTypePack = CONSTANT.revenue_type_cpd;
                    var revenueTypeLink = CONSTANT.revenue_type_cpc;
                    if (data.campaignInfo.id != null) {
                        if (data.campaignInfo.products_type === CONSTANT.products_type_package) {
                            revenueTypePack = data.campaignInfo.revenue_type;
                        }
                        else {
                            revenueTypeLink = data.campaignInfo.revenue_type;
                        }
                    }
                    if (+revenueTypePack === CONSTANT.revenue_type_cps) {
                        revenueTypePack = CONSTANT.revenue_type_cpd;
                    }
                    if (+revenueTypeLink === CONSTANT.revenue_type_cps) {
                        revenueTypeLink = CONSTANT.revenue_type_cpc;
                    }
                    var packStep = CONSTANT.revenue_type_conf[revenueTypePack].decimal;
                    var linkStep = CONSTANT.revenue_type_conf[revenueTypeLink].decimal;
                    $('.js-PackageStep2 .js-MoneyLimit').html(evalText($.extend({}, data, {
                        moneyLimit: data.money_limit[revenueTypePack],
                        step: packStep
                    })));
                    $('.js-PackageStep2 .js-KeyLimit').html(keyLimit($.extend({}, data, {
                        moneyLimit: data.money_limit[CONSTANT.revenue_type_cpd],
                        step: packStep
                    })));

                    $('.js-linkStep2 .js-MoneyLimit').html(evalText($.extend({}, data, {
                        moneyLimit: data.money_limit[revenueTypeLink],
                        step: linkStep
                    })));
                    $('.js-linkStep2 .js-KeyLimit').html(keyLimit($.extend({}, data, {
                        moneyLimit: data.money_limit[CONSTANT.revenue_type_cpc],
                        step: linkStep
                    })));
                }
                else {
                    $('.js-PackageStep2 .js-MoneyLimit').html(evalText(data));
                    $('.js-PackageStep2 .js-KeyLimit').html(keyLimit(data));

                    $('.js-linkStep2 .js-MoneyLimit').html(evalText(data));
                    $('.js-linkStep2 .js-KeyLimit').html(keyLimit(data));
                }

                self._fnInitHandle(data);
                self = null;
            }, 'json').fail(function () {
                self = null;
                Helper.fnPrompt(MSG.server_error);
            });
        },
        _fnGetExtension: function (platform) {
            if ($.inArray((+platform), CONSTANT.platform_android) > -1) {
                return 'apk';
            }
            else if ($.inArray((+platform), CONSTANT.platform_ios) > -1) {
                return 'ipa';
            }
            return 'apk,ipa';
        },
        _fnInitHandle: function (campaignData) {
            // 修改推广产品列表显示
            var self = this;

            $('[data-toggle="tooltip"]').tooltip();
            // 初始化表单验证
            $.fn.validation.addMethod('checkAppIconNum', function (value) {
                var objParent = $(this).parents('.js-show-appimg');
                if (objParent.find('img').length < 3) {
                    return true;
                }
                return false;
            }, '请上传至少3张720*1280的应用截图');
            $.fn.validation.addMethod('checkAppStoreNum', function (value) {
                if ($('.js-show-appstoreicon img').length < 3) {
                    return true;
                }
                return false;
            }, '请上传至少3张640*1136');

            $.fn.validation.addMethod('checkMaterialNum', function (value) {
                if (value && parseInt(value, 10) > 0) {
                    return false;
                }
                return true;
            }, MSG.upload_creative_material);

            $.fn.validation.addMethod('checkFeedsIcon', function (value) {
                if ($(this).prev('.feeds-material').find('img').attr('src').length <= 0) {
                    return true;
                }
                return false;
            }, MSG.upload_img_material);
            $.fn.validation.addMethod('checkTotallimit', function (value) {
                var objParent = $(this).parents('.form-total-limit');
                var totalLimitMin = parseInt($(this).attr('data-min'), 10);
                var totalLimitMax = parseInt($(this).attr('data-max'), 10);
                if (objParent.find('input[name=total_limit_check]:checked').length === 0) {
                    var iVal = objParent.find('input[name=total_limit]').val();
                    if (iVal === null || iVal === '' || isNaN(parseInt(iVal, 10)) || parseInt(iVal, 10) < totalLimitMin || parseInt(iVal, 10) > totalLimitMax) {
                        return true;
                    }
                }
                return false;
            }, '总预算大于200');
            $.fn.validation.addMethod('checkAppid', function (value) {
                if ($('#js-application-id').val() !== $('.js-adtype-appstore input[name=check-appid]').val()) {
                    return true;
                }
                return false;
            }, '请输入正确的应用ID');
            $('.step-cont').delegate('#js-application-id', 'change', function () {
                $('.js-adtype-appstore input[name=check-appid]').val($(this).val());
                if ($(this).val() != null && $(this).val() !== '') {
                    $.get(API_URL.advertiser_campaign_app_store_view, {id: $(this).val()}, function (json) {
                        if (json && json.res === 0 && json.obj) {
                            $('.js-adtype-appstore input[name=products_show_name]').val(json.obj.trackName);
                            $('.js-adtype-appstore input[name=check-appid]').val(json.obj.trackId);
                            $('#js-application-id').trigger('blur');
                        }
                        else {
                            $('.js-adtype-appstore input[name=check-appid]').val('');
                            $('#js-application-id').trigger('blur');
                            Helper.fnPrompt(json.msg);
                        }
                    }).fail(function () {
                        $('.js-adtype-appstore input[name=check-appid]').val('');
                        $('#js-application-id').trigger('blur');
                    });
                }
            });

            $('#js-PackageForm').validation();
            $('#js-LinkForm').validation();
            $('.js-Adtype_app').validation();
            $('.js-form-purepic').validation(); // banner纯图片form
            $('.js-form-textlink').validation(); // banner文字链form
            $('.js-Adtype_feeds').validation();
            $('.js-form-screenhalf').validation(); // 半屏form
            $('.js-form-screenfull').validation(); // 全屏form
            $('.js-adtype-appstore').validation(); // AppStoreform
            $('.js-adtype-other').validation(); // other form
            $('.js-adtype-video').validation(); // 视频广告
            // 下一步
            var editType = Helper.fnGetQueryParam('editType');
            $('.step-cont').delegate('#nextStep', 'click', function () {
                var thisStep = $(this);
                var productsType = $('input[name="products_type"]:checked').val();
                var exitsname = ''; // 产品名称
                var productId = 0;
                var nPlatform = 0;
                if ((+productsType) === 0) {
                    exitsname = $('input[name="products_name"').val();
                    productId = $('#js-PackageForm').find('li.cur').attr('data-id');
                    productId = productId ? productId : null;
                    if (!$('#js-PackageForm').valid()) {
                        return false;
                    }
                    nPlatform = $('#js-PackageForm select[name=platform]').val();
                // 显示安装包下载页面
                }
                else {
                    exitsname = $('input[name="link_name"').val();
                    productId = $('#js-LinkForm select[name="products_menu"]').val();
                    productId = (+productId) === -1 ? null : productId;
                    if (!$('#js-LinkForm').valid()) {
                        return false;
                    }
                    $('#js-LinkForm input[name="link_platform"]:checked').each(function () {
                        nPlatform += parseInt($(this).val(), 10);
                    });
                    // 显示链接推广页面
                    if (nPlatform === 7) { // ios时，显示AppStore
                        $('.js-adtype71-label').show();
                    }
                    else {
                        $('.js-adtype71-label').hide();
                    }
                }
                $('#js-extension').val(self._fnGetExtension(nPlatform));
                Helper.load_ajax();
                $.post(API_URL.advertiser_campaign_product_exist, {name: exitsname, id: productId}, function (json) { // 新建产品时，判断产品是否存在
                    Helper.close_ajax();
                    if (json && json.res === 0 && json.obj) {
                        if (json.obj.count === 0) {
                            $('.step-li').removeClass('cur');
                            $('.step2').addClass('cur');
                            $('.step2-cont').show();
                            thisStep.parents('.step-cont').hide();
                            if (editType) {
                                $('input[name=' + editType + ']').focus();
                            }
                        }
                        else {
                            if ((+productsType) === 0) {
                                Helper.fnPrompt('已存在相同应用名称，请修改应用名称');
                                $('input[name="products_name"').focus();
                            }
                            else {
                                Helper.fnPrompt('已存在相同链接名称，请修改链接名称');
                                $('input[name="link_name"').focus();
                            }
                        }
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                    thisStep = null;
                }).fail(function () {
                    Helper.close_ajax();
                    Helper.fnPrompt(MSG.server_error);
                });
                var campaignid = Helper.fnGetQueryParam('cid');
                if (!(campaignid && campaignid > 0)) {
                    // 修改广告名称显示
                    if ($('.js-PackageStep2')) {
                        var sProductName = $('input[name="products_name"').val();
                        $('.js-PackageStep2 .js-Adtype_app input[name="appinfos_app_name"]').val(sProductName + '-应用市场');
                        $('.js-PackageStep2 .js-form-purepic input[name="appinfos_app_name"]').val(sProductName + '-纯图片');
                        $('.js-PackageStep2 .js-form-textlink input[name="appinfos_app_name"]').val(sProductName + '-文字链');
                        $('.js-PackageStep2 .js-Adtype_feeds input[name="appinfos_app_name"]').val(sProductName + '-Feeds');
                        $('.js-PackageStep2 .js-screenhalf input[name="appinfos_app_name"]').val(sProductName + '-半屏插屏');
                        $('.js-PackageStep2 .js-screenfull input[name="appinfos_app_name"]').val(sProductName + '-全屏插屏');
                        $('.js-PackageStep2 .js-adtype-other input[name="appinfos_app_name"]').val(sProductName + '-其他');
                        $('.js-PackageStep2 .js-adtype-video input[name="appinfos_app_name"]').val(sProductName + '-视频');
                    }

                    if ($('.js-linkStep2')) {
                        var sLinkName = $('input[name="link_name"').val();
                        $('.js-linkStep2 .js-form-purepic input[name="appinfos_app_name"]').val(sLinkName + '-纯图片');
                        $('.js-linkStep2 .js-form-textlink input[name="appinfos_app_name"]').val(sLinkName + '-文字链');
                        $('.js-linkStep2 .js-Adtype_feeds input[name="appinfos_app_name"]').val(sLinkName + '-Feeds');
                        $('.js-linkStep2 .js-screenhalf input[name="appinfos_app_name"]').val(sLinkName + '-半屏插屏');
                        $('.js-linkStep2 .js-screenfull input[name="appinfos_app_name"]').val(sLinkName + '-全屏插屏');
                        $('.js-linkStep2 .js-adtype-appstore input[name="appinfos_app_name"]').val(sLinkName + '-AppStore');
                        $('.js-linkStep2 .js-adtype-video input[name="appinfos_app_name"]').val(sLinkName + '-视频');
                    }
                }

                $($('.js-PackageStep2 .js-Adtype_banner .js-BannerMaterial li')[0]).trigger('click');
                $($('.js-linkStep2 .js-Adtype_banner .js-BannerMaterial li')[0]).trigger('click');
                $($('.js-PackageStep2 .js-screenhalf .js-BannerMaterial li')[0]).trigger('click');
                $($('.js-linkStep2 .js-screenhalf .js-BannerMaterial li')[0]).trigger('click');
                $($('.js-PackageStep2 .js-screenfull .js-BannerMaterial li')[0]).trigger('click');
                $($('.js-linkStep2 .js-screenfull .js-BannerMaterial li')[0]).trigger('click');
            });
            if (editType) {
                $('#nextStep').trigger('click');
            }

            //  浏览大图
            $('.fancybox').fancybox();

            // 上一步
            $('.step-cont').delegate('.js-PreviousBtn', 'click', function () {
                $('.step-li').removeClass('cur');
                $('.step1').addClass('cur');
                $('.step2-cont').hide();
                $('.step1-cont').show();
            });

            // 保存表单
            $('.step-cont').delegate('.confirm', 'click', function () {
                self._fnCreateCampaigns(this);
            });

            // 安装包下载、链接推广显示(封装显示表单)
            $.fn.initDom();

            // 修改推广产品显示
            $('.step-cont').delegate('.js-dropDownMenuApp li', 'click', function () {
                $('#js-ProductsMenu').attr('data-select', 1);
                var innerSelf = $(this);
                var sOriginShowName = innerSelf.parents('form').find('.js-ShowName').text();

                innerSelf.siblings('.js-dropDownMenuApp li').removeClass('cur');
                innerSelf.attr('class', 'cur');
                var nDataIndex = $(this).attr('data-index');
                if (nDataIndex && nDataIndex >= 0) { // 修改目标平台、应用名称、应用显示名称、应用图标
                    // var product = self.products[nDataIndex];
                    innerSelf.parents('form').find('.js-ShowName').text(innerSelf.attr('data-name'));
                    $('input[name="products_menu"]').val(innerSelf.attr('data-name')).trigger('blur');
                    innerSelf.parents('form').find('#js-ProductsMenu').attr('data-id', innerSelf.attr('data-id'));
                    self._fnModifyProducts(innerSelf);
                }
                else {
                    if (sOriginShowName !== '请选择产品') {
                        self._fnResetProducts(this);
                    }
                    innerSelf.parents('form').find('.js-ShowName').text($(this).find('a').text());
                    $('input[name="products_menu"]').val($(this).find('a').text()).trigger('blur');
                }
            });

            var cur = $('.js-dropDownMenuApp').find('li.cur');
            if (cur) {
                // cur.trigger('click');
                $('#js-ProductsMenu').attr('data-select', 1);
                cur.parents('form').find('.js-ShowName').text(cur.attr('data-name'));
                cur.parents('form').find('#js-ProductsMenu').attr('data-id', cur.attr('data-id'));
            }

            // 选择星级
            $('.step-cont').delegate('.star-level li', 'click', function (e) {
                var num = $(this).index();
                $('input[name="rate"').val(num + 1);
                var list = $(this).parent().find('i');
                var showlist = $('.feeds-star').find('i');
                for (var i = 0; i <= num; i++) {
                    list.eq(i).attr('class', 'fa fa-star');
                    showlist.eq(i).attr('class', 'fa fa-star');
                }
                for (var j = num + 1, len = list.length - 1; j <= len; j++) {
                    list.eq(j).attr('class', 'fa fa-star-o');
                    showlist.eq(j).attr('class', 'fa fa-star-o');
                }
            });
            $('.step-cont').delegate('input[name=total_limit]', 'blur', function () {
                $(this).parents('.form-total-limit').find('input[name=total_limit_valid]').trigger('blur');
            });
            // 总预算选择不限时, disabled总预算输入
            $('.step-cont').delegate('input[name=total_limit_check]', 'click', function () {
                if ($(this).is(':checked')) {
                    $(this).parents('.form-total-limit').find('input[name=total_limit]').attr('disabled', true).trigger('blur');
                }
                else {
                    $(this).parents('.form-total-limit').find('input[name=total_limit]').attr('disabled', false).trigger('blur');
                }
            });

            // 关键字初始化
            this._fnInitKeyHandle();

            // 初始化七牛图片上传和删除
            this._fnInitUploadAndDel();

            // 安装包上传
            this._fnUploadFile();
            // 视频上传
            this._fnUploadVideo();

            var materailModifyDefauls = function (obj, element) {
                obj.find('.js-BannerMaterial li').removeClass('cur');
                $(element).addClass('cur');

                obj.find('.js-uploadmaterialtext').text($(element).text());
                obj.find('.js-UploadMaterial').text(MSG.upload_img);
                // 修改预览图片
                if ($(element).hasClass('has')) {
                    obj.find('.js-UploadMaterial').text(MSG.modify_img);
                    obj.find('.js-BannerMaterial img').attr('src', $(element).attr('data-url')).show();
                    obj.find('.js-BannerMaterial a').attr('href', $(element).attr('data-url'));
                    obj.find('.js-BannerPreview img').show();
                }
                else {
                    obj.find('.js-BannerMaterial img').hide();
                    obj.find('.js-BannerPreview img').hide();
                }
                obj.find('.js-BannerPreview img').attr('src', $(element).attr('data-url'));
            };

            // 点击Banner素材
            $('.step-cont').delegate('.js-PackageStep2 .js-Adtype_banner .js-BannerMaterial li', 'click', function () {
                materailModifyDefauls($('.js-PackageStep2 .js-Adtype_banner'), this);
            });

            $('.step-cont').delegate('.js-linkStep2 .js-Adtype_banner .js-BannerMaterial li', 'click', function () {
                materailModifyDefauls($('.js-linkStep2 .js-Adtype_banner'), this);
            });

            // 点击安装包半屏素材
            $('.step-cont').delegate('.js-PackageStep2 .js-screenhalf .js-BannerMaterial li', 'click', function () {
                materailModifyDefauls($('.js-PackageStep2 .js-screenhalf'), this);
            });

            // 点击安装包全屏素材
            $('.step-cont').delegate('.js-PackageStep2 .js-screenfull .js-BannerMaterial li', 'click', function () {
                materailModifyDefauls($('.js-PackageStep2 .js-screenfull'), this);
            });

            // 点击链接半屏素材
            $('.step-cont').delegate('.js-linkStep2 .js-screenhalf .js-BannerMaterial li', 'click', function () {
                materailModifyDefauls($('.js-linkStep2 .js-screenhalf'), this);
            });

            // 点击链接全屏素材
            $('.step-cont').delegate('.js-linkStep2 .js-screenfull .js-BannerMaterial li', 'click', function () {
                materailModifyDefauls($('.js-linkStep2 .js-screenfull'), this);
            });

            this._fnInitProductChange();

            $('#js-LinkForm').delegate('.js-linkHref', 'click', function () {
                if ($(this).attr('href') == null || $(this).attr('href') === '' || $(this).attr('href').length === 0) {
                    Helper.fnPrompt('请输入链接URL');
                    return false;
                }
            });
            $('.step-cont').delegate('input[data-name=revenue_type]', 'click', function () {
                var revenueType = parseInt($(this).val(), 10);
                var formObj = $(this).parents('form');
                if (revenueType === CONSTANT.revenue_type_cps) {
                    formObj.find('input[data-name=revenue]').attr('check-type', '');
                    formObj.find('input[data-name=day_limit]').attr('check-type', '');
                    formObj.find('input[name=total_limit_valid]').attr('check-type', '');
                    formObj.find('.js-MoneyLimit').hide();
                    formObj.find('.js-keyword-div').hide();
                    return;
                }
                formObj.find('.js-MoneyLimit').show();
                formObj.find('.js-keyword-div').show();
                var revenueMin = campaignData.money_limit[revenueType].revenue_min;
                var revenueMax = campaignData.money_limit[revenueType].revenue_max;
                var dayLimitMin = campaignData.money_limit[revenueType].day_limit_min;
                var dayLimitMax = campaignData.money_limit[revenueType].day_limit_max;
                var totalLimitMin = campaignData.money_limit[revenueType].total_limit_min;
                var totalLimitMax = campaignData.money_limit[revenueType].total_limit_max;
                var step = CONSTANT.revenue_type_conf[revenueType].decimal;
                formObj.find('input[data-name=revenue]').attr({
                    'check-type': 'required number',
                    'placeholder': '请输入大于等于' + revenueMin + '，小于等于' + revenueMax + '的数字',
                    'regex': '^\\d+(\.\\d{1,' + step + '})?$',
                    'regex-message': '出价保留' + step + '小数点',
                    'range': revenueMin + '~' + revenueMax,
                    'range-message': '出价必须大于等于' + revenueMin + '小于等于' + revenueMax
                });
                formObj.find('.js-RevenueTips').attr('data-original-title', '对每次下载的出价，最低' + revenueMin + '元，最高' + revenueMax + '元。系统会优先推广优质、出价高的应用。如：出价4.0元，则应用每下载一次需花费4.0元。');
                formObj.find('input[data-name=day_limit]').attr({
                    'check-type': 'required number',
                    'placeholder': '请输入大于等于' + dayLimitMin + '，小于等于' + dayLimitMax + '的整数',
                    'range': dayLimitMin + '~' + dayLimitMax,
                    'range-message': '日预算必须大于等于' + dayLimitMin + '小于等于' + dayLimitMax
                });
                formObj.find('.js-DayLimitTips').attr('data-original-title', '限制每天的花费，最低' + dayLimitMin + '元，最高' + dayLimitMax + '元，请填写整数。每天的实际花费超过本预算限制后，系统会自动停止推广，第二天如果推广任务还在有效期内则继续推广。');
                formObj.find('input[name=total_limit_valid]').attr({
                    'check-type': 'required checkTotallimit',
                    'data-max': dayLimitMax,
                    'data-min': dayLimitMin,
                    'checktotallimit-message': '总预算必须大于等于' + totalLimitMin + '小于等于' + totalLimitMax
                });
            });
        },
        _fnResetLinkProducts: function () { // 重置链接产品
            $('#js-LinkForm input[name="link_name"]').val('').attr('disabled', false);
            $('#js-LinkForm input[name="link_url"]').val('').attr('disabled', false).trigger('change');
            $('#js-LinkForm input[name="link_platform"]').removeAttr('checked').removeAttr('disabled');
            // if ($('#js-application-id') && $('#js-application-id').length > 0) {
            //     $('#js-application-id').val('').attr('disabled', false);
            //     $('input[name=check-appid]').val('');
            // }
        },
        _fnModifyLinkProducts: function (element) { // 修改链接产品
            var opt = element.find('option:selected');
            $('#js-LinkForm input[name="link_name"]').val(opt.attr('data-name')).attr('disabled', true);
            $('#js-LinkForm input[name="link_url"]').val(opt.attr('data-url')).attr('disabled', true).trigger('change');
            $('#js-LinkForm input[name="link_platform"]').attr('disabled', true);
            $('#js-LinkForm input[name="link_platform"]').prop('checked', false);
            if ((+opt.attr('data-platform')) === 15) {
                $('#js-LinkForm input[name="link_platform"]').prop('checked', true);
            }
            else {
                if ((+opt.attr('data-platform')) === 3) {
                    $('#js-LinkForm input[name="link_platform"][value="7"]').prop('checked', true);
                }
                else {
                    $('#js-LinkForm input[name="link_platform"][value="' + opt.attr('data-platform') + '"]').prop('checked', true);
                }
            }
        },
        _fnInitProductChange: function () { // 初始化产品列表更新操作
            var self = this;
            $('#js-LinkForm').delegate('.js-linkProducts', 'change', function () {
                if ($(this).val() === '-1') {
                    self._fnResetLinkProducts();
                }
                else {
                    self._fnModifyLinkProducts($(this));
                }
            });

        },
        _fnInitKeyHandle: function () {
            // 删除关键字
            $('.step-cont').delegate('.js-DelKey', 'click', function () {
                $(this).parents('tr').remove();
                if ($('.js-KeyBody .js-KeyTr').length === 0) {
                    $('.js-KeyBody').append('<tr><td colspan="4" class="js-NoKey">无加价关键字，请点“新增”按钮添加</td></tr>');
                }

            });
            // 添加关键字
            $('.step-cont').delegate('.js-AddKey', 'click', function () {
                $('.js-AddKeyInput').show();
            });
            // 关闭添加关键字
            $('.step-cont').delegate('.js-AddCancel', 'click', function () {
                $('.js-AddKeyInput').hide();
            });
            // 关键字控制
            $('.step-cont').delegate('.js-KeyPriceInput', 'change', function () {
                var min = $(this).attr('min');
                var max = $(this).attr('max');
                if ($(this).val() === '') {
                    $(this).val(min);
                }
                if (parseFloat($(this).val()) < parseFloat(min)) {
                    $(this).val(min);
                }
                if (parseFloat($(this).val()) > parseFloat(max)) {
                    $(this).val(max);
                }
                $(this).val(parseFloat($(this).val()).toFixed(1));
            });
            $('.step-cont').delegate('.price_up input[type=number]', 'change', function () {
                var min = $(this).attr('min');
                var max = $(this).attr('max');
                if ($(this).val() === '') {
                    $(this).val(min);
                }
                if (parseFloat($(this).val()) < parseFloat(min)) {
                    $(this).val(min);
                }
                if (parseFloat($(this).val()) > parseFloat(max)) {
                    $(this).val(max);
                }
                $(this).val(parseFloat($(this).val()).toFixed(1));
            });
            // 确定添加关键字
            $('.step-cont').delegate('.js-AddConfirm', 'click', function () {
                var $container = $(this).attr('data-type') === 'appstore' ? $('#appstore-keywords') : $('#package-keywords');
                var $input = $container.find('.js-KeyWordInput');
                var $price = $container.find('.js-KeyPriceInput');
                var sKeyWordInput = $.trim($input.val());
                // 判断关键字
                if (sKeyWordInput === '') {
                    Helper.fnPrompt('请输入关键字');
                    return;
                }

                if ($container.find('.js-KeyBody tr[data-keyword="' + sKeyWordInput + '"]').length > 0) {
                    Helper.fnPrompt('不能重复添加');
                    return;
                }

                var sKeyPriceInput = $price.val();
                if (sKeyPriceInput === '') {
                    Helper.fnPrompt('请输入加价');
                    return;
                }
                var minKey = $container.find('.js-KeyTable').attr('data-minKey');
                var maxKey = $container.find('.js-KeyTable').attr('data-maxKey');

                if ($container.find('tbody.js-KeyBody .js-NoKey').length > 0) {
                    $container.find('tbody.js-KeyBody .js-NoKey').remove();
                }

                var sKeyHtml = '<tr class="js-KeyTr" data-keyword="' + sKeyWordInput + '"><td class="keyword">' + sKeyWordInput + '</td>' + '<td class="price_up">￥<input type="number" value="' + sKeyPriceInput + '" style="width:60px;" step="0.1" min="' + minKey + '" max="' + maxKey + '"/>' + '</td><td class="status">-</td><td class="js-DelKey" style="cursor:pointer;">删除</td></tr>';
                $container.find('tbody.js-KeyBody').append(sKeyHtml);
                // 重置表单数据
                $input.val('');
                $price.val(0.5);
            });

        },
        _fnInitUploadAndDel: function () {
            var _this = this;
            // 七牛上传应用图片
            this._fnQiniuUpload({
                browse_button: 'js-UploadCampaign',
                init: {
                    FileUploaded: function (up, file, info) {
                        Helper.close_ajax();
                        $('#js-UploadCampaign').prop('disabled', false).html(MSG.upload);
                        var res = JSON.parse(info);
                        var imgURL = API_URL.qiniu_domain + '/' + res.key;
                        $.get(imgURL + '?imageInfo', function (ret) {
                            // 素材上传尺寸限定
                            if (ret.width === 512 && ret.height === 512) {
                                $('#js-ProductsIcon').val(imgURL).trigger('change');
                                $('.js-CampaignIcon').html('<img src="' + imgURL + '" width="40" height="40"><i class="fa fa-times-circle"></i>');
                                $('#js-UploadCampaign').text(MSG.modify_img);
                            }
                            else {
                                Helper.fnPrompt(MSG.upload_spec_size_material);
                                up.removeFile(file);
                            }
                        }, 'json');

                    }
                }
            });

            // 点击删除图片
            $('.step-cont').delegate('.js-CampaignIcon i', 'click', function () {
                $('.js-CampaignIcon').empty();
                $('#js-UploadCampaign').text(MSG.upload);
                $('#js-ProductsIcon').val('').trigger('change');
            });
            $('.js-Adtype_app .js-ShortAppIcon .js-show-appimg,.js-adtype-appstore .js-shortappstoreicon .js-show-appimg').each(function () {
                var _iconObj = $(this);
                var iconKey = _iconObj.attr('data-key');
                var adspec = _iconObj.attr('data-adspec');
                var adspecAry = adspec.split('*');
                var buttonObj = _iconObj.find('[data-mark="button"]');
                _this._fnQiniuUpload({
                    browse_button: buttonObj.attr('id'),
                    multi_selection: true,
                    init: {
                        BeforeUpload: function (up, file) {
                            var type = file.type;
                            buttonObj.prop('disabled', false).html('+<br/>' + adspec);
                            if (type.indexOf('image') !== -1) {
                                var imgType = type.slice(6);
                                if (imgType !== 'png' && imgType !== 'gif' && imgType !== 'jpg' && imgType !== 'jpeg') {
                                    Helper.fnPrompt(MSG.upload_not_in_conformity);
                                    up.removeFile(file);
                                }
                            }
                            else {
                                Helper.fnPrompt(MSG.upload_not_in_conformity);
                                up.removeFile(file);
                            }
                        },
                        FilesAdded: function (up, files) {
                            var imgNum = _iconObj.find('img').length;
                            plupload.each(files, function (file) {
                                // 文件添加进队列后,处理相关的事情
                                // 限制只能上传5张图片
                                imgNum += 1;
                                if (imgNum > 5) {
                                    up.removeFile(file);
                                }
                            });
                            if (imgNum > 5) {
                                Helper.fnPrompt(MSG.upload_up_to_five);
                            }
                        },
                        FileUploaded: function (up, file, info) {
                            Helper.close_ajax();
                            buttonObj.prop('disabled', false).html('+<br/>' + adspec);
                            var res = JSON.parse(info);
                            var imgURL = API_URL.qiniu_domain + '/' + res.key;
                            $.get(imgURL + '?imageInfo', function (ret) {
                                // 素材上传尺寸限定
                                if ((ret.width === parseInt(adspecAry[0], 10) && ret.height === parseInt(adspecAry[1], 10))) {
                                    _iconObj.find('.show-appimg').append('<span class="js-ImgSpan"><img src="' + imgURL + '" data-key="' + iconKey + '" /><i class="fa fa-times-circle"></i></span>');
                                    buttonObj.nextAll('.moxie-shim').eq(0).css({left: 0, width: 0, height: 0, top: 0});
                                    // 更新预览视图
                                    var imgNum = _iconObj.find('img').length;
                                    if (+_iconObj.attr('data-adType') === CONSTANT.ad_type_app_market) {
                                        if (imgNum === 1) {
                                            $('.js-ShowShortAppIcon').prepend('<img src="' + imgURL + '" />');
                                        }
                                        else {
                                            $('.js-ShowShortAppIcon').children().eq(imgNum - 2).after('<img src="' + imgURL + '" />');
                                        }
                                    }
                                    if (imgNum >= 5) {
                                        buttonObj.hide();
                                    }
                                    else {
                                        buttonObj.show();
                                    }
                                }
                                else {
                                    Helper.fnPrompt(MSG.upload_spec_size_material);
                                    up.removeFile(file);
                                }
                            }, 'json');

                        }
                    }
                });
            });
            // 删除应用截图
            $('.step-cont').delegate('.js-Adtype_app .js-ShortAppIcon .js-ImgSpan i', 'click', function () {
                var self = $(this);
                var _imgObj = self.prev('img');
                var _key = _imgObj.attr('data-key');
                var _index = self.parent('span.js-ImgSpan').index();
                $('.js-Adtype_app .js-ShortAppIcon .js-show-appimg').each(function () {
                    if (_key === $(this).attr('data-key')) {
                        return false;
                    }
                    _index += $(this).find('img').length;
                });
                self.parent('span.js-ImgSpan').remove();
                var _showImgObj = self.parents('.show-appimg');
                if (_showImgObj && _showImgObj.find('img').length < 5) {
                    $('.js-Adtype_app .js-ShortAppIcon [data-mark=button][data-key=' + _key + ']').show();
                }
                $('.js-ShowShortAppIcon img').eq(_index).remove();
            });

            var materailDefauls = function (obj, up, file, info) {
                Helper.close_ajax();
                obj.find('.js-UploadMaterial').prop('disabled', false).html(MSG.upload_img);
                var res = JSON.parse(info);
                var imgURL = API_URL.qiniu_domain + '/' + res.key;
                $.get(imgURL + '?imageInfo', function (ret) {
                    // 素材上传尺寸限定
                    var size = {
                        width: ret.width,
                        height: ret.height
                    };
                    var wantSize =  obj.find('.js-BannerMaterial li.cur').text().split('*');
                    // 素材上传尺寸限定
                    if (size.width === (+wantSize[0]) && size.height === (+wantSize[1])) {

                        obj.find('.js-BannerPreview img').attr('src', imgURL).show();
                        obj.find('.js-BannerMaterial .img_view img').attr('src', imgURL).show();
                        obj.find('.js-BannerMaterial .img_view a').attr('href', imgURL);
                        obj.find('.js-UploadMaterial').text(MSG.modify_img);
                        obj.find('.js-BannerMaterial .cur').addClass('has').attr({
                            'data-url': imgURL
                        });
                        obj.find('input[name=material_num]').val(1);
                    }
                    else {
                        Helper.fnPrompt(MSG.upload_spec_size_material);
                        up.removeFile(file);
                    }
                }, 'json');
            };

            // Banner素材上传
            this._fnQiniuUpload({
                browse_button: 'js-UploadMaterial_' + CONSTANT.revenue_type_cpd + '_' + CONSTANT.ad_type_banner,
                init: {
                    FileUploaded: function (up, file, info) {
                        materailDefauls($('.js-PackageStep2 .js-Adtype_banner'), up, file, info);
                    },
                    Error: function (up, err, errTip) {
                        $('.js-PackageStep2 .js-Adtype_banner .js-UploadMaterial').prop('disabled', false).html(MSG.upload_img);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);

                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    }
                }
            });

            // Banner Link素材上传
            this._fnQiniuUpload({
                browse_button: 'js-UploadMaterial_' + CONSTANT.revenue_type_cpc + '_' + CONSTANT.ad_type_banner,
                init: {
                    FileUploaded: function (up, file, info) {
                        materailDefauls($('.js-linkStep2 .js-Adtype_banner'), up, file, info);
                    },
                    Error: function (up, err, errTip) {
                        $('.js-linkStep2 .js-Adtype_banner .js-UploadMaterial').prop('disabled', false).html(MSG.upload_img);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);
                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    }
                }
            });

            // 半屏 package素材上传
            this._fnQiniuUpload({
                browse_button: 'js-UploadMaterial_' + CONSTANT.revenue_type_cpd + '_' + CONSTANT.ad_type_screen_half,
                init: {
                    FileUploaded: function (up, file, info) {
                        materailDefauls($('.js-PackageStep2 .js-screenhalf'), up, file, info);
                    },
                    Error: function (up, err, errTip) {
                        $('.js-PackageStep2 .js-screenhalf .js-UploadMaterial').prop('disabled', false).html(MSG.upload_img);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);
                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    }
                }
            });

            // 半屏 link素材上传
            this._fnQiniuUpload({
                browse_button: 'js-UploadMaterial_' + CONSTANT.revenue_type_cpc + '_' + CONSTANT.ad_type_screen_half,
                init: {
                    FileUploaded: function (up, file, info) {
                        materailDefauls($('.js-linkStep2 .js-screenhalf'), up, file, info);
                    },
                    Error: function (up, err, errTip) {
                        $('.js-linkStep2 .js-screenhalf .js-UploadMaterial').prop('disabled', false).html(MSG.upload_img);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);
                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    }
                }
            });

            // 全屏 package素材上传
            this._fnQiniuUpload({
                browse_button: 'js-UploadMaterial_' + CONSTANT.revenue_type_cpd + '_' + CONSTANT.ad_type_screen_full,
                init: {
                    FileUploaded: function (up, file, info) {
                        materailDefauls($('.js-PackageStep2 .js-screenfull'), up, file, info);
                    },
                    Error: function (up, err, errTip) {
                        $('.js-PackageStep2 .js-screenfull .js-UploadMaterial').prop('disabled', false).html(MSG.upload_img);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);
                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    }
                }
            });

            // 全屏 link素材上传
            this._fnQiniuUpload({
                browse_button: 'js-UploadMaterial_' + CONSTANT.revenue_type_cpc + '_' + CONSTANT.ad_type_screen_full,
                init: {
                    FileUploaded: function (up, file, info) {
                        materailDefauls($('.js-linkStep2 .js-screenfull'), up, file, info);
                    },
                    Error: function (up, err, errTip) {
                        $('.js-linkStep2 .js-screenfull .js-UploadMaterial').prop('disabled', false).html(MSG.upload_img);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);
                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    }
                }
            });

            // Feeds上传素材
            this._fnQiniuUpload({
                browse_button: 'js-feedsuploadicon-' + CONSTANT.products_type_package,
                init: {
                    FileUploaded: function (up, file, info) {
                        Helper.close_ajax();
                        var _iconObj = $('#js-feedsuploadicon-' + CONSTANT.products_type_package);
                        _iconObj.prop('disabled', false).html(MSG.upload_material);
                        var adspecAry = _iconObj.attr('data-adspec').split('*');
                        var res = JSON.parse(info);
                        var imgURL = API_URL.qiniu_domain + '/' + res.key;
                        $.get(imgURL + '?imageInfo', function (ret) {
                            // 素材上传尺寸限定
                            if (ret.width === +adspecAry[0] && ret.height === +adspecAry[1]) {
                                $('.js-FeedsPreview img.js-feedsImg').attr('src', imgURL).show();
                                $('.js-feedsIcon img').attr('src', imgURL).show();
                                $('.js-feedsIcon a').attr('href', imgURL);
                                _iconObj.text(MSG.modify_material);
                            }
                            else {
                                Helper.fnPrompt(MSG.upload_spec_size_material);
                            }
                        }, 'json');

                    },
                    Error: function (up, err, errTip) {
                        $('#js-feedsuploadicon-' + CONSTANT.products_type_package).prop('disabled', false).html(MSG.upload_material);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);
                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    }
                }
            });

            // Link Feeds上传素材
            this._fnQiniuUpload({
                browse_button: 'js-feedsuploadicon-' + CONSTANT.products_type_link,
                init: {
                    BeforeUpload: function (up, file) {
                        var type = file.type;
                        if (type.indexOf('image') !== -1) {
                            var imgType = type.slice(6);
                            if (imgType !== 'png' && imgType !== 'jpg' && imgType !== 'jpeg') {
                                Helper.fnPrompt(MSG.upload_not_in_conformity);
                                up.removeFile(file);
                            }
                        }
                        else {
                            Helper.fnPrompt(MSG.upload_not_in_conformity);
                            up.removeFile(file);
                        }
                    },
                    FileUploaded: function (up, file, info) {
                        Helper.close_ajax();
                        var _iconObj = $('#js-feedsuploadicon-' + CONSTANT.products_type_link);
                        _iconObj.prop('disabled', false).html(MSG.upload_material);
                        var adspecAry = _iconObj.attr('data-adspec').split('*');
                        var res = JSON.parse(info);
                        var imgURL = API_URL.qiniu_domain + '/' + res.key;
                        $.get(imgURL + '?imageInfo', function (ret) {
                            // 素材上传尺寸限定
                            if (ret.width === +adspecAry[0] && ret.height === +adspecAry[1]) {
                                $('.js-FeedsLinkPreview img.js-feedsLinkImg').attr('src', imgURL).show();
                                $('.js-feedsLinkIcon img').attr('src', imgURL).show();
                                $('.js-feedsLinkIcon a').attr('href', imgURL);
                                _iconObj.text(MSG.modify_material);
                            }
                            else {
                                Helper.fnPrompt(MSG.upload_spec_size_material);
                            }
                        }, 'json');

                    },
                    Error: function (up, err, errTip) {
                        $('#js-feedsuploadicon-' + CONSTANT.products_type_link).prop('disabled', false).html(MSG.upload_material);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);
                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    }
                }
            });

            // 七牛上传Feeds图标
            this._fnQiniuUpload({
                browse_button: 'js-uploadSmallFeeds',
                init: {
                    BeforeUpload: function (up, file) {
                        var type = file.type;
                        if (type.indexOf('image') !== -1) {
                            var imgType = type.slice(6);
                            if (imgType !== 'png' && imgType !== 'jpg' && imgType !== 'jpeg') {
                                Helper.fnPrompt(MSG.upload_not_in_conformity);
                                up.removeFile(file);
                            }
                        }
                        else {
                            Helper.fnPrompt(MSG.upload_not_in_conformity);
                            up.removeFile(file);
                        }
                    },
                    FileUploaded: function (up, file, info) {
                        Helper.close_ajax();
                        $('#js-uploadSmallFeeds').prop('disabled', false).html(MSG.upload);
                        var res = JSON.parse(info);
                        var imgURL = API_URL.qiniu_domain + '/' + res.key;
                        $.get(imgURL + '?imageInfo', function (ret) {
                            // 素材上传尺寸限定
                            if (ret.width === 50 && ret.height === 50) {
                                $('#js-ProductsLinkIcon').val(imgURL).trigger('change');
                                $('.js-FeedsSmallIcon').html('<img src="' + imgURL + '" width="40" height="40"><i class="fa fa-times-circle"></i>');
                                $('#js-uploadSmallFeeds').text(MSG.modify_img);
                            }
                            else {
                                Helper.fnPrompt(MSG.upload_spec_size_material);
                                up.removeFile(file);
                            }
                        }, 'json');

                    }
                }
            });
            this._fnQiniuUpload({ // 上传AppStore应用图标
                browse_button: 'js-upload-appstore-icon',
                init: {
                    BeforeUpload: function (up, file) {
                        $('#js-upload-appstore-icon').prop('disabled', false);
                        var type = file.type;
                        if (type.indexOf('image') !== -1) {
                            var imgType = type.slice(6);
                            if (imgType !== 'png' && imgType !== 'jpg' && imgType !== 'jpeg') {
                                Helper.fnPrompt(MSG.upload_not_in_conformity);
                                up.removeFile(file);
                            }
                        }
                        else {
                            Helper.fnPrompt(MSG.upload_not_in_conformity);
                            up.removeFile(file);
                        }
                    },
                    FileUploaded: function (up, file, info) {
                        Helper.close_ajax();
                        $('#js-upload-appstore-icon').prop('disabled', false).html(MSG.upload);
                        var res = JSON.parse(info);
                        var imgURL = API_URL.qiniu_domain + '/' + res.key;
                        $.get(imgURL + '?imageInfo', function (ret) {
                            // 素材上传尺寸限定
                            if (ret.width === 512 && ret.height === 512) {
                                $('#js-appstore-products-icon').val(imgURL);
                                $('#js-upload-appstore-icon').next('.js-show-appstoreimg').html('<img src="' + imgURL + '" data-adspec="1" width="40" height="40" /><i class="fa fa-times-circle"></i>');
                                $('#js-upload-appstore-icon').html(MSG.modify_img);
                            }
                            else {
                                Helper.fnPrompt(MSG.upload_spec_size_material);
                                up.removeFile(file);
                            }
                        }, 'json');

                    }
                }
            });
            // 点击删除图片
            $('.step-cont').delegate('.js-show-appstoreimg i', 'click', function () {
                $('.js-show-appstoreimg').empty();
                $('#js-upload-appstore-icon').html(MSG.upload);
                $('#js-appstore-products-icon').val('');
            });
            // 删除应用截图
            $('.step-cont').delegate('.js-shortappstoreicon i', 'click', function () {
                var self = $(this);
                var _imgObj = self.prev('img');
                var _key = _imgObj.attr('data-key');
                self.parent('span.js-ImgSpan').remove();
                var _showImgObj = self.parents('.show-appimg');
                if (_showImgObj && _showImgObj.find('img').length < 5) {
                    $('.js-adtype-appstore .js-shortappstoreicon [data-mark=button][data-key=' + _key + ']').show();
                }
            });
            // 删除Banner、插屏素材
            $('.step-cont').delegate('.js-BannerMaterial .img_view i', 'click', function () {
                var _this = $(this);
                var _parentMaterial = _this.parents('.material-list');
                // 删除hd li 的值，并点击
                _parentMaterial.find('.hd li[data-url="' + _this.prev('a').attr('href') + '"]').attr('data-url', '').removeClass('has').trigger('click');
                _this.parents('form').find('.preview img').hide();
                _parentMaterial.next('input[name=material_num]').val(_parentMaterial.find('li').hasClass('has') ? 1 : 0).trigger('blur');
            });
        },
        _fnQiniuUpload: function (options) {
            var settings = {
                runtimes: 'html5,flash,html4', // 上传模式,依次退化
                browse_button: '', // 上传选择的点选按钮，**必需**
                uptoken_url: API_URL.qiniu_uptoken_url, // Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
                domain: API_URL.qiniu_domain, // bucket 域名，下载资源时用到，**必需**
                max_file_size: '2mb', // 最大文件体积限制
                max_retries: 3, // 上传失败最大重试次数
                dragdrop: true, // 开启可拖曳上传
                chunk_size: '4mb', // 分块上传时，每片的体积
                auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
                multi_selection: false,
                init: {
                    BeforeUpload: function (up, file) {
                        var type = file.type;
                        if (type.indexOf('image') !== -1) {
                            var imgType = type.slice(6);
                            if (imgType !== 'png' && imgType !== 'gif' && imgType !== 'jpg' && imgType !== 'jpeg') {
                                Helper.fnPrompt(MSG.upload_not_in_conformity);
                                up.removeFile(file);
                            }
                        }
                        else {
                            Helper.fnPrompt(MSG.upload_not_in_conformity);
                            up.removeFile(file);
                        }
                    },
                    UploadProgress: function (up, file) {
                        $('#' + options.browse_button).prop('disabled', true).html(MSG.uploading);
                        if ($('.datagrid-mask-msg').length <= 1) {
                            Helper.load_ajax();
                        }

                    },
                    Error: function (up, err, errTip) {
                        $('#' + options.browse_button).prop('disabled', false).html(MSG.upload);
                        Helper.close_ajax();
                        if (err.code === -600) {
                            Helper.fnPrompt(MSG.upload_up_to_two_mb);
                        }
                        else if (err.status === 401) {
                            Helper.fnPrompt('因为长时间未操作，本次操作已失效，请重新操作', './index.html');
                        }
                        else {
                            Helper.fnPrompt(errTip);
                        }
                    },
                    Key: function (up, file) {
                        var key = '';
                        key = file.id + Helper.fnGetCookie('user_id') + '.jpg';
                        return key;
                    }
                }
            };

            return Qiniu.uploader($.extend({}, settings, options, {
                init: $.extend({}, settings.init, options.init ? options.init : {})
            }));
        },
        _fnUploadFile: function () { // 上传安装包
            var up_datas;
            $('.step-cont').delegate('.js-upload-file', 'click', function () {
                up_datas = {};
                up_datas.securityKey = API_URL.file_securityKey;
                up_datas.dom = $(this);
                $('#js-file-up').uploadFile({
                    url: API_URL.file_upload,
                    fileName: 'file',
                    dynamicFormData: function () {
                        this.user_data = $.extend({}, up_datas || {});
                        delete up_datas.dom;
                        return $.extend({}, up_datas || {});
                    },
                    multiple: false,
                    allowedTypes: $('#js-extension').val(),
                    onFilter: function (file, error, dom) {
                        Helper.fnPrompt(error);
                    },
                    onError: function (files, json, xhr) {
                        $(this.user_data.dom).attr('disabled', false);
                        $(this.user_data.dom).parent().find('.btn-bg-div').hide();
                    },
                    onSuccess: function (files, json, xhr) {
                        $(this.user_data.dom).attr('disabled', false);
                        var data = json;
                        var oParentDom = $(this.user_data.dom).parent();
                        oParentDom.find('.btn-bg-div').hide();
                        oParentDom.find('.btn-bg').width('100%');
                        if (data.success && data.obj) {
                            var oPackage = $.extend({}, data.obj, {package_id: null});
                            if ((+$('#js-status').val()) === CONSTANT.status_draft || (+$('#js-status').val()) === CONSTANT.status_rejected) {
                                oParentDom.find('.js-package-name').attr('href', API_URL.file_down + '?path=' + data.obj.path + '&real_name=' + data.obj.real_name).text(data.obj.real_name);
                                if ((+$('#js-status').val()) === CONSTANT.status_rejected) {
                                    oParentDom.find('.js-package-prompt').empty();
                                }
                            }
                            else {
                                var oPackageUrl = oParentDom.find('.js-package-name');
                                oPackageUrl.parent('.js-change-package').show();
                                oPackageUrl.attr('href', API_URL.file_down + '?path=' + data.obj.path + '&real_name=' + data.obj.real_name).text(data.obj.real_name);
                                oParentDom.find('.js-package-prompt') && oParentDom.find('.js-package-prompt').length > 0 && oParentDom.find('.js-package-prompt').empty();
                            }
                            oParentDom.find('[name=package_file]').val(JSON.stringify(oPackage)).trigger('blur');
                            $(this.user_data.dom).find('.js-btn-name').text('替换');
                        }
                        else {
                            Helper.fnPrompt(data.msg);
                            $(this.user_data.dom).parent().find('.btn-bg-div').hide();
                        }
                    },
                    onProgress: function (percent) {
                        $(this.user_data.dom).attr('disabled', true);
                        $(this.user_data.dom).parent().find('.btn-bg-div').show();
                        $(this.user_data.dom).parent().find('.btn-bg').width(percent + '%');
                    }
                });
                $('.ajax-file-upload input[type=file]:last').trigger('click');
            });
        },
        _fnUploadVideo: function () { // 上传安装包
            var up_datas;
            $('.step-cont').delegate('.js-upload-video', 'click', function () {
                up_datas = {};
                up_datas.securityKey = API_URL.file_securityKey;
                up_datas.dom = $(this);
                $('#js-file-up').uploadFile({
                    url: API_URL.file_upload,
                    fileName: 'file',
                    dynamicFormData: function () {
                        this.user_data = $.extend({}, up_datas || {});
                        delete up_datas.dom;
                        return $.extend({}, up_datas || {});
                    },
                    multiple: false,
                    allowedTypes: 'mp4',
                    onFilter: function (file, error, dom) {
                        Helper.fnPrompt(error);
                    },
                    onError: function (files, json, xhr) {
                        $(this.user_data.dom).attr('disabled', false);
                        $(this.user_data.dom).parent().find('.btn-bg-div').hide();
                    },
                    onSuccess: function (files, json, xhr) {
                        $(this.user_data.dom).attr('disabled', false);
                        var data = json;
                        var oParentDom = $(this.user_data.dom).parent();
                        oParentDom.find('.btn-bg-div').hide();
                        oParentDom.find('.btn-bg').width('100%');
                        if (data.success && data.obj && data.obj.format && data.obj.streams && data.obj.streams.length === 2) {
                            var streams = data.obj.streams;
                            var videoObj = streams[0].codec_type === 'video' ? streams[0] : streams[1];
                            var duration = Number(videoObj.duration);
                            if (20 * 1024 * 1024 < Number(data.obj.format.size)) {
                                Helper.fnPrompt('视频大小不能超过20MB');
                                return;
                            }
                            if (!(5 === duration || 15 === duration || 30 === duration || 60 === duration)) {
                                Helper.fnPrompt('视频时长不符合要求');
                                return;
                            }
                            if (!(videoObj.width === 1280 && videoObj.height === 720)) {
                                Helper.fnPrompt('视频分辨率应为1280x720px');
                            }
                            if (videoObj.width * 9 !== videoObj.height * 16) {
                                Helper.fnPrompt('视频比例不符合要求');
                                return;
                            }
                            if (!(videoObj.codec_name && (videoObj.codec_name.toLowerCase() === 'h264' || videoObj.codec_name.toLowerCase() === 'avc'))) {
                                Helper.fnPrompt('视频编码应为H.264/AVC');
                                return;
                            }
                            var oVideo = $.extend({}, data.obj, {id: null});
                            if ((+$('#js-status').val()) === CONSTANT.status_draft || (+$('#js-status').val()) === CONSTANT.status_rejected) {
                                oParentDom.find('.js-video-name').attr('href', data.obj.url).text(data.obj.real_name);
                                if ((+$('#js-status').val()) === CONSTANT.status_rejected) {
                                    oParentDom.find('.js-video-prompt').empty();
                                }
                            }
                            else {
                                var oVideoUrl = oParentDom.find('.js-video-name');
                                oVideoUrl.parent('.js-change-video').show();
                                oVideoUrl.attr('href', data.obj.url).text(data.obj.real_name);
                                oParentDom.find('.js-video-prompt') && oParentDom.find('.js-video-prompt').length > 0 && oParentDom.find('.js-video-prompt').empty();
                            }
                            oParentDom.find('[name=video]').val(JSON.stringify(oVideo)).trigger('blur');
                            $(this.user_data.dom).parents('.js-body').find('video').attr('src', data.obj.url).show();
                            $(this.user_data.dom).find('.js-btn-name').text('替换');
                        }
                        else {
                            Helper.fnPrompt(data.msg);
                            $(this.user_data.dom).parent().find('.btn-bg-div').hide();
                        }
                    },
                    onProgress: function (percent) {
                        $(this.user_data.dom).attr('disabled', true);
                        $(this.user_data.dom).parent().find('.btn-bg-div').show();
                        $(this.user_data.dom).parent().find('.btn-bg').width(percent + '%');
                    }
                });
                $('.ajax-file-upload input[type=file]:last').trigger('click');
            });
        },
        // 重置产品信息
        _fnResetProducts: function (element) {
            var parent = $(element).parents('form');
            parent.find('input[type="text"]').attr('disabled', false).val('');
            parent.find('.js-Platform').attr('disabled', false);
            parent.find('.js-CampaignIcon').empty();
            parent.find('.js-UploadCampaign').attr('disabled', false).text(MSG.upload);
            $('#js-ProductsIcon').val('').trigger('change');
        },
        // 修改产品信息
        _fnModifyProducts: function (element) {
            var parent = element.parents('form');
            parent.find('.js-Platform').val(element.attr('data-platform')).attr('disabled', true);
            parent.find('.js-AppName').val(element.attr('data-name')).attr('disabled', true).trigger('blur');
            parent.find('.js-AppShowName').val(element.attr('data-show_name')).attr('disabled', true).trigger('change').trigger('blur');

            var sProductIcon = element.attr('data-icon');
            if (sProductIcon && sProductIcon.length > 0) {
                parent.find('#js-ProductsIcon').val(sProductIcon).trigger('change').trigger('blur');
                parent.find('.js-CampaignIcon').html('<img src="' + sProductIcon + '" width="40" height="40">');
                parent.find('.js-UploadCampaign').attr('disabled', true).text(MSG.modify_img);
            }

        },

        _fnCreateCampaigns: function (element) {
            var action = CONSTANT.action_save_draft;
            if ($(element).attr('id') === 'confirm') {
                action = CONSTANT.action_pending_approval;
                $('.step3-cont .bd').html('<div class="tj-im"></div>恭喜您的广告创建成功！');
            }
            else if ($(element).attr('id') === 'draft') {
                action = CONSTANT.action_save_draft;
            }
            else if ($(element).attr('id') === 'modify') {
                action = CONSTANT.action_save_modify;
            }

            var productType = $('input[name="products_type"]:checked').val();
            var objForm;
            var iAdType = 0;
            var objFormType;
            if ((+productType) === CONSTANT.products_type_package) {
                iAdType = $('input[name=ad_type]:checked').val();
                objFormType = $('.js-PackageStep2');
            }
            else {
                iAdType = $('input[name=ad_type_link]:checked').val();
                objFormType = $('.js-linkStep2');
            }

            if ((+iAdType) === CONSTANT.ad_type_app_market) {
                objForm = objFormType.find('.js-Adtype_app');
            }
            else if ((+iAdType) === CONSTANT.ad_type_banner || (+iAdType) === CONSTANT.ad_type_banner_textlink) {
                objFormType.find('.js-Adtype_banner form').each(function () {
                    if ($(this).css('display') !== 'none') {
                        objForm = $(this);
                    }
                });
            }
            else if ((+iAdType) === CONSTANT.ad_type_feeds) {
                objForm = objFormType.find('.js-Adtype_feeds');
            }
            else if ((+iAdType) === CONSTANT.ad_type_screen_half || (+iAdType) === CONSTANT.ad_type_screen_full) {
                objFormType.find('.js-adtype-screen form').each(function () {
                    if ($(this).css('display') !== 'none') {
                        objForm = $(this);
                    }
                });
            }
            else if ((+iAdType) === CONSTANT.ad_type_app_store) {
                objForm = objFormType.find('.js-adtype-appstore');
            }
            else if ((+iAdType) === CONSTANT.ad_type_other) {
                objForm = objFormType.find('.js-adtype-other');
            }
            else if ((+iAdType) === CONSTANT.ad_type_video) {
                objForm = objFormType.find('.js-adtype-video');
            }

            if (!(objForm && objForm.valid())) {
                return false;
            }
            Helper.load_ajax();

            // 设置产品资料
            var bosCampaign = new $.fn.campaignmodel.Model();
            bosCampaign.setData('id', $('#campaignid').val()); // 设置CampaignId
            bosCampaign.setData('products_type', productType);
            bosCampaign.setData('action', action);

            if ((+productType) === CONSTANT.products_type_package) {
                var menuCur = $('#js-PackageForm').find('li.cur');
                bosCampaign.setData('products_id', menuCur.attr('data-id') ? menuCur.attr('data-id') : null); // dropdown-menu
                bosCampaign.setData('products_name', $('#js-PackageForm input[name="products_name"').val()); // 应用名称
                bosCampaign.setData('products_show_name', $('#js-PackageForm input[name="products_show_name"').val()); // 应用显示名称
                bosCampaign.setData('platform', $('#js-PackageForm select[name="platform"').val());
                bosCampaign.setData('products_icon', $('#js-PackageForm input[name="products_icon"').val()); // 应用图标js-ProductsIcon
                bosCampaign.setData('ad_type', $('input[name="ad_type"]:checked').val()); // 广告类型
                this._fnSetCampaign(bosCampaign, productType, $('input[name="ad_type"]:checked').val());
            }
            else {
                bosCampaign.setData('products_id', $('#js-LinkForm select[name="products_menu"]').val() === -1 ? null : $('#js-LinkForm select[name="products_menu"]').val());
                var nPlatform = 0;
                $('#js-LinkForm input[name="link_platform"]:checked').each(function () {
                    nPlatform += parseInt($(this).val(), 10);
                });
                bosCampaign.setData('platform', nPlatform);
                bosCampaign.setData('link_name', $('#js-LinkForm input[name="link_name"]').val());
                bosCampaign.setData('link_url', $('#js-LinkForm input[name="link_url"]').val());
                bosCampaign.setData('ad_type', $('input[name="ad_type_link"]:checked').val()); // 广告类型
                this._fnSetCampaign(bosCampaign, productType, $('input[name="ad_type_link"]:checked').val());
            }
            if (+bosCampaign.data.revenue_type === CONSTANT.revenue_type_cps) {
                bosCampaign.setData('revenue', '');
                bosCampaign.setData('day_limit', '');
                bosCampaign.setData('total_limit', '');
            }
            bosCampaign.save({
                url: API_URL.campaign_store,
                data: bosCampaign.getPostData()
            }, function (json) {
                if (json && json.res === 0) {
                    $('.step-li').removeClass('cur');
                    $('.step3').addClass('cur');
                    $('.step-cont').hide();
                    $('.step3-cont').show();
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
                Helper.close_ajax();
            });
        },
        _fnSetTotalLimit: function (element, obj) { // 设置总预算
            // 设置总预算
            if (element.find('input[name=total_limit_check]:checked').length === 0) {
                obj.setData('total_limit', element.find('input[name=total_limit]').val());
            }
            else {
                obj.setData('total_limit', 0);
            }
        },
        /*
         * 设置提交数据
         */
        _fnSetCampaign: function (obj, productsType, adType) {
            if ((+productsType) === CONSTANT.products_type_package) {
                if ((+adType) === CONSTANT.ad_type_screen_half) {
                    adType = $('.js-PackageStep2 input[name=screen_type]:checked').val();
                }
                if ((+adType) === CONSTANT.ad_type_app_market) { // 设置应用市场
                    this._fnSetAppCampaign(obj);
                }
                else if ((+adType) === CONSTANT.ad_type_banner) {
                    adType = $('.js-PackageStep2 input[name=banner_type]:checked').val();
                    if ((+adType) === CONSTANT.ad_type_banner) {
                        this._fnSetBannerCampaign(obj); // 设置Banner纯图片
                    }
                    else { // 设置Banner文字链
                        obj.setAdsCampaign($('.js-PackageStep2 .js-form-textlink'));
                        this._fnSetTotalLimit($('.js-PackageStep2 .js-form-textlink'), obj);
                    }
                }
                else if ((+adType) === CONSTANT.ad_type_feeds) { // 设置Feeds
                    this._fnSetFeedsCampaign(obj);
                }
                else if ((+adType) === CONSTANT.ad_type_screen_half) { // 设置半屏插屏
                    this._fnSetHalfCampaign(obj);
                }
                else if ((+adType) === CONSTANT.ad_type_screen_full) { // 设置全屏插屏
                    this._fnSetFullCampaign(obj);
                }
                else if ((+adType) === CONSTANT.ad_type_other) { // 设置其他
                    obj.setAdsCampaign($('.js-PackageStep2 .js-adtype-other'));
                }
                else if ((+adType) === CONSTANT.ad_type_video) { // 设置视频
                    this._fnSetVideoPackageCampaign(obj);
                }
            }
            else {
                if ((+adType) === CONSTANT.ad_type_screen_half) {
                    adType = $('.js-linkStep2 input[name=link_screen_type]:checked').val();
                }
                if ((+adType) === CONSTANT.ad_type_banner) {
                    adType = $('.js-linkStep2 input[name=link-banner_type]:checked').val();
                    if ((+adType) === CONSTANT.ad_type_banner) {
                        this._fnSetBannerLinkCampaign(obj); // 设置Banner纯图片
                    }
                    else { // 设置Banner文字链
                        obj.setAdsCampaign($('.js-linkStep2 .js-form-textlink'));
                        this._fnSetTotalLimit($('.js-linkStep2 .js-form-textlink'), obj);
                    }
                }
                else if ((+adType === CONSTANT.ad_type_feeds)) {
                    this._fnSetFeedsLinkCampaign(obj);
                }
                else if ((+adType) === CONSTANT.ad_type_screen_half) { // 设置半屏插屏
                    this._fnSetHalfLinkCampaign(obj);
                }
                else if ((+adType) === CONSTANT.ad_type_screen_full) { // 设置全屏插屏
                    this._fnSetFullLinkCampaign(obj);
                }
                else if ((+adType) === CONSTANT.ad_type_app_store) { // 设置AppStore
                    this._fnSetAppStoreCampaign(obj);
                }
                else if ((+adType) === CONSTANT.ad_type_video) { // 设置视频
                    this._fnSetVideoLinkCampaign(obj);
                }
            }
            obj.setData('ad_type', adType);
        },
        /*
         *  设置应用市场表单
         */
        _fnSetAppCampaign: function (bosCampaign) {
            var element = $('.js-PackageStep2 .js-Adtype_app');
            bosCampaign.setAdsCampaign(element);
            var objImgs = {};
            element.find('.js-ShortAppIcon img').each(function () {
                if (!objImgs[$(this).attr('data-key')]) {
                    objImgs[$(this).attr('data-key')] = [];
                }
                objImgs[$(this).attr('data-key')].push($(this).attr('src'));
            });
            bosCampaign.setData('appinfos_images', objImgs); // 设置应用截图
            this._fnSetKeywords(bosCampaign, 'package');
            this._fnSetTotalLimit(element, bosCampaign);
        },

        // 设置关键字
        _fnSetKeywords: function (bosCampaign, type) {
            if (+bosCampaign.data.revenue_type === CONSTANT.revenue_type_cps) {
                bosCampaign.setData('keywords', []); // 设置关键字
                return;
            }
            var $container = type === 'appstore' ? $('#appstore-keywords') : $('#package-keywords');
            var objKeywords = []; // 关键字加价
            $container.find('.js-KeyBody .js-KeyTr').each(function () {
                objKeywords.push({
                    price_up: $(this).find('td.price_up input[type=number]').val(),
                    keyword: $(this).find('td.keyword').text(),
                    id: ($(this).attr('data-id') ? $(this).attr('data-id') : null)
                });
            });
            bosCampaign.setData('keywords', objKeywords); // 设置关键字
        },
        _fnGetMaterialImg: function (element) {
            var objImgs = [];
            element.each(function () {
                objImgs.push({
                    url: $(this).attr('data-url'), // 素材banner地址
                    ad_spec: $(this).attr('data-key') // 素材尺寸
                });
            });
            return objImgs;
        },
        /*
         *  设置安装包半屏表单
         */
        _fnSetHalfCampaign: function (bosCampaign) {
            var element = $('.js-PackageStep2 .js-form-screenhalf');
            bosCampaign.setAdsCampaign(element);
            bosCampaign.setData('appinfos_images', this._fnGetMaterialImg($('.js-PackageStep2 .js-form-screenhalf .js-BannerMaterial li.has')));
            this._fnSetTotalLimit(element, bosCampaign);
        },
         /*
         *  设置安装包全屏表单
         */
        _fnSetFullCampaign: function (bosCampaign) {
            var element = $('.js-PackageStep2 .js-form-screenfull');
            bosCampaign.setAdsCampaign(element);
            bosCampaign.setData('appinfos_images', this._fnGetMaterialImg($('.js-PackageStep2 .js-form-screenfull .js-BannerMaterial li.has')));
            this._fnSetTotalLimit(element, bosCampaign);
        },
        /*
         *  设置链接推广半屏表单
         */
        _fnSetHalfLinkCampaign: function (bosCampaign) {
            var element = $('.js-linkStep2 .js-form-screenhalf');
            bosCampaign.setAdsCampaign(element);
            bosCampaign.setData('appinfos_images', this._fnGetMaterialImg($('.js-linkStep2 .js-form-screenhalf .js-BannerMaterial li.has')));
            this._fnSetTotalLimit(element, bosCampaign);
        },
         /*
         *  设置链接推广全屏表单
         */
        _fnSetFullLinkCampaign: function (bosCampaign) {
            var element = $('.js-linkStep2 .js-form-screenfull');
            bosCampaign.setAdsCampaign(element);
            bosCampaign.setData('appinfos_images', this._fnGetMaterialImg($('.js-linkStep2 .js-form-screenfull .js-BannerMaterial li.has')));
            this._fnSetTotalLimit(element, bosCampaign);
        },
        /*
         *  设置Banner纯图片表单
         */
        _fnSetBannerCampaign: function (bosCampaign) {
            var element = $('.js-PackageStep2 .js-form-purepic');
            bosCampaign.setAdsCampaign(element);
            bosCampaign.setData('appinfos_images', this._fnGetMaterialImg($('.js-PackageStep2 .js-form-purepic .js-BannerMaterial li.has'))); // 设置创意素材
            this._fnSetTotalLimit(element, bosCampaign);
        },
        /*
         *  设置Feeds表单
         */
        _fnSetFeedsCampaign: function (bosCampaign) {
            var element = $('.js-PackageStep2 .js-Adtype_feeds');
            bosCampaign.setAdsCampaign(element);
            var objImgs = [];
            objImgs.push({
                url: $('.js-feedsIcon img').attr('src')
            });
            bosCampaign.setData('appinfos_images', objImgs); // 设置Feeds图片素材
            this._fnSetTotalLimit(element, bosCampaign);
        },

        /*
         *  设置Banner 纯图片 Link表单
         */
        _fnSetBannerLinkCampaign: function (bosCampaign) {
            var element = $('.js-linkStep2 .js-form-purepic');
            bosCampaign.setAdsCampaign(element);
            bosCampaign.setData('appinfos_images', this._fnGetMaterialImg($('.js-linkStep2 .js-form-purepic .js-BannerMaterial li.has'))); // 设置创意素材
            this._fnSetTotalLimit(element, bosCampaign);
        },
        /*
         *  设置FeedsLink表单
         */
        _fnSetFeedsLinkCampaign: function (bosCampaign) {
            var element = $('.js-linkStep2 .js-Adtype_feeds');
            bosCampaign.setAdsCampaign(element);
            var objImgs = [];
            objImgs.push({
                url: $('.js-feedsLinkIcon img').attr('src')
            });
            bosCampaign.setData('appinfos_images', objImgs); // 设置Feeds图片素材
            this._fnSetTotalLimit(element, bosCampaign);
        },
        /*
         *  设置AppStore表单
         */
        _fnSetAppStoreCampaign: function (bosCampaign) {
            var element = $('.js-linkStep2 .js-adtype-appstore');
            bosCampaign.setAdsCampaign(element);
            bosCampaign.setData('application_id', element.find('input[name=application_id]').val()); // 设置应用ID
            bosCampaign.setData('products_icon', element.find('input[name=products_icon]').val()); // 设置应用图标
            bosCampaign.setData('products_show_name', element.find('input[name=products_show_name]').val()); // 设置应用显示名称
            var objImgs = {};
            element.find('.js-shortappstoreicon img').each(function () { // 应用截图
                if (!objImgs[$(this).attr('data-key')]) {
                    objImgs[$(this).attr('data-key')] = [];
                }
                objImgs[$(this).attr('data-key')].push($(this).attr('src'));
            });
            bosCampaign.setData('appinfos_images', objImgs); // 设置应用截图
            this._fnSetKeywords(bosCampaign, 'appstore');
            this._fnSetTotalLimit(element, bosCampaign);
        },
        _fnSetVideoPackageCampaign: function (bosCampaign) {
            var element = $('.js-PackageStep2 .js-adtype-video');
            bosCampaign.setAdsCampaign(element);
            this._fnSetTotalLimit(element, bosCampaign);
        },
        _fnSetVideoLinkCampaign: function (bosCampaign) {
            var element = $('.js-linkStep2 .js-adtype-video');
            bosCampaign.setAdsCampaign(element);
            this._fnSetTotalLimit(element, bosCampaign);
        },
        // 初始化
        fnInit: function () {
            this._fnGetPlatform();
        }
    };

    return new CampaignModify();
})(jQuery);

$(function () {
    CampaignModify.fnInit();
});
