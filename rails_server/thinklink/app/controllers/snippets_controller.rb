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

class SnippetsController < ApplicationController
	layout 'standard';
	auto_complete_for :snippet, :url

	def index		
		@title = "Recent Snippets"
		@snippets = Snippet.all(:order => "created_at DESC")
		@options = {}
	end
	def list 
		@title = "Recent Snippets"
		@snippets = Snippet.all(:order => "created_at DESC")
		@options = {}
		render :action => :index
	end
	def mine	
		@title = "My Snippets"	
		@snippets = @user.snippets
		@options = {:noauthor => true}
		render :action => :index
	end
	def friends
	  @title = "Friends' Snippets"	
		@snippets = Snippet.all(:order => "created_at desc", :conditions=>"user_id<>#{@user.id}")
		@options = {}
		render :action => :index
	end
	def newsnippet
		render :layout => 'mini', :action => 'newsnippet'
	end
	def show
		@snippet = Snippet.find(params[:id])
	end
	def new
		@snippet = Snippet.new
		@points = Point.find(:all)
	end
	def create
		@snippet = Snippet.new(params[:snippet])
		if @snippet.save
			redirect_to :action => 'list'
		else
			@points = Point.find(:all)
			render :action => 'new'
		end
	end
	def edit
		@snippet = Snippet.find(params[:id])
		@points = Point.find(:all)
	end
	def update
		@snippet = Snippet.find(params[:id])
		if @snippet.update_attributes(params[:snippet])
			redirect_to :action => 'show', :id => @snippet
		else
			@points = Point.find(:all)
			render :action => 'edit'
		end
	end
	def delete
		Snippet.find(params[:id]).destroy
		redirect_to :action => 'list'
	end
	def show_points
		@point = Points.find(params[:id])
	end
end
