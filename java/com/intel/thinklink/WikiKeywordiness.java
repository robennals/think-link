package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
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
	static String freqfile = prefix+"java_wordfreqs_once";
	static String outfile = prefix+"java_keywordiness_once";
	
	public static BufferedReader openInFile(String s) throws Exception{
		return new BufferedReader(
				new InputStreamReader(
						new FileInputStream(s)
						));
	}
	
	public static BufferedWriter openOutFile(String s) throws Exception{
		return new BufferedWriter(
				new OutputStreamWriter(
						new FileOutputStream(s)
						));
	}
	
	
	public static HashMap<String,Integer> loadUseFreqs() throws Exception{
		HashMap<String,Integer> h = new HashMap<String,Integer>();
		BufferedReader reader = openInFile(freqfile);
		String line;
		while((line = reader.readLine()) != null){
			int colonidx = line.indexOf(":");
			String name = line.substring(0,colonidx);
			String count = line.substring(colonidx+1);
			h.put(name, new Integer(count));
		}
		return h;
	}

	public static HashMap<String,Float> loadMapFreqs(HashMap<String,Integer> usefreqs) throws Exception{
		HashMap<String,Float> keywordmap = new HashMap<String,Float>();
		BufferedReader reader = openInFile(gatherfile);
		String line;
		while((line = reader.readLine()) != null){
			int colonidx = line.indexOf(":");
			int arrowidx = line.indexOf("->");
			String name = line.substring(0,arrowidx);
			String target = line.substring(arrowidx+2,colonidx);
			float linkcount = new Integer(line.substring(colonidx+1));
			Integer freq = usefreqs.get(name);
			if(freq == null) continue;
			float keywordiness = linkcount/(freq+1);
			keywordmap.put(name+"->"+target, keywordiness);
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
		BufferedWriter w = openOutFile(outfile);
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
