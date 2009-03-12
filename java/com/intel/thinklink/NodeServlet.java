package com.intel.thinklink;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class NodeServlet extends HttpServlet {
	private static final long serialVersionUID = -3617073416622853438L;

	// GET URLs
	Pattern nodePath = Pattern.compile("/node/(\\d+)(\\.\\w+)?");
	Pattern searchPath = Pattern.compile("/node/search(\\.\\w+)?");
	Pattern recentPath = Pattern.compile("/node/recent(\\.\\w+)?");
	Pattern newSnipPath = Pattern.compile("/node/newsnips(\\.\\w+)?");
	Pattern hackNewSnipPath = Pattern.compile("/scripthack/newsnippet(\\.\\w+)?"); 
	Pattern globPath = Pattern.compile("/(.*)?(\\.(\\w+))?");
	Pattern urlSearchPath = Pattern.compile("/apianon/search(\\.\\w+)?");
	Pattern prefixPath = Pattern.compile("/node/prefix(\\.\\w+)?");
	
	// POST URLs
	Pattern addSnipPath = Pattern.compile("/node/addsnip");
	Pattern createPath = Pattern.compile("/node/create");
//	Pattern addLinkPath = Pattern.compile("/node/addlink");
	Pattern addLinkPath = Pattern.compile("/node/(\\d+)/addlink");
;
	static String getCookie(HttpServletRequest req, String key){
		Cookie[] cookies = req.getCookies();
		if(cookies == null) return null;
		for(Cookie c : cookies){
			if(c.getName().equals(key)){
				return c.getValue();
			}
		}
		return null;
	}
	
	private void dispatchPost(DataBase base, PrintWriter out, int userid, HttpServletRequest req) throws Exception{
		String path = req.getServletPath() + req.getPathInfo();
		Matcher m;
		m = addSnipPath.matcher(path);
		if(m.find()){
			base.addSnippet(userid, req.getParameter("text"), req.getParameter("url"), 
					req.getParameter("realurl"), req.getParameter("title"), req.getParameter("pagetext"));			
		}
		m = createPath.matcher(path);
		if(m.find()){
			int id = base.addNode(req.getParameter("text"),userid,
					req.getParameter("type"),"");
			out.append(""+id);
			return;
		}
		m = addLinkPath.matcher(path);
		if(m.find()){
			base.addLink(Integer.parseInt(m.group(1)),
					req.getParameter("verb"),
					req.getParameter("text"),
					req.getParameter("type"),
					userid);
		}
//		m = addLinkPath.matcher(path);
//		if(m.find()){
//			base.addLink(
//				Integer.parseInt(req.getParameter("subject")), 
//				Integer.parseInt(req.getParameter("object")), 
//				req.getParameter("verb"));
//		}
	}

	private Vector<String> getUrls(HttpServletRequest req){
		Vector<String> v = new Vector<String>();
		int i = 1;
		while(true){
			String url = req.getParameter("url"+i);
			if(url != null){
				v.add(url);
			}else{
				return v;
			}
			i++;
		}
	}
	
	private void dispatchGet(DataBase base, PrintWriter out, int userid, HttpServletRequest req) throws Exception{
		String path = req.getServletPath();
		String pathinfo = req.getPathInfo();
		if(pathinfo != null){
			path+=pathinfo;
		}
		Matcher m;
		
		m = nodePath.matcher(path);		
		if(m.find()){
			String format = m.group(2);				
			outputNode(out,req,format,userid,base.getLinks(Integer.parseInt(m.group(1)), userid));
			return;
		}
		
		m = searchPath.matcher(path);
		if(m.find()){
			String format = m.group(1);
			outputNode(out,req,format,userid,base.search(req.getParameter("query"),req.getParameter("type")));
			return;
		}
		
		m = recentPath.matcher(path);
		if(m.find()){
			String format = m.group(1);
			outputNode(out,req,format,userid,base.getRecent(userid));
			return;
		}
		
		m = newSnipPath.matcher(path);
		if(m.find()){
			String format = m.group(1);
			outputNode(out,req,format,userid,base.getNewSnips(userid));
			return;
		}
		
		m = urlSearchPath.matcher(path);
		if(m.find()){
			String format = m.group(1);
			Vector<String> urls = getUrls(req);
			outputList(out,req,format,base.urlSnippets(urls));
			return;
		}
		
		m = hackNewSnipPath.matcher(path);
		if(m.find()){
			base.addSnippet(userid, req.getParameter("text"), req.getParameter("url"), 
					req.getParameter("realurl"), req.getParameter("title"), req.getParameter("pagetext"));			
			return;
		}
		
//		m = prefixPath.matcher(path);
//		if(m.find()){
//			String format = m.group(1);
//			outputNode(out,req,format,userid,base.getPrefix)
//		}
		
		if(path.equals("/node/") || path.equals("node") || path.equals("/index.html")){
			Template.doTopTemplate(out, null, userid, base.getRecent(userid), base.getNewSnips(userid));
			return;
		}
		
		if(path.equals("/node/old")){
			Template.doTopTemplateOld(out, null, userid, base.getRecent(userid), base.getNewSnips(userid));
			return;
		}

	}

	protected void doPost(HttpServletRequest req, HttpServletResponse res)
	throws ServletException, IOException
	{
		res.setContentType("text/html");
		PrintWriter out = res.getWriter();		
		try{
			DataBase base = ConnectionPool.get();
			try{
				int userid = base.getUser(getCookie(req,"email"), getCookie(req,"password"));
				dispatchPost(base,out,userid,req);
			}finally{
				ConnectionPool.release(base);
			}
		}catch(Exception e){
			e.printStackTrace(out);
			e.printStackTrace(System.err);
		}
		out.close();
	}
	
	protected void doGet(HttpServletRequest req, HttpServletResponse res)
	throws ServletException, IOException
	{
		res.setContentType("text/html");
		PrintWriter out = res.getWriter();		
		try{
			DataBase base = ConnectionPool.get();
			try{
				int userid = base.getUser(getCookie(req,"email"), getCookie(req,"password"));
				dispatchGet(base,out,userid,req);
			}finally{
				ConnectionPool.release(base);
			}
		}catch(Exception e){
			e.printStackTrace(out);			
		}
		out.close();
		
	}
	
	
	static void outputDyn(PrintWriter out, HttpServletRequest req, String format, int userid, Dyn data){
		if(format.equals(".js")){
			String callback = req.getParameter("callback");
			if(callback == null){
				callback = "thinklink_callback";
			}
			out.append(callback);
			out.append("("+Dyn.toJSON(data)+");");
		}else{
			out.append(Dyn.toJSON(data));
		}
	}
	
	static void outputNode(PrintWriter out, HttpServletRequest req, String format, int userid, Dyn data){
		if(format == null || format.equals(".html")){
			Template.doNodeTemplate(out, userid, data);
		}else if(format.equals(".js")){
			String callback = req.getParameter("callback");
			if(callback == null){
				callback = "thinklink_callback";
			}
			out.append(callback);
			out.append("("+Dyn.toJSON(data)+");");
		}else{
			out.append(Dyn.toJSON(data));
		}
	}
	
	static void outputList(PrintWriter out, HttpServletRequest req, String format, Vector<Dyn> data){
		if(format == null) format = "";
		if(format.equals(".js")){
			String callback = req.getParameter("callback");
			if(callback == null){
				callback = "thinklink_callback";
			}
			out.append(callback);
			out.append("("+Dyn.toJSON(data)+");");
		}else{
			out.append(Dyn.toJSON(data));
		}
	}
	
	
	void getInfo(DataBase base, PrintWriter out,int id,String format) throws SQLException{
		// TODO: do user login sessions
		Dyn d = base.getLinks(id, 0);
		out.append(Dyn.toJSON(d));
	}
	
	void dumpObject(PrintWriter out,  Dyn info, int userid){
	}
}
