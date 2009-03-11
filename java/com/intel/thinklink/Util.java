package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

public class Util {
	static String escape(String s){
		return s.replace("\"", "\\\"");
	}
	static String unescape(String s){
		return s.replace("\\\"","\"");
	}
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
}
