package com.intel.thinkscala.data

import com.intel.thinkscala.SqlQuery._

trait Snippets extends BaseData {
	def snippetText(claim : Int, state : String) : Seq[SqlRow] = 
		select("v2_searchresult.abstract","v2_searchresult") where ("claim_id = ?",claim) where ("state = ?",state) rows 
}
