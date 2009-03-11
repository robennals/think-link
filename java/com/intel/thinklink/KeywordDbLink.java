package com.intel.thinklink;

import java.io.BufferedWriter;
import java.util.HashMap;
import java.util.Set;


public class KeywordDbLink {
	static String prefix = "/home/rob/Reference/Wikipedia/";
	static String outfile = prefix+"keyword_dblinks";
	
	public static void main(String[] args){
		DataBase base = null;
		int count = 0;
		try{
			base = ConnectionPool.get();
			System.out.println("loading keywords");
			BufferedWriter w = Util.openOutFile(outfile);
			HashMap<String,WikiMatch[]> keywordmap = WikiMatcher.loadMatchers();

			System.out.println("linking to database");
			Set<String> keyset = keywordmap.keySet();
			for(String key : keyset){
				WikiMatch[] matches = keywordmap.get(key);
				for(int i = 0; i < matches.length; i++){
					WikiMatch match = matches[i];
					int nodeid = base.nodeForText(match.target);
					if(nodeid != 0){
						w.append(key+"\t"+nodeid+"\t"+match.score+"\n");
					}
					if(count++ % 1000 == 0){
						System.out.println(count);
					}
				}
			}		
			w.close();
			System.out.println("done");
		}catch(Exception e){
			e.printStackTrace();
			if(base != null){
				ConnectionPool.release(base);
			}
		}
	}
}
