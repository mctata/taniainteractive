// JavaScript Document

var expDays = 30;
var exp = new Date(); 
exp.setTime(exp.getTime() + (expDays*24*60*60*1000));
var ShowCount = 0;
var SwapColour;
function ListToDoItems() {
var NumToDoItems = GetCookie('PT_NumToDoList');
var i;
var ToDoItem;
if (NumToDoItems == null) {
NumToDoItems = 0;
}
ShowCount = 0; SwapColour = 0;
for (i=1; i <= NumToDoItems; i++) {
ToDoItem = GetCookie('PT_ToDoItem'+i);
if (ToDoItem != null) {
PrintItem(ToDoItem, i);
      }
   }
}
function DeleteItem(Count) {
DeleteCookie('PT_ToDoItem'+Count);
window.location = window.location;
}
function PrintItem (ToDoItem, Count) {
var color = "bgcolor='#ffffff'";
SwapColour = 1 - SwapColour;
if (SwapColour==1) {color = "bgcolor='#ffffff'"} ;
ShowCount++;
document.write("<tr  " + color + ">");
document.write("<td width=10% align=center valign=top><b>"+ShowCount);
document.write("<td width=75% align=left  >"+ToDoItem);
document.write("<td width=15% align=right>"+"<a href='javascript:DeleteItem(" + Count + ")'>Delete</a>");
}
function AddItem() {
var NumToDoItems = GetCookie('PT_NumToDoList');
var i;
var ToDoItem;
if (NumToDoItems == null) {
NumToDoItems = 0;
}
ToDoItem = prompt("Enter new item");
if ((ToDoItem != null) && (ToDoItem != "undefined" )) {
NumToDoItems++;
SetCookie('PT_ToDoItem'+NumToDoItems, ToDoItem, exp);
SetCookie('PT_NumToDoList',NumToDoItems, exp);
window.location = window.location;
   }
}
function set() {
VisitorName = prompt("Who are you?");
SetCookie ('VisitorName', VisitorName, exp);
SetCookie ('WWHCount', 0, exp);
SetCookie ('WWhenH', 0, exp);
}
function getCookieVal (offset) {  
var endstr = document.cookie.indexOf (";", offset);  
if (endstr == -1)    
endstr = document.cookie.length;  
return unescape(document.cookie.substring(offset, endstr));
}
function GetCookie (name) {  
var arg = name + "=";  
var alen = arg.length;  
var clen = document.cookie.length;  
var i = 0;  
while (i < clen) {    
var j = i + alen;    
if (document.cookie.substring(i, j) == arg)      
return getCookieVal (j);    
i = document.cookie.indexOf(" ", i) + 1;    
if (i == 0) break;   
}  
return null;
}
function SetCookie (name, value) {  
var argv = SetCookie.arguments;  
var argc = SetCookie.arguments.length;  
var expires = (argc > 2) ? argv[2] : null;  
var path = (argc > 3) ? argv[3] : null;  
var domain = (argc > 4) ? argv[4] : null;  
var secure = (argc > 5) ? argv[5] : false;  
document.cookie = name + "=" + escape (value) + 
((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + 
((path == null) ? "" : ("; path=" + path)) +  
((domain == null) ? "" : ("; domain=" + domain)) +    
((secure == true) ? "; secure" : "");
}
function DeleteCookie (name) {  
var exp = new Date();  
exp.setTime (exp.getTime() - 1);  
var cval = GetCookie (name);  
document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
}