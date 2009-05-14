package com.intel.thinkscala.view
import scala.xml._

object Turk {
   import org.apache.commons.lang.StringEscapeUtils._
  
   def turkClaim(turkid : Int, mode : String) = 
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
	      {if(mode != null){
		      <script type="text/javascript">
	             var global_turk_id = {turkid};
	             loadTurkUi();
	          </script>
          }else{
	   	      <script type="text/javascript">
	             var global_turk_id = {turkid};
	             makeTurkUi();
	          </script>
          }}
	    </body>
    </html>  

}
