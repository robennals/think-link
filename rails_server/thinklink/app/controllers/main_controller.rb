#  Copyright 2008 Intel Corporation
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

class MainController < ApplicationController
	include MainHelper

	layout 'standard'

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
	
	def search 
		@title = "Things matching '#{params[:query]}'";
		@points = Point.find :all, :conditions => "MATCH (txt) AGAINST ('#{params[:query]}' IN BOOLEAN MODE)"
		@topics = Topic.find :all, :conditions => "MATCH (txt) AGAINST ('#{params[:query]}' IN BOOLEAN MODE)"
	end
	
end
