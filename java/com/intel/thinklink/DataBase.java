package com.intel.thinklink;

import java.net.URLEncoder;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Vector;

class JSONString{
	String s;
	JSONString(String s){
		this.s = s;
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
	Dyn get_info(int id,int userid) throws SQLException{
		get_info.setInt(1,id);		
		Dyn node = Dyn.one(get_info.executeQuery());
		node.setJSON("info");
		logRecent(userid,id);
		return node;
	}
	Dyn getInfo(int id) throws SQLException{
		get_info.setInt(1,id);		
		Dyn node = Dyn.one(get_info.executeQuery());
		node.setJSON("info");
		return node;
	}

	private PreparedStatement find_by_name = con.prepareStatement(
	"SELECT id FROM v2_node WHERE text = ?");
	public int findByName(String name) throws SQLException {
		find_by_name.setString(1,name);
		ResultSet result = find_by_name.executeQuery();
		if(result.next()){
			return result.getInt(1);
		}else{
			return 0;
		}
	}


	private PreparedStatement get_links_to = con.prepareStatement("SELECT v2_node.id,text,opposed,info,v2_node.type AS type, "+
					"v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link "+
					"WHERE dst=? AND src = v2_node.id LIMIT ?");	
	ResultSet getLinksTo(int id) throws SQLException{
		get_links_to.setInt(1,id);
		get_links_to.setInt(2,1000);
		return get_links_to.executeQuery();
	}

	private PreparedStatement get_some_links_to = con.prepareStatement("SELECT v2_node.id,text,opposed,info,v2_node.type AS type, "+
			"v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link "+
			"WHERE dst=? AND src = v2_node.id "+
			"AND v2_node.type = ? AND v2_link.type = ? "+
			"LIMIT ?");	
	ResultSet getSomeLinksTo(int id,String nodetype, String verb,int count) throws SQLException{
		get_some_links_to.setInt(1,id);
		get_some_links_to.setString(2,nodetype);
		get_some_links_to.setString(3,verb);
		get_some_links_to.setInt(4,count);
		return get_some_links_to.executeQuery();
	}

	private PreparedStatement get_some_links_from = con.prepareStatement("SELECT v2_node.id,text,opposed,info,v2_node.type AS type, "+
			"v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link "+
			"WHERE src=? AND dst = v2_node.id "+
			"AND v2_node.type = ? AND v2_link.type = ? "+
			"LIMIT ?");	
	ResultSet getSomeLinksFrom(int id,String nodetype, String verb,int count) throws SQLException{
		get_some_links_from.setInt(1,id);
		get_some_links_from.setString(2,nodetype);
		get_some_links_from.setString(3,verb);
		get_some_links_from.setInt(4,count);
		return get_some_links_from.executeQuery();
	}
	
	private PreparedStatement get_links_from = con.prepareStatement("SELECT v2_node.id,text,opposed,info,v2_node.type AS type, "+
			"v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link "+
			"WHERE src=? AND dst = v2_node.id LIMIT ?");
	ResultSet getLinksFrom(int id) throws SQLException{
		get_links_from.setInt(1,id);
		get_links_from.setInt(2,1000);
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
			"WHERE v2_node.id = v2_history.node_id " +
			"   AND v2_node.type != 'snippet' " +
			"	AND v2_history.user_id = ? ORDER BY date DESC " +
			" 	LIMIT 100");
	Dyn getRecent(int userid) throws SQLException{
		get_recent.setInt(1, userid);
		ResultSet items = get_recent.executeQuery();
		return makeObject("recent.js","History of Recent Browsing","recent",items);
	}
	
	private PreparedStatement log_recent = con.prepareStatement(
			"INSERT DELAYED INTO v2_history (user_id,node_id,date) VALUES (?,?,CURRENT_TIMESTAMP)");
	void logRecent(int userid, int nodeid) throws SQLException{
		log_recent.setInt(1, userid);
		log_recent.setInt(2, nodeid);
		log_recent.executeUpdate();
	}
	
	private PreparedStatement get_newsnips = con.prepareStatement(
			"SELECT v2_node.* FROM v2_node, v2_newsnips "+
			"WHERE v2_node.id = v2_newsnips.node_id "+
			"AND v2_newsnips.user_id = ? ORDER BY id DESC LIMIT 100");
	Dyn getNewSnips(int userid) throws SQLException{
		get_newsnips.setInt(1, userid);
		ResultSet items = get_newsnips.executeQuery();
		return makeObject("newsnips.js","Your Unfiled Snippets","newsnips",items);
	}
	
	private PreparedStatement search_stmt = con.prepareStatement(
			"SELECT * FROM v2_node WHERE MATCH(text) AGAINST(?) AND (type='claim' OR type='topic') LIMIT 100");
	Dyn search(String query) throws SQLException{
		search_stmt.setString(1, query);
		ResultSet items = search_stmt.executeQuery();
		return makeObject("search.js?query="+URLEncoder.encode(query),"Search Results for "+query,"search",items); 
	}

	private PreparedStatement search_type_stmt = con.prepareStatement(
	"SELECT * FROM v2_node WHERE MATCH(text) AGAINST(?) AND type=? LIMIT 10");
	Dyn search(String query,String type) throws SQLException{
		if(type == null){
			return search(query);
		}
		search_type_stmt.setString(1, query);
		search_type_stmt.setString(2,type);
		ResultSet items = search_type_stmt.executeQuery();
		return makeObject("search.js?query="+URLEncoder.encode(query),"Search Results for "+query,"search",items); 
	}

	private PreparedStatement url_claim_snippets = con.prepareStatement(
	"SELECT snip.id,snip.text,claim.opposed,snip.user_id,claim.id AS claimid,claim.text AS claimtext "+
		"FROM ((v2_snippet LEFT JOIN v2_link ON v2_snippet.node_id = v2_link.src) "+
		"LEFT JOIN v2_node AS claim ON claim.id = dst) "+
		"LEFT JOIN v2_node AS snip ON snip.id = v2_snippet.node_id " +
		"WHERE url_prefix IN (?,?,?,?,?,?,?,?) "
	);
	Vector<Dyn> urlClaimSnippets(Vector<String> urls) throws SQLException{	
		for(int i = 0; i < 8; i++){
			if(urls.size() > i){
				url_claim_snippets.setString(i+1, urls.get(i));
			}else{
				url_claim_snippets.setString(i+1, null);
			}
		}
		ResultSet items = url_claim_snippets.executeQuery();
		return Dyn.list(items);
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
	int addNode(String text,int user_id,String type,String info) throws SQLException{
		add_node.setString(1,text);
		add_node.setInt(2, user_id);
		add_node.setString(3, type);
		add_node.setString(4,info);
		return execWithKey(add_node);
	}
	
	private PreparedStatement add_snippet = con.prepareStatement(
		"INSERT INTO v2_snippet (url_prefix,node_id,page_text) VALUES (?,?,?)");
	private PreparedStatement add_newsnip = con.prepareStatement(
		"INSERT INTO v2_newsnips (user_id,node_id) VALUES (?,?)");
	int addSnippet(int userid, String text, String url, String realurl, String title, String pagetext) throws SQLException{
		Dyn info = new Dyn();
		info.put("title", title);
		info.put("url",url);
		info.put("realurl",realurl);
		int nodeid = addNode(text,userid,"snippet",Dyn.toJSON(info));

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
		
		return nodeid;
	}
	
	private PreparedStatement update_opposed_on = con.prepareStatement(
	 "UPDATE v2_node SET opposed = true WHERE id IN (SELECT DISTINCT (dst) FROM `v2_link` WHERE TYPE = 'opposes')");
	private PreparedStatement update_opposed_off = con.prepareStatement(
	 "UPDATE v2_node SET opposed = false WHERE NOT id IN (SELECT DISTINCT (dst) FROM `v2_link` WHERE TYPE = 'opposes')");
	void updateOpposed() throws SQLException{
		update_opposed_on.executeUpdate();
		update_opposed_off.executeUpdate();
	}
	
	private PreparedStatement set_opposed = con.prepareStatement(
			"UPDATE v2_node SET opposed = ? WHERE id = ?");
	void setOpposed(int id, boolean val) throws SQLException {
		set_opposed.setBoolean(1, val);
		set_opposed.setInt(2,id);
		set_opposed.executeUpdate();
	}
	
	private PreparedStatement add_link = con.prepareStatement(
			"INSERT INTO v2_link (src,dst,type) VALUES (?,?,?)");
	void addLink(int src, int dst, String verb) throws SQLException{
		add_link.setInt(1,src);
		add_link.setInt(2,dst);
		add_link.setString(3,verb);
		add_link.executeUpdate();
		if(verb.equals("opposes")){
			setOpposed(dst,true);
		}
	}
	
	
	public void addLink(int id, String verb, String text, String type,int userid) throws SQLException {
		int dst = findByName(text);
		if(dst == 0){
			dst = addNode(text,userid,type,"");
		}
		addLink(id,dst,verb);		
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
		tomap.put("colitem", Dyn.list(children,"info"));
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
	

//	Dyn getLinks(int id, int userid) throws SQLException{
//		Dyn d = get_info(id,userid);
//		String type = d.getString("type");
//		Dyn to = new Dyn();
//		Dyn from = new Dyn();
//		d.put("to",to);
//		d.put("from", from);
//		if(type.equals("claim")){
//			from.put("supports", Dyn.list(getSomeLinksFrom(id,"claim","supports",5)));
//			from.put("opposes", Dyn.list(getSomeLinksFrom(id,"claim","opposes",5)));
//			from.put("about", Dyn.list(getSomeLinksFrom(id,"topic","relates to",5)));
//			to.put("supports", Dyn.list(getSomeLinksTo(id,"claim","supports",5)));
//			to.put("opposes", Dyn.list(getSomeLinksTo(id,"claim","opposes",5)));
//			to.put("prosnips", Dyn.list(getSomeLinksTo(id,"snippet","supports",5)));
//			to.put("consnips", Dyn.list(getSomeLinksTo(id,"snippet","opposes",5)));			
//			to.put("aboutsnips", Dyn.list(getSomeLinksTo(id,"snippet","relates to",5)));			
//		}else if(type.equals("snippet")){
//			from.put("prosnips", Dyn.list(getSomeLinksFrom(id,"snippet","supports",5)));
//			from.put("consnips", Dyn.list(getSomeLinksFrom(id,"snippet","opposes",5)));			
//			from.put("aboutsnip", Dyn.list(getSomeLinksFrom(id,"snippet","relates to",5)));			
//		}
//		return d;
//	}
	
	Dyn getLinks(int id, int userid) throws SQLException{
		Dyn d = get_info(id,userid);
		d.put("from",map_links(Dyn.list(getLinksFrom(id))));
		d.put("to",map_links(Dyn.list(getLinksTo(id))));
		if(userid != 0){
			d.put("uservotes",getUserVotes(id,userid));
		}
		return d;
	}
	Dyn map_links(Vector<Dyn> links){
		HashMap<String,Vector<Dyn>> hsh = new HashMap<String,Vector<Dyn>>();
		for(Dyn d : links){
			String verb = d.getString("linktype");
			if(!hsh.containsKey(verb)){
				hsh.put(verb, new Vector<Dyn>());
			}
			d.setJSON("info");
			hsh.get(verb).add(d);
		}
		return new Dyn(hsh);
	}

	
}

