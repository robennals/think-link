
$(document).ready(function(){
	$(".trimradio").each(function(index,item){
		$(this).click(function(){
			$.post("/claimfilter/setlabel",{'id':$(this).attr("name"),'correct':$(this).attr("value")});
		})
	})
})

