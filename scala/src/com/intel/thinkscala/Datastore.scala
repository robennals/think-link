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

class User(val name : String, val userid : Int){
  val realuser = userid != 0
}

object User {
  val autoimport = new User("autoimport",2)
  val nouser = new User("no user",0)
  val turk = new User("turk",2)
}



class Datastore {  
  
  val connectdate = new Date getTime 
  
  Class.forName("com.mysql.jdbc.Driver")
  var con = DriverManager.getConnection(
    "jdbc:mysql://localhost:3306/thinklink?autoReconnect=true",
    "thinklink","zofleby")
    
  def stmt(s : String) = new SqlStatement(con,s)
  def mkinsert(table : String, fields : String*) = SqlStatement.mkInsert(con,table,fields)

  val get_user = stmt("SELECT id,password,name FROM v2_user WHERE email = ? AND nonce = 0")
  def getUser(email : String, password : String) : User = 
    get_user.queryMaybe(email) match {
      case Some(row) if row("password") == password => 
        new User(row.str("name"),row.int("id"))
      case _ => User.nouser
    }  
  
  val create_user = stmt("INSERT INTO v2_user (email,name,password,nonce) VALUES (?,?,?,?)")
  def createUser(email : String,name : String,password : String) : (Int,Int) = {
    import java.util.Random
    val nonce : Int = Math.abs(new Random nextInt)
    val userid = create_user.insert(email,name,password,nonce)
    return (userid,nonce)      
  }                      
  
  val email_registered = stmt("SELECT id FROM v2_user WHERE email = ?")
  def emailRegistered(email : String) = 
	  email_registered.queryMaybe(email) match {
	    case Some(_) => true
	    case _ => false
	  }

  val name_registered = stmt("SELECT id FROM v2_user WHERE name = ?")
  def nameRegistered(name : String) = 
	  name_registered.queryMaybe(name) match {
	    case Some(_) => true
	    case _ => false
	  }

  
  val check_confirm_user = stmt("SELECT * FROM v2_user WHERE nonce = ?")
  val confirm_user = stmt("UPDATE v2_user SET nonce = 0 WHERE nonce = ?")
  def confirmUser(nonce : Int) = {
    check_confirm_user.queryMaybe(nonce) match {
      case Some(_) => confirm_user.update(nonce); true
      case _ => false                                                                                                
    }
  }
                         
  
  val get_user_info = stmt("SELECT * FROM v2_user WHERE id = ?")
  def getUserInfo(id : Int) = get_user_info.queryOne(id)
  
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

  // == recent stuff ==
    
  val log_recent = stmt("REPLACE DELAYED INTO v2_history (user_id,node_id,date) VALUES (?,?,CURRENT_TIMESTAMP)")
  def logRecent(userid : Int, nodeid : Int) = log_recent.update(userid,nodeid)
 
  val get_recent = stmt("SELECT * FROM v2_node,v2_history "+
                          "WHERE v2_node.id = v2_history.node_id AND v2_history.user_id = ? "+
  						  "ORDER BY date DESC LIMIT 20")
  def getRecentClaims(userid : Int) = get_recent.queryRows(userid)
  
  // === find marked stuff ===
  
  val recent_marked_pages = stmt("SELECT v2_node.id AS claimid, url, title, v2_node.text AS claimtext "+
                                   "FROM v2_searchresult, v2_searchurl, v2_node "+
                                   "WHERE v2_searchurl.id = url_id "+
                                   "AND v2_node.id = v2_searchresult.claim_id "+
                                   "AND v2_searchresult.state = 'true' "+
                                   "ORDER BY searchdate DESC LIMIT 20 OFFSET ?")
  def recentMarkedPages(page : Int) = recent_marked_pages.queryRows(page * 20)
  
  // === find claims ===
  
  // HOT: currently just the most recently accessed stuff
  val get_hot = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_history,v2_user "+
                       "WHERE v2_node.id = v2_history.node_id "+
                       "AND type = 'claim' AND opposed = true "+
                       "AND v2_user.id = v2_node.user_id "+
                       "GROUP BY v2_node.id ORDER BY v2_history.date DESC LIMIT 10")
  def getHotClaims = get_hot.queryRows()
  
  val get_frequent = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user "+
                            "WHERE v2_user.id = v2_node.user_id "+
                            "AND type=? "+
                            "ORDER BY instance_count DESC LIMIT 10 OFFSET ?") 
  def getFrequentClaims(page : Int) = get_frequent.queryRows("claim",page*10)
  def getBigTopics(page : Int) = get_frequent.queryRows("topic",page*10)
  
  val search_claims = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user "+
                     "WHERE type = 'claim' "+                             
                     "AND v2_user.id = v2_node.user_id "+
                     "AND MATCH(text) AGAINST(?) "+
                     "LIMIT 20 OFFSET ?")
  def searchClaims(query : String, offset : Int) = search_claims.queryRows(query,offset * 20)
  
  
  // === Follow links ===

  val get_evidence = stmt("SELECT * FROM evidence WHERE claim_id=? AND verb = ?")
  def evidence(claimid : Int, verb : String) = get_evidence.queryRows(claimid,verb)
  
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

  val topic_claims = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user,v2_link "+
                            "WHERE v2_link.src = v2_node.id "+
                            "AND v2_node.type = 'claim' "+
                            "AND v2_link.type = 'about' "+
                            "AND v2_link.dst = ? "+
                            "AND v2_node.user_id = v2_user.id "+
                            "ORDER BY instance_count DESC "+
                            "LIMIT 20 OFFSET ?")
  def topicClaims(topicid : Int, offset : Int) = topic_claims.queryRows(topicid,offset)                            
  
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
  
  val linked_either_nodes = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user,v2_link "+
                            "WHERE v2_node.type = ? AND "+
                               "((v2_link.dst = v2_node.id  AND v2_link.src = ?) "+
                               "OR (v2_link.src = v2_node.id AND v2_link.dst = ?)) "+
                            "AND v2_link.type = ? "+
                            "AND v2_node.user_id = v2_user.id "+
                            "GROUP BY v2_node.id "+
                            "LIMIT ? OFFSET ?")
  def linkedEitherNodes(source : Int, rel : String, typ : String, offset : Int, limit : Int) = 
    linked_either_nodes.queryRows(typ,source,source,rel,limit,offset)

  val linked_either_any_nodes = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user,v2_link "+
                            "WHERE v2_node.type = ? AND "+
                               "((v2_link.dst = v2_node.id  AND v2_link.src = ?) "+
                               "OR (v2_link.src = v2_node.id AND v2_link.dst = ?)) "+
                            "AND v2_node.user_id = v2_user.id "+
                            "GROUP BY v2_node.id "+
                            "LIMIT ? OFFSET ?")
  def linkedEitherAnyNodes(source : Int, typ : String, offset : Int, limit : Int) = 
    linked_either_any_nodes.queryRows(typ,source,source,limit,offset)

  
  val nodes_by_user = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user "+
                           "WHERE v2_node.type = ? AND v2_node.user_id = ? "+
                           "AND v2_node.user_id = v2_user.id "+ 
                           "LIMIT ? OFFSET ?")
  def nodesByUser(typ : String, userid : Int, offset : Int, limit : Int) = nodes_by_user.queryRows(typ,userid,limit,offset)
  
  val user_link_count = stmt("SELECT v2_node.*,COUNT(v2_link.src) AS count FROM v2_node,v2_link "+
                               "WHERE v2_link.dst = v2_node.id "+
                               "AND v2_link.user_id = ? "+
                               "AND v2_link.type = ?"+ 
                               "LIMIT ? OFFSET ?")
  def userLinkCount(userid : Int, typ : String, offset : Int, limit : Int) = user_link_count.queryRows(userid,typ,limit,offset)
  
  // === Snippet Search - read ===
  val search_queries = stmt("SELECT * FROM v2_snipsearch WHERE claim_id = ? ORDER BY marked_yes DESC,searchtext")
  def searchQueries(claimid : Int) = search_queries.queryRows(claimid)
  
  // === Snippet Search - Write ===
  
  val mk_search = mkinsert("v2_snipsearch","claim_id","searchtext")
  def mkSearch(claimid : Int, searchtext : String) = mk_search.insert(claimid,searchtext)
  
  val mk_url = stmt("INSERT INTO v2_searchurl (url,title,url_hash) "+
                      "VALUES (?,?,CRC32(?)) "+
                      "ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)")
  def mkUrl(url : String, title : String) = mk_url.insert(url,title,url)                      
  
//  val find_url = stmt("SELECT * FROM v2_searchurl WHERE url_hash = ? AND url = ?")
//  val add_url = stmt(")
                          
  val mk_result = mkinsert("v2_searchresult","search_id","url_id","position","abstract","pagetext","claim_id")
  def mkResult(searchid : Int, urlid : Int, position: Int, abstr : String, pagetext : String,claimid : Int) =
    mk_result.insert(searchid,urlid,position,abstr,new TruncString(pagetext,2048),claimid)    
  
  val set_snip_vote = stmt("REPLACE INTO v2_searchvote (result_id, search_id, user_id, vote) "+
                             "VALUES (?,?,?,?)")
  val set_snip_state = stmt("UPDATE v2_searchresult SET state = ? WHERE id=?")
  def setSnipVote(claimid : Int, resultid : Int, searchid : Int, userid : Int, vote : Boolean) = {
    set_snip_vote.update(resultid,searchid,userid,vote)
    set_snip_state.update(""+vote,resultid)
    updateSearchCounts(claimid, searchid)
  }
  
  val update_search_counts = stmt("UPDATE v2_snipsearch SET "+
                                    "marked_yes = (SELECT COUNT(result_id) FROM v2_searchvote "+
                                        "WHERE search_id = v2_snipsearch.id AND vote=1), "+ 
                                    "marked_no = (SELECT COUNT(result_id) FROM v2_searchvote "+
                                        "WHERE search_id = v2_snipsearch.id AND vote=0) " +
                                    "WHERE v2_snipsearch.id = ?")
  val update_instance_count = stmt("UPDATE v2_node SET instance_count = "+
                                     "(SELECT SUM(marked_yes) FROM v2_snipsearch WHERE claim_id = v2_node.id) "+
                                     "WHERE id = ?")
  def updateSearchCounts(claimid : Int, searchid : Int) = {
    update_search_counts.update(searchid)
    update_instance_count.update(claimid)    
  }
  
  val update_topic_counts = stmt("UPDATE v2_node SET instance_count = "+
                                   "(SELECT COUNT(src) FROM v2_link "+
                                		   "WHERE dst = v2_node.id) "+
                                		   "WHERE type='topic'")
  def updateTopicCounts = update_topic_counts.update()

  
  val existing_snippet = stmt("SELECT * FROM v2_searchresult,v2_searchurl,v2_snipsearch "+
                                "WHERE v2_searchurl.id = v2_searchresult.url_id "+
                                "AND v2_snipsearch.id = v2_searchresult.search_id "+
                                "AND v2_searchurl.url = ? "+
                                "AND v2_snipsearch.searchtext = ? "+
                                "AND v2_searchresult.abstract = ?")
  def existingSnippet(url : String, query : String, abstr : String) = 
    existing_snippet.queryMaybe(url,query,abstr)  
  
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
                                                  
  val make_claim = stmt("INSERT INTO v2_node (text,description,user_id,type,info) "+
                         "VALUES (?,?,?,'claim','')")
  def makeClaim(text : String, desc : String, userid : Int) =
	  make_claim.insert(text,desc,userid)
  
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
                            
                            
	  
}
