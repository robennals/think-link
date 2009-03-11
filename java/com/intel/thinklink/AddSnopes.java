package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.InputStreamReader;

public class AddSnopes {
	public static String infile = "/home/rob/git/thinklink/ruby/snopesclaims_text.csv";
	public static void main(String[] args){
		try{
			DataBase base = ConnectionPool.get();
			BufferedReader reader = Util.openInFile(infile);
			String line;
			while((line = reader.readLine()) != null){		
				String[] words = line.split("\t");
				if(words == null || words.length < 4) continue;
				String url = words[0];
				String status = words[1];
				String claimtext = words[2];
				String body = words[3];
				if(claimtext.length() < 12) continue; // weird parsing errors
				if(claimtext.length() > 500) continue;
				
				// TODO: create a new claim and add this as a snippet either for or 
				// against it
				int claimid = base.addNode(claimtext, 1, "claim", "");
				int snipid = base.addSnippet(1, claimtext, url, url, claimtext, body);
				String verb;
				if(status.equals("False")){
					verb = "opposes";
				}else if(status.equals("True")){
					verb = "supports";
				}else{
					verb = "relates to";
				}
				base.addLink(snipid, claimid, verb);
			}
			reader.close();
		}catch(Exception e){
			e.printStackTrace();
		}
	}
}
