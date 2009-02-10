package com.intel.thinklink;

import java.io.IOException;
import java.io.PrintWriter;
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
	
	protected void doGet(HttpServletRequest req, HttpServletResponse res)
		throws ServletException, IOException
	{
		res.setContentType("text/html");
		PrintWriter out = res.getWriter();
		out.println("<HTML><HEAD><title>Hello world</title></head><body>"+
//				req.getContextPath()+" - "+req.getParameter("text")+
				"Hello");
		
		String text = req.getParameter("text");
		
		Vector<WikiMatch> matches = WikiMatcher.getMatches(text);
		
//		out.println("<ul>");
//		for(WikiMatch m : matches){
//			out.println("<li>"+m.name + "->"+ m.target +":" + m.score+"</li>");
//		}
//		out.println("</ul>");
//		
//		out.println("<h2>With Merging</h2>");
		
		matches = WikiMatcher.sumMatches(matches);
		
		out.println("<ul>");
		for(int i = 0; i < matches.size() && i < 20; i++){
			WikiMatch m = matches.get(i);
			out.println("<li>"+ m.target+"</li>");			
//			out.println("<li>"+m.name + "->"+ m.target +":" + m.score+"</li>");
		}
		out.println("</ul>");

		
		out.println("</body></html>");
		
		out.close();
	}
	
	public String getServletInfo(){
		return "Hello everybody";
	}
}


