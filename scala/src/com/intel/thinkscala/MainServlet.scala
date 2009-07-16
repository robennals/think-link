package com.intel.thinkscala
import javax.servlet.http._
import java.io._
import com.intel.thinkscala.Util._
import com.intel.thinkscala.util._
import com.intel.thinkscala.view._
import com.intel.thinkscala.view.Mini
import com.intel.thinkscala.pages._
import com.intel.thinkscala.pages.Login
import scala.xml._

object FixedUrls {
  val base = "http://thinklink.cs.berkeley.edu/"
  def confirmUser(id : Int, nonce : Int) = base + "confirm/"+nonce 
}

object Urls {
  val base = "/thinklink"
  val home = base
  val admin = base + "/admin"
  def img(name : String) = base + "/images/"+name + ".png"
  val extension = "https://addons.mozilla.org/en-US/firefox/addon/11712"
  def login(url : String) = base+"/login?url="+encode(url)
  val login_simple = base+"/login"
  val logout = base+"/logout"
  val signup = base+"/signup"
  val search = base+"/search"
  def profile(id : Any) = base + "/user/"+id
  def claim(id : Any) = base + "/claim/"+id
  def topic(id : Any) = base + "/topic/"+id
  def user(id : Any) = base + "/user/" + id
  def findsnippets(id : Any) = claim(id) + "/findsnippets"
  def findsnippets(id : Any, query : String) = claim(id) + "/findsnippets?query="+encode(query)
  def findsnippets(id : Any, manual : Boolean) = claim(id) + "/findsnippets?fromextension=true"
  def createClaim(query : String) = base+"/claim/new?query="+encode(query)
  def createTopic(query : String) = base+"/topic/new?query="+encode(query)
  def addevidence(id : Any, rel : String) = claim(id)+"/addevidence?rel="+encode(rel)
  def addlinks(id : Any, thistyp: String, thattyp: String) = base+"/connect"+"?addto="+id+"&thistype="+thistyp+"&thattype="+thattyp
  val connect = base+"/connect"
  val emailpass = base + "/emailpass"
}

object HelpUrls {
  val base = "http://confront.intel-research.net/"
  val mark = base + "Think_Link.html"
}

object MiniUrls {
  val base = Urls.base + "/mini"
  val newsnippet = base + "/newsnippet"
}

object MiniPostUrls {
  val base = MiniUrls.base
  def newsnippet(claimid : Int, isdisputed : Boolean, text : String, url : String, title : String) =
    base + "/newsnippet?text="+encode(text)+"&url="+encode(url)+"&title="+encode(title)+
    		"&claim="+claimid+"&isdisputed="+isdisputed
  def newclaimsnippet = base + "/newclaimsnippet"
}

object PostUrls { 
  val base = Urls.base
  def addClaimTopic(id : Any) = Urls.claim(id) + "/addtopic"
  def addEvidence(id : Any) = Urls.claim(id) + "/addevidence"
  val newtopic = base + "/topic/new"
  val newclaim = base + "/claim/new"
  def setspam(claimid : Int) = Urls.claim(claimid) + "/setspam"
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


class MainServlet extends HttpServlet { 
  val posthandlers = List(
    UrlHandler("/login",c => {
      val email = c.arg("email")
      val password = c.arg("password")
      val user = c.store.getUser(email,password)
      if(user.realuser){
        c.setCookie("email",email)
        c.setCookie("password",password)        
        c.redirect(c.arg("url"))			
      }else{
        c.outputHtml("Login Failed - Please Try Again",Login.login("Login Failed",c.arg("url")))
      }
    }),
    UrlHandler("/signup", c => {
      val email = c.arg("email")
      val name = c.arg("name")      
      if(c.store.emailRegistered(email)){
        c.outputHtml("An account already exists with this email address",Messages.emailregistered)
      }else if(c.store.nameRegistered(name)){
    	c.outputHtml("An account already exists with this email address",Messages.nameregistered)
      }else{
          val (userid,nonce) = c.store.createUser(email,name,c.arg("password"))
	      try{
	    	  SendMail.sendSignup(email,name,userid,nonce)
	    	  c.outputHtml("Confirmation Email Sent",Messages.sentconfirm)
	      }catch{
	        case _ => c.outputHtml("Could Not Send Mail",Messages.badmail)
	      }
       }
    }),
    UrlHandler("/emailpass",c => {
      val email = c.arg("email")
      val password = c.store.getPassword(email)
      try{
        SendMail.sendPassword(email,password)
        c.outputHtml("Password Email Sent",Messages.sentpassword)
      }catch{
        case _ => c.outputHtml("Could Not Send Mail",Messages.badmail) 
      }      
    }),
    UrlHandler("/connect", c => {
      val disconnect = c.argBool("disconnect")
      val addto = c.argInt("addto")
      val id = c.argInt("id")
      if(disconnect){
        c.store.breakLink(id,addto,c.userid)
      }else{
        c.store.addLink(id,addto,c.userid)
      }
    }),
    UrlHandler("/mini/newsnippet", c => {
      var claimid = c.argInt("claimid")
      val name = c.arg("name")
      val descr = c.arg("descr")
      val disputed = c.argBool("isdisputed")
	  val opposed = c.argBool("opposed")
      val text = c.arg("text")
      val title = c.arg("title")
	  val url = c.arg("url")
	  val rel = c.arg("rel")
      if(claimid == 0){
        claimid = c.store.makeClaim(name,descr,c.userid)
      }      
	  if(disputed){
	  	val urlid = c.store.mkUrl(url,title)
	  	val resultid = c.store.mkResult(0,urlid,0,text,"",claimid)
	  	c.store.setSnipVote(claimid,resultid,0,c.userid,true)
        c.outputMiniHtml(Mini.marked(claimid))
	  }else{
	    c.store.makeEvidence(c.userid,claimid,text,url,title,rel)
        c.outputMiniHtml(Mini.addedEvidence(claimid))
	  }
    }),
    UrlHandler("/claim/new", c => {
      val name = c.arg("name")
      val descr = c.arg("descr")
      val claimid = c.store.makeClaim(name,descr,c.userid)
      var foo = c.arg("addto")
      if(c.arg("addto") != ""){
        c.store.addLink(claimid,c.argInt("addto"),c.userid)
      }
      c.redirect(Urls.claim(claimid))
    }),
    UrlHandler("/topic/new", c => {
      val name = c.arg("name")
      val descr = c.arg("descr")
      val addto = c.argInt("addto")
      val claimid = c.store.makeTopic(name,descr,c.userid)
      if(c.arg("addto") != null){
        c.store.addLink(claimid,c.argInt("addto"),c.userid)
      }
      c.redirect(Urls.topic(claimid))
    }),
    UrlHandler("/claim/(\\d*)/setspam", c => {
      val claimid = c.urlInt(1)
      c.store.setSpamClaim(claimid,c.userid)
    }),
    UrlHandler("/claim/(\\d*)/delete", c => {
      val claimid = c.urlInt(1)
	  val claim = c.store.getClaim(claimid, c.userid)
	  if(c.user.isadmin || c.user.userid == claim("userid")){
		  c.store.setHidden(claimid)
	  } 
    }),
    UrlHandler("/claim/(\\d*)/ignore", c => {
      val claimid = c.urlInt(1)
      c.store.ignoreClaim(claimid,c.userid)
    }),
    UrlHandler("/claim/(\\d*)/unignore", c => {
      val claimid = c.urlInt(1)
      c.store.unIgnoreClaim(claimid,c.userid)
    }),
    UrlHandler("/evidence/(\\d*)/setspam", c => {
      val evid = c.urlInt(1)
      c.store.setSpamEvidence(evid,c.userid)
    }),
    UrlHandler("/evidence/(\\d*)/delete", c => {
      val evid = c.urlInt(1)      
      c.store.deleteEvidence(evid,c.userid)
    }),
    UrlHandler("/evidence/(\\d*)/voteup", c => {
      c.store.setVote(c.userid,c.urlInt(1),"evidence","up")
    }),
    UrlHandler("/evidence/(\\d*)/votenorm", c => {
      c.store.setVote(c.userid,c.urlInt(1),"evidence","norm")
    }),
    UrlHandler("/evidence/(\\d*)/votedown", c => {
      c.store.setVote(c.userid,c.urlInt(1),"evidence","down")
   }),
    UrlHandler("/claim/(\\d*)/setsnippet", c => {
      val claimid = c.urlInt(1)
      val title = c.arg("title")
      val url = c.arg("url")
      val text = c.arg("text")
      val query = normalizeString(c.arg("query"))
      val vote = c.arg("vote")
      val position = c.argInt("position")
      var searchid = 0
      if(query != ""){
        searchid = c.store.mkSearch(claimid,query)
      }
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
    UrlHandler("/api/badsnippet", c => {
      val snipid = c.argInt("snipid")
      c.store.reportBadSnip(snipid,c.userid)
    }),
    UrlHandler("/admin/pick", c => {
      Admin.pick(c.arg("type"),c.arg("id"),c.arg("vote"))(c)
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
    UrlHandler("/apianon/search", c => {
      c.output(c.store.urlSnippets(c.arg("url")))
    }),
    UrlHandler("/apianon/domaininfo", c => {
      c.output(c.store.domainPages(Util.toUnsigned(c.argInt("domain"))))
    }),
    UrlHandler("/apianon/pageinfo", c => {
      c.output(c.store.pageSnippets(Util.toUnsigned(c.argInt("domain")),Util.toUnsigned(c.argInt("page"))))
    }),
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
    UrlHandler("/index.html",c => {
      c.outputRawHtml(Template.noinstall(c,"Welcome to Dispute Finder",Page.home(c)))
    }),
    UrlHandler("/search",c => {
	  val title = c.arg("query")+" - Dispute Finder Claim Search"
	    c.outputHtml(title,Page.search(c))
	  },c => {
	    c.output(c.store.searchClaims(c.arg("query"),c.argInt("page")))
	  }    
    ),
    UrlHandler("/api/ignored",c => {
     },c => {
      if(c.user.realuser){
    	  c.output(c.store.ignoredClaims(c.userid))
      }else{
          c.output(false)
      }
     }
    ),
    UrlHandler("/connect",c => {
      c.requireLogin
      val me = c.store.getInfo(c.argInt("addto"),c.maybe_userid)      
      var title = "Connect "+c.arg("thattype")+" to "+me("text")+" - Dispute Finder"
      if(c.arg("thattype")=="claim" && c.arg("thistype") == "claim"){
        title = "Connect opposing claims to "+me("text")+" - Dispute Finder"
      }
      var query = c.arg("query")
      if(query == null){
        query = me.str("text")
      }
      if(c.arg("thattype") == "claim"){
    	  c.outputHtml(title,Page.connectClaim(me,query)(c))
       }else{
          c.outputHtml(title,Page.connectTopic(me,query)(c))         
       }
    }),
    UrlHandler("/mini/claim/(\\d*)",c=>{
      c.minimode = true
      val claimid = c.urlInt(1)
      val claim = c.store.getClaim(claimid,c.maybe_userid)
 	  c.outputMiniHtml(Mini.claim(claim)(c))      
    }),
    UrlHandler("/mini/newsnippet",c=>{
      c.minimode = true
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
    UrlHandler("/mini/markedbad", c => {
      c.outputMiniHtml(Mini.markedbad);
    }),
    UrlHandler("""/claim/(\d*)/findsnippets""", c => {
      val claim = c.store.getInfo(c.urlInt(1),c.maybe_userid)
      val title = claim("text") + " - Find Instances with Dispute Finder"
      var query = c.arg("query")
      if(query == null) query = claim.str("text")
      c.outputHtml(title,Page.findsnippets(claim,query)(c))
    }),
    UrlHandler("""/claim/(\d*)/allsnippets""", c => {
    },c => {
      c.output(c.store.allSnippets(c.urlInt(1)))
    }),
    UrlHandler("/claim/new",c => {
      c.requireLogin
      c.outputHtml("Create New Claim - Dispute Finder",Page.newClaim(c,c.arg("query")))
    }),
    UrlHandler("/topic/new",c => {
      c.requireLogin
      c.outputHtml("Create New Topic - Dispute Finder",Page.newTopic(c,c.arg("query")))
    }),
    UrlHandler("""/claim/(\d*)/addevidence""",c=>{
      c.requireLogin
      val claimid = c.urlInt(1)
      val claim = c.store.getInfo(claimid,c.maybe_userid)
      val rel = c.arg("rel")
      val text = c.arg("text")
      c.outputHtml("Add Evidence",Page.addEvidence(claimid,claim.str("text"),rel,text)(c))
    }),
    UrlHandler("""/claim/(\d*)""",c => {
      val claim = c.store.getClaim(c.urlInt(1),c.maybe_userid)
      val title = claim("text") + " - Dispute Finder Claim"
      c.outputHtml(title,Page.claim(claim)(c))
    }),
    UrlHandler("""/topic/(\d*)""",c => {
      val row = c.store.getInfo(c.urlInt(1),c.maybe_userid)
      val title = row("text") + " - Dispute Finder Topic"
      c.outputHtml(title,Page.topic(c,row))
    }),
    UrlHandler("""/user/(\d*)""",c => {
      val row = c.store.getUserInfo(c.urlInt(1))
      val title = row("name") + " - Dispute Finder User"
      c.outputHtml(title,Page.user(row)(c))
    }),   
    UrlHandler("/login",c => {
      var url = c.arg("url")
      if(url == null) url = Urls.base
      c.outputHtml("Login",(<div>{Login.login("Login",url)}</div>))
    }),
    UrlHandler("/signup",c => {
      c.outputHtml("Sign up with Dispute Finder",Login.signup)      
    }),
    UrlHandler("/emailpass",c => {
      c.outputHtml("Retreive your password",Login.emailpass)
    }),
    UrlHandler("/confirm/(\\d*)",c => {
      val nonce = c.urlInt(1)
      if(c.store.confirmUser(nonce)){
    	  c.outputHtml("Account Confirmed",Messages.confirmed)
      }else{
    	  c.outputHtml("Already Confirmed",Messages.badconfirm)
      }      
    }),
    UrlHandler("/admin", c => {
      c.requireAdmin
      c.outputHtml("Admin",Admin.admin(c))
    }),
    UrlHandler("/logout",c => {
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

