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
  val pool = new Queue[Datastore]
  def get() : Datastore = synchronized {
    if(pool.isEmpty) new Datastore
    else pool.dequeue
  }
  def release(d : Datastore) = synchronized {
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
      case Some(row) if row.getStr("password") equals password => 
        new User(email,row.getInt("id"))
      case _ => User.nouser
    }  
  
  val get_info = stmt("SELECT v2_node.*, v2_user.name AS username "+
                        "FROM v2_node,v2_user "+
                        "WHERE id=? "+
                        "AND v2_node.user_id = v2_user.node_id")
  def getInfo(id : Int, userid : Int) = get_info.queryOne(id,userid)

  val mk_search = mkinsert("v2_snipsearch","claim_id","searchtext")
  def mkSearch(claimid : Int, searchtext : String) = mk_search.insert(claimid,searchtext)

  
  val mk_url = mkinsert("v2_searchurl","url","title")
  def mkUrl(url : String, title : String) = mk_url.insert(url,title)
                                                  
  val mk_result = mkinsert("v2_searchresult","search_id","url_id","position","abstract","pagetext")
  def mkResult(searchid : Int, urlid : Int, position: Int, abstr : String, pagetext : String) =
    mk_result.insert(searchid,urlid,position,abstr,pagetext)    
                                                                                                
  val mk_node = stmt("INSERT INTO v2_node (text,user_id,type,info,opposed,avg_order) "+
                       "VALUES(?,?,?,?,false,'') ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)")
  def mkNode(text : String, userid : Int, typ : String, info : String) = 
    mk_node.insert(text,userid,typ,info)
  
  val get_node = stmt("SELECT id FROM v2_node WHERE text = ? AND type = ?")                                                     
  def getNode(text : String, typ : String, user : User) = 
    get_node.queryOne(text,typ) match {
      case None => mkNode(text, user.userid, typ, "")
      case Some(row) => row.getInt("id")
    }
                                                     
  def getClaim(text : String,user : User) = getNode(text,"claim",user)                                                     
  
  val results_for_claim = stmt("SELECT * FROM v2_snipsearch, v2_searchresult "+
                                 "WHERE v2_snipsearch.id = search_id AND claim_id = ? "+
                                 """AND pagetext != "" """)
  def resultsForClaim(claimid : Int) = results_for_claim.queryRows(claimid)
  
                                                     
}
