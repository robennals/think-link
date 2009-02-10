package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.Writer;
import java.util.HashMap;
import java.util.Set;

public class WikiApplyRedirects {
	
	static String prefix = "/home/rob/Reference/Wikipedia/";
	static String redirectfile = prefix+"java_redirects";
	static String linkfile = prefix+"java_countlinks";
	static String outfile = prefix+"java_redirectlinks";

	public static HashMap<String,String> loadRedirects() throws Exception{
		HashMap<String,String> h = new HashMap<String,String>();
		BufferedReader reader = WikiKeywordiness.openInFile(redirectfile);
		String line;
		while((line = reader.readLine()) != null){
			int colonidx = line.indexOf("->");
			String name = line.substring(0,colonidx);
			String target = line.substring(colonidx+2);
			h.put(name, target);
		}
		return h;
	}
	
	public static String capfirst(String s){
		return Character.toUpperCase(s.charAt(0))+s.substring(1);
	}
	
	public static HashMap<String,Integer> loadAndMergeLinks(HashMap<String,String> redirects) throws Exception{
		HashMap<String,Integer> linkmap = new HashMap<String,Integer>();
		BufferedReader reader = WikiKeywordiness.openInFile(linkfile);
		String line;
		while((line = reader.readLine()) != null){
			int colonidx = line.indexOf(":");
			int arrowidx = line.indexOf("->");
			String name = line.substring(0,arrowidx);
			String target = line.substring(arrowidx+2,colonidx);
			int count = new Integer(line.substring(colonidx+1));
			if(target.equals("Y")){
				target = name;
			}
			if(target.equals("")){
				continue;
			}
			target = target.replace("_", " ");
			target = capfirst(target);
			
			while(redirects.containsKey(target)){
				String redirect = redirects.get(target);
				if(redirect.contains(":"))
						break;
				target = redirect;
			}
			
			String key = name+"->"+target;
			
			if(linkmap.containsKey(key)){
				linkmap.put(key, linkmap.get(key)+count);
			}else{
				linkmap.put(key, count);
			}
		}
		return linkmap;
	}

	public static void out(String s){
		System.out.println(s);
	}
	
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		try{
			out("loading redirects");
			HashMap<String,String> redirects = loadRedirects();
			out("loading and merging links");
			HashMap<String,Integer> links = loadAndMergeLinks(redirects);
			out("saving");
			Set<String> keys = links.keySet();
			Writer writer = WikiKeywordiness.openOutFile(outfile);
			for(String key : keys){
				writer.append(key+":"+links.get(key)+"\n");
			}
			writer.close();
			out("done");
		}catch(Exception e){
			System.out.println(e);
		}
	}

}
