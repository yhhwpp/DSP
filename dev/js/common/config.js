/**
 * @file config.js
 * @author hehe
 */
var domain = window.location.origin ? window.location.origin : window.location.protocol + '//' + window.location.host;
var BOS = {
    // 主题样式
    THEME: [{
        name: 'biddingos',
        css: 'default'
    }, {
        name: 'itools',
        css: 'blue'
    }],
    API_HOST: domain + '/bos-backend-api/public',
    MGMT_URI: '/bos', // 旧后台访问目录
    DOCUMENT_URI: '/bos-front/dev', // 静态页面目录
    FILE_DOMAIN: 'http://sandbox-adn.biddingos.com' // 文件服务器域名
};
var API_URL = API_URL || {};
API_URL = {
    login_url: domain + BOS.DOCUMENT_URI, // 默认登录页配置,暂用
    logout_url: domain + BOS.DOCUMENT_URI + '/site/logout.html',
    forbidden_url: domain + BOS.DOCUMENT_URI + '/forbidden.html', // 安装包上传securityKey
    file_upload: BOS.FILE_DOMAIN + '/bos-fileserver/file/upload', // 安装包上传
    file_down: BOS.FILE_DOMAIN + '/bos-fileserver/file/download_raw', // 安装包下载
    file_securityKey: 'Z9Xzx2RPBHNHmBC3', // 安装包上传securityKey

    // 公共
    captcha: BOS.API_HOST + '/site/captcha', // 获取验证码
    login: BOS.API_HOST + '/site/login', // 是否登录 判断用户是否登录
    profile: BOS.API_HOST + '/site/profile', // 修改用户资料
    profile_view: BOS.API_HOST + '/site/profile_view', // 获取用户资料
    password: BOS.API_HOST + '/site/password', // 修改用户密码
    is_login: BOS.API_HOST + '/site/is_login', // 是否登录
    logout: BOS.API_HOST + '/site/logout', // 注销
    nav: BOS.API_HOST + '/site/nav', // 左侧菜单
    notice_list: BOS.API_HOST + '/site/notice_list', // 头部消息'../data/getTopMsgList.json',
    notice_store: BOS.API_HOST + '/site/notice_store', // 删除消息status 2,阅读消息 status 1
    activity: BOS.API_HOST + '/site/activity', // 预览优惠活动
    qiniu_del_file: BOS.API_HOST + '/site/delete_file', // 七牛文件删除
    qiniu_uptoken_url: BOS.API_HOST + '/site/qiniu_token', // 获取七牛token
    qiniu_domain: 'http://7xnoye.com1.z0.glb.clouddn.com', // 七牛域名
    campaign_platform: BOS.API_HOST + '/site/platform', // 获取目标平台
    site_change: BOS.API_HOST + '/site/change', // 切换登录
    site_account_sub_type: BOS.API_HOST + '/site/account_sub_type', // 获取账号二级类型
    site_operation: BOS.API_HOST + '/site/operation', // 获取账号类型所有权限
    account_change: BOS.API_HOST + '/site/change', // 切换账户
    kind_change: BOS.API_HOST + '/site/change_kind', // 媒体模式切换

    // 广告主 -- 概览任务计划
    dashboard: BOS.API_HOST + '/advertiser/common/dashboard', // 登录后主页概况
    balance_value: BOS.API_HOST + '/advertiser/common/balance_value', // 账户余额
    stat_report: BOS.API_HOST + '/advertiser/stat/report', // 概览
    sales: BOS.API_HOST + '/advertiser/common/sales', // 销售信息 '../data/advertiser/sales.json',

    // 广告主 -- 推广
    campaign_money_limit: BOS.API_HOST + '/advertiser/campaign/money_limit', // 获取出价/日预算限制
    campaign_column_list: BOS.API_HOST + '/advertiser/campaign/column_list', // 推广页表显示字段
    campaign_list: BOS.API_HOST + '/advertiser/campaign/index', // 推广计划列表
    campaign_update: BOS.API_HOST + '/advertiser/campaign/update', // 修改推广计划字段
    campaign_view: BOS.API_HOST + '/advertiser/campaign/view', // 查看某个推广计划
    campaign_store: BOS.API_HOST + '/advertiser/campaign/store', // 增加修改推广计划列表
    campaign_delete: BOS.API_HOST + '/advertiser/campaign/delete', // 删除推广计划列表
    campaign_banner_demand: BOS.API_HOST + '/advertiser/campaign/demand', // 获取Banner、插屏广告尺寸
    campaign_product_list: BOS.API_HOST + '/advertiser/campaign/product_list', // 推广产品列表
    keywords_store: BOS.API_HOST + '/advertiser/keywords/store', // 增加修改关键字
    keywords_delete: BOS.API_HOST + '/advertiser/keywords/delete', // 删除关键字
    keywords_list: BOS.API_HOST + '/advertiser/keywords/index', // 查看关键字列表
    advertiser_campaign_app_store_view: BOS.API_HOST + '/advertiser/campaign/app_store_view', // 获取AppStore
    advertiser_campaign_revenue_type: BOS.API_HOST + '/advertiser/campaign/revenue_type', // 获取计费类型
    advertiser_campaign_product_exist: BOS.API_HOST + '/advertiser/campaign/product_exist', // 判断产品是否存在

    // 广告主 -- 账户明细
    advertiser_balance_list: BOS.API_HOST + '/advertiser/balance/balance_log', // 帐户明细
    advertiser_balance_payout: BOS.API_HOST + '/advertiser/balance/payout', // 推广金支出明细
    advertiser_balance_recharge: BOS.API_HOST + '/advertiser/balance/recharge', // 充值明细
    advertiser_balance_invoice_history: BOS.API_HOST + '/advertiser/balance/invoice_history', // 发票申请记录
    advertiser_balance_recharge_invoice: BOS.API_HOST + '/advertiser/balance/recharge_invoice', // 发票的充值明细
    advertiser_balance_invoice: BOS.API_HOST + '/advertiser/balance/invoice', // 获取发票明细
    advertiser_pay: BOS.API_HOST + '/advertiser/pay/store', // 充值金额
    invoice_store: BOS.API_HOST + '/advertiser/invoice/store', // 提交发票申请
    invoice_receiver_info: BOS.API_HOST + '/advertiser/pay/receiver_info', // 取广告主的收件信息
    advertiser_pay_activity: BOS.API_HOST + '/advertiser/pay/activity', // 充值活动

    // 广告主 -- 账号管理
    advertiser_account_store: BOS.API_HOST + '/advertiser/account/store', // 新增账号
    advertiser_account_sub_type: BOS.API_HOST + '/advertiser/account/account_sub_type', // 获取用户二级类型
    advertiser_account_list: BOS.API_HOST + '/advertiser/account/index', // 获取账户列表
    advertiser_account_update: BOS.API_HOST + '/advertiser/account/update', // 更新帐号字段
    advertiser_account_operation: BOS.API_HOST + '/advertiser/account/operation', // 获取用户权限

    // 广告主 -- 报表
    advertiser_stat_index: BOS.API_HOST + '/advertiser/stat/index',
    advertiser_stat_campaign_excel: BOS.API_HOST + '/advertiser/stat/campaign_excel', // 导出报表
    advertiser_stat_daily_campaign_excel: BOS.API_HOST + '/advertiser/stat/daily_campaign_excel', // 按广告-导出每日报表
    advertiser_stat_time_campaign_excel: BOS.API_HOST + '/advertiser/stat/time_campaign_excel', // 导出每日报表

    // 媒体商 -- 广告 广告位
    trafficker_keywords_list: BOS.API_HOST + '/trafficker/keywords/index', // 查看关键字列表
    trafficker_campaign_update: BOS.API_HOST + '/trafficker/campaign/update', // 修改媒体广告管理列表字段
    trafficker_campaign_check: BOS.API_HOST + '/trafficker/campaign/check', // 媒体商审核广告
    trafficker_campaign_category: BOS.API_HOST + '/trafficker/campaign/category', // 获取应用分类
    trafficker_campaign_rank: BOS.API_HOST + '/trafficker/campaign/rank', // 获取等级
    trafficker_campaign_status: BOS.API_HOST + '/trafficker/campaign/status', // 获取状态
    trafficker_campaign_index: BOS.API_HOST + '/trafficker/campaign/index', // 获取广告管理
    trafficker_zone_category_store: BOS.API_HOST + '/trafficker/zone/category_store', // 分类新增、修改
    trafficker_zone_category_delete: BOS.API_HOST + '/trafficker/zone/category_delete', // 删除分类
    trafficker_common_balance_value: BOS.API_HOST + '/trafficker/common/balance_value', // 媒体商收入、余额
    trafficker_zone_index: BOS.API_HOST + '/trafficker/zone/index', // 媒体商广告位列表
    trafficker_zone_check: BOS.API_HOST + '/trafficker/zone/check', // 媒体商广告位停用启用
    trafficker_zone_store: BOS.API_HOST + '/trafficker/zone/store', // 媒体商广告位新建、修改
    trafficker_module_list: BOS.API_HOST + '/trafficker/zone/module_list', // 媒体商模块列表
    trafficker_module_store: BOS.API_HOST + '/trafficker/zone/module_store', // 模块增删改
    trafficker_zone_module_delete: BOS.API_HOST + '/trafficker/zone/module_delete', // 删除模块
    trafficker_zone_ad_type: BOS.API_HOST + '/trafficker/zone/ad_type', // 媒体商支持的广告类型
    trafficker_zone_update: BOS.API_HOST + '/trafficker/zone/update', // 自营媒体修改流量分配

    // 媒体商-财务
    trafficker_balance_withdraw: BOS.API_HOST + '/trafficker/balance/withdraw', // 媒体商财务记录提款明细
    trafficker_balance_settlement: BOS.API_HOST + '/trafficker/balance/settlement', // 媒体商财务记录结算明细
    trafficker_balance_income: BOS.API_HOST + '/trafficker/balance/income', // 媒体商财务记录收入明细
    trafficker_balance_draw: BOS.API_HOST + '/trafficker/balance/draw', // 提取账户余额
    trafficker_draw_balance: BOS.API_HOST + '/trafficker/balance/draw_balance', // 获取媒体商最大可提取金额

    // 媒体商 -- 报表
    trafficker_stat_menu: BOS.API_HOST + '/trafficker/stat/menu', // 获取头部导航菜单
    trafficker_stat_column_list: BOS.API_HOST + '/trafficker/stat/column_list', // 获取表头，下拉框
    trafficker_stat_zone: BOS.API_HOST + '/trafficker/stat/zone', // 获取广告位数据
    trafficker_stat_client: BOS.API_HOST + '/trafficker/stat/client', // 获取广告数据
    trafficker_stat_campaign_excel: BOS.API_HOST + '/trafficker/stat/campaign_excel', // 导出报表
    trafficker_stat_daily_zone_excel: BOS.API_HOST + '/trafficker/stat/daily_zone_excel', // 导出每日报表 - 广告位
    trafficker_stat_daily_campaign_excel: BOS.API_HOST + '/trafficker/stat/daily_campaign_excel', // 导出每日报表 - 广告
    trafficker_stat_time_zone_excel: BOS.API_HOST + '/trafficker/stat/time_zone_excel', // 导出每日报表 - 广告位
    trafficker_stat_time_campaign_excel: BOS.API_HOST + '/trafficker/stat/time_campaign_excel', // 导出每日报表 - 广告
    trafficker_manual_import: BOS.API_HOST + '/trafficker/manual/import', // 媒体商人工导入数据
    trafficker_stat_game_report: BOS.API_HOST + '/trafficker/stat/game_report', // 媒体商游戏报表
    trafficker_stat_game_report_excel: BOS.API_HOST + '/trafficker/stat/game_report_excel', // 媒体商导出游戏报表

    // 媒体商 -- 概览
    trafficker_stat_report: BOS.API_HOST + '/trafficker/stat/report', // 获取30天收入概览
    trafficker_stat_zone_report: BOS.API_HOST + '/trafficker/stat/zone_report', // 获取广告位收入概览
    trafficker_stat_client_report: BOS.API_HOST + '/trafficker/stat/client_report', // 获取广告主消耗概览

    // 媒体商 -- 公用
    trafficker_common_sales: BOS.API_HOST + '/trafficker/common/sales', // 获取媒体商销售顾问
    trafficker_common_campaign_pending_audit: BOS.API_HOST + '/trafficker/common/campaign_pending_audit', // 获得待审批的广告数量
    trafficker_common_platform: BOS.API_HOST + '/trafficker/common/platform', // 获取媒体商平台
    common_affiliate_revenue_type: BOS.API_HOST + '/common/affiliate_revenue_type', // 获取媒体计费类型

    // house ad
    trafficker_campaign_self_index: BOS.API_HOST + '/trafficker/campaign/self_index', // 自营媒体商广告列表
    trafficker_campaign_self_check: BOS.API_HOST + '/trafficker/campaign/self_check', // 审核广告
    trafficker_campaign_self_update: BOS.API_HOST + '/trafficker/campaign/self_update', // 广告更新字段
    trafficker_campaign_zone_list: BOS.API_HOST + '/trafficker/campaign/zone_list', // 广告位加价列表
    trafficker_keyword_update: BOS.API_HOST + '/trafficker/keywords/update', // 关键字类型更新


    // 代理商-广告管理
    broker_campaign_column_list: BOS.API_HOST + '/broker/campaign/column_list', // 获取代理商广告管理标题
    broker_campaign_index: BOS.API_HOST + '/broker/campaign/index', // 获取代理商广告管理列表
    broker_keywords_list: BOS.API_HOST + '/broker/keywords/index', // 查看关键字列表
    broker_campaign_revenue: BOS.API_HOST + '/broker/campaign/revenue', // 获取出价下拉列表
    broker_campaign_day_limit: BOS.API_HOST + '/broker/campaign/day_limit', // 获取日预算下拉列表

    // 代理商-账户明细
    broker_balance_recharge: BOS.API_HOST + '/broker/balance/recharge', // 代理商充值账户明细
    broker_balance_gift: BOS.API_HOST + '/broker/balance/gift', // 代理商赠送账户明细
    broker_balance_invoice_history: BOS.API_HOST + '/broker/balance/invoice_history', // 代理商发票申请记录
    broker_balance_invoice_store: BOS.API_HOST + '/broker/balance/invoice_store', // 提交开票申请
    broker_balance_apply: BOS.API_HOST + '/broker/balance/apply', // 代理商充值账户申请明细
    broker_pay_store: BOS.API_HOST + '/broker/pay/store', // 充值金额
    broker_balance_invoice: BOS.API_HOST + '/broker/balance/invoice', // 获取发票明细

    // 代理商-广告主管理
    broker_advertiser_index: BOS.API_HOST + '/broker/advertiser/index', // 广告主列表
    broker_advertiser_update: BOS.API_HOST + '/broker/advertiser/update', // 广告主信息修改/暂停/启用
    broker_advertiser_store: BOS.API_HOST + '/broker/advertiser/store', // 广告主新建
    broker_advertiser_transfer: BOS.API_HOST + '/broker/advertiser/transfer', // 划账
    broker_advertiser_balance_value: BOS.API_HOST + '/broker/advertiser/balance_value', // 获取代理商下的广告主账户余额及代理商余额
    broker_campaign_revenue_type: BOS.API_HOST + '/broker/campaign/revenue_type', // 获取计费类型


    // 代理商 -- 公用
    broker_common_sales: BOS.API_HOST + '/broker/common/sales', // 获取代理商销售顾问
    broker_common_balance_value: BOS.API_HOST + '/broker/common/balance_value', // 代理商收入、余额

    // 代理商 -- 概览
    broker_stat_report: BOS.API_HOST + '/broker/stat/report', // 获取30天变化趋势

    // 代理商 -- 报表
    broker_stat_column_list: BOS.API_HOST + '/broker/stat/column_list', // 获取表头，下拉框
    broker_stat_index: BOS.API_HOST + '/broker/stat/index', // 获取广告位数据
    broker_stat_campaign_excel: BOS.API_HOST + '/broker/stat/campaign_excel', // 导出报表
    broker_stat_daily_campaign_excel: BOS.API_HOST + '/broker/stat/daily_campaign_excel', // 导出每日报表 - 广告
    broker_stat_time_campaign_excel: BOS.API_HOST + '/broker/stat/time_campaign_excel', // 导出报表

    // 平台 -- 公用
    manager_common_choose_package: BOS.API_HOST + '/manager/common/choose_package', // 选择渠道包
    manager_common_balance_value: BOS.API_HOST + '/manager/common/balance_value', // 平台余额
    manager_common_package_not_latest: BOS.API_HOST + '/manager/common/package_not_latest', // 非市场最新包数量
    manager_common_sales: BOS.API_HOST + '/manager/common/sales', // 获取所有销售顾问
    manager_common_campaign_pending_audit: BOS.API_HOST + '/manager/common/campaign_pending_audit', // 获取待审核广告数和待审核素材数
    manager_common_operation: BOS.API_HOST + '/manager/common/operation', // 获取所有运营顾问

    // 平台 -- 媒体商管理
    manager_trafficker_index: BOS.API_HOST + '/manager/trafficker/index', // 媒体商管理列表
    manager_trafficker_update: BOS.API_HOST + '/manager/trafficker/update', // 修改媒体商管理信息
    manager_trafficker_sales: BOS.API_HOST + '/manager/trafficker/sales', // 获取媒体销售列表
    manager_trafficker_store: BOS.API_HOST + '/manager/trafficker/store', // 新建媒体商信息
    manager_trafficker_filter: BOS.API_HOST + '/manager/trafficker/filter', // 获取筛选下拉数据

    // 平台 -- 渠道包管理
    manager_pack_index: BOS.API_HOST + '/manager/pack/index', // 渠道管理列表
    manager_pack_client_package: BOS.API_HOST + '/manager/pack/client_package', // 广告主推广计划渠道包列表
    manager_pack_update: BOS.API_HOST + '/manager/pack/update', // 修改渠道号
    manager_pack_delivery_affiliate: BOS.API_HOST + '/manager/pack/delivery_affiliate', // 获取可投放媒体
    manager_pack_upload_callback: BOS.API_HOST + '/manager/pack/upload_callback', // 上传包回调接口


    // 平台 -- 广告管理
    manager_campaign_index: BOS.API_HOST + '/manager/campaign/index', // 广告管理列表
    manager_campaign_update: BOS.API_HOST + '/manager/campaign/update', // 修改广告信息
    manager_campaign_check: BOS.API_HOST + '/manager/campaign/check', // 修改操作
    manager_campaign_info: BOS.API_HOST + '/manager/campaign/info', // 修改操作
    manager_campaign_revenue: BOS.API_HOST + '/manager/campaign/revenue', // 获取所有出价
    manager_campaign_day_limit: BOS.API_HOST + '/manager/campaign/day_limit', // 获取所有日限额
    manager_campaign_revenue_history: BOS.API_HOST + '/manager/campaign/revenue_history', // 获取广告历史出价

    manager_banner_affiliate: BOS.API_HOST + '/manager/banner/affiliate', // 媒体设定-媒体商列表
    manager_banner_affiliate_update: BOS.API_HOST + '/manager/banner/affiliate_update', // 媒体设定-媒体商信息修改
    manager_banner_revenue_type: BOS.API_HOST + '/manager/banner/revenue_type', // 媒体设定-获取媒体商计费类型
    manager_banner_rank: BOS.API_HOST + '/manager/banner/rank', // 媒体设定-获取媒体商级别
    manager_banner_category: BOS.API_HOST + '/manager/banner/category', // 媒体设定-获取媒体商类别
    manager_banner_app_search: BOS.API_HOST + '/manager/banner/app_search', // 媒体设定-appid 查询
    manager_banner_app_update: BOS.API_HOST + '/manager/banner/app_update', // 媒体设定-appid 更新
    manager_banner_release: BOS.API_HOST + '/manager/banner/release', // 媒体设定-操作投放/取消/暂停/启用
    manager_banner_client_package: BOS.API_HOST + '/manager/banner/client_package', // 媒体设定-平台设定-修改媒体商信息

    manager_campaign_client_list: BOS.API_HOST + '/manager/campaign/client_list', // 获取CPA/CPT广告主列表
    manager_campaign_product_list: BOS.API_HOST + '/manager/campaign/product_list', // 获取CPA/CPT推广产品列表
    manager_campaign_store: BOS.API_HOST + '/manager/campaign/store', // 创建CPA/CPT广告
    manager_campaign_equivalence_list: BOS.API_HOST + '/manager/campaign/equivalence_list', // 等价广告管理
    manager_campaign_equivalence: BOS.API_HOST + '/manager/campaign/equivalence', // 建立 删除等价广告

    manager_common_log_index: BOS.API_HOST + '/manager/common/log_index', // 推广计划日志列表
    manager_common_log_store: BOS.API_HOST + '/manager/common/log_store', // 增加人为备忘录

    manager_campaign_consume: BOS.API_HOST + '/manager/campaign/consume', // 获取消耗数据

    manager_keyword_index: BOS.API_HOST + '/manager/keyword/index', // 关键字获取
    manager_keyword_store: BOS.API_HOST + '/manager/keyword/store', // 增加修改关键字
    manager_keyword_delete: BOS.API_HOST + '/manager/keyword/delete', // 删除关键字
    manager_campaign_word_list: BOS.API_HOST + '/manager/campaign/word_list', // word2vec获取
    manager_campaign_word_modify: BOS.API_HOST + '/manager/campaign/word_modify', // word2vec修改
    manager_campaign_word_delete: BOS.API_HOST + '/manager/campaign/word_delete', // word2vec delete
    manager_campaign_word_new: BOS.API_HOST + '/manager/campaign/word_new', // word2vec 新建
    manager_campaign_trend: BOS.API_HOST + '/manager/campaign/trend', // 广告30消耗趋势
    manager_banner_trend: BOS.API_HOST + '/manager/banner/trend', // 广告30消耗趋势

    // 平台 -- 素材更新管理
    manager_material_index: BOS.API_HOST + '/manager/material/index', // 素材更新列表
    manager_material_check: BOS.API_HOST + '/manager/material/check', // 素材更新列表

    // 平台 -- 广告主管理
    manager_advertiser_index: BOS.API_HOST + '/manager/advertiser/index', // 广告主账号列表
    manager_advertiser_update: BOS.API_HOST + '/manager/advertiser/update', // 广告主账号更新
    manager_advertiser_store: BOS.API_HOST + '/manager/advertiser/store', // 广告主创建账号
    manager_advertiser_recharge_apply: BOS.API_HOST + '/manager/advertiser/recharge_apply', // 广告主充值申请
    manager_advertiser_recharge_detail: BOS.API_HOST + '/manager/advertiser/recharge_detail', // 广告主充值明细
    manager_advertiser_recharge_history: BOS.API_HOST + '/manager/advertiser/recharge_history', // 历史账号
    manager_advertiser_gift_apply: BOS.API_HOST + '/manager/advertiser/gift_apply', // 赠送申请
    manager_advertiser_gift_detail: BOS.API_HOST + '/manager/advertiser/gift_detail', // 赠送明细
    manager_advertiser_filter: BOS.API_HOST + '/manager/advertiser/filter', // 获取筛选下拉数据

    // 平台 -- 代理商管理
    manager_broker_index: BOS.API_HOST + '/manager/broker/index', // 代理商账号列表
    manager_broker_update: BOS.API_HOST + '/manager/broker/update', // 代理商账号更新
    manager_broker_store: BOS.API_HOST + '/manager/broker/store', // 代理商创建账号
    manager_broker_recharge_apply: BOS.API_HOST + '/manager/broker/recharge_apply', // 代理商充值申请
    manager_broker_recharge_detail: BOS.API_HOST + '/manager/broker/recharge_detail', // 代理商充值明细
    manager_broker_recharge_history: BOS.API_HOST + '/manager/broker/recharge_history', // 历史账号
    manager_broker_gift_apply: BOS.API_HOST + '/manager/broker/gift_apply', // 赠送申请
    manager_broker_gift_detail: BOS.API_HOST + '/manager/broker/gift_detail', // 赠送明细
    manager_broker_filter: BOS.API_HOST + '/manager/broker/filter', // 获取筛选下拉数据

    // 平台 -- 账号管理
    manager_account_index: BOS.API_HOST + '/manager/account/index', // 账号列表
    manager_account_update: BOS.API_HOST + '/manager/account/update', // 账号更新
    manager_account_store: BOS.API_HOST + '/manager/account/store', // 创建账号

    // 平台 -- 审计管理
    manager_audit_trafficker_index: BOS.API_HOST + '/manager/audit/trafficker_index', // 媒体商数据审计列表
    manager_audit_trafficker_export: BOS.API_HOST + '/manager/audit/trafficker_export', // 导出明细
    manager_audit_trafficker_import: BOS.API_HOST + '/manager/audit/trafficker_import', // 导入明细
    manager_audit_trafficker_update: BOS.API_HOST + '/manager/audit/trafficker_update', // 明细更新
    manager_audit_advertiser_index: BOS.API_HOST + '/manager/audit/advertiser_index', // 广告主数据审计列表
    manager_audit_advertiser_update: BOS.API_HOST + '/manager/audit/advertiser_update', // 广告主数据审计更新
    manager_audit_advertiser_update_batch: BOS.API_HOST + '/manager/audit/advertiser_update_batch', // 广告主数据审计批量更新
    manager_audit_advertiser_delivery: BOS.API_HOST + '/manager/audit/advertiser_delivery', // 查看广告主投放数据
    manager_audit_expense_data: BOS.API_HOST + '/manager/audit/expense_data', // 获取媒体商审计数据
    manager_audit_pass: BOS.API_HOST + '/manager/audit/pass', // 媒体商审计审核

    // 平台 -- 账务管理
    manager_balance_trafficker_index: BOS.API_HOST + '/manager/balance/trafficker_index', // 媒体商数据审计列表
    manager_balance_trafficker_export: BOS.API_HOST + '/manager/balance/trafficker_export', // 导出明细
    manager_balance_trafficker_import: BOS.API_HOST + '/manager/balance/trafficker_import', // 导入明细
    manager_balance_trafficker_update: BOS.API_HOST + '/manager/balance/trafficker_update', // 明细更新
    manager_balance_recharge_index: BOS.API_HOST + '/manager/balance/recharge_index', // 广告主代理商/充值申请列表
    manager_balance_recharge_update: BOS.API_HOST + '/manager/balance/recharge_update', // 广告主代理商/充值更新
    manager_balance_invoice_index: BOS.API_HOST + '/manager/balance/invoice_index', // 广告主代理商/发票申请列表
    manager_balance_invoice_update: BOS.API_HOST + '/manager/balance/invoice_update', // 广告主/代理商发票更新
    manager_balance_invoice_detail: BOS.API_HOST + '/manager/balance/invoice_detail', // 广告主/代理商发票明细
    manager_balance_gift_index: BOS.API_HOST + '/manager/balance/gift_index', // 广告主代理商/赠送申请列表
    manager_balance_gift_update: BOS.API_HOST + '/manager/balance/gift_update', // 广告主/代理商赠送更新
    manager_balance_withdrawal_index: BOS.API_HOST + '/manager/balance/withdrawal_index', // 媒体提款申请列表
    manager_balance_withdrawal_update: BOS.API_HOST + '/manager/balance/withdrawal_update', // 媒体提款更新
    manager_balance_income_index: BOS.API_HOST + '/manager/balance/income_index', // 收支明细列表

    // 平台 -- 统计报表
    manager_stat_zone: BOS.API_HOST + '/manager/stat/zone', // 媒体商收入报表
    manager_stat_zone_affiliate: BOS.API_HOST + '/manager/stat/zone_affiliate', // 媒体商收入报表 - 广告位
    manager_stat_client: BOS.API_HOST + '/manager/stat/client', // 广告主收入报表
    manager_stat_client_campaign: BOS.API_HOST + '/manager/stat/client_campaign', // 广告主收入报表 - 计划

    manager_stat_zone_excel: BOS.API_HOST + '/manager/stat/zone_excel', // 导出报表-媒体商
    manager_stat_zone_daily_excel: BOS.API_HOST + '/manager/stat/zone_daily_excel', // 导出每日报表-媒体商

    manager_stat_client_excel: BOS.API_HOST + '/manager/stat/client_excel', // 导出报表-广告主
    manager_stat_client_daily_excel: BOS.API_HOST + '/manager/stat/client_daily_excel', // 导出每日报表-广告主

    manager_stat_adx_report: BOS.API_HOST + '/manager/stat/adx_report', // adx报表
    manager_stat_game_report: BOS.API_HOST + '/manager/stat/game_report', // 游戏报表
    manager_stat_game_report_excel: BOS.API_HOST + '/manager/stat/game_report_excel', // 导出游戏报表

    // 平台 -- 概览
    manager_stat_index: BOS.API_HOST + '/manager/stat/index', // 获取昨日概览
    manager_stat_trend: BOS.API_HOST + '/manager/stat/trend', // 获取30/7天变化趋势
    manager_stat_rank: BOS.API_HOST + '/manager/stat/rank', // 获取收入分布排行
    manager_stat_trafficker_trend: BOS.API_HOST + '/manager/stat/trafficker_trend', // 媒介概览30/7天趋势
    manager_stat_sale_trend: BOS.API_HOST + '/manager/stat/sale_trend', // 销售概览30/7天趋势
    manager_stat_sale_rank: BOS.API_HOST + '/manager/stat/sale_rank', // 获取收入分布排行
    manager_stat_trafficker_daily: BOS.API_HOST + '/manager/stat/trafficker_daily', // 日新增
    manager_stat_trafficker_week_retain: BOS.API_HOST + '/manager/stat/trafficker_week_retain', // 七日留存
    manager_stat_trafficker_month: BOS.API_HOST + '/manager/stat/trafficker_month', // 月活/月新增

    // 平台 -- 活动与通知
    manager_activity_index: BOS.API_HOST + '/manager/activity/index', // 获取活动列表
    manager_activity_deal: BOS.API_HOST + '/manager/activity/deal', // 发布或下线活动
    manager_activity_store: BOS.API_HOST + '/manager/activity/store', // 新建或更新活动
    manager_activity_get: BOS.API_HOST + '/manager/activity/get', // 获取单个活动信息
    manager_activity_report_list: BOS.API_HOST + '/manager/activity/report_list', // 日报/周报
    manager_activity_account_list: BOS.API_HOST + '/manager/activity/account_list', // 邮件账户列表
    manager_activity_update_mail_receiver: BOS.API_HOST + '/manager/activity/update_mail_receiver', // 勾选/取消日报邮件发送
    manager_activity_pause_send_mail: BOS.API_HOST + '/manager/activity/pause_send_mail', // 暂停邮件发送
    manager_activity_resend_mail: BOS.API_HOST + '/manager/activity/resend_mail', // 重发日报邮件


    manager_notice_index: BOS.API_HOST + '/manager/notice/index', // 获取站内信列表
    manager_notice_store: BOS.API_HOST + '/manager/notice/store', // 发送站内信
    manager_notice_email_index: BOS.API_HOST + '/manager/notice/email_index', // 获取email列表
    manager_notice_email_delete: BOS.API_HOST + '/manager/notice/email_delete', // 删除邮件
    manager_notice_email_store: BOS.API_HOST + '/manager/notice/email_store', // 发送或保存草稿
    manager_notice_email_client: BOS.API_HOST + '/manager/notice/email_client', // 获取广告主列表
    manager_stat_manual_data: BOS.API_HOST + '/manager/stat/manual_data', // 媒体商查看人工数据
    manager_stat_manual_import: BOS.API_HOST + '/manager/stat/manual_import', // 媒体商查看人工数据
    manager_stat_client_data: BOS.API_HOST + '/manager/stat/client_data', // 查看广告主结算数据
    manager_stat_product: BOS.API_HOST + '/manager/stat/product', // 查看广告主结算数据-产品
    manager_stat_campaign: BOS.API_HOST + '/manager/stat/campaign', // 查看广告主结算数据-产品
    manager_stat_client_import: BOS.API_HOST + '/manager/stat/client_import', // 导入广告主结算数据


    manager_setting_index: BOS.API_HOST + '/manager/setting/index', // 配置列表
    manager_setting_store: BOS.API_HOST + '/manager/setting/store', // 保存配置

    // admin
    admin_withdrawal_index: BOS.API_HOST + '/admin/withdrawal/index', // 获取广告主列表
    admin_agency_index: BOS.API_HOST + '/admin/agency/index', // 账号列表

    /* HouseAd广告主*/
    advertiser_campaign_app_list: BOS.API_HOST + '/advertiser/campaign/app_list', // 获取应用列表
    advertiser_campaign_self_store: BOS.API_HOST + '/advertiser/campaign/self_store', // 保存应用信息
    advertiser_campaign_self_view: BOS.API_HOST + '/advertiser/campaign/self_view', // 查看推广计划
    advertiser_campaign_update: BOS.API_HOST + '/advertiser/campaign/update', // 广告主暂停，继续广告
    advertiser_zone_index: BOS.API_HOST + '/advertiser/zone/index', // 获取广告位加价列表
    advertiser_stat_self_index: BOS.API_HOST + '/advertiser/stat/self_index', // 报表
    advertiser_stat_self_zone_excel: BOS.API_HOST + '/advertiser/stat/self_zone_excel', // 导出报表
    advertiser_balance_self_recharge: BOS.API_HOST + '/advertiser/balance/self_recharge', // 自营广告主-充值/赠送
    advertiser_stat_self_report: BOS.API_HOST + '/advertiser/stat/self_report', // 广告主概览

    // 媒体运营 - 概览
    trafficker_stat_self_index: BOS.API_HOST + '/trafficker/stat/self_index', // 自营媒体-概览
    trafficker_stat_self_trend: BOS.API_HOST + '/trafficker/stat/self_trend', // 自营媒体-趋势
    trafficker_balance_recharge_index: BOS.API_HOST + '/trafficker/balance/recharge_index', // 自营媒体-手动充值
    trafficker_balance_recharge_update: BOS.API_HOST + '/trafficker/balance/recharge_update', // 自营媒体-手动充值 更新
    trafficker_balance_gift_index: BOS.API_HOST + '/trafficker/balance/gift_index', // 自营媒体-赠送明细
    trafficker_balance_gift_update: BOS.API_HOST + '/trafficker/balance/gift_update', // // 自营媒体-赠送明细 更新
    trafficker_common_balance_pending_audit: BOS.API_HOST + '/trafficker/common/balance_pending_audit', // 自营媒体-财务管理待审核数

    // 媒体运营 - 帐号管理
    trafficker_account_index: BOS.API_HOST + '/trafficker/account/index', // 帐号列表
    trafficker_account_store: BOS.API_HOST + '/trafficker/account/store', // 新建/修改帐号
    trafficker_account_update: BOS.API_HOST + '/trafficker/account/update', // 更新帐号某个字段
    trafficker_account_delete: BOS.API_HOST + '/trafficker/account/delete', // 更新帐号某个字段
    trafficker_role_index: BOS.API_HOST + '/trafficker/role/index', // 媒体自营-角色权限获取
    trafficker_role_operation_list: BOS.API_HOST + '/trafficker/role/operation_list', // 权限列表
    trafficker_role_store: BOS.API_HOST + '/trafficker/role/store', // 媒体自营-角色添加修改

    // 媒体运营 - 报表
    trafficker_stat_self_zone: BOS.API_HOST + '/trafficker/stat/self_zone', // 报表
    trafficker_stat_self_zone_excel: BOS.API_HOST + '/trafficker/stat/self_zone_excel', // 报表

    // 媒体运营 - 广告主管理
    trafficker_advertiser_index: BOS.API_HOST + '/trafficker/advertiser/index', // 广告主列表
    trafficker_advertiser_update: BOS.API_HOST + '/trafficker/advertiser/update', // 广告主更新
    trafficker_advertiser_store: BOS.API_HOST + '/trafficker/advertiser/store', // 新建广告主
    trafficker_advertiser_recharge_apply: BOS.API_HOST + '/trafficker/advertiser/recharge_apply', // 广告主充值申请
    trafficker_advertiser_recharge_detail: BOS.API_HOST + '/trafficker/advertiser/recharge_detail', // 广告主充值明细
    trafficker_advertiser_recharge_history: BOS.API_HOST + '/trafficker/advertiser/recharge_history', // 历史账号
    trafficker_advertiser_gift_apply: BOS.API_HOST + '/trafficker/advertiser/gift_apply', // 赠送申请
    trafficker_advertiser_gift_detail: BOS.API_HOST + '/trafficker/advertiser/gift_detail', // 赠送明细
    trafficker_advertiser_sales: BOS.API_HOST + '/trafficker/advertiser/sales', // 获取销售顾问

    trafficker_broker_index: BOS.API_HOST + '/trafficker/broker/index', // 代理商
    trafficker_broker_update: BOS.API_HOST + '/trafficker/broker/update', // 代理商更新
    trafficker_broker_store: BOS.API_HOST + '/trafficker/broker/store', // 新建代理商
    trafficker_broker_recharge_apply: BOS.API_HOST + '/trafficker/broker/recharge_apply', // 代理商充值申请
    trafficker_broker_recharge_detail: BOS.API_HOST + '/trafficker/broker/recharge_detail', // 代理商充值明细
    trafficker_broker_recharge_history: BOS.API_HOST + '/trafficker/broker/recharge_history', // 历史账号
    trafficker_broker_gift_apply: BOS.API_HOST + '/trafficker/broker/gift_apply', // 赠送申请
    trafficker_broker_gift_detail: BOS.API_HOST + '/trafficker/broker/gift_detail', // 赠送明细

    manager_game_index: BOS.API_HOST + '/manager/game/index', // 游戏录数列表
    manager_game_game_store: BOS.API_HOST + '/manager/game/game_store', // 新增游戏
    manager_game_client_list: BOS.API_HOST + '/manager/game/client_list', // 获取游戏的广告主
    manager_game_game_index: BOS.API_HOST + '/manager/game/game_index', // 获取广告主的游戏

    manager_game_import: BOS.API_HOST + '/manager/game/game_import', // 批量导入游戏
    manager_game_affiliate_list: BOS.API_HOST + '/manager/game/affiliate_list', // 获取渠道列表
    manager_game_store: BOS.API_HOST + '/manager/game/store', // 新增/修改游戏
    manager_game_filter: BOS.API_HOST + '/manager/game/filter', // 筛选
    manager_game_delete: BOS.API_HOST + '/manager/game/delete', // 筛选

    _end: null // 结尾符，无意义
};

var OPERATION_LIST = OPERATION_LIST || {};
OPERATION_LIST = {
    // 公用 -- 权限
    profile: '-profile', // 修改资料
    password: '-password', // 修改密码
    message: '-message', // 通知消息
    balance: '-balance', // 账户明细（包括右上角的帐号余额）

    // 广告主 -- 权限
    advertiser_campaign: ',advertiser-campaign,', // 我的推广
    advertiser_stat: ',advertiser-stat,', // 统计报表
    advertiser_account: ',advertiser-account,', // 账号管理

    // 媒体商 -- 权限
    trafficker_campaign: ',trafficker-campaign,', // 广告管理
    trafficker_stat: ',trafficker-stat,', // 统计报表
    trafficker_zone: ',trafficker-zone,', // 广告位管理
    trafficker_sdk: ',trafficker-sdk,', // sdk下载
    trafficker_advertiser: ',trafficker-advertiser', // 广告主管理
    trafficker_balance: ',trafficker-balance', // 财务管理

    // 代理商 -- 权限
    broker_advertiser: ',broker-advertiser,', // 广告主管理
    broker_campaign: ',broker-campaign,', // 广告管理
    broker_stat: ',broker-stat,', // 统计报表

    // 平台-权限
    manager_home: ',manager-home,', // 媒介概览
    manager_trafficker_overview: ',manager-trafficker-overview,', // 媒介概览
    manager_sale_overview: ',manager-sale-overview,', // 销售概览

    manager_campaign: ',manager-campaign,', // 广告管理
    manager_advertiser: ',manager-advertiser,', // 广告主管理
    manager_broker: ',manager-broker,', // 代理商管理
    manager_trafficker: ',manager-trafficker,', // 媒体商管理
    manager_stat: ',manager-stat,', // 统计报表
    manager_audit: ',manager-audit,', // 审计管理
    manager_package: ',manager-package,', // 渠道包管理
    manager_account: ',manager-account,', // 账号管理
    manager_sdk: ',manager-sdk,', // sdk下载
    manager_stats_income_trafficker: ',manager-stats-income-trafficker,', // 收入报表-媒体商
    manager_stats_income_client: ',manager-stats-income-client,', // 收入报表-广告主
    manager_stats_audit_trafficker: ',manager-stats-audit-trafficker,', // 审计收入-媒体商
    manager_stats_audit_client: ',manager-stats-audit-client,', // 审计收入-广告主
    manager_trafficker_audit: ',manager-trafficker-audit,', // 媒体商数据审计管理
    manager_audit_check: ',manager-audit_check,', // 媒体商数据审计审核
    manager_client_audit: ',manager-client_audit,', // 广告主数据审计管理
    manager_client_audit_check: ',manager-client_audit-check,', // 广告主数据审计审核

    manager_add_delivery_data: ',manager-add_delivery_data,', // 人工投放，添加数据
    manager_add_client_data: ',manager-add_client_data,', // 添加广告主结算数据

    manager_sum_views: ',manager-sum_views,', // 数据-展示量
    manager_sum_cpc_clicks: ',manager-sum_cpc_clicks,', // 数据-点击量
    manager_sum_download_requests: ',manager-sum_download_requests,', // 数据-下载请求(监控)
    manager_sum_download_complete: ',manager-sum_download_complete,', // 数据-下载完成(监控)
    manager_sum_clicks: ',manager-sum_clicks,', // 数据-下载量（上报）
    manager_ctr: ',manager-ctr,', // 数据-下载转化率
    manager_cpc_ctr: ',manager-cpc_ctr,', // 数据-点击转化率
    manager_sum_revenue: ',manager-sum_revenue,', // 数据-广告主消耗（充值金）
    manager_sum_revenue_gift: ',manager-sum_revenue_gift,', // 数据-广告主消耗（赠送金）
    manager_sum_payment: ',manager-sum_payment,', // 数据-媒体支出（充值金）
    manager_sum_payment_gift: ',manager-sum_payment_gift,', // 数据-媒体支出（赠送金）
    manager_cpd: ',manager-cpd,', // 数据-平均单价(广告主)
    manager_media_cpd: ',manager-media_cpd,', // 数据-平均单价(媒体商)
    manager_ecpm: ',manager-ecpm,', // 数据-eCPM
    manager_sum_cpa: ',manager-sum_cpa,', // 数据-转化量
    manager_sum_consum: ',manager-sum_consum,', // 数据-广告主结算金额
    manager_sum_revenue_client: ',manager-sum_revenue_client,', // 数据-广告主消耗（总数）
    manager_sum_payment_trafficker: ',manager-sum_payment_trafficker,', // 数据-媒体支出（总数）
    manager_profit: ',manager-profit,', // 数据-毛利
    manager_profit_rate: ',manager-profit_rate,', // 数据-毛利率


    manager_mail_report_view: 'manager-mail-report-view', // 日报
    manager_weekly_report_view: 'manager-weekly-report-view', // 月报
    manager_setting: 'manager-setting', // 月报

    manager_game: 'manager-game', // 游戏
    manager_game_stat: 'manager-game-stat', // 游戏报表
    manager_game_input: 'manager-game-input', // 游戏录数

    // House Ad
    // 媒体商 -- 权限
    trafficker_self_campaign: ',trafficker-self-campaign,', // 广告管理
    trafficker_self_stat: ',trafficker-self-stat,', // 统计报表
    trafficker_self_zone: ',trafficker-self-zone,', // 广告位管理
    trafficker_self_account: ',trafficker-self-account,', // 帐号管理
    trafficker_self_advertiser: ',trafficker-self-advertiser', // 广告主管理
    trafficker_self_overview: ',trafficker-self-overview,', // 概览
    trafficker_self_balance: ',trafficker-self-balance,', // 财务管理

    _end: null // 结尾符，无意义
};
