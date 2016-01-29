// ==UserScript==
// @name CommentMore
// @namespace comment-more
// @description	comment on any web page
// @include http*
// @version 0.63
// @require http://localhost:3000/jquery/jquery-1.12.0.min.js
// @require http://localhost:3000/jquery-ui-1.11.4.custom/jquery-ui.min.js
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==
var CMVersion="0.63";var hostDomain="http://localhost:3000/";var CMLogin="У мене чудова новина!";var CMPassword="12345678";var cookiesExp=3600*24*365;var collapsed=1;var oldWebPage=location.href;var lastDateTime=0;var ajaxInProcess=false;var commentsCount={local:0,all:0};(function(){if(window.top===window.self)commentMore()})();function commentMore(){setInterval(function(){if(!collapsed||location.href!==oldWebPage)getComments()},15*1e3);setTimeout(function(){setAppPanel();setEnvironmentDisplay();getComments()},2e3)}function applyStyle(){var e=Math.round(document.documentElement.clientHeight*.6)+"px";var t=getCookie("app_panel_background")||"145 , 207 , 142 , 0.9";$(".cm-font").css({font:"12px   Arial "});$(".cm-black").css({color:"black"});$(".cm-grey").css({color:"grey"});$(".cm-red").css({color:"red"});$(".cm-buttons").css({background:"transparent",border:"0",margin:"0px",padding:"1px"});$(".cm-link").css({"text-decoration":"none"});$(".cm-comment-tab").css({background:"white",padding:"3px","margin-bottom":"10px"});$("#cm-app-panel").css({width:"300px",border:"1px solid #DFDFDF","border-radius":"10px 10px 0px 0px",background:str("rgba( ",t," )"),margin:"0px",padding:"10px 10px 5px 10px",position:"fixed"});$("#cm-comments-area").css({"margin-top":"10px","margin-bottom":"10px","max-height":e,overflow:"auto"});$(".cm-sans-padding-sans-margin").css({padding:"0px",margin:"0px"});$("textarea#cm-user-comment").css({width:"100%",resize:"vertical",overflow:"auto","margin-bottom":"0px"});$("#cm-post-comment").css({width:"100%"})}function setAppPanel(){echo("CommentMore panel starts");var e=document.createElement("div");e.id="cm-app-panel";e.innerHTML=str("<div id='cm-app-head' style='text-align:right;' class='cm-sans-padding-sans-margin ' >","<div style='float:left;' class='cm-sans-padding-sans-margin ' >","<button id='cm-toggle-button' class='cm-buttons cm-font cm-black ' ></button>","<button id='cm-toggle-env-comm-button' class='cm-buttons cm-font cm-black ' >","<span id='cm-toggle-env-comm-ico' class='cm-font cm-black cm-sans-padding-sans-margin' ></span>"," ","<span id='cm-comments-count' class='cm-font cm-black cm-sans-padding-sans-margin ' ></span>","</button>","</div> ","<span id='cm-app-status' class='cm-font cm-black cm-sans-padding-sans-margin ' > </span> ","<span class='cm-font cm-grey cm-sans-padding-sans-margin ' ><a href='",hostDomain,"' title='Project site' target=blank class='cm-link cm-font cm-grey ' ><b>CommentMore</a></b><sup id='cm-version' class='cm-grey ' > ",CMVersion," </sup></span>","</div>","<div id='cm-enhanced-area' style='display:none; ' >","<div id='cm-comments-area' ></div>","<textarea id='cm-user-comment' placeholder='Your comment' class='cm-font cm-black cm-sans-padding-sans-margin ' ></textarea>","<button id='cm-post-comment' class='cm-buttons cm-font cm-black ' >Post comment as ",CMLogin,"</button> ","</div>");document.body.appendChild(e);applyStyle();$("#cm-toggle-button").click(toggleAppPanel);$("#cm-post-comment").click(postComment);$("#cm-toggle-env-comm-button").click(toggleEnvComments);echo("panel height",$("#cm-app-panel").css("height"));e.style.bottom=str(-parseInt($("#cm-app-panel").css("height")),"px");$("#cm-toggle-button").text("▲");$("#cm-toggle-button").attr({title:"Toggle comments"});collapsed=1;$(e).animate({bottom:0},500);e.style.right=getCookie("cm_app-panel-right")||"50px";echo("cookie right:",getCookie("cm_app-panel-right"));$("#cm-app-panel").draggable({axis:"x",handle:"div#cm-app-head",stop:function(e,t){$("#cm-app-panel").css({top:"auto"});var n=$("#cm-app-panel").css("right");if(n==="auto")n=str(document.body.clientWidth-parseInt($("#cm-app-panel").css("left"))-parseInt($("#cm-app-panel").css("width")),"px");echo(n);if(parseInt(document.documentElement.clientWidth)-parseInt(n)<0||parseInt(n)+parseInt($("#cm-app-panel").css("width"))<0){echo("panel out the borders","left",parseInt(document.documentElement.clientWidth)-parseInt(n),"right",parseInt(n)+parseInt($("#cm-app-panel").css("width")))}else{echo("panel into the borders","left",parseInt(document.documentElement.clientWidth)-parseInt(n),"right",parseInt(n)+parseInt($("#cm-app-panel").css("width")));setCookie("cm_app-panel-right",n,{path:"/",expires:cookiesExp})}}})}function toggleAppPanel(){if(collapsed){$("div#cm-enhanced-area").css({display:"block"});$("#cm-toggle-button").text("▼");collapsed=false}else{$("div#cm-enhanced-area").css({display:"none"});$("#cm-toggle-button").text("▲");collapsed=1}}function toggleEnvComments(){if(getCookie("cm_localCommentsOnly")){setCookie("cm_localCommentsOnly","",{path:"/",expires:-1})}else{setCookie("cm_localCommentsOnly",1,{path:"/",expires:cookiesExp})}setEnvironmentDisplay()}function setEnvironmentDisplay(){if(getCookie("cm_localCommentsOnly")){$("#cm-toggle-env-comm-ico").text("☂");$("#cm-toggle-env-comm-button").attr({title:"Switch to all comments"});$(".cm-external-comments").css({display:"none"});$("#cm-comments-count").text(commentsCount.local)}else{$("#cm-toggle-env-comm-ico").text("☀");$("#cm-toggle-env-comm-button").attr({title:"Switch to local comments"});$(".cm-external-comments").css({display:"block"});$("#cm-comments-count").text(commentsCount.all)}}function getComments(e){if(ajaxInProcess){echo(">>> ajax in process. get omitted");return undefined}ajaxInProcess=true;echo("[get comments]");$("#cm-app-status").text(" ⌛ ");var t=document.getElementById("cm-comments-area");if(location.href!==oldWebPage){echo(oldWebPage,location.href);oldWebPage=location.href;t.innerHTML="";lastDateTime=0;commentsCount={local:0,all:0}}$.ajax({url:str(hostDomain,"AJAX/get-comments"),dataType:"json",method:"post",data:{webPage:location.href,lastDateTime:lastDateTime},success:function(n){echo("Success get");$("#cm-app-status").text(" ");for(key in n.answer){var o=document.createElement("div");var a=n.answer[key];var c=truncateLeftAll(a.webPage);var s=truncateLeftAll(location.href);o.className=c===s?"cm-comment-tab cm-font cm-black ":"cm-comment-tab cm-font cm-grey cm-external-comments ";if(c===s)commentsCount.local++;commentsCount.all++;var m=new Date(a.dateTime);m=str(m.getDate(),".",m.getMonth()+1,".",m.getFullYear()," ",m.getHours(),":",m.getMinutes());o.innerHTML=str("<b>",a.author,"</b> (",m,"):<br>",a.userComment.replace(/\n/g,"<br>"),c===s?" ":str(" <a class='cm-link cm-font cm-grey ' href='",a.webPage,"' >➦</a>"));o.title=str(a.webPageTitle,"\n",a.webPage);t.appendChild(o);if(a.dateTime>lastDateTime)lastDateTime=a.dateTime}applyStyle();if(e)t.scrollTop=t.scrollHeight;setEnvironmentDisplay();ajaxInProcess=false},error:function(){echo("Error get comment");$("#cm-app-status").text(" error ");ajaxInProcess=false}})}function postComment(){echo("[post comment]");$("#cm-app-status").text(" ⌛ ");var e=$("#cm-user-comment").val();if(e){$("#cm-user-comment").val("");$.ajax({url:str(hostDomain,"AJAX/post-comment"),dataType:"json",method:"post",data:{webPage:location.href,webPageTitle:document.title,CMLogin:CMLogin,CMPassword:CMPassword,userComment:e},success:function(e){echo("post: Success",e.answer);$("#cm-app-status").text(" ");getComments(1)},error:function(){echo("Error post");$("#cm-app-status").text(" error ");playSound("http://wav-library.net/effect/windows/xp/windows_xp_-_kriticheskaya_oshibka.mp3")}})}}function playSound(e){var t=new Audio;t.src=e;t.autoplay=true}function setCookie(e,t,n){n=n||{};var o=n.expires;if(typeof o=="number"&&o){var a=new Date;a.setTime(a.getTime()+o*1e3);o=n.expires=a}if(o&&o.toUTCString){n.expires=o.toUTCString()}t=encodeURIComponent(t);var c=e+"="+t;for(var s in n){c+="; "+s;var m=n[s];if(m!==true){c+="="+m}}document.cookie=c}function getCookie(e){var t=document.cookie.match(new RegExp("(?:^|; )"+e.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,"\\$1")+"=([^;]*)"));return t?decodeURIComponent(t[1]):undefined}function scrollToElement(e){if(typeof e==="string")e=document.getElementById(e);var t=0;var n=0;while(e!=null){t+=e.offsetLeft;n+=e.offsetTop;e=e.offsetParent}window.scrollTo(0,n)}function scrollToElement(e){if(typeof e==="string")e=document.getElementById(e);var t=0;var n=0;while(e!=null){t+=e.offsetLeft;n+=e.offsetTop;e=e.offsetParent}window.scrollTo(0,n)}function str(){for(var e=0,t="";e<arguments.length;e++){t+=arguments[e]}return t}function echo(){{for(var e=0,t="";e<arguments.length;e++){var n=e===arguments.length-1?"":" | ";t+=arguments[e]+n}console.log(t)}}function leftSlice(e,t){return e.indexOf(t)>-1?e.slice(t.length):e}function truncateLeftAll(e){var t=e;t=leftSlice(t,"http://m.");t=leftSlice(t,"http://www.");t=leftSlice(t,"https://m.");t=leftSlice(t,"https://www.");t=leftSlice(t,"https://");t=leftSlice(t,"http://");return t}