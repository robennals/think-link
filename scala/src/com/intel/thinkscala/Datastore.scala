package com.intel.thinkscala

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import scala.collection.mutable.ArrayBuffer;
import scala.collection.mutable.HashMap;
import scala.collection.mutable.Queue;
import scala.collection.Map;

object Pool{
  import Util._
  var size = 0
  val pool = new Queue[Datastore]
  def get() : Datastore = synchronized {
    log("get - pool size = "+pool.size+" total="+size)
    if(pool.isEmpty){
      size+=1
      new Datastore
    }else pool.dequeue
  }
  def release(d : Datastore) = synchronized {
    log("release - pool size = "+pool.size+" total="+size)
    pool += d
  } 
}

class User(val name : String, val userid : Int){
  val realuser = userid != 0
}

object User {
  val autoimport = new User("autoimport",0)
  val nouser = new User("no user",0)
}



class Datastore {  
  Class.forName("com.mysql.jdbc.Driver")
  var con = DriverManager.getConnection(
    "jdbc:mysql://localhost:3306/thinklink?autoReconnect=true",
    "thinklink","zofleby")
    
  def stmt(s : String) = new SqlStatement(con,s)
  def mkinsert(table : String, fields : String*) = SqlStatement.mkInsert(con,table,fields)

  val get_user = stmt("SELECT id,password,name FROM v2_user WHERE email = ?");
  def getUser(email : String, password : String) : User = 
    get_user.queryOne(email) match {
      case Some(row) if row("password") == password => 
        new User(row.str("name"),row.int("id"))
      case _ => User.nouser
    }  
  
  val get_info = stmt("SELECT v2_node.*, v2_user.name AS username "+
                        "FROM v2_node,v2_user "+
                        "WHERE v2_node.id=? "+
                        "AND v2_node.user_id = v2_user.id")
  def getInfo(id : Int, userid : Int) = get_info.queryOne(id)

  
  // === find claims ===
  
  // HOT: currently just the most recently accessed stuff
  val get_hot = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_history,v2_user "+
                       "WHERE v2_node.id = v2_history.node_id "+
                       "AND type = 'claim' AND opposed = true "+
                       "AND v2_user.id = v2_node.user_id "+
                       "GROUP BY id ORDER BY 'date' DESC LIMIT 10")
  def getHotClaims = get_hot.queryRows()

  val search_claims = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user "+
                     "WHERE type = 'claim' "+
                     "AND v2_user.id = v2_node.user_id "+
                     "AND MATCH(text) AGAINST(?) "+
                     "LIMIT 20")
  def searchClaims(query : String) = search_claims.queryRows(query)
  
  
  // === Follow links ===
  
  val linked_nodes = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user,v2_link "+
                            "WHERE v2_link.src = v2_node.id "+
                            "AND v2_node.type = ? "+
                            "AND v2_link.type = ? "+
                            "AND v2_link.dst = ? "+
                            "GROUP BY v2_node.id "+
                            "LIMIT ? OFFSET ?")
  def linkedNodes(typ : String, rel : String, target : Int, offset : Int, limit : Int) = 
    linked_nodes.queryRows(typ,rel,target,limit,offset)

  val linkedto_nodes = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user,v2_link "+
                            "WHERE v2_link.dst = v2_node.id "+
                            "AND v2_node.type = ? "+
                            "AND v2_link.type = ? "+
                            "AND v2_link.src = ? "+
                            "GROUP BY v2_node.id "+
                            "LIMIT ? OFFSET ?")
  def linkedToNodes(source : Int, rel : String, typ : String, offset : Int, limit : Int) = 
    linkedto_nodes.queryRows(typ,rel,source,limit,offset)
  
  val linked_either_nodes = stmt("SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user,v2_link "+
                            "WHERE v2_node.type = ? AND "+
                               "((v2_link.dst = v2_node.id  AND v2_link.src = ?) "+
                               "OR (v2_link.src = v2_node.id AND v2_link.dst = ?) "+
                            "AND v2_link.type = ? "+
                            "GROUP BY v2_node.id "+
                            "LIMIT ? OFFSET ?")
  def linkedEitherNodes(source : Int, rel : String, typ : String, offset : Int, limit : Int) = 
    linked_either_nodes.queryRows(typ,source,source,rel,limit,offset)
  
  
//  val linked_snippets = stmt("SELECT v2_node,*,v2_user.name AS username "+
//                            "FROM v2_node,v2_user,v2_link "+
//                            "WHERE v2_link.src = v2_node.id "+
//                            "AND v2_node.type = ? "+
//                            "AND v2_link.type = ? "+
//                            "AND v2_link.dst = ? "+
//                            "OFFSET ? LIMIT ?")

  
  // === Snippet Search ===
  
  val mk_search = mkinsert("v2_snipsearch","claim_id","searchtext")
  def mkSearch(claimid : Int, searchtext : String) = mk_search.insert(claimid,searchtext)
  
  val mk_url = mkinsert("v2_searchurl","url","title")
  def mkUrl(url : String, title : String) = mk_url.insert(url,title)
                                                  
  val mk_result = mkinsert("v2_searchresult","search_id","url_id","position","abstract","pagetext")
  def mkResult(searchid : Int, urlid : Int, position: Int, abstr : String, pagetext : String) =
    mk_result.insert(searchid,urlid,position,abstr,pagetext)    
  
  // === Nodes ===
  
  val mk_node = stmt("INSERT INTO v2_node (text,user_id,type,info,opposed,avg_order) "+
                       "VALUES(?,?,?,?,false,'') ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)")
  def mkNode(text : String, userid : Int, typ : String, info : String) = 
    mk_node.insert(text,userid,typ,info)
  
  val get_node = stmt("SELECT id FROM v2_node WHERE text = ? AND type = ?")                                                     
  def getNode(text : String, typ : String, user : User) = 
    get_node.queryOne(text,typ) match {
      case None => mkNode(text, user.userid, typ, "")
      case Some(row) => row.int("id")
    }
                                                     
  def getClaim(text : String,user : User) = getNode(text,"claim",user)                                                     
  
  val results_for_claim = stmt("SELECT * FROM v2_snipsearch, v2_searchresult "+
                                 "WHERE v2_snipsearch.id = search_id AND claim_id = ? "+
                                 """AND pagetext != "" """)
  def resultsForClaim(claimid : Int) = results_for_claim.queryRows(claimid)
  
                                                     
}
