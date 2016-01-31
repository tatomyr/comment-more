// ==UserScript==
// @name CommentMore
// @namespace comment-more
// @description	comment on any web page
// @include http*
// @version 0.71
// @require http://localhost:3000/jquery/jquery-1.12.0.min.js
// @require http://localhost:3000/jquery-ui-1.11.4.custom/jquery-ui.min.js
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==
var CMVersion="0.71";var hostDomain="http://localhost:3000/";var CMLogin="У мене чудова новина!";var CMPassword="12345678";var cookiesExp=3600*24*365;var collapsed=1;var oldWebPage=location.href;var lastDateTime=0;var ajaxInProcess=false;var commentsCount={local:0,all:0};(function(){if(window.top===window.self)commentMore()})();function commentMore(){setInterval(function(){if(!collapsed||location.href!==oldWebPage)getComments()},15*1e3);setTimeout(function(){setAppPanel();setEnvironmentDisplay();getComments()},2e3)}function applyStyle(){var e=Math.round(document.documentElement.clientHeight*.6)+"px";var t=getCookie("app_panel_background")||"145 , 207 , 142 , 0.9";$(".cm-font").css({font:"12px   Arial "});$(".cm-black").css({color:"black"});$(".cm-grey").css({color:"grey"});$(".cm-red").css({color:"red"});$(".cm-buttons").css({background:"transparent",border:"0",margin:"0px",padding:"1px"});$(".cm-link").css({"text-decoration":"none"});$(".cm-comment-tab").css({background:"white",padding:"3px","margin-bottom":"10px"});$("#cm-app-panel").css({width:"300px",border:"1px solid #DFDFDF","border-radius":"10px 10px 0px 0px",background:str("rgba( ",t," )"),margin:"0px",padding:"10px 10px 5px 10px",position:"fixed","z-index":"1023"});$("#cm-comments-area").css({"margin-top":"10px","margin-bottom":"10px","max-height":e,overflow:"auto"});$(".cm-sans-padding-sans-margin").css({padding:"0px",margin:"0px"});$("textarea#cm-user-comment").css({width:"100%","min-width":"auto","max-width":"auto",resize:"vertical",overflow:"auto","margin-bottom":"0px"});$("#cm-post-comment").css({width:"100%"})}function setAppPanel(){echo("CommentMore panel starts");var e=document.createElement("div");e.id="cm-app-panel";e.innerHTML=str("<div id='cm-app-head' style='text-align:right;' class='cm-sans-padding-sans-margin ' >","<div style='float:left;' class='cm-sans-padding-sans-margin ' >","<button id='cm-toggle-button' class='cm-buttons cm-font cm-black ' ></button>","<button id='cm-toggle-env-comm-button' class='cm-buttons cm-font cm-black ' >","<span id='cm-toggle-env-comm-ico' class='cm-font cm-black cm-sans-padding-sans-margin' ></span>"," ","<span id='cm-comments-count' class='cm-font cm-black cm-sans-padding-sans-margin ' ></span>","</button>","</div> ","<span id='cm-app-status' class='cm-font cm-black cm-sans-padding-sans-margin ' > </span> ","<span class='cm-font cm-grey cm-sans-padding-sans-margin ' ><a href='",hostDomain,"' title='Project site' target=blank class='cm-link cm-font cm-grey ' ><b>CommentMore</a></b><sup id='cm-version' class='cm-grey ' > ",CMVersion," </sup></span>","</div>","<div id='cm-enhanced-area' style='display:none; ' >","<div id='cm-comments-area' ></div>","<textarea id='cm-user-comment' placeholder='Your comment' class='cm-font cm-black cm-sans-padding-sans-margin ' ></textarea>","<button id='cm-post-comment' class='cm-buttons cm-font cm-black ' >Post comment as ",CMLogin,"</button> ","</div>");document.body.appendChild(e);applyStyle();$("#cm-toggle-button").click(toggleAppPanel);$("#cm-post-comment").click(postComment);$("#cm-toggle-env-comm-button").click(toggleEnvComments);echo("panel height",$("#cm-app-panel").css("height"));e.style.bottom=str(-parseInt($("#cm-app-panel").css("height")),"px");$("#cm-toggle-button").text("▲");$("#cm-toggle-button").attr({title:"Toggle comments"});collapsed=1;$(e).animate({bottom:0},500);appPanelHorizontalPositioning(e)}function appPanelHorizontalPositioning(e){if(getCookie("cm_appPanelLeft")){echo("start from L");e.style.left=getCookie("cm_appPanelLeft")}else{e.style.right=getCookie("cm_appPanelRight")||"50px";echo("start from R")}echo("cookie | right:",getCookie("cm_appPanelRight"),"left:",getCookie("cm_appPanelLeft"));$("#cm-app-panel").draggable({axis:"x",handle:"div#cm-app-head",stop:function(e,t){$("#cm-app-panel").css({top:"auto"});var o=Math.max(0,parseInt($("#cm-app-panel").css("right")));if(isNaN(o))o=Math.max(0,document.body.clientWidth-parseInt($("#cm-app-panel").css("left"))-parseInt($("#cm-app-panel").css("width")));var a=Math.max(0,parseInt($("#cm-app-panel").css("left")));if(o==="auto"||o>a){setCookie("cm_appPanelRight","",{path:"/",expires:-1});setCookie("cm_appPanelLeft",a+"px",{path:"/",expires:cookiesExp});echo("from left",a)}else{setCookie("cm_appPanelRight",o+"px",{path:"/",expires:cookiesExp});setCookie("cm_appPanelLeft","",{path:"/",expires:-1});echo("from right",o)}}})}function toggleAppPanel(){if(collapsed){$("div#cm-enhanced-area").css({display:"block"});$("#cm-toggle-button").text("▼");collapsed=false}else{$("div#cm-enhanced-area").css({display:"none"});$("#cm-toggle-button").text("▲");collapsed=1}}function toggleEnvComments(){if(getCookie("cm_localCommentsOnly")){setCookie("cm_localCommentsOnly","",{path:"/",expires:-1})}else{setCookie("cm_localCommentsOnly",1,{path:"/",expires:cookiesExp})}setEnvironmentDisplay()}function setEnvironmentDisplay(){if(getCookie("cm_localCommentsOnly")){$("#cm-toggle-env-comm-ico").text("☂");$("#cm-toggle-env-comm-button").attr({title:"Switch to all comments"});$(".cm-external-comments").css({display:"none"});$("#cm-comments-count").text(commentsCount.local)}else{$("#cm-toggle-env-comm-ico").text("☀");$("#cm-toggle-env-comm-button").attr({title:"Switch to local comments"});$(".cm-external-comments").css({display:"block"});$("#cm-comments-count").text(commentsCount.all)}}function getComments(e){if(ajaxInProcess){echo(">>> ajax in process. get omitted");return undefined}ajaxInProcess=true;echo("[get comments]");$("#cm-app-status").text(" ⌛ ");var t=document.getElementById("cm-comments-area");if(location.href!==oldWebPage){echo(oldWebPage,location.href);oldWebPage=location.href;t.innerHTML="";lastDateTime=0;commentsCount={local:0,all:0}}$.ajax({url:str(hostDomain,"AJAX/get-comments"),dataType:"json",method:"post",data:{webPage:location.href,lastDateTime:lastDateTime},success:function(o){echo("Success get");$("#cm-app-status").text(" ");for(key in o.answer){var a=document.createElement("div");var n=o.answer[key];var c=truncateLeftAll(n.webPage);var s=truncateLeftAll(location.href);a.className=c===s?"cm-comment-tab cm-font cm-black ":"cm-comment-tab cm-font cm-grey cm-external-comments ";if(c===s)commentsCount.local++;commentsCount.all++;var m=new Date(n.dateTime);m=str(m.getDate(),".",m.getMonth()+1,".",m.getFullYear()," ",m.getHours(),":",m.getMinutes());a.innerHTML=str("<b>",n.author,"</b> (",m,"):<br>",n.userComment.replace(/\n/g,"<br>"),c===s?" ":str(" <a class='cm-link cm-font cm-grey ' href='",n.webPage,"' >➦</a>"));a.title=str(n.webPageTitle,"\n",n.webPage);t.appendChild(a);if(n.dateTime>lastDateTime)lastDateTime=n.dateTime}applyStyle();if(e)t.scrollTop=t.scrollHeight;setEnvironmentDisplay();ajaxInProcess=false},error:function(){echo("Error get comment");$("#cm-app-status").text(" error ");ajaxInProcess=false}})}function getCommentsGET(e){if(ajaxInProcess){echo(">>> ajax in process. get omitted");return undefined}ajaxInProcess=true;echo("[get comments]");$("#cm-app-status").text(" ⌛ ");var t=document.getElementById("cm-comments-area");if(location.href!==oldWebPage){echo(oldWebPage,location.href);oldWebPage=location.href;t.innerHTML="";lastDateTime=0;commentsCount={local:0,all:0}}$.get(str(hostDomain,"AJAX/GET/get-comments/?webPage=",webPage,"&lastDateTime=",lastDateTime),function(o){echo("Success get");$("#cm-app-status").text(" ");for(key in o.answer){var a=document.createElement("div");var n=o.answer[key];var c=truncateLeftAll(n.webPage);var s=truncateLeftAll(location.href);a.className=c===s?"cm-comment-tab cm-font cm-black ":"cm-comment-tab cm-font cm-grey cm-external-comments ";if(c===s)commentsCount.local++;commentsCount.all++;var m=new Date(n.dateTime);m=str(m.getDate(),".",m.getMonth()+1,".",m.getFullYear()," ",m.getHours(),":",m.getMinutes());a.innerHTML=str("<b>",n.author,"</b> (",m,"):<br>",n.userComment.replace(/\n/g,"<br>"),c===s?" ":str(" <a class='cm-link cm-font cm-grey ' href='",n.webPage,"' >➦</a>"));a.title=str(n.webPageTitle,"\n",n.webPage);t.appendChild(a);if(n.dateTime>lastDateTime)lastDateTime=n.dateTime}applyStyle();if(e)t.scrollTop=t.scrollHeight;setEnvironmentDisplay();ajaxInProcess=false})}function postComment(){echo("[post comment]");$("#cm-app-status").text(" ⌛ ");var e=$("#cm-user-comment").val();if(e){$("#cm-user-comment").val("");$.ajax({url:str(hostDomain,"AJAX/post-comment"),dataType:"json",method:"post",data:{webPage:location.href,webPageTitle:document.title,CMLogin:CMLogin,CMPassword:CMPassword,userComment:e},success:function(e){echo("post: Success",e.answer);$("#cm-app-status").text(" ");getComments(1)},error:function(){echo("Error post");$("#cm-app-status").text(" error ");playSound("http://wav-library.net/effect/windows/xp/windows_xp_-_kriticheskaya_oshibka.mp3")}})}}function playSound(e){var t=new Audio;t.src=e;t.autoplay=true}function setCookie(e,t,o){o=o||{};var a=o.expires;if(typeof a=="number"&&a){var n=new Date;n.setTime(n.getTime()+a*1e3);a=o.expires=n}if(a&&a.toUTCString){o.expires=a.toUTCString()}t=encodeURIComponent(t);var c=e+"="+t;for(var s in o){c+="; "+s;var m=o[s];if(m!==true){c+="="+m}}document.cookie=c}function getCookie(e){var t=document.cookie.match(new RegExp("(?:^|; )"+e.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,"\\$1")+"=([^;]*)"));return t?decodeURIComponent(t[1]):undefined}function scrollToElement(e){if(typeof e==="string")e=document.getElementById(e);var t=0;var o=0;while(e!=null){t+=e.offsetLeft;o+=e.offsetTop;e=e.offsetParent}window.scrollTo(0,o)}function scrollToElement(e){if(typeof e==="string")e=document.getElementById(e);var t=0;var o=0;while(e!=null){t+=e.offsetLeft;o+=e.offsetTop;e=e.offsetParent}window.scrollTo(0,o)}function str(){for(var e=0,t="";e<arguments.length;e++){t+=arguments[e]}return t}function echo(){{for(var e=0,t="";e<arguments.length;e++){var o=e===arguments.length-1?"":" | ";t+=arguments[e]+o}console.log(t)}}function leftSlice(e,t){return e.indexOf(t)>-1?e.slice(t.length):e}function truncateLeftAll(e){var t=e;t=leftSlice(t,"http://m.");t=leftSlice(t,"http://www.");t=leftSlice(t,"https://m.");t=leftSlice(t,"https://www.");t=leftSlice(t,"https://");t=leftSlice(t,"http://");return t}