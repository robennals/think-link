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
  def findsnippets(id : Any, query : String) = claim(id) + "/findsnippets?query="+encode(query)
  def createClaim(query : String) = base+"/claim/new?query="+encode(query)
}

object FragUrls {
  val base = Urls.base + "/fragment/"
  def snipsearch(id : Any) = base+"snipsearch?claim="+id
}


class MainServlet extends HttpServlet { 
  val posthandlers = List(
    UrlHandler("/login",c => {
      val email = c.arg("email")
      val password = c.arg("password")
      val user = c.store.getUser(email,password)
      if(user.realuser){
        c.setCookie("email",email)
        c.setCookie("password",password)        
        c.redirect(Urls.base)					// TODO: remember where the login started
      }else{
        c.outputHtml("Login Failed - Please Try Again",Page.login("Login Failed"))
      }
    }),
    UrlHandler("/claim/new", c => {
      val name = c.arg("name")
      val descr = c.arg("descr")
      val claimid = c.store.makeClaim(name,descr,c.userid)
      c.redirect(Urls.claim(claimid))
    }),
    UrlHandler("/claim/(\\d*)/setsnippet", c => {
      val claimid = c.urlInt(1)
      val title = c.arg("title")
      val url = c.arg("url")
      val text = c.arg("text")
      val query = normalizeString(c.arg("query"))
      val vote = c.arg("vote")
      val position = c.argInt("position")
      val searchid = c.store.mkSearch(claimid,query)
      val urlid = c.store.mkUrl(url,title)
      val resultid = c.store.mkResult(searchid,urlid,position,text,"",claimid)
      c.store.setSnipVote(claimid,resultid,searchid,c.userid,vote == "true")
      c.outputFragment(<div>{Render.searchQueryList(c,claimid)}</div>)
    })
  ) 
  
  val gethandlers = List(
    UrlHandler("/apianon/search", c => {
      c.output(c.store.urlSnippets(c.arg("url")))
    }),
    UrlHandler("/index.html",c => {
      c.outputHtml("Welcome to Think Link",Page.home(c))
    }),
    UrlHandler("/search",c => { 	// TODO: provide API access
      val title = c.arg("query")+" - Think Link Claim Search"
      c.outputHtml(title,Page.search(c))
    }),
    UrlHandler("""/claim/(\d*)/findsnippets""", c => {
      implicit val ctx = c
      val claim = c.store.getInfo(c.urlInt(1),c.maybe_userid)
      val title = claim("text") + "Find Instances with Think Link"
      var query = c.arg("query")
      if(query == null) query = claim.str("text")
      c.outputHtml(title,Page.findsnippets(claim,query))
    }),
    UrlHandler("/claim/new",c => {
      c.outputHtml("Create New Claim - Think Link",Page.newClaim(c,c.arg("query")))
    }),
    UrlHandler("""/claim/(\d*)""",c => {
      val claim = c.store.getInfo(c.urlInt(1),c.maybe_userid)
      val title = claim("text") + " - Think Link Claim"
      c.outputHtml(title,Page.claim(c,claim))
    }),
    UrlHandler("""/topic/(\d*)""",c => {
      val row = c.store.getInfo(c.urlInt(1),c.maybe_userid)
      val title = row("text") + " - Think Link Topic"
      c.outputHtml(title,Page.topic(c,row))
    }),
    UrlHandler("""/user/(\d*)""",c => {
      val row = c.store.getUserInfo(c.urlInt(1))
      val title = row("name") + " - Think Link User"
      c.outputHtml(title,Page.user(c,row))
    }),   
    UrlHandler("/login",c => {
      c.outputHtml("Login",(<div>{Page.login("Login")}</div>))
    }),
    UrlHandler("/logout",c => {
      c.setCookie("email","")
      c.setCookie("password","")
      c.redirect("/thinklink/")
    }),
    
    new UrlHandler("/fragment/snipsearch", c => {
      implicit val ctx = c
      c.outputFragment(Render.snipSearchResults(c.arg("query")))
    })
  )
 
  override def doPost(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(posthandlers,req,res)
  }
  
  override def doGet(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(gethandlers,req,res)
  }
}

