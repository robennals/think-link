package com.intel.thinkscala
import javax.servlet.http._
import java.io._
import com.intel.thinkscala.Util._
import com.intel.thinkscala.view._
import scala.xml._
import com.intel.thinkscala.view.Template

object Urls {
  val base = "/thinklink"
  val home = base
  val login = base+"/login"
  val logout = base+"/logout"
  val search = base+"/search"
  def profile(id : Any) = base + "/user/"+id
  def claim(id : Any) = base + "/claim/"+id
  def topic(id : Any) = base + "/topic/"+id
  def user(id : Any) = base + "/user/" + id
  def findsnippets(id : Any) = claim(id) + "/findsnippets"
}

object FragUrls {
  val base = Urls.base + "/fragment/"
  def snipsearch(id : Any) = base+"snipsearch?claim="+id
}


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
        c.outputHtml("Login Failed - Please Try Again",Page.login)
      }
    })    
  )
  
  val gethandlers = List(
    new UrlHandler("/index.html",c => {
      c.outputHtml("Welcome to Think Link",Page.home(c))
    }),
    new UrlHandler("/search",c => { 	// TODO: provide API access
      val title = c.arg("query")+" - Think Link Claim Search"
      c.outputHtml(title,Page.search(c))
    }),
    UrlHandler("""/claim/(\d*)/findsnippets""", c => {
      val claim = c.store.getInfo(c.urlInt(1),c.userid)
      val title = claim("text") + "Find Instances with Think Link"
      var query = c.arg("query")
      if(query == null) query = claim.str("text")
      val bossUrls = SnipSearch.searchBoss(query)      
      c.outputHtml(title,Page.findsnippets(c,claim,query,bossUrls))
    }),
    UrlHandler("""/claim/(\d*)""",c => {
      val claim = c.store.getInfo(c.urlInt(1),c.userid)
      val title = claim("text") + " - Think Link Claim"
      c.outputHtml(title,Page.claim(c,claim))
    }),
    UrlHandler("""/topic/(\d*)""",c => {
      val row = c.store.getInfo(c.urlInt(1),c.userid)
      val title = row("text") + " - Think Link Topic"
      c.outputHtml(title,Page.topic(c,row))
    }),
    UrlHandler("""/user/(\d*)""",c => {
      val row = c.store.getUserInfo(c.urlInt(1))
      val title = row("name") + " - Think Link User"
      c.outputHtml(title,Page.user(c,row))
    }),   
    new UrlHandler("/login",c => {
      c.outputHtml("Login",Page.login)
    }),
    new UrlHandler("/logout",c => {
      c.setCookie("email","")
      c.setCookie("password","")
      c.redirect("/thinklink/")
    }),
    
    new UrlHandler("/fragment/snipsearch", c => {
      val bossUrls = SnipSearch.searchBoss(c.arg("query"))
      c.outputFragment(bossUrls flatMap Render.bossUrl)
    })
  )
 
  override def doPost(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(posthandlers,req,res)
  }
  
  override def doGet(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(gethandlers,req,res)
  }
}

