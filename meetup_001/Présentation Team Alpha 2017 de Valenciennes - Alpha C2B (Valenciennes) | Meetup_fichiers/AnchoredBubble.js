if (Meetup.AnchoredBubble === undefined) {
	Meetup.AnchoredBubble = {};
}

(
function ($) {
	/**
	* Hide flash content on the page
	*
	* @method hideFlashContent
	*/
	function hideFlashContent() {
		if(!$.support.leadingWhitespace) {
			$("embed[data-no-flash-hide!='true']").css({ 'visibility': 'hidden' });
			$("iframe[src*='youtube'][data-no-flash-hide!='true']").css({ 'visibility': 'hidden' });
			$("iframe[src*='vimeo'][data-no-flash-hide!='true']").css({ 'visibility': 'hidden' });
		}
	}

	/**
	* Show flash content on the page
	*
	* @method showFlashContent
	*/
	function showFlashContent() {
		$('embed').css({ 'visibility': 'visible' });
		$("iframe[src*='youtube']").css({ 'visibility': 'visible' });
		$("iframe[src*='vimeo']").css({ 'visibility': 'visible' });
	}

	// after launch bug: https://webmail.meetup.com/bugzilla/show_bug.cgi?id=17271
	// no more viewport sizing
	// just bubble top as on the top side of document.

	// OLD SPEC HERE >>>
	// - when you click on "Read more about us...", you must have it in your viewport.
	// - anc should point to the pivot anyway
	// - if the description height is shorter than window viewport height,
	//     the desc is stand in the middle.
	// - if the desc is bigger than a viewport,
	//     the bubble will be the viewport equiv size and will have a scroll bar?
	// <<<

	var element = {};
	var anc_coordinate = { // is the pixel coordinate where the tip is pointing to.
		x: 0,
		y: 0
	};
	var offset = { // pixel diff between anc_coordinate and left top of the base.
		x: 0,
		y: 0
	};
	var anc_dimension = {
		w: 19,
		h: 40
	};
	var wrap_dimension = {
		w: 0,
		h: 0
	};
	var isClosed = true;
	var boxhead_height = 0;
	var boxfoot_height = 0;
	var self = Meetup.AnchoredBubble;
	var id_bubble = 'group-desc-bubble';
	var id_pivot = 'group-desc-bubble-pivot';
	var extra_padding = 10;

	Meetup.AnchoredBubble.init = function () {
		//LOG.info('Meetup.AnchoredBubble.init');
		var elm = document.getElementById(id_bubble);
		document.body.appendChild(elm);
		element.base = elm;
		var $doc = $('#C_document');
		var $wrap = $('.J_anchoredBubbleWrap', elm);
		var $close = $('.J_anchoredBubbleClose', elm);
		element.document = $doc[0];
		element.wrap = $wrap[0];
		element.close = $close[0];;
		element.anchor = $('.J_anchoredBubbleAnchor', elm)[0];
		element.boxhead = $('.D_boxhead', element.wrap)[0];
		element.boxbody = $('.J_anchoredBubbleBody', elm)[0];
		var boxfoot = $('.D_boxfoot', element.wrap);
		element.boxfoot = (boxfoot.length > 0) ? boxfoot[0] : null;

		addView();
		var doc_width = getRoundedNumber($doc.width()) + (extra_padding * 2);
		var padr = getRoundedNumber($wrap.css('padding-right')) + extra_padding;
		var padl = getRoundedNumber($wrap.css('padding-left')) + extra_padding;
		$wrap.css(
			{
				'padding-right': padr + 'px',
				'padding-left': padl + 'px'
			}
		);
		element.wrap.style.width = (doc_width - padl - padr - 2) + 'px'; // 2px = border left and right
		offset.x = -(1 + extra_padding);
		offset.y = -Math.round(anc_dimension.h / 2);
		wrap_dimension.w = $wrap.outerWidth();
		wrap_dimension.h = $wrap.outerHeight();
		boxhead_height = $(element.boxhead).outerHeight() + 1; // 1px for border
		boxfoot_height = (element.boxfoot) ? $(element.boxfoot).outerHeight() : 0;
		removeView();

		$close.click(onCloseClick);

		// debug yo!
		// self.element = element;
		// self.anc_coordinate = anc_coordinate;
		// self.offset = offset;
		// self.anc_dimension = anc_dimension;
		// self.wrap_dimension = wrap_dimension
		// self.isClose = isClosed;
		// return self;

		// AUTO INIT HERE!
		var anc = document.getElementById(id_pivot);
		self.attach( anc.parentNode );
		$(anc).click(
			function (ev) {
				ev.preventDefault();
				self.toggle();
			}
		);
		self.toggle();
	};

	Meetup.AnchoredBubble.attach = function (anc) {
		element.pivot = anc;
	};

	Meetup.AnchoredBubble.toggle = function () {
		if (isClosed) {
			self.show();
		}
		else {
			self.hide();
		}
	};

	Meetup.AnchoredBubble.show = function () {
		setPosition();
		makeDisplayBlock();
		hideFlashContent();
		//We don't want to hide the ones inside the pop-up...
		$("embed", element.base).css({"visibility":"visible"});
		$("iframe[src*='youtube']", element.base).css({"visibility":"visible"});
		$("iframe[src*='vimeo']", element.base).css({"visibility":"visible"});
		isClosed = false;
	};

	Meetup.AnchoredBubble.hide = function () {
		makeDisplayNone();
		showFlashContent();
		isClosed = true;
	};

	var getRoundedNumber = function (str) {
		var fl = parseFloat(str);
		var result;
		if (isNaN(fl)) {
			result = 0;
		}
		else {
			result = Math.round(fl);
		}
		return result;
	};

	var addView = function () {
		element.base.style.visibility = 'hidden';
		element.base.style.display = 'block';
	};

	var onCloseClick = function (ev) {
		ev.preventDefault();
		ev.stopPropagation();
		self.hide();
	};

	var removeView = function () {
		element.base.style.display = 'none';
		element.base.style.visibility = 'visible';
	};

	var makeDisplayBlock = function () {
		element.base.style.display = 'block';
		element.base.style.visibility = 'visible';
	};

	var makeDisplayNone = function () {
		element.base.style.display = 'none';
		element.base.style.visibility = 'visible';
	};

	var setPosition = function () {
		// LOG.info('setPosition')
		var $piv = $(element.pivot);
		var pos = $piv.offset();
		var piv_w = $piv.width();
		var piv_h = $piv.height();
		anc_coordinate.x = Math.floor(pos.left + piv_w);
		anc_coordinate.y = Math.floor(pos.top + (piv_h / 2));

		var doc_height = $(document).height();
		var win_height = $(window).height();
		var win_scrollTop = $(window).scrollTop();
		var base_x = anc_coordinate.x + offset.x;
		var base_y = 0;

		var pin_top = $(element.document).offset().top;
		// if we scroll down past the top of the main div
		if (win_scrollTop > pin_top) {
			if (win_scrollTop < (anc_coordinate.y - (wrap_dimension.h / 2))) {
				offset.y = Math.round((wrap_dimension.h / 2 - piv_h));
				element.anchor.style.top = offset.y + 'px';
				base_y = anc_coordinate.y - offset.y - (piv_h /2);
			}
			else {
				base_y = (win_scrollTop + 5);
				offset.y = Math.round(anc_coordinate.y - base_y - (piv_h / 2));
				element.anchor.style.top = offset.y + 'px';
			}
		} else if ((pin_top + wrap_dimension.h - 25) > anc_coordinate.y) {
			// if bottom of description is well below anchor
			offset.y = Math.round(anc_coordinate.y - pin_top - (piv_h / 2));
			element.anchor.style.top = offset.y + 'px';
			base_y = pin_top;
		} else {
			// desc height not reaching piv loc.
			offset.y = Math.round((wrap_dimension.h / 2 - piv_h));
			element.anchor.style.top = offset.y + 'px';
			base_y = anc_coordinate.y - offset.y - (piv_h /2);
		}

		element.base.style.left = base_x + 'px';
		element.base.style.top = base_y + 'px';
	};


	// AUTO INIT since this is defer loaded
	self.init();
}
)(jQuery);
