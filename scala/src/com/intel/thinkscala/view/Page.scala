package com.intel.thinkscala.view
import com.intel.thinkscala.Util._
import scala.xml._


object Page {
  import Widgets._
  import Render._
  def home(c : ReqContext) =
    <div class="content">
      <h1 class="logo">Think Link</h1>
      <div class="tagline">Are you being duped?</div>
      <a class="install" href="/thinklink/install">Install The Think Link Firefox Extension</a> 
      <div class="message">{Messages.pitch}</div>

      <form id="bigsearch" action="search" method="GET">        
        {greyInput("query","query","Enter a claim you think may be disputed")}
        <input type="submit" class="submit" value="Search"/>
      </form>
      <div id="claimlist">
        <div class="title">Hot Claims</div>
        {c.store.getHotClaims flatMap Render.claim}
      </div>
  </div>
    
  def search(c : ReqContext) = 
    <div class="content">
      <h1>Search Results</h1>
      <form id="bigsearch" action="search" method="GET">        
        <input type="text" class="query" name="query" value={c.arg("query")}/>
            <input type="submit" class="submit" value="Search"/>
	      </form>
        <div id="claimlist">
          {c.store.searchClaims(c.arg("query")) flatMap Render.claim}
        </div>
    </div>
      
  def claim(c : ReqContext, row : SqlRow) =
    <div id="claim">
      <h1>{row("text")}</h1>
      <span class="instances">seen <span class="count">{row("instance_count")}</span> times on the web
        <a href={Urls.findsnippets(row("id"))}>find more</a>
      </span>   

      <div class="description">{row("desc")}</div>
      {userref(row.int("user_id"),row.str("username"),"found by ")}
      <span class="agree"><span class="count">{row("agree_count")}</span> agree</span>
      <span class="disagree"><span class="count">{row("disagree_count")}</span> disagree</span>    
      <div id="evidence">
	      <div id="supports">
	        <h2>Supporting Evidence</h2>
            {c.store.linkedNodes("snippet","supports",row.int("id"),0,4) flatMap Render.snippet}
	      </div>
	      <div id="opposed">
	        <h2>Opposing Evidence</h2>
            {c.store.linkedNodes("snippet","opposes",row.int("id"),0,4) flatMap Render.snippet}
	      </div>
      </div>
      <div id="related-claims">
        <h2>Related Claims</h2>
            {c.store.linkedEitherAnyNodes(row.int("id"),"claim",0,4) flatMap Render.claim}
      </div>
      <div id="topics">
        <h2>Topics</h2>
        {c.store.linkedToNodes(row.int("id"),"about","topic",0,10) flatMap topicref}
      </div>
    </div>
    
  def findsnippets(c : ReqContext, row : SqlRow, query : String, bossurls : Seq[BossUrl]) = 
    <div id="findsnippets">
      <a href={Urls.claim(row("id"))}><h1>{row("text")}</h1></a>
      <div class="subtitle">Find snippets on the web that make this claim</div> 
      <div id="urls">
        <h2>Previous Search URLs</h2>
        {c.store.searchUrls(row.int("id")) flatMap Render.searchUrl}
      </div>
      {simpleSearch("snipsearch", Urls.findsnippets(row("id")), query, 
      bossurls flatMap bossUrl)}
    </div>
    
  def topic(c : ReqContext, row : SqlRow) = 
    <div id="topic">
      <h1>{row("text")}</h1>
      <div class="description">{row("desc")}</div>
      <div id="claims">
         <h2>Claims about this topic</h2>
         {c.store.linkedNodes("claim","about",row.int("id"),0,20) flatMap Render.claim}
      </div>
	    <div id="topics">
	       <h2>Related Topics</h2>
	       {c.store.linkedEitherNodes(row.int("id"),"about","topic",0,10) flatMap topicref}
	    </div>
    </div>
    
  def user(c : ReqContext, row : SqlRow) = 
    <div id="user">
      <h1>{row("name")}</h1>
      <div id="created">
         <h2>Claims created by {row("name")}</h2>
         {c.store.nodesByUser("claim",row.int("id"),0,25) flatMap Render.claim}
      </div>
      <div id="instance">
        <h2>Claim Instances found by {row("name")}</h2>
        {c.store.userLinkCount(row.int("id"),"snippet",0,25) flatMap Render.userLinkCount}
      </div>
    </div>

  def error(e : Exception) = 
    <div class="error">
    </div>
    
  val login =
    <div class="content">
	    <div class="message">
	      Enter the email address and password that you used to register with Think Link
	    </div>
	    <form id="login" action="login" method="POST">
	        <p><label for="email">email</label><input type="text" id="email" name="email"/></p>
	        <p><label for="password">password</label><input type="password" id="password" name="password"/></p>
	        <input type="submit" value="Login"/>
	    </form>
    </div>
    
  val notfound = 
    <div class="content">
      <h1>Not Found</h1>
      <div class="message">
      This page was not found
      </div>
    </div>
}

