package com.intel.thinkscala.pages
import com.intel.thinkscala._

object Messages {
  def sentconfirm = 
    <div class='content'>
       <h1>Confirmation Email Sent</h1>
       <div class='message'>
          We have sent a confirmation email to the email address you gave.          
       </div>
       <div class='message'>
       	  Please click on the link in that message to activate your account.
       </div>
    </div>

  def sentpassword = 
    <div class='content'>
       <h1>Password Email Sent</h1>
       <div class='message'>
          We have sent an email with your Dispute Finder password to the email address you gave.          
       </div>
    </div>
    
  def badmail =
    <div class='content'>
       <h1>Bad Email Adress</h1>
       <div class='message'>
          We were not able to send email to the address you gave. Please go back and try again.    
       </div>
    </div>
    
  def confirmed = 
    <div class='content'>
       <h1>Account Confirmed</h1>
       <div class='message'>
         Your account has been successfully confirmed. 
       </div>
       <div class='message'><a href={Urls.login(Urls.base)}>login</a> with your new account.</div>
    </div>
    
  // TODO: support retreiving or changing existing password
  // OR: support facebook connect for signup
  def emailregistered = 
    <div class='content'>
       <h1>An account already exists with this email address</h1>
       <div class='message'>
       	Someone, hopefully you, has already created an account with this email address.
       </div>
    </div>

  def nameregistered = 
    <div class='content'>
       <h1>An account already exists with this user name</h1>
       <div class='message'>
       	Someone has already created an account with this email address. Go back and try a different user name.
       </div>
    </div>
 
  def badconfirm = 
    <div class='content'>
       <h1>Account already confirmed</h1>
       <div class='message'>
       	This account has already been confirmed.
       </div>
    </div>
        
  val notfound = 
    <div class="content">
      <h1>Not Found</h1>
      <div class="message">
      This page was not found
      </div>
    </div>
    
  val notadmin = 
    <div class="content">
      <h1>You are not an Admin</h1>
      <div class="message">
          You need to be an admin to do that
      </div>
    </div>
}
