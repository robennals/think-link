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
import scala.collection.immutable.HashMap
//import scala.collection.Map
// import java.util.Iterator;

class NotFound extends Exception
class NoLogin extends Exception

class Enum[T](it:java.util.Enumeration[T]) extends Iterator[T]{
  def hasNext = it.hasMoreElements
  def next = it.nextElement
}  

class ReqContext(val store : Datastore, m : Match, req : HttpServletRequest, res : HttpServletResponse, path : String){
  def urlInt(i : Int) = Integer.parseInt(m.group(i))
  def urlArg(i : Int) = m.group(i)
  def argInt(name : String) = 
    if(req.getParameter(name) != null){
      Integer.parseInt(req.getParameter(name))
     }else 0
  
  def argIntDflt(name : String, dflt : Int) = if(req.getParameter(name) != null) argInt(name) else dflt 
  def arg(name : String) = req.getParameter(name)
  lazy val user = store.getUser(getCookie("email"), getCookie("password"));
  def userid = if(user.realuser) user.userid else throw new NoLogin
  def maybe_userid = user.userid
  lazy val params = getParams
  lazy val format = getFormat(req)
  lazy val ishtml = format == null || format == "html" || format == "htm"
  
  def getParams : Map[String,String] = {
    val keys : Iterator[String] = new Enum(req.getParameterNames.asInstanceOf[java.util.Enumeration[String]])
    val maps : Iterator[(String,String)] = keys map (key => (key,req.getParameterValues(key)(0)))
    return HashMap(maps.collect : _*)
  }
  
  def modifiedUrl(key : String, value : Any) = mkUrl("/thinklink"+path,params.update(key,value))  
  
  def modifiedUrl(changes : (String,Any)*) = mkUrl("/thinklink"+path,params ++ changes)
  
  def output(obj : Any) {
    res.setContentType("text/html; charset=UTF-8") // TODO: set this correctly
    val writer = res.getWriter
    format match {
      case "xml" => writer.append(printXML(obj))
      case "js" => {
		    var callback = req getParameter "callback" 
		    if(callback == null){
		      callback = req getParameter "cb" 
		    }
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
  
  def outputRawHtml(html : NodeSeq){
    UrlHandler.outputHtml(res,html,true)
  }
  
  def outputFragment(html : NodeSeq){
    UrlHandler.outputHtml(res,html,false)
  }
    
  def notFound() {
    res.setStatus(HttpServletResponse.SC_NOT_FOUND)    
    outputHtml("Not found",Page.notfound)
  }
  
  def needLogin() {
    outputHtml("You need to log in to do that",Page.login("You need to log in to do that"))
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

class UrlHandler(pat : String, func : ReqContext => unit, datafunc : ReqContext => Any){
  val r = pat.r
  def tryForUrl(store : Datastore, path : String,req : HttpServletRequest, res : HttpServletResponse) : Boolean = {
    r.findFirstMatchIn(path) match {
      case Some(m) => 
        val c = new ReqContext(store,m,req,res,path)
        try{
          if(c.ishtml || datafunc == null){
        	  func(c)
          }else if(datafunc != null){
        	  c.output(datafunc(c))
          }
        }catch{
          case e : NotFound => c.notFound
          case e : NoLogin => c.needLogin 
        }
        true
      case None => false
    }
  }
  
}

object UrlHandler{
  def apply(pat : String, func : ReqContext => unit) = new UrlHandler(pat,func,null)
  def apply(pat : String, func : ReqContext => unit, datafunc : ReqContext => Any) = new UrlHandler(pat,func,datafunc)
  
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
    val c = new ReqContext(store,null,req,res,path);
    c.notFound
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
//    res.setContentType("application/xhtml+xml; charset=UTF-8")
    val writer = res.getWriter
    if(hdr) writer.append("""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">""")
    writer.append(html.toString)
    writer.close
  }
}
