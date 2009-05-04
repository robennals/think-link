package com.intel.thinkscala.view
import scala.xml._

object Render {
  import Widgets._
  
  def claim(row : SqlRow) = 
    <div class="claim">
      <a class="title" href={Urls.claim(row("id"))}>{row("text")}</a>
      <div class="description">{row("desc")}</div>
      {userref(row.int("user_id"),row.str("username"),"found by")}
      - <a href={Urls.findsnippets(row("id"))} class="instances">seen <span class="count">{row("instance_count")}</span> times on the web</a>  
<!--      <span class="agree"><span class="count">{row("agree_count")}</span> agree</span>
      - <span class="disagree"><span class="count">{row("disagree_count")}</span> disagree</span>    
-->
  </div>  
  
  def userLinkCount(row : SqlRow) = 
    <div class="linkcount">
      <a class="title" href={Urls.claim(row("id"))}>{row.str("text")}</a>
      <div class="instances">found <span class="count">{row("count")}</span> instances</div>
    </div>
  
      
  def snippet(row : SqlRow) : NodeSeq = {
   val infomap = row.jsonMap("info")
   val url = infomap.getOrElse("realurl","")
    (<div class="snippet">
        <span class="title">{infomap.getOrElse("title","")}</span>
        <div class="text">{row("text")}</div>
        <a class="url" href={url}>{url}</a>                                                     
    </div>)
   }
     
  def topbar(c : ReqContext) = 
    <div id="topbar">
	    <a class="home" href={Urls.home}>Think Link</a>
	    {if(c.user.realuser)
	         <a class="user" href={Urls.profile(c.user.userid)}>{c.user.name}</a>
	         <a class="logout" href={Urls.logout}>logout</a>
	     else
	         <a class="login" href={Urls.login}>login</a>           
	    }
	    <form class="searchbox" action={Urls.search} method="GET">
           {greyInput("query","query","Search")}
           <input class="icon" type="image" src={Images.search} alt="search"/>
        </form>
    </div>
    
  def userref(id : Int, name : String, message : String) =
    <span class="user">{message} <a href={Urls.user(id)}>{name}</a></span>
        
  def searchUrl(row : SqlRow) = 
    <div class="url">
    <a onclick={"setSearchUrl("+row("searchtext")+")"}>{row("searchtext")}</a>
    <div>
    <span class="yes">{row("marked_yes")} marked</span>
    <span class="no">{row("marked_no")} ignored</span>
    </div>
    </div>

    // TODO: these should all be stored in the database before being shown
  def bossUrl(bu : BossUrl) = 
    <div class="bossurl">
    <span class="title">{bu.title}</span>
    <a href={bu.url}>{bu.url}</a>
    <div class="snippets">
      {bu.snips flatMap (s => bossSnip(s,bu))}
    </div>
    </div>
    
  def bossSnip(snip : String, bu : BossUrl) =
    <div class="snippet">
       <div class="text">{snip}</div>
       <a class="add" onclick="doAdd(this)">add</a>
       <a class="ignore" onclick="doIgnore(this)">ignore</a>
    </div>    
    
  def topicref(row : SqlRow) = 
    <a href={Urls.topic(row.int("id"))}>{row("text")}</a>
}      


object Widgets {
  def greyInput(cls : String, id : String, previewtext : String) = 
    <input id={id} name={id} class={cls} style="color:grey" onfocus="ungrey(this)" value={previewtext}/>
    
  def action(row : SqlRow, action : String, name : String) =
    <a class={"action-"+action} href={"/thinklink/api/action?id="+row("id")}>{name}</a>

  def tabs(param : String, options : Array[String], selected : String) = 
    <div class="tabs">
      options map (s => if(s equals selected){
        <a class="selected">s</a>
      }else{
        <a>s</a>
      }) 
    </div>  
    
  def ajaxSearch(id : String, fragurl : String, initquery : String, content : NodeSeq) =
    <div id={id}>
	  <form onsubmit={"ajaxSearch("+fragurl+","+id+")"}>        
        <input type="text" class="query" name="query" value={initquery}/>
        <input type="submit" class="submit" value="Search"/>
	  </form>
      <div class="ajaxcontent">
        {content}
      </div>
   </div>    
   
  def simpleSearch(id : String, url : String, initquery : String, content : NodeSeq) =
    <div>
	  <form id={id} method="GET" action={url}>        
        <input type="text" class="query" name="query" value={initquery}/>
        <input type="submit" class="submit" value="Search"/>
	  </form>
      <div class="searchcontent">
        {content}
      </div>
   </div>    

}


object Images {
  import Urls._
  val imagebase = "/thinklink/images/"
  val search = imagebase + "magnifier.png"
}

object Messages {
  val pitch = <p>
    Discover when information you read on the web is disputed.
    Install the <a href="/thinklink/extension">Firefox browser extension</a> to have Think Link
    highlight disputed claims on pages you read.  
    </p>
}



object Template {
  import Render._
  
  def normal(c : ReqContext, title : String, body : NodeSeq) = 
    basics(title,topbar(c) ++ body)
  
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
    <body>
      {body}
    </body>
    </html>  
}
