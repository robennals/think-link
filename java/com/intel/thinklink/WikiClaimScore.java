package com.intel.thinklink;

import java.io.*;
import java.util.*;
import com.intel.thinklink.WikiMatcher;

public class WikiClaimScore {
	public static String infilename = "/home/rob/git/thinklink/output/only_good_claims7.claims";
	public static String outfilename = "/home/rob/git/thinklink/output/wiki_filtered_claims6.claims";
	public static String badfilename = "/home/rob/git/thinklink/output/wiki_bad_claims2.claims";
	
	public static boolean isGood(String text){
		if(text.startsWith("global")) return true;
		Vector<WikiMatch> matches = WikiMatcher.getMatches(text);
		for(WikiMatch wm : matches){
			if(wm.score > 0.04){
				return true;
			}
		}
		return false;
	}
	
	public static void main(String[] args){
		try{
			BufferedReader reader = Util.openInFile(infilename);
			BufferedWriter writer = Util.openOutFile(outfilename);
			BufferedWriter badwriter = Util.openOutFile(badfilename);
			String line;
			
			while((line = reader.readLine()) != null){
				if(isGood(line)){
					writer.append(line+"\n");
				}else{
					badwriter.append(line+"\n");
					System.out.println("BAD: "+line);
				}			
			}
			writer.close();
			reader.close();
		}catch(Exception e){
			System.out.println("clashed with "+e.getMessage());
			
		}
	}
}
