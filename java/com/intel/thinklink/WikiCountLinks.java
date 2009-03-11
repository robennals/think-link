package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class WikiCountLinks {

//	static String wikifile = "/home/rob/Reference/Wikipedia/wikipedia_small.xml";
	static String wikifile = "/home/rob/Reference/Wikipedia/enwiki-20081008-pages-articles.xml";
	static String outfile = "/home/rob/Reference/Wikipedia/java_countlinks";
	static Pattern wordpat = Pattern.compile("[^\\w]+");
	
	static Pattern linkpat = Pattern.compile("\\[\\[([^\\]\\|]+)(\\|[^\\]]+)?]\\]");
	
	public static Pattern mkPattern(String s){
		return Pattern.compile(s.replace("/", "\\"));
	}
	
	public static void printWords(HashMap<String,Integer> hash) throws Exception{
		BufferedWriter writer = new BufferedWriter(
					new OutputStreamWriter(
							new FileOutputStream(outfile)));
		Set<String> keys = hash.keySet();
		for(String k : keys){
			int val = hash.get(k);
			if(val > 10){
				writer.append(k+":"+hash.get(k)+"\n");
			}
		}
		writer.close();
	}
		
	public static String unsplit(String[] words){
		int length = words.length;
		StringBuffer buf = new StringBuffer();
		for(int j = 0; j < length; j++){
			if(j != 0){
				buf.append(" ");
			}
			buf.append(words[j]);
		}
		return buf.toString();
	}
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		int linecount = 0;
				
		try{
			HashMap<String,Integer> links = new HashMap<String,Integer>();
			BufferedReader reader = Util.openInFile(wikifile);
			HashSet<String> done = new HashSet<String>();
			
			boolean inbody = false;
			String line;
			while((line = reader.readLine()) != null){
				if(line.contains("<text")){
					inbody = true;
				}
				if(line.contains("</text")){
					inbody = false;
				}				
				if(line.contains("<title")){
					done.clear();
				}
				if(!inbody) continue;
				Matcher m = linkpat.matcher(line);
				while(m.find()){
					String name; String target;
					if(m.group(2) != null){
						name = m.group(2).substring(1);
						target = m.group(1);
					}else{
						name = m.group(1);
						target = "Y";
					}
					if(name.contains(":") || target.contains(":")){
						continue;
					}
					String[] namewords = wordpat.split(name);
					name = unsplit(namewords);
					String key = name+"->"+target;
					if(!done.contains(key)){
						if(!links.containsKey(key)){
							links.put(key, 1);
						}else{
							links.put(key,links.get(key)+1);
						}
						done.add(key);
					}
				}
				
				linecount++;
				if(linecount % 10000 == 0){
					System.out.println("reading wiki:"+linecount);
				}
			}
			
			printWords(links);
		}catch(Exception e){
			System.out.println(e);
		}
	}

}
