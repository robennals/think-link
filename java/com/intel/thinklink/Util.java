package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

public class Util {
	
    public static String escape(String string) {
        char         b;
        char         c = 0;
        int          i;
        int          len = string.length();
        StringBuffer sb = new StringBuffer(len + 4);
        String       t;

        for (i = 0; i < len; i += 1) {
            b = c;
            c = string.charAt(i);
            switch (c) {
            case '\\':
            case '"':
                sb.append('\\');
                sb.append(c);
                break;
            case '/':
                if (b == '<') {
                    sb.append('\\');
                }
                sb.append(c);
                break;
            case '\b':
                sb.append("\\b");
                break;
            case '\t':
                sb.append("\\t");
                break;
            case '\n':
                sb.append("\\n");
                break;
            case '\f':
                sb.append("\\f");
                break;
            case '\r':
                sb.append("\\r");
                break;
            default:
                if (c < ' ' || (c >= '\u0080' && c < '\u00a0') ||
                               (c >= '\u2000' && c < '\u2100')) {
                    t = "000" + Integer.toHexString(c);
                    sb.append("\\u" + t.substring(t.length() - 4));
                } else {
                    sb.append(c);
                }
            }
        }
        return sb.toString();
    }
	
//	static String escape(String s){
//		return s.replace("\"", "\\\"").replace("\n", "\\n");
//	}
	static String unescape(String s){
		return s.replace("\\\"","\"").replace("\\n", "\n");
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
