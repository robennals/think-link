package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

public class Wikiprocess {

	static Pattern wordpat = Pattern.compile("[^\\w]+");
	
//	static String wikifile = "/home/rob/Reference/Wikipedia/wikipedia_small.xml";
	
	static String wikifile = "/home/rob/Reference/Wikipedia/enwiki-20081008-pages-articles.xml";
	static String pruneprefix = "/home/rob/Reference/Wikipedia/namepruned/";
	static String outfile = "/home/rob/Reference/Wikipedia/java_wordfreqs_once";
	
	public static HashMap<String,Integer> loadWords() throws Exception{
		HashMap<String,Integer> h = new HashMap<String,Integer>();
		
		String letters = "0123456789abcdefghijklmnopqrstuvwxyz";
		for(int i = 0; i < letters.length(); i++){
			char x = letters.charAt(i);
			System.out.println("reading words: "+x);
			BufferedReader reader = new BufferedReader(
						new InputStreamReader(
								new FileInputStream(pruneprefix+x)
						));
			String line;
			while((line = reader.readLine()) != null){
				int colonidx = line.indexOf(':');
				String name = line.substring(0,colonidx);
				String[] words = wordpat.split(name);
				for(int length = 1; length <= words.length; length++){
					StringBuffer prefix = new StringBuffer();
					for(int j = 0; j < length; j++){
						if(j != 0){
							prefix.append(" ");
						}
						prefix.append(words[j]);
					}
					h.put(prefix.toString(), 0);
				}
			}			
			reader.close();
		}
		return h;
	}
	
	public static void printWords(HashMap<String,Integer> hash) throws Exception{
		BufferedWriter writer = new BufferedWriter(
					new OutputStreamWriter(
							new FileOutputStream(outfile)));
		Set<String> keys = hash.keySet();
		for(String k : keys){
			writer.append(k+":"+hash.get(k)+"\n");
		}
		writer.close();
	}
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub

		int linecount = 0;
		
		
		try{
			BufferedReader reader = new BufferedReader(
					new InputStreamReader(
							new FileInputStream(wikifile))
					);
			String line;
			HashMap<String,Integer> h = loadWords();
			Set<String> done = new HashSet<String>();
			boolean inbody = false;
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
				String[] words = wordpat.split(line);
				for(int start = 0; start < words.length; start++){
					for(int length = 1; length <= words.length - start; length++){
						StringBuffer prefix = new StringBuffer();
						for(int i = start; i < start + length; i++){
							if(i != start){
								prefix.append(" ");
							}
							prefix.append(words[i]);
						}
						String p = prefix.toString();
						if(h.containsKey(p)){
							if(!done.contains(p)){
								int val = h.get(p);
								h.put(p,val+1);								
								done.add(p);
							}
						}else{
							break;
						}
					}
				}
				linecount++;
				if(linecount % 10000 == 0){
					System.out.println("reading wiki:"+linecount);
				}
			}
			
			printWords(h);
		}catch(Exception e){
			System.out.println(e);
		}
	}

}
