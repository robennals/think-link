package com.intel.thinklink;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class NodeServlet extends HttpServlet {
	private static final long serialVersionUID = -3617073416622853438L;

	Pattern nodePath = Pattern.compile("/(\\d+)(/(.*))?(\\.(\\w+))?");
	Pattern globPath = Pattern.compile("/(.*)?(\\.(\\w+))?");

	DataBase base;
	Exception last_ex;
	
	public void init(){
		try{
			base = new DataBase();
		}catch(Exception e){
			last_ex = e;
			e.printStackTrace();
		}
	}
	
	protected void doGet(HttpServletRequest req, HttpServletResponse res)
	throws ServletException, IOException
	{
		res.setContentType("text/html");
		PrintWriter out = res.getWriter();
		
		try{
			String path = req.getServletPath();
			Matcher nodeMatch = nodePath.matcher(path);
			if(nodeMatch.find()){
				String format = nodeMatch.group(5);				
				getInfo(out,new Integer(nodeMatch.group(1)),format);
			}
		}catch(Exception e){
			e.printStackTrace(out);
		}
		out.close();
	}
	
	void getInfo(PrintWriter out,int id,String format) throws SQLException{
		// TODO: do user login sessions
		Dyn d = base.getLinks(id, 0);
		out.append(Dyn.toJSON(d));
	}
	
	void dumpObject(PrintWriter out, Dyn info, int userid){
	}
}
