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
