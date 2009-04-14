package com.intel.thinklink;

import java.io.BufferedReader;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Vector;
import java.util.regex.Pattern;

class LinkMatch {
	String name;
	int targetid;
	Float score;
	
	public LinkMatch clone(){
		LinkMatch c = new LinkMatch();
		c.name = name;
		c.targetid = targetid;
		c.score = score;
		return c;
	}
}


public class LinkMatcher {
	static String prefix = "/home/rob/Reference/Wikipedia/";
	static String infile = prefix+"java_keywordiness_once";
	static String linkfile = prefix+"keyword_dblinks";
	
	public static HashMap<String,LinkMatch[]> loadNoEx() {
		try{
			return loadLinkMatchers();
		}catch(Exception e){
			return null;
		}
	}
	
	static Pattern tabpat = Pattern.compile("\t");

	public static HashMap<String,LinkMatch[]> loadLinkMatchers() throws Exception {
		HashMap<String,LinkMatch[]> keywordmap = new HashMap<String,LinkMatch[]>();
		BufferedReader reader = Util.openInFile(linkfile);
		String line;
		
		LinkMatch[] dummy = new LinkMatch[0];
		
		while((line = reader.readLine()) != null){
			String[] tokens = tabpat.split(line);
			if(tokens.length < 3) continue;
			String name = tokens[0];
			int targetid = Integer.parseInt(tokens[1]);
			float score = Float.parseFloat(tokens[2]);				
						
			if(score < 0.001) continue; // less than one in 1000 times
			
			LinkMatch wm = new LinkMatch();
			wm.name = name;
			wm.targetid = targetid;
			wm.score = score;
			
			if(keywordmap.containsKey(name) && keywordmap.get(name) != null){
				LinkMatch[] oldarr = keywordmap.get(name);
				LinkMatch[] newarr = new LinkMatch[oldarr.length + 1];
				for(int i = 0; i < oldarr.length; i++){
					newarr[i] = oldarr[i];
				}
				newarr[oldarr.length] = wm;
				keywordmap.put(name, newarr);
			}else{
				LinkMatch[] arr = new LinkMatch[1];
				arr[0] = wm;
				keywordmap.put(name, arr);
				
				String[] words = getWords(name);
				if(words.length > 1){
					for(int length = 1; length<words.length;length++){
						String prefix = makePrefix(words,0,length); 
						if(!keywordmap.containsKey(prefix)){
							keywordmap.put(prefix, dummy);
						}
						if(!keywordmap.containsKey(prefix)){
							System.out.println("sucky");
						}
					}
				}
			}
		}
		return keywordmap;
	}

	static Pattern wordpat = Pattern.compile("[^\\w]+");
	
	public static String[] getWords(String s){
		return wordpat.split(s);
	}
	
	public static String makePrefix(String[] words,int start, int length){
		StringBuffer prefix = new StringBuffer();
		for(int i = start; i < start + length; i++){
			if(i != start){
				prefix.append(" ");
			}
			prefix.append(words[i]);
		}
		return prefix.toString();
	}
	
	static HashMap<String,LinkMatch[]> keywordmap = loadNoEx();
	
	public static Vector<LinkMatch> sumMatches(Vector<LinkMatch> matches){
		HashMap<Integer,LinkMatch> sumhash = new HashMap<Integer,LinkMatch>();
		Vector<LinkMatch> results = new Vector<LinkMatch>();
		for(LinkMatch m : matches){
			if(sumhash.containsKey(m.targetid)){
				sumhash.get(m.targetid).score += m.score;
			}else{
				m = m.clone();
				sumhash.put(m.targetid, m);
				results.add(m);
			}
		}
		
		Collections.sort(results,new Comparator<LinkMatch>(){
			public int compare(LinkMatch m1, LinkMatch m2) {
				return (int)(100000.0*(m2.score-m1.score));
			}				
		});
		
		return results;
	}
	
	public static Vector<LinkMatch> getMatches(String text){
		Vector<LinkMatch> matches = new Vector<LinkMatch>();
		String[] words = getWords(text);
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
				if(keywordmap.containsKey(p)){
					LinkMatch[] arr = keywordmap.get(p);
					for(int i = 0; i < arr.length; i++){
						matches.add(arr[i]);
					}
				}else{
					break;
				}
			}
		}
		
		Collections.sort(matches,new Comparator<LinkMatch>(){
			public int compare(LinkMatch m1, LinkMatch m2) {
				return (int)(100000.0*(m2.score-m1.score));
			}				
		});
		
		return matches;		
	}
	
}
