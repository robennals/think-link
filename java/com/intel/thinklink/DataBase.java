package com.intel.thinklink;

import java.net.URLEncoder;
import java.sql.Array;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Set;
import java.util.Vector;

class JSONString{
	String s;
	JSONString(String s){
		this.s = s;
	}
}

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
	void putJSON(String key, String s){
		map.put(key, new JSONString(s));
	}
	void setJSON(String key){
		putJSON(key,getString(key));
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
			if(v.size() == 0) return "[]";
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
		}else if(o instanceof JSONString){
			JSONString js = (JSONString)o;
			if(js.s != null && js.s.length() != 0){
				return ((JSONString) o).s;
			}else{
				return "{}";
			}
		}else if(o instanceof Dyn){
			Dyn d = (Dyn)o;
			Set<String> keys = d.map.keySet();
			if(keys.size() == 0) return "{}";
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
	
	String toJSON(){
		return toJSON(this);
	}
}

/** really simple connection pool that just grows on demand */
class ConnectionPool{
	static Vector<DataBase> pool = new Vector<DataBase>();
	public static synchronized DataBase get() throws Exception{
		if(pool.size() == 0){
			return new DataBase();
		}else{
			DataBase el = pool.lastElement();
			pool.remove(pool.size() - 1);
			return el;
		}
	}
	public static synchronized void release(DataBase d){
		pool.add(d);
	}
}

public class DataBase {
	Connection con;
	
	public DataBase() throws Exception{
	}
	
	{
		Class.forName("com.mysql.jdbc.Driver");
		con = DriverManager.getConnection(
				"jdbc:mysql://localhost:3306/thinklink?autoReconnect=true",
				"thinklink","thinklink");
	}
	
	private PreparedStatement node_for_text = con.prepareStatement(
			"SELECT id FROM v2_node WHERE text = ?");
	int nodeForText(String text) throws SQLException {
		node_for_text.setString(1, text);
		ResultSet result = node_for_text.executeQuery();
		if(result.next()){
			return result.getInt(1);
		}else{
			return 0;
		}
	}
	
	private PreparedStatement get_user = con.prepareStatement("SELECT node_id,password FROM v2_user WHERE email = ?");
	int getUser(String email, String password) throws SQLException {
		get_user.setString(1,email);
		ResultSet result = get_user.executeQuery();
		if(result.next() && result.getString(2).equals(password)){
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
					"WHERE dst=? AND src = v2_node.id LIMIT ?");	
	ResultSet getLinksTo(int id) throws SQLException{
		get_links_to.setInt(1,id);
		get_links_to.setInt(2,10);
		return get_links_to.executeQuery();
	}
	
	private PreparedStatement get_links_from = con.prepareStatement("SELECT v2_node.id,text,v2_node.type AS type, "+
			"v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link "+
			"WHERE src=? AND dst = v2_node.id LIMIT ?");
	ResultSet getLinksFrom(int id) throws SQLException{
		get_links_from.setInt(1,id);
		get_links_from.setInt(2,10);
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
	
	private PreparedStatement get_recent = con.prepareStatement(
			"SELECT v2_node.* FROM v2_node, v2_history "+
			"WHERE v2_node.id = v2_history.node_id AND v2_history.user_id = ? LIMIT 100");
	Dyn getRecent(int userid) throws SQLException{
		get_recent.setInt(1, userid);
		ResultSet items = get_recent.executeQuery();
		return makeObject("recent","History of Recent Browsing","recent",items);
	}
	
	private PreparedStatement get_newsnips = con.prepareStatement(
			"SELECT v2_node.* FROM v2_node, v2_newsnips "+
			"WHERE v2_node.id = v2_newsnips.node_id "+
			"AND v2_newsnips.user_id = ? ORDER BY id DESC LIMIT 100");
	Dyn getNewSnips(int userid) throws SQLException{
		get_newsnips.setInt(1, userid);
		ResultSet items = get_newsnips.executeQuery();
		return makeObject("newsnips","Your Unfiled Snippets","newsnips",items);
	}
	
	private PreparedStatement search_stmt = con.prepareStatement(
			"SELECT * FROM v2_node WHERE MATCH(text) AGAINST(?) LIMIT 100");
	Dyn search(String query) throws SQLException{
		search_stmt.setString(1, query);
		ResultSet items = search_stmt.executeQuery();
		return makeObject("search?query="+URLEncoder.encode(query),"Search Results for "+query,"search",items); 
	}
	
	private PreparedStatement url_snippets = con.prepareStatement(
			"SELECT v2_node.* FROM v2_node, v2_snippet WHERE "+
			"v2_snippet.node_id = v2_node.id AND v2_snippet.url_prefix IN (?,?,?,?,?,?,?,?)");
	Vector<Dyn> urlSnippets(Vector<String> urls) throws SQLException{
		for(int i = 0; i < 8; i++){
			if(urls.size() > i){
				url_snippets.setString(i+1, urls.get(i));
			}else{
				url_snippets.setString(i+1, null);
			}
		}
		ResultSet items = url_snippets.executeQuery();
		return Dyn.list(items);
	}
	
	private PreparedStatement add_node = con.prepareStatement(
			"INSERT INTO v2_node (text,user_id,type,info,opposed,avg_order) VALUES (?,?,?,?,0,'')",
			Statement.RETURN_GENERATED_KEYS);
	int addNode(String text,int user_id,int type,String info) throws SQLException{
		add_node.setString(1,text);
		add_node.setInt(2, user_id);
		add_node.setInt(3, type);
		add_node.setString(4,info);
		return execWithKey(add_node);
	}
	
	private PreparedStatement add_snippet = con.prepareStatement(
		"INSERT INTO v2_snippet (url_prefix,node_id,page_text) VALUES (?,?,?)");
	private PreparedStatement add_newsnip = con.prepareStatement(
		"INSERT INTO v2_newsnips (user_id,node_id) VALUES (?,?)");
	void addSnippet(int userid, String text, String url, String realurl, String title, String pagetext) throws SQLException{
		Dyn info = new Dyn();
		info.put("title", title);
		info.put("url",url);
		info.put("realurl",realurl);
		int nodeid = addNode(text,userid,SNIPPET,Dyn.toJSON(info));

		if(pagetext == null){
			pagetext = "";
		}
		
		add_snippet.setString(1,url);
		add_snippet.setInt(2,nodeid);
		add_snippet.setString(3,pagetext);
		add_snippet.executeUpdate();
		
		add_newsnip.setInt(1,userid);
		add_newsnip.setInt(2,nodeid);
		add_newsnip.executeUpdate();
	}

	private PreparedStatement add_link = con.prepareStatement(
			"INSERT INTO v2_link (src,dst,type) VALUES (?,?,?))");
	void addLink(int src, int dst, int type) throws SQLException{
		add_link.setInt(1,src);
		add_link.setInt(2,dst);
		add_link.setInt(3,type);
		add_link.executeUpdate();
	}
	
	static final int NOTHING = 0;
	static final int GOOD = 1;
	static final int BAD = 2;
	
	private PreparedStatement set_vote = con.prepareStatement(
			"INSERT INTO v2_vote (user_id,node_id,subnode_id,action) VALUES (?,?,?,?)");
	void setVote(int userid,int nodeid,int subnodeid, int action) throws SQLException{
		set_vote.setInt(1, userid);
		set_vote.setInt(2, nodeid);
		set_vote.setInt(3, subnodeid);
		set_vote.setInt(4, action);
		set_vote.executeUpdate();
	}

	private PreparedStatement get_snippet = con.prepareStatement(
			"SELECT * FROM v2_node, v2_snippet WHERE "+
			"v2_node.id = v2_snippet.node_id AND v2_node.id = ?");
	Dyn getSnippet(int id) throws SQLException{
		get_snippet.setInt(1,id);
		return Dyn.one(get_snippet.executeQuery());
	}
			
	Dyn makeObject(String id, String text, String type, ResultSet children) throws SQLException{
		Dyn tomap = new Dyn();
		tomap.put("colitem", map_types(Dyn.list(children)));

		Dyn d = new Dyn();
		d.put("id", id);
		d.put("text", text);
		d.put("type", type);
		d.put("from", new Vector());	
		d.put("to", tomap);
		return d;
	}

	private int execWithKey(PreparedStatement stmt) throws SQLException{
		stmt.execute();
		ResultSet keys = stmt.getGeneratedKeys();
		keys.next();
		int key = keys.getInt(1);
		keys.close();
		return key;
	}
	
	Dyn getLinks(int id, int userid) throws SQLException{
		Dyn d = Dyn.one(get_info(id));
		map_info(d);
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
	
	static final int TOPIC = 1;
	static final int CLAIM = 2;
	static final int SNIPPET = 3;
	static final int USER = 4;
	
	String type_for_int(int i){
		switch(i){
		case 1: return "topic";
		case 2: return "claim";
		case 3: return "snippet";
		case 4: return "user";
		}
		return null;
	}
	
	Dyn map_info(Dyn d){
		d.put("type",type_for_int(d.getInt("type")));
		d.setJSON("info");
		return d;
	}
	
	Vector<Dyn> map_types(Vector<Dyn> els){
		for(Dyn d : els){
			map_info(d);
		}
		return els;
	}
		
	Dyn map_links(Vector<Dyn> links){
		HashMap<String,Vector<Dyn>> hsh = new HashMap<String,Vector<Dyn>>();
		for(Dyn d : links){
			String verb = verb_for_int(d.getInt("linktype"));
			d.remove("linktype");
			if(!hsh.containsKey(verb)){
				hsh.put(verb, new Vector<Dyn>());
			}
			map_info(d);
			hsh.get(verb).add(d);
		}
		return new Dyn(hsh);
	}
}

