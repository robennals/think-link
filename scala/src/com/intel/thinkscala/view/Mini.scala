package com.intel.thinkscala.view
import com.intel.thinkscala._

object Mini {
  def claim(row : SqlRow)(implicit c : ReqContext) =
  <div><div class="box thingbox">
      <h1>Claim: <a class='minititle' target="_blank" href={Urls.claim(row("id"))}>
      {row("text")}<img class='goicon' src={Urls.img("application_go")}/>
      </a></h1>     
      {Widgets.tabs(
          "Opposing Articles" -> (() =>
	  	      <div class='evidence' id="opposed">
	            {c.store.evidence_one(row.int("id"),"opposes",c.user.userid) flatMap Render.evidence}
		      </div>
            ),
          "Supporting Articles" -> (() =>
	   	      <div class='evidence' id="supports">
	            {c.store.evidence_one(row.int("id"),"supports",c.user.userid) flatMap Render.evidence}
		      </div>
            ))
         }
      {if (c.user.realuser) {
          <div id="notagain"><input type="checkbox" name="notagain" checked={if(row("ignored") != null) "true" else null} onClick={"notAgain(this,"+row("id")+")"}/>
            	<label for="notagain">don't highlight this claim for me again</label></div>
          }else{
            <a id="notagain" target="_blank" href={Urls.login_simple}>login to ignore or report spam</a>
          }      
     }
    </div>
    {if (c.user.realuser && c.arg("snippet") != "") {
//	      if(c.user.userid == row.int("user_id")){
//	        <button id="badsnippet" onclick={"unmark("+c.arg("snippet")+")"}>unmark snippet</button>
//	      }else{
		    <button id="badsnippet" onclick={"unmark("+c.arg("snippet")+")"}>unmark snippet - snippet does not make this claim</button>
//	      }
	  }else{
	    <span class="nothing" />
	  }      
  }
  </div>
  
  def newsnippet(text : String, url : String, title : String, disputed : Boolean, query : String)(implicit c : ReqContext) =
    <div class="minicontent">
      <form id='newsnippet' action={MiniUrls.newsnippet} method="POST">        
     {if(disputed)
        <h1>What disputed claim is this a paraphrase of?</h1>
      else
        (<div><h1>What claim is this evidence for?</h1>
        This evidence <select name="rel">
            <option>choose...</option>
            <option value="opposes" selected={if(c.arg("rel")=="opposes") "selected" else null}>opposes</option>
            <option value="supports" selected={if(c.arg("rel")=="supports") "selected" else null}>supports</option>
       </select> the claim:</div>)     
     }  
        <input type='hidden' name='text' value={c.arg("text")}/>
        <input type='hidden' name='title' value={c.arg("title")}/>
        <input type='hidden' name='url' value={c.arg("url")}/>
        <input type='hidden' name='isdisputed' value={c.arg("isdisputed")}/>
        <input type='hidden' name='claimid' id='claimid' value="0"/>
        <input type='hidden' name='name'/>
        <input type='hidden' name='descr'/>
      </form>
	    {Widgets.tabs(
	      "Search Claims" -> (() => searchForClaims(query)),
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
        <input type='hidden' name='isdisputed' value={c.arg("isdisputed")}/>
        {   if(c.arg("query") != null){
	          <input type="text" class="query" name="query" value={c.arg("query")}/>
	        }else{
              Widgets.greyInput("query","query","Enter search keywords")
	        }            
        }
        <input type="submit" value="Search"/>
	  </form>   
      <div id="claimlist">
      	{c.store.searchClaims(query,0) flatMap claimButton}    
      </div>
    </div>


   def claimButton(row : SqlRow)(implicit c : ReqContext) = 
     <a class='claimbutton' title="choose this claim" onclick={"addEvidence("+row("id")+")"}>
         {row("text")}</a>
          
   def createNewClaim(implicit c : ReqContext) = 
     <div>
   		<form class='miniform' id="newclaimform">
          <input type='hidden' name='text' value={c.arg("text")}/>
          <input type='hidden' name='title' value={c.arg("title")}/>
          <input type='hidden' name='url' value={c.arg("url")}/>
          <input type='hidden' name='isdisputed' value={c.arg("isdisputed")}/>
          <input type='hidden' name='rel' value="opposes"/>
          <label for="name">Claim</label>
          <input type="text" id="name" name="name" value={c.arg("query")}/>
          <label for="descr">Optional Description</label>
          <textarea rows="5" id="descr" name="descr"></textarea>   
          <button class='submit' type='button' onclick="submitNewClaim(); return false">Create New Claim</button>
        </form>
    </div>
    
    def marked(claimid : Int) =
      <div class='minicontent'>
      	<h1>Snippet has now been saved</h1>      	
        <a href={Urls.claim(claimid)} target="_blank">go to claim</a>
      </div>

    def addedEvidence(claimid : Int) =
      <div class='minicontent'>
      	<h1>Evidence has now been saved</h1>      	
        <a href={Urls.claim(claimid)} target="_blank">go to claim</a>
      </div>

    def markedbad = 
      <div class='minicontent'>
        <h1>Snippet has now been unmarked</h1>
        <p>Thank you for unmarking this snippet. We rely on users like you
        to tell us when other users have marked snippets indirectly.</p>
        <p>We keep statistics on whether snippets marked by a user are 
        subsequently unmarked so that we can track down abusive users</p>
      </div>
    
    def closewindow = 
      <script type='text/javascript'>
         closePopupWindow();
      </script>
}
