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
import org.apache.commons.lang.StringEscapeUtils.escapeSql;

class BadSql(val sql : String, val message : String) extends Exception(sql + " - " + message)

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

object SqlQuery{
	def select(row : String, from : String) = new SqlSelect(List(row),List(from),List(),List(),None,None)
	def select(table : String) : SqlSelect = select(table+".*",table)	
}

class SqlSelect(val cols : List[String], val from : List[String], 
				val joins : List[String], val wheres : List[String], val orderby : Option[String],val limit : Option[String]){
	
	def leftjoin(col : String, joinbit : String, arg : Any) = 
		new SqlSelect(col :: cols, from, " LEFT JOIN "+fillArg(joinbit,arg) :: joins, wheres, orderby, limit)
	def leftjoin(col : String, joinbit : String) = 
		new SqlSelect(col :: cols, from, " LEFT JOIN "+joinbit :: joins, wheres, orderby, limit)
	def innerjoin(col : String, joinbit : String, arg : Any) = 
		new SqlSelect(col :: cols, from, " INNER JOIN "+fillArg(joinbit,arg) :: joins, wheres, orderby, limit)
	def innerjoin(col : String, joinbit : String) = 
		new SqlSelect(col :: cols, from, " INNER JOIN "+joinbit :: joins, wheres, orderby, limit)

	
	def where(wherebit : String, arg : Any) = 
		new SqlSelect(cols,from,joins,fillArg(wherebit,arg) :: wheres, orderby, limit)
	def where(wherebit : String) = 
		new SqlSelect(cols,from,joins,wherebit :: wheres, orderby, limit)
	
	def toSql = "SELECT "+cols.reverse.mkString(",")+
				" FROM "+from.reverse.mkString(",")+
				joins.reverse.mkString(" ")+
				strList(wheres," WHERE "," AND ") + 				
				maybeStr(orderby) + maybeStr(limit)				

	def orderby(row : String) = new SqlSelect(cols,from,joins,wheres,Some(" ORDER BY "+row+ " "),limit)				
	def orderdesc(row : String) = new SqlSelect(cols,from,joins,wheres,Some(" ORDER BY "+row+ " DESC "),limit)
    def paged(page : Int) = new SqlSelect(cols,from,joins,wheres,orderby,Some(" LIMIT 20 OFFSET "+page*20))				
    def rows(implicit con : Connection) = {
		val sql = toSql
		try{
			new SqlStatement(con,sql).queryRows()
		}catch{
			case e : Exception => throw new BadSql(sql,e.getMessage)
		}
	}
    def one(implicit con : Connection) = new SqlStatement(con,toSql).queryOne()    
    def maybe(implicit con : Connection) = new SqlStatement(con,toSql).queryMaybe()
    def maybeInt(col : String)(implicit con : Connection) : Option[Int] = maybe match {
		case Some(row) => Some(row.int(col))
		case None => None
	}
    
    private def maybeStr(ostr : Option[String]) = ostr match {
		case Some(x) => x
		case None => ""
	}
	
	private def strList(l : Seq[String], prefix : String, sep : String) = 
		if(l.length == 0) "" else prefix + l.mkString(sep) 
	
	def fillArg(str : String, arg : Any) : String = {
	    val argstr = argAsStr(arg)
	    return str.replace("?",argstr)
	}
	
	private def argAsStr(arg : Any) : String = arg match {
		case x : String if x.length > 510 => esc (x.substring(0,510))
		case x : String => esc(x)
		case TruncString(s,max) if s.length > max => esc(s.substring(0,max))
		case TruncString(s,max) => esc(s)
		case null => "\"\""
		case x => x.toString
	}	
	
	def esc(s : String) = "'" + escapeSql(s) + "'" 
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
