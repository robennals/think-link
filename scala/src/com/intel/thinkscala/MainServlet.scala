package com.intel.thinkscala
import javax.servlet.http._
import java.io._
import com.intel.thinkscala.Util._
import com.intel.thinkscala.view._
import scala.xml._
import com.intel.thinkscala.view.Template

class MainServlet extends HttpServlet { 
  val posthandlers = List(
    new UrlHandler("/login",c => {
      val email = c.arg("email")
      val password = c.arg("password")
      val user = c.store.getUser(email,password)
      if(user.realuser){
        c.setCookie("email",email)
        c.setCookie("password",password)        
        c.redirect("/thinklink/")					// TODO: remember where the login started
      }else{
        c.outputHtml(Template.normal(c,"Login Failed - Please Try Again",Page.login))
      }
    })    
  )
  
  val gethandlers = List(
    new UrlHandler("/index.html",c => {
      c.outputHtml(Template.normal(c,"Welcome to Think Link",Page.home(c)))
    }),
    new UrlHandler("/search",c => { 	// TODO: provide API access
      val title = c.arg("query")+" - Think Link Claim Search"
      c.outputHtml(Template.normal(c,title,Page.search(c)))
    }),
    UrlHandler("""/claim/(\d*)""",c => {
      val id = c.urlInt(1)
      c.store.getInfo(id,c.userid) match {
        case Some(claim) => 
           val title = claim("text")+ " - Think Link Claim"
           c.outputHtml(Template.normal(c,title,Page.claim(c,claim)))
        case None => c.notFound(Template.normal(c,"Not Found",Page.notfound))
      }
    }),
    UrlHandler("""/topic/(\d*)""",c => {
      val id = c.urlInt(1)
      c.store.getInfo(id,c.userid) match {
        case Some(row) =>
          val title = row("text")+ " - Think Link Topic"
          c.outputHtml(Template.normal(c,title,Page.topic(c,row)))
        case None => c.notFound(Template.normal(c,"Not Found",Page.notfound))
      }
    }),
    new UrlHandler("/login",c => {
      c.outputHtml(Template.normal(c,"Login",Page.login))
    }),
    new UrlHandler("/logout",c => {
      c.setCookie("email","")
      c.setCookie("password","")
      c.redirect("/thinklink/")
    })
  )
 
  override def doPost(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(posthandlers,req,res)
  }
  
  override def doGet(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(gethandlers,req,res)
  }
}

