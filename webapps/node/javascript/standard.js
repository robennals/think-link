
function ungrey(obj){
	if(obj.style.color == "grey"){
		obj.style.color = "black";
		obj.value = "";		
	}
}

function doAdd(obj){
	$(obj).text("added")
	var snip = $(obj).parent();
	snip.find(".ignore").text("ignore")
	snip.addClass("snippet-added")
	snip.removeClass("snippet-ignored")
}

function doIgnore(obj){
	$(obj).text("ignored")
	$(obj).parent().find(".add").text("add")
	$(obj).parent().addClass("snippet-ignored")
	$(obj).parent().removeClass("snippet-added")
}
