package com.intel.thinklink;

import java.util.Vector;

/** really simple connection pool that just grows on demand */
public class ConnectionPool{
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

