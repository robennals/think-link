package com.intel.thinkscala.view
import scala.xml._

object Render {
  import Widgets._
  
  def claim(row : SqlRow) = 
    <div class="claim">
      <a class="title" href={Urls.obj("claim",row.int("id"))}>{row.str("text")}</a>
      <div class="description">{row("desc")}</div>
      {userref(row.int("user_id"),row.str("username"),"found by")}
      <span class="instances">seen <span class="count">{row("instance_count")}</span> times on the web</span>
      <span class="agree"><span class="count">{row("agree_count")}</span> agree</span>
      <span class="disagree"><span class="count">{row("disagree_count")}</span> disagree</span>    
    </div>  
      
  def snippet(row : SqlRow) : NodeSeq = {
   val infomap = row.jsonMap("info")
   val url = infomap.getOrElse("realurl","")
    (<div class="snippet">
        <a class="title" href={url}>{infomap.getOrElse("title","")}</a>
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
    </div>
    
  def userref(id : Int, name : String, message : String) =
//    if(name != "autoimport"){
      <span class="user">{message} <a href={Urls.user(id)}>{name}</a></span>
 //   }

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
}


object Messages {
  val pitch = <p>
    Discover when information you read on the web is disputed.
    Install the <a href="/thinklink/extension">Firefox browser extension</a> to have Think Link
    highlight disputed claims on pages you read.  
    </p>
}

object Urls {
  def base = "/thinklink"
  def home = base
  def login = base+"/login"
  def logout = base+"/logout"
  def profile(id : Int) = base + "/user/"+id
  def claim(id : Int) = base + "/claim/"+id
  def topic(id : Int) = base + "/topic/"+id
  def user(id : Int) = base + "/user/" + id
  def obj(typ : String, id : Int) = base + "/" + typ + "/" + id
}

object Template {
  import Render._
  
  def normal(c : ReqContext, title : String, body : NodeSeq) = 
    basics(title,topbar(c) ++ body)
  
  def basics(title : String, body : NodeSeq) =
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <title>{title}</title>
      <link rel="stylesheet" href="/thinklink/stylesheets/normal.css" media="screen"/>
      <script src="/thinklink/javascript/standard.js" type="text/javascript"/>
    </head>
    <body>
      {body}
    </body>
    </html>  
}
