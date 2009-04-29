package com.intel.thinkscala

import java.util.regex._;
import javax.servlet.http._;
import java.io._;
import com.intel.thinklink._;
import scala.util.matching._;
import scala.util.matching.Regex._;
import com.intel.thinklink.ConnectionPool;

class NodeServlet extends HttpServlet {  
  val gethandlers = List(
    new UrlHandler("/node/(\\d+)",c => {
      c.output(c.base.getLinks(c.urlInt(1),c.userid))
    })
  )
  
  override def doGet(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(gethandlers,req,res)
  }
}


