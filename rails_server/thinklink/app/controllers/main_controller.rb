class MainController < ApplicationController
	include MainHelper

	def feed
		@points = Point.find(:all)
		emit(@points)
	end

  def register
    if request.post?
      @user = User.new params[:user]
      if @user.save
        flash[:info] = 'You are registered now'
      end
    end
  end
    
  def login
  	if request.post?
  	  if auth_correct?(params[:email],params[:password])
			   cookies[:email] = params[:email]
			   cookies[:password] = params[:password]					   
	       redirect_to :controller => 'news', :action => 'index'
			else 
			   @auth_error = 'Wrong username or password'
			end
  	end
	end
	
	def showuser
		check_auth
		@email = cookies[:email]
		@password = cookies[:password]
	end

end
