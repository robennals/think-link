class ExampleController < ApplicationController
  def index
    @things = Thing.find_by_name(Storage::Key.new(Storage::WildcardCondition.new))
  end
  
  def new
    @thing = Thing.new
    render :action => 'edit'
  end
  
  def edit
    @thing = Thing.find(params[:id])
  end
  
  def update
    if params[:id].nil?
      @thing = Thing.new
    else
      @thing = Thing.find(params[:id])
    end
    
    @thing[:name] = params[:thing_name]
    @thing.save
    
    redirect_to :action => 'index'
  end
end
