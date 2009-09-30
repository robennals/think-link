package com.intel.thinkscala.data
import com.intel.thinkscala._
import com.intel.thinkscala.learn.HotWords


import com.intel.thinkscala.SqlQuery._

trait Snippets extends BaseData {
	def snippetText(search : Int, state : String) : Seq[SqlRow] = 
		select("v2_searchresult.abstract","v2_searchresult") where ("search_id = ?",search) where ("state = ?",state) rows 

	def getSearchId(claimid : Int, query : String) : Option[Int] = 
		select("id","v2_snipsearch") where ("claim_id = ?",claimid) where ("searchtext = ?",query) maybeInt("id")
		
    def snippets = select("v2_searchresult")
    	  .leftjoin("v2_user.name AS username","v2_user ON v2_user.id = v2_searchresult.user_id")
    	  .leftjoin("v2_searchurl.title AS title, v2_searchurl.url AS url","v2_searchurl ON v2_searchurl.id = v2_searchresult.url_id")

    def claimsnippets = snippets.leftjoin("v2_node.text AS claimtext","v2_node ON v2_node.id = v2_searchresult.claim_id")    	  
    	  
  	  // TODO: bring back pagetext
//    def getSnippet(resultid : Int) =
//    	snippets 
//    	.leftjoin("pagetext.text AS articlebody","pagetext ON pagetext.url_id = v2_searchresult.url_id")
//    	.where ("v2_searchresult.id = ?",resultid) one

    def getSnippet(resultid : Int) =
    	snippets 
    	.where ("v2_searchresult.id = ?",resultid) one

    
    def allSnippets(claimid : Int, page : Int) =
    	snippets where ("v2_searchresult.claim_id = ?",claimid) where ("state = true") paged page rows
    	
    def allSnippets(claimid : Int) = 
    	snippets where ("v2_searchresult.claim_id = ?",claimid) rows

    def userMarkedPages(userid : Int, page : Int) = 
    	claimsnippets where ("state = true AND v2_searchresult.user_id = ?",userid) orderby "searchdate DESC" paged page rows

    def recentMarkedPages(page : Int) =
    	claimsnippets orderby("searchdate DESC") where ("state = true") paged page rows 
    	
//	def getSnippet(resultid : Int) = 
//		  select("v2_searchresult").where("v2_searchresult.id = ?",resultid)
//		  .leftjoin("v2_user.name AS username","v2_user ON v2_user.id = v2_searchresult.user_id")
//		  .leftjoin("v2_searchurl.url AS url","v2_searchurl ON v2_searchurl.id = v2_searchresult.url_id")
//		  .leftjoin("pagetext.text AS pagetext","pagetext ON pagetext.result_id = v2_searchresult.id")
//		  .one	  
		  
    val set_snip_highlight = stmt("UPDATE v2_searchresult SET picktext = ? WHERE id = ?")
    def setSnipHighlight(resultid : Int, highlight : String) = set_snip_highlight.update(highlight,resultid)   
    
    val found_snippets = stmt("SELECT state,abstract,url,title,user_id,v2_user.name AS username "+
                                "FROM v2_searchresult,v2_searchurl,v2_user "+
                                "WHERE claim_id = ? AND search_id = 0 AND url_id = v2_searchurl.id "+
                                "AND v2_user.id = v2_searchresult.user_id "+
                                "LIMIT 20 OFFSET ?")
    def foundSnippets(claimid : Int, page : Int) = found_snippets.queryRows(claimid,page*20)

    def paraphrases(claimid : Int) = select("paraphrase").where("claim_id = ?",claimid)
        .where("disabled = 0")
    	.leftjoin("v2_user.name AS username","v2_user ON v2_user.id = paraphrase.user_id") rows
    
    def subphrases(phraseid : Int) = select("derivedpara").where("derivedfrom = ? AND enabled = 1",phraseid) rows

    val addphrase = stmt("INSERT INTO paraphrase (claim_id,user_id,text,count,keyword,secondword) VALUES(?,?,?,?,?,?)")
    val addsubphrase = stmt("INSERT INTO derivedpara (text,derivedfrom,enabled) VALUES(?,?,?)")
    
    def addphrases(claimid : Int, phrase : String, subphrases : Seq[String], picked : Seq[String],userid : Int){
		var count = 0
		picked foreach {x => 
			if(x == "true") count += 1
		}
		val (keyword,secondword) = HotWords.hotWords(phrase)
		var paraid = addphrase.insert(claimid,userid,phrase,count,keyword,secondword)
		for(i <- 0 until subphrases.length){
			addsubphrase.update(subphrases(i),paraid,picked(i) == "true")
		}	
	}
	
    def addPhrase(claimid : Int, phrase : String, userid : Int){
		val (keyword,secondword) = HotWords.hotWords(phrase)
    	addphrase.insert(claimid,userid,phrase,0,keyword,secondword)
    }

	
	def addMissingPhrases(){
		var missing = nodesWithoutParas
		missing foreach {row =>
			val (keyword,secondword) = HotWords.hotWords(row.str("text"))
			addphrase.insert(row.int("id"),row.int("user_id"),row.str("text"),0,keyword,secondword)
		}
	}
	
	val hot_words = stmt("SELECT DISTINCT(keyword) FROM paraphrase")
	def hotWords() = hot_words.querySeq()
	
	val second_words = stmt("SELECT DISTINCT(secondword) FROM paraphrase WHERE keyword = ?")
	def secondWords(keyword : String) = second_words.querySeq(keyword)
	
	def wordPhrases(keyword : String,secondword : String) = select("paraphrase")
		.where("keyword = ?",keyword).where("secondword = ?",secondword)
		.where("disabled = 0")
		.leftjoin("v2_node.text AS claimtext","v2_node ON v2_node.id = paraphrase.claim_id")
		.where("v2_node.disagree_count > 0")
		.rows
		
	val subphrase_texts = stmt("SELECT text FROM derivedpara WHERE derivedfrom = ?")
	def subPhraseTexts(phraseid : Int) = subphrase_texts.querySeq(phraseid)
	
	val update_phrase_count = stmt("UPDATE v2_node SET instance_count = "+
			"(SELECT SUM(count) FROM `paraphrase` WHERE claim_id = v2_node.id) WHERE id = ?")
	def updatePhraseCount(claimid : Int) = update_phrase_count.update(claimid)
		
	val update_evidence_count = stmt("UPDATE v2_node SET disagree_count = "+
			"(SELECT (COUNT(id)) FROM evidence WHERE claim_id = ? AND verb = 'opposes') "+
			"WHERE id = ?")
	def updateEvidenceCount(claimid : Int) = update_evidence_count.update(claimid,claimid)
	
	val delete_para = stmt("UPDATE paraphrase SET disabled = 1 WHERE id = ?")
	def deletePara(paraid : Int) = delete_para.update(paraid)

	val abuse_para = stmt("UPDATE paraphrase SET abusereport = ? WHERE id = ?")
	def abusePara(paraid : Int, userid : Int) = abuse_para.update(userid,paraid)
	
	val nodes_without_paras = stmt("SELECT v2_node.id,v2_node.user_id,text FROM v2_node WHERE type='claim' AND NOT EXISTS (SELECT * FROM paraphrase WHERE claim_id = v2_node.id)")
	def nodesWithoutParas = nodes_without_paras.queryRows()
}
