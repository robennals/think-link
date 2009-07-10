package com.intel.thinkscala.pages

import com.intel.thinkscala.view._
import com.intel.thinkscala._
import scala.xml._


object Admin {
  val conflicthandlers = List(SpamHandler)

  def mkTab(handler : ConflictHandler)(implicit c : ReqContext) =
    () => Widgets.pagedList(handler.conflicts(_) flatMap renderConflict)
  
  def renderConflict(conflict : Conflict) = 
    <div class={"conflict togglebox state-"+conflict.state} data-zone="admin" data-id={conflict.id} data-type={conflict.handler.name}>
        <span class='yesnobox'>
        	<span class='yes'>{conflict.handler.yesdesc}</span>
        	<span class='no'>{conflict.handler.nodesc}</span>
        </span>
    	<span class='boxcontent'>{conflict.content}</span>
        {Render.userref(conflict.prevuser,conflict.handler.prevuserdesc)}
        {Render.userref(conflict.thisuser,conflict.handler.thisuserdesc)}
    </div>

  def pick(name : String, id : String, action : String)(implicit c : ReqContext){
	  conflicthandlers.foreach(h => {
		  if(h.name == name){
		    if(action == "yes"){
		      h.accept(id)
		    }else{
		      h.reject(id)
		    }
		  }
	  })
  }
    
  def admin(implicit c : ReqContext) = 
    <div class='content'>
            Conflicts that need to be resolved:
      <div id="claimlist">
        {Widgets.tabs(
          "Spam Claims" -> mkTab(SpamHandler)
        )}
      </div>
    </div>
}

abstract class Conflict {
  def content : NodeSeq
  val prevuser : User
  val thisuser : User
  val id : String
  val handler : ConflictHandler
  val state : String
}

abstract class ConflictHandler {
  val name : String
  def accept(id : String)(implicit c : ReqContext) : Unit
  def reject(id : String)(implicit c : ReqContext) : Unit
  val prevuserdesc : String
  val thisuserdesc : String
  val yesdesc : String
  val nodesc : String
  def conflicts(page : Int)(implicit c : ReqContext) : Seq[Conflict]
}

object SpamHandler extends ConflictHandler {
  val name = "spam"
  def mkConflict(row : SqlRow) = 
    new SpamConflict(row.int("id"),row.str("text"),row.str("state"),new User(row.str("thatname"),row.int("thatid")), new User(row.str("thisname"),row.int("thisid")))
  def conflicts(page : Int)(implicit c : ReqContext) = 
    c.store.spamClaims(page) map mkConflict
  override def accept(id : String)(implicit c : ReqContext) = c.store.yesSpam(id.toInt) 
  override def reject(id : String)(implicit c : ReqContext) = c.store.noSpam(id.toInt) 
  val prevuserdesc = "created by"
  val thisuserdesc = "reported by"
  val yesdesc = "spam"
  val nodesc = "not spam"
}

class SpamConflict(val idint : Int, val text : String, val state : String, val prevuser : User, val thisuser : User) extends Conflict {
  val id = idint.toString
  val handler = SpamHandler
  override def content = <a class='title' href={Urls.claim(idint)}>{text}</a>    
}

//object RenameHandler extends ConflictHandler {
//  var name = "Renames"
//  def mkConflict(row : SqlRow) = 
//    
//} 
//
//class RenameConflict(val idint : Int, )



