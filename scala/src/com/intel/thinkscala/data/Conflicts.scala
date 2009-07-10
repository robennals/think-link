package com.intel.thinkscala.data

trait Conflicts extends BaseData {

  val spam_claims = stmt("SELECT v2_node.*, spam_claim.state, "+
           "thisuser.id AS thisid, thisuser.name AS thisname, "+
           "thatuser.id AS thatid, thatuser.name AS thatname "+
           "FROM v2_node, spam_claim, v2_user AS thisuser, v2_user AS thatuser "+
           "WHERE v2_node.id = spam_claim.node_id "+
           "AND thisuser.id = spam_claim.user_id "+
           "AND thatuser.id = v2_node.user_id "+
           "LIMIT 20 OFFSET ?")
  def spamClaims(page : Int) = spam_claims.queryRows(page*20)
  
  val set_spam = stmt("UPDATE v2_node SET hidden=? WHERE id=?")
  val set_spam_done = stmt("UPDATE spam_claim SET state = ? WHERE node_id = ?")
  def yesSpam(nodeid : Int){
	  set_spam.update(true,nodeid)
      set_spam_done.update("yes",nodeid)
    }
  def noSpam(nodeid : Int){
	  set_spam.update(false,nodeid)
	  set_spam_done.update("no",nodeid)
   }
  
}
