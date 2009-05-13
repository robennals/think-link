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
import scala.util.parsing.json.JSON;

class SqlRow extends HashMap[String,Any]{
  def int(key : String) = apply(key).asInstanceOf[Int]
  def str(key : String) = apply(key).asInstanceOf[String]
  def jsonMap(key : String) : Map[String,String] = JSON.parseFull(str(key)) match {
    case Some(m : Map[_,_]) => m.asInstanceOf[Map[String,String]] 
    case _ => HashMap()
  } 
}

class SqlStatement(con : Connection, s : String){
  val stmt = con.prepareStatement(s,Statement.RETURN_GENERATED_KEYS)
  
  def queryRows(args : Any*) : Seq[SqlRow] = {
    setArgs(args)
    readResults(stmt.executeQuery()).toSeq
  }
  
  def queryMaybe(args : Any*) : Option[SqlRow] = {
    setArgs(args)
    readOneResult(stmt.executeQuery);
  }

  def queryOne(args : Any*) : SqlRow = {
    queryMaybe(args : _*) match {
      case Some(x) => x
      case None => throw new NotFound
    }
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
        case b:Boolean => stmt.setBoolean(i+1,b)
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
