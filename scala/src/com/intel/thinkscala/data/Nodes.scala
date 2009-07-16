package com.intel.thinkscala.data

import com.intel.thinkscala.SqlQuery._

trait Nodes extends BaseData {
	  // === find claims ===
	  
	
//	 def getNodes(typ : String, topic : Option[Int], search : Option[String], user : Option[Int]) = {
//		 val basic = "SELECT v2_node.*, v2_user.name AS username, v2_user.id AS userid FROM v2_node, "
//		 
//	 }	
		
	val v2_node = select("v2_node")
	val nodes =	v2_node join ("v2_user.name AS username","v2_user ON v2_node.user_id = v2_user.id")
	def typnodes(typ : String, page : Int) = nodes where ("v2_node.type = ?",typ) where ("hidden = false") paged (page)
	def usernodes(typ : String, userid : Int, page : Int) = typnodes(typ,page) where ("user_id = ?",userid)
	def claims(page : Int) = typnodes("claim",page) 
	def topics(page : Int) = typnodes("topic",page)

	def getClaim(id : Int, userid : Int) = {
		if(userid != 0){
			logRecent(userid,id)
		}
		nodes join ("ignore_claim.user_id AS ignored","ignore_claim ON claim_id = v2_node.id AND ignore_claim.user_id = ?",userid) where ("v2_node.id = ?",id) one
	}
	
	  def nodesByUser(typ : String, userid : Int, page : Int) =
		  typnodes(typ,page) where ("user_id = ?",userid) orderby ("instance_count") rows
	
	  def nodesUserDeleted(typ : String, userid : Int, page : Int) =
		  nodes where ("hidden = true") where ("type = ?",typ) where ("user_id = ?",userid) rows
	  
	  def getFrequentClaims(page : Int) = claims(page) orderdesc ("instance_count") rows 

	  def getBigTopics(page : Int) = topics(page) orderdesc ("instance_count") rows
	  
	  def searchClaims(query : String, page : Int) = claims(page) where ("MATCH(text) AGAINST(?)",query) rows
	  
	  def searchLinked(query : String, typ : String, linkedto : Int, page : Int) = 
		  typnodes(typ,page) where ("v2_node.id != ?",linkedto) where ("MATCH(text) AGAINST(?)",query) join ("v2_link.id AS linkid",
				  "v2_link ON ((src = ? AND dst = v2_node.id) OR (dst = ? AND src = v2_node.id))",linkedto) rows
	  	  
	  def searchTopics(query : String, page : Int) = topics(page) where ("MATCH(text) AGAINST(?)")
		
	  val get_recent = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_history,v2_user "+
              "WHERE v2_node.id = v2_history.node_id AND type='claim' AND v2_history.user_id = ? "+
              "AND v2_node.user_id = v2_user.id "+
              "AND v2_node.hidden = false "+
				  "ORDER BY date DESC LIMIT 20")
	def getRecentClaims(userid : Int) = get_recent.queryRows(userid)
	  
	val get_recent_topics = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_history,v2_user "+
	              "WHERE v2_node.id = v2_history.node_id AND type='topic' AND v2_history.user_id = ? "+
	              "AND v2_node.user_id = v2_user.id "+
					  "ORDER BY date DESC LIMIT 20")
	def getRecentTopics(userid : Int) = get_recent_topics.queryRows(userid)
	
	val recent_linked = stmt("SELECT v2_node.id, v2_node.text, v2_link.id AS linkid "+
	         "FROM v2_history, v2_node LEFT JOIN v2_link ON "+
	                 "((src = ? AND dst = v2_node.id) OR (dst = ? AND src = v2_node.id)) "+
				 "WHERE v2_node.type = ? "+
	         "AND v2_node.id != ? "+
	         "AND v2_history.node_id = v2_node.id "+
	         "AND v2_history.user_id = ? "+                    		 
	         "ORDER BY date DESC "+
	         "LIMIT 20 OFFSET ?") 
	def recentLinked(linkedto : Int, typ : String, userid : Int, page : Int) = recent_linked.queryRows(linkedto,linkedto,typ,linkedto,userid,page*20)
	
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

	
}
