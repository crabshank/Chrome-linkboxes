var firstDone=false;
var lkboxes={bx:[]};
var logCSS="font-weight:bolder; font-size:2.5ch;";
var chg=window.location.href;

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
					console.log('%cLinkboxes - Boxes for links with matching CSS that were unchecked and now checked (%s):',logCSS ,window.location.href);
					console.log(cm);
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
					console.log('%cLinkboxes - Boxes for links with matching CSS that were checked and now unchecked (%s):', logCSS ,window.location.href);
					console.log(ucm);
					}
				},
				logChecked: (n)=>{
					console.log('%cLinkboxes - All checked boxes (%s):', logCSS ,window.location.href);
					console.log(lkboxes.bx.filter((b)=>{return b.checked;}));
				},
				logUnchecked: (n)=>{
					console.log('%cLinkboxes - All unchecked boxes (%s):', logCSS ,window.location.href);
					console.log(lkboxes.bx.filter((b)=>{return !b.checked;}));
				},
				logAll: (n)=>{
					console.log('%cLinkboxes - All boxes (%s):', logCSS ,window.location.href);
					console.log(lkboxes.bx);
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
}
function keepMatchesShadow(els,slc,isNodeName){
   if(slc===false){
      return els;
   }else{
      let out=[];
   for(let i=0, len=els.length; i<len; i++){
      let n=els[i];
           if(isNodeName){
	            if((n.nodeName.toLocaleLowerCase())===slc){
	                out.push(n);
	            }
           }else{ //selector
	               if(!!n.matches && typeof n.matches!=='undefined' && n.matches(slc)){
	                  out.push(n);
	               }
           }
   	}
   	return out;
   	}
}

function getMatchingNodesShadow(docm, slc, isNodeName, onlyShadowRoots){
slc=(isNodeName && slc!==false)?(slc.toLocaleLowerCase()):slc;
var shrc=[docm];
var shrc_l=1;
var out=[];
let srCnt=0;

while(srCnt<shrc_l){
	let curr=shrc[srCnt];
	let sh=(!!curr.shadowRoot && typeof curr.shadowRoot !=='undefined')?true:false;
	let nk=keepMatchesShadow([curr],slc,isNodeName);
	let nk_l=nk.length;
	
	if( !onlyShadowRoots && nk_l>0){  
		out.push(...nk);
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
			   shrc.push(...csc);
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
	let lks=getMatchingNodesShadow(document, 'A',true,false);

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