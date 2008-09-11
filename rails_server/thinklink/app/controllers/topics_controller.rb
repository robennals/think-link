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

require 'ruby-debug'

class TopicsController < ApplicationController

	layout 'standard'
	
	def index
		@minititle = "Topics"
		@topics = Topic.find(:all)
		@options = {}
		emit(@topics)
	end
	
	def parents
		@topic = Topic.find(params[:id])
		render :partial => "paritems", :object => @topic
	end
	
	def expand
		@topic = Topic.find(params[:id])
		logTopicView(@topic)
		render :partial => "subitems", :locals => {:noholder => true, :options => {}, :expand => true},  :object => @topic
	end

	def expandfolder
		@topic = Topic.find(params[:id])
		logTopicView(@topic)
		render :partial => "subitems", :locals => {:noholder => true, :expand => true, :options => {:pointfolders => true}}, :object => @topic
	end
	
	def mine
		@minititle = "My Topics"
		@topics = @user.topics
		render :action => :index
	end
	
	def search 
		@minititle = "Topics matching '#{params[:query]}'";
		@topics = Topic.find :all, :conditions => "MATCH (txt) AGAINST ('#{params[:query]}' IN BOOLEAN MODE)"
		render :action => :index  
	end
	
	def hot
		if params[:savemode] 
			options = {:pointfolders => true}
		else
			options = {}
		end
		render :partial => 'main/focusitem', :object => Collection.hot, :locals => {:options => options}
#		@topics = Topic.find_by_sql ("
#				SELECT topics.id, topics.txt, topics.user_id FROM topics
#					INNER JOIN (
#						SELECT * FROM topicviews 
#						ORDER BY id DESC 
#						LIMIT 200) 
#					AS rows 
#					ON rows.topic_id = topics.id
#				GROUP BY topic_id 
#				ORDER BY COUNT(rows.user_id) DESC");
#			render :partial => "topics/topics", :object => @topics, :locals => {:options => options}
	end
	
	def show
		@topic = Topic.find(params[:id])
		logTopicView(@topic)
		@title = "Topic: "+@topic.txt
		if @topic.ismine(@user)
			@editlink = true
		end
#		@mypoints = @user.points_for_topic(@topic)
#		@notmine = @user.points_notmine_for_topic(@topic)
		@points = @topic.points
		emit(@topic,{:only => [:txt], :include => :points})
	end
	
	def showajax
		if params[:savemode] 
			options = {:pointfolders => true}
		else
			options = {}
		end	
		@topic = Topic.find(params[:id])
		render :partial => "topic", :locals => {:noholder => true, :expand => true, :options => options}, :object => @topic
	end
	
	def pathajax
		@topic = Topic.find(params[:id])
		parents = [@topic];
		curtopic = @topic;
		while ! curtopic.parents.empty?
			parents.push curtopic.parents[0]
			curtopic = curtopic.parents[0]
		end
		render :partial => "pathlist", :object => parents		
	end
	
	def points
	  @topic = Topic.find(params[:id])
	  @minititle = "Points for #{@topic.txt}"
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

#	def parents  
#	  @topic = Topic.find(params[:id]);
#	  # @title = "Parent topics for #{@topic.txt}"
#		@topics = @topic.parents
#		render :partial => "topics", :object => @topics
##		render :action => 'index'
#	end
	
	def summary
	  @topic = Topic.find(params[:id]);
	  render :partial => 'topics/topicsummary', :object=> @topic, :locals=> {:options=>{:link=>true, :snippets=>true}}
	end
	
	def snippets
    @topic = Topic.find(params[:id])
    render :partial => "snippets/snippets", :object => @topic.snippets, :locals => {:options => {}}
  end

	def recent
		if params[:savemode] 
			options = {:pointfolders => true}
		else
			options = {}
		end
		recent = Collection.recent(@user)
		render :partial => 'main/focusitem', :object => recent, :locals => {:options => options}  
#		render :partial => 'topics/topics', :object => @user.recenttopics.slice(0,50), :locals => {:options => options}
	end
	
	def toplevel
		if params[:savemode]
			options = {:pointfolders => true}
		else
			options = {}
		end
		toptopics = Topic.find_by_sql("
				SELECT * FROM topics WHERE
				id NOT IN (
					SELECT child_id FROM topic_links 
				)
				ORDER BY txt ASC
			");
	
		if (!params[:id].nil?) # which topic to expand by default
		  topic = Topic.find(params[:id]);
		  render :partial => 'topics/topics', :object => toptopics, :locals => {:options => options.merge({:expanded=>topic})}
		else
		  render :partial => 'topics/topics', :object => toptopics, :locals => {:options => options}
		end
	end
	
	def new
	  @topic = Topic.new
	end
	
	def newparent
	  parent = Topic.find(:first,:conditions=>"txt='#{params[:topic]}'")
  	# create parent topic if it doesn't exist already
	  if parent.nil?
	    parent = Topic.new(:txt => params[:topic], :user_id => @user)
	    if !parent.save
	      emit(parent.errors)
	    end
	  end
	  link = TopicLink.new(:child_id=>params[:id], :parent_id=>parent.id, :user_id=>@user)
	  link.save
	  emit(parent.id, :format=>"json")
	end
	
	def newchild
	  child = Topic.find(:first,:conditions=>"txt='#{params[:topic]}'")
  	# create parent topic if it doesn't exist already
	  if child.nil?
	    child = Topic.new(:txt => params[:topic], :user_id => @user)
	    if !child.save
	      emit(child.errors)
	    end
	  end
	  link = TopicLink.new(:parent_id=>"#{params[:id]}", :child_id=>"#{child.id}", :user_id=>"#{@user.id}")
	  link.save
	  emit(child.id, :format=>"json")
	end
	
	def newidentical  
		identical = Topic.find(:first,:conditions=>"txt='#{params[:topic]}'");
		# create identical topic if it doesn't exist already - not clear we want this
	  if identical.nil?
	    identical = Topic.new(:txt => params[:topic], :user_id => @user)
	    if !identical.save
	      emit(identical.errors)
	    end
	  end
	  link = TopicEquiv.new(:topic_a_id=>"#{params[:id]}", :topic_b_id=>"#{identical.id}", :user_id=>"#{@user.id}")
	  link.save
	  emit(identical.id, :format=>"json")
	
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
