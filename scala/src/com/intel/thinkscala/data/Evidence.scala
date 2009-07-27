package com.intel.thinkscala.data

trait Evidence extends BaseData {
	  val get_evidence = stmt("SELECT evidence.*,v2_user.name AS username,vote.vote "+                            
			  "FROM evidence "+
	          "LEFT JOIN v2_user ON v2_user.id = user_id "+
	          "LEFT JOIN vote ON object_id = evidence.id AND type = 'evidence' AND vote.user_id = ? "+
	          "WHERE claim_id=? AND verb = ? "+ 
	          "LIMIT ? OFFSET ?")
	//  val get_evidence = stmt("SELECT evidence.*,v2_user.name AS username,vote.vote "+
//	                            "FROM evidence, v2_user WHERE claim_id=? AND verb = ? AND v2_user.id = user_id LIMIT 20 OFFSET ?")
	  def evidence(claimid : Int, verb : String, userid : Int, page : Int) = get_evidence.queryRows(userid,claimid,verb,20,page * 20)
	  def evidence_one(claimid : Int, verb : String, userid : Int) = get_evidence.queryRows(userid,claimid,verb,1,0)

	  
	  val evidence_for_user = stmt("SELECT evidence.*,v2_node.id AS claimid, v2_node.text AS claimtext "+
	                                 "FROM evidence,v2_node "+
	                                 "WHERE evidence.user_id = ? AND claim_id = v2_node.id "+
	                                 "LIMIT 20 OFFSET ?")
	  def evidenceForUser(userid : Int, page : Int) = evidence_for_user.queryRows(userid,page * 20)
	  
	  val set_spam_evidence = stmt("REPLACE INTO spam_evidence (evidence_id,user_id) VALUES (?,?)")
	  def setSpamEvidence(evidenceid : Int, userid : Int) = set_spam_evidence.update(evidenceid,userid)
	  
	  val delete_evidence = stmt("DELETE FROM evidence WHERE id = ? AND user_id = ?")
	  def deleteEvidence(evidenceid : Int, user_id : Int) = delete_evidence.update(evidenceid,user_id)

}
