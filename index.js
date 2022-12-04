let ccb=document.getElementById('checkCSS')
let ccbu=document.getElementById('uncheckCSS')
let txtar=document.getElementById('txta');
ccb.txt_area=txtar;
ccbu.txt_area=txtar;

window.onclick=(e)=>{
	t=e.target;
	if(t===ccb || t===ccbu){
		send([t.id,t.txt_area.value]);
	}else if(t.tagName==='BUTTON'){
		send([t.id,null]);
	}
};

function setHeight(el){
				el.style.height='min-content';
				el.style.height=(el.scrollHeight)+'px';
}

txtar.oninput=(e)=>{
	setHeight(e.target);
};

function send(message) {

    let params = {
      active: true,
      currentWindow: true
    }
    chrome.tabs.query(params, gotTabs);

    function gotTabs(tabs) {
      let msg = {
        message: message
      };
      chrome.tabs.sendMessage(tabs[0].id, msg);
    }

}
 send("Scan!");
 
 //setTimeout(function(){window.close();}, 2000);