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
      <div class="description">{row("description")}</div>
      {userref(row.int("user_id"),row.str("username"),"created by")}
      - <a href={Urls.findsnippets(row("id"))} class="instances">seen <span class="count">{row("instance_count")}</span> times on the web</a>  
      - 
      {if(c.user.userid == row.int("user_id")){
           <a onclick={"deleteClaim(this,"+row("id")+")"}>delete</a> 
      	}else{
           <a onclick={"reportSpam(this,"+row("id")+")"}>report spam</a>
        }
      }
  </div>  

  def miniclaim(row : SqlRow)(implicit c : ReqContext) = 
    <div class='miniclaim'>
      <a class="title" href={Urls.claim(row("id"))}>{row("text")}</a>
    </div>
  
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
     
  def topbar(c : ReqContext) = 
    <div id="topbar">
	    <a class="home" href={Urls.home}>Dispute Finder</a>
	    {if(c.user.realuser)
	         <a class="user" href={Urls.profile(c.user.userid)}>{c.user.name}</a>
	         <a class="logout" href={Urls.logout}>logout</a>
	     else
             <a class="signup" href={Urls.signup}>sign up</a>
	         <a class="login" href={Urls.login(Urls.base)}>login</a>           
	    }
	    <form class="searchbox" action={Urls.search} method="GET">
           {greyInput("query","query","Search")}
           <input class="icon" type="image" src={Images.search} alt="search"/>
        </form>                 
        <a class='bugreport' href="mailto:robert.ennals@intel.com?body=Report a bug, suggest a feature, or just tell us what you think.">Send us your feedback</a>
        <a class='blog' href="http://disputefinder.blogspot.com/">Blog</a>
        <a class='help' href="http://confront.intel-research.net/Dispute_Finder.html">Help</a>
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
      
  def extension(c : ReqContext) = 
    if(c.getCookie("extension") != null && c.getCookie("extension") != ""){
    	<div class='hasextension'>extension installed</div>     
    }else{
        <a class='install' href={Urls.extension}>Install the Firefox extension</a>
    }
 
  def extensionBig(implicit c : ReqContext) = 
    if(c.getCookie("extension") != null && c.getCookie("extension") != ""){
        /* nothing */
    }else{
        <div class='installdiv'><a class='installbig' href={Urls.extension}>Install the Firefox extension</a></div>
    }

  // TODO: bring back pagetext
  def snippet(row: SqlRow, classifier: Learner)(implicit c : ReqContext) = {
    val mode = snipVoteMode(row.str("state"))
//    val pagetext = row.str("articlebody")
//    if(pagetext == null || pagetext == ""){
//    	PageContext.backgroundFetchSnippet(row)
//    }
    var picktext = row.str("picktext")
    var robotyes = false
    if(classifier != null){
    	robotyes = classifier.classifyBool(row.str("abstract"))
	    if(robotyes && (picktext == null || picktext == "" || picktext == "''")){
	    	picktext = classifier.bestSentence(splitSentences(row.str("abstract")));
	    }
    }
    val pagetext = null
    val thetext = if(pagetext == null || pagetext == "") row.str("abstract") else pagetext
    <div class={"snippet togglebox state-"+mode}>
	<div class="boxcontent snippettext">
		<div class="text">
			{selectableSentences(thetext,picktext)}
		</div></div>
	   <input type="hidden" class="resultid" value={""+row("id")}/>
	     <div class="yesnobox">
		   <a class="yes" onclick="doAdd(this)">mark</a>
		   <a class="no" onclick="doIgnore(this)">ignore</a>
		   </div>
	   {if(row("username") != null && mode == "yes"){
	     userref(row.int("user_id"), row.str("username"), "marked by") 
	   }else if(row("username") != null && mode == "no"){
		 userref(row.int("user_id"), row.str("username"), "ignored by") 		      
	    }else{          
	    }
	   }       
	   {if(classifier != null){
		   if(robotyes){
			   <div class='roboscore-yes'>yes</div>
		   }else{
			   <div class='roboscore-no'>no</div>
		   }
	   }}
	</div>     
  }
	    
  
	def snippet(row : SqlRow)(implicit c : ReqContext) : NodeSeq = snippet(row,null)
	
	def urlSnippet(row : SqlRow)(implicit c : ReqContext) = 
		  <div class='bossurl'>
			<span class="title">{row("title")}</span>
			<a class='url' href={row.str("url")}>{row("url")}</a>
			<div class='snippets'>{snippet(row)}</div>
	    </div>
	    
	def claimSnippet(row : SqlRow)(implicit c : ReqContext) = 
			<div class='bossurl'>
				<a class="title" href={row.str("url")}>{row("title")}</a>
				<div class="snipclaimlink">claims that <a class='link' href={Urls.claim(row.int("claim_id"))}>{row("claimtext")}</a></div>
				<div class='snippets'>{snippet(row)}</div>
			</div>
		  
	
	def bossSnip(snip: String, bu : BossUrl, searchid : Int, urlid : Int, position: Int, query : String, claimid : Int, classifier: Learner)(implicit c : ReqContext) = {
	  val resultid = c.store.mkResult(searchid,urlid,position,snip,"",claimid)
	  val row = c.store.getSnippet(resultid)
	  snippet(row,classifier)
	}

	def bossResults(query : String,claimid : Int, page : Int)(implicit c : ReqContext) : NodeSeq = {
	    val bossUrls = time("Yahoo BOSS ",SnipSearch.searchBoss(query,page,10))   
	    val classifier = time("train classifier",Learner.getClassifier(c.store,claimid,query))
	    val searchid = c.store.mkSearch(claimid,query)
	    return <div class='searchcontent'>{Util.flatMapWithIndex(bossUrls,Render.bossUrl(_ : BossUrl,searchid,_,query,claimid,classifier))}</div>
	}

	def snipSearchResults(query : String, row : SqlRow)(implicit c : ReqContext) = 
	  <div id="claimlist">
	  {simpleSearch(Urls.findsnippets(row("id")), c.arg("query"), "Enter web search keywords")}
	  <div class='tabbody'>
	  {if(query != null){
	  	<h3>Web snippets matching "{query}"</h3>
	  }else{}}
	  {Widgets.pagedList(bossResults(query,row.int("id"),_))}
	  </div>
	  </div>
     
    def spanForSentence(x : String,picktext : String) = 
    	if(x == "\n\n"){
    		<br/>
    	}else{
	   		<span class='clicksentence' style={if(x == picktext) "background-color: yellow" else ""}>{x}</span>    		
    	}
    
	def selectableSentences(text : String, picktext : String) = {
		val sentences : ArrayBuffer[String] = splitSentences(text)
	    sentences.map(x => spanForSentence(x,picktext))
    }
	
	def snipVoteMode(state : String) = state match {
		  case "true" => "yes"
		  case "false" => "no"
		  case _ => "undecided"
	  }

	//// TODO: these should all be stored in the database before being shown
	def bossUrl(bu : BossUrl, searchid : Int, position : Int,query : String, claimid : Int,classifier : Learner)(implicit c : ReqContext) = {
		val urlid = c.store.mkUrl(bu.url,bu.title)
		<div class="bossurl">
		<span class="title">{bu.title}</span>
		<a class='url' href={bu.url}>{bu.url}</a>
		<div class="snippets">
		  {bu.snips flatMap (s => bossSnip(s,bu,searchid,urlid,position,query,claimid,classifier))}
		</div>
		</div>
	}
  
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
  
  def noinstall(c : ReqContext, title : String, body : NodeSeq) = 
    basics(c,title,Docs.nav(c) ++ body,"body")
  
  
  def mini(c : ReqContext, body : NodeSeq) =    
    basics(c,"Dispute Finder Popup Interface",body,"minibody")
  
  def nobar(c : ReqContext, body : NodeSeq) = 
    basics(c,"",body,"body")
  
  def basics(c : ReqContext, title : String, body : NodeSeq, bodyclass : String) =
    <html xmlns="http://www.w3.org/1999/xhtml">
    {Docs.head(title)(c)}
    <body class={bodyclass}>
      <input type='hidden' id='user-id' value={""+c.user.userid}/>
      {body}
    </body>
    </html>  
}
