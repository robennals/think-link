package com.intel.thinkscala.data

import com.intel.thinkscala.SqlQuery._

trait Snippets extends BaseData {
	def snippetText(search : Int, state : String) : Seq[SqlRow] = 
		select("v2_searchresult.abstract","v2_searchresult") where ("search_id = ?",search) where ("state = ?",state) rows 

	def getSearchId(claimid : Int, query : String) : Option[Int] = 
		select("id","v2_snipsearch") where ("claim_id = ?",claimid) where ("searchtext = ?",query) maybeInt("id")
}
