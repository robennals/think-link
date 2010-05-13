package com.intel.thinklink;

import java.io.*;
import java.util.*;
import com.intel.thinklink.WikiMatcher;

public class WikiClaimFilter {
	public static String infilename = "/home/rob/git/thinklink/output/labelled/justclaims.claims";
	public static String outfilename = "/home/rob/git/thinklink/output/labelled/justscores2.claims";
//	public static String badfilename = "/home/rob/git/thinklink/output/wiki_bad_claims.claims";
	
	public static boolean isGood(String text){
		if(text.startsWith("global")) return true;
		Vector<WikiMatch> matches = WikiMatcher.getMatches(text);
		for(WikiMatch wm : matches){
			if(wm.score > 0.015){
				return true;
			}
		}
		return false;
	}
	
	public static double bestScore(String text){
		double best = 0.0;
		Vector<WikiMatch> matches = WikiMatcher.getMatches(text);
		for(WikiMatch wm : matches){
			if(wm.score > best){
				best = wm.score;
			}
		}
		return best;		
	}
	
	public static void main(String[] args){
		try{
			BufferedReader reader = Util.openInFile(infilename);
			BufferedWriter writer = Util.openOutFile(outfilename);
//			BufferedWriter badwriter = Util.openOutFile(badfilename);
			String line;
			
			while((line = reader.readLine()) != null){
				writer.append(bestScore(line)+"\t"+line+"\n");
			}
			writer.close();
			reader.close();
		}catch(Exception e){
			System.out.println("clashed with "+e.getMessage());			
		}
	}
}
