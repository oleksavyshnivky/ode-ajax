$(function() {
// Прокрутка сторінки — посилання "нагору"
	$(window).scroll(function() {        
		if ($(document).scrollTop() !== 0)	$('#scroll-top').fadeIn(100)
		else								$('#scroll-top').fadeOut(100)
	})
	$('#scroll-top').click(function() { $(window.opera?'html':'html, body').animate({scrollTop:0}, 'fast') })

	$(document).on('click', '.navbar-collapse.show .nav-link', function(e) {
		$('.navbar-collapse').removeClass('show')
	})
})