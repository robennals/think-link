class Topic < ActiveRecord::Base
  has_many :point_topics
  has_many :points, :through=> :point_topics
  belongs_to :users
  # has_many :topic_links
  # has_many :parents, :class_name=>'Topic', :through=> :topic_links, :foreign_key => 'parent_id'
  # has_many :children, :class_name=> 'Topic', :through=> :topic_links, :foreign_key => 'child_id'

  def parents
    p = Array.new
    TopicLink.find(:all, :conditions=>"child_id=#{self.id}").each { |l|
      p.push(l.parent)
    }
    return p
  end
  
  def children
    p = Array.new
    TopicLink.find(:all, :conditions=>"parent_id=#{self.id}").each { |l|
      p.push(l.child)
    }
    return p
  end
  
  def ismine(user)
	  u = User.find(:first, :conditions=>"id=#{self.user_id}")
	  if (u.nil?) 
	    return false
	  end
	  return user.eql?(u)
	end
	  
end

