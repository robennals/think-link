package com.intel.thinklink;

public class Util {
	static String escape(String s){
		return s.replace("\"", "\\\"");
	}
	static String unescape(String s){
		return s.replace("\\\"","\"");
	}
}
