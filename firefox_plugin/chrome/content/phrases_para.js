
function listToHash(list){
	var hsh = {};
	for(var i = 0; i < list.length; i++){
		hsh[list[i]] = true;
	}
	return hsh;
}

var global_wordcombos = {};
var global_phrases = {};

function find_phrases(doc){
	thinklink_msg("find phrases para : "+doc.location.href);

	var url = doc.location.href;
	if(url.indexOf("cs.berkeley.edu") != -1 || url.indexOf("localhost") != -1){
		clearCache(); // they may be aware of very recent data
		return;
	}
		
	var apipath = get_api_path();
	var globals = getGlobals();
	if(!globals.hotwords){		
		ajaxRequest(apipath+"/apianon/hotwords.json",function(hotwords){
			if(hotwords.version == 1){
				globals.hotwords = listToHash(stemWords(hotwords.hotwords));		
				find_phrases(doc);
			}else{				
				upgradeMessage();
				globals.hotwords = {};
			}
		});
		return;
	}
	
	var pagetext = doc.body.innerHTML
				.replace(/<script[^<]*<\/script>/g,"")
				.replace(/<\/?(div|h.|li|form|br|cite|td|tr|caption)>/g,".")
				.replace(/<\/?[^>]*>/g," ")
				.replace(/\s+/g," ")
				.replace(/U\.S\.A/g,"USA")
				.replace(/U\.S\./g,"US");
	
	var sentences = pagetext.toLowerCase().split(/[\.\?\!]+[\.\?\!\s]*/);

	thinklink_msg("got words");
	
	global_wordcombos = {};
	global_phrases = {};
	global_markcount = 0;
	searchSentences(doc,sentences,globals.hotwords,0);
}

var global_api_path = get_api_path();	

// Horrible hack because of Javascript's broken mixing of associative array keys with methods
function hashGet(hash,key){
	return Object.prototype.hasOwnProperty.call(hash,key) ? hash[key] : undefined;
}

function searchSentences(doc,sentences,hotwords,start){
	for(var i = start; i < sentences.length; i++){
//		thinklink_msg("sentence "+i+" out of "+sentences.length);
		var sentence = sentences[i];
//		var stemmed = stemSentence(sentence);
		var words = stemWords(textWords(sentence));
		if(global_markcount > 20){
			thinklink_msg("reached maximum mark count for page. Stopping marking to avoid slowing things down.");
			return;
		}
		for(var j = 0; j < words.length; j++){
			var word = words[j];
			var match = hashGet(hotwords,word);
			if(!match){
				// do nothing: common case
			}else if(match == true){
//				thinklink_msg("matched keyword: "+word);
				ajaxRequest(global_api_path+"/apianon/hotwords/"+word+".json",function(secondwords){
					hotwords[word] = listToHash(stemWords(secondwords));
					searchSentences(doc,sentences,hotwords,i);
				});
				return;
			}else{
//				thinklink_msg("reusing keyword: "+word);
				var secondwords = hotwords[word];
				var donepairs = {};
				for(var k = 0; k < words.length; k++){
					var secondword = words[k];
					var secondmatch = hashGet(secondwords,secondword);
					if(!secondmatch){
						// do nothing
					}else if(secondmatch == true){
//						thinklink_msg("matched word pair: "+word+"-"+secondword);
						ajaxRequest(global_api_path+"/apianon/majorwords/"+word+"/"+secondword+".json",function(claims){
							secondwords[secondword] = claims;
							searchSentences(doc,sentences,hotwords,i);
						})
						return;
					}else{	
//						thinklink_msg("reusing word pair: "+word+"-"+secondword);
						var phrases = secondwords[secondword];
						for(var c = 0; c < phrases.length; c++){														
							markSentencePhrase(doc,sentence,words,phrases[c])
						}
					}
				}
			}
		}
	}
}

function joinStrings(arr,start,end){
	var buf = ""
	for(var i = start; i <= end; i++){
		buf+=arr[i]+" ";
	}
	return buf;
}

function textWords(str){
	return str.replace(/^[^\w]+/g,"").replace(/[^\w]+$/g,"").split(/[^\w]+/);
}

function trimEnds(str){
	return str.replace(/^[^\w]+/g,"").replace(/[^\w]+$/g,"");
}

function trimSentence(sentence,keywords){
	var words = textWords(sentence);
	var stemwords = stemWords(words);
	var first = 0;
	var last = words.length - 1;
	while(!hashGet(keywords,stemwords[first]) && first < words.length) first++;
	while(!hashGet(keywords,stemwords[last]) && last > first) last--;
	return joinStrings(words,first,last);	
}

function dropStopWords(words){
	var arr = [];
	for(var i = 0; i < words.length; i++){
		if(!hashGet(stopwords_hash,words[i])){
			arr.push(words[i]);
		}
	}
	return arr;
}

//function isNegated(phrase){
	//for(var i = 0; i < negwords.length; i++){
		//if(phrase.indexOf(negwords[i]) != -1){
			//return true;
		//}
	//}
	//return false;
//}

function isNegated(phrase){
	var words = textWords(phrase);
	for(var i = 0; i < words.length; i++){
		if(hashGet(negwords_hash,words[i])){
			return true;
		}
	}
	return false;
}

function arr_contains(arr,key){
	for(var i = 0; i < arr.length; i++){
		if(arr[i] == key){
			return true;
		}
	}	
	return false;
}

function markSentencePhrase(doc,sentence,words,phrase){
	var keywords = stemWords(dropStopWords(textWords(phrase.text.toLowerCase())));

	var phraseneg = false;
	var sentenceneg = false;
	// does it have all the keywords
	for(var i = 0; i < keywords.length; i++){
		var keyword = keywords[i];
		if(!arr_contains(words,keyword)){
			return;
		}
		//if(sentence.indexOf(keywords[i]) == -1){
			//return;
		//}
	}
	
	if(isNegated(sentence) == isNegated(phrase.text)){
		sentence = trimSentence(sentence,listToHash(keywords));
		if(!global_phrases[sentence]){
			global_marked = [];
			mark_snippet(sentence,sentence,normalise(sentence),phrase.claim_id,phrase.id,phrase.claimtext,doc.body);
			global_phrases[sentence] = true;
			if(global_marked.length > 0){
				claimMessageMove(global_marked,phrase.claimtext,phrase.claim_id,sentence,doc);
			}
		}
		thinklink_msg("highlighting phrase: "+sentence);
	}else{
		thinklink_msg("negated phrase: "+sentence);
	}
}

