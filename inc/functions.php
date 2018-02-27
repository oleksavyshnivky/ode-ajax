<?php

// Інформаційне повідомлення у форматі для bootstrap-notify.js
function msgbox($title, $message, $style = 'danger') {
	// На вивід піде глобальна змінна GLOBALS['msgbox']
	$GLOBALS['msgbox'][] = [
		'options'=>[
			'title'=>$title,
			'message'=>$message
		], 
		'settings'=>[
			'type'=>$style
		]
	];
}

// Демонcтраційний вивід
function view($file, $data = []) {
	include 'templates/' . $file . '.php';
}

// Демонcтраційний вивід у буфер
function renderView($file) {
	ob_start();
	// include 'templates/' . $file . '.php';

	echo '<h1>Це має бути файл ' . html_escape($file) . '</h1';

	return ob_get_clean();
}

// Очистка тексту перед HTML-виводом
function html_escape($raw_input) { 
	if (version_compare(PHP_VERSION, '5.4.0') >= 0) {
		return htmlspecialchars($raw_input, ENT_QUOTES | ENT_HTML401, 'UTF-8'); 
	} else {
		return htmlspecialchars($raw_input, ENT_QUOTES, 'UTF-8'); 
	}
}