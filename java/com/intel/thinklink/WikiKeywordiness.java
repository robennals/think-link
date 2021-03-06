package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Vector;
import java.util.regex.Pattern;

public class WikiKeywordiness {

	static Pattern wordpat = Pattern.compile("[^\\w]+");
	
//	static String wikifile = "/home/rob/Reference/Wikipedia/wikipedia_small.xml";
	
	static String prefix = "/home/rob/Reference/Wikipedia/";
//	static String gatherfile = prefix+"namegathered_all";
	static String gatherfile = prefix+"java_redirectlinks";
	static String freqfile = prefix+"java_wordfreqs_once_lower";
	static String outfile = prefix+"java_keywordiness_once_lower_split3";
	
	public static HashMap<String,Integer> loadUseFreqs() throws Exception{
		HashMap<String,Integer> h = new HashMap<String,Integer>();
		BufferedReader reader = Util.openInFile(freqfile);
		String line;
		while((line = reader.readLine()) != null){
			int colonidx = line.indexOf(":");
			// HACK: TODO: remove the toLowerCase code
			String name = line.substring(0,colonidx).toLowerCase();
			String count = line.substring(colonidx+1);
			h.put(name, new Integer(count));
		}
		return h;
	}

	public static HashMap<String,Float> loadMapFreqs(HashMap<String,Integer> usefreqs) throws Exception{
		HashMap<String,Float> keywordmap = new HashMap<String,Float>();
		BufferedReader reader = Util.openInFile(gatherfile);
		String line;
		while((line = reader.readLine()) != null){
			int colonidx = line.indexOf(":");
			int arrowidx = line.indexOf("->");
			// HACK: TODO: remove the toLowerCase code
			String name = line.substring(0,arrowidx).toLowerCase();
			String target = line.substring(arrowidx+2,colonidx);
			float linkcount = new Integer(line.substring(colonidx+1));
			Integer freq = usefreqs.get(name);
			if(freq == null) continue;
			float keywordiness = linkcount/(freq+1);
			
			if(keywordmap.containsKey(name+"->"+target)){
				float now = keywordmap.get(name+"->"+target);
				if(now > keywordiness) continue;
			}	
			keywordmap.put(name+"->"+target, keywordiness);
			
			String[] words = name.split(" ");
			for(String word : words){ // HACK: TODO: do this properly
				name = word;
				freq = usefreqs.get(name);
				if(freq == null) continue;
				keywordiness = linkcount/(freq+1);
				if(keywordiness > 0.001){
					if(keywordmap.containsKey(name+"->"+target)){
						float now = keywordmap.get(name+"->"+target);
						if(now > keywordiness) continue;
					}
					keywordmap.put(name+"->"+target, keywordiness);				
				}
			}
		}
		return keywordmap;
	}
	
	public static Vector<String> sortHashKeys(final HashMap<String,Float> hsh){
		Vector<String> keys = new Vector<String>(hsh.keySet());
		Collections.sort(keys,new Comparator<String>(){
			public int compare(String o1, String o2) {
				return (int)(100000.0*(hsh.get(o1)-hsh.get(o2)));
			}				
		});
		return keys;
	}
	
	public static void outputHash(Vector<String> keys, HashMap<String,Float> hsh) throws Exception{
		BufferedWriter w = Util.openOutFile(outfile);
		for(String key : keys){
			w.append(key+":"+hsh.get(key)+"\n");
		}
		w.close();
	}
	
	public static void out(String s){
		System.out.println(s);
	}
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub

		try{
			out("Loading use frequencies");
			HashMap<String,Integer> usefreqs = loadUseFreqs();
			out("Loading link frequencies");
			HashMap<String,Float> keywordmap = loadMapFreqs(usefreqs);
			out("Sorting by keywordiness");
			Vector<String> keys = sortHashKeys(keywordmap);
			out("Saving");
			outputHash(keys,keywordmap);
		}catch(Exception e){
			System.out.println(e);
		}
	}

}
