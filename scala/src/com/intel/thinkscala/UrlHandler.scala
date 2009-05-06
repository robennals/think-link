package com.intel.thinkscala

import java.util.regex._;
import javax.servlet.http._;
import java.io._;
import scala.util.matching._;
import scala.util.matching.Regex._;
import com.intel.thinkscala.Util._
import com.intel.thinkscala._
import scala.xml.NodeSeq;
import com.intel.thinkscala.view.Template
import com.intel.thinkscala.view.Page

class NotFound extends Exception
class NoLogin extends Exception

class ReqContext(val store : Datastore, m : Match, req : HttpServletRequest, res : HttpServletResponse){
  def urlInt(i : Int) = Integer.parseInt(m.group(i))
  def argInt(name : String) = Integer.parseInt(req.getParameter(name))
  def arg(name : String) = req.getParameter(name)
  lazy val user = store.getUser(getCookie("email"), getCookie("password"));
  def userid = if(user.realuser) user.userid else throw new NoLogin
  def maybe_userid = user.userid
  
  def output(obj : Any) {
    res.setContentType("text/html; charset=UTF-8") // TODO: set this correctly
    val writer = res.getWriter
    val format = getFormat(req)
    format match {
      case "xml" => writer.append(printXML(obj))
      case "js" => {
		    var callback = req getParameter "callback" 
		    if(callback == null){
		      callback = "callback"
		    }
	        writer.append(callback + "(" + printJSON(obj) + ");")
        }
      case _ => writer.append(printJSON(obj))
    }   
    writer.close
  }
  
  def outputHtml(title : String, html : NodeSeq){
    UrlHandler.outputHtml(res,Template.normal(this,title,html),true)
  }
  
  def outputFragment(html : NodeSeq){
    UrlHandler.outputHtml(res,html,false)
  }
  
  
  def notFound() {
    res.setStatus(HttpServletResponse.SC_NOT_FOUND)    
    outputHtml("Not found",Page.notfound)
  }
  
  def redirect(url : String){
    res.sendRedirect(url)
  }
  
  def goBack(default : String){
    req.getHeader("Referer") match{
      case null => redirect(default)
      case referer => redirect(referer)
    }
  }
  
  def getCookie(key : String) : String = {
		val cookies = req.getCookies();
		if(cookies == null) return null;
        cookies.foreach(c => {
          if(c.getName.equals(key)){
            return decode(c.getValue)
          }
        })
        return null;
	}
  
  def setCookie(key : String, value : String, path : String){
    val c = new Cookie(key,encode(value))
    c.setPath(path)
    res.addCookie(c)
  }
  
  def setCookie(key : String, value : String){
    setCookie(key,value,"/thinklink")
//    setCookie(key,value,"/thinklink/node")
//    setCookie(key,value,"/thinklink/scripthack")
  } 
}

class UrlHandler(pat : String, func : ReqContext => unit){
  val r = pat.r
  def tryForUrl(store : Datastore, path : String,req : HttpServletRequest, res : HttpServletResponse) : Boolean = {
    r.findFirstMatchIn(path) match {
      case Some(m) => 
        val c = new ReqContext(store,m,req,res)
        try{
          func(new ReqContext(store,m,req,res))
        }catch{
          case e : NotFound => c.notFound
        }
        true
      case None => false
    }
  }
  
}

object UrlHandler{
  def apply(pat : String, func : ReqContext => unit) = new UrlHandler(pat,func)
  
  def innerRunHandler(store: Datastore, handlers : List[UrlHandler],
                     req : HttpServletRequest, res : HttpServletResponse){
    req.setCharacterEncoding("UTF-8")
	var path = req.getServletPath
	val pathinfo = req.getPathInfo
	if(pathinfo != null){
		path+=pathinfo
	}
    handlers.foreach(h => {      
     if(h.tryForUrl(store,path,req,res)){
       return;
     }     
    })
  }  
  
  def runMatchingHandler(handlers : List[UrlHandler],
                         req : HttpServletRequest, res : HttpServletResponse){
    val store = Pool.get
    try{
       innerRunHandler(store,handlers,req,res);
    } catch {
      case e : Exception => 
        e.printStackTrace() 
        val w = res.getWriter
        e.printStackTrace(w)
        w.close
    }
    Pool.release(store)
  }
  
  def outputHtml(res : HttpServletResponse, html : NodeSeq,hdr : Boolean){
    res.setContentType("text/html; charset=UTF-8")
    val writer = res.getWriter
    if(hdr) writer.append("""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">""")
    writer.append(html.toString)
    writer.close
  }
}
