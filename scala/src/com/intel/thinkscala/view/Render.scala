package com.intel.thinkscala.view
import scala.xml._
import com.intel.thinkscala.learn.Learner
import scala.collection.mutable.ArrayBuffer
import com.intel.thinkscala.util.Timer.time
import com.intel.thinkscala._
import com.intel.thinkscala.Util._
import com.intel.thinkscala.pages.Docs

object Render {
  import Widgets._
  
  def claim(row : SqlRow)(implicit c : ReqContext) = 
    <div class="claim">
      <a class="title" href={Urls.claim(row("id"))}>{row("text")}</a>
      {userref(row.int("user_id"),row.str("username"),"created by")}
      - <a href={Urls.findparas(row("id"))} class="instances"><span class="count">{row("instance_count")}</span> paraphrases</a>  
      - 
      {if(c.user.userid == row.int("user_id")){
           <a onclick={"deleteClaim(this,"+row("id")+")"}>delete</a> 
      	}else{
           <a onclick={"reportSpam(this,"+row("id")+")"}>report spam</a>
        }
      }
      - 
      <a target="_blank" href={Urls.searchGoogle(row.str("text"))}>see on the web</a>
  </div>  
  
  def miniclaim(row : SqlRow)(implicit c : ReqContext) = 
    <a class="claimlink" href={Urls.claim(row("id"))}>{row("text")}</a>
    
  def nodelink(row : SqlRow)(implicit c : ReqContext) =
    <div class="claimlink">
      {if(row("linkid") != null){
    	  	<div onclick={"connect(this,"+row("id")+","+c.arg("addto")+")"} class="disconnect">Disconnect</div>
       }else{
    	   <div onclick={"connect(this,"+row("id")+","+c.arg("addto")+")"} class="connect">Connect</div>
      }}
      <a class="title" href={Urls.topic(row("id"))}>{row("text")}</a>
    </div>

  def claimlink(row : SqlRow)(implicit c : ReqContext) =
    <div class="claimlink">
      {if(row("linkid") != null){
    	  	<div onclick={"connect(this,"+row("id")+","+c.arg("addto")+")"} class="disconnect">Disconnect</div>
       }else{
    	   <div onclick={"connect(this,"+row("id")+","+c.arg("addto")+")"} class="connect">Connect</div>
      }}
      <a class="title" href={Urls.claim(row("id"))}>{row("text")}</a>
    </div>

      
  def topic(row : SqlRow) =
    <div class="claim">
      <a class="title" href={Urls.topic(row("id"))}>{row("text")}</a>
      <div class="description">{row("description")}</div>
      {userref(row.int("user_id"),row.str("username"),"created by")}
      - <span class="claimcount"><span class="count">{row("instance_count")}</span> claims in this topic</span>
    </div>
  
  def user(row : SqlRow) =  
    <div class="claim">
      <a class='title' href={Urls.user(row("id"))}>{row("name")}</a>
      <div class='instances'>marked <span class='count'>{row("snipcount")}</span> snippets
         and created <span class='count'>{row("claimcount")}</span> claims</div>
    </div>
    
  def userLinkCount(row : SqlRow) = 
    <div class="linkcount">
      <a class="title" href={Urls.claim(row("id"))}>{row.str("text")}</a>
      <div class="instances">found <span class="count">{row("count")}</span> instances</div>
    </div>
    
  def voter(vote : String, typ : String, id : Int) = {
      val mode = if(vote == null) "norm" else vote
      <div class={"votebox-"+mode}>
        <img title="vote up" class='voteup' onclick={"voteUp(this,"+id+",'"+typ+"')"} />
        <img title="vote down" class='votedown' onclick={"voteDown(this,"+id+",'"+typ+"')"} />        
      </div>      
    }
  
  def evidence(row : SqlRow)(implicit c : ReqContext) : NodeSeq = 
    <div class="webquote">
        <span class="title">{row.getOrElse("title","")}</span>
        <div class="text">{row("text")}</div>
        <a target="_blank" class="url" href={row.str("url")}>{row("url")}</a>                                                     
        {userref(row.int("user_id"), row.str("username"), "found by")} 
        -
        {if(row("user_id") == c.maybe_userid){
           <a onclick={"deleteEvidence(this,"+row("id")+")"}>delete</a>           
         }else{
            <a onclick={"reportSpamEvidence(this,"+row("id")+")"}>report spam</a>   
         }
        }
        {voter(row.str("vote"),"evidence",row.int("id"))}
    </div>
   
  
  def userEvidence(row : SqlRow) =
    <div class="webquote">
        <span class="title">{row.getOrElse("title","")}</span>
        <div class="text">{row("text")}</div>
        <a target="_blank" class="url" href={row.str("url")}>{row("url")}</a>                                                     
        <div class="says">{row("verb")}
            <a class="claimlink" href={Urls.claim(row("claimid"))}>{row("claimtext")}</a>
        </div>
    </div>
     
  def userref(id : Int, name : String, message : String) =
    <span class="user">{message} <a target="_blank" href={Urls.user(id)}>{name}</a></span>
            
  def userref(user : User, message : String) : NodeSeq = userref(user.userid, user.name, message)  
    
 def searchQueryList(c : ReqContext, claimid : Int) = 
    (c.store.searchQueries(claimid) flatMap (Render.searchQuery(_,claimid))) ++
    (<a class="manualmarked" href={Urls.findsnippets(claimid,true)}>marked with extension</a>)

    
  def searchQuery(row : SqlRow, claimid : Int) : NodeSeq = 
    <div class="query">
    <a href={Urls.findsnippets(claimid,row.str("searchtext"))}>{row("searchtext")}</a>
    <div class="score">
    <span class="markedyes">{row("marked_yes")} marked</span>
    <span class="markedno">{row("marked_no")} ignored</span>
    </div>
    </div>
    
  def topicref(row : SqlRow) = 
    <a href={Urls.topic(row.int("id"))}>{row("text")}</a>  
}      



object Images {
  import Urls._
  val imagebase = "/thinklink/images/"
  val search = imagebase + "magnifier.png"
}



object Template {
  import Render._
  
  def normal(c : ReqContext, title : String, body : NodeSeq) = 
	  basics(c,title,Docs.nav(c) ++ body,"body")
  
  def mini(c : ReqContext, title : String, body : NodeSeq) =    
    basics(c,title,body,"minibody")
  
  def nobar(c : ReqContext, body : NodeSeq) = 
    basics(c,"",body,"body")
  
  def basics(c : ReqContext, title : String, body : NodeSeq, bodyclass : String) =
    <html xmlns="http://www.w3.org/1999/xhtml">
    {Docs.head(title)(c)}
    <body class={bodyclass}>
      <input type='hidden' id='user-id' value={""+c.user.userid}/>
      {body}
      <script type="text/javascript">
        <xml:unparsed>
	  	var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
	  	document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
	  	</xml:unparsed>
	  </script>
	  <script type="text/javascript">
	  	<xml:unparsed>
	  	try {
	  	var pageTracker = _gat._getTracker("UA-10712508-1");
	  	pageTracker._trackPageview();
	  	} catch(err) {}
	  	</xml:unparsed>
	  </script>
    </body>
    </html>  
}
