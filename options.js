var sts=document.getElementById("stats");
var svbt=document.getElementById("save");

function setHeights(sc){
			[...sc.children].forEach((k)=>{
				k.style.height='min-content';
				k.style.height=k.scrollHeight+3;
		});
}

let chk=function(sci,init){
	let u=sci.children[0];
	let f=sci.children[1];
	let k=sci.children[2].firstElementChild;

let sct2=[...document.querySelectorAll('SECTION.site_sets')];
	if (
		((u.value!="" && (f.value!="" || k.checked===true))&&(sct2.length==1))
		||((u.value!="" && (f.value!="" || k.checked===true))&&(init!=1)&&(sct2.length>1))
	){
		forceNewSct(sci);
	}else if(
		(u.value=="" && f.value=="")&&(sct2.length>1)&&(init!=2)
	){
		sci.remove();
	}
}

function checkNew(scs){
	setHeights(scs);
	let tst=[...document.querySelectorAll('SECTION.site_sets')];
	if (scs===tst[tst.length-1]){
		let n=0;
		let force2=true;
		if(tst.length>1){
			for (let i=tst.length-2; i>=0; i--){
				let sci=tst[i]
				let u=sci.children[0];
				let f=sci.children[1];
				let k=sci.children[2].firstElementChild;
				if ( u.value=="" && (f.value=="" || k.checked===false) ){
					force2=false;
					break
				}
			}
			if(force2){
				n=2;
			}
		}
		chk(scs,n);
	}else{
		chk(scs,1);
	}
}

function create_sct(){
		let sc=document.createElement('section');
		sc.className='site_sets';
		sc.innerHTML='<textarea placeholder="URL (Use asterisks with slashes)" style="box-shadow: 0 0 0px 1px black; border-width: 0px; width: 40%;"></textarea><textarea placeholder="CSS selector (Do not use any quotation marks)" style="box-shadow: black 0px 0px 0px 1px;border-width: 0px;margin-left: 0.16%; width: 60%;"></textarea><label for="autoChk" style="text-wrap: nowrap; margin-left: 1ch; padding-top: 1ch;">Auto-generate linkboxes: <input type="checkbox" id="autoChk" style="transform: translate(-0.55ch,0.3ch);"></label><br><br>';
		let scc=[...sc.children];
		scc[0].onfocus= function(event){
				checkNew(event.target.parentElement);
		}
		scc[1].onfocus= function(event){
				checkNew(event.target.parentElement);
		}
		return sc;
}

let sc1=create_sct();
sts.insertAdjacentElement('beforebegin', sc1);
setHeights(sc1);
		
let sct=[...document.querySelectorAll('SECTION.site_sets')];
function forceNewSct(sci){
		let sc=create_sct();
		sci.insertAdjacentElement('afterend', sc);
		setHeights(sc);
		sc.oninput= function(event){
				let t=event.target;
				if(t.tagName==='INPUT' && t.type==='checkbox'){
					checkNew(event.target.parentElement.parentElement);
				}else{
					checkNew(event.target.parentElement);
				}
		}
		return sc;
}

sct[0].oninput= function(event){
	chk(sct[0],1);
	setHeights(sct[0]);
}

function removeEls(d, array){
	var newArray = [];
	for (let i = 0; i < array.length; i++)
	{
		if (array[i] !== d)
		{
			newArray.push(array[i]);
		}
	}
	return newArray;
}

function unDef(v,d,r){
	if(typeof r==='undefined'){
		return (typeof v !=='undefined')?v:d;
	}else{
		return (typeof v !=='undefined')?r:d;
	}
}

function setAddrCSS(vs,ix){
	let arr=JSON.parse(vs);
	for(let i=0, len=arr.length; i<len; i++){
		let sss=[...document.querySelectorAll('SECTION.site_sets')];
		let ss=sss[i];
		if(i>sss.length-1){
			ss=forceNewSct(sss[sss.length-1]);
		}
		if(ix===-2){
			ss.children[2].firstElementChild.checked=arr[i];
		}else{
			ss.children[ix].value=arr[i];
		}
		setHeights(ss);
	}
	let sss=[...document.querySelectorAll('SECTION.site_sets')];
	checkNew(sss[sss.length-1]);
}

var saver =function(){
		let scts=[...document.querySelectorAll('SECTION.site_sets')];
		let addrs=[];
		let slcs=[];
		let achk=[];
	let validate = true;	
	for(let k=0, len=scts.length; k<len; k++){

	let lstChk = scts[k].children[0].value.trim();
	let slct = scts[k].children[1].value.trim();
	let autoChk = scts[k].children[2].firstElementChild.checked;

	if(lstChk!=='' && (slct!=='' || autoChk===true)){
		if (lstChk.split('/').length != 1)
		{

			if (lstChk.split('://')[0] == "")
			{
				console.warn(lstChk + ' is invalid');
				validate = false;
				k=len-1;
			}

			if (lstChk.split('://')[lstChk.split('://').length + 1] == "")
			{
				console.warn(lstChk + ' is invalid');
				validate = false;
				k=len-1;
			}

			if (lstChk.split('://').join('').split('/').length !== removeEls("", lstChk.split('://').join('').split('/')).length)
			{
				console.warn(lstChk + ' is invalid');
				validate = false;
				k=len-1;
			}

		}
	
		if (validate){
			addrs.push(lstChk);
			slcs.push(slct);
			achk.push(autoChk);
		}
	}

}
	if (validate)
	{
		

			chrome.storage.local.remove(['addrs_list','slc_list','auto_chk'],function() {
		chrome.storage.local.set(
		{
			addrs_list: JSON.stringify(addrs),
			slc_list: JSON.stringify(slcs),
			auto_chk: JSON.stringify(achk)
		}, function()
		{
			sts.innerText = 'Options saved.';
			setTimeout(function()
			{
				sts.innerText = '';
			}, 1250);
		});
			});
			
}else{
	alert('Blacklist textarea contents invalid!');
}
	 }
 
function restore_options()
{
	if(typeof chrome.storage==='undefined'){
		restore_options();
	}else{
	chrome.storage.local.get(null, function(items)
		{
				//console.log(items);
				setAddrCSS(unDef(items.addrs_list,'[]'),0);
				setAddrCSS(unDef(items.slc_list,'[]'),1);
				setAddrCSS(unDef(items.auto_chk,'[false]'),-2);
				svbt.onclick = () => saver();
		});
	}
}

restore_options();