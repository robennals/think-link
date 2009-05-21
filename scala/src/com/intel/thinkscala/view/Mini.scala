package com.intel.thinkscala.view
import com.intel.thinkscala._

object Mini {
  def claim(row : SqlRow)(implicit c : ReqContext) =
    <div class="minicontent">
      <h1>Disputed Claim:</h1>
      <div><a class='minititle' target="_blank" href={Urls.claim(row("id"))}>{row("text")}
      <img src={Urls.img("application_go")}/>
      </a></div>
      
      {Widgets.tabs(
          "Opposing Evidence" -> (() =>
	  	      <div class='evidence' id="opposed">
		        <h2>Opposing Evidence</h2>
	            {c.store.evidence(row.int("id"),"opposes") flatMap Render.snippet}
	            <a class='add' target="_blank" href={Urls.addevidence(row.int("id"),"opposes")}>add opposing evidence</a>
		      </div>
            ),
          "Supporting Evidence" -> (() =>
	   	      <div class='evidence' id="supports">
		        <h2>Supporting Evidence</h2>
	            {c.store.evidence(row.int("id"),"supports") flatMap Render.snippet}
	            <a class='add' target="_blank" href={Urls.addevidence(row.int("id"),"supports")}>add supporting evidence</a>
		      </div>
            )
//          "Related Claims" -> (() => 
//		      <div id="related-claims">
//		        <h2>Related Claims</h2>
//		            {c.store.linkedEitherAnyNodes(row.int("id"),"claim",0,4) flatMap Render.claim}
//		      </div>            
//            ),
//          "Topics" -> (() => 
//              <div id="minitopics">
//		        <h2>Topics</h2>
//		        {c.store.linkedToNodes(row.int("id"),"about","topic",0,10) flatMap Render.topicref}
//		      </div>
//            ),
//          "Instance" -> (() =>
//             <div id="instances">
//               <span>seen <span class="count">{row("instance_count")}</span> times on the web
//               	<a target="_blank" href={Urls.findsnippets(row("id"))}>find more</a></span>
//             </div>
             )
         }
  </div>
  
  def newsnippet(text : String, url : String, title : String, disputed : Boolean, query : String)(implicit c : ReqContext) =
    <div class="minicontent">
      {if(disputed)
        <h1>What claim is this snippet making?</h1>
      else
        <h1>What claim is this evidence for?</h1>
      }
        {Widgets.tabs(
          "Suggested Claims" -> (() => searchForClaims(query)),
          "Recent Claims" -> (() => 
            	<div id='claimlist'>{c.store.getRecentClaims(c.userid) flatMap claimButton}</div>),
          "Create New Claim" -> (() =>
                createNewClaim)
        )}
   </div>

   def searchForClaims(query : String)(implicit c : ReqContext) =
     <div>
      <form id="minisearch" action={MiniUrls.newsnippet} method="GET">        
        <input type='hidden' name='text' value={c.arg("text")}/>
        <input type='hidden' name='title' value={c.arg("title")}/>
        <input type='hidden' name='url' value={c.arg("url")}/>
        <input type='hidden' name='disputed' value={c.arg("disputed")}/>
        {   if(c.arg("query") != null){
	          <input type="text" class="query" name="query" value={c.arg("query")}/>
	        }else{
              Widgets.greyInput("query","query","Enter search keywords")
	        }            
        }
        <input type="submit" class="submit" value="Search"/>
	  </form>   
      <div id='claimlist'>
      {c.store.searchClaims(query,0) flatMap claimButton}    
      </div>
    </div>

   
   def claimButton(row : SqlRow)(implicit c : ReqContext) = 
     <div class='claimbutton'>
       <a class='title' target="_blank" href={Urls.claim(row("id"))}>{row("text")}</a>
       <div class='add' href={MiniPostUrls.newsnippet(row.int("id"),c.argBool("disputed"),c.arg("text"),c.arg("url"),c.arg("title"))}>choose claim</div> 
     </div>
     
   def createNewClaim(implicit c : ReqContext) = 
     <div>
   		<form class='miniform' action={MiniPostUrls.newclaimsnippet} method="POST">
          <label for="name">Claim</label>
          <input type="text" id="name" name="name"/>
          <label for="descr">Optional Description</label>
          <textarea rows="5" id="descr" name="descr"></textarea>   
          <input type='hidden' name='text' value={c.arg("text")}/>
          <input type='hidden' name='title' value={c.arg("title")}/>
          <input type='hidden' name='url' value={c.arg("url")}/>
          <input class='submit' type="submit" value="Create New Claim"/>
        </form>
    </div>
}
