package com.intel.thinkscala
import java.util.regex._;
import javax.servlet.http._;
import java.io._;
import com.intel.thinklink._;
import scala.util.matching._;
import scala.util.matching.Regex._;
import com.intel.thinklink.ConnectionPool;

class MainServlet extends HttpServlet {
  val store = Pool.get
  
  val posthandlers = List(
    new UrlHandler("/login",c => {
      val user = store.getUser(c.getArg("email"),c.getArg("password"))
    })    
  )

  override def doPost(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(posthandlers,req,res)
  }
}