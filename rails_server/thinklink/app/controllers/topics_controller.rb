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
	  @title = "Points for #{@topic.txt}"
		@points = @topic.points
		render  :template => 'points/index'
		emit(@points)
	end
	
	def children
		@topic = Topic.find(params[:id]);
  	@title = "Subtopics for #{@topic.txt}"
		@topics = @topic.children
		render :action => 'index'
	end

	def parents  
	  @topic = Topic.find(params[:id]);
	  @title = "Parent topics for #{@topic.txt}"
		@topics = @topic.parents
		render :action => 'index'
	end

	
	def new
	  @topic = Topic.new
	end
	
	def newparent
	  parent = Topic.find(:first,:conditions=>"txt='#{params[:topic]}'")
  	# create parent topic if it doesn't exist already
	  if parent.nil?
	    parent = Topic.new(params[:topic])
	    if !parent.save
	      emit(parent.errors)
	    end
	  end
	  link = TopicLink.new(:child_id=>"#{params[:id]}", :parent_id=>"#{parent.id}", :user_id=>"#{@user.id}")
	  link.save
	  emit(parent.id, :format=>"json")
	end
	
	def newchild
	  child = Topic.find(:first,:conditions=>"txt='#{params[:topic]}'")
  	# create parent topic if it doesn't exist already
	  if child.nil?
	    child = Topic.new(params[:topic])
	    if !child.save
	      emit(child.errors)
	    end
	  end
	  link = TopicLink.new(:parent_id=>"#{params[:id]}", :child_id=>"#{child.id}", :user_id=>"#{@user.id}")
	  link.save
	  emit(child.id, :format=>"json")
	end
	
	def create
		@topic = Topic.new(params[:topic])
		@topic.user_id = @user.id
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
  
  def edit
	  @topic = Topic.find(params[:id])  
	end
	
	def update
	  p = Topic.find(params[:topic][:id])
	  p.txt = params[:topic][:txt]
	  if p.save
	    redirect_to(p)
	  else
	    format.xml  { render :xml => p.errors, :status => :unprocessable_entity }
	  end
	end

end
