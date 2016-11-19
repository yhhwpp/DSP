/**
 * @file constant.js
 * @author xiaokl
 */
var MSG = MSG || {};
MSG = {
    upload: '上传',
    uploading: '上传中...',
    upload_img: '上传图片',
    upload_material: '上传素材',
    modify_img: '修改图片',
    modify_material: '修改素材',
    upload_spec_size_material: '请上传指定尺寸的素材',
    upload_creative_material: '请上传创意素材',
    upload_img_material: '请上传图片素材',
    upload_up_to_five: '最多只能上传5张图片',
    upload_not_in_conformity: '上传图片格式不符合',
    upload_down_to_three: '请上传至少3张应用截图',
    upload_up_to_two_mb: '上传图片要小于2M',
    server_error: '服务器请求失败，请稍后重试！'
};

var CONSTANT = CONSTANT || {};

/*
 *	状态常量设置
 */
CONSTANT = {
    status_array: [0, 1, 4, 10, 11, 12, 13, 15],
    status_delivering: 0, // 投放中
    status_suspended: 1, // 已暂停
    status_draft: 4, // 草稿
    status_pending_approval: 10, // 待审核
    status_rejected: 11, // 未通过审核
    status_pending_delivery: 12, // 待投放
    status_pending_package: 13, // 待传包
    ad_type_app_market: 0, // 应用市场
    ad_type_banner: 1, // banner
    ad_type_feeds: 2, // feeds
    ad_type_screen_half: 3, // 插屏半屏
    ad_type_screen_full: 4, // 插屏全屏
    ad_type_banner_textlink: 5, // banner文字链
    ad_type_app_store: 71, // AppStore
    ad_type_other: 81, // 其它广告类型 (CPA、CPT)
    ad_type_video: 91, // 视频广告
    action_pending_approval: 1, // 提交审核
    action_save_draft: 2, // 保存草稿
    action_save_modify: 3, // 保存修改
    invoice_status_apply: 1, // 已申请
    money_limit_cpd: 0, // CPD
    money_limit_cpc: 1, // CPC
    revenue_type_cpd: 1, // CPD
    revenue_type_cpc: 2, // CPC
    revenue_type_cpa: 4, // CPA
    revenue_type_cpt: 8, // CPT
    revenue_type_cpm: 16, // CPM
    revenue_type_cps: 32, // CPS
    revenue_type_array: [1, 2, 4, 8, 16, 32], // 计费类型
    revenue_type_conf: {
        1: {
            decimal: 1
        },
        2: {
            decimal: 2
        },
        4: {
            decimal: 1
        },
        8: {
            decimal: 1
        },
        16: {
            decimal: 2
        },
        32: {
            decimal: 2
        }
    },
    products_type_package: 0, // 安装包下载
    products_type_link: 1, // 链接推广下载
    platform_type: [1, 2, 4, 8], // 平台类型
    platform_android: [8], // android平台
    platform_ios: [1, 2, 4], // ios平台
    platform_all: [15], // android和ios平台
    app_img_one: 1, // 720*1280
    app_img_two: 2, // 480*800
    app_img_text: {1: '720*1280', 2: '480*800'},
    app_store_img_text: {1: '640*1136'},
    platform_type_iphone_copyright: 1,
    platform_type_ipad: 2,
    platform_type_iphone_jailbreak: 4,
    platform_type_android: 8,

    // 广告位模块
    zone_type_app: '0', // 应用推荐广告位
    zone_type_banner: '1', // Banner广告位
    zone_type_feeds: '2', // Feeds广告位
    zone_type_screen: '3', // 插屏广告位

    module_type_common: 1, // 普通广告位
    module_type_search: 2, // 搜索结果广告位
    module_type_flow: 3, // 流量广告位

    // 媒体对接方式
    mode_storage_yes: 1, // 入库
    mode_storage_no: 3, // 不入库
    mode_artif: 2, // 人工投放
    mode_adx: 4, // Adx

    // 渠道包状态
    package_status_pending_approval: 1, // 待审核
    package_status_no_use: 2, // 未使用
    package_status_used: 3, // 使用中
    package_status_rejected: 4, // 未通过审核
    // 媒体状态
    aff_status_pause: 0, // 暂停
    aff_status_continue: 1, // 运营
    // 媒体使用渠道包状态
    aff_pack_status_no_use: 0, // 尚未使用
    aff_pack_status_other: 1, // 正在使用其它包 已使用
    aff_pack_status_used: 2, // 使用中
    // 支持投放不处理数据
    ad_type_no_done: [4, 5],
    // Banner广告投放状态
    banner_status_all: [0, 1, 2, 3, 6],
    banner_status_put_in: 0, // 投放中
    banner_status_suspended: 1, // 已暂停
    banner_status_pending_put_in: 2, // 待投放
    banner_status_no_accepted: 3, // 未接受
    banner_status_pending_verification: 4, // 待验证
    banner_status_pending_media: 6, // 待媒体审核
    // banner暂停状态
    pause_status_media_manual: 0, // 媒体暂停
    pause_status_campaign: 1, // Campaign暂停
    pause_status_platform: 2, // 平台暂停
    pause_status_trafficker_daylimit: 3, // 超媒体日限额暂停
    pause_status_all: [0, 1, 2, 3], // Banner所有暂停状态

    // 素材更新状态
    MATERIALS_STATUS_APPROVE_WAITING: 1,
    MATERIALS_STATUS_APPROVE_REJECT: 2,
    MATERIALS_STATUS_EFFECT: 3,

    AD_TYPE_APPLICATION: 0,
    AD_TYPE_BANNER: 1,
    AD_TYPE_FEEDS: 2,
    AD_TYPE_INSERT: 3,

    CAMPAIGN_STATUS_DELIVERY: 0, // 投放中
    CAMPAIGN_STATUS_PAUSE: 1, // 已暂停
    CAMPAIGN_STATUS_STOP: 15, // 停止投放
    CAMPAIGN_STATUS_APPROVE_WAITING: 10, // 待审核
    CAMPAIGN_STATUS_APPROVE_REJECT: 11, // 未通过审核

    CAMPAIGN_PAUSE_STATUS_BALANCE: 2, // 余额不足暂停
    CAMPAIGN_PAUSE_STATUS_TOTAL_LIMIT: 5, // 达到总限额暂停
    CAMPAIGN_PAUSE_STATUS_DAY_LIMIT: 1, // 日限额暂停
    CAMPAIGN_PAUSE_STATUS_MANAGER: 0, // 运营暂停
    CAMPAIGN_PAUSE_STATUS_ADVERTISER: 3, // 广告主暂停
    CAMPAIGN_PAUSE_STATUS_EXCEED_DAY_LIMIT_PROGRAM: 4, // 程序化日预算暂停

    REVENUE_MAX: 100,

    // 媒体商数据审计状态
    audit_status_pending_audit: 0, // 待审计
    audit_status_pending_approval: 1, // 待审核
    audit_status_rejected: 2, // 驳回
    audit_status_waiting_audit: 3, // 待审计
    audit_status_pending_gene_report: 6, // 审核通过 待生成审计报表数据
    audit_status_gene_report: 7, // 生成审计收入报表数据
    audit_status_gene_settlement: 8, // 结算数据生成完成
    // 广告主数据审计状态
    audit_adv_status_no_update: 0, // 未更新
    audit_adv_status_pending_approval: 1, // 待审核
    audit_adv_status_passed: 2, // 已通过，生效
    audit_adv_status_rejected: 3, // 未通过
    // 广告主/代理商充值申请状态
    recharge_status_pending_approval: 1, // 待审核
    recharge_status_passed: 2, // 审核通过
    recharge_status_rejected: 3, // 已驳回
    // 广告主/代理商发票申请状态
    invoice_status_applying: 1, // 待审核
    invoice_status_passed: 2, // 审核通过
    invoice_status_rejected: 3, // 已驳回

    act_status_unpubished: 0, // 未发布
    act_status_published: 1, // 已发布


    // 等价关系
    relation_self: 1, // 本广告自身
    relation_ad: 2, // 等价广告
    relation_no: 3, // 无等价关系

    // 邮件日报状态
    daily_status_wait: 1, // 代发送
    daily_status_stop: 2, // 暂停发送
    daily_status_seed: 3, // 已发送
    daily_status_fail: 4, // 发送失败

    // chart报表配色
    chart_color: ['#d55e00', '#e59f01', '#f0e442', '#66cc00', '#94d150', '#56b4e8', '#88c3fb', '#cc79a7', '#9c9acc'],
    chart_line_color: '#cc79a7',

    // 媒体商类别 (联盟、自营)
    kind_union: 1, // 联盟
    kind_self: 2, // 自营
    kind_all: 3, // 自营

    affiliate_type_adn: 1, // adn媒体
    affiliate_type_adx: 2, // adx媒体

    housead_revenue_type_ary: [1, 4, 32],

    // 投放类型
    delivery_type_app: 1, // 应用
    delivery_type_game: 2, // 游戏

    _end: null // 无意义终止符
};
