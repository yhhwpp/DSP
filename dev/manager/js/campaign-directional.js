/**
 * @file campaign-directional.js
 * @author xiaokl
 */
 /* eslint no-undef: [0]*/
 /* eslint no-unused-vars: [0]*/
 /* eslint no-loop-func: [0]*/
 /* eslint max-nested-callbacks: [0]*/
var CampaignDirectional = (function ($) {
    var CampaignDirectional = function () {};
    CampaignDirectional.prototype = {
        fnSetTime: function (parentVal) {
            var timesObj = $('input[name=time][data-group=' + parentVal + ']');
            var timesObjNum = timesObj.length;
            var checkedTimesNum = timesObj.filter(':checked').length;
            if (checkedTimesNum === timesObjNum) {
                $('input[name=times_classify][value=' + parentVal + ']').prop({
                    checked: true,
                    indeterminate: false
                });
            }
            else {
                if (checkedTimesNum === 0) {
                    $('input[name=times_classify][value=' + parentVal + ']').prop({
                        checked: false,
                        indeterminate: false
                    });
                }
                else {
                    $('input[name=times_classify][value=' + parentVal + ']').prop({
                        checked: false,
                        indeterminate: true
                    });
                }
            }
        },
        fnInit: function (oData) {
            var self = this;
            var initVal = {
                gender: ['1', '2'],
                age: '10,50',
                carrier: [],
                connectiontype: [],
                make: [],
                imei_imp: '0',
                imei_price: [],
                time: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
                city: [],
                interest: 'ALL'
            };
            $('#directional-campaignid').val(oData.campaignid);
            if (oData.condition) {
                initVal = $.extend({}, initVal, JSON.parse(oData.condition));
            }
            $('#js-directional-delivery').html(doT.template($('#tpl-directional-delivery').text())(initVal));
            if ($.inArray(oData.platform, CONSTANT.platform_ios) > -1 || oData.platform === 7 || oData.platform === 3) {
                $('#js-os-android').hide();
            }
            else if ($.inArray(oData.platform, CONSTANT.platform_android) > -1) {
                $('#js-os-ios').hide();
            }
            $('.region-select-data').html($.tmpl('#tpl-city-select', cityJson));
            $('#region-select').cityslect();
            var ageSlider = $('#age').slider({});
            ageSlider.on('change', function (sliderEvt) {
                if ($(this).val() === '10,50') {
                    $('#js-classify-age-text').html('不限');
                }
                else {
                    $('#js-classify-age-text').html($(this).val());
                }
            });
            var frequencySlider = $('#frequency').slider();
            frequencySlider.on('change', function (sliderEvt) {
                if ($(this).val() === '0') {
                    $('#js-classify-frequency-text').html('不限');
                }
                else {
                    $('#js-classify-frequency-text').html($(this).val());
                }
            });
            if (initVal.city && initVal.city.length > 0) {
                var provinceJson = {};
                $('input[name=region-group][value=1]').prop('checked', true);
                for (var i = 0; i < initVal.city.length; i++) {
                    var cityObj = $('input[name=city][value=' + initVal.city[i] + ']');
                    if (cityObj.attr('data-province')) {
                        cityObj.prop('checked', true);
                        provinceJson[cityObj.attr('data-province')] = true;
                    }
                    else {
                        $('input[name=province][value=' + initVal.city[i] + ']').prop('checked', true);
                    }
                }
                for (province in provinceJson) {
                    var cityObj2 = $('input[name=city][data-province=' + province + ']');
                    var cityNum = cityObj2.length;
                    var cityCheckedNum = cityObj2.filter(':checked').length;
                    if (cityNum === cityCheckedNum) {
                        $('input[name=province][value=' + province + ']').prop('checked', true);
                    }
                    else {
                        $('input[name=province][value=' + province + ']').prop('indeterminate', true);
                    }
                }
                $('#region-select-confirm').trigger('click');
            }
            else {
                $('input[name=region-group][value=0]').prop('checked', true);
                $('.region-select-data').hide();
            }
            $('input[name=times_classify]').prop('indeterminate', false);
            $('input[name=interest_classify]').prop('indeterminate', false);
            $.each([1, 2, 3, 4], function (index, key) {
                self.fnSetTime(key);
            });
            if ($.isArray(initVal.interest) && initVal.interest.length > 0) {
                $('input[name=interest_classify]').prop('indeterminate', true);
            }
        },
        fnInitHandle: function () {
            var self = this;
            $('#modal-directional-delivery').delegate('#js-modify-directional', 'click', function () {
                var condition = {};
                var gender = [];
                $('input[name=gender]').filter(':checked').each(function () {
                    gender.push($(this).val());
                });
                condition.gender = gender;
                condition.age = $('#age').val();
                var valAry = ['carrier', 'connectiontype', 'make', 'imei_price', 'time'];
                $.each(valAry, function (index, key) {
                    var result = [];
                    $('input[name=' + key + ']').filter(':checked').each(function () {
                        result.push($(this).val());
                    });
                    condition[key] = result;
                });
                condition.imei_imp = $('#frequency').val() !== '0' ? $('#frequency').val() : '';
                var city = [];
                if ($('input[name=region-group]:checked').val() === '1') {
                    var $slected = $('.region-select-content').find('.postclass:checked');
                    $.each($slected, function (index, el) {
                        city.push($slected[index].getAttribute('data-name'));
                    });
                }
                condition.city = city;
                var interest = '';
                if ($('input[name=interest_classify]').is(':checked')) {
                    interest = 'ALL';
                }
                else {
                    interest = [];
                    $('input[name=interest]:checked').each(function () {
                        interest.push($(this).val());
                    });
                }
                condition.interest = interest;
                // 操作系统
                var os = {};
                $('input[name=os]').each(function () {
                    os[$(this).val()] = $('select[name=os_version_' + $(this).val().toLowerCase() + ']').val();
                });
                condition.os = os;
                $.post(API_URL.manager_campaign_update, {campaignid: $('#directional-campaignid').val(), field: 'condition', value: JSON.stringify(condition)}, function (json) {
                    $('#modal-directional-delivery').modal('hide');
                    if (json && json.res === 0) {
                        window.dataTable.reload(null, false);
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                });
            });
            $('#js-directional-delivery').delegate('input[data-handle="choose-radio"]', 'click', function () {
                $('input[name=' + $(this).attr('name').replace('-radio', '') + ']').prop('checked', false);
            });
            $('#js-directional-delivery').delegate('input[data-handle=choose]', 'click', function () {
                var attrName = $(this).attr('name');
                if ($('input[name=' + attrName + ']').filter(':checked').length === 0) {
                    $('input[name=' + attrName + '-radio]').prop('checked', true);
                }
                else {
                    $('input[name=' + attrName + '-radio]').prop('checked', false);
                }
            });
            $('#js-directional-delivery').delegate('input[name=times_classify]', 'click', function () {
                if ($(this).prop('checked')) {
                    $('input[data-group=' + $(this).val() + ']').prop('checked', true);
                }
                else {
                    $('input[data-group=' + $(this).val() + ']').prop('checked', false);
                }
            });
            $('#js-directional-delivery').delegate('input[name=time]', 'click', function () {
                self.fnSetTime($(this).attr('data-group'));
            });
            $('#js-directional-delivery').delegate('input[name=interest_classify]', 'click', function () {
                $('input[name=interest]').prop('checked', $(this).prop('checked'));
            });
            $('#js-directional-delivery').delegate('input[name=interest]', 'click', function () {
                var interestNum = $('input[name=interest]:checked').length;
                if ($('input[name=interest]').length === interestNum) {
                    $('input[name=interest_classify]').prop({
                        checked: true,
                        indeterminate: false
                    });
                }
                else {
                    if (interestNum === 0) {
                        $('input[name=interest_classify]').prop({
                            checked: false,
                            indeterminate: false
                        });
                    }
                    else {
                        $('input[name=interest_classify]').prop({
                            checked: false,
                            indeterminate: true
                        });
                    }
                }
            });
        }
    };
    return new CampaignDirectional();
})(window.jQuery);
