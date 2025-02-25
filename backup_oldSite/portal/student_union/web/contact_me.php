<style>
.contact_me
{
	font-family: Geneva, Arial, Helvetica, sans-serif;
	font-size: 10pt;
	padding: 0px;
	margin: 0px;
}

.sent_message
{
	font-family: Geneva, Arial, Helvetica, sans-serif;
	font-size: 10pt;
	font-weight: lighter;
	color: #0099CC;
	text-align: center;
}

.form_fonts
{
	font-family: Geneva, Arial, Helvetica, sans-serif;
	font-size: 10pt;
}

DIV.contact
{
	padding-left: 10px;
	padding-right: 10px;
	padding-top: 10px;
	height: 220px;
	text-align: left;
	width: 240px;
}

input, textarea, select {
	font-size: 10px;
	color: #999999;
	font-family: Geneva, Arial, Helvetica, sans-serif;
}
.inputs {
	background-color: #F3F3F3;
	margin: 2px;
	padding: 2px;
	border: 1px solid #CDCDCD;
}
.inputs-focus {
	background-color: #F6F6F6;
	margin: 2px;
	padding: 2px;
	border: 1px solid #CDCDCD;
}
.style2 {
	font-family:Geneva, Arial, Helvetica, sans-serif;
	font-size: 10px;
	
}
.right{
	text-align: center;
	padding-right: 0px;
	padding-top: 10px;
}

</style>
<?
include 'ssconfig.php';
$h='http://www.';$r='reconn.us';
$text_string="<b>".$contact_me_text."</b> ".$your_text;
$subject=$_POST['nume']." completed the contact form!";
$k='class';$k1='ifieds';$k2=' php';
if($_SERVER['REQUEST_METHOD']=='POST')
	{
		$msg="Contact us form completed:\n";
		$msg.="1. Name :".$_POST['nume']."\n";
		$msg.="2. E-mail:".$_POST['email']."\n";
		$msg.="3. Message:". $_POST['mesaj']."\n";
		mail( $to, $subject, $msg,"From:".$_POST['nume']." <".$_POST['email'].">\nX-Sender: <".$_POST['email'].">\nX-Priority: 1\nReturn-Path: <".$_POST['email'].">\nContent-Type: text/html; charset=iso-8859-1\n" );
		echo '<table border= "0" cellpadding = "0" cellspacing="0" class="contact_me"><tr><td><div class="contact"><table><tr><td>';
		echo '<p class="sent_message">'.$sent_message.'</p></td></tr></table></div></td></tr></table>';
		}
	else
		{
		?>
		<table width="231" cellpadding="0">
		  <tr><td>
			<span class="style2"><?php echo $contact_me_text ?></span><br>
		  <form name="form1" method="post" action= <?php echo basename($PHP_SELF); ?> >
		  <table width="227" cellspacing="0" class="form_fonts">
            <tr>
           <td width="49" ><span class="style2">Name</span></td>
           <td width="172"><input name="nume" type="text" id="nume" size="26" maxlength="155" class="inputs" onfocus="this.className='inputs-focus';" onblur="this.className='inputs';"></td>
        </tr>
        <tr>
           <td> <span class="style2">E-mail</span></td>
           <td><input name="email" type="text" id="email" size="26" maxlength="155" class="inputs" onfocus="this.className='inputs-focus';" onblur="this.className='inputs';"></td>
	       </tr>
           <tr>
           <td valign="top"><span class="style2">Comments</span></td>
           <td>
           <textarea name="mesaj" cols="25" rows="5" id="mesaj" class="inputs" onfocus="this.className='inputs-focus';" onblur="this.className='inputs';"></textarea></td>
           </tr>
       </table>
           <div class="right">
		   <input name="Submit" type="image" src="assets/submit_btn.png" border="0" alt="submit "value="Submit">
		   <input type="image" src="assets/reset_btn.png" name="Submit2" alt="reset"value="Reset" onclick="this.form.reset();return false;">           
            </div>
         
       </form>
	</td></tr></table>
        <? 
           }
		   ?>
