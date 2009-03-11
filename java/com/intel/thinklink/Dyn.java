package com.intel.thinklink;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Set;
import java.util.Vector;

/**
 * Dyn is not efficient. Replace with static stuff when it matters.
 * @author rob
 *
 */
public class Dyn{
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
	
	static Vector<Dyn> list(ResultSet res, String jsonfield) throws SQLException{
		Vector<Dyn> vec = new Vector<Dyn>();
		while(res.next()){
			Dyn d = Dyn.dyn(res);
			if(jsonfield != null){
				d.setJSON(jsonfield);
			}
			vec.add(d);
		}
		res.close();
		return vec;
	}
	
	static Vector<Dyn> list(ResultSet res) throws SQLException{
		return list(res,null);
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
