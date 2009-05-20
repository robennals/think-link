package com.intel.thinkscala
import javax.servlet.http._
import java.io._
import com.intel.thinkscala.Util._
import com.intel.thinkscala.util._
import com.intel.thinkscala.view._
import com.intel.thinkscala.view.Mini
import scala.xml._

object FixedUrls {
  val base = "http://factextract.cs.berkeley.edu/thinklink"
  def confirmUser(id : Int, nonce : Int) = base + "/confirm?userid="+id+"&nonce="+nonce 
}

object Urls {
  val base = "/thinklink"
  val home = base
  val extension = "https://addons.mozilla.org/en-US/firefox/addon/11712"
  val login = base+"/login"
  val logout = base+"/logout"
  val signup = base+"/signup"
  val search = base+"/search"
  def profile(id : Any) = base + "/user/"+id
  def claim(id : Any) = base + "/claim/"+id
  def topic(id : Any) = base + "/topic/"+id
  def user(id : Any) = base + "/user/" + id
  def findsnippets(id : Any) = claim(id) + "/findsnippets"
  def findsnippets(id : Any, query : String) = claim(id) + "/findsnippets?query="+encode(query)
  def createClaim(query : String) = base+"/claim/new?query="+encode(query)
  def searchclaims(query : String) = "/claim/search?query="+encode(query)
  def addevidence(id : Any, rel : String) = claim(id)+"/addevidence?rel="+encode(rel)
}

object MiniUrls {
  val base = Urls.base + "/mini"
  val newsnippet = base + "/newsnippet"
}

object MiniPostUrls {
  val base = MiniUrls.base
  def newsnippet(claimid : Int, disputed : Boolean, text : String, url : String, title : String) =
    base + "/newsnippet?text="+encode(text)+"&url="+encode(url)+"&title="+encode(title)+
    		"&claim="+claimid+"&disputed="+disputed
  def newclaimsnippet = base + "/newclaimsnippet"
}

object PostUrls { 
  val base = Urls.base
  def addClaimTopic(id : Any) = Urls.claim(id) + "/addtopic"
  def addEvidence(id : Any) = Urls.claim(id) + "/addevidence"
}


object TurkGetUrls {
  val base = Urls.base + "/turk/"
  def turker(turkid : Int) = base + turkid
  def searchClaims(turkid : Int) = turker(turkid) + "/search"
  def setClaim(turkid : Int) = turker(turkid) + "/setclaim"
}

object TurkPostUrls {
  val base = Urls.base + "/turk"
  val submit = Urls.base + "/turk/submit"
//  def turksession(turkid : Int) = base
//  def setClaim(turkid : Int) = base 
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
    UrlHandler("/signup", c => {
      val email = c.arg("email")
      val name = c.arg("name")      
      if(c.store.emailRegistered(email)){
        c.outputHtml("An account already exists with this email address",Page.emailregistered)
      }else if(c.store.nameRegistered(name)){
    	c.outputHtml("An account already exists with this email address",Page.nameregistered)
      }else{
          val (userid,nonce) = c.store.createUser(email,name,c.arg("password"))
	      try{
	    	  SendMail.sendSignup(email,name,userid,nonce)
	    	  c.outputHtml("Confirmation Email Sent",Page.sentconfirm)
	      }catch{
	        case _ => c.outputHtml("Could Not Send Mail",Page.badmail)
	      }
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
    }),
    UrlHandler("/claim/(\\d*)/addevidence", c => {
      val claimid = c.urlInt(1)
      val url = c.arg("url")
      val text = c.arg("text")
      val rel = c.arg("rel")
      c.store.makeEvidence(c.userid,claimid,text,url,"",rel)
	  c.redirect(Urls.claim(claimid))      
    }),    
    // TODO: batch process to fill in evidence URL titles
    UrlHandler("/turk/submit", c=> {
      val turkid = c.argInt("turkid")
      val claimid = c.store.makeClaim(c.arg("claim"),"",User.turk.userid)
      val evid = c.store.makeEvidence(User.turk.userid,claimid,c.arg("evquote"),c.arg("evurl"),"","opposes")

   	  c.store.setTurkResponse(turkid,claimid,evid,0,c.arg("jsonsnips"))

      var i = 0
      while(c.arg("url-"+i) != null){
    	  val searchid = c.store.mkSearch(claimid,c.arg("query-"+i))
    	  val urlid = c.store.mkUrl(c.arg("url-"+i),c.arg("title-"+i))
    	  val resultid = c.store.mkResult(searchid,urlid,c.argInt("position-"+i),c.arg("text-"+i),"",claimid)
    	  c.store.setSnipVote(claimid,resultid,searchid,User.turk.userid,true)
    	  i+=1
      }

      c.output(true)      
    })
  ) 
   
  val gethandlers = List(
    UrlHandler("/turk/searchboss", c=> {
    },c => {
      SnipSearch.turkSearchBoss(c.arg("query"))   
    }),
    UrlHandler("/turk/(\\d*)",c => {
      try{
    	  val turkid = c.urlInt(1)
    	  c.outputRawHtml(Turk.turkClaim(turkid,c.arg("mode")))
      }catch{
        case _ => c.outputRawHtml(Turk.turkClaim(0,null)) 
      }
    }, c => {
      c.store.turkResponse(c.urlInt(1))
    }),
    UrlHandler("/apianon/search", c => {
      c.output(c.store.urlSnippets(c.arg("url")))
    }),
    UrlHandler("/index.html",c => {
      c.outputHtml("Welcome to Think Link",Page.home(c))
    }),
    UrlHandler("/search",c => { 	// TODO: provide API access
	      val title = c.arg("query")+" - Think Link Claim Search"
	      c.outputHtml(title,Page.search(c))
	    },c => {
	      c.output(c.store.searchClaims(c.arg("query"),c.argInt("page")))
	    }    
    ),
    UrlHandler("/mini/newsnippet",c=>{
      val text = c.arg("text")
      val url = c.arg("url")
      val title = c.arg("title")
      val isdisputed = c.argBool("isdisputed")
      var query = c.arg("query")
      if(query == null){
        query = text;
      }
      c.userid
      c.outputMiniHtml(Mini.newsnippet(text,url,title,isdisputed,query)(c))      
    }),
    UrlHandler("""/claim/(\d*)/findsnippets""", c => {
      val claim = c.store.getInfo(c.urlInt(1),c.maybe_userid)
      val title = claim("text") + "Find Instances with Think Link"
      var query = c.arg("query")
      if(query == null) query = claim.str("text")
      c.outputHtml(title,Page.findsnippets(claim,query)(c))
    }),
    UrlHandler("/claim/new",c => {
      c.userid
      c.outputHtml("Create New Claim - Think Link",Page.newClaim(c,c.arg("query")))
    }),
    UrlHandler("""/claim/(\d*)/addevidence""",c=>{
      val claimid = c.urlInt(1)
      val claim = c.store.getInfo(claimid,c.maybe_userid)
      val rel = c.arg("rel")
      val text = c.arg("text")
      c.outputHtml("Add Evidence",Page.addEvidence(claimid,claim.str("text"),rel,text)(c))
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
    UrlHandler("/signup",c => {
      c.outputHtml("Sign up with Think Link",Page.signup)      
    }),
    UrlHandler("/confirm",c => {
      val nonce = c.argInt("nonce")
      val userid = c.argInt("userid")
      if(c.store.confirmUser(userid,nonce)){
    	  c.outputHtml("Account Confirmed",Page.confirmed)
      }else{
    	  c.outputHtml("Bad Confirmation",Page.badconfirm)
      }      
    }),
    UrlHandler("/logout",c => {
      c.setCookie("email","")
      c.setCookie("password","")
      c.redirect("/thinklink/")
    }),
    
    UrlHandler("/fragment/snipsearch", c => {
      c.outputFragment(Render.snipSearchResults(c.arg("query"))(c))
    })
  )
 
  override def doPost(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(posthandlers,req,res)
  }
  
  override def doGet(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(gethandlers,req,res)
  }
}

