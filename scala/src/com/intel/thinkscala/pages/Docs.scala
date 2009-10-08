package com.intel.thinkscala.pages
import scala.io.Source
import java.io.File
import scala.xml.parsing._
import scala.xml._
import com.intel.thinkscala._
import scala.collection.mutable.HashMap
import scala.collection.Map
import com.intel.thinkscala.view.Template

object Docs {
    def mkvar(varname : String, varval : String) = <input class='hidden' type='hidden' id={varname} name={varname} value={varval}/>
	
	def head(title : String)(implicit c : ReqContext) = 
		if(c.user.studytrack){
			bind(loadFrag("head_study"),"xt","title" -> Text(title)) 
		}else{			
			bind(loadFrag("head"),"xt","title" -> Text(title)) 
		}

	def analytics(implicit c : ReqContext) = loadPage("fragments/analytics.xml")	
		
	def docnav(implicit c : ReqContext) = loadPage("fragments/docnav.xml") 
	
    def nav(c : ReqContext) = 
    	<div>
    	<div id="intellogo">
			<img src="/images/intel_black_transparent_100w.png"/>
			<div id="labs">Labs</div>
		</div>
		<h1 id="frontlogo">Dispute Finder<span class="beta">beta</span></h1>
		<div class="tagline">Reveal the other side of the story</div>
		
		<div id="nav">
			<ul>
				<li><a href="/thinklink/">About</a></li>
				<li><a href="/thinklink/docs/install.html">Install</a></li>
			    <li><a href="/thinklink/docs/faq.html">FAQ</a></li>
				<li><a href="/thinklink/pages/claims.html">Claims</a></li>
				<li><a href="/thinklink/claim/hot.html">Hot</a></li>
			    {if(c.user.realuser)
			         <li><a class="user" href={Urls.profile(c.user.userid)}>{c.user.name}</a></li>
			         <li><a class="logout" href={Urls.logout}>Logout</a></li>
			     else
		             <li><a class="signup" href={Urls.signup}>Sign Up</a></li>
			         <li><a class="login" href={Urls.login(Urls.base)}>Login</a></li>           
			    }
				<li><a href="/thinklink/pages/feedback.html">Feedback</a></li>
				<li><a href="http://disputefinder.blogspot.com/">Blog</a></li>
			</ul>
		</div>
		{if(c.getCookie("extension") != null && c.getCookie("extension") != "" && c.getCookie("extension") != "0.35"){
			<div class='claim-warning box'>
			   You are using a discontinued version of the Dispute Finder browser extension. 
			   Please <a href="https://addons.mozilla.org/en-US/firefox/addon/11712">upgrade</a>			   
			</div>
		}else if(c.getCookie("extension") == null || c.getCookie("extension") == ""){
			<div class='claim-warning box'>
			   To use Dispute Finder you need to <a href="/thinklink/docs/install.html">install the Dispute Finder Extension</a>
			</div>
		}
		}
		</div>
		
	def loadPage(respath : String)(implicit c : ReqContext) : Node = 
		ConstructingParser.fromSource(Source.fromString(c.readResource(respath)),true).document.docElem
		
	def loadFrag(res : String)(implicit c : ReqContext) : Node = loadPage("fragments/"+res+".xml")

	def bindPage(res : String, margs : (String,Node)*)(implicit c : ReqContext) =
		bind(loadPage("pages/"+res+".xml"),"xt",margs : _*)

	def bindFrag(res : String, margs : (String,Node)*)(implicit c : ReqContext) =
		bind(loadPage("fragments/"+res+".xml"),"xt",margs : _*)
				
	def page(res : String)(implicit c : ReqContext) = loadPage("pages/"+res+".xml")
	
	def docPage(xmlstr : String, c : ReqContext) : NodeSeq = {
		val xml = ConstructingParser.fromSource(Source.fromString(xmlstr),true).document
		val title : String = (xml \\ "h1").text
		Template.basics(c,title,nav(c) ++ docnav(c) ++ xml,"body")
	}
	
	def page(xmlstr : String, c : ReqContext) : NodeSeq = {
			val xml = ConstructingParser.fromSource(Source.fromString(xmlstr),true).document
			val title : String = (xml \\ "h1").text
			return <html>{head(title)(c)}<body class='body'>{nav(c) ++ xml}
		      <script type="text/javascript">
		        <xml:unparsed>
			  	var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
			  	document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
			  	</xml:unparsed>
			  </script>
			  <script type="text/javascript">
			  	<xml:unparsed>
			  	try {
			  	var pageTracker = _gat._getTracker("UA-10712508-1");
			  	pageTracker._trackPageview();
			  	} catch(err) {}
			  	</xml:unparsed>
			  </script>
			</body></html>
	}
		
	def bind(xml : Node, pre : String, margs : (String,Node)*) : Node = {
		val m = HashMap(margs : _*)
		processXml(xml,pre,n => 
		n match {
			case Elem(_,"bind",attr,scp,ns @ _*) => m(attr("name").text)
			case _ => n
		})
	}
	
	def applyXml(zone : String, res : String, m : Map[String,Any])(implicit c : ReqContext) : Node = 
			applyToData(loadPage(zone+"/"+res+".xml"),"xt",m)
	
	def applyToData(xml : Node, pre : String, m : Map[String,Any])(implicit c : ReqContext) : Node = {
		processXml(xml,pre,n => n match {
			case Elem(_,"bind",attr,scp,ns @ _*) => m(attr("name").text) match {
				case n : Node => n
				case null => <div class='null'/>
				case s => Text(s.toString)
			}
			case Elem(_,"foreach",attr,scp,ns @ _*) => m(attr("name").text) match {
				case l : Iterable[Map[String,_]] => {
					val body = ns.map(applyToData(_,pre,m))
					val cls = attr("class").text
					val as = attr("as").text
					<div>{l.flatMap(applyToData(<div class={cls}>{body}</div>,as,_))}</div>
				}
			}
			case Elem(_,objname,attr,scp,ns @ _*) => {
				val cls = Class.forName("com.intel.thinkscala.render."+objname)
				val method = cls.getMethod("render",classOf[ReqContext],classOf[Map[String,Any]],classOf[Elem],classOf[MetaData])
				method.invoke(c,m,n,attr).asInstanceOf[Node]
			}
			case _ => n
		})
	}
	
	def processXml(xml : Node, pre : String, f : Elem => Node) : Node = xml match {
		case Elem(prefix,label,attr,scp,ns @ _*) if prefix == pre => f(xml.asInstanceOf[Elem])
		case Elem(prefix,label,attr,scp,ns @ _*) => 
			Elem(prefix,label,attr,scp,ns.map(processXml(_,pre,f)) : _*)
		case _ => xml
	}
	
}
