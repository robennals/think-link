require 'ruby-debug'

class Point < ActiveRecord::Base
	has_many :snippets
	belongs_to :creator, :class_name => :user
	has_many :users, :through => :snippets, :uniq => true
	has_many :point_deletions
	has_many :point_topics
	has_many :topics, :through => :point_topics
#	has_many :point_links_a, :class_name => 'PointLink', :source => 'point_a'
#	has_many :point_links_b, :class_name => 'PointLink', :source => :point_b
	
	def point_links_a
		return PointLink.find :all, :conditions => "point_a_id = #{self.id}"
	end
	def point_links_b
		return PointLink.find :all, :conditions => "point_b_id = #{self.id}"
	end
	
	def snippets
		snipfinal = Array.new
		snips = Snippet.find(:all, :conditions => "point_id= #{self.id}" )
		snipfinal.concat(snips)
		samepoints = PointLink.find(:all, :conditions => "(point_b_id = #{self.id} AND howlinked='same') OR (point_a_id = #{self.id} AND howlinked='same')")
    samepoints.each { |pl| 
      if !self.eql?(pl.point_b)
            other = pl.point_b
          else
            other = pl.point_a
          end
      snipfinal.concat(Snippet.find(:all, :conditions => "point_id= #{other.id}" )) 
    }
    return snipfinal.uniq
	end
	
	def supporting_links(user)
	  links = PointLink.find(:all, :conditions => "(point_b_id = #{self.id} AND howlinked='supports') OR (point_a_id = #{self.id} AND howlinked='supports')")
	  links.delete_if {|l|
	    l.point_a.isdeleted(user) || l.point_b.isdeleted(user) || l.point_a.isdeletedall || l.point_b.isdeletedall
	  }
	  samelinks = self.same_links(user)
	  samelinks.each {|pl|
	    if !self.eql?(pl.point_b)
        other = pl.point_b
      else
        other = pl.point_a
      end 
	    links.concat(PointLink.find(:all, :conditions => "(point_b_id = #{other.id} AND howlinked='supports') OR (point_a_id = #{other.id} AND howlinked='supports')"))
	  }
	  return links.uniq
	end
	
	def same_links(user)
		links= PointLink.find(:all, :conditions => "(point_b_id = #{self.id} AND howlinked='same') OR (point_a_id = #{self.id} AND howlinked='same')")
		links.delete_if {|l|
	    l.point_a.isdeleted(user) || l.point_b.isdeleted(user) || l.point_a.isdeletedall || l.point_b.isdeletedall
	  }
	  return links
	end
	
	def opposing_links(user)
		links= PointLink.find(:all, :conditions => "(point_b_id = #{self.id} AND howlinked='opposes') OR (point_a_id = #{self.id} AND howlinked='opposes')")
		links.delete_if {|l|
	    l.point_a.isdeleted(user) || l.point_b.isdeleted(user) || l.point_a.isdeletedall || l.point_b.isdeletedall
	  }
	  samelinks = self.same_links(user)
	  samelinks.each {|pl| 
	    if !self.eql?(pl.point_b)
        other = pl.point_b
      else
        other = pl.point_a
      end
	    links.concat(PointLink.find(:all, :conditions => "(point_b_id = #{other.id} AND howlinked='opposes') OR (point_a_id = #{other.id} AND howlinked='opposes')"))
	  }
	  return links.uniq
	end
	
	def opposite_links(user)
		links= PointLink.find(:all, :conditions => "(point_b_id = #{self.id} AND howlinked='opposite') OR (point_a_id = #{self.id} AND howlinked='opposite')")
		links.delete_if {|l|
	    l.point_a.isdeleted(user) || l.point_b.isdeleted(user) || l.point_a.isdeletedall || l.point_b.isdeletedall
	  }
	  return links
	end

  def isdeleted(user)
	  if user.nil? 
	    return false
	  end
	  count = PointDeletion.find(:all,:conditions =>"user_id=#{user.id} AND point_id=#{self.id}").size
    return count > 0
	end 
	
	def isdeletedall
	  count = PointDeletion.find(:all,:conditions =>"point_id=#{self.id}").size
    return count > 2
	end
	
	validates_presence_of :txt
end
