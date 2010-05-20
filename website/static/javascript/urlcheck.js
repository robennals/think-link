
var apiurl = "http://localhost:8000"

function check_disputes(){
   $(".df-finddisputes").each(function(index,item){
   		var url = $(item).attr("data-url")
   		$.getJSON(apiurl+"/urlcheck/?format=json&callback=?",{url:url},function(data){
			$(item).empty()
			if(data.length > 0){
				var disputebox = $("<div class='df-dispute-box'><a class='df-dispute-toggle' href='#'><span class='ui-icon ui-icon-triangle-1-e'/>contains "+data.length+" disputed claims </a></div>");
				disputebox.find("> a").click(function(){
					$(this).toggleClass("dispute-open");
					$(this).find(".ui-icon").toggleClass("ui-icon-triangle-1-e");
					$(this).find(".ui-icon").toggleClass("ui-icon-triangle-1-s");
					$(this).next().toggle();
					return false;
				})
				var disputelist = $("<div style='display:none' class='df-dispute-list'></div>").appendTo(disputebox);				
				$(item).append(disputebox);
				for(i in data){
					var dispute = data[i];
					$("<div class='disputed'>disputed: "+dispute.claimtext+"</div>").appendTo(disputelist);
				}
			}else{
				$("<div class='df-nodisputes'>no disputes found</div>").appendTo($(item))
			}
		})
   })	
}

$(document).ready(function(){
	check_disputes()
})
