package com.intel.thinkscala

import java.sql.Connection
import java.sql.DriverManager
import java.sql.PreparedStatement
import java.sql.ResultSet
import java.sql.SQLException
import java.sql.Statement
import java.util.Date
import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import scala.collection.mutable.Queue
import scala.collection.Map
import com.intel.thinkscala.data._

object Pool{
  import Util._
  var size = 0
  val pool = new Queue[Datastore]
  val minute = 1000*60
  def tryget() : Option[Datastore] = synchronized {
    if(pool.isEmpty) None else Some(pool.dequeue)
  }
  def get() : Datastore = {    
    log("get - pool size = "+pool.size+" total="+size)
    val now = new Date getTime;
    tryget match {
      case Some(s) if now - s.connectdate < 10*minute => s
      case Some(s) => s.con.close; new Datastore
      case None => new Datastore 
    }
  }
  def release(d : Datastore) = {
    log("release - pool size = "+pool.size+" total="+size)
    synchronized {
      pool += d
    }
  } 
}

class User(val name : String, val userid : Int, val isadmin : Boolean, val studytrack : Boolean){
  def this(name : String, userid : Int) = this(name,userid,false,false)
  val realuser = userid != 0
}

object User {
  val autoimport = new User("autoimport",2)
  val nouser = new User("no user",0)
  val turk = new User("turk",2)
}


abstract class BaseData {
	def stmt(s : String) = new SqlStatement(con,s)
	implicit val con = DriverManager.getConnection(
	    "jdbc:mysql://localhost:3306/thinklink?autoReconnect=true",
	    "thinklink","zofleby")  
    
	val connectdate = new Date getTime 
	
	Class.forName("com.mysql.jdbc.Driver")
	
	def mkinsert(table : String, fields : String*) = SqlStatement.mkInsert(con,table,fields)
	
    val log_recent = stmt("REPLACE DELAYED INTO v2_history (user_id,node_id,date) VALUES (?,?,CURRENT_TIMESTAMP)")
	def logRecent(userid : Int, nodeid : Int) = log_recent.update(userid,nodeid)
}


class Datastore extends BaseData 
	with com.intel.thinkscala.data.UserData with Conflicts with data.UrlCache with data.Nodes 
	with data.Evidence with data.Snippets
 {  
    val get_info = stmt("SELECT v2_node.*, v2_user.name AS username "+
                        "FROM v2_node,v2_user "+
                        "WHERE v2_node.id=? "+
                        "AND v2_node.user_id = v2_user.id")
  def getInfo(id : Int, userid : Int) = {
    if(userid != 0){
      logRecent(userid,id)
    }
    get_info.queryOne(id)
  }    
  
  
  val top_users = stmt("SELECT * FROM v2_user WHERE id != 2 ORDER BY snipcount DESC LIMIT 10")
  def topUsers = top_users.queryRows()
    
  // === find marked stuff ===
  

  
  // === add and break links ==
  
  val add_link = stmt("INSERT INTO v2_link (src,dst,type,user_id) VALUES (?,?,'relates to',?)")
  def addLink(src : Int, dst : Int, userid : Int) = {
    add_link.update(src,dst,userid)
    updateTopicCount(dst)
  }
  
  val break_link = stmt("DELETE FROM v2_link WHERE src = ? and dst = ?")
  val remember_link = stmt("INSERT INTO deleted_link (src,dst,user_id) VALUES (?,?,?)")
  def breakLink(src : Int, dst : Int, userid : Int) = {
    break_link.update(src,dst)
    remember_link.update(src,dst,userid)
  }
  
                                                                                                                         
  // === Follow links ===

  val linked_nodes = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user,v2_link "+
                            "WHERE v2_link.src = v2_node.id "+
                            "AND v2_node.type = ? "+
                            "AND v2_link.type = ? "+
                            "AND v2_link.dst = ? "+
                            "AND v2_node.user_id = v2_user.id "+
                            "GROUP BY v2_node.id "+
                            "LIMIT ? OFFSET ?")
  def linkedNodes(typ : String, rel : String, target : Int, offset : Int, limit : Int) = 
    linked_nodes.queryRows(typ,rel,target,limit,offset)


  val linkedto_nodes = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user,v2_link "+
                            "WHERE v2_link.dst = v2_node.id "+
                            "AND v2_node.type = ? "+
                            "AND v2_link.type = ? "+
                            "AND v2_link.src = ? "+
                            "AND v2_node.user_id = v2_user.id "+
                            "GROUP BY v2_node.id "+
                            "LIMIT ? OFFSET ?")
  def linkedToNodes(source : Int, rel : String, typ : String, offset : Int, limit : Int) = 
    linkedto_nodes.queryRows(typ,rel,source,limit,offset)

//  val linked_either_nodes2 = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user,v2_link "+
//                            "WHERE v2_node.type = ? AND "+
//                               "((v2_link.dst = v2_node.id  AND v2_link.src = ?) "+
//                               "OR (v2_link.src = v2_node.id AND v2_link.dst = ?)) "+
//                            "AND v2_link.type = ? "+
//                            "AND v2_node.user_id = v2_user.id "+
//                            "GROUP BY v2_node.id "+
//                            "LIMIT ? OFFSET ?")
  val linked_topics = stmt("SELECT v2_node.text,v2_node.id,v2_node.instance_count,v2_node.description,user_id,v2_user.name AS username FROM "+
                    " ((select src AS id FROM v2_link WHERE dst = ?) "+
                         "UNION (select dst AS id FROM v2_link WHERE src = ?)) "+
                    "AS lnks, v2_node, v2_user "+
                    "WHERE lnks.id = v2_node.id "+
                    "AND v2_node.type = 'topic' "+
                    "AND v2_user.id = v2_node.user_id "+
  					"LIMIT 20 OFFSET ?")
  def linkedTopics(node : Int, page : Int) = linked_topics.queryRows(node,node,page * 20)  					

  //  
//  def linkedEitherNodes(source : Int, rel : String, typ : String, offset : Int, limit : Int) = 
//    linked_either_nodes.queryRows(typ,source,source,rel,limit,offset)

  
  val linked_claims = stmt("SELECT v2_node.text,v2_node.id,v2_node.instance_count,v2_node.description,user_id,v2_user.name AS username FROM "+
                    " ((select src AS id FROM v2_link WHERE dst = ?) "+
                         "UNION (select dst AS id FROM v2_link WHERE src = ?)) "+
                    "AS lnks, v2_node, v2_user "+
                    "WHERE lnks.id = v2_node.id "+
                    "AND v2_node.type = 'claim' "+
                    "AND v2_user.id = v2_node.user_id "+
                    "ORDER BY instance_count DESC "+
  					"LIMIT 20 OFFSET ?")
  def linkedClaims(claim : Int, page : Int) = linked_claims.queryRows(claim,claim,page*20)
    
  val user_link_count = stmt("SELECT v2_node.*,COUNT(v2_link.src) AS count FROM v2_node,v2_link "+
                               "WHERE v2_link.dst = v2_node.id "+
                               "AND v2_link.user_id = ? "+
                               "AND v2_link.type = ?"+ 
                               "LIMIT ? OFFSET ?")
  def userLinkCount(userid : Int, typ : String, offset : Int, limit : Int) = user_link_count.queryRows(userid,typ,limit,offset)
  
  // === Snippet Search - read ===
  val search_queries = stmt("SELECT * FROM v2_snipsearch WHERE claim_id = ? ORDER BY marked_yes DESC")
  def searchQueries(claimid : Int) = search_queries.queryRows(claimid)
  
  // === Snippet Search - Write ===
  
  val mk_search = mkinsert("v2_snipsearch","claim_id","searchtext")
  def mkSearch(claimid : Int, searchtext : String) = mk_search.insert(claimid,searchtext)
  
  val mk_url = stmt("INSERT INTO v2_searchurl (url,title,url_hash,domain_hash) "+
                      "VALUES (?,?,CRC32(?),CRC32(?)) "+
                      "ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)")
  def mkUrl(url : String, title : String) = mk_url.insert(url,title,url,Util.domainForUrl(url))                      
  
//  val find_url = stmt("SELECT * FROM v2_searchurl WHERE url_hash = ? AND url = ?")
//  val add_url = stmt(")
                          
  val mk_result = mkinsert("v2_searchresult","search_id","url_id","position","abstract","pagetext","claim_id")
  def mkResult(searchid : Int, urlid : Int, position: Int, abstr : String, pagetext : String,claimid : Int) =
    mk_result.insert(searchid,urlid,position,abstr,new TruncString(pagetext,2048),claimid)    
  
  val update_snip_user_true = stmt("UPDATE v2_searchresult "+
                 "SET user_id = "+
                    "(SELECT user_id FROM v2_searchvote WHERE result_id = v2_searchresult.id LIMIT 1) "+
                 "WHERE id = ?")
  val update_snip_user_false = stmt("UPDATE v2_searchresult "+
                 "SET user_id = "+
                    "(SELECT user_id FROM v2_searchvote WHERE result_id = v2_searchresult.id ORDER BY date DESC LIMIT 1) "+
                 "WHERE id = ?")
                                   
  val set_snip_vote = stmt("REPLACE INTO v2_searchvote (result_id, user_id, vote) "+
                             "VALUES (?,?,?)")
  val set_snip_state = stmt("UPDATE v2_searchresult SET state = ? WHERE id=?")
  val set_user_snip_count = stmt("UPDATE v2_user SET snipcount = "+
                                   "(SELECT COUNT(result_id) FROM v2_searchvote WHERE vote=true AND user_id = v2_user.id) "+
  									"WHERE id = ?")
  def setSnipVote(resultid : Int, userid : Int, vote : Boolean) = {
    set_snip_vote.update(resultid,userid,vote)
    set_snip_state.update(""+vote,resultid)
    if(vote){
      set_user_snip_count.update(userid)
      update_snip_user_true.update(resultid)
    }else{
      update_snip_user_false.update(resultid)
    }
    val row = getSnippet(resultid)
    updateInstanceCount(row.int("claim_id"))
  }
  
  val get_search_result = stmt("SELECT * FROM v2_searchresult WHERE id = ?")
  def reportBadSnip(resultid : Int, userid : Int) = {
    val row = get_search_result.queryOne(resultid)
    setSnipVote(resultid,userid,false)    
  }
  
  
  val set_vote = stmt("REPLACE INTO vote (user_id,object_id,type,vote) VALUES (?,?,?,?)")
  def setVote(user_id : Int, object_id : Int, typ : String, vote : String) = set_vote.update(user_id,object_id,typ,vote)
  
  val update_search_counts = stmt("UPDATE v2_snipsearch SET "+
                                    "marked_yes = (SELECT COUNT(id) FROM v2_searchresult "+
                                        "WHERE search_id = v2_snipsearch.id AND state='true'), "+ 
                                    "marked_no = (SELECT COUNT(id) FROM v2_searchresult "+
                                        "WHERE search_id = v2_snipsearch.id AND state='false') " +
                                    "WHERE v2_snipsearch.id = ?")
  val update_instance_count = stmt("UPDATE v2_node SET instance_count = "+
                                     "(SELECT COUNT(*) FROM v2_searchresult WHERE claim_id = v2_node.id AND state = 'true') "+
                                     "WHERE id = ?")
//  val update_instance_count = stmt("UPDATE v2_node SET instance_count = "+
//                                     "(SELECT SUM(marked_yes) FROM v2_snipsearch WHERE claim_id = v2_node.id) "+
//                                     "WHERE id = ?")
  def updateSearchCounts(claimid : Int, searchid : Int) = {
    update_search_counts.update(searchid)
    update_instance_count.update(claimid)    
  }
  def updateInstanceCount(claimid : Int) = update_instance_count.update(claimid)
  
  
  // TODO: this is a hack
  val update_topic_count = stmt("UPDATE v2_node SET instance_count = "+
                                   "(SELECT COUNT(src) FROM v2_link "+
                                		   "WHERE dst = v2_node.id) "+
                                		   "WHERE type='topic' AND id = ?")
  def updateTopicCount(id : Int) = update_topic_count.update(id)

//  val get_snippet = stmt("SELECT state,user_id,v2_user.name AS username "+
//                                "FROM v2_searchresult,v2_searchurl,v2_user "+
//                                "WHERE v2_searchurl.id = v2_searchresult.url_id "+
//                                "AND v2_searchurl.url = ? "+
//                                "AND v2_searchresult.claim_id = ? "+
//                                "AND v2_user.id = v2_searchresult.user_id "+
//                                "AND v2_searchresult.abstract = ?")
//                              
//  def getSnippet(url : String, claimid : Int, abstr : String) = 
//    existing_snippet.queryMaybe(url,claimid,abstr) match {
//    	case Some(row) => Some(row)
//    	case None => 
//    }
//  
  
  // === Nodes ===
  
  val mk_node = stmt("INSERT INTO v2_node (text,user_id,type,info,opposed,avg_order) "+
                       "VALUES(?,?,?,?,false,'') ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)")
  def mkNode(text : String, userid : Int, typ : String, info : String) = 
    mk_node.insert(text,userid,typ,info)
  
  val get_node = stmt("SELECT id FROM v2_node WHERE text = ? AND type = ?")                                                     
  def getNode(text : String, typ : String, user : User) = 
    get_node.queryMaybe(text,typ) match {
      case None => mkNode(text, user.userid, typ, "")
      case Some(row) => row.int("id")
    }
           
  val make_evidence = stmt("INSERT INTO evidence (user_id,claim_id,text,url,title,verb) "+
                             "VALUES (?,?,?,?,?,?)")
  def makeEvidence(userid : Int, claimid : Int, text : String, url : String, title : String, verb : String) =
	  make_evidence.insert(userid, claimid,text,url,title,verb)
                
  val set_user_claim_count = stmt("UPDATE v2_user SET claimcount = "+
                                  "(SELECT COUNT(id) FROM v2_node WHERE type='claim' AND user_id = v2_user.id) "+
  									"WHERE id = ?")  
  val make_claim = stmt("INSERT INTO v2_node (text,description,user_id,type,info) "+
                         "VALUES (?,?,?,'claim','')")
  def makeClaim(text : String, desc : String, userid : Int) : Int = { 
	  val id = make_claim.insert(text,desc,userid)
      set_user_claim_count.update(userid)
      return id
  }

  val make_topic = stmt("INSERT INTO v2_node (text,description,user_id,type,info) "+
                         "VALUES (?,?,?,'topic','')")
  def makeTopic(text : String, desc : String, userid : Int) : Int = { 
	  val id = make_topic.insert(text,desc,userid)
      return id
  }
  
  def getClaim(text : String,user : User) = getNode(text,"claim",user)                                                     
    
  val results_for_claim = stmt("SELECT * FROM v2_snipsearch, v2_searchresult, v2_searchurl "+
                                 "WHERE v2_snipsearch.id = search_id "+
                                 "AND v2_searchurl.id = v2_searchresult.url_id "+
                                 "AND v2_snipsearch.claim_id = ? ")
  def resultsForClaim(claimid : Int) = results_for_claim.queryRows(claimid)
  
  val info_for_snippet = stmt("SELECT * FROM v2_snipsearch, v2_searchresult, v2_searchurl "+
                                 "WHERE v2_snipsearch.id = search_id "+
                                 "AND v2_searchurl.id = v2_searchresult.url_id "+
                                 "AND (v2_searchresult.abstract = ? "+
                                		 "OR abstract = CONCAT(' ',?)) "+
                                 "AND v2_snipsearch.claim_id = ? ")
  def infoForSnippet(claimid : Int, text : String) = info_for_snippet.queryMaybe(text,text,claimid)
  
  // === URL Snippets ===
  
  val url_snippets = stmt("SELECT v2_searchresult.id, abstract AS text,v2_searchresult.claim_id AS claimid,v2_node.text AS claimtext "+
                            "FROM v2_searchurl, v2_searchresult, v2_node "+
                            "WHERE v2_searchurl.url = ? "+
                            "AND v2_searchresult.state = 'true' "+
                            "AND v2_node.id = v2_searchresult.claim_id "+
                            "AND v2_searchresult.url_id = v2_searchurl.id")
  def urlSnippets(url : String) = url_snippets.queryRows(url)
  
  val page_snippets = stmt("SELECT v2_searchresult.id, abstract AS text,v2_searchresult.claim_id AS claimid,v2_node.text AS claimtext "+
                            "FROM v2_searchurl, v2_searchresult, v2_node "+
                            "WHERE v2_searchurl.domain_hash = ? "+
                            "AND v2_searchurl.url_hash = ? "+
                            "AND v2_searchresult.state = 'true' "+
                            "AND v2_node.id = v2_searchresult.claim_id "+
                            "AND v2_searchresult.url_id = v2_searchurl.id")
  def pageSnippets(domainhash : Long, pagehash : Long) = page_snippets.queryRows(domainhash,pagehash)
  
  
  val domain_pages = stmt("SELECT url_hash FROM v2_searchurl WHERE domain_hash = ?")
  def domainPages(domainhash : Long) = domain_pages.querySeq(domainhash) map (x => Util.toSigned(x.asInstanceOf[Long])) 
  
  
  // === Turk Claim Creation ===

  val set_turk_response = stmt("INSERT INTO turk_claim (hit_id,node_id,ev_id,turker_id,jsonsnips) "+
                                 "VALUES (?,?,?,?,?)")
  def setTurkResponse(turkid : Int, claimid : Int, evid : Int, turkerid : Int, jsonsnips : String) =
	  set_turk_response.insert(turkid, claimid, evid,turkerid,jsonsnips)
 
  val get_turk_response = stmt("SELECT v2_node.text AS claim,evidence.url AS evurl, evidence.text as evquote, jsonsnips AS jsonsnips FROM turk_claim,v2_node,evidence "+
                            	"WHERE hit_id = ? "+
                                "AND v2_node.id = turk_claim.node_id "+
                                "AND evidence.id = turk_claim.ev_id")
  def turkResponse(hitid : Int) = get_turk_response.queryMaybe(hitid)
  
  // === Turk Snippet Marking ===
  
  val set_turk_result = stmt("INSERT INTO v2_turkresult (turkuser,hit_id,question,vote) "+
		  					"VALUES (?,?,?,?)")
  def setTurkResult(turkuser : Int, hitid : Int, question : Int, vote : Boolean) = 
	  set_turk_result.insert(turkuser,hitid,question,vote)
  
  val get_user_stats = stmt("SELECT FROM v2_turkresult AS this, v2_turkresult AS that,")
            
  
  
  // === Batch tasks ===
  
  val get_all_urls = stmt("SELECT id,url FROM v2_searchurl")
  val set_url_domain = stmt("UPDATE v2_searchurl SET domain_hash = CRC32(?) WHERE id = ?")
  
  def computeUrlDomainHashes = {
    val rows = get_all_urls.queryRows()
    rows.foreach(row => {
      val domain = Util.domainForUrl(row.str("url"))
      set_url_domain.update(domain,row.int("id"))
    })
  }
                            
	  
}
