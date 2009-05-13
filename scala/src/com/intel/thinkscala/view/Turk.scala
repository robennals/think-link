package com.intel.thinkscala.view

object Turk {
   import org.apache.commons.lang.StringEscapeUtils._
  
   def turkClaim(turkid : Int, current : Option[SqlRow]) = 
    <html xmlns="http://www.w3.org/1999/xhtml">
	    <head>
	      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	      <meta http-equiv="Content-Language" content="en-us" />
	      <title>Turk Task {turkid}</title>
	      <link rel="icon" type="image/png" href="/thinklink/images/lightbulb_red.png" />
   	      <link rel="stylesheet" href="/thinklink/stylesheets/turk.css" media="screen"/>
	      <link rel="stylesheet" href="/thinklink/stylesheets/normal.css" media="screen"/>
	      <script src="/thinklink/javascript/jquery-1.2.3.js" type="text/javascript"/>
  	      <script src="/thinklink/javascript/robjson.js" type="text/javascript"/>
	      <script src="/thinklink/javascript/standard.js" type="text/javascript"/>
   	      <script src="/thinklink/javascript/turk.js" type="text/javascript"/>
	    </head>
	    <body>
          {current match {
           case Some(r) =>
              <script type="text/javascript">
                 var global_claim = '{escapeJavaScript(r.str("claim"))}';
                 var global_snippets = {r.str("jsonsnips")};
                 var global_evurl = '{escapeJavaScript(r.str("evurl"))}';
                 var global_evquote = '{escapeJavaScript(r.str("evquote"))}';
                 var global_urls = mkUrlHash(global_snippets);
              </script>
	       case None => 
	   	      <script type="text/javascript">   	      	
	             var global_claim = null;
	             var global_snippets = null;
	             var global_evurl = null;
	             var global_evquote = null;
	             val global_urls = {};
	          </script>
	      }}
	      <script type="text/javascript">
             var global_turk_id = {turkid};
             makeTurkUi();
          </script>
	    </body>
    </html>  
  
//  def turkClaim(turkid : Int)(implicit c : ReqContext) =
//	<div class="turk">
//       {Widgets.ajaxTabs(
//         "1. Create Claim" -> createClaim(turkid),
//         "2. Mark Snippets" -> markSnippets(turkid),
//         "3. Add Opposing Evidence" -> addEvidence(turkid)
//       )}
//    </div>
//
//  def createClaim(turkid : Int) =
//    <div id="createclaim">
//       <div class="message">
//       	Enter a disputed claim that is not currently in our database. As you enter words, 
//       	the list box below will show similar claims that we already know.
//       </div>
//       {Widgets.suggestBox(TurkGetUrls.searchClaims(turkid),"setClaim")}
//    </div>
}
