package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Vector;
import java.util.regex.Pattern;

// best match?
class WikiMatch {
	String name;
	String target;
	Float score;
	
	public WikiMatch clone(){
		WikiMatch c = new WikiMatch();
		c.name = name;
		c.target = target;
		c.score = score;
		return c;
	}
}


public class WikiMatcher {
	static String prefix = "/home/rob/Reference/Wikipedia/";
	static String infile = prefix+"java_keywordiness_once";
	static String linkfile = prefix+"keyword_dblinks";
	
	public static HashMap<String,WikiMatch[]> loadNoEx() {
		try{
			return loadMatchers();
		}catch(Exception e){
			return null;
		}
	}
	
	static Pattern tabpat = Pattern.compile("\t");
	
	public static HashMap<String,WikiMatch[]> loadMatchers() throws Exception {
		HashMap<String,WikiMatch[]> keywordmap = new HashMap<String,WikiMatch[]>();
		BufferedReader reader = Util.openInFile(infile);
		String line;
		
		WikiMatch[] dummy = new WikiMatch[0];
		
		while((line = reader.readLine()) != null){
			int colonidx = line.indexOf(":");
			int arrowidx = line.indexOf("->");
			// DEBUG: temporary!
			String name = line.substring(0,arrowidx).toLowerCase();
			if(name == "can"){
				continue;
			}
//			String name = line.substring(0,arrowidx);
			String target = line.substring(arrowidx+2,colonidx);
			float score = new Float(line.substring(colonidx+1));
			
			if(score < 0.001) continue; // less than one in 1000 times
			
			WikiMatch wm = new WikiMatch();
			wm.name = name;
			wm.target = target;
			wm.score = score;
			
			if(keywordmap.containsKey(name) && keywordmap.get(name) != null){
				WikiMatch[] oldarr = keywordmap.get(name);
				WikiMatch[] newarr = new WikiMatch[oldarr.length + 1];
				for(int i = 0; i < oldarr.length; i++){
					newarr[i] = oldarr[i];
				}
				newarr[oldarr.length] = wm;
				keywordmap.put(name, newarr);
			}else{
				WikiMatch[] arr = new WikiMatch[1];
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

	static Pattern wordpat = Pattern.compile("[^\\w\']+");
	
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
	
	static HashMap<String,WikiMatch[]> keywordmap = loadNoEx();
	
	public static Vector<WikiMatch> sumMatches(Vector<WikiMatch> matches){
		HashMap<String,WikiMatch> sumhash = new HashMap<String,WikiMatch>();
		Vector<WikiMatch> results = new Vector<WikiMatch>();
		for(WikiMatch m : matches){
			if(sumhash.containsKey(m.target)){
				sumhash.get(m.target).score += m.score;
			}else{
				m = m.clone();
				sumhash.put(m.target, m);
				results.add(m);
			}
		}
		
		Collections.sort(results,new Comparator<WikiMatch>(){
			public int compare(WikiMatch m1, WikiMatch m2) {
				return (int)(100000.0*(m2.score-m1.score));
			}				
		});
		
		return results;
	}
	
	public static Vector<WikiMatch> getMatches(String text){
		Vector<WikiMatch> matches = new Vector<WikiMatch>();
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
					WikiMatch[] arr = keywordmap.get(p);
					for(int i = 0; i < arr.length; i++){
						matches.add(arr[i]);
					}
				}else{
					break;
				}
			}
		}
		
		Collections.sort(matches,new Comparator<WikiMatch>(){
			public int compare(WikiMatch m1, WikiMatch m2) {
				return (int)(100000.0*(m2.score-m1.score));
			}				
		});
		
		return matches;		
	}
	
	// as before, we need to ensure that we store all prefixes, even if we
	// map them to null
	
	
	public static void main(String[] args){
		try{
			System.out.println("loading");
	//		HashMap<String,WikiMatch[]> keywordmap = loadMatchers();
			BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
			String line;
			
			System.out.println("enter a snippet");
			
			while((line = reader.readLine()) != null){
				if(line.equals("quit")){
					return;
				}			
				Vector<WikiMatch> matches = new Vector<WikiMatch>();
				String[] words = getWords(line);
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
//						System.out.println("prefix: '"+p+"'");
						if(keywordmap.containsKey(p)){
							WikiMatch[] arr = keywordmap.get(p);
							for(int i = 0; i < arr.length; i++){
								matches.add(arr[i]);
							}
						}else{
							break;
						}
					}
				}
				
//				System.out.println("sorting");
				Collections.sort(matches,new Comparator<WikiMatch>(){
					public int compare(WikiMatch m1, WikiMatch m2) {
						return (int)(100000.0*(m2.score-m1.score));
					}				
				});
				int count = 0;
				for(WikiMatch wm : matches){
					System.out.println(wm.name + "->" + wm.target + ":" + wm.score);
					if(count > 20){
						continue;
					}
				}
			}			
		}catch(Exception e){
			
		}
		
	}
}
