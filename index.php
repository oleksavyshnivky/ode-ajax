<?php

// Чи це AJAX-запит?
// jQuery додає у ajax-запит заголовок HTTP_X_REQUESTED_WITH='XMLHttpRequest'
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) and $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') define('AJAX', true);

// Сповіщення (Bootstrap alerts)
$GLOBALS['msgbox'] = [];

session_start();

// Вивід у буфер (аби не збивати запланований JSON-вивід випадковим достроковим виводом text/plain чи html)
ob_start();

// Inc
require_once 'inc/functions.php';

// Виклик контролера
// [...]
// Нехай він визначить потрібний View: 
$view = filter_input(INPUT_GET, 'view');
$title = 'Заг: ' . $view;
// [...]

// Випадкове повідомлення
if (rand(0, 1) < 0.5) {
	msgbox('Сповіщення', 'Випадкове повідомлення', ['danger', 'success', 'info', 'warning'][rand(0,3)]);
	if (rand(0, 1) < 0.5) {
		msgbox('Сповіщення #2', 'Випадкове повідомлення #2', ['danger', 'success', 'info', 'warning'][rand(0,3)]);
	}
}

// ————————————————————————————————————————————————————————————————————————————————
// Сповіщення (Bootstrap alerts), включно з тими, що були створені при виконанні попереднього запиту, якщо він закінчився перенаправленням
if (isset($_SESSION['msgbox']) and !empty($_SESSION['msgbox'])) {
	$GLOBALS['msgbox'] = array_merge($_SESSION['msgbox'], $GLOBALS['msgbox']);
	unset($_SESSION['msgbox']);
}

// Очікуваний вивід (вивід з View)
$plannedContent = renderView($view);

// Неочіуваний вивід (вивід з контролера/моделі)
$unplannedContent = ob_get_clean();

// Відповідь сервера
if (defined('AJAX') and AJAX) {
	// Аби індикатор завантаження трішки помигав
	usleep(500);

	// У відповідь на Ajax-запит надсилається JSON-відповідь
	// Якщо у сценарії параметр option.history == true, то url і title будуть використані для оновлення window.location.href і заголовка документу
	// html буде вставлений у елемент option.target
	// alerts будуть показані через bootstrap-notify.js 
	$response = [
		'url'	=>	$_SERVER['REQUEST_URI'],
		'title'	=>	$title,
		// Div-обгортка потрібна для JS-парсера, якщо для показу користувачу потрібен не весь цей блок
		'html'	=>	'<div class="animated bounceInRight" style="animation-duration: 0.5s;">'.$unplannedContent.$plannedContent.'</div>',
		'alerts'=>	$GLOBALS['msgbox']
	];
	header('Content-Type: application/json');
	echo json_encode($response);
} else {
	// Вивід повного HTML-документу
	view('index', [
		'content'	=>	$unplannedContent.$plannedContent,
	]);
}
