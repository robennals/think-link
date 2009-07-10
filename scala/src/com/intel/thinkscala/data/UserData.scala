
package com.intel.thinkscala.data;

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

import com.intel.thinkscala._

trait UserData extends BaseData {
  val get_user = stmt("SELECT id,password,name,admin FROM v2_user WHERE email = ? AND nonce = 0")
  def getUser(email : String, password : String) : User = 
    get_user.queryMaybe(email) match {
      case Some(row) if row("password") == password => 
        new User(row.str("name"),row.int("id"),row.bool("admin"))
      case _ => User.nouser
    }  
  
  val get_password = stmt("SELECT password FROM v2_user WHERE email = ? AND nonce = 0")
  def getPassword(email : String) : String = get_password.queryOne(email).str("password")  
  
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
}