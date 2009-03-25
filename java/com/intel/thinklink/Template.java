package com.intel.thinklink;

import java.io.PrintWriter;

public class Template {
	static void p(String s){
		w.println(s);
	}
	
	static PrintWriter w;

	static void doTopTemplate(PrintWriter writer,String username,int userid, Dyn panela, Dyn panelb){
		w = writer;
		p("	<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\"");
		p("	\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
		p("	<html xmlns=\"http://www.w3.org/1999/xhtml\">");
		p("		<head>");
		p("			<meta http-equiv=\"Content-Type\" content=\"text/html;.");
		p("			charset=iso-8859-1\" />");
		p("			<meta http-equiv=\"Content-Language\" content=\"en-us\" />");
		p("			<title>Think Link</title>");
		p("			<link href=\"/thinklink/stylesheets/leftright.css\" media=\"screen\" rel=\"stylesheet\" type=\"text/css\" />");
		p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/jquery-1.2.3.js\"></script>");
		p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/robjson.js\"></script>");
		p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/leftrightui.js\"></script>");
		p("			<script type='text/javascript' src='http://www.getfirebug.com/firebug/firebugx.js'></script>");
		p("      </head>");
		p("		<body id=\"body\">");
		p("			<div id='container'></div>");
		p("			<script type='text/javascript'>");
		p("			var urlbase = '/thinklink/';");
		p("			makeUI('hot.js',true);");
		p("			</script>");
		p("     </body>");
		p("</html>");
	}

	static void doNodeTemplate(PrintWriter writer,int userid, String id){
		w = writer;
		p("	<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\"");
		p("	\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
		p("	<html xmlns=\"http://www.w3.org/1999/xhtml\">");
		p("		<head>");
		p("			<meta http-equiv=\"Content-Type\" content=\"text/html;.");
		p("			charset=iso-8859-1\" />");
		p("			<meta http-equiv=\"Content-Language\" content=\"en-us\" />");
		p("			<title>Think Link</title>");
		p("			<link href=\"/thinklink/stylesheets/leftright.css\" media=\"screen\" rel=\"stylesheet\" type=\"text/css\" />");
		p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/jquery-1.2.3.js\"></script>");
		p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/robjson.js\"></script>");
		p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/leftrightui.js\"></script>");
		p("			<script type='text/javascript' src='http://www.getfirebug.com/firebug/firebugx.js'></script>");
		p("      </head>");
		p("		<body id=\"body\">");
		p("			<div id='container'></div>");
		p("			<script type='text/javascript'>");
		p("			var urlbase = '/thinklink/';");
		p("			makeUI('"+id+"',false);");
		p("			</script>");
		p("     </body>");
		p("</html>");
	}
	
	static void doTopTemplateOld(PrintWriter writer,String username,int userid, Dyn panela, Dyn panelb){
		w = writer;
p("		<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\"");
p("		\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
p("		<html xmlns=\"http://www.w3.org/1999/xhtml\">");
p("		<head>");
p("			<meta http-equiv=\"Content-Type\" content=\"text/html;.");
p("			charset=iso-8859-1\" />");
p("			<meta http-equiv=\"Content-Language\" content=\"en-us\" />");
p("			<title>MindMix</title>");
p("			<link href=\"/thinklink/stylesheets/style.css?1232414608\" media=\"screen\" rel=\"stylesheet\" type=\"text/css\" />");
p("			");
p("			");
p("");
p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/jquery-1.2.3.js\"></script>");
p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/robjson.js\"></script>");
p("");
p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/webui.js\"></script>");
p("			");
p("		</head>");
p("		<body id=\"body\">");
p("			<div id=\"container\">");
p("			<table style=\"margin:4px; width:100%\"><tr><td>");
p("			<span class=\"helpmessage\">");
p("			Use <b>drag and drop</b> to create new connections between claims and topics.");
p("			</span>");
p("");
p("			</td><td style=\"text-align:right; padding-right: 10px;\">");
p("			<span>");
if(username != null){
	p("Logged in as "+username);
}else{
	p("<a href='/api/login'>login</a>");
}
p("			");
p("			</span>");
p("			</td></tr>");
p("		</table>");
p("");
p("");
p("		<div>");
p("		<table class='mastertable' id=\"mastertable\">");
p("");
p("		<tr>");
p("		<td class=\"mastercolumn\">");
p("		<div id=\"browser1\">");
p("		</div>");
p("		</td>");
p("		<td class=\"mastercolumn\">");
p("		<div id=\"browser2\">");
p("		</div>");
p("		</td>");
p("		</tr>");
p("		</table>");
p("		</div>");
p("");
p("		<!-- <div class=\"dragbar\" id=\"dragbar\" onmousedown=\"dragBar(event)\">");
p("		</div>");
p("		-->");
p("");
p("		<script type=\"text/javascript\">");
p("		function doResize(){");
p("			var nowheight = document.body.offsetHeight;");
p("			var wantheight = window.innerHeight;");
p("			var resizeBox = $(\".browser_body\");");
p("			var bodyheight = resizeBox.get(0).offsetHeight;");
p("			var pad = 20;");
p("			");
p("			resizeBox.css(\"height\",bodyheight + wantheight - nowheight - pad);");
p("			");
p("//			topheight = $(\".helpmessage\").get(0).offsetHeight + $(\".browsetitle\").get(0).offsetHeight;");
p("//			resizeBox.css(\"height\",window.innerHeight - topheight);");
p("		}");
p("		var thinklink_user_id = "+userid+";");
p("		var thinklink_deletes = make_hash([]);");
p("		var thinklink_bookmarks = make_hash([]);");
p("		var urlbase = '/thinklink/';");
p("		var thinklink_organizer = true;");	
p("");
p("		makeArgBrowseFrame(\"browser1\","+Dyn.toJSON(panela)+",null,null,0);");
p("		makeArgBrowseFrame(\"browser2\","+Dyn.toJSON(panelb)+",null,null,1);");
p("");
p("		doResize();");
p("		window.addEventListener(\"resize\",doResize,true);");
p("");
p("		</script>	</div>");
p("");
p("		</body>");
p("		</html>");
	}

	static void doNodeTemplateOld(PrintWriter writer,int userid, Dyn obj){
		w = writer;
p("		<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\"");
p("		\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
p("		<html xmlns=\"http://www.w3.org/1999/xhtml\">");
p("		<head>");
p("			<meta http-equiv=\"Content-Type\" content=\"text/html;.");
p("			charset=iso-8859-1\" />");
p("			<meta http-equiv=\"Content-Language\" content=\"en-us\" />");
p("			<title>MindMix</title>");
p("			<link href=\"/thinklink/stylesheets/style.css\" media=\"screen\" rel=\"stylesheet\" type=\"text/css\" />");
p("			");
p("			");
p("");
p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/jquery-1.2.3.js\"></script>");
p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/robjson.js\"></script>");
p("");
p("			<script type=\"text/javascript\" src=\"/thinklink/javascript/webui.js\"></script>");
p("			");
p("		</head>");
p("		<body id=\"body\">");
p("			<div id=\"container\">");
p("			");
p("		<div id=\"argbrowser\">");
p("		</div>");
p("");
p("		<script type=\"text/javascript\">");
p("		var urlbase = '/thinklink/';");
p("		var thinklink_organizer = false;");	
p("		var thinklink_user_id = "+userid+";");
p("		var thinklink_deletes = make_hash([]);");
p("		var thinklink_bookmarks = make_hash([]);");
p("		makeArgBrowser('argbrowser',"+obj.toJSON()+");");
p("		</script>");
p("");
p("			</div>");
p("		</body>");
p("		</html>");		
	}

}
