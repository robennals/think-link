package com.intel.thinkscala.data
import com.intel.thinkscala._


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

    def paraphrases(claimid : Int) = select("paraphrase").where("claim_id = ? AND derivedfrom = 0 AND enabled = 1",claimid)
    	.leftjoin("v2_user.name AS username","v2_user ON v2_user.id = paraphrase.user_id") rows
    
    def subphrases(phraseid : Int) = select("paraphrase").where("derivedfrom = ? AND enabled = 1",phraseid) rows

    val addphrase = stmt("INSERT INTO paraphrase (claim_id,user_id,text,count,derivedfrom,enabled) VALUES(?,?,?,?,?,?)")
    def addphrases(claimid : Int, phrase : String, subphrases : Seq[String], picked : Seq[String],userid : Int){
		var count = 0
		picked foreach {x => 
			if(x == "true") count += 1
		}
		var paraid = addphrase.insert(claimid,userid,phrase,count,0,true)
		for(i <- 0 until subphrases.length){
			addphrase.update(claimid,userid,subphrases(i),0,paraid,picked(i) == "true")
		}	
	}
 }
