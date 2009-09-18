package com.intel.thinkscala.pages
import com.intel.thinkscala._
import scala.xml._


object Login {
  def login(title : String, path : String)(implicit c : ReqContext) =
	  Docs.bindPage("login","title" -> Text(title), "hiddenpath" -> Docs.mkvar("url",path))
    
    // TODO: sign up with facebook connect
  def signup(implicit c : ReqContext) = Docs.page("signup")
    
  def emailpass(implicit c : ReqContext) = Docs.page("emailpass") 
}
