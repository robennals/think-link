package com.intel.thinklink;

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
	public int nodeForText(String text) throws SQLException {
		node_for_text.setString(1, text);
		ResultSet result = node_for_text.executeQuery();
		if(result.next()){
			return result.getInt(1);
		}else{
			return 0;
		}
	}
	
	private PreparedStatement get_user = con.prepareStatement("SELECT node_id,password,name FROM v2_user WHERE email = ?");
	public User getUser(String email, String password) throws SQLException {
		get_user.setString(1,email);
		ResultSet result = get_user.executeQuery();
		if(result.next() && result.getString(2).equals(password)){
			return new User(result.getInt(1),result.getString(3));				
		}else{
			return User.nouser;
		}
	}
	
	private PreparedStatement get_info = con.prepareStatement(
			"SELECT v2_node.*,v2_user.name AS username FROM v2_node,v2_user WHERE id = ? " +
			"AND v2_node.user_id = v2_user.node_id");
	public Dyn getInfo(int id,int userid) throws SQLException{
		get_info.setInt(1,id);		
		Dyn node = Dyn.one(get_info.executeQuery());
		node.setJSON("info");
		if(node.getString("type").equals("snippet")){
			node.put("page_text",getPageText(id));
		}
		logRecent(userid,id);
		return node;
	}
	public Dyn getInfo(int id) throws SQLException{
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


	private PreparedStatement get_links_to = con.prepareStatement(
					"SELECT v2_node.id,text,opposed,agg_votes,info,v2_node.type AS type, "+
					"v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link "+
					"WHERE dst=? AND src = v2_node.id LIMIT ?");	
	public ResultSet getLinksTo(int id) throws SQLException{
		get_links_to.setInt(1,id);
		get_links_to.setInt(2,1000);
		return get_links_to.executeQuery();
	}

	private PreparedStatement get_some_links_to = con.prepareStatement("SELECT v2_node.id,text,opposed,info,v2_node.type AS type, "+
			"v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link "+
			"WHERE dst=? AND src = v2_node.id "+
			"AND v2_node.type = ? AND v2_link.type = ? "+
			"LIMIT ?");	
	public ResultSet getSomeLinksTo(int id,String nodetype, String verb,int count) throws SQLException{
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
	public ResultSet getSomeLinksFrom(int id,String nodetype, String verb,int count) throws SQLException{
		get_some_links_from.setInt(1,id);
		get_some_links_from.setString(2,nodetype);
		get_some_links_from.setString(3,verb);
		get_some_links_from.setInt(4,count);
		return get_some_links_from.executeQuery();
	}
	
	private PreparedStatement get_links_from = con.prepareStatement(
			"SELECT v2_node.id,text,opposed,agg_votes,info,v2_node.type AS type, "+
			"v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link "+
			"WHERE src=? AND dst = v2_node.id LIMIT ?");
	public ResultSet getLinksFrom(int id) throws SQLException{
		get_links_from.setInt(1,id);
		get_links_from.setInt(2,1000);
		return get_links_from.executeQuery();
	}
	
	private PreparedStatement get_user_votes = con.prepareStatement(
			"SELECT link_id,vote from v2_vote WHERE node_id = ? AND user_id = ?");
	public Vector<Dyn> getUserVotes(int id, int userid) throws SQLException{
		get_user_votes.setInt(1,id);
		get_user_votes.setInt(2,userid);
		return Dyn.list(get_user_votes.executeQuery());		
	}
	
	private PreparedStatement get_recent = con.prepareStatement(
			"SELECT v2_node.* FROM v2_node, v2_history "+
			"WHERE v2_node.id = v2_history.node_id " +
			"   AND v2_node.type != 'snippet' " +
			"	AND v2_history.user_id = ? ORDER BY date DESC " +
			" 	LIMIT 100");
	public Dyn getRecent(int userid) throws SQLException{
		get_recent.setInt(1, userid);
		ResultSet items = get_recent.executeQuery();
		return makeObject("recent.js","History of Recent Browsing","recent",items);
	}

	private PreparedStatement get_typed_recent = con.prepareStatement(
			"SELECT v2_node.* FROM v2_node, v2_history "+
			"WHERE v2_node.id = v2_history.node_id " +
			"   AND v2_node.type = ? " +
			"	AND v2_history.user_id = ? ORDER BY date DESC " +
			" 	LIMIT 15");
	public Dyn getRecent(int userid, String type) throws SQLException{
		if(type == null){
			return getRecent(userid);
		}
		get_typed_recent.setString(1,type);
		get_typed_recent.setInt(2, userid);
		ResultSet items = get_typed_recent.executeQuery();
		return makeObject("recent.js","History of Recent Browsing","recent",items);
	}
	
	private PreparedStatement get_hot = con.prepareStatement(
			"SELECT v2_node.*, COUNT(v2_history.user_id) AS count FROM v2_node, v2_history " +
			"WHERE DATE_ADD(date,INTERVAL 7 DAY) > CURRENT_DATE() " +
			"AND v2_node.id = v2_history.node_id " +
			"AND v2_node.type != 'snippet' "+
			"GROUP BY node_id ORDER BY count DESC " +
			"LIMIT 50");
	public Dyn getHot() throws SQLException{
		ResultSet items = get_hot.executeQuery();
		return makeObject("hot.js","Hot topics and claims","hot",items);
	}	
	
	private PreparedStatement log_recent = con.prepareStatement(
			"REPLACE DELAYED INTO v2_history (user_id,node_id,date) VALUES (?,?,CURRENT_TIMESTAMP)");
	public void logRecent(int userid, int nodeid) throws SQLException{
		log_recent.setInt(1, userid);
		log_recent.setInt(2, nodeid);
		log_recent.executeUpdate();
	}
	
	private PreparedStatement get_newsnips = con.prepareStatement(
			"SELECT v2_node.* FROM v2_node, v2_newsnips "+
			"WHERE v2_node.id = v2_newsnips.node_id "+
			"AND v2_newsnips.user_id = ? ORDER BY id DESC LIMIT 100");
	public Dyn getNewSnips(int userid) throws SQLException{
		get_newsnips.setInt(1, userid);
		ResultSet items = get_newsnips.executeQuery();
		return makeObject("newsnips.js","Your Unfiled Snippets","newsnips",items);
	}
	
	private PreparedStatement search_stmt = con.prepareStatement(
			"SELECT * FROM v2_node WHERE MATCH(text) AGAINST(?) AND (type='claim' OR type='topic') LIMIT 100");
	public Dyn search(String query) throws SQLException{
		search_stmt.setString(1, query);
		ResultSet items = search_stmt.executeQuery();
		return makeObject("search.js?query="+Util.urlEncode(query),"Search Results for "+query,"search",items); 
	}

	private PreparedStatement search_type_stmt = con.prepareStatement(
	"SELECT * FROM v2_node WHERE MATCH(text) AGAINST(?) AND type=? LIMIT 10");
	public Dyn search(String query,String type,int userid) throws SQLException{
		if(type == null){
			return search(query);
		}
		if(type.equals("snippet")){
			return searchSnippets(query,userid);
		}

		search_type_stmt.setString(1, query);
		search_type_stmt.setString(2,type);
		ResultSet items = search_type_stmt.executeQuery();
		return makeObject("search.js?query="+Util.urlEncode(query),"Search Results for "+query,"search",items); 
	}
	
	private PreparedStatement search_snippet = con.prepareStatement(
		"SELECT * FROM v2_node, v2_newsnips " +
		"WHERE MATCH(text) AGAINST(?) " +
		"AND v2_newsnips.user_id = ? " + // only suggest our own snippets
		"AND v2_node.id = v2_newsnips.node_id " + // only suggest unattached snippets
		"AND type='snippet'");
	public Dyn searchSnippets(String query,int userid) throws SQLException{
		search_snippet.setString(1,query);
		search_snippet.setInt(2,userid);
		ResultSet items = search_snippet.executeQuery();
		return makeObject("search.js?query="+Util.urlEncode(query)+"&type=snippet","Search Results for "+query,"search",items);
	}
	
	private PreparedStatement search_linkto_stmt = con.prepareStatement(
	"SELECT v2_node.*,v2_link.type AS verb FROM v2_node " +
	"LEFT JOIN ON src = v2_node.id AND dst = ? " +
	"WHERE MATCH(text) AGAINST(?) AND type=? LIMIT 10");
	public Dyn searchLinkto(String query,int dst, String type) throws SQLException{
		if(type == null){
			return search(query);
		}
		search_linkto_stmt.setInt(1, dst);
		search_linkto_stmt.setString(2, query);
		search_linkto_stmt.setString(3,type);
		ResultSet items = search_linkto_stmt.executeQuery();
		return makeObject("search.js?query="+Util.urlEncode(query),"Search Results for "+query,"search",items); 
	}

	private PreparedStatement search_linkfrom_stmt = con.prepareStatement(
			"SELECT v2_node.*,v2_link.type AS verb FROM v2_node " +
			"LEFT JOIN ON src = v2_node.id AND dst = ? " +
			"WHERE MATCH(text) AGAINST(?) AND type=? LIMIT 10");
	public Dyn searchLinkfrom(String query,int dst, String type) throws SQLException{
		if(type == null){
			return search(query);
		}
		search_linkfrom_stmt.setInt(1, dst);
		search_linkfrom_stmt.setString(2, query);
		search_linkfrom_stmt.setString(3,type);
		ResultSet items = search_linkfrom_stmt.executeQuery();
		return makeObject("search.js?query="+Util.urlEncode(query),"Search Results for "+query,"search",items); 
	}
	
	private PreparedStatement url_claim_snippets = con.prepareStatement(
	"SELECT snip.id,snip.text,claim.opposed,snip.user_id,claim.id AS claimid,claim.text AS claimtext "+
		"FROM ((v2_snippet LEFT JOIN v2_link ON v2_snippet.node_id = v2_link.src) "+
		"LEFT JOIN v2_node AS claim ON claim.id = dst) "+
		"LEFT JOIN v2_node AS snip ON snip.id = v2_snippet.node_id " +
		"WHERE url_prefix IN (?,?,?,?,?,?,?,?) "
	);
	public Vector<Dyn> urlClaimSnippets(Vector<String> urls) throws SQLException{	
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
	public Vector<Dyn> urlSnippets(Vector<String> urls) throws SQLException{
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
	public int addNode(String text,int user_id,String type,String info) throws SQLException{
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
	public int addSnippet(int userid, String text, String url, String realurl, String title, String pagetext) throws SQLException{
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
	public void updateOpposed() throws SQLException{
		update_opposed_on.executeUpdate();
		update_opposed_off.executeUpdate();
	}
	
	private PreparedStatement set_opposed = con.prepareStatement(
			"UPDATE v2_node SET opposed = ? WHERE id = ?");
	public void setOpposed(int id, boolean val) throws SQLException {
		set_opposed.setBoolean(1, val);
		set_opposed.setInt(2,id);
		set_opposed.executeUpdate();
	}
	
	private PreparedStatement add_link = con.prepareStatement(
			"INSERT INTO v2_link (src,dst,type,user_id) VALUES (?,?,?,?)");
	public void addLink(int src, int dst, String verb, int userid) throws SQLException{
		add_link.setInt(1,src);
		add_link.setInt(2,dst);
		add_link.setString(3,verb);
		add_link.setInt(4,userid);
		add_link.executeUpdate();
		logRecent(src,userid);
		logRecent(dst,userid);
		if(verb.equals("opposes")){
			setOpposed(dst,true);
		}
	}
	
	private PreparedStatement set_vote = con.prepareStatement(
			"REPLACE INTO v2_vote (user_id,node_id,link_id,vote) VALUES (?,?,?,?)");
	public void setVote(int nodeid, int linkid, int vote, int userid) throws SQLException{
		set_vote.setInt(1,userid);
		set_vote.setInt(2,nodeid);
		set_vote.setInt(3,linkid);
		set_vote.setInt(4,vote);
		set_vote.executeUpdate();
	}
	
	private PreparedStatement  count_votes = con.prepareStatement(
			"SELECT SUM(vote) FROM v2_vote WHERE link_id = 3006");
	public int countVotes(int linkid) throws SQLException{
		count_votes.setInt(1,linkid);
		ResultSet result = count_votes.executeQuery();
		if(result.next()){
			return result.getInt(1);
		}else{
			return 0;
		}
	}
	
	private PreparedStatement update_agg_votes = con.prepareStatement(
			"UPDATE v2_link SET agg_votes = " +
			"	(SELECT SUM(vote) FROM v2_vote WHERE link_id = ?) " +
			"WHERE id = ?");
	public void updateAggVotes(int linkid) throws SQLException {
		update_agg_votes.setInt(1,linkid);
		update_agg_votes.setInt(2,linkid);
		update_agg_votes.executeUpdate();
	}
	
	private PreparedStatement not_new = con.prepareStatement(
			"DELETE FROM v2_newsnips WHERE node_id = ?");
	void notNew(int id) throws SQLException {
		not_new.setInt(1,id);
		not_new.executeUpdate();
	}
	
	public void addLink(int id, String verb, String text, String type,boolean reverse,int userid) throws SQLException {
		int dst = findByName(text);
		if(dst == 0){
			dst = addNode(text,userid,type,"");
		}
		if(reverse){
			addLink(dst,id,verb,userid);					
		}else{
			addLink(id,dst,verb,userid);		
		}
		// TODO: only do this if we know it is a snippet
		notNew(id);
		notNew(dst);
	}

	private PreparedStatement get_snippet = con.prepareStatement(
			"SELECT * FROM v2_node, v2_snippet WHERE "+
			"v2_node.id = v2_snippet.node_id AND v2_node.id = ?");
	Dyn getSnippet(int id) throws SQLException{
		get_snippet.setInt(1,id);
		return Dyn.one(get_snippet.executeQuery());
	}
	
	private PreparedStatement get_page_text = con.prepareStatement(
			"SELECT page_text FROM v2_snippet WHERE node_id = ?");
	String getPageText(int snipid) throws SQLException{
		get_page_text.setInt(1,snipid);
		ResultSet result = get_page_text.executeQuery();
		if(result.next()){
			return result.getString(1);				
		}else{
			return null;
		}
	}
			
	public Dyn makeObject(String id, String text, String type, ResultSet children) throws SQLException{
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
	
	public Dyn getLinks(int id, int userid) throws SQLException{
		Dyn d = getInfo(id,userid);
		d.put("from",map_links(Dyn.list(getLinksFrom(id))));
		d.put("to",map_links(Dyn.list(getLinksTo(id))));
		if(userid != 0){
			d.put("uservotes",getUserVotes(id,userid));
		}
		logRecent(userid,id);
		return d;
	}
	public Dyn map_links(Vector<Dyn> links){
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

