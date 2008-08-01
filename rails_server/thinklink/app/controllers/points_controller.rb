require 'ruby-debug'

class PointsController < ApplicationController
#	include MainHelper

	layout 'standard'

	def initialize
	end
	
	def search 
		@title = "Points matching '#{params[:query]}'";
		@points = Point.find :all, :conditions => "MATCH (txt) AGAINST ('#{params[:query]}')"
		render :action => :index  
	end
	def index
		@title = "Points"
		@points = Point.find(:all)
		@options = {}
		emit(@points)
	end
	def mine
		@title = "My Points"
		@points = @user.points
		render :action => :index
	end
	def show
		@point = Point.find(params[:id])
		@title = @point.txt
		emit(@point,{:only => [:txt], :include => :snippets, :methods => :avgrating})
	end
	def showmini
		@point = Point.find(params[:id])
		if !params[:snippet].nil?
		  @currentSnip = Snippet.find(params[:snippet])
		end
    #debugger
		render :layout => 'mini'		
	end
	def snippets
		@point = Point.find(params[:id])
		@snippets = @point.snippets
		emit(@snippets,{:methods => :avgrating})
	end
	def new
		@point = Point.new
	end
	def create
		@point = Point.new(params[:point])
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
	end
	def update
	end
	def delete
	end
end

