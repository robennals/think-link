package com.intel.thinkscala.data

import com.intel.thinkscala.SqlQuery._

trait Snippets extends BaseData {
	def snippetText(search : Int, state : String) : Seq[SqlRow] = 
		select("v2_searchresult.abstract","v2_searchresult") where ("search_id = ?",search) where ("state = ?",state) rows 

	def getSearchId(claimid : Int, query : String) : Option[Int] = 
		select("id","v2_snipsearch") where ("claim_id = ?",claimid) where ("searchtext = ?",query) maybeInt("id")
		
	def getSnippet(resultid : Int) = 
		  select("v2_searchresult").where("v2_searchresult.id = ?",resultid)
		  .leftjoin("v2_user.name AS username","v2_user ON v2_user.id = v2_searchresult.user_id")
		  .leftjoin("v2_searchurl.url AS url","v2_searchurl ON v2_searchurl.id = v2_searchresult.url_id")
		  .leftjoin("pagetext.text AS pagetext","pagetext ON pagetext.result_id = v2_searchresult.id")
		  .one

    val set_snip_highlight = stmt("UPDATE v2_searchresult SET picktext = ? WHERE id = ?")
    def setSnipHighlight(resultid : Int, highlight : String) = set_snip_highlight.update(highlight,resultid)
 }
