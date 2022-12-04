var lkboxes={boxes:{bx:[],lk:[]}};
var cbCSS="margin-left: 0.17em !important;margin-right: 0.17em !important;outline-color: black !important;outline-width: 1px !important;outline-style: inset !important;outline-offset: -1px !important;";
var cbCSS_u="box-shadow: #167ac6 0em 0em 8px 2px !important;";
var cbCSS_c="box-shadow: #9043cc 0em 0em 8px 2px !important;";
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
	
	shrc.push(...curr.childNodes);
	
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
	let lks=getMatchingNodesShadow(document, 'A',true,false);

	for(let i=0, len=lks.length; i<len; i++){
			let cl=lks[i];
			let fnd=false;
			for(let k=0, len_k=lkboxes.boxes.lk.length; k<len_k; k++){
				let ck=lkboxes.boxes.lk[k];
					if(cl===ck){
						if(lkboxes.boxes.bx[k]!==null && typeof lkboxes.boxes.bx[k].parentElement !== 'undefined'){
							fnd=true;
						}else{
							lkboxes.boxes.lk=removeIndex(k,lkboxes.boxes.lk);
							lkboxes.boxes.bx=removeIndex(k,lkboxes.boxes.bx);
						}
						k=len_k-1;
				}
		}
		if(!fnd){				
						//Add box
						let ctn=document.createElement('SECTION');
						ctn.style.cssText="display: flex !important;align-items: flex-end !important;float: right !important;";
						let chkb=document.createElement('INPUT');
						chkb.style.cssText=cbCSS;
						chkb.type="checkbox";
						chkb.title=cl.href;
						chkb.parentLink=cl;
						let lkStyle=window.getComputedStyle(cl);
						chkb.og_textDecoration=lkStyle['text-decoration'];
						ctn.appendChild(chkb);
						cl.appendChild(ctn);
						lkboxes.boxes.lk.push(cl);
						lkboxes.boxes.bx.push(chkb);
						chkb.onclick=(e)=>{
							//e.preventDefault();
							e.stopPropagation();
							let t=e.target;
							t.style.cssText=cbCSS+(t.checked ? cbCSS_c : cbCSS_u );
							let ck=lkboxes.boxes.bx.filter((b)=>{return b.checked;});
							console.group('Linkboxes: ');
								console.log(ck);
								console.log(ck.map((b)=>{return b.title;}));
							console.groupEnd();
						};
						chkb.onpointerenter=(e)=>{
							//e.preventDefault();
							e.stopPropagation();
							let t=e.target;
							t.parentLink.style.setProperty('text-decoration','underline','important')
							t.style.cssText=cbCSS+(t.checked ? cbCSS_c : cbCSS_u );
						};
						chkb.onpointerleave=(e)=>{
							//e.preventDefault();
							e.stopPropagation();
							let t=e.target;
							t.parentLink.style.setProperty('text-decoration',t.og_textDecoration,'important')
							t.style.cssText=cbCSS;
						};
						//Added box
		}
	}
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