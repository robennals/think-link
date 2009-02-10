package com.intel.thinklink;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Set;
import java.util.Vector;

import javax.servlet.http.HttpServletResponse;

/**
 * Dyn is not efficient. Replace with static stuff when it matters.
 * @author rob
 *
 */
class Dyn{
	HashMap<String,Object> map = new HashMap<String,Object>(); 	

	Dyn(HashMap v){
		map = v;
	}
	Dyn(){
	}
	
	void put(String key,Object o){
		map.put(key, o);
	}
	String get(String key){
		return (String)map.get(key);
	}
	Dyn getDyn(String key){
		return (Dyn)map.get(key);
	}
	Vector<Dyn> getVec(String key){
		return (Vector<Dyn>)map.get(key);
	}
	String getString(String key){
		return (String)map.get(key);
	}
	int getInt(String key){
		return (Integer)map.get(key);
	}
	void remove(String key){
		map.remove(key);
	}
	
	static Dyn one(ResultSet res) throws SQLException{
		res.next();
		Dyn d = dyn(res);
		res.close();
		return d;
	}
	
	static Dyn dyn(ResultSet res) throws SQLException{
		Dyn dyn = new Dyn();
		ResultSetMetaData meta = res.getMetaData();
		int numcolumns = meta.getColumnCount();
		for(int i = 1; i <= numcolumns; i++){
			dyn.put(meta.getColumnLabel(i), res.getObject(i));
		}
		return dyn;
	}
	
	static Vector<Dyn> list(ResultSet res) throws SQLException{
		Vector<Dyn> vec = new Vector<Dyn>();
		while(res.next()){
			Dyn d = Dyn.dyn(res);
			vec.add(d);
		}
		res.close();
		return vec;
	}
	
	static String toJSON(Object o){
		if(o instanceof String){
			return "\"" + Util.escape((String)o) + "\"";
		}else if(o instanceof Vector){
			Vector v = (Vector)o;
			StringBuffer buf = new StringBuffer();
			for(Object el : v){
				if(buf.length() == 0){
					buf.append("[");
				}else{
					buf.append(",");
				}
				buf.append(toJSON(el));
			}
			buf.append(']');
			return buf.toString();				
		}else if(o instanceof Dyn){
			Dyn d = (Dyn)o;
			Set<String> keys = d.map.keySet();
			StringBuffer buf = new StringBuffer();
			for(String key : keys){
				if(buf.length() == 0){
					buf.append('{');
				}else{
					buf.append(',');
				}
				buf.append("\""+Util.escape(key)+"\"" + ':' + toJSON(d.map.get(key)));
			}
			buf.append('}');			
			return buf.toString();
		}else{
			return o.toString();
		}
	}
		
}

public class DataBase {
	Connection con;
	
	public DataBase() throws Exception{
	}
	
	{
		Class.forName("com.mysql.jdbc.Driver");
		con = DriverManager.getConnection(
				"jdbc:mysql://localhost:3306/thinklink",
				"thinklink","thinklink");
	}
	
	private PreparedStatement get_user = con.prepareStatement("SELECT * FROM v2_user WHERE email = ?");
	int getUser(String email) throws SQLException {
		get_user.setString(1,email);
		ResultSet result = get_user.executeQuery();
		if(result.next()){
			return result.getInt(1);
		}else{
			return 0;
		}
	}
	
	private PreparedStatement get_info = con.prepareStatement("SELECT * FROM v2_node WHERE id = ?");
	ResultSet get_info(int id) throws SQLException{
		get_info.setInt(1,id);
		return get_info.executeQuery();
	}
		
	private PreparedStatement get_links_to = con.prepareStatement("SELECT v2_node.id,text,v2_node.type AS type, "+
					"v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link "+
					"WHERE dst=? AND src = v2_node.id");	
	ResultSet getLinksTo(int id) throws SQLException{
		get_links_to.setInt(1,id);
		return get_links_to.executeQuery();
	}
	
	private PreparedStatement get_links_from = con.prepareStatement("SELECT v2_node.id,text,v2_node.type AS type, "+
			"v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link "+
			"WHERE src=? AND dst = v2_node.id");
	ResultSet getLinksFrom(int id) throws SQLException{
		get_links_from.setInt(1,id);
		return get_links_from.executeQuery();
	}
	
	private PreparedStatement get_user_votes = con.prepareStatement(
			"SELECT action from v2_note WHERE node_id = ? AND user_id = ?");
	String getUserVotes(int id, int userid) throws SQLException{
		get_user_votes.setInt(1,id);
		get_user_votes.setInt(2,userid);
		ResultSet res = get_user_votes.executeQuery();
		return res.getString(1);		
	}
	
	Dyn getLinks(int id, int userid) throws SQLException{
		Dyn d = Dyn.one(get_info(id));
		d.put("from",map_links(Dyn.list(getLinksFrom(id))));
		d.put("to",map_links(Dyn.list(getLinksTo(id))));
		if(userid != 0){
			d.put("uservotes",getUserVotes(id,userid));
		}
		return d;
	}
	
	String verb_for_int(int i){
		switch(i){ 
			case 1: return "relates to";
			case 2: return "supports";
			case 3: return "opposes";
			case 4: return "states";
			case 5: return "about";
			case 6: return "refines";
			case 7: return "created by";
		}
		return null;
	}
	
	String type_for_int(int i){
		switch(i){
		case 1: return "topic";
		case 2: return "claim";
		case 3: return "snippet";
		case 4: return "user";
		}
		return null;
	}
	
	Dyn map_type(Dyn d){
		d.put("type",type_for_int(d.getInt(d.getString("type"))));
		return d;
	}
		
	Dyn map_links(Vector<Dyn> links){
		HashMap<String,Vector<Dyn>> hsh = new HashMap<String,Vector<Dyn>>();
		for(Dyn d : links){
			String verb = verb_for_int(d.getInt("linktype"));
			d.remove("linktype");
			if(!hsh.containsKey(verb)){
				hsh.put(verb, new Vector<Dyn>());
			}
			hsh.get(verb).add(d);
		}
		return new Dyn(hsh);
	}
}

