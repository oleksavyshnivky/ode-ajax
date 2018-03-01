// Oleksa Vyshnivsky a.k.a. ODE
// dying.escape@gmail.com
// Остання зміна: 2017-03-10

// ————————————————————————————————————————————————————————————————————————————————
// Приклади використання
// 1) <a href="[...]" data-oa data-oa-target="#target;#main" data-oa-subresponse="#submain" data-oa-history data-oa-scroll="#target">[...]</a>
// 2) <form method="post" action="[...]" data-oa>[...]</form>
// 3) <form method="post" action="[...]" data-oa>[...]<a href="javascript:void(0)" data-oa-submit>[...]</a>[...]</form>
// 4) <form id="form-id" method="post" action="[...]" data-oa>[...]</form>[...] <a href="javascript:void(0)" data-oa-submit="#form-id">[...]</a>

// Атрибути
// data-oa — атрибут для посилань і форм, які мають оброблятися цим сценарієм
// data-oa-target — елемент, у який вивантажується результат. Якщо заданий список елементів (через ;), то результат вивантажується у перший з них, який наявний на сторінці. Якщо атрибут не заданий або пустий, результат вивантажується у main
// data-oa-subresponse — елемент відповіді сервера, який потрібно вивантажити. Якщо пусто — піставляється значення з data-oa-target. Якщо потрібного елементу у відповіді сервера нема, вивантажується повна відповідь сервера.
// - Неповне вивантаження відповіді сервера — це вивантаження #infobox + #id-потрібного-елементу.
// data-oa-history — якщо є, оновлювати історію браузера (якщо нема, але data-oa-target зводиться до main, то також оновлювати).
// data-oa-scroll — якщо є, прокручувати до елементу, в який вивантажено результат

// data-oa-submit — атрибут для a, input, select, які мають надсилати форму. Якщо елемент-надсилач знаходиться за межами форми, атрибут має мати значення — id цільової форми (data-oa-submit="#form-id").

// ————————————————————————————————————————————————————————————————————————————————

// Для блокування паралельних запитів
var ajaxPerforming = false
$(document).ajaxStart(function() {
	ajaxPerforming = true
}).ajaxStop(function() {
	ajaxPerforming = false
})

// Для уникнення аякс-завантаження сторінки відразу після традиційного
var just_loaded = true

// ————————————————————————————————————————————————————————————————————————————————
// Дії з URL
function getURLParameter(link, name) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(link)||[,null])[1]
	)
}
function urlParse(link) {
	var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
	var parts = parse_url.exec(link)
	return parts
}
function urlBuild(parts) {
	return parts[1] + ':' + parts[2] + parts[3] 
		+ (parts[4] ? ':' + parts[4] : '') 
		+ (parts[5] ? '/' + parts[5] : '') 
		+ (parts[6] ? '?' + parts[6] : '') 
		+ (parts[7] ? '#' + parts[7] : '')
}
function addURLParameter(link, name, value) {
	link = removeURLParameter(link, name)
	var paramStr = name + "=" + encodeURIComponent(value)

	var parts = urlParse(link)
	if (parts[6]) parts[6] += '&'
	else parts[6] = ''
	parts[6] += paramStr
	
	return urlBuild(parts)
}
function removeURLParameter(link, name) {
	var r = new RegExp("&?"+name+"=([^&]$|[^&#]*)", 'i')
	return link.replace(r, '')
}

// ————————————————————————————————————————————————————————————————————————————————
// JS-ініціалізація після завантаження нової сторінки
function defaultAjaxCallback(response, options) {
	// Сортування таблиць
	// try { $('.table-sortable').stupidtable() } catch (e) {}
}

// Прокрутка до потрібного елементу
function scrollToElement(target) {
	try {
		// З урахуванням висоти завжди видимої шапки
		var element_top = $(target).offset().top - 56 // $('.navbar').width()
		$(window.opera?'html':'html, body').animate({scrollTop:element_top}, 'fast')
	} catch(e) {}
}

// Блимання заданої області
$.fn.odeblink = function() {
	var el = $(this)
	el.addClass('blink')
	setTimeout(function(){
		el.removeClass('blink')
	}, 1000)
}

// 'Закривання' сторінки при аякс-переході
function blockScreen(target) {
	var ajaxloader = $('#ajaxloader').clone().html()
	$(target).css('position', 'relative')
	$(target).append(ajaxloader)
}

// ————————————————————————————————————————————————————————————————————————————————
// Читання налаштувань AJAX-запиту із атрибутів <a> чи <form>
function readOAOptions(element, is_form) {
	var options = {}

	// Запит підтвердження
	options.confirm = $(element).data('oa-confirm')
	// Дія перед переходом
	options.before = $(element).data('oa-before')
	// id елементу, в який вивантажити результат
	options.target = $(element).data('oa-target')
	if (!options.target) {
		var tmp = $(element).closest('[data-oa-main]')
		if (tmp.length) 
			options.target = '#' + $(tmp[0]).attr('id')
		else
			options.target = '#main'
	}
	// Перевірка існування елементу
	var t = options.target.split(';')
	if (t.length > 1) {
		for (var i = 0; i < t.length; i++) {
			if ($(t[i]).length) {
				options.target = t[i] 
				break
			}
		}
	}
	// Елемент відповіді, який потрібно показати
	options.subresponse = $(element).data('oa-subresponse')
	// id елементу, до якого потрібно прокрутити сторінку
	options.scroll = null
	if (typeof $(element).data('oa-scroll') !== 'undefined') {
		options.scroll = $(element).data('oa-scroll') 
		if (!options.scroll) options.scroll = options.target
	}
	// Чи додавати сторінку в історію браузера
	options.history = options.target === '#main' ? true : (typeof $(element).data('oa-history') !== 'undefined')
	// Після виконання
	options.callback = $(element).data('oa-callback')
	if (!options.callback) options.callback = 'defaultAjaxCallback'
	// Не блокувати цільовий елемент під час запису
	options.noblock =  typeof $(element).data('oa-noblock') !== 'undefined'
	// Метод надсилання форми
	options.method = is_form ? $(element).attr('method') : 'get'
	// Цільовий URL
	options.url = is_form ? $(element).attr('action') : $(element).attr('href')
	// if (is_form && options.url && options.method === 'get' && $(element).serialize() != '') options.url += '?' + $(element).serialize()
	if (is_form && !options.url) {
		options.url = options.method === 'post' ? window.location.href : window.location.protocol + '//' + window.location.host + window.location.pathname
	}
	// if (is_form && options.method === 'get') options.url += '?' + $(element).serialize()
	// Дані
	options.data = is_form ? $(element).serialize() : null
	// Елемент, який потрібно оновити після закриття модального вікна
	options.parent = $(element).data('oa-parent')

	return options
}

// ————————————————————————————————————————————————————————————————————————————————
// Надсилання запиту
function doAjax(options) {
	// Підтвердження
	if (options.confirm && !confirm(options.confirm)) return false
	// Дія перед переходом
	if (options.before && $.isFunction(window[options.before]) && !window[options.before]()) return false
	// Історія браузера
	if (options.history) {
		var hurl = (options.method == 'get' && options.data) ? options.url + '?' + options.data: options.url 
		history.pushState({'href': hurl}, '', hurl)
	}
	// Блокування цільового елемента під час запиту
	if (!options.noblock) blockScreen(options.target)
	// Надсилання запиту
	$.ajax({
		dataType: 'json',
		method: options.method,
		url: options.url,
		data: options.data
	})
	.fail(function(a, b, c) { showAjaxError(a, b, c, options) })
	.done(function(a, b, c) { showAjaxPage(a, b, c, options) })
	.done(function(a) {
		if ($.isFunction(window[options.callback])) window[options.callback](a, options)
	})
	.always(function() {
		if (options.scroll) scrollToElement(options.scroll)
	})
}

// Надсилання файлу
function doAjaxFileSend(options, form) {
	var data = new FormData($(form)[0])
	$.ajax({
		dataType: 'json',
		url: options.url,
		data: data,
		cache: false,
		contentType: false,
		processData: false,
		type: 'POST'
	})
	.fail(function(a, b, c) { showAjaxError(a, b, c, options) })
	.done(function(a, b, c) { showAjaxPage(a, b, c, options) })
	.done(function(a) {
		if ($.isFunction(window[options.callback])) window[options.callback](a, options)
	})
	.always(function() {
		if (options.scroll) scrollToElement(options.scroll)
	})
}

// ————————————————————————————————————————————————————————————————————————————————
// Перехід за посиланням
function doAjaxLink(e) {
	// Пропуск натиску на середню кнопку миші, shift|alt|meta|ctrl + клік
	if ((e.which > 1 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)) return true
	// Заборона традиційного переходу
	e.preventDefault()
	// Заборона паралельних запитів
	if (ajaxPerforming) return false
	// Основна функція
	doAjax(readOAOptions(this, false))
}

// Надсилання форми
function doAjaxForm(e) {
	// Заборона традиційного переходу
	e.preventDefault()
	// Заборона паралельних запитів
	if (ajaxPerforming) return false
	// Надсилання форми
	if (this.method === 'post' && $(this).attr('enctype') === 'multipart/form-data')
		doAjaxFileSend(readOAOptions(this, true), this)
	else
		doAjax(readOAOptions(this, true))
}

// Перехід до попереднього стану
function doChangeState(e) {
	// Заборона паралельних запитів
	if (ajaxPerforming) return false
	// Перевірка на те, чи не відбулося тільки що традиційне завантаження сторінки
	if (just_loaded) { 
		just_loaded = false
		return false
	}
	// Перевірка на навігацію через "#"
	if (window.location.hash) return false
	// Історія браузера — попередня сторінка
	var State = History.getState()
	// Опції
	var options = {
		confirm: false,
		before: false,
		target: '#main',
		subresponse: false,
		scroll: '#main',
		history: false,
		callback: 'defaultAjaxCallback',
		noblock: false,
		method: 'get',
		url: State.url,
		data: false
	}
	// Надсилання запиту
	doAjax(options)
}

// ————————————————————————————————————————————————————————————————————————————————
// Показ завантаженої через Аякс сторінки
function showAjaxPage(response, textStatus, xmlHttp, options) {
	// Показ результату
	if (options.target == '#modal-wrapper' && !$(response).find('.modal-dialog').length) options.target = '#modal-wrapper-v1-content'
	// HTML
	var html = $.parseHTML(response.html, true)
	if (options.subresponse && $(html).find(options.subresponse).length > 0) {
		html = $(html).find(options.subresponse).html()
	} else if ($(html).find(options.target).length) {
		html = $(html).find(options.target).html()
	}
	$(options.target).html(html)
	// URL
	$(options.target).attr('data-oa-source', response.url)
	// Оновлення історії переходів між сторінками
	if (options.history) {
		if (response.url !== window.location.href) {
			history.pushState({'href': response.url}, '', response.url)
		}
	}
	// Заголовок документу
	if (options.history || options.target == '#main') {
		document.title = response.title
	}
	// Модальне вікно
	if (options.target == '#modal-wrapper') {
		if (!$('#modal-wrapper').hasClass('show')) $('#modal-wrapper').modal()
		$(options.target).attr('data-oa-parent', options.parent)
	} else if (options.target == '#modal-wrapper-v1-content') {
		if (!$('#modal-wrapper-v1').hasClass('show')) $('#modal-wrapper-v1').modal()
		$('#modal-wrapper-v1').attr('data-oa-parent', options.parent)
	}
	// Alerts
	if (response.alerts) {
		for (var i = 0; i < response.alerts.length; i++) {
			// response.alerts[i].settings.element = options.target
			$.notify(response.alerts[i].options, response.alerts[i].settings)
		}
	}
}

function showAjaxError(response, status, err, options) {
	if(status == 'timeout') {
		$(options.target).html('<div class="alert alert-danger">timeout</div>')
	} else {
		$(options.target).html('<div class="alert alert-danger">Status: ' + status + '. Error: ' + err + '</div>')
	}
	$(options.target).append(response.responseText)
}

// ————————————————————————————————————————————————————————————————————————————————
$(function() {
	// Прив’язка обов. дій
	defaultAjaxCallback(false, false)
	// Надсилання форми
	$(document).on('change', 'select[data-oa-submit], input[data-oa-submit]', function() {
		var target = $(this).data('oa-submit')
		if (target) 
			$(target).submit()
		else 
			$(this).closest('form').submit()
	})
	$(document).on('click', 'a[data-oa-submit]', function() {
		var target = $(this).data('oa-submit')
		if (target) 
			$(target).submit()
		else 
			$(this).closest('form').submit()
	})
	// Надсилання форми через Аякс
	$(document).on('submit', '[data-oa]', doAjaxForm)
	// Аякс-перехід
	$(document).on('click', 'a[data-oa]', doAjaxLink)
	// Відслідковування переходів "Вперед - Назад"
	window.addEventListener('popstate', doChangeState)
	just_loaded = false
	
	// Зміна мови
	$(document).on('submit', '.sitelangchanger', function(e) {
		var action = $(this).attr('action')
		action = addURLParameter(action, 'returnurl', window.location.href)
		$(this).attr('action', action)
	})
	// При закритті модального вікна оновлюється основний елемент
	$('.modal').on('hidden.bs.modal', function(e) {
		var parent = ''
		if (parent = $(e.target).data('oa-parent')) {
			doAjax({
				target: parent,
				noblock: true,
				method: 'get',
				url: $(parent).data('oa-source')
			})
			$(e.target).attr('data-oa-parent', '')
		}
	})
	// Базові налаштування для сповіщень
	$.notifyDefaults({
		type: 'info',
		z_index: 2031,
		placement: {
			align: 'right'
		},
	})
})
