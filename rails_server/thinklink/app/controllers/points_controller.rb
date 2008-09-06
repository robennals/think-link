require 'ruby-debug'
 
class PointsController < ApplicationController
#  include MainHelper
 
  layout 'standard'
 
  def initialize
  end
  
  def search 
    @minititle = "Points matching '#{params[:query]}'";
    @points = Point.find :all, :conditions => "MATCH (txt) AGAINST ('#{params[:query]}' IN BOOLEAN MODE)"
    render :partial => "points", :object => @points  
  end
  def searchajax
    if params[:savemode]
      options = {:pointfolders => true, :notop => true}
    else
      options = {:notop => true}
    end

  	render :partial => 'main/focusitem', :object => Collection.search(params[:query]), :locals => {:options => options}
  
#    @topics = Topic.find :all, :conditions => "MATCH (txt) AGAINST ('#{params[:query]}' IN BOOLEAN MODE)"
#    @points = Point.find :all, :conditions => "MATCH (txt) AGAINST ('#{params[:query]}' IN BOOLEAN MODE)"
#    if params[:savemode]
#      options = {:pointfolders => true, :notop => true}
#    else
#      options = {:notop => true}
#    end
#    render :partial => "topicsandpoints", :object => {:points => @points, :topics => @topics}, :locals => {:options => options}
  end
 
 
  def index
    @point = Point.find(params[:id])
    render :template => 'news/index', :object => nil, :locals => {:point => @point}
    
#    @title = "Points"
#    @points = Point.find(:all)
#    @options = {}
#    emit(@points)
  end
  def mine
    @minititle = "My Points"
    @points = @user.points
    render :action => :index
  end
  def notmine
    @minititle = "Others' Points"
    @points = @user.notmypoints
    render :action => :index
  end
  def scratch
    @points = Point.find_by_sql("
      SELECT * FROM points WHERE
      id IN (SELECT point_id FROM snippets WHERE user_id = #{@user.id})
      AND id NOT IN (SELECT point_a_id FROM point_links)
      AND id NOT IN (SELECT point_id FROM point_topics)
    ");
    render :partial => 'points/points', :object => @points, :locals => {:options => {}}
  end
  
  def show
    @point = Point.find(params[:id])
    
    render :template => 'news/index', :object => nil, :locals => {:point => @point}
    
#    @title = "Point: "+@point.txt
#    if @point.ismine(@user)
#      @editlink = true
#    end
#    
#    
 
    emit(@point,{:only => [:txt], :include => :snippets, :methods => :avgrating})
  end
 	def showajax
		if params[:savemode] 
			options = {:pointfolders => true}
		else
			options = {}
		end	
		@point = Point.find(params[:id])
		render :partial => "main/focusitem", :object => @point, :locals => {:options => options}
#		render :partial => "point", :locals => {:expandPoints => {@point.id => true}, :noholder => true, :expand => true, :options => options}, :object => @point
	end

	def findparents point
		parents = [point]
		curpoint = point
		done = {}
		count = 0
				
		while curpoint.topics.empty? && count < 10 && !done[curpoint.id]
			count = count+1
			done[curpoint.id] = true
			supports = curpoint.supports_points
			opposes = curpoint.opposes_points
			if !supports.empty? 
				parents.push[supports[0]]
				curpoint = supports[0]
			elsif !opposes.empty?
				parents.push[opposes[0]]
				curpoint = opposes[0]
			end
		end
			
		if(! curpoint.topics.empty?)
			curtopic = curpoint.topics[0]
			parents.push curtopic
			while ! curtopic.parents.empty?
				parents.push curtopic.parents[0]
				curtopic = curtopic.parents[0]
			end
		end
		return parents	
	end

	#find any topics this point is part of, or points that it supports
	def pathajax
		@point = Point.find(params[:id])
		parents = [@point]
		curpoint = @point
		done = {}
		count = 0
		while curpoint.topics.empty? && count < 10 && !done[curpoint.id]
			count = count+1
			done[curpoint.id] = true
			supports = curpoint.supports_points
			opposes = curpoint.opposes_points
			if !supports.empty? 
				parents.push[supports[0]]
				curpoint = supports[0]
			elsif !opposes.empty?
				parents.push[opposes[0]]
				curpoint = opposes[0];
			end
		end
		
		if(! curpoint.topics.empty?)
			curtopic = curpoint.topics[0];
			while ! curtopic.parents.empty?
				parents.push curtopic.parents[0]
				curtopic = curtopic.parents[0]
			end
		end
		render :partial => "pathlist", :object => parents		
	end

	def parents
		@point = Point.find(params[:id])
		render :partial => "paritems", :object => @point
	end
  
  def expand
		if params[:savemode] 
			options = {:pointfolders => true}
		else
			options = {}
		end
    @point = Point.find(params[:id])
    render :partial => "subitems", :locals => {:noholder => true, :expandPoints => {@point.id => true}, :options => options}, :object => @point
  end  
  
  def expandfolder
    @point = Point.find(params[:id])
    render :partial => "subitems", :locals => {:noholder => true, :expandPoints => {@point.id => true}, :options => {:pointfolders => true}}, :object => @point
  end
  
  
  def showmini
    @point = Point.find(params[:id])
    @parents = findparents @point
    @snippets = @point.snippets
    render :action => "showmini", :locals => {:options => {:point => @point}}, :layout => 'mini'
    
#    @point = Point.find(params[:id])
#    render :layout => 'mini', :action => 'show'
  end
  def showmini_old
  
    @point = Point.find(params[:id])
    if !params[:snippet].nil?
      @currentSnip = Snippet.find(params[:snippet])
    end
    render :layout => 'mini'    
  end
  def snippets_old
    @point = Point.find(params[:id])
    @snippets = @point.snippets    
    emit(@snippets,{:methods => :avgrating})
  end
  
  def snippets
    @point = Point.find(params[:id])
    render :partial => "snippets/snippets", :object => @point.snippets, :locals => {:options => {:nopoint => true}}
  end
  
  def topics 
    @point = Point.find(params[:id])
    render :partial => "topic/topics", :object => @point.topics
  end
  
  def places
	  @point = Point.find(params[:id])
	  render :partial => "pointplaces", :object => @point	  
	end
	
	def summary
	  @point = Point.find(params[:id])
 	  render :partial => 'summary', :object=> @point
	end
	  
  def new
    @point = Point.new
  end
  def create
    @point = Point.new(params[:point])
    @point.user_id = @user.id
    respond_to do |format|
      if @point.save
        flash[:notice] = 'Source was successfully created.'
        format.html { redirect_to(@point) }
        format.xml  { render :xml => @point, :status => :created, :location => @point }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @point.errors, :status => :unprocessable_entity }
      end
    end
  end
  
  def edit
    @point = Point.find(params[:id])  
  end
  
  def update
    p = Point.find(params[:point][:id])
    p.txt = params[:point][:txt]
    if p.save
      redirect_to(p)
    else
      format.xml  { render :xml => p.errors, :status => :unprocessable_entity }
    end
  end
  def delete
  end
end