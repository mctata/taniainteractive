/*-----------------------
* jQuery Plugin: Scroll to Top
* by Craig Wilson, Ph.Creative (http://www.ph-creative.com)
* 
* Copyright (c) 2009 Ph.Creative Ltd.
* Description: Adds an unobtrusive "Scroll to Top" link to your page with smooth scrolling.
* For usage instructions and version updates to go http://blog.ph-creative.com/post/jquery-plugin-scroll-to-top-v2.aspx
* 
* Version: 2.0, 22/06/2009
-----------------------*/
$(function(){$.fn.scrollToTop=function(options){if(options){var speed=options.speed;var ease=options.ease;}else{var speed="slow";var ease="jswing";}var scrollDiv=$(this);$(this).hide().removeAttr("href");if($(window).scrollTop()!="0"){$(this).fadeIn("slow");}$(window).scroll(function(){if($(window).scrollTop()=="0"){$(scrollDiv).fadeOut("slow");}else{$(scrollDiv).fadeIn("slow");}});$(this).click(function(event){$("html, body").animate({scrollTop:"0px"},speed,ease);});}});