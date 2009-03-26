package com.intel.thinklink;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;

public class Util {
	
	/**
	 * Convert ISO-8859-1 format string (which is the default sent by IE to the
	 * UTF-8 format that the database is in.
	 */
	public static String toUTF8(String isoString) {
		String utf8String = null;
		if (null != isoString && !isoString.equals("")) {
			try {
				byte[] stringBytesISO = isoString.getBytes("ISO-8859-1");
				utf8String = new String(stringBytesISO, "UTF-8");
			} catch (UnsupportedEncodingException e) {
				// TODO: This should never happen. The
				// UnsupportedEncodingException
				// should be propagated instead of swallowed. This error would
				// indicate
				// a severe misconfiguration of the JVM.

				// As we can't translate just send back the best guess.
				System.out.println("UnsupportedEncodingException is: "
						+ e.getMessage());
				utf8String = isoString;
			}
		} else {
			utf8String = isoString;
		}
		return utf8String;
	} 
	
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
