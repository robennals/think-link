package com.intel.thinklink;

public class User{
	public int userid = 0;
	public String username = null;
	
	User(int userid, String username){
		this.userid = userid;
		this.username = username;
	}
	
	static User nouser = new User(0,null);
}