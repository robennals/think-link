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

	def identical 
		return Topic.find_by_sql("SELECT * FROM topics 
			WHERE topics.id IN
				(SELECT topic_a_id FROM topic_equivs WHERE topic_b_id = #{self.id})
			OR topics.id IN
				(SELECT topic_b_id FROM topic_equivs WHERE topic_a_id = #{self.id})				
			");
	end
  
  def ismine(user)
	  u = User.find(:first, :conditions=>"id=#{self.user_id}")
	  if (u.nil?) 
	    return false
	  end
	  return user.eql?(u)
	end
	
	def icon(user) 
		return "/images/folder.png"
	end
	 
	def what
		return "topic"
	end 
	  
end

