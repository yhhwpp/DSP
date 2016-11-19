/**
 * @file lang.js
 * @author xiaokl
 */
var LANG = LANG || {};
LANG.aff_pack_status = {0: '尚未使用', 1: '已使用', 2: '已使用本包'}; // 媒体商对此安装包使用情况
LANG.package_status = {1: '待审核', 2: '未使用', 3: '使用中', 4: '未通过审核'};
LANG.ad_type = {0: '应用市场', 1: 'Banner', 2: 'Feeds', 3: '插屏', 4: '插屏', 5: 'Banner', 71: 'AppStore', 81: '其他', 91: '视频'}; // 广告类型
LANG.platform = {1: 'iPhone正版', 2: 'iPad', 4: 'iPhone越狱', 8: 'Android'}; // 推广平台
LANG.platform_group = {1: 'iPhone正版', 2: 'iPad', 4: 'iPhone越狱', 7: 'iOS', 8: 'Android', 15: 'Android + iOS'}; // 推广平台组合
LANG.revenue_type = {1: 'CPD', 2: 'CPC', 4: 'CPA', 8: 'CPT', 16: 'CPM', 32: 'CPS'};
LANG.game_revenue_type = {1: 'CPD', 2: 'CPC', 4: 'CPA', 16: 'CPM', 32: 'CPS'};
LANG.adx_revenue_type = {1: 'CPD', 2: 'CPC', 16: 'CPM'}; // adx 媒体计费类型
LANG.revenue_type_brief = {1: 'D', 2: 'C'};
LANG.products_type = {0: '安装包下载', 1: '链接推广'}; // 推广类型
LANG.affiliates_status = {0: '暂停运营', 1: '运营中'};
LANG.mode = {1: '程序化投放-媒体入库', 3: '程序化投放-媒体不入库', 2: '人工投放', 4: 'Adx'};
LANG.mode_traffic = {1: '程序化投放-媒体入库', 3: '程序化投放-媒体不入库', 2: '人工投放'};
LANG.app_rank = {1: 'S', 2: 'A', 3: 'B', 4: 'C', 5: 'D'};
LANG.banner_status = {0: '投放中', 1: '已暂停', 2: '待选appID', 3: '未接受', 6: '待媒体审核'};
LANG.manager_status = {0: '投放中', 1: '暂停投放', 2: '待选appID', 3: '媒体未通过审核', 6: '待媒体审核', 7: '待投放', 8: '待提交'};
LANG.manager_pause_status = {0: '媒体暂停', 1: 'Campaign暂停', 2: '平台暂停', 3: '达到媒体日限额暂停'}; // 1:Campaign暂停,显示campaign暂停信息
LANG.trafficker_pause_status = {0: '您已暂停投放', 1: 'Campaign暂停', 2: '平台暂停', 3: '超日限额暂停'};
LANG.audit = {1: '不需要审核', 2: '需要审核'};
LANG.MANAGER_AD_TYPE = {
    0: '应用市场',
    1: 'Banner',
    2: 'Feeds',
    3: '插屏',
    71: 'AppStore',
    81: '其他',
    91: '视频'
};
LANG.MANAGER_CAMPAIGN_STATUS = {
    0: '投放中',
    1: '已暂停',
    15: '停止投放',
    10: '待审核',
    11: '未通过审核'
};
LANG.CAMPAIGN_BANNER_PAUSE_STATUS = {
    2: '广告主余额不足暂停',
    5: '达到广告主预算暂停',
    1: '达到广告主日限额暂停',
    4: '达到程序化日限额暂停',
    0: '广告已被平台暂停'
};
LANG.CAMPAIGN_PAUSE_STATUS = {
    2: '余额不足暂停',
    5: '达到预算暂停',
    1: '达到日限额暂停',
    3: '广告主暂停', // houseAd新增
    4: '达到程序化日限额暂停',
    0: '运营暂停'
};
LANG.MATERIALS_STATUS = {
    1: '待审核',
    2: '未通过审核',
    3: '已生效'
};
LANG.audit_status = {0: '待审计', 1: '待审核', 2: '驳回', 3: '待审计', 6: '通过', 7: '通过', 8: '通过'}; // 媒体商数据审计状态
LANG.advertiser_audit_status = {0: '未更新', 1: '待审核', 2: '已通过，生效', 3: '未通过'}; // 广告主数据审计状态
LANG.recharge_way = {0: '支付宝', 1: '对公银行卡'}; // 充值方式
LANG.recharge_status = {1: '待审核', 2: '审核通过', 3: '已驳回'};
LANG.campaign_status = {0: '投放中', 1: '已暂停', 4: '草稿', 10: '待审核', 11: '未通过审核', 15: '停止投放'};
LANG.invoice_type = {0: '增值税普通发票', 2: '增值税专用发票'};
LANG.invoice_status = {1: '申请中', 2: '审核通过', 3: '驳回'};
LANG.gift_status = {1: '待审核', 2: '审核通过', 3: '驳回'};
LANG.client_type = {0: '直客广告主', 1: '代理获客广告主', 2: '代理商'};
LANG.admin_withdrawal_status = {0: '充值', 1: '申请中', 2: '审核通过', 3: '驳回'};
LANG.pay_type = {0: '在线充值', 1: '线下充值'};

LANG.ZONE_TYPE = {
    0: '应用市场',
    1: 'Banner纯图片',
    2: 'Feeds',
    3: '插屏广告',
    4: '插屏广告',
    5: 'Banner文字链',
    6: '不限'
};
LANG.zone_ad_type = {1: '纯图片', 5: '文字链', 6: '不限', 2: '大图文', 3: '插屏半屏', 4: '插屏全屏'};
LANG.module_type = {0: '普通广告位', 1: '搜索广告位'};
LANG.module_type_self = {0: '普通广告位', 1: '搜索广告位', 3: '流量广告位'};

LANG.campaign_status_select = {0: '投放中', 4: '草稿', 10: '待审核', 11: '未通过审核', 15: '停止投放', 100: '运营暂停', 101: '达到日限额暂停', 102: '余额不足暂停', 105: '达到预算暂停'};
LANG.manager_status_select = {0: '投放中', 10: '待审核', 11: '未通过', 15: '停投', 100: '运营暂停', 101: '日限额暂停', 104: '程序化日限额暂停', 102: '余额不足暂停', 105: '总预算暂停'};
LANG.relation = {1: '本广告自身', 2: '等价广告', 3: '-'};
LANG.cdn_type = {1: 'ADN', 2: 'CDN'};
LANG.keyword_type = {1: '竞品词', 2: '模糊词'}; // 关键字类型
LANG.zone_status = {0: '启用中', 1: '已暂停'}; // 媒体商广告位状态
LANG.zone_type = {0: '普通广告位', 1: '搜索广告位'}; // 媒体自营
LANG.business_type = {0: '-', 1: 'appstore', 2: '游戏', 3: '安卓', 4: '安卓大A', 5: '安卓装机'}; // 业务类型
LANG.delivery_type = {1: '应用', 2: '游戏'};
