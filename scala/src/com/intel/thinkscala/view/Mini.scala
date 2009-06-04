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
	            {c.store.evidence(row.int("id"),"opposes",0) flatMap Render.evidence}
	            <a class='add' target="_blank" href={Urls.addevidence(row.int("id"),"opposes")}>add opposing evidence</a>
		      </div>
            ),
          "Supporting Evidence" -> (() =>
	   	      <div class='evidence' id="supports">
		        <h2>Supporting Evidence</h2>
	            {c.store.evidence(row.int("id"),"supports",0) flatMap Render.evidence}
	            <a class='add' target="_blank" href={Urls.addevidence(row.int("id"),"supports")}>add supporting evidence</a>
		      </div>
            ))
         }
  </div>
  
  def newsnippet(text : String, url : String, title : String, disputed : Boolean, query : String)(implicit c : ReqContext) =
    <div class="minicontent">
      <form id='newsnippet' action={MiniUrls.newsnippet} method="POST">        
     {if(disputed)
        <h1>What claim is this snippet making?</h1>
      else
        (<div><h1>What claim is this evidence for?</h1>
        This evidence <select name="rel">
            <option selected={if(c.arg("rel")=="opposes") "selected" else null}>opposes</option>
            <option selected={if(c.arg("rel")=="supports") "selected" else null}>supports</option>
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
        <input type="submit" class="submit" value="Search"/>
	  </form>   
      <div id="claimlist">
      	{c.store.searchClaims(query,0) flatMap claimButton}    
      </div>
    </div>


   def claimButton(row : SqlRow)(implicit c : ReqContext) = 
     <a class='claimbutton' title="choose this claim" onclick={"submitForm('newsnippet','claimid',"+row("id")+")"}>
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

    
    def closewindow = 
      <script type='text/javascript'>
         closePopupWindow();
      </script>
}
