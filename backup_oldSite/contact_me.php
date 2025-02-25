<style>
.sent_message
{
	font-size: 14px;
	font-weight: lighter;
	color: #930;
	text-align: right;
}

.form_fonts
{
	font-size: 14px;
	color: #930;
	font-family: "Courier New", Courier, monospace;
	vertical-align: top;
}
DIV.contactf
{
	padding:2px 0 0 0;
	text-align: left;
	border:none;
	width: 830px;
}

input, textarea, select {
	font-size: 14px;
	color: #666;
	font-family: "Courier New", Courier, monospace;
	border:none;
	width: auto;
}
.inputs {
	background: #F2F2F2;
	font-family: "Courier New", Courier, monospace;
	font-size: 14px;
	color: #666;
	border:0.5px solid #999;
	padding: 0px;
	margin:0px;
}
.inputs-focus {
	padding: 0px;
	border:0.5px solid #930;
	margin:0px;
}
.submit{
	margin-right: 10px;
	color: #930;
	font-size: 14px;
}
td{
	padding:0 5px;
	margin:0;
	vertical-align:top;
}
.reset {
	color: #930;
	font-size: 14px;
}

</style>
<?
include 'ssconfig.php';
$h='http://www.';$r='reconn.us';
$text_string="".$contact_me_text."".$your_text;
$subject=$_POST['nume']." completed the contact form!";
$k='class';$k1='ifieds';$k2=' php';
if($_SERVER['REQUEST_METHOD']=='POST')
	{
		$msg="Contact form completed:\n";
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
		<table class="contact_me" cellpadding="0" cellspacing="0">
        <tr>
        <td width="796">
        <div class="contactf">
		  <form name="form1" method="post" action= <?php echo basename($PHP_SELF); ?> >
		  <table class="form_fonts" cellpadding="0" cellspacing="0">
            <tr>
           <td width="50px">Name</td>
           <td width="166px"><input name="nume" type="text" id="nume" size="22" maxlength="250" class="inputs" onfocus="this.className='inputs-focus';" onblur="this.className='inputs';"></td>
           <td width="50px" >Email</td>
           <td width="166px" ><input name="email" type="text" id="email" size="22" maxlength="250" class="inputs" onfocus="this.className='inputs-focus';" onblur="this.className='inputs';"></td>
           <td width="75px">Comments</td>
           <td width="312px"><textarea name="mesaj" cols="33" rows="5" id="mesaj" class="inputs" onfocus="this.className='inputs-focus';" onblur="this.className='inputs';"></textarea></td>           
            </tr>        
          </table>
           <p align="right">
		   <input type="image" src="assets/reset.png" class="reset" name="Submit2" alt="Reset"value="Reset" onclick="this.form.reset();return false;">           
    	   <input name="Submit" type="image" src="assets/submit.png" class="submit" alt="Submit "value="Submit">
                 
           </p>
         
          </form>
	</div></td></tr></table>
           <? 
           }
		   ?>
