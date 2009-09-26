package com.intel.thinkscala.util
import java.io._
import java.net._
import javax.mail._
import javax.mail.internet._
import com.intel.thinkscala._


object SendMail {
	def sendMail(to : String, subject : String, text : String){
	  val props = System.getProperties
      props.put("mail.smtp.host","localhost")
	  val session = Session.getDefaultInstance(props,null)
	  val msg = new MimeMessage(session)
	  msg.setFrom(new InternetAddress("noreply@disputefinder.cs.berkeley.edu"))
	  msg.setRecipients(Message.RecipientType.TO, to)
	  msg.setSubject(subject)
	  msg.setText(text)
	  Transport.send(msg)
	}

	def main(args : Array[String]){
	  sendMail("rob.ennals@gmail.com","Testing Java Mail","Hello Hello Hello")
	}
 
	def sendSignup(email : String,name : String,id : Int,nonce : Int){
	  var body = 
      "Hi "+name+",\n\n"+
      "Thank you for signing up for an account with Dispute Finder.\n"+
      "To confirm your account, please click this link:\n"+
      FixedUrls.confirmUser(id,nonce) +
      "\n\n"+
      "Thank you for signing up with Dispute Finder\n"
     
	  sendMail(email,"Please confirm your Dispute Finder account",body)
	}
	
    def sendPassword(email : String,password : String){
      var body = 
      "Someone (hopefully you) asked to retreive you Dispute Finder password. \n\n"+
      "Your password is: "+password+"\n\n"+
      "Sign into Dispute Finder by going to the following URL:\n"+
      Urls.login_simple+
      "\n\n\n"
      "Thank you for using Dispute Finder\n"
      
      sendMail(email,"Your Dispute Finder password",body)      
    }
    
    def reportAbuse(username : String, paraid : Int){
       var body = 
    	   "User "+username+" reported the following paraphrase as abuse: \n"+
    	   "   id:"+paraid+"\n\n"
    	   
       sendMail("rob.ennals@gmail.com","Abusive Paraphrase",body)
    }
    
    def sendFeedback(username : String, email : String, text : String){
    	var body = 
    		"Feedback received:\n\n"+
    		"User name: "+username+"\n"+
    		"Email: "+email+"\n"+
    		"Comment: \n"+text+"\n\n"
    	sendMail("rob.ennals@gmail.com","User Feedback from "+username+"("+email+")",body)
    }
 
}
