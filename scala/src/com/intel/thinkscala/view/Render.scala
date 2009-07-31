package com.intel.thinkscala.view
import scala.xml._
import com.intel.thinkscala.learn.Learner
import scala.collection.mutable.ArrayBuffer
import util.Timer.time

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
<!--      <span class="agree"><span class="count">{row("agree_count")}</span> agree</span>
      - <span class="disagree"><span class="count">{row("disagree_count")}</span> disagree</span>    
-->
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
  
//  def voter(vote : Boolean, typ : String, id : Int) = 
//    if(vote == true){
//       	<span class='votebox'><img class='voteup' src="/images/vote_up_on.png" />
//        <img class='votedown' src="/images/vote_restore_down.png" /></span>
//    }else if(vote == false){
//       	<span class='votebox'><img class='voteup' src="/images/vote_up_on.png" />
//        <img class='votedown' src="/images/vote_restore_down.png" /></span>             
//    }else{
//       	<span class='votebox'><img class='voteup' src="/images/vote_up_e.png" />
//        <img class='votedown' src="/images/vote_down_e.png" /></span>
//    }

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

    // TODO: these should all be stored in the database before being shown
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
   
  def splitSentences(text : String) : ArrayBuffer[String] = {
    val outarr = new ArrayBuffer[String]
	var outstr = new StringBuffer
	text foreach {c =>
	    outstr append c
		if(c == '.' || c == '!' || c == '?' || c == '\n' || c == ':' || c == '"' || c == ';'){
			outarr += outstr.toString
			outstr = new StringBuffer
		}
	}
    if(outstr.length > 0){
    	outarr += outstr.toString
    }
    outarr
  }
    
  def selectableSentences(text : String, picktext : String) = {
	val sentences = splitSentences(text)
//    val sentences = text.split("[\\.\\,\\!\\?]")
    sentences.map {x => 
    	<span class='clicksentence' style={if(x == picktext) "background-color: yellow" else ""}>{x}</span>
    }
  }

  def snipVoteMode(state : String) = state match {
	  case "true" => "yes"
	  case "false" => "no"
	  case _ => "undecided"
  }
  
  def snippet(row: SqlRow, classifier: Learner)(implicit c : ReqContext) = {
    val roboscore = (classifier.classify(row.str("abstract")) * 100).toInt
    val mode = snipVoteMode(row.str("state"))
    if(row("pagetext") == null){
    	PageContext.backgroundFetchSnippet(row)
    }
    <div class={"snippet togglebox state-"+mode}>
	<div class="boxcontent snippettext">
		<div class="text">
		    <span class="more">...load more...</span>
			{selectableSentences(row.str("abstract"),row.str("picktext"))}
			<span class="more">...load more...</span>
		</div></div>
		<div class='pagetext'>{row("pagetext")}</div>
	   <input type="hidden" class="resultid" value={""+row("id")}/>
	   {if(c.user.realuser){
		   <div class="yesnobox">
		   <a class="yes" onclick="doAdd(this)">yes</a>
		   <a class="no" onclick="doIgnore(this)">no</a>
		   </div>
	    }else{
	    	<a class="mustlogin" href={Urls.login(c.getUrl)}>login to edit</a>
	    }
	   }
	   {if(row != null){
	     userref(row.int("user_id"), row.str("username"), "by") 
	    }else{          
	    }
	   }       
	   <div class={if(roboscore > 60) "roboscore-yes" else if(roboscore < 40) "roboscore-no" else "roboscore-maybe"}>
	   {roboscore+"%"}
	   </div>
	</div>     
  }
  
  def bossSnip(snip: String, bu : BossUrl, searchid : Int, urlid : Int, position: Int, query : String, claimid : Int, classifier: Learner)(implicit c : ReqContext) = {
    val resultid = c.store.mkResult(searchid,urlid,position,snip,"",claimid)
    val row = c.store.getSnippet(resultid)
    snippet(row,classifier)
  }
  
  def bossSnip2(snip : String, bu : BossUrl, searchid : Int, urlid : Int, position : Int, query : String, claimid : Int, classifier: Learner)(implicit c : ReqContext) = {
    val roboscore = (classifier.classify(snip) * 100).toInt 
    val resultid = c.store.mkResult(searchid,urlid,position,snip,"",claimid)
    val row = c.store.getSnippet(resultid)
    val mode = row("state") match {
    	case "true" => "yes"
    	case "false" => "no"
    	case _ => "undecided"
    }
    <div class={"snippet togglebox state-"+mode}>
    	<div class="boxcontent snippettext"><div class="text">{selectableSentences(snip,row.str("picktext"))}</div></div>
       <input type="hidden" class="position" value={""+position}/>
       <input type="hidden" class="resultid" value={""+row("id")}/>
       {if(c.user.realuser){
       <div class="yesnobox">
       <a class="yes" onclick="doAdd(this)">yes</a>
       <a class="no" onclick="doIgnore(this)">no</a>
       </div>
        }else{
        	<a class="mustlogin" href={Urls.login(c.getUrl)}>login to edit</a>
        }
       }
       {if(row != null){
         userref(row.int("user_id"), row.str("username"), "by") 
        }else{          
        }
       }       
       <div class={if(roboscore > 60) "roboscore-yes" else if(roboscore < 40) "roboscore-no" else "roboscore-maybe"}>
       {roboscore+"%"}
       </div>
    </div>    
    }
  
  def bossResults(query : String,claimid : Int, page : Int)(implicit c : ReqContext) : NodeSeq = {
      val bossUrls = time("Yahoo BOSS",SnipSearch.searchBoss(query,page,10))   
      val classifier = time("train classifier",Learner.getClassifier(c.store,claimid,query))
      val searchid = c.store.mkSearch(claimid,query)
      return <div class='searchcontent'>{Util.flatMapWithIndex(bossUrls,Render.bossUrl(_ : BossUrl,searchid,_,query,claimid,classifier))}</div>
  }
  
  def snipSearchResults(query : String, row : SqlRow)(implicit c : ReqContext) = 
    <div id="searchlist">
    <h2>Search Results matching "{query}"</h2>
    {Widgets.pagedList(bossResults(query,row.int("id"),_))}
    </div>

  def markedSnippet(row : SqlRow)(implicit c : ReqContext) = 
    <div class='bossurl'>
      <span class='title'>{row("title")}</span>
      <a href={row.str("url")}>{row("url")}</a>
      <div class='snippets'>
          <input type='hidden' class='position' value="0"/>
         <div class={if(row("state") == "true") "snippet snippet-added" else "snippet snippet-ignored"}>
	       <div class="text">{row("abstract")}</div>
         {if(c.user.realuser){
	       <a class="add" onclick="doAdd(this)">{if(row("state") == "true") "marked" else "mark"}</a>
	       <a class="ignore" onclick="doIgnore(this)">{if(row("state") == "false") "ignored" else "ignore"}</a>         	
            }else{
        	<a class="mustlogin" href={Urls.login(c.getUrl)}>login to edit</a>
            }
         }
         {userref(row.int("user_id"), row.str("username"), "by")} 
         </div>
      </div>
    </div>
    
  def topicref(row : SqlRow) = 
    <a href={Urls.topic(row.int("id"))}>{row("text")}</a>
    
  def markedPage(row : SqlRow) = 
    <div class='claim'>
       <a class='title' target="_blank" href={row.str("url")}>{row("title")}</a>
       <a class='url' target="_blank" href={row.str("url")}>{Util.trimString(row.str("url"),80)}</a>
       <div class='says'>says that <a class='claimlink' href={Urls.claim(row("claimid"))}>{row("claimtext")}</a></div>
       {if(row.isDefinedAt("user_id")){userref(row.int("user_id"),row.str("username"),"marked by")} else {}}
    </div>
  
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

  
}      





object Images {
  import Urls._
  val imagebase = "/thinklink/images/"
  val search = imagebase + "magnifier.png"
}



object Template {
  import Render._
  
  def normal(c : ReqContext, title : String, body : NodeSeq) = 
    basics(title,(<body class='body'>{topbar(c) ++ extension(c) ++ body}</body>))
  
  def noinstall(c : ReqContext, title : String, body : NodeSeq) = 
    basics(title,(<body class='body'>{topbar(c) ++ body}</body>))
  
  
  def mini(c : ReqContext, body : NodeSeq) =    
    basics("Dispute Finder Popup Interface",(<body class='minibody'>{body}</body>))
  
  def nobar(c : ReqContext, body : NodeSeq) = 
    basics("",(<body class='body'>{body}</body>))
  
  def basics(title : String, body : NodeSeq) =
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta http-equiv="Content-Language" content="en-us" />
      <title>{title}</title>
      <link rel="icon" type="image/png" href="/thinklink/images/lightbulb_red.png" />
      <link rel="stylesheet" href="/thinklink/stylesheets/normal.css" media="screen"/>
      <script src="/thinklink/javascript/jquery-1.2.3.js" type="text/javascript"/>
      <script src="/thinklink/javascript/standard.js" type="text/javascript"/>
    </head>
      {body}
    </html>  
}
