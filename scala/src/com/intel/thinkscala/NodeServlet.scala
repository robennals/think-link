package com.intel.thinkscala

import java.util.regex._;
import javax.servlet.http._;
import java.io._;
import com.intel.thinklink._;

class NodeServlet extends HttpServlet {
  	val nodePath = Pattern.compile("/(\\d+)(/(.*))?(\\.(\\w+))?");
	val globPath = Pattern.compile("/(.*)?(\\.(\\w+))?");
 	val base = new DataBase();
 
	override def doGet(req : HttpServletRequest, res : HttpServletResponse) {
		res.setContentType("text/html");
		val out = res.getWriter();
		  
		try{
			val path = req.getServletPath();
			val nodeMatch = nodePath.matcher(path);
			if(nodeMatch.find()){
				val format = nodeMatch.group(5);				
	//			getInfo(out,(new Integer(nodeMatch.group(1))).intValue,format);
			}
		}catch{
		  case e =>
			e.printStackTrace(out);
		}
		out.close();
	}

 	var last_ex : Exception = null;
	
//	def init(){
//		try{
//			base = new DataBase();
//		}catch{
//		  case e : Exception =>
//			last_ex = e;
//			e.printStackTrace();
//		}
//	}
 
//	def getInfo(out : PrintWriter,id : int,format : String){
//		// TODO: do user login sessions
//		val d = base.getLinks(id, 0);
//		out.append(Dyn.toJSON(d));
//	}
	
	def dumpObject(out : PrintWriter, info : Dyn, userid : int){
	}
}
