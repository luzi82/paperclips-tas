var scriptElement=document.createElement('script');
scriptElement.src = chrome.extension.getURL('main.js');
scriptElement.onload = function(){this.remove();};
(document.head||document.documentElement).appendChild(scriptElement);

var xmlHttp = null;
xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", chrome.extension.getURL ("main.html"), true );
xmlHttp.onload=function(){
    var mainElement = document.createElement("div");
    mainElement.innerHTML = xmlHttp.responseText;
    document.body.appendChild (mainElement);
}
xmlHttp.send( null );
