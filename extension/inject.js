var scriptElement=document.createElement('script');
scriptElement.src = chrome.extension.getURL('main.js');
scriptElement.onload = function(){this.remove();};
(document.head||document.documentElement).appendChild(scriptElement);
