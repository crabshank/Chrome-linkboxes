let ccb=document.getElementById('checkCSS')
let ccbu=document.getElementById('uncheckCSS')
let txtar=document.getElementById('txta');
ccb.txt_area=txtar;
ccbu.txt_area=txtar;
var tbs=[];

async function opn(chkd,disc) {
					return new Promise(function(resolve) {
						if(chkd.length>0){
									var count=chkd.length;
									for(let i=chkd.length-1; i>=0; i--){
										let addr=chkd[i];
										try{
											chrome.tabs.create({
												url: addr,
												active: false		
											}, function(tab){
													count--;
													if(disc){
														tbs.push({id: tab.id});
													}
													if(count===0){
														resolve();
													}
											});
										}catch(e){
												count--;
												if(count===0){
													resolve();
												}
										}
									}
						}else{
							resolve();
						}
				});
};

async function hst(chkd,rem) {
					return new Promise(function(resolve) {
						if(chkd.length>0){
									var count=chkd.length;
									for(let i=chkd.length-1; i>=0; i--){
										let addr=chkd[i];
										try{
											if(rem===true){
												 chrome.history.deleteUrl({
													url: addr
												}, function() {
														count--;
														if(count===0){
															resolve();
														}
												});
											}else{
												chrome.history.addUrl({
													url: addr
												}, function() {
														count--;
														if(count===0){
															resolve();
														}
												});
											}
										}catch(e){
												count--;
												if(count===0){
													resolve();
												}
										}
									}
						}else{
							resolve();
						}
				});
};

async function tabs_discard(d){
	return new Promise(function(resolve) {
				chrome.tabs.discard(d, function(tab){
						resolve();
				});
	});
}

function replaceTabs(r,a){
	let ix=tbs.findIndex((t)=>{return t.id===r;}); if(ix>=0){
		tbs[ix].id=a;
	}
}

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
	replaceTabs(removedTabId,addedTabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(changeInfo.url){
		let ix=tbs.findIndex((t)=>{return t.id===tabId;}); if(ix>=0){
			(async ()=>{ await tabs_discard(tabId); })();
			tbs=tbs.filter((t)=>{return t.id!==tabId;});
		}
	}
});

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
 
 chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if(message.type==="open"){
		(async ()=>{ await opn(message.data,message.args); })();
	}else if(message.type==="hist"){
		(async ()=>{ await hst(message.data,message.args); })();
	}
});
 
 //setTimeout(function(){window.close();}, 2000);