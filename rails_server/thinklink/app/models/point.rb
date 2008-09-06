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

	def sql_eqpoints(id)
		return "
			(#{id} = #{self.id} 
			OR #{id} IN (
				SELECT point_a_id FROM point_links 
				WHERE point_b_id = #{self.id} 
				AND howlinked = 'same'
			) OR #{id} IN (
				SELECT point_b_id FROM point_links 
				WHERE point_a_id = #{self.id} 
				AND howlinked = 'same'
			))
			";
	end

	def sql_oppoints(id)
		return "
			(#{id} IN (
				SELECT point_a_id FROM point_links 
				WHERE point_b_id = #{self.id} 
				AND howlinked = 'opposite'
			)
			OR #{id} IN (
				SELECT point_b_id FROM point_links 
				WHERE point_a_id = #{self.id} 
				AND howlinked = 'opposite'
			))

			";
	end
	
	def supporting_points
		return Point.find_by_sql("
			SELECT * FROM points 
			WHERE id IN (
				SELECT point_a_id FROM point_links
				WHERE #{sql_eqpoints('point_b_id')}
				AND howlinked = 'supports'
			)
			OR id IN (
				SELECT point_a_id FROM point_links
				WHERE #{sql_oppoints('point_b_id')}
				AND howlinked = 'opposes'
			) 			 
		");
	end

	def supports_points
		return Point.find_by_sql("
			SELECT * FROM points 
			WHERE id IN (
				SELECT point_b_id FROM point_links
				WHERE #{sql_eqpoints('point_a_id')}
				AND howlinked = 'supports'
			)
			OR id IN (
				SELECT point_b_id FROM point_links
				WHERE #{sql_oppoints('point_a_id')}
				AND howlinked = 'opposes'
			) 			 
		")
	end	
	
	def opposing_points
		return Point.find_by_sql("
			SELECT * FROM points 
			WHERE id IN (
				SELECT point_a_id FROM point_links
				WHERE #{sql_eqpoints('point_b_id')}
				AND howlinked = 'opposes'
			)
			OR id IN (
				SELECT point_a_id FROM point_links
				WHERE #{sql_oppoints('point_b_id')}
				AND howlinked = 'supports'
			) 			 
		");
	end

	def opposes_points
		return Point.find_by_sql("
			SELECT * FROM points 
			WHERE id IN (
				SELECT point_b_id FROM point_links
				WHERE #{sql_eqpoints('point_a_id')}
				AND howlinked = 'opposes'
			)
			OR id IN (
				SELECT point_b_id FROM point_links
				WHERE #{sql_oppoints('point_a_id')}
				AND howlinked = 'supports'
			) 			 
		")
	end	

	def opposite_points
		return Point.find_by_sql("
			SELECT * FROM points 
			WHERE id IN (
				SELECT point_b_id FROM point_links
				WHERE point_a_id = #{self.id}
				AND howlinked = 'opposite'
			)")
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

	def related_links_forward(user,rel,opposite)
		links = PointLink.find_by_sql("
			SELECT * from pointlink WHERE 
			pointlink.id IN (
				SELECT a.id FROM point_links a, point_links b WHERE
					(a.point_a = #{self.id} OR (b.point_a = #{self.id} AND b.howlinked = '
				
			)
		")
		return links;
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
	
	def ismine(user)
	  u = User.find(:first, :conditions=>"id=#{self.user_id}")
	  if (u.nil?) 
	    return false
	  end
	  return user.eql?(u)
	end
	
	validates_presence_of :txt

	def icon(user) 
		bookmarked = !Bookmark.find_by_sql("
				SELECT 1 FROM bookmarks,snippets
						WHERE bookmarks.user_id=#{user.id}
						AND snippets.id = bookmarks.snippet_id
						AND snippets.point_id=#{self.id}").empty?
		contentious = PointLink.find(:first,:conditions=>"point_b_id=#{self.id} AND (howlinked='opposes' OR howlinked='opposite')")
		supported = PointLink.find(:first,:conditions=>"point_b_id=#{self.id} AND (howlinked='supports')")
		if bookmarked && contentious
			return "/images/lightbulb_redyellow.png"
		elsif bookmarked && supported
			return "/images/lightbulb_greenyellow.png"
		elsif contentious
			return "/images/lightbulb_red.png"			
		elsif supported 
			return "/images/lightbulb_green.png"
		elsif bookmarked
			return "/images/lightbulb.png"
		else
			return "/images/lightbulb_off.png"
		end
	end	

	def what
		return "point"
	end 


	
end
