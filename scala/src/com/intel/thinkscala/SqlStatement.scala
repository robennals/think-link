package com.intel.thinkscala


import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import scala.collection.mutable.ArrayBuffer;
import scala.collection.mutable.HashMap;
import scala.collection.Map;


class SqlRow extends HashMap[String,Any]{
  def getInt(key : String) = apply(key).asInstanceOf[Int]
  def getStr(key : String) = apply(key).asInstanceOf[String]
}

class SqlStatement(con : Connection, s : String){
  val stmt = con.prepareStatement(s,Statement.RETURN_GENERATED_KEYS)
  
  def queryRows(args : Any*) : Iterable[SqlRow] = {
    setArgs(args)
    readResults(stmt.executeQuery())
  }
  
  def queryOne(args : Any*) : Option[SqlRow] = {
    setArgs(args)
    readOneResult(stmt.executeQuery);
  }
  
  def insert(args : Any*) : Int = {
    setArgs(args)
    stmt.execute()
    val keys = stmt.getGeneratedKeys()
    keys.next()
    val key = keys.getInt(1)
    keys.close()
    return key
  }
  
  def update(args : Any*){
    setArgs(args)
    stmt.executeUpdate
  }
  
  def setArgs(args : Seq[Any]){
    for(i <- 0 until args.length){
      val arg = args(i)
      arg match {
        case s:String => stmt.setString(i+1,s)
        case n:Int => stmt.setInt(i+1,n)
        case null => stmt.setString(i+1,"")
      }
    }
  }
  
  def readOneResult(res : ResultSet) : Option[SqlRow] = {
    if(res.next()){
      val m = readResult(res)
      res.close()
      Some(m)
    }else{
      None
    }
  }
  
  def readResult(res : ResultSet) : SqlRow = {
    val meta = res.getMetaData
    val map = new SqlRow
    for(i <- 1 to meta.getColumnCount){
      map(meta.getColumnLabel(i)) = res.getObject(i)
    }
    return map
  }
  
  def readResults(res : ResultSet) : Iterable[SqlRow] = {
    val buf = new ArrayBuffer[SqlRow]()
    while(res.next()){
     buf += readResult(res) 
    }
    res.close()
    return buf
  }
}

object SqlStatement {
  def mkInsert(con : Connection, table : String,fields : Seq[String]) = 
    new SqlStatement(con,"INSERT INTO "+table+fields.mkString("(",",",")")+" VALUES "+
                       fields.map(x => "?").mkString("(",",",")") +
                       "ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)")
}
