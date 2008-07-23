require 'ruby-debug'

class PointsController < ApplicationController
#	include MainHelper

	layout 'standard'

	def initialize
		@title = "Points"
	end
	
	def index
		@points = Point.find(:all)
		emit(@points)
	end
	def show
		@point = Point.find(params[:id])
		emit(@point,{:only => [:txt], :include => :snippets, :methods => :avgrating})
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

