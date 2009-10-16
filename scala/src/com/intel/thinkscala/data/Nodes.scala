package com.intel.thinkscala.data
import com.intel.thinkscala._


import com.intel.thinkscala.SqlQuery._

trait Nodes extends BaseData {
	  // === find claims ===
		
	val v2_node = select("v2_node")
	val nodes =	v2_node leftjoin ("v2_user.name AS username","v2_user ON v2_node.user_id = v2_user.id")
	def typnodes(typ : String, page : Int) = nodes where ("v2_node.type = ?",typ) where ("hidden = false") paged (page)
	def usernodes(typ : String, userid : Int, page : Int) = typnodes(typ,page) where ("user_id = ?",userid)
	def claims(page : Int) = typnodes("claim",page) 
	def topics(page : Int) = typnodes("topic",page)

	def getClaim(id : Int, userid : Int) = {
		if(userid != 0){
			logRecent(userid,id)
		}
		nodes leftjoin ("ignore_claim.user_id AS ignored","ignore_claim ON claim_id = v2_node.id AND ignore_claim.user_id = ?",userid) where ("v2_node.id = ?",id) one
	}
	
	  def nodesByUser(typ : String, userid : Int, page : Int) =
		  typnodes(typ,page) where ("user_id = ?",userid) orderby ("v2_node.id DESC") rows
	
	  def nodesUserDeleted(typ : String, userid : Int, page : Int) =
		  nodes where ("hidden = true") where ("type = ?",typ) where ("user_id = ?",userid) rows
	  
	  def getFrequentClaims(page : Int) = claims(page) orderdesc ("instance_count") rows 

	  def getBigTopics(page : Int) = topics(page) orderdesc ("instance_count") rows
	  
	  def searchClaims(query : String, page : Int) = claims(page) where ("MATCH(text) AGAINST(?)",query) rows

	  val mini_search_claims = stmt("SELECT id,text FROM v2_node WHERE type='claim' AND disagree_count > 0 AND MATCH(text) AGAINST(?) AND id != ? LIMIT 5")
	  def miniSearchClaims(query : String, notid : Int) = mini_search_claims.queryRows(query,notid)
	  
	  def searchLinked(query : String, typ : String, linkedto : Int, page : Int) = 
		  typnodes(typ,page) where ("v2_node.id != ?",linkedto) where ("MATCH(text) AGAINST(?)",query) leftjoin ("v2_link.id AS linkid",
				  "v2_link ON ((src = ? AND dst = v2_node.id) OR (dst = ? AND src = v2_node.id))",linkedto) rows
	  	  
	  def searchTopics(query : String, page : Int) = topics(page) where ("MATCH(text) AGAINST(?)")
	  
	  def getRecentNodes(userid : Int, typ : String) = 
		  	typnodes(typ,0) innerjoin ("v2_history.date AS hdate","v2_history ON v2_history.node_id = v2_node.id AND v2_history.user_id = ?",userid) orderdesc ("v2_history.date") rows

	  def getRecentClaims(userid : Int) = getRecentNodes(userid, "claim")
	  def getRecentTopics(userid : Int) = getRecentNodes(userid, "topic")
		  		  		
	def recentLinked(linkedto : Int, typ : String, userid : Int, page : Int) = 
		select("v2_history.date","v2_history").leftjoin("v2_node.*","v2_node ON v2_node.id = v2_history.node_id")
			.leftjoin ("v2_link.id AS linkid","v2_link ON ((src = ? AND dst = v2_node.id) OR (dst = ? AND src = v2_node.id))",linkedto)
			.orderdesc("v2_history.date")
			.where("v2_node.type = ?",typ)
			.where("v2_history.user_id = ?",userid)
			.paged(page)
			.rows
	
    val topic_claims = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user,v2_link "+
              "WHERE v2_link.src = v2_node.id "+
              "AND v2_node.type = 'claim' "+
              "AND v2_link.type = 'about' "+
              "AND v2_link.dst = ? "+
              "AND v2_node.user_id = v2_user.id "+
              "ORDER BY instance_count DESC "+
              "LIMIT 20 OFFSET ?")
              
    def topicClaims(topicid : Int, offset : Int) = topic_claims.queryRows(topicid,offset)                            

	val set_spam_claim = stmt("REPLACE INTO spam_claim (node_id,user_id) VALUES (?,?)")
	def setSpamClaim(claimid : Int, userid : Int) = set_spam_claim.update(claimid,userid)
	
	val ignore_claim = stmt("INSERT INTO ignore_claim (claim_id,user_id) VALUES (?,?)")
	def ignoreClaim(claimid : Int, userid : Int) = ignore_claim.update(claimid,userid)
	
	val ignored_claims = stmt("SELECT claim_id FROM ignore_claim WHERE user_id = ?")
	def ignoredClaims(userid : Int) = ignored_claims.querySeq(userid)
	
	val unignore_claim = stmt("DELETE FROM ignore_claim WHERE claim_id = ? AND user_id = ?")
	def unIgnoreClaim(claimid : Int, userid : Int) = unignore_claim.update(claimid,userid)

	def hotClaims = claims(0) where ("disagree_count > 0") orderdesc ("id") rows
	
	val all_claims = stmt("SELECT id,text FROM v2_node WHERE type=?")
	def allClaims = all_claims.queryRows("claim")
}
