package com.intel.thinkscala.view
import com.intel.thinkscala.Util._
import com.intel.thinkscala._
import com.intel.thinkscala.pages.Docs
import scala.collection.mutable.HashMap
import com.intel.thinkscala.data.Snippets
import scala.xml._
import util.Timer.time
import com.intel.thinkscala.learn.Paraphraser

object Page {
  import Widgets._
  import Render._
      
  def searchResults(implicit query : String, page : Int, c : ReqContext) =
     c.store.searchClaims(query,page).toSequence flatMap Render.claim
   
  def hotClaims(implicit c : ReqContext) = 
	  <div class='box mainbox' id='hotclaims'>
  		<h1>Hot Claims</h1>
  		<div class='desc'>
  			Here are some disputed claims that users have <a href="/pages/claims.html">added</a> recently. You can also <a href="/pages/claims.html">search our entire database of disputed claims</a>.
  		</div>
  		<div class='claimresults'>
  			{c.store.hotClaims flatMap Render.claim}
  		</div>
      </div>
     
  def search(implicit c : ReqContext) = 
    <div class="box yellowbox mainbox">
	  <div class='boxbody'>
	
	  <form id="mainsearch" method="get" action="search">
		  <span class='prompt'>I dispute the claim that...</span>
		  <input name="query" type="text" class='search' value={c.arg("query")}/>
		  <input class='submit' type="submit" value="Search Claim Database"/>
	  </form>
	
	  <form id="newthing" method="GET" action={Urls.createClaim(c.arg("query"))}>
	  <input type="hidden" name="query" value={c.arg("query")}/>
	  <span class='reuse'>Re-use a claim we already know</span> &#8212; or &#8212; <input type='submit' class='submit' value="Create a New Claim"/>
	  </form>
  
     <div class="claimresults">
        {c.store.searchClaims(c.arg("query"),0) flatMap Render.claim}
      </div>
      </div>
    </div>
  
  def connectClaim(row : SqlRow, query : String)(implicit c : ReqContext) = 
    <div class="content">
      {if(c.arg("thistype") == "claim"){
    	  	<h1>Connect opposing claims to <a href={Urls.claim(row("id"))}>{row("text")}</a></h1>
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
             {Widgets.pagedList(c.store.searchLinked(query,"claim",row.int("id"),_), Render.claimlink)}
	         </div>),
	      "Recent Claims" -> (() => 
  	        <div id='claimlist'>
            <h2>Recent Claims</h2>
             {Widgets.pagedList(c.store.recentLinked(row.int("id"),"claim",c.userid,_), Render.claimlink)}
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
           <div><form id="bigsearch" action={Urls.connect} method="GET">                 
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
             {Widgets.pagedList(c.store.searchLinked(query,"topic",row.int("id"),_), Render.nodelink)}
             </div>
	      ),
	      "Recent Topics" -> (() => 
  	         {Widgets.pagedList(c.store.recentLinked(row.int("id"),"topic",c.userid,_), Render.nodelink)}
          ),
          "Create a New Topic" -> (() =>
             Page.newTopic(c,query)
           ) 
	    )
      }
    </div>

    def newClaim(c : ReqContext, query : String) = 
    	Docs.bindPage("newclaim","input" -> <input type="text" name="query" class='search' value={query}/>)(c)

    
//  def newClaim(c : ReqContext, query : String) =
//    <div class="content">
//    	<h1>Create a New Disputed Claim</h1>
//    	<div class="desc">This should be a disputed claim that is made on web sites. 
//    		Once you have created a disputed claim, you should enter paraphrases that should be highlighted
//    		when they appear on the web, and add opposing articles that should be shown to other users.
//    	</div>
//    	<div class='form' id="newsnippet">
//          <label for="name">Claim</label>
//          <input type="text" id="name" name="name" value={query}/>
//          <input type="hidden" class='hidden' name="addto" value={c.arg("addto")}/>
//       	 <button onclick="newClaimDerivedParas()" class='submit' style='margin-left:10px; margin-top: 10px'>Add Disputed Claim to our Database</button>
//         <button class='submit' onclick="document.location.href='/thinklink/pages/claims.html'">Cancel</button>
//        </div>
//    </div>
 
       
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
    
  def claim(row : SqlRow)(implicit c : ReqContext) : NodeSeq =
    <div>
      <span id="notagainmain"><input type="checkbox" name="notagain" checked={if(row("ignored") != null) "true" else null} onClick={"notAgain(this,"+row("id")+")"}/>
        	<label for="notagain">don't highlight this claim</label></span>
       	{if(row.int("disagree_count") == 0){
       		<div class='claim-warning box'>
       		This claim does not have any opposing articles. You need to <a href="/thinklink/docs/arguments.html">add an opposing article</a>
       		before we can tell other users this claim is disputed.
       		</div>
       	}else{}}
        <div class="box mainbox thingbox">
        <h1>Claim: {row("text")}</h1>  
        {Widgets.tabs(
          "Opposing Articles" -> (() => 
          	  <div class='desc'><a href="/thinklink/docs/arguments.html">User-submitted articles</a> that oppose the claim that <q>{row("text")}</q></div>
              <div class='evidence' id="opposed">
            	{c.store.evidence(row.int("id"),"opposes",c.user.userid,0) flatMap Render.evidence}
                <a class='add' href='/thinklink/docs/arguments.html'>use the firefox extension to add opposing articles</a>
              </div>
          ),
          "Supporting Articles" -> (() =>
      	  <div class='desc'><a href="/thinklink/docs/arguments.html">User-submitted articles</a> that support the claim that <q>{row("text")}</q></div>

  	  	      <div class='evidence' id="supports">
               	{c.store.evidence(row.int("id"),"supports",c.user.userid,0) flatMap Render.evidence}
                <a class='add' href='/thinklink/docs/arguments.html'>use the firefox extension to add supporting articles</a>
              </div>),
         "Highlight on the Web" -> {() =>
         		val paras = c.store.paraphrases(row.int("id"))
         		row("paraphrases") = paras
         		row("idnode") = Docs.mkvar("claimid",row.int("id") + "")
         		paras foreach {para =>
         			para("user") = <a class='user' href={Urls.user(para("user_id"))}>{para("username")}</a>
         			para("subphrases") = c.store.subphrases(para.int("id"))
         			para("delmsg") = if(para.int("user_id") == c.user.userid){
     					<a onclick={"deletePara("+para("id")+")"}>delete</a> 
     				}else{
        				<a onclick={"abusePara("+para("id")+")"}>report abuse</a>             				 
     				}
         		}
         		Docs.applyXml("fragments","paraphrases",row)       		 
         }
        )}
      </div>
      <div id="stats" class="box">
        {userref(row.int("user_id"),row.str("username"),"created by ")}
      </div>
    </div>
//     
//  def addEvidence(claimid : Int, claimtxt : String, rel : String, text : String)(implicit c : ReqContext) =    
//    <div class='content'>
//        <a href={Urls.claim(claimid)}><h1>{claimtxt}</h1></a>
//        <div class='subtitle'>Add Evidence that supports or opposes this claim</div>
//        <div class='message'>
//           The easiest way to add evidence to a claim is to use the <a href={Urls.extension}>Firefox Extension</a>.
//           If for some reason you cannot use the Firefox extension, you can also add evidence using the form below:
//        </div>
//        <form class='form' method='post' action={PostUrls.addEvidence(claimid)}>
//           <label for='url'>Url for evidence page:</label>
//           {Widgets.greyInput("input","url","Paste the URL of the page with evidence")}
//           This evidence <select name='rel'>
//             <option selected={if(rel=="supports") "selected" else null}>supports</option>
//             <option selected={if(rel=="opposes") "selected" else null}>opposes</option>
//           </select> the claim "{claimtxt}"
//           <label for='snip'>Copy and paste a representative quote below:</label>
//           <textarea rows="5" name="text"></textarea>    
//           <input class='submit' type="submit" value="Add Evidence"/>
//        </form>
//    </div>
//    
//  def findsnippets(row : SqlRow, query : String)(implicit c : ReqContext) = 
//    <div id="findsnippets">
//      <input type="hidden" id="data-query" value={query}/>
//      <input type="hidden" id="data-claim" value={""+row("id")}/>
//      <a href={Urls.claim(row("id"))}><h1>{row("text")}</h1></a>
//      <div class="subtitle">Find snippets on the web that make this claim</div>
//   
//	  <div class='boldmessage'>
//	  This search interface allows you to rapidly find many snippets on the 
//	  web that make a claim.
//	</div>
//	
//	<div class='message'>
//	  Enter search keywords to find snippets on the web that make the claim. 
//	  Then click "mark" on all snippets that suggest or imply that the claim is true.
//	</div>
//         <div id="queries">
//        <h2>Previous Search Queries</h2>
//        {searchQueryList(c,row.int("id"))}
//      </div>
//      {if(c.arg("fromextension") == null){         
//    	  time("snipSearchResults",Render.snipSearchResults(query,row))
//       }else{
//    	  <div id="searchlist">
//		    <h2>Snippets marked with the Firefox extension</h2>
//            <div class='searchcontent'>
//		    {Widgets.pagedList(c.store.foundSnippets(row.int("id"),_), Render.urlSnippet)}
//            </div>
//  	      </div>
//       }}
//    </div>
    
  def topic(implicit c : ReqContext, row : SqlRow) = 
    <div id="topic">
      <h1>Topic: {row("text")}</h1>
      <div class="description">{row("description")}</div>
      <div id="claimlist">
         <h2>Claims about this topic</h2>
         <div class='tabbody'>
         {Widgets.pagedList(c.store.linkedClaims(row.int("id"),_), Render.claim)}
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
        {Widgets.tabs(
          "Claims Created" -> (() => 
            	Widgets.pagedList(c.store.nodesByUser("claim",row.int("id"),_), Render.claim)),
//          "Pages Marked" -> (() => 
//                Widgets.pagedList(c.store.userMarkedPages(row.int("id"),_), Render.urlSnippet)),
          "Evidence Found" -> (() =>
            	Widgets.pagedList(c.store.evidenceForUser(row.int("id"),_), Render.userEvidence))
        )}
    </div>

  def error(e : Exception) = 
    <div class="error">
    </div>
    

    


}

