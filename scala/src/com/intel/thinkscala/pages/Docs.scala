package com.intel.thinkscala.pages
import scala.io.Source
import java.io.File
import scala.xml.parsing._
import scala.xml._
import com.intel.thinkscala._

object Docs {
	def head(title : String) = 
		<head>
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></meta>
			<meta http-equiv="Content-Language" content="en-us"></meta>
			<title>{title}</title>
			<link href="/thinklink/images/lightbulb_red.png" type="image/png" rel="icon"></link>
			<link href="/thinklink/stylesheets/normal.css" rel="stylesheet" media="screen"></link>
			<link href="/thinklink/stylesheets/frontpage.css" rel="stylesheet" media="screen"></link>
			<script type="text/javascript" src="/thinklink/javascript/jquery-1.2.3.js"></script>
			<script type="text/javascript" src="/thinklink/javascript/standard.js"></script>
		</head>
	
    val docnav = 	
    	<div class='box' id="docnav">
		    <h3>Overview</h3>
		    <ul>
		    <li><a href="../frontpage.html">About Dispute Finder</a></li>
		    <li><a href="faq.html">FAQ</a></li>
		    <li><a href="highlight.html">Highlighted Claims</a></li>
		    <li><a href="arguments.html">Arguments</a></li>
		    <li><a href="training.html">Training</a></li>
		    </ul>
	    </div>

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
				<li><a href="https://addons.mozilla.org/en-US/firefox/addon/11712">Install</a></li>
			    <li><a href="/thinklink/docs/faq.html">FAQ</a></li>
				<li><a href="/thinklink/pages/claims.html">Claims</a></li>
				<li>Pages</li>
			    {if(c.user.realuser)
			         <li><a class="user" href={Urls.profile(c.user.userid)}>{c.user.name}</a></li>
			         <li><a class="logout" href={Urls.logout}>logout</a></li>
			     else
		             <li><a class="signup" href={Urls.signup}>sign up</a></li>
			         <li><a class="login" href={Urls.login(Urls.base)}>login</a></li>           
			    }
				<li>Feedback</li>
			</ul>
		</div>
		</div>
		
		
	def docPage(xmlstr : String, c : ReqContext) : NodeSeq = {
		val xml = ConstructingParser.fromSource(Source.fromString(xmlstr),true).document
		val title : String = (xml \\ "h1").text
		return <html>{head(title)}<body class='body'>{nav(c) ++ docnav ++ xml}</body></html>
	}
	
	def page(xmlstr : String, c : ReqContext) : NodeSeq = {
			val xml = ConstructingParser.fromSource(Source.fromString(xmlstr),true).document
			val title : String = (xml \\ "h1").text
			return <html>{head(title)}<body class='body'>{nav(c) ++ xml}</body></html>
	}

}
