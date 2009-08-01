package com.intel.thinkscala.data

import com.intel.thinkscala.SqlQuery._

trait Snippets extends BaseData {
	def snippetText(search : Int, state : String) : Seq[SqlRow] = 
		select("v2_searchresult.abstract","v2_searchresult") where ("search_id = ?",search) where ("state = ?",state) rows 

	def getSearchId(claimid : Int, query : String) : Option[Int] = 
		select("id","v2_snipsearch") where ("claim_id = ?",claimid) where ("searchtext = ?",query) maybeInt("id")
		
    def snippets = select("v2_searchresult")
    	  .leftjoin("v2_user.name AS username","v2_user ON v2_user.id = v2_searchresult.user_id")
    	  .leftjoin("v2_searchurl.title AS title, v2_searchurl.url AS url","v2_searchurl ON v2_searchurl.id = v2_searchresult.url_id")

  	  // TODO: bring back pagetext
    def getSnippet(resultid : Int) =
    	snippets where ("v2_searchresult.id = ?",resultid) one

    def allSnippets(claimid : Int, page : Int) =
    	snippets where ("v2_searchresult.claim_id = ?",claimid) where ("state = true") paged page rows
    	
    def allSnippets(claimid : Int) = 
    	snippets where ("v2_searchresult.claim_id = ?",claimid) rows

    def userMarkedPages(userid : Int, page : Int) = 
    	snippets where ("state = true AND user_id = ?",userid) orderby "searchdate DESC" paged page rows

    def recentMarkedPages(page : Int) =
    	snippets orderby ("searchdate DESC") where ("state = true") paged page rows
    	
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

    
    
//    val all_snippets = stmt("SELECT state,abstract,url,title,user_id,v2_user.name AS username "+
//                                "FROM v2_searchresult,v2_searchurl,v2_user "+
//                                "WHERE claim_id = ? AND url_id = v2_searchurl.id "+
//                                "AND state = 'true' "+
//                                "AND v2_user.id = v2_searchresult.user_id "+
//                                "LIMIT ? OFFSET ?")
//    def allSnippets(claimid : Int, page : Int) = all_snippets.queryRows(claimid,10,page*10)
//
//    val all_snippets_all = stmt("SELECT state,abstract,url,title,user_id,v2_user.name AS username "+
//                                "FROM v2_searchresult,v2_searchurl,v2_user "+
//                                "WHERE claim_id = ? AND url_id = v2_searchurl.id "+
//                                "AND (state = 'true' OR state='false') "+
//                                "AND v2_user.id = v2_searchresult.user_id")
//    def allSnippets(claimid : Int) = all_snippets_all.queryRows(claimid)

//    val recent_marked_pages = stmt("SELECT v2_node.id AS claimid, url, title, v2_node.text AS claimtext, v2_user.id AS user_id, v2_user.name AS username "+
//            "FROM v2_searchresult, v2_searchurl, v2_node, v2_user "+
//            "WHERE v2_searchurl.id = url_id "+
//            "AND v2_user.id = v2_searchresult.user_id "+
//            "AND v2_node.id = v2_searchresult.claim_id "+
//            "AND v2_searchresult.state = 'true' "+
//            "ORDER BY searchdate DESC LIMIT 20 OFFSET ?")
//	def recentMarkedPages(page : Int) = recent_marked_pages.queryRows(page * 20)
	
//	val user_marked_pages = stmt("SELECT v2_node.id AS claimid, url, title, v2_node.text AS claimtext "+
//	            "FROM v2_searchresult, v2_searchurl, v2_node "+
//	            "WHERE v2_searchurl.id = url_id "+
//	            "AND v2_node.id = v2_searchresult.claim_id "+
//	            "AND v2_searchresult.user_id = ? "+
//	            "AND v2_searchresult.state = 'true' "+
//	            "ORDER BY searchdate DESC LIMIT 20 OFFSET ?")
//	def userMarkedPages(userid : Int, page : Int) : Seq[SqlRow] = user_marked_pages.queryRows(userid, page * 20)
//    
 }
