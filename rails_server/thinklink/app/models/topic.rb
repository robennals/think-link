class Topic < ActiveRecord::Base
  has_many :point_topics
  has_many :points, :through=> :point_topics
  belongs_to :users
  # has_many :topic_links
  # has_many :parents, :class_name=>'Topic', :through=> :topic_links, :foreign_key => 'parent_id'
  # has_many :children, :class_name=> 'Topic', :through=> :topic_links, :foreign_key => 'child_id'

  def parents
  	return Topic.find_by_sql("
  		SELECT topics.id, topics.txt, topics.user_id 
  			FROM topics,topic_links 
  			WHERE topics.id = topic_links.parent_id
  			AND topic_links.child_id = #{self.id}
  			ORDER BY txt ASC");
    
#    
#    TopicLink.find(:all, :conditions=>"child_id=#{self.id}", :order => "txt ASC").each { |l|
#      p.push(l.parent)
#    }
#    return p
  end
  
  def children
   	return Topic.find_by_sql("
  		SELECT topics.id, topics.txt, topics.user_id 
  			FROM topics,topic_links 
  			WHERE topics.id = topic_links.child_id
  			AND topic_links.parent_id = #{self.id}
  			ORDER BY txt ASC");
#
#    p = Array.new
#    TopicLink.find(:all, :conditions=>"parent_id=#{self.id}", :order => "txt ASC").each { |l|
#      p.push(l.child)
#    }
#    return p
  end
  
  def snippets
    snips = Array.new
    points = self.points;
    points.each { |p|
      snips.concat(p.snippets)
    }
    return snips
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

