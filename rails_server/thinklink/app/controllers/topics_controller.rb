require 'ruby-debug'

class TopicsController < ApplicationController

	layout 'standard'
	
	def index
		@title = "Topics"
		@topics = Topic.find(:all)
		@options = {}
		emit(@topics)
	end
	
	def mine
		@title = "My Topics"
		@topics = @user.topics
		render :action => :index
	end
	
	def search 
		@title = "Topics matching '#{params[:query]}'";
		@topics = Topic.find :all, :conditions => "MATCH (txt) AGAINST ('#{params[:query]}')"
		render :action => :index  
	end
	
	def show
		@topic = Topic.find(params[:id])
		@title = @topic.txt
		emit(@topic,{:only => [:txt], :include => :points})
	end
	
	def points
	  @topic = Topic.find(params[:id])
		@points = @topic.points
		emit(@points)
	end
	
	def new
	  @topic = Topic.new
	end
	
	def create
		@topic = Topic.new(params[:topic])
		@topic.user_id = @user.id
  	  #debugger
    respond_to do |format|
      if @topic.save
        flash[:notice] = 'Topic was successfully created.'
        format.html { redirect_to(@topic) }
        format.xml  { render :xml => @topic, :status => :created, :location => @topic }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @topic.errors, :status => :unprocessable_entity }
      end
    end
  end

end
