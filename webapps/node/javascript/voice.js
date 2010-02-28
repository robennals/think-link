
function recentWords(text){
	var start = Math.max(0,text.length - 100)
	while(text[start] != " " && start < text.length && start > 0) start++
	return text.substring(start,text.length)
}

// dispute finding algorithm: 
//    no stemming. no synonyms. no word reordering.
//    must have all the keywords, in the correct order, with no more than
// 	  two words between each keyword
//	  keyword lists are manually entered right now.
//	  if "not" a keyword, then accept any negation anywhere near claim
// Next version:
//	  on the server, with a smarter algorithm, based on the data set

var disputes = [
 	"the moon is made of cheese",
	"global warming is a hoax", "global warming is a con", "global warming is a conspiracy",
	"global warming does not exist", "the earth is not getting warmer",
	"global warming data was faked",
	"the moon landings were faked","the moon landings didn't happen",
	"barack obama is a muslim","barack obama was born in kenya",
	"the great wall of china is visible from space",
	"vaccines cause autism","vaccines linked to autism",
	"iran wants to wipe israel off the map",
	"iran threatened to wipe israel off the map",
	"gun control reduces crime",
	"elvis is still alive"
]

function tokenize(text){
	return text.split(/[\s\-\.\?\!]/)
}

var stopwords = ["is","a","the","were","in","was","from","to","","wants"]

var activedisputes = {}  // maps to "true" if was active in the last sentence


// TODO: simple hack for synonyms?

function isStopWord(word){
	word = word.toLowerCase()
	for(var i = 0; i < stopwords.length; i++){
		if(word == stopwords[i]){
			return true;
		}
	}
	return false;
}

var simpledisputes = []

function goodWords(dispute){
	words = tokenize(dispute)
	goodwords = []
	for(var i = 0; i < words.length; i++){
		if(!isStopWord(words[i])){
			goodwords.push(words[i])
		}
	}
	return goodwords
}

for(var i = 0; i < disputes.length; i++){
	simpledisputes[i] = goodWords(disputes[i])
}
	

var stopwords = ["is","a","the","were","in","was","from","to",""]

function findInArray(arr,val){
	for(var i = 0; i < arr.length; i++){
		if(arr[i] == val){
			return i;
		}
	}
	return null
}

// must have all the correct keywords, in order
function entails(textwords,disputewords){
	var textpos = 0
	for(var i = 0; i < disputewords.length; i++){
		for(; textpos < textwords.length; textpos++){
			if(textwords[textpos] == disputewords[i]) break
		}
		if(textpos >= textwords.length){
			return false;
		}		
	}
	return true;
}

function entailsText(text,dispute){
	return entails(text.split(" "),goodWords(dispute))
}

// crazy light-weight dispute finding code
function checkDisputes(text){
	var words = tokenize(text.toLowerCase())
	for(var i = 0; i < disputes.length; i++){
		var didentail = entails(words,simpledisputes[i])
		if(didentail && ! activedisputes[i]){
			var dispute = $("<div class='dispute'/>")
			dispute.text(disputes[i])
			$("#sofar").append(dispute)
			console.log("disputed: "+disputes[i])
		}
		activedisputes[i] = didentail;		
	}
}

function textEntered(){
	console.log("textEntered")
	var text = $("#textin").val()
	$("#windowtext").text(recentWords(text))
	checkDisputes(text)
}

function listen(id,eventtype,func){
	var node = document.getElementById(id)
	node.addEventListener(eventtype,func,false)
}
	
$(document).ready(function(){
   $("#textin").keyup(function(){textEntered()});
   $("#textin").bind("paste",function(){textEntered()});
})
