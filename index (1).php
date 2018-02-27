<?php
define('HTTP_ASSETS', '/solutions/ode-ajax/assets');
define('HTTP_VENDOR', HTTP_ASSETS . '/vendor');
?><!DOCTYPE html>
<html lang="uk">
<head>
	<meta charset="utf-8">
	<meta http-equiv="x-ua-compatible" content="ie=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<meta charset="utf-8">
	<meta http-equiv="x-ua-compatible" content="ie=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<title>ODE AJAX</title>
	
	<meta name="author" content="ODE">
	<meta name="description" content="AJAX-переходи на ODE-сайтах">
	
	<link rel="icon" href="<?= HTTP_VENDOR ?>/favicon/favicon.ico" type="image/x-icon">

	<link rel="stylesheet" href="<?= HTTP_VENDOR ?>/bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,100,300,500">
	<link rel="stylesheet" href="<?= HTTP_VENDOR ?>/font-awesome/css/font-awesome.min.css">
	<link rel="stylesheet" href="<?= HTTP_ASSETS ?>/css/app.css">
	<link rel="stylesheet" href="<?= HTTP_ASSETS ?>/css/pace-theme.css">
	<link rel="stylesheet" href="<?= HTTP_ASSETS ?>/css/animate.min.css">
</head>

<body>

<div class="container-fluid d-flex">
	<div class="">
		<p>
			<a href="https://github.com/oleksavyshnivky/ode-ajax" target="_blank">
				Проект на Github
			</a>
		</p>
		<p>Ajax-оновлення вмісту блоку id=main.</p>
		<p>
			<a href="?view=View-1" class="btn btn-primary" data-oa>
				<?= html_escape('<a href="?view=View-1" data-oa>...</a>') ?>
			</a>
		</p>
		<p>
			<a href="?view=View-2" class="btn btn-info" data-oa>
				<?= html_escape('<a href="?view=View-2" data-oa>...</a>') ?>
			</a>
		</p>
	</div>
	<div class="card">
		<div class="card-header">
			<h4><pre><?= html_escape('<main id="main"></main>')?></pre></h4>
		</div>
		<div class="card-body">
			<main id="main" class="container-fluid pt-2 pb-5" data-oa-main><?=$data['content']?></main>
		</div>
	</div>
</div>

<div class="container">
	<h1>Використані файли</h1>
	<ul>
		<li>
			<a href="<?= HTTP_VENDOR ?>/jquery/jquery.min.js" target="_blank">jquery.min.js</a>
		</li>
		<li>
			<a href="<?= HTTP_ASSETS ?>/js/jquery.ode-ajax.js" target="_blank">jquery.ode-ajax.js</a> — мій ajax-файл (див. опис у ньому)
		</li>
		<li>
			<a href="<?= HTTP_VENDOR ?>/misc/js/jquery.history.45.js" target="_blank">jquery.history.45.js</a> — для переходів вперед/назад
		</li>
	</ul>
	<h1>Додатково</h1>
	<ul>
		<li>
			<a href="<?= HTTP_VENDOR ?>/misc/js/bootstrap-notify.min.js" target="_blank">bootstrap-notify.min.js</a> — для показу Bootstrap alerts (з моїми поправками під Bootstrap 4)
		</li>
		<li>
			<a href="http://github.hubspot.com/pace/" target="_blank">http://github.hubspot.com/pace/</a> — pace.js і pace.css, здається, звідси (для синього індикатора завантаження угорі сторінки)
		</li>
		<li>
			<a href="<?= HTTP_ASSETS ?>/css/ajaxblock.css" target="_blank">ajaxblock.css</a> — для індикатора, який мигає у блоці, куди завантажиться результат (у HTML-коді, який при першому запиті завантажується, повинен бути блок <code><?= html_escape('<div id="ajaxloader" hidden><div class="ajax-block"><div class="spinner"></div></div></div>') ?></code>)
		</li>
	</ul>
</div>

<!-- Additional CSS -->
<link rel="stylesheet" href="<?= HTTP_ASSETS ?>/css/ajaxblock.css">
<!-- Javascript files-->
<script src="<?= HTTP_VENDOR ?>/misc/js/pace.min.js"></script>
<script src="<?= HTTP_VENDOR ?>/jquery/jquery.min.js"></script>
<script src="<?= HTTP_VENDOR ?>/popper.js/umd/popper.min.js"> </script>
<script src="<?= HTTP_VENDOR ?>/bootstrap/js/bootstrap.min.js"></script>
<script src="<?= HTTP_ASSETS ?>/js/jquery.ode-ajax.js"></script>
<script src="<?= HTTP_ASSETS ?>/js/app.js"></script>
<script src="<?= HTTP_VENDOR ?>/misc/js/bootstrap-notify.min.js"></script>
<script src="<?= HTTP_VENDOR ?>/misc/js/jquery.history.45.js"></script>
	
<div id="ajaxloader" hidden>
	<div class="ajax-block">
		<div class="spinner"></div>
	</div>
</div>

<!-- Модальне вікно -->
<template id="template">
<div id="modal-wrapper" class="modal fade" data-oa-main></div>
<div id="modal-wrapper-v1" class="modal fade">
	<div class="modal-dialog modal-lg" role="document">
		<div class="modal-content" id="modal-wrapper-v1-content" data-oa-main>
			<div class="modal-header">
				<h5 class="modal-title"></h5>
				<button type="btn btn-primary" class="close" data-dismiss="modal" aria-label="<?= _('Close') ?>">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div id="modal-wrapper-v1-body" class="modal-body">
				
			</div>
			<div class="modal-footer">
				<a href="?" class="btn btn-secondary non-modal-exit" data-oa><?= _('Close') ?></a>
				<button type="btn btn-primary" class="btn btn-secondary" data-dismiss="modal"><?= _('Close') ?></button>
			</div>
		</div>
	</div>
</div>
</template>

<script>
var showModal = function() {
	if (!$('#modal-wrapper').hasClass('show'))  $('#modal-wrapper').modal()
}
var hideModal = function() {
	$('.modal.show').modal('hide')
	return true
}
</script>

<!-- Alerts -->
<?php if ($GLOBALS['msgbox']): ?>
<script>
document.addEventListener('DOMContentLoaded', function(event) {
	var msgbox = JSON.parse('<?= json_encode($GLOBALS['msgbox']) ?>')
	for (var i = 0; i < msgbox.length; i++) {
		$.notify(msgbox[i].options, msgbox[i].settings)
	}
})
</script>
<?php endif ?>


</body>
</html>

