package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class WikiRedirects {

//	static String wikifile = "/home/rob/Reference/Wikipedia/wikipedia_small.xml";
	static String wikifile = "/home/rob/Reference/Wikipedia/enwiki-20081008-pages-articles.xml";
	static String outfile = "/home/rob/Reference/Wikipedia/java_redirects";
	
	static Pattern titlepat = Pattern.compile("<title>(.*)</title>",Pattern.CASE_INSENSITIVE);
	static Pattern linkpat = Pattern.compile("\\[\\[([^\\]]+)\\]\\]");
	static Pattern redirectpat = Pattern.compile("#REDIRECT\\s*\\[\\[([^\\]]+)\\]\\]",Pattern.CASE_INSENSITIVE);
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		int linecount = 0;
		
		try{
			HashMap<String,String> links = new HashMap<String,String>();
			BufferedReader reader = Util.openInFile(wikifile);
			BufferedWriter writer = Util.openOutFile(outfile);
			
			boolean inbody = false;
			String line;
			String title = null;
			while((line = reader.readLine()) != null){
				if(line.contains("<title")){
					Matcher titlematch = titlepat.matcher(line);
					if(titlematch.find()){
						title = titlematch.group(1);
					}
				}
				Matcher redirectmatch = redirectpat.matcher(line);
				if(redirectmatch.find()){
					String target = redirectmatch.group(1);
					writer.append(title+"->"+target+"\n");
				}
				linecount++;
				if(linecount % 10000 == 0){
					System.out.println("reading wiki:"+linecount);
				}
			}
			reader.close();
			writer.close();
		}catch(Exception e){
			System.out.println(e);
		}
	}

}
