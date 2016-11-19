function userGain() {
	var gain = $('#userGain');
	gain.wrap('<div class="gain-items"></div>').css('z-index', 9);
	setTimeout(function() {
		gain.animate({
			top: -290,
			right: -30
		}, 400).animate({
			top: -360,
			right: -30
		}, 400)
	}, 400)
};

function showPer() {
	var tar = $('.progre');
	tar.each(function() {
		var self = $(this);
		var per = self.find('.per');
		var div = per.find('div');
		var num = parseInt(per.attr('data-rel'));
		var interval;
		var count = 0;
		if (num == 100) {
			count = 100
		};
		var plus = function() {
				div.css({
					width: count + '%'
				});
				if (count == num || count == 100) {
					clearInterval(interval)
				};
				count++
			};
		interval = setInterval(plus, 5)
	})
};

function slideSwitch() {
	var stay = 5,
		fade = 0.7,
		msec = 1000,
		timer = 400,
		timeout, prev = next = 0,
		slider = $('#slider'),
		autoPlay = true,
		slideindex = true,
		controls = false,
		html = '',
		term = slider.children('li'),
		len = term.length;
	slider.wrap('<div class="slider-items"></div>');
	if (slideindex) {
		if (len > 1) {
			html += '<div class="slider-index">';
			html += '<ol class="items">';
			for (var i = 1; i <= len; i++) {
				html += '<li ' + (i == 1 ? 'class="current"' : '') + '>' + i + '</li>'
			};
			html += '</ol>';
			html += '</div>'
		}
	};
	if (controls) {
		html += '<div class="slider-updown">';
		html += '<a href="#" class="button prev" data-rel="prev">prev</a>';
		html += '<a href="#" class="button next" data-rel="next">next</a>';
		html += '</div>'
	};
	slider.parent('.slider-items').wrap('<div class="slider-wrap"></div>').css({
		'position': 'relative',
		'overflow': 'hidden'
	}).after(html);
	var thumbCont = slider.parent().siblings('.slider-index');
	var thumb = thumbCont.find('li');
	var button = slider.parent().siblings('.slider-updown');
	slider.fadeIn();
	if (len == 1) {
		term.first().fadeIn()
	};
	if (!autoPlay) {
		term.first().fadeIn()
	};
	button.find('.button').bind('click', function() {
		var self = $(this).attr('data-rel');
		if (self == 'prev') {
			if (prev == 0) {
				next = len - 1
			} else {
				next = prev - 1
			}
		} else if (self == 'next') {
			if (prev == len - 1) {
				next = 0
			} else {
				next = prev + 1
			}
		};
		if (autoPlay) {
			changeAutoPlay()
		}
		return false
	});
	thumb.bind('click', function() {
		next = thumb.index($(this));
		clearTimeout(timeout);
		changePlay(next);
		if (next == len - 1) {
			next = 0
		} else {
			next++
		}
	});
	slider.hover(function() {
		clearTimeout(timeout)
	}, function() {
		if (autoPlay) {
			if (len > 1) {
				timeout = setTimeout(changeAutoPlay, stay * msec)
			}
		}
	});
	var changePlay = function(next) {
			term.eq(prev).fadeOut(fade * msec);
			term.eq(next).fadeIn(fade * msec);
			thumb.removeClass('current');
			thumb.eq(next).addClass('current');
			if (typeof($('#userGain')[0]) != '') {
				$('#userGain').find('.opacity').css({
					opacity: term.eq(next).attr('data-opacity')
				})
			};
			prev = next
		};
	var changeAutoPlay = function() {
			clearTimeout(timeout);
			changePlay(next);
			next = prev + 1;
			if (next >= len) {
				next = 0
			};
			if (autoPlay) {
				timeout = setTimeout(changeAutoPlay, stay * msec)
			}
		};
	if (autoPlay) {
		if (len > 1) {
			changeAutoPlay()
		}
	}
};


function investLoan(loanId) {
	var investUrl = environment.globalPath + "yuexitong/detail/" + loanId + ".html";
	window.location.href = investUrl
}
function investCredit(loanInvestorId) {
	var investUrl = environment.globalPath + "yuexitong/zhuan/" + loanInvestorId + ".html";
	window.location.href = investUrl
}
function fixedSidebar() {
	var side = $('.sidebar');
	
	var h = $('.main').height() - side.height();
	var timer = 300;
	var fixStatus = function() {
			var winHeight = $(window).height();
			var scrollTop = $(document).scrollTop();
			
			
			
		};
	$(window).scroll(function() {
		fixStatus()
	});
	$(window).resize(function() {
		fixStatus()
	})
};
$(function() {
	
	slideSwitch();
	userGain();
	fixedSidebar();
	var icon = $('.yol-top dt a');
	icon.hover(function() {
		$(this).css({
			left: 0,
			top: 0,
			margin: 0,
			width: 151,
			height: 151,
			background: 'url(' + Util.config.imgfile + 'home/0' + (icon.index(this) + 1) + '.gif) no-repeat 0 0'
		})
	}, function() {
		$(this).attr('style', '')
	});
	var oApp = $('#yWebapp');
	var oClose = oApp.find('.close');
	oClose.click(function() {
		oApp.fadeOut('slow')
	});

	function refreshHTML(id) {
		return '<div class="refresh"><i class="icons icons-refresh"></i>本场已开标 请<a id="refresh' + id + '" href="javascript:reloads(\'' + id + '\');">刷新</a>查看</div>'
	};
//	var Novice = $('#CountdownNovice'),
//		Plans = $('#CountdownPlans'),
//		Loans = $('#CountdownLoans');
//	Util.loadJS(environment.globalPath + 'v2/local/js/common/countdown.js', function() {
//		if (Novice.length > 0) {
//			Novice.jCountdown({
//				duration: 0,
//				shifts: refreshHTML('Novice')
//			})
//		};
//		if (Plans.length > 0) {
//			Plans.jCountdown({
//				duration: 0,
//				date: ['10:30:00', '14:30:00', '20:00:00', '20:00:00'],
//				shifts: refreshHTML('Plans')
//			})
//		}
//		if (Loans.length > 0) {
//			Loans.jCountdown({
//				duration: 0,
//				shifts: refreshHTML('Loans')
//			})
//		}
//	})
});

function reloads(target) {
	var _this = $('#refresh' + target);
	var soffset = _this.offset().top;
	window.location.reload();
	setTimeout(function() {
		$('body,html').animate({
			scrollTop: soffset
		}, 10)
	}, 200)
};