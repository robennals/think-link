package com.intel.thinkscala.util
import java.io._
import java.net._
import javax.mail._
import javax.mail.internet._

object SendMail {
	def sendMail(to : String, subject : String, text : String){
	  val props = System.getProperties
      props.put("mail.smtp.host","localhost")
	  val session = Session.getDefaultInstance(props,null)
	  val msg = new MimeMessage(session)
	  msg.setFrom(new InternetAddress("thinklink@thinklink.cs.berkeley.edu"))
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
      "Thank you for signing up for an account with Think Link.\n"+
      "To confirm your account, please click this link:\n"+
      FixedUrls.confirmUser(id,nonce) +
      "\n\n"+
      "Thank you for signing up with Think Link\n"
     
	  sendMail(email,"Please confirm your Think Link account",body)
	}
	
}
