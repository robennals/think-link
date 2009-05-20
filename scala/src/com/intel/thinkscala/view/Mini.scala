package com.intel.thinkscala.view
import com.intel.thinkscala._

object Mini {
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
   		<form class='miniform' id="newsnippet" action={MiniPostUrls.newclaimsnippet} method="POST">
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
