package com.intel.thinklink;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

class User{
	String email;
	int id;	
	
	User(String email, String password){
	}
}

public class NodeServlet extends HttpServlet {
	private static final long serialVersionUID = -3617073416622853438L;

	Pattern nodePath = Pattern.compile("/node/(\\d+)(\\.\\w+)?");
	Pattern searchPath = Pattern.compile("/node/search(\\.\\w+)?");
	Pattern recentPath = Pattern.compile("/node/recent(\\.\\w+)?");
	Pattern newSnipPath = Pattern.compile("/node/newsnips(\\.\\w+)?");
	Pattern globPath = Pattern.compile("/(.*)?(\\.(\\w+))?");
	
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

	private void dispatch(DataBase base, PrintWriter out, int userid, HttpServletRequest req) throws Exception{
		String path = req.getServletPath() + req.getPathInfo();

		Matcher nodeMatch = nodePath.matcher(path);		
		if(nodeMatch.find()){
			String format = nodeMatch.group(2);				
			outputNode(out,req,format,base.getLinks(Integer.parseInt(nodeMatch.group(1)), userid));
			return;
		}
		
		Matcher searchMatch = searchPath.matcher(path);
		if(searchMatch.find()){
			String format = searchMatch.group(1);
			outputNode(out,req,format,base.search(req.getParameter("query")));
			return;
		}
		
		Matcher recentMatch = recentPath.matcher(path);
		if(recentMatch.find()){
			String format = recentMatch.group(1);
			outputNode(out,req,format,base.getRecent(userid));
			return;
		}
		
		Matcher newMatch = newSnipPath.matcher(path);
		if(newMatch.find()){
			String format = newMatch.group(1);
			outputNode(out,req,format,base.getNewSnips(userid));
			return;
		}
		
		if(path.equals("/node/")){
			Template.doTopTemplate(out, null, userid, base.getRecent(userid), base.getNewSnips(userid));
			return;
		}
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
				dispatch(base,out,userid,req);
			}finally{
				ConnectionPool.release(base);
			}
		}catch(Exception e){
			e.printStackTrace(out);			
		}
		out.close();
		
	}
	
	void outputNode(PrintWriter out, HttpServletRequest req, String format, Dyn data){
		if(format == null) format = "";
		if(format.equals(".js")){
			out.append(req.getParameter("callback"));
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
