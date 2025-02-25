<?php
// $Id: ssconfig.php,v 1.1 2005/01/12
// ----------------------------------------------------------------------
// Contact Us Script Package
// Copyright (C) 2005 by the Spicescripts Team.
// http://www.spicescripts.com/contactus_script/
// ----------------------------------------------------------------------
//	to		your email, where the content of the form will be sent
//	contact_us_text	the text that appeares on top of form
//	your_text	comment text
//	sent_message	the message that appears after the message is sent
//	small_text	put your message that will apear with small fonts	
//	contact_page	file name where you want to appear the form
//
// ----------------------------------------------------------------------
//
//	In order to use your contact us form you must modify the followings variables:
//	(just delete the text between "" and put your own settings.
//
//		- $to - to set your email
//		- $contact_page	- to set the returning page after the form is submitted 
//	and the informations are sent. For example, if the name of the page on your site 
//	that contains the contact us form is called "contact.php" then the setting are:
//			$contact_page="contact.php";
// ----------------------------------------------------------------------


$to="admin@taniainteractive.co.uk";
$contact_me_text="";
$your_text="";
$sent_message="Thank You. Your message has been sent!";
$small_text="(fill in the fields and press submit)";
$contact_page="index.php";
?>