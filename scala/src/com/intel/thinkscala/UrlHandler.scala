package com.intel.thinkscala

import java.util.regex._;
import javax.servlet.http._;
import java.io._;
import com.intel.thinklink._;
import scala.util.matching._;
import scala.util.matching.Regex._;
import com.intel.thinkscala.Util._

class ReqContext(m : Match, req : HttpServletRequest, res : HttpServletResponse){
  def base = ConnectionPool.get
  def urlInt(i : Int) = Integer.parseInt(m.group(i))
  def argInt(name : String) = Integer.parseInt(req.getParameter(name))
  def arg(name : String) = req.getParameter(name)
  lazy val user = base.getUser(getCookie("email"), getCookie("password"));
  def userid = user.userid
  
  def output(d : Dyn) {
    res.setContentType("text/html; charset=UTF-8");
    val writer = res.getWriter
    val format = getFormat(req)
    format match {
      case "xml" => writer.append(printXML(d))
      case "js" => {
		    var callback = req getParameter "callback" 
		    if(callback == null){
		      callback = "callback"
		    }
	        writer.append(callback + "(" + printJSON(d) + ");")
        }
      case _ => writer.append(printJSON(d))
    }   
    writer.close
  }
  
  def getCookie(key : String) : String = {
		val cookies = req.getCookies();
		if(cookies == null) return null;
        cookies.foreach(c => {
          if(c.getName.equals(key)){
            return c.getValue
          }
        })
        return null;
	}
  
  def setCookie(key : String, value : String, path : String){
    val c = new Cookie(key,value)
    c.setPath(path)
    res.addCookie(c)
  }
  
  def setCookie(key : String, value : String){
    setCookie(key,value,"/thinklink/node")
    setCookie(key,value,"/thinklink/scripthack")
  } 
}

class UrlHandler(pat : String, func : ReqContext => unit){
  val r = pat.r
  def tryForUrl(path : String,req : HttpServletRequest, res : HttpServletResponse) : Boolean = {
    r.findFirstMatchIn(path) match {
      case Some(m) => func(new ReqContext(m,req,res)); true
      case None => false
    }
  }
}

object UrlHandler{
  def runMatchingHandler(handlers : List[UrlHandler],
                         req : HttpServletRequest, res : HttpServletResponse){
    req.setCharacterEncoding("UTF-8")
	var path = req.getServletPath
	val pathinfo = req.getPathInfo
	if(pathinfo != null){
		path+=pathinfo
	}
    handlers.foreach(h => {      
     if(h.tryForUrl(path,req,res)){
       return;
     }
    })
  }
}