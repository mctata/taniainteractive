$(window).load(function () {
    $('.flexslider') .fitVids()
	.flexslider({
		controlNav: true,
		directionNav: false,
		animation: "fade",
		touch: true
	  });
});

$(function () {
	
$(".mobile-menu").hide();
    $("a#mobile").click(function () {
        $(this).next(".mobile-menu").slideToggle(500);
        $(this).toggleClass("expanded");
    });


    $('#work').carouFredSel({
        width: '100%',
        scroll: 1,
        auto: false,
        pagination: false,
        prev: '.prev_item',
        next: '.next_item'
    });

    $("#work").touchwipe({
        wipeLeft: function () { $('.next_item').trigger('click'); },
        wipeRight: function () { $('.prev_item').trigger('click'); }
    });
});

/**  
		scroll to element function
	**/
		function scrollToElement(selector, time, verticalOffset) {
			time = typeof(time) != 'undefined' ? time : 500;
			verticalOffset = typeof(verticalOffset) != 'undefined' ? verticalOffset : 0;
			element = $(selector);
			offset = element.offset();
			offsetTop = offset.top + verticalOffset;
			$('html, body').animate({
				scrollTop: offsetTop
			}, time);			
		}
		
		$(document).ready(function() {
		
				$('#scroll-to-intro').click(function (e) {
					e.preventDefault();
					scrollToElement('#intro', 1000);
				});
				$('#scroll-to-trace').click(function (e) {
					e.preventDefault();
					scrollToElement('#trace', 1000);
				});
				$('#scroll-to-planTrip').click(function (e) {
					e.preventDefault();
					scrollToElement('#planTrip', 1000);
				});
				$('#scroll-to-share').click(function (e) {
					e.preventDefault();
					scrollToElement('#share', 1000);
				});
				$('#scroll-to-relive').click(function (e) {
					e.preventDefault();
					scrollToElement('#relive', 1000);
				});
			/* back to top */
				//$('a#back-to-top').click(function (e) {
					//e.preventDefault();
					//scrollToElement('#logo', 1000);
				//});
			
		});


        $.toTop({
            css: {
                border: '1px dotted gray',
                padding: 20
            },
            image: 'images/slide1_arrow.png'
        });
