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
  
  def add_subthing
    @thing = Thing.find(params[:thing_id])
    @subthing = SubThing.new
    @subthing[:name] = params[:subthing_name]
    @subthing[:thing] = @thing
    @subthing.save
    
    render :partial => 'subthings'
  end
  
  def remove_subthing
    @thing = Thing.find(params[:thing_id])
    @subthing = SubThing.find(params[:subthing_id])
    @subthing.destroy
    
    render :partial => 'subthings'
  end
end
