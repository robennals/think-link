package com.intel.thinklink;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Vector;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class MainServlet extends HttpServlet {
	private static final long serialVersionUID = -6386632759905568995L;

	protected void doPost(HttpServletRequest req, HttpServletResponse res) 
		throws ServletException, IOException
	{
		doGet(req,res);
	}
	
	protected void matchForId(PrintWriter out, HttpServletRequest req, int id){
		try{
			DataBase base = ConnectionPool.get();
			try{
				Dyn snippet = base.getSnippet(id);
				String text = snippet.get("text") + " " + snippet.get("text") + " "+ snippet.get("page_text");
				Vector<WikiMatch> matches = WikiMatcher.getMatches(text); 
				matches = WikiMatcher.sumMatches(matches);
				
				Vector<Dyn> children = new Vector<Dyn>();
				int i = 0;
				for(WikiMatch m : matches){
					if(i > 20) break;
					Dyn d = new Dyn();
					d.put("text", m.target);
					d.put("type", "topic");
					d.put("id", 0);
					children.add(d);
					i++;
				}
				
				Dyn tomap = new Dyn();
				tomap.put("colitem", children);
				
				Dyn obj = new Dyn();
				obj.put("id", "suggestions?id="+id);
				obj.put("text", "Suggested Topics");
				obj.put("type", "suggestions");
				obj.put("from", new Vector());	
				obj.put("to", tomap);
	
				int userid = base.getUser(NodeServlet.getCookie(req,"email"), NodeServlet.getCookie(req,"password"));
				NodeServlet.outputNode(out, req, ".js", userid, obj);
	
			}finally{
				ConnectionPool.release(base);
			}
		}catch(Exception e){
			e.printStackTrace(out);
		}
	}

	
	protected void doGet(HttpServletRequest req, HttpServletResponse res)
		throws ServletException, IOException
	{
		res.setContentType("text/html");
		PrintWriter out = res.getWriter();
		
		String text = req.getParameter("text");
		String id = req.getParameter("id");
		
		if(id != null){
			matchForId(out,req,Integer.parseInt(id));
			out.close();
			return;
		}
		
		Vector<WikiMatch> matches = WikiMatcher.getMatches(text);
				
		matches = WikiMatcher.sumMatches(matches);
		
		out.println("<ul>");
		for(int i = 0; i < matches.size() && i < 20; i++){
			WikiMatch m = matches.get(i);
			out.println("<li>"+ m.target+"</li>");			
		}
		out.println("</ul>");

		
		out.println("</body></html>");
		
		out.close();
	}
	
	public String getServletInfo(){
		return "Hello everybody";
	}
}


