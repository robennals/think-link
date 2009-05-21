package com.intel.thinkscala.view
import com.intel.thinkscala.Util._
import scala.xml._


object Page {
  import Widgets._
  import Render._
  def home(implicit c : ReqContext) =
    <div class="content">
      <h1 class="logo">Think Link</h1>
      <div class="tagline">Are you being duped?</div>
      <div class="message">{Messages.pitch}</div>

      <form id="bigsearch" action="search" method="GET">        
        {greyInput("query","query","Enter a claim you think may be disputed")}
        <input type="submit" class="submit" value="Search"/>
      </form>
      <div id="claimlist">
        {Widgets.tabs(
          "Hot Claims" -> (() => 
            	Widgets.pagedList(c.store.getFrequentClaims(_).toSeq flatMap Render.claim)),
          "Hot Topics" -> (() => 
                Widgets.pagedList(c.store.getBigTopics(_).toSeq flatMap Render.topic)),
          "Recently Marked Pages" -> (() => 
                  Widgets.pagedList(c.store.recentMarkedPages(_).toSeq flatMap Render.markedPage))
        )}
      </div>
  </div>
      
  def searchResults(query : String, page : Int, c : ReqContext) : NodeSeq =
     c.store.searchClaims(query,page).toSeq flatMap Render.claim
   
  def search(implicit c : ReqContext) = 
    <div class="content">
      <h1>Search Results</h1>
      <form id="bigsearch" action="search" method="GET">        
        <input type="text" class="query" name="query" value={c.arg("query")}/>
        <input type="submit" class="submit" value="Search"/>
	  </form>
      <div id="newclaim">Don't see your claim? - 
    		  <a href={Urls.createClaim(c.arg("query"))}>Create a new claim</a>
      </div>
      <div id="claimlist">
        {Widgets.pagedList(c.store.searchClaims(c.arg("query"),_).toSeq flatMap Render.claim)}
      </div>
    </div>
  
  def newClaim(c : ReqContext, query : String) =
    <div class="content">
    	<h1>Create a New Disputed Claim</h1>
    	<div class="message">This should be a disputed claim that is made on web sites. 
    		Once you have created a disputed claim, you can identify instances of this claim
    		on the web, and associate the claim with evidence on either side.
    	</div>
    	<form class='form' id="newsnippet" action="new" method="POST">
          <label for="name">Claim</label>
          <input type="text" id="name" name="name" value={query}/>
          <label for="descr">Optional Description</label>
          <textarea rows="5" id="descr" name="descr"></textarea>    
          <input class='submit' type="submit" value="Create New Claim"/>
        </form>
    </div>
    
  def claim(c : ReqContext, row : SqlRow) =
    <div id="claim">
      <div class="topclaim">
	      <h1>{row("text")}</h1>
	      <span class="instances">seen <span class="count">{row("instance_count")}</span> times on the web
	        <a href={Urls.findsnippets(row("id"))}>find more</a>
	      </span>   
      </div>
      <div class="description">{row("description")}</div>
      {userref(row.int("user_id"),row.str("username"),"found by ")}
      <div class="evidence">
   	      <div id="opposed">
	        <h2>Opposing Evidence</h2>
            {c.store.evidence(row.int("id"),"opposes") flatMap Render.snippet}
            <a class='add' href={Urls.addevidence(row.int("id"),"opposes")}>add opposing evidence</a>
	      </div>
	      <div id="supports">
	        <h2>Supporting Evidence</h2>
            {c.store.evidence(row.int("id"),"supports") flatMap Render.snippet}
            <a class='add' href={Urls.addevidence(row.int("id"),"supports")}>add supporting evidence</a>
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
 
  def addEvidence(claimid : Int, claimtxt : String, rel : String, text : String)(implicit c : ReqContext) =    
    <div class='content'>
        <a href={Urls.claim(claimid)}><h1>{claimtxt}</h1></a>
        <div class='subtitle'>Add Evidence that supports or opposes this claim</div>
        <div class='message'>
           The easiest way to add evidence to a claim is to use the <a href={Urls.extension}>Firefox Extension</a>.
           If for some reason you cannot use the Firefox extension, you can also add evidence using the form below:
        </div>
        <form class='form' method='post' action={PostUrls.addEvidence(claimid)}>
           <label for='url'>Url for evidence page:</label>
           {Widgets.greyInput("input","url","Paste the URL of the page with evidence")}
           This evidence <select name='rel'>
             <option selected={if(rel=="supports") "selected" else null}>supports</option>
             <option selected={if(rel=="opposes") "selected" else null}>opposes</option>
           </select> the claim "{claimtxt}"
           <label for='snip'>Copy and paste a representative quote below:</label>
           <textarea rows="5" name="text"></textarea>    
           <input class='submit' type="submit" value="Add Evidence"/>
        </form>
    </div>
    
  def findsnippets(row : SqlRow, query : String)(implicit c : ReqContext) = 
    <div id="findsnippets">
      <input type="hidden" id="data-query" value={query}/>
      <input type="hidden" id="data-claim" value={""+row("id")}/>
      <a href={Urls.claim(row("id"))}><h1>{row("text")}</h1></a>
      <div class="subtitle">Find snippets on the web that make this claim</div> 
      <div id="queries">
        <h2>Previous Search Queries</h2>
        {searchQueryList(c,row.int("id"))}
      </div>
      {simpleSearch(Urls.findsnippets(row("id")), query, "Enter a search string")}
      {Render.snipSearchResults(query)}
    </div>
    
  def topic(c : ReqContext, row : SqlRow) = 
    <div id="topic">
      <h1>{row("text")}</h1>
      <div class="description">{row("description")}</div>
      {simpleSearch(Urls.topic(row("id")), c.arg("query"), "Search within this topic")}
      <div id="claimlist">
         <h2>Claims about this topic</h2>
         {c.store.topicClaims(row.int("id"),0) flatMap Render.claim}
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
    
  def login(title : String, path : String) =
    <div class="content">
    	<h1>{title}</h1>
		<div class="message">
	      Enter the email address and password that you used to register with Think Link.
	    </div>		
	    <div class='message'>
          If you don't have a Think Link account then <a href={Urls.signup}>sign up</a>
        </div>
	    <form class='form' id="login" action="login" method="POST">	   
            <input class='hidden' type='hidden' name='url' value={path}/>
	        <label for="email">email</label>
	        {Widgets.greyInput(null,"email","Enter the email address you signed up with")}
	        <p><label for="password">password</label>
	        	<input type="password" id="password" name="password"/></p>
	        <input class='submit' type="submit" value="Login"/>
	    </form>
    </div>
    
    // TODO: sign up with facebook connect
  def signup = 
    <div class='content'>
    	<h1>Sign up for a Think Link Account</h1>
           <p>Reasons to sign up for a Think Link account:
             <ul>
               <li>Add new claims to Think Link</li>
               <li>Find more snippets that make disputed claims</li>
               <li>Tell think link what claims you don't want it to highlight again</li>
             </ul>
           </p>
    	<form class='form' id='signup' action="signup" method="POST">
            <p>
               <label for="name">name</label>
               <input type="text" id="name" name="name"/>
            </p>
            <p>
               <label for="email">email</label>
               <input type="text" id="email" name="email"/>
            </p>
            <p>
               <label for="password">password</label>
               <input type="password" id="password" name="password"/>
            </p>
            <input class='submit' type="submit" value="Create Account"/>
    	</form>
    </div>
    
  def sentconfirm = 
    <div class='content'>
       <h1>Confirmation Email Sent</h1>
       <div class='message'>
          We have sent a confirmation email to the email address you gave.          
       </div>
       <div class='message'>
       	  Please click on the link in that message to activate your account.
       </div>
    </div>
    
  def badmail =
    <div class='content'>
       <h1>Bad Email Adress</h1>
       <div class='message'>
          We were not able to send email to the address you gave. Please go back and try again.    
       </div>
    </div>
    
  def confirmed = 
    <div class='content'>
       <h1>Account Confirmed</h1>
       <div class='message'>
         Your account has been successfully confirmed. 
       </div>
       <div class='message'><a href={Urls.login(Urls.base)}>login</a> with your new account.</div>
    </div>
    
  // TODO: support retreiving or changing existing password
  // OR: support facebook connect for signup
  def emailregistered = 
    <div class='content'>
       <h1>An account already exists with this email address</h1>
       <div class='message'>
       	Someone, hopefully you, has already created an account with this email address.
       </div>
    </div>

  def nameregistered = 
    <div class='content'>
       <h1>An account already exists with this user name</h1>
       <div class='message'>
       	Someone has already created an account with this email address. Go back and try a different user name.
       </div>
    </div>

    
  def badconfirm = 
    <div class='content'>
       <h1>Account Confirmation Failed</h1>
       <div class='message'>
          This confirmation email is either invalid or has expired.
       </div>
    </div>
    
    
  val notfound = 
    <div class="content">
      <h1>Not Found</h1>
      <div class="message">
      This page was not found
      </div>
    </div>
}

