class TopicLink < ActiveRecord::Base
  #belongs_to :parent, :class_name => 'Topic', :foreign_key => 'parent_id'
  #belongs_to :child, :class_name => 'Topic', :foreign_key => 'child_id'

  def parent
    return Topic.find(:first,:conditions=>"id=#{self.parent_id}")
  end
  
  def child
    return Topic.find(:first,:conditions=>"id=#{self.child_id}")
  end


end
