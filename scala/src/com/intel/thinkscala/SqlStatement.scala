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

case class TruncString(val s : String, val max : Int)

class SqlRow extends HashMap[String,Any]{
  def int(key : String) = apply(key).asInstanceOf[Int]
  def str(key : String) = apply(key).asInstanceOf[String]
  def bool(key : String) = apply(key).asInstanceOf[Boolean]
  def jsonMap(key : String) : Map[String,String] = JSON.parseFull(str(key)) match {
    case Some(m : Map[_,_]) => m.asInstanceOf[Map[String,String]] 
    case _ => HashMap()
  } 
}

class SqlStatement(con : Connection, s : String){
  val stmt = con.prepareStatement(s,Statement.RETURN_GENERATED_KEYS)
  
  def queryRows(args : Any*) : Seq[SqlRow] = {
    setArgs(args)
    readResults(stmt.executeQuery()).toSequence
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
  
  def querySeq(args : Any*) : Seq[Any] = {
    setArgs(args)
    val buf = new ArrayBuffer[Any]()
    val res = stmt.executeQuery
    while(res.next){
      buf += res.getObject(1)
    }
    res.close
    return buf
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
        case s:String if s.length > 510 => stmt.setString(i+1,s.substring(0,510))
        case s:String => stmt.setString(i+1,s)
        case TruncString(s,max) if s.length > max => stmt.setString(i+1,s.substring(0,max))
        case TruncString(s,max) => stmt.setString(i+1,s)
        case n:Int => stmt.setInt(i+1,n)
        case b:Boolean => stmt.setBoolean(i+1,b)
        case l:Long => stmt.setLong(i+1,l)
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
