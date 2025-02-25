<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>sendemail.php</title>
</head>

<body>
<?
	$message = $_POST['message'];
	$from = 'From: '.$_POST['name']." <".$_POST['email'].">";
	$to = "admin@taniainteractive.co.uk";

	/* and now mail it */
	$mail_success = mail($to, $message, $from);
	if ($mail_success == true) {
		echo '&successvar=1&';
	} else {
		echo '&successvar=0&';
	}
?>


</body>
</html>
