package com.intel.thinkscala.view
import com.intel.thinkscala.Util._
import scala.xml._


object Page {
  import Widgets._
  import Render._
  def home(implicit c : ReqContext) =
    <div class="content">
          <div id="intellogo"><img src="/images/intel_black_transparent_100w.png" /><div id="labs">Labs</div></div>

      <h1 class="logo">Dispute Finder<span class='beta'>beta</span></h1>
      <div class="tagline">Are you being duped?</div>

      <a class='videolink' href="http://confront.intel-research.net/Videos.html">Watch the Videos</a>
  
      <div class='boldmessage'>
            The Dispute Finder <a href="https://addons.mozilla.org/en-US/firefox/addon/11712">Firefox Extension</a> highlights <a href="http://confront.intel-research.net/Dispute_Finder.html">disputed claims</a> on web pages you browse
            and shows you evidence for alternative points of view. <a href="http://confront.intel-research.net/Videos.html">Watch the Videos</a> to learn more.
      
      </div>
      <div class='message'>
          Use this web interface to tell Dispute Finder what snippets to highlight and what evidence to present for alternative viewpoints. You can create a new disputed claim, 
       mark new instances of a claim on the web, and add evidence that supports or opposes a claim.
      </div>

      {extensionBig}
        
      <form id="bigsearch" action="search" method="GET">        
        {greyInput("query","query","Enter a claim found on the web that you think is disputed")}
        <input type="submit" class="submit" value="Search"/>
      </form>
      <div id="claimlist">
        {Widgets.tabs(
          "Hot Claims" -> (() => 
            	Widgets.pagedList(c.store.getFrequentClaims(_).toSeq flatMap Render.claim)),
          "Hot Topics" -> (() => 
                Widgets.pagedList(c.store.getBigTopics(_).toSeq flatMap Render.topic)),
          "Recently Marked Pages" -> (() => 
                Widgets.pagedList(c.store.recentMarkedPages(_).toSeq flatMap Render.markedPage)),
          "Top Users" -> (() =>
            	c.store.topUsers flatMap Render.user)
        )}
      </div>
  </div>
      
  def searchResults(implicit query : String, page : Int, c : ReqContext) =
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
        <h2>Claims matching "{c.arg("query")}"</h2>
        {Widgets.pagedList(c.store.searchClaims(c.arg("query"),_).toSeq flatMap Render.claim)}
      </div>
    </div>
  
  def connectClaim(row : SqlRow, query : String)(implicit c : ReqContext) = 
    <div class="content">
      {if(c.arg("thistype") == "claim"){
    	  	<h1>Connect claims to <a href={Urls.claim(row("id"))}>{row("text")}</a></h1>
       }else{
    	   	<h1>Connect claims to <a href={Urls.topic(row("id"))}>{row("text")}</a></h1>         
       }
      }
      <div class='message'>
      	Use the interface below to select claims that relate to this {c.arg("thistype")}
      </div>
      {
	    {Widgets.tabs(
	      "Search Claims" -> (() => 
	                       <form id="bigsearch" action={Urls.connect} method="GET">                 
		        <input type='hidden' name='addto' value={c.arg("addto")}/>
		        <input type='hidden' name='thistype' value={c.arg("thistype")}/>
		        <input type='hidden' name='thattype' value={c.arg("thattype")}/>
		        {   if(c.arg("query") != null){
			          <input type="text" class="query" name="query" value={c.arg("query")}/>
			        }else{
		              Widgets.greyInput("query","query","Enter search keywords")
			        }            
		        }
		        <input type="submit" class="submit" value="Search"/>
		  </form>   

	        <div id='claimlist'>

            <h2>Claims matching "{query}"</h2>           
             {Widgets.pagedList(c.store.searchLinked(query,"claim",row.int("id"),_).toSeq flatMap Render.claimlink)}
	         </div>),
	      "Recent Claims" -> (() => 
  	        <div id='claimlist'>
            <h2>Recent Claims</h2>
             {Widgets.pagedList(c.store.recentLinked(row.int("id"),"claim",c.userid,_).toSeq flatMap Render.claimlink)}
	         </div>),
          "Create a New Claim" -> (() =>
             Page.newClaim(c,query)
           ) 
            
	    )}
      }
    </div>

   def connectTopic(row : SqlRow, query : String)(implicit c : ReqContext) = 
    <div class="content">
      {if(c.arg("thistype") == "claim"){
    	  	<h1>Connect topics to <a href={Urls.claim(row("id"))}>{row("text")}</a></h1>
       }else{
    	   	<h1>Connect topics to <a href={Urls.topic(row("id"))}>{row("text")}</a></h1>         
       }
      }
      {Widgets.tabs(
	      "Search Topics" -> (() =>
           <form id="bigsearch" action={Urls.connect} method="GET">                 
		        <input type='hidden' name='addto' value={c.arg("addto")}/>
		        <input type='hidden' name='thistype' value={c.arg("thistype")}/>
		        <input type='hidden' name='thattype' value={c.arg("thattype")}/>
		        {   if(c.arg("query") != null){
			          <input type="text" class="query" name="query" value={c.arg("query")}/>
			        }else{
		              Widgets.greyInput("query","query","Enter search keywords")
			        }            
		        }
		        <input type="submit" class="submit" value="Search"/>
		  </form>   
	        <div id='claimlist'>
            <h2>Topics matching "{query}"</h2>
             {Widgets.pagedList(c.store.searchLinked(query,"topic",row.int("id"),_).toSeq flatMap Render.nodelink)}
	         </div>),
	      "Recent Topics" -> (() => 
  	        <div id='claimlist'>
            <h2>Recent Topics</h2>
             {Widgets.pagedList(c.store.recentLinked(row.int("id"),"topic",c.userid,_).toSeq flatMap Render.nodelink)}
             </div>),
          "Create a New Topic" -> (() =>
             Page.newTopic(c,query)
           ) 
	    )
      }
    </div>

    
  def newClaim(c : ReqContext, query : String) =
    <div class="content">
    	<h1>Create a New Disputed Claim</h1>
    	<div class="message">This should be a disputed claim that is made on web sites. 
    		Once you have created a disputed claim, you can identify instances of this claim
    		on the web, and associate the claim with evidence on either side.
    	</div>
    	<form class='form' id="newsnippet" action={PostUrls.newclaim} method="POST">
          <label for="name">Claim</label>
          <input type="text" id="name" name="name" value={query}/>
          <input type="hidden" class='hidden' name="addto" value={c.arg("addto")}/>
          <label for="descr">Optional Description</label>
          <textarea rows="5" id="descr" name="descr"></textarea>    
          <input class='submit' type="submit" value="Create New Claim"/>
        </form>
    </div>
 
       
  def newTopic(c : ReqContext, query : String) =
    <div class="content">
    	<h1>Create a New Topic</h1>
    	<div class="message">This should be a topic that disputed claims might be about.
    	</div>
    	<form class='form' id="newsnippet" action={PostUrls.newtopic} method="POST">
          <label for="name">Topic</label>
          <input type="text" id="name" name="name" value={query}/>
          <input type="hidden" class='hidden' name="addto" value={c.arg("addto")}/>
          <label for="descr">Optional Description</label>
          <textarea rows="5" id="descr" name="descr"></textarea>    
          <input class='submit' type="submit" value="Create New Topic"/>
        </form>
    </div>
    
  def claim(row : SqlRow)(implicit c : ReqContext) =
    <div id="claim">
      <div class="topclaim">
	      <h1>Claim: {row("text")}</h1>
	      <span class="instances"><a href={Urls.findsnippets(row("id"))}>seen <span class="count">{row("instance_count")}</span> times on the web</a>
	        - <a href={Urls.findsnippets(row("id"))}>find more</a>
	      </span>   
      </div>
      <div class="description">{row("description")}</div>
      {userref(row.int("user_id"),row.str("username"),"found by ")}
      <span id="notagainmain"><input type="checkbox" name="notagain" checked={if(row("ignored") != null) "true" else null} onClick={"notAgain(this,"+row("id")+")"}/>
        	<label for="notagain">don't highlight this claim</label></span>

       <div id="claimlist">
        {Widgets.tabs(
          "Opposing Evidence" -> (() => 
 	  	      <div class='evidence' id="opposed">
		        <h2>Opposing Evidence</h2>
            	{Widgets.pagedList(c.store.evidence(row.int("id"),"opposes",_).toSeq flatMap Render.evidence)}
                <a class='add' href={Urls.addevidence(row.int("id"),"opposes")}>add opposing evidence</a>
              </div>),
          "Supporting Evidence" -> (() => 
  	  	      <div class='evidence' id="supports">
		        <h2>Supporting Evidence</h2>
               	{Widgets.pagedList(c.store.evidence(row.int("id"),"supports",_).toSeq flatMap Render.evidence)}
                <a class='add' href={Urls.addevidence(row.int("id"),"supports")}>add supporting evidence</a>
              </div>),
          "Related Claims" -> (() => 
              <div id='related-claims'>
                <h2>Related Claims</h2>
                {Widgets.pagedList(c.store.linkedClaims(row.int("id"),_).toSeq flatMap Render.claim)}
                <a class='add' href={Urls.addlinks(row.int("id"),"claim","claim")}>add related claim</a>                  
              </div>),
          "Marked Pages" -> (() => 
              <div id='searchlist' style='padding-bottom: 4px'>
                 <input type="hidden" id="data-query" value=""/>
                 <input type="hidden" id="data-claim" value={""+row("id")}/>
                <h2>Places this claim is made on the web</h2>
                <div class='searchcontent'>
                	{Widgets.pagedList(c.store.allSnippets(row.int("id"),_).toSeq flatMap Render.markedSnippet)}
                </div>
                <a class='add' href={Urls.findsnippets(row.int("id"))}>find snippets making this claim</a>
              </div>
           )
        )}
      </div>
      <div id="topics">
        <h2>Topics</h2>
        {c.store.linkedTopics(row.int("id"),0) flatMap topicref}
        <a class='add' href={Urls.addlinks(row.int("id"),"claim","topic")}>add related topic</a>                  
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
   
	  <div class='boldmessage'>
	  This search interface allows you to rapidly find many snippets on the 
	  web that make a claim.
	</div>
	
	<div class='message'>
	  Enter search keywords to find snippets on the web that make the claim. 
	  Then click "mark" on all snippets that suggest or imply that the claim is true.
	</div>
         <div id="queries">
        <h2>Previous Search Queries</h2>
        {searchQueryList(c,row.int("id"))}
      </div>
      {simpleSearch(Urls.findsnippets(row("id")), c.arg("query"), "Enter search keywords")}
      {if(c.arg("fromextension") == null){
    	  Render.snipSearchResults(query,row)
       }else{
    	  <div id="searchlist">
		    <h2>Snippets marked with the Firefox extension</h2>
            <div class='searchcontent'>
		    {Widgets.pagedList(c.store.foundSnippets(row.int("id"),_).toSeq flatMap Render.markedSnippet)}
            </div>
  	      </div>
       }}
    </div>
    
  def topic(implicit c : ReqContext, row : SqlRow) = 
    <div id="topic">
      <h1>Topic: {row("text")}</h1>
      <div class="description">{row("description")}</div>
      <div id="claimlist">
         <div id="related-claims">
         <h2>Claims about this topic</h2>
         {Widgets.pagedList(c.store.linkedClaims(row.int("id"),_).toSeq flatMap Render.claim)}
         <a class='add' href={Urls.addlinks(row.int("id"),"topic","claim")}>add claims to this topic</a>                  
         </div>
      </div>
	    <div id="topics">
	       <h2>Related Topics</h2>
	       {c.store.linkedTopics(row.int("id"),0) flatMap topicref}
           <a class='add' href={Urls.addlinks(row.int("id"),"topic","topic")}>add related topic</a>                  
	    </div>
    </div>
    
  def user(row : SqlRow)(implicit c : ReqContext) = 
    <div id="user">
      <h1>User: {row("name")}</h1>
     <div id="claimlist">
        {Widgets.tabs(
          "Claims Created" -> (() => 
            	Widgets.pagedList(c.store.nodesByUser("claim",row.int("id"),_).toSeq flatMap Render.claim)),
          "Pages Marked" -> (() => 
                Widgets.pagedList(c.store.userMarkedPages(row.int("id"),_).toSeq flatMap Render.markedPage)),
          "Evidence Found" -> (() =>
            	Widgets.pagedList(c.store.evidenceForUser(row.int("id"),_).toSeq flatMap Render.userEvidence))
        )}
      </div>

    </div>

  def error(e : Exception) = 
    <div class="error">
    </div>
    
  def login(title : String, path : String) =
    <div class="content">
    	<h1>{title}</h1>
		<div class="message">
	      Enter the email address and password that you used to register with Dispute Finder.
	    </div>		
	    <div class='message'>
          If you don't have a Dispute Finder account then <a href={Urls.signup}>sign up</a>
        </div>
 	    <div class='message'>
          If you have lost your password then we can <a href={Urls.emailpass}>retreive your password</a>
        </div>

	    <form class='form' id="login" action="login" method="POST">	   
            <input class='hidden' type='hidden' name='url' value={path}/>
	        <label for="email">email</label>
	        <input type="text" name="email"/>
	        <p><label for="password">password</label>
	        	<input type="password" id="password" name="password"/></p>
	        <input class='submit' type="submit" value="Login"/>
	    </form>
    </div>
    
    // TODO: sign up with facebook connect
  def signup = 
    <div class='content'>
    	<h1>Sign up for a Dispute Finder Account</h1>
           <p>Reasons to sign up for a Dispute Finder account:
             <ul>
               <li>Add new claims to Dispute Finder</li>
               <li>Find more snippets that make disputed claims</li>
               <li>Tell Dispute Finder what claims you don't want it to highlight again</li>
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
    
  def emailpass = 
    <div class='content'>
      <h1>Retreive your password</h1>
 	  <div class="message">
       Enter the email address you used to sign up and we will email you your password.
     </div>		

      <form class='form' id='emailpass' action='emailpass' method ='POST'>
		<p>
		  <label for="email">email</label>
		  <input type="text" id="email" name="email"/>
		</p>
		<p>
		  <input class='submit' type='submit' value='Retrieve Password'/>
		</p>
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

  def sentpassword = 
    <div class='content'>
       <h1>Password Email Sent</h1>
       <div class='message'>
          We have sent an email with your Dispute Finder password to the email address you gave.          
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
       <h1>Account already confirmed</h1>
       <div class='message'>
       	This account has already been confirmed.
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

