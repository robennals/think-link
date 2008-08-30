
var oldselection = null;
var defaultBrowser = null;

function getel(id){
	return document.getElementById(id);
}

var savemode = false;
var expandcommand = "expand";
var params = ""

function initParams(){
	if(getel("pointname")){
			savemode = true;
			expandcommand = "expandfolder";
			params = "savemode=true";
	}
}

initParams();
window.addEventListener("load",function(){initParams()},true);

function setDefaultBrowser(idnum){
	defaultBrowser = idnum;
}

function getDefaultBrowserNode() {
	return document.getElementById('container-'+defaultBrowser);
}

var selectedId;
var selectedDivId;
var selectedCls;

function selectItem(div,itemid,divid,cls){
	if(renameItem && divid != selectedDivId){
		editFinished();
	}
	if(oldselection){
		if(selectedCls == "Oppose" || selectedCls == "Support"){
			oldselection.className = "relationtitle";
		}else{
			oldselection.className = "dragitem";		
		}
		if(selectedDivId == divid){
			return;
		}
	}

	selectedId = itemid;
	selectedDivId = divid;
	selectedCls = cls;
	
	if(selectedCls == "Oppose" || selectedCls == "Support"){
		div.className = "relationtitle relationtitle_selected";
	}else{
		div.className = "dragitem dragitem_selected";
	}
	oldselection = div;
	
	var preview_panel = getel("preview_panel");
	var preview_title = getel("preview_title");
	var pointname = getel("pointname");
	var foldername = getel("foldername");

	if(pointname){	// in the new snippet dialog
		tl_log(cls);
		if(cls == "Point"){
			enableInput("pointname");
			pointname.value = getTextOfSelected();
			inputstarted = false;
		}else if(cls == "Topic"){
			disableInput("pointname","Enter point to add within the selected folder");
			// foldername.textContent = getTextOfSelected();
			// tl_log(getTextOfSelected());
			// tl_log(foldername);
		}else if(cls == "Support"){
			disableInput("pointname","Enter point that supports the selected point"); 
		}else if(cls == "Oppose"){
			disableInput("pointname","Enter point that opposes the selected point"); 
		}
		
	}else{
	
		if(cls=="Topic"){
			if(getel("actions_point")){
				getel("actions_point").className = "hidden";
				getel("actions_folder").className = "actions";	
				getel("preview_container").className = "hidden";
			}
			getel("topics_title").textContent = "Topic Summary";
			//ajaxReplace("/topics/"+itemid+"/parents","topics_panel");
			ajaxReplace("/topics/"+itemid+"/summary","topics_panel");
		}else if(cls=="Point"){
			if(getel("actions_point")){
				getel("actions_point").className = "actions";
				getel("actions_folder").className = "hidden";
				getel("preview_container").className = "snippets";
			}
			preview_title.textContent = "Snippets for Selected Point";
			getel("topics_title").textContent = "References to Selected Point";
			ajaxReplace("/points/"+itemid+"/snippets","preview_panel");
			//ajaxReplace("/points/"+itemid+"/topics","topics_panel");
			ajaxReplace("/points/"+itemid+"/places","topics_panel"); // containing topics and point relationships
		}
		
	}
}

function adjustPreview(itemid,cls) {
	var preview_panel = getel("preview_panel");
	var preview_title = getel("preview_title");
	var pointname = getel("pointname");
	var foldername = getel("foldername");
	
	if(cls=="Topic"){
			getel("actions_point").className = "hidden";
			getel("actions_folder").className = "actions";	
			getel("preview_container").className = "hidden";
			getel("topics_title").textContent = "Topic Summary";
			//ajaxReplace("/topics/"+itemid+"/parents","topics_panel");
			ajaxReplace("/topics/"+itemid+"/summary","topics_panel");
	}else if(cls=="Point"){
			getel("actions_point").className = "actions";
			getel("actions_folder").className = "hidden";
			getel("preview_container").className = "snippets";
			preview_title.textContent = "Snippets for Selected Point";
			getel("topics_title").textContent = "References to Selected Point";
			ajaxReplace("/points/"+itemid+"/snippets","preview_panel");
			//ajaxReplace("/points/"+itemid+"/topics","topics_panel");
			ajaxReplace("/points/"+itemid+"/places","topics_panel"); // containing topics and point relationships
	}

}

var inputstarted = false;

function enableInput(id){
	var input = getel(id);
	if(input.className == "pointinput_empty"){
		input.value = "";
		input.className = "pointinput";
	}
}

function disableInput(id,msg){
	if(inputstarted){
		return;
	}
	var input = getel(id);
	input.className = "pointinput_empty";
	input.value = msg;
}

function clearButton(what,idnum){
	var but = getel(what+"-"+idnum);
	if(but){
		but.className = "browsetab";
	}
}

function clearSelect(idnum){
	clearButton("all",idnum);
	clearButton("recent",idnum);
	clearButton("scratch",idnum);
	clearButton("hot",idnum);
	clearButton("friends",idnum);
	clearButton("search",idnum);

	getel("searchbar-"+idnum).className = "hidden";
}

function searchMode(idnum){
	clearSelect(idnum);
	getel("title-"+idnum).textContent = "Search Folders and Points";
	getel("searchbar-"+idnum).className = "searchbar";
	getel("search-"+idnum).className = "browsetab browsetab_selected";
	getel("body-"+idnum).innerHTML = "<div class='msg'>Enter search terms above</div>";
}

function searchDo(idnum){
	var query = getel("searchbox-"+idnum).value;
	ajaxReplace("/points/searchajax?query="+query+"&"+params,"body-"+idnum);	
}

function recentMode(idnum){
	getel("title-"+idnum).textContent = "My Recent Folders";
	clearSelect(idnum);
	getel("recent-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/topics/recent?"+params,"body-"+idnum);
}

function topMode(idnum){
	clearSelect(idnum);
	getel("title-"+idnum).textContent = "All Folders";
	getel("all-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/topics/toplevel?"+params,"body-"+idnum);
}


function topMode_expand(idnum,topicid){
	clearSelect(idnum);
	getel("title-"+idnum).textContent = "All Folders";
	getel("all-"+idnum).className = "browsetab browsetab_selected";
	
	// do this instead of traditional ajax replace
	ajaxPost("/topics/toplevel/"+topicid,function(response){
		var node = document.getElementById("body-"+idnum);
		node.innerHTML = response;
		var toppos = findPos(document.getElementById('primary_scrollElem'))[1];
		if (toppos < 80) {toppos=0;}
		else {toppos-=80; }
		document.getElementById("container-"+idnum).scrollTop = toppos;
	});
}

function scratchMode(idnum){
	clearSelect(idnum);
	getel("title-"+idnum).textContent = "Scratch Points"; 
	getel("scratch-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/points/scratch?"+params,"body-"+idnum);
}


var resizeBar = null;
var resizeBox = null;
var startHeight = 0;
var startY = 0;
function dragBar(ev,idnum){
	resizeBar = getel("dragbar-"+idnum);
	resizeBox = getel("container-"+idnum);
	window.addEventListener("mousemove",resizeMove,false);
	window.addEventListener("mouseup",resizeStop,false);
	resizeBar.addEventListener("mouseup",resizeStop,false);
	startY = ev.clientY;
	startHeight = resizeBox.offsetHeight;
	ev.preventDefault();
}

function resizeMove(ev){
	var dragDiff = ev.clientY	- startY;
	resizeBox.style.height = (startHeight + dragDiff) + "px";
	ev.preventDefault();
}

function resizeStop(ev){
	window.removeEventListener("mousemove",resizeMove,false);
	window.removeEventListener("mouseup",resizeStop,false);
	resizeBar.removeEventListener("mouseup",resizeStop,false);
}

var renameItem;
var renameInput;

function normalizeText(txt){
	txt = txt.replace(/\s+/g," ");
	txt = txt.replace(/^\s*/,"");
	txt = txt.replace(/\s*$/,"");
	return txt;
}

function getTextOfSelected(){
	var item = getel(selectedDivId);
	return normalizeText(item.textContent);
}

function getNodeIdNum(node){
	var id = node.getAttribute("id");
	var m = id.match(/.*-(\d*)/);
	return m[1];
}

function gotoParent(node){
	var browser = findBrowser(node);
	if(node.value == "0"){
		topMode(getNodeIdNum(browser));
	}else{
		var cls = node.options[node.selectedIndex].getAttribute("tl_cls");
		actionOpen(browser,node.value,cls);
	}
}

function dblClick(node,id,cls){
	var browser = findBrowser(node);
	actionOpen(browser,id,cls);
}

function actionOpen(browser,id,cls){
	if(!id){
		id = selectedId;
	}
	if(!browser){
		browser = findSelectedBrowser();
	}

	if(!cls){
		cls = selectedCls;
	}
	var idnum = getNodeIdNum(browser);
	
	clearSelect(idnum);

	if(cls == "Topic"){
		ajaxReplace("/topics/"+id+"/showajax?"+params,"body-"+idnum);
		ajaxReplace("/topics/"+id+"/pathajax?"+params,"title-"+idnum);
	}else if(cls == "Point"){
		ajaxReplace("/points/"+id+"/showajax?"+params,"body-"+idnum);
		ajaxReplace("/points/"+id+"/pathajax?"+params,"title-"+idnum);
	}	
}

function actionEdit(){
	var dragitem = getel(selectedDivId);
	renameItem = dragitem;
	var input = document.createElement("input");
	input.setAttribute("type","text");
	input.setAttribute("class","renamebox inputbox");
	input.setAttribute("value",normalizeText(dragitem.textContent));
	input.style.width = Math.max(150,dragitem.offsetWidth + 10) + "px";
	dragitem.textContent="";
	dragitem.parentNode.appendChild(input);
	dragitem.className = "hidden";
	renameInput = input;
	input.focus();
	input.addEventListener("blur",editFinished,false);
	input.addEventListener("keypress",editKeyPress,false);
}

function editFinished(){
	if(!renameItem) return;
	var myItem = renameItem;
	renameItem = null;
	try{ // HACK
		var txt = encodeURIComponent(normalizeText(renameInput.value));
		doAJAX("tl_rename","rename.php?cls="+selectedCls+"&id="+selectedId+"&txt="+txt,function(){
			myItem.textContent = renameInput.value;
			myItem.className = "dragitem";
			renameInput.parentNode.removeChild(renameInput);
			renameInput = null;
		});
	}catch(e){
	}

}

function pointKeyPress(ev){
	ev.stopPropagation();
	var KEYENTER = 13;
	if(ev.keyCode == KEYENTER){
		clickSave();
	}else{
		inputstarted = true;
	}
}

function editKeyPress(ev){
	ev.stopPropagation();
	var KEYENTER = 13;
	if(ev.keyCode == KEYENTER){
		editFinished();
	}
}

function searchKeyPress(ev,idnum){
	ev.stopPropagation();
	var KEYENTER = 13;
	if(ev.keyCode == KEYENTER){
		searchDo(idnum);
	}
}

function findParentHolder(node){
	if(!node) return null;
	var id = node.getAttribute("tl_id");
	while(node != null && node.getAttribute){
		var node_tl_id = node.getAttribute("tl_id");
		if(node_tl_id && node_tl_id != id){
			return node;
		}
		node = node.parentNode;
	}
	return null;
}

function findParentFolderHolder(node){
	if(!node) return null;
	var id = node.getAttribute("tl_id");
	while(node != null && node.getAttribute){
		var node_tl_cls = node.getAttribute("tl_cls");
		var node_tl_id = node.getAttribute("tl_id");
		if(node_tl_cls && node_tl_id && node_tl_cls == "Topic" && node_tl_id != id){
			return node;
		}
		node = node.parentNode;
	}
	return null;	
}

function findHolder(node){
	while(node != null && node.getAttribute){
		var node_tl_id = node.getAttribute("tl_id");
		if(node_tl_id){
			return node;
		}
		node = node.parentNode;
	}
	return null;	
}

function findSelectedHolder(){
	if(selectedDivId && selectedId){
		return findHolder(document.getElementById(selectedDivId));
	}else{
		return null;
	}
}

function findBrowser(node){
	while(node != null && node.getAttribute){
		if(node.className == "browsetable"){
			return node;
		}
		node = node.parentNode;
	}
	return null;
}

function findSelectedBrowser(){
	if(selectedDivId && selectedId){
		var node = document.getElementById(selectedDivId);
		return findBrowser(node);
	}
	return null;
}

function findSelectionInfo(node){
	var holder;
	if(node){
		holder = findHolder(node);
	}else{
		holder = findSelectedHolder();
	}
	var parent = findParentHolder(holder);
	var folder = findParentFolderHolder(holder);
	if(parent){
		var parentid = parent.getAttribute("tl_id");
		var parentcls = parent.getAttribute("tl_cls");
	}
	if(folder){
		var folderid = folder.getAttribute("tl_id");
	}
	var res = {
		holder: holder,
		'itemid': holder.getAttribute("tl_id"),
		cls: holder.getAttribute("tl_cls"),
		'parent': parent,
		parentid: parentid,
		parentcls: parentcls,
		folder: folder,
		folderid: folderid
	};
	return res;
}

function newFolder(idnum){
	if(!idnum){
		idnum = getNodeIdNum(findSelectedBrowser());
	}
	
	function mk(tag){return document.createElement(tag);}
	
	var uniq = Math.ceil(Math.random()*10000000);
	
	var holder = mk("div");
	holder.className = "dragholder";
	holder.setAttribute("id","holder-"+uniq);
	var dragtable = mk("table");
	dragtable.className = "dragtable";
	holder.appendChild(dragtable);
	var dragrow = mk("tr");
	dragtable.appendChild(dragrow);
	var dragsinglecol = mk("td");
	dragrow.appendChild(dragsinglecol);
	var singleicon = mk("img");
	dragsinglecol.appendChild(singleicon);
	singleicon.src = "/images/tree_open.png";
	var dragfoldercol = mk("td");
	dragrow.appendChild(dragfoldercol);
	var foldericon = mk("img");
	dragfoldercol.appendChild(foldericon);
	foldericon.src = "/images/folder.png";
	var dragmaincol = mk("td");
	dragrow.appendChild(dragmaincol);
	var drageditdiv = mk("div");
	dragmaincol.appendChild(drageditdiv);
	drageditdiv.className = "dragitem";
	var input = mk("input");
	input.setAttribute("type","text");
	drageditdiv.appendChild(input);

	var selectedholder = findSelectedHolder();
	var parent = findParentFolderHolder(selectedholder);
	var parentid;
	var parentdivid = null;
	if(parent){
		parentid = parent.getAttribute("tl_id");
		parentdivid = parent.getAttribute("id");
	}else{
		parentid = null;
	}
	
	input.addEventListener("blur",function(){
		folderFinished(holder,input,uniq,parentid,parentdivid);
	},false);
	
	input.addEventListener("keypress",function(ev){
		ev.stopPropagation();
		var KEYENTER = 13;
		if(ev.keyCode == KEYENTER){
			folderFinished(holder,input,uniq,parentid,parentdivid);
		}
	},false);

	if(selectedholder){
		selectedholder.parentNode.insertBefore(holder,selectedholder);
	}else{
		var body = document.getElementById("body-"+idnum);
		var container = mk("div");
		container.className = "point_container";	
		container.appendChild(holder);
		if(body.childNodes.length > 0){
			body.insertBefore(container,body.childNodes[0]);
		}else{
			body.appendChild(container);
		}
	}
	
	if(!isVisible(dragtable)){
		dragtable.scrollIntoView(false);
	}
	
	input.focus();
}

function isVisible(el){
	if(el.offsetTop > el.parentNode.offsetHeight){
		return true;
	}
	return false;
}

function findSubTopics(idnum){
	var holder = getel(findHolderId(idnum));
	for(var i = 0; i < holder.childNodes.length; i++){
		var child = holder.childNodes[i];
		if(child.className == "subpoints_section"){
			return child;
		}
	}
	return null;
}


function folderFinished(container,input,newDivId,parentid,parentdivid){
	if(input.value != "" && !input.done){
		var nametxt = normalizeText(input.value);
		if(parentid){
			doAJAX("newfolder","new_topic.php?txt="+encodeURIComponent(nametxt)+"&parentid="+parentid,function(id){
				ajaxReplace('/topics/'+parentid+'/'+expandcommand,parentdivid)
			});
		}else{
			doAJAX("newfolder","new_topic.php?txt="+encodeURIComponent(nametxt),function(id){
				ajaxReplace('/topics/'+id+'/'+expandcommand,"holder-"+newDivId);
			});
		}				
		input.done = true;
	}else{
		container.parentNode.removeChild(container);
	}
}

function clickSave(){
	//	TODO: save the snippet
	var pointnode = getel("pointname");
	var pointname = normalizeText(pointnode.value);
	var sniptxt = normalizeText(getel("snippet_text").textContent);
	
	var baseurl = "new_snippet.php?txt="+encodeURIComponent(sniptxt)
		+"&url="+encodeURIComponent(arg_url)
		+"&realurl="+encodeURIComponent(arg_realurl)
		+"&pointname="+encodeURIComponent(pointname)
		+"&title="+encodeURIComponent(arg_title);
	
	if(selectedCls == "Point"){
		doAJAX("tl_snippet",baseurl+"&pointid="+selectedId,function(result){
			clickClose();
		});
		return;
	}else{
		if(pointname == "" || pointnode.className == "pointinput_empty"){
			alert("You must enter the point that this snippet is making");
		}
	}
	
	if(selectedCls == "Topic"){
		doAJAX("tl_snippet",baseurl+"&topicid="+selectedId,function(result){
			clickClose();
		});		
	}else if(selectedCls == "Oppose"){
		doAJAX("tl_snippet",baseurl+"&opposeid="+selectedId,function(result){
			clickClose();
		});
	}else if(selectedCls == "Support"){
		doAJAX("tl_snippet",baseurl+"&supportid="+selectedId,function(result){
			clickClose();
		});
	}
}

function clickClose(){
	var evt = document.createEvent("Events");
  evt.initEvent("thinklink-close", true, false);
  document.body.dispatchEvent(evt);
}

function openOrganizer(){
	window.open("/");
}

function keyDownHandler(ev){
	if(window.draggedPoint !== undefined && draggedPoint && dragCopyMsg){
		if(ev.keyCode == 17){
			dragCopyMode = true;
			dragCopyMsg.className = "dragcopymsg";
			dragMoveMsg.className = "hidden";
		}	
		if(ev.keyCode == 27){
			dragStop();
		}
	}
}

function keyUpHandler(ev){
	if(window.draggedPoint !== undefined && draggedPoint && dragCopyMsg){
		if(ev.keyCode == 17){
			dragCopyMode = false;
			dragCopyMsg.className = "hidden";
			dragMoveMsg.className = "dragmovemsg";
		}
	}
}

function keyPressHandler(ev){
	var keycode = ev.keyCode;
	if(!selectedId){
		return;
	}
	
	if(keycode == 8 || keycode == 46){ // delete
		actionDelete(ev);
	}
	if(keycode == 113 || keycode == 13){ // F2 or enter
		actionEdit();
	}
}
		
function actionDelete(ev){
	var selinfo = findSelectionInfo();

	var what = "folder";
	if(selectedCls == "Point"){
		what = "point";
	}
	var parentwhat = "folder";
	if(selinfo.parentcls == "Point"){
		parentwhat = "point";
	}

	choiceBox(ev,"What do you want to do?",
		"You can delete this "+what+" completely, or unlink it from this parent "+parentwhat+", keeping it in other parent "+parentwhat+"s",
		["Delete Completely","Remove from Parent"],
		null,function(choice){
			if(choice == "Delete Completely"){
				action = "delete.php?cls="+selinfo.cls+"&id="+selinfo.itemid;
			}else{
				action = "unlink.php?cls="+selinfo.cls+"&id="+selinfo.itemid+"&parcls="+selinfo.parentcls+"&parentid="+selinfo.parentid;					
			}
			doAJAX("tl_delete",action,function(result){
				selinfo.holder.parentNode.removeChild(selinfo.holder);
			})
		}
	)
}

function actionOrganize(){
	alert("Organize points and folders using drag and drop.\n Drop a point onto another point to say if it supports or opposes the other point.");
}