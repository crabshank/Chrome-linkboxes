var firstDone=false;
var lkboxes={bx:[]};
var logCSS="font-weight:bolder; font-size:2.5ch;";
var chg=window.location.href;
var addrs=[];
var slctrs=[];
var aChk=[];

function removeEls(d, arr) {
    return arr.filter((a)=>{return a!==d});
}

function findIndexTotalInsens(string, substring, index) {
    string = string.toLocaleLowerCase();
    substring = substring.toLocaleLowerCase();
    for (let i = 0; i < string.length ; i++) {
        if ((string.includes(substring, i)) && (!(string.includes(substring, i + 1)))) {
            index.push(i);
            break;
        }
    }
    return index;
}

function blacklistMatch(arr, t) {
    var found = false;
	var blSite='';
	var blSel='';
    var acheck = false;
    if (!((arr.length == 1 && arr[0] == "") || (arr.length == 0))) {
        ts = t.toLocaleLowerCase();
        for (var i = 0; i < arr.length; i++) {
            let spl = arr[i].split('*');
            spl = removeEls("", spl);

            var spl_mt = [];
            for (let k = 0; k < spl.length; k++) {
                var spl_m = [];
                findIndexTotalInsens(ts, spl[k], spl_m);

                spl_mt.push(spl_m);


            }

            found = true;

            if ((spl_mt.length == 1) && (typeof spl_mt[0][0] === "undefined")) {
                found = false;
            } else if (!((spl_mt.length == 1) && (typeof spl_mt[0][0] !== "undefined"))) {

                for (let m = 0; m < spl_mt.length - 1; m++) {

                    if ((typeof spl_mt[m][0] === "undefined") || (typeof spl_mt[m + 1][0] === "undefined")) {
                        found = false;
                        m = spl_mt.length - 2; //EARLY TERMINATE
                    } else if (!(spl_mt[m + 1][0] > spl_mt[m][0])) {
                        found = false;
                    }
                }

            }
            if(found){
            		blSite = arr[i];
					blSel = slctrs[i];
					acheck=aChk[i]
					i = arr.length - 1;
            }
        }
    }
    //console.log(found);
    return [found,blSite,blSel,acheck];

}

var isCurrentSiteBlacklisted = function(){
	return blacklistMatch(addrs, window.location.href);
}
var isBl=[];
async function start_up_storage(){
	return new Promise(function(resolve) {
		chrome.storage.local.get(null, function(items) {
							let setObj={}
							let setObjct=false;

							if(!!items.slc_list && typeof  items.slc_list!=='undefined'){
								slctrs=JSON.parse(items.slc_list);
							}else{
								setObj["slc_list"]='[]';
								setObjct=true;
							}
							if(!!items.addrs_list && typeof  items.addrs_list!=='undefined'){
								addrs=JSON.parse(items.addrs_list);
							}else{
								setObj["addrs_list"]='[]';
								setObjct=true;
							}
							if(!!items.auto_chk && typeof  items.auto_chk!=='undefined'){
								aChk=JSON.parse(items.auto_chk);
							}else{
								setObj["auto_chk"]='[false]';
								setObjct=true;
							}
								if(setObjct){
									chrome.storage.local.set(setObj, function() {
										chrome.storage.local.get(null, function(items) {
													 isBl=isCurrentSiteBlacklisted();
													resolve();
										});
									});
								}else{
									 isBl=isCurrentSiteBlacklisted();
									resolve();
								}
		});
	});
}


(async ()=>{
	await start_up_storage();
	if(isBl[3]){
		firstDone=true;
		start_up();
	}
})();

function sendToPopup(type,data,args){
	chrome.runtime.sendMessage({
					type: type,
                    data: data,
					args: args
                }, function (response) {;});
}

var fs={
				openAll: (n)=>{
					 sendToPopup('open',lkboxes.bx.filter((b)=>{return b.checked;}).map((b)=>{return b.parentLink.href;}),false);
				},
				openAllHib: (n)=>{
					sendToPopup('open',lkboxes.bx.filter((b)=>{return b.checked;}).map((b)=>{return b.parentLink.href;}),true);
				},
				checkAll: (n)=>{
					for(let k=0, len_k=lkboxes.bx.length; k<len_k; k++){
						let bk=lkboxes.bx[k];
						bk.checked=true;
					}
				},
				checkCSS: (c)=>{
					let cm=[];
					for(let k=0, len_k=lkboxes.bx.length; k<len_k; k++){
						let bk=lkboxes.bx[k];
						if(bk.parentLink.matches(c)){
							if(!bk.checked){
								bk.checked=true;
								cm.push([bk.parentLink,bk.parentLink.href,bk]);
							}
						}
					}
					if(cm.length>0){
						console.log({Description:`Linkboxes - Boxes for links with matching CSS that were unchecked and now checked (${window.location.href})`,Matching: cm});
					}
				},
				uncheckCSS: (c)=>{
					let ucm=[];
					for(let k=0, len_k=lkboxes.bx.length; k<len_k; k++){
						let bk=lkboxes.bx[k];
						if(bk.parentLink.matches(c)){
							if(bk.checked){
								bk.checked=false;
								ucm.push([bk.parentLink,bk.parentLink.href,bk]);
							}
						}
					}
					if(ucm.length>0){
						console.log({Description:`Linkboxes - Boxes for links with matching CSS that were checked and now unchecked (${window.location.href})`,Matching: ucm});
					}
				},
				logChecked: (n)=>{
					let chd=lkboxes.bx.filter((b)=>{return b.checked;});
					let chd1=chd.map((b)=>{return b.parentLink.href;});
					console.log({Description:`Linkboxes - All checked boxes (${window.location.href})`,hrefs: chd1.join('\n'),Checkboxes: chd});
				},
				logUnchecked: (n)=>{
					let uchd=lkboxes.bx.filter((b)=>{return !b.checked;});
					let uchd1=uchd.map((b)=>{return b.parentLink.href;});
					console.log({Description: `Linkboxes - All unchecked boxes (${window.location.href})`,hrefs: uchd1.join('\n'),Checkboxes: uchd});
				},
				logAll: (n)=>{
					console.log({Description: `Linkboxes - All boxes (${window.location.href})`,hrefs: lkboxes.bx.map((b)=>{return b.parentLink.href;}).join('\n'),Checkboxes: lkboxes.bx});
				},
				uncheckAll:  (n)=>{
					for(let k=0, len_k=lkboxes.bx.length; k<len_k; k++){
						let bk=lkboxes.bx[k];
						bk.checked=false;
					}
				}
}

function start_up(){
try{
var cbCSS="margin-left: 0.17em !important;margin-right: 0.17em !important;outline-color: black !important;outline-width: 1px !important;outline-style: inset !important;outline-offset: -1px !important; pointer-events: auto !important; min-height: 15px !important; min-width: 15px !important; filter: hue-rotate(247deg) contrast(1.65) !important";
var cbCSS_u="#167ac6 0em 0em 5px 2px";
var cbCSS_c="#9043cc 0em 0em 5px 2px";
var cbCSS_fixes=['box-shadow: ',' !important;'];

function elRemover(el){
	if(typeof el!=='undefined' && !!el){
	if(typeof el.parentNode!=='undefined' && !!el.parentNode){
		el.parentNode.removeChild(el);
	}
	}
}
function remove_chk(b){
	let s=b.parentSct;
	elRemover(b);
	if(!!s && typeof s!=='undefined'){
		elRemover(s);
	}
}

function passthroughBox(pj,cl){
			pj.dispatchEvent(new Event('pointerleave'));
			
			cl.onpointerenter=(e)=>{
				if(	
						( e.offsetX>=pj.offsetLeft && e.offsetX<=pj.offsetLeft+pj.offsetWidth &&
						e.offsetY>=pj.offsetTop && e.offsetY<=pj.offsetTop+pj.offsetHeight ) ||
							(e.target === pj || e.target === pj.parentSct)
					){
						pj.dispatchEvent(new Event('pointerenter'));
					}
			}		
			cl.onpointermove=(e)=>{
				if(	
						( e.offsetX>=pj.offsetLeft && e.offsetX<=pj.offsetLeft+pj.offsetWidth &&
						e.offsetY>=pj.offsetTop && e.offsetY<=pj.offsetTop+pj.offsetHeight ) ||
							(e.target === pj || e.target === pj.parentSct)
					){
						pj.dispatchEvent(new Event('pointerenter'));
					}else{
						pj.dispatchEvent(new Event('pointerleave'));
					}
			}
			cl.onpointerleave=(e)=>{
						pj.dispatchEvent(new Event('pointerleave'));
			}
			cl.onclick=(e)=>{
				if(	
						e.offsetX>=pj.offsetLeft && e.offsetX<=pj.offsetLeft+pj.offsetWidth &&
						e.offsetY>=pj.offsetTop && e.offsetY<=pj.offsetTop+pj.offsetHeight
					){
						e.preventDefault();
						e.stopPropagation();
						pj.checked=!pj.checked;
					}
			}
			cl.onpointerdown=(e)=>{
				if(	
						e.offsetX>=pj.offsetLeft && e.offsetX<=pj.offsetLeft+pj.offsetWidth &&
						e.offsetY>=pj.offsetTop && e.offsetY<=pj.offsetTop+pj.offsetHeight
					){
						e.preventDefault();
						e.stopPropagation();
					}
			}
}

function keepMatchesShadow(els,slcArr,isNodeName){
   if(slcArr[0]===false){
      return els;
   }else{
		let out=[];
		for(let i=0, len=els.length; i<len; i++){
		  let n=els[i];
				for(let k=0, len_k=slcArr.length; k<len_k; k++){
					let sk=slcArr[k];
					if(isNodeName){
						if((n.nodeName.toLocaleLowerCase())===sk){
							out.push(n);
						}
					}else{ //selector
						   if(!!n.matches && typeof n.matches!=='undefined' && n.matches(sk)){
							  out.push(n);
						   }
					}
				}
		}
		return out;
   	}
}

function getMatchingNodesShadow(docm, slc, isNodeName, onlyShadowRoots){
	let slcArr=[];
	if(typeof(slc)==='string'){
		slc=(isNodeName && slc!==false)?(slc.toLocaleLowerCase()):slc;
		slcArr=[slc];
	}else if(typeof(slc[0])!=='undefined'){
		for(let i=0, len=slc.length; i<len; i++){
			let s=slc[i];
			slcArr.push((isNodeName && slc!==false)?(s.toLocaleLowerCase()):s)
		}
	}else{
		slcArr=[slc];
	}
	var shrc=[docm];
	var shrc_l=1;
	var out=[];
	let srCnt=0;

	while(srCnt<shrc_l){
		let curr=shrc[srCnt];
		let sh=(!!curr.shadowRoot && typeof curr.shadowRoot !=='undefined')?true:false;
		let nk=keepMatchesShadow([curr],slcArr,isNodeName);
		let nk_l=nk.length;
		
		if( !onlyShadowRoots && nk_l>0){
			for(let i=0; i<nk_l; i++){
				out.push(nk[i]);
			}
		}
		
		for(let i=0, len=curr.childNodes.length; i<len; i++){
			shrc.push(curr.childNodes[i]);
		}
		
		if(sh){
			   let cs=curr.shadowRoot;
			   let csc=[...cs.childNodes];
			   if(onlyShadowRoots){
				  if(nk_l>0){
				   out.push({root:nk[0], childNodes:csc});
				  }
			   }
				for(let i=0, len=csc.length; i<len; i++){
					shrc.push(csc[i]);
				}
		}

		srCnt++;
		shrc_l=shrc.length;
	}
	
	return out;
}

function removeIndex(d, arr){
	return arr.filter((i,index)=>{return index!==d;});
}

function placeBoxes() {
	if(firstDone && window.location.href!==chg){
		window.location.reload(true);
		window.location.href===chg;
		return;
	}
	let nn=true
	let slct='A';
	if(isBl[0] && isBl[2]!==''){
		slct=isBl[2];
		nn=false;
	}
	let lks=getMatchingNodesShadow(document, slct,nn,false);

	for(let i=0, len=lks.length; i<len; i++){
		let cl=lks[i];
		let clh=cl.href;
		if(clh!==null && clh.trim()!==''){	
				let fnd=false;
				for(let k=0, len_k=lkboxes.bx.length; k<len_k; k++){
					let ck=lkboxes.bx[k];
						if(cl===ck.parentLink){
								fnd=true;
								ck.title=clh;
								k=len_k-1;
					}
			}
			
			
			if(!fnd){

							//Add box
							cl.style.setProperty('pointer-events','auto','important');
							let ctn=document.createElement('SECTION');
							ctn.style.cssText="display: flex !important;align-items: flex-end !important;float: right !important;";
							let chkb=document.createElement('INPUT');
							chkb.style.cssText=cbCSS;
							chkb.type="checkbox";
							chkb.title=clh;
							chkb.parentLink=cl;
							chkb.parentSct=ctn;
							let lkStyle=window.getComputedStyle(cl);
							chkb.og_textDecoration={};
							chkb.og_textDecoration['text-decoration-line']= lkStyle['text-decoration-line'];
							chkb.og_textDecoration['text-decoration-style']= lkStyle['text-decoration-style'];
							chkb.og_textDecoration['text-decoration-thickness']= lkStyle['text-decoration-thickness'];
							chkb.og_textDecoration['text-decoration-color']= lkStyle['text-decoration-color'];
							chkb.og_textDecoration['box-shadow']= lkStyle['box-shadow'];
							ctn.appendChild(chkb);
							cl.insertAdjacentElement('afterbegin',ctn);
							ctn.style.setProperty('pointer-events','auto','important');
							lkboxes.bx.push(chkb);
							chkb.onpointerdown=(e)=>{
								e.preventDefault();
								e.stopPropagation();
							}
							chkb.onclick=(e)=>{
								//e.preventDefault();
								e.stopPropagation();
								let t=e.target;
								t.parentLink.style.setProperty('text-decoration-color',(t.checked ?'#9043cc':'#167ac6'),'important');
								t.style.cssText=cbCSS+cbCSS_fixes[0]+(t.checked ? cbCSS_c : cbCSS_u )+cbCSS_fixes[1];
								t.parentLink.style.setProperty('box-shadow',(t.checked ? cbCSS_c : cbCSS_u ),'important');
							};
							chkb.onpointerenter=(e)=>{
								//e.preventDefault();
								e.stopPropagation();
								let t=e.target;
								t.parentLink.style.setProperty('text-decoration-line','underline','important');
								t.parentLink.style.setProperty('text-decoration-style','solid','important');
								t.parentLink.style.setProperty('text-decoration-thickness','2px','important');
								t.parentLink.style.setProperty('text-decoration-color',(t.checked ?'#9043cc':'#167ac6'),'important');
								t.style.cssText=cbCSS+cbCSS_fixes[0]+(t.checked ? cbCSS_c : cbCSS_u )+cbCSS_fixes[1];
								t.parentLink.style.setProperty('box-shadow',(t.checked ? cbCSS_c : cbCSS_u ),'important');
							};
							chkb.onpointerleave=(e)=>{
								//e.preventDefault();
								e.stopPropagation();
								let t=e.target;
								t.parentLink.style.setProperty('text-decoration-line',chkb.og_textDecoration['text-decoration-line']);
								t.parentLink.style.setProperty('text-decoration-style',chkb.og_textDecoration['text-decoration-style']);
								t.parentLink.style.setProperty('text-decoration-thickness',chkb.og_textDecoration['text-decoration-thickness']);
								t.parentLink.style.setProperty('text-decoration-color',chkb.og_textDecoration['text-decoration-color']);
								t.parentLink.style.setProperty('box-shadow',chkb.og_textDecoration['box-shadow']);
								t.style.cssText=cbCSS;
							};
							
							let inp=[...cl.getElementsByTagName('INPUT')].filter( (c) => {return c.type==='checkbox'});
							for(let j=0, len_j=inp.length; j<len_j; j++){
								let pj=inp[j];
								let chp=(!!pj.parentLink && typeof pj.parentLink !=='undefined' && !!pj.parentSct && typeof pj.parentSct !=='undefined')?true:false;
								if(!chp){
									remove_chk(pj);
								}else{
									pj.dispatchEvent(new Event('pointerleave'));
									let ist=pj.style.cssText;
									pj.dispatchEvent(new Event('pointerenter'));
									if(pj.style.cssText===ist){
										remove_chk(pj);
									}else{
										passthroughBox(pj,cl);
									}
								}
							}
							//Added box
			}
		}
	}
	let nwb=[];
	for(let k=0, len_k=lkboxes.bx.length; k<len_k; k++){
		let ck=lkboxes.bx[k];
		for(let i=0, len_i=lks.length; i<len_i; i++){
					let cl=lks[i];
					if(cl===ck.parentLink){
							nwb.push(lkboxes.bx[k]);
							i=len_i-1;
					}
		}
	}
	lkboxes.bx=nwb;
}

if(typeof observer ==="undefined" && typeof timer ==="undefined"){
	var timer;
	var timer_tm=null;
const observer = new MutationObserver((mutations) =>
{

	if(timer){
		clearTimeout(timer);
		if(performance.now()-timer_tm>=200){
			placeBoxes();
			timer_tm=performance.now();
		}
	}
	
	timer = setTimeout(() =>
	{
		placeBoxes();
		timer_tm=performance.now();
	}, 100);
	
	if(timer_tm ===null){
		timer_tm=performance.now();
	}
});


observer.observe(document, {
	subtree: true,
	childList: true,
	attributes: true,
	attributeOldValue: true,
	characterData: true,
	characterDataOldValue: true
});
		
}
placeBoxes();
}catch(e){;}
}



function gotMessage(message, sender, sendResponse) {
    let m=message.message;
        if(m==="Scan!" && !firstDone){
			firstDone=true;
            start_up();
		}else if(m!=="Scan!" && firstDone){
			fs[m[0]](m[1]);
		}
}

chrome.runtime.onMessage.addListener(gotMessage);