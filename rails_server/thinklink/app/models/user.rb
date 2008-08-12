class User < ActiveRecord::Base
#	has_many :points
	has_many :snippets, :order => "created_at DESC"
#	has_many :points, :through => :snippets, :uniq => true, :order => "created_at DESC"
	has_many :bookmarks, :order =>"id DESC"
	has_many :deletions
	has_many :point_deletions
	has_many :topics, :order => "created_at DESC"
	
	validates_uniqueness_of :email
	validates_confirmation_of :password
	validates_presence_of :email
	
	def displayname
	  if (!self.name.empty?)
	    return self.name
	  else
	    return self.email
	  end
	end
	
	def points
		return Point.find_by_sql("SELECT * FROM snippets,points WHERE snippets.point_id = points.id AND snippets.user_id = #{self.id} GROUP BY points.id ORDER BY snippets.id DESC");		
	end

	def mypoints
	return Point.find_by_sql("
		SELECT points.id, points.txt, points.user_id FROM snippets,points,bookmarks
			WHERE snippets.point_id = points.id 
			AND (bookmarks.snippet_id = snippets.id OR snippets.user_id = #{self.id})
			AND bookmarks.user_id = #{self.id}
			GROUP BY points.id 
			ORDER BY snippets.id DESC		
		");
	end

	def notmypoints
	return Point.find_by_sql("
		SELECT points.id, points.txt, points.user_id FROM points 
		WHERE points.id NOT IN (
			SELECT points.id FROM snippets,points,bookmarks
				WHERE snippets.point_id = points.id 
				AND (bookmarks.snippet_id = snippets.id OR snippets.user_id = #{self.id})
				AND bookmarks.user_id = #{self.id}
			)
		AND points.txt != ''
		ORDER BY points.id DESC
		");
	end

	
	def points_for_topic(topic)
	return Point.find_by_sql("
		SELECT points.id, points.txt, points.user_id FROM snippets,points,bookmarks,point_topics,topic_equivs
			WHERE snippets.point_id = points.id 
			AND (bookmarks.snippet_id = snippets.id OR snippets.user_id = #{self.id})
			AND point_topics.point_id = points.id
			AND (point_topics.topic_id = #{topic.id} 
				OR (point_topics.topic_id = topic_equivs.topic_a_id AND topic_equivs.topic_b_id = #{topic.id})
				OR (point_topics.topic_id = topic_equivs.topic_b_id AND topic_equivs.topic_a_id = #{topic.id})
				)
			AND bookmarks.user_id = #{self.id}
			GROUP BY points.id 
			ORDER BY snippets.id DESC		
		");
	end
		
	def points_notmine_for_topic(topic)
	return Point.find_by_sql("
		SELECT points.id, points.txt, points.user_id FROM points,point_topics,topic_equivs 
		WHERE points.id = point_topics.point_id
		AND (point_topics.topic_id = #{topic.id} 
				OR (point_topics.topic_id = topic_equivs.topic_a_id AND topic_equivs.topic_b_id = #{topic.id})
				OR (point_topics.topic_id = topic_equivs.topic_b_id AND topic_equivs.topic_a_id = #{topic.id})
				)
		AND points.id NOT IN (
			SELECT points.id FROM snippets,points,bookmarks,point_topics,topic_equivs
				WHERE snippets.point_id = points.id 
				AND (bookmarks.snippet_id = snippets.id OR snippets.user_id = #{self.id})
				AND point_topics.point_id = points.id
				AND (point_topics.topic_id = #{topic.id} 
					OR (point_topics.topic_id = topic_equivs.topic_a_id AND topic_equivs.topic_b_id = #{topic.id})
					OR (point_topics.topic_id = topic_equivs.topic_b_id AND topic_equivs.topic_a_id = #{topic.id})
				)
		AND bookmarks.user_id = #{self.id} 
		GROUP BY points.id
		)
		GROUP BY points.id");
	end	
		
	def recenttopics
		pt = PointTopic.find(:all, :conditions=>"user_id=#{self.id}", :order=> "point_id DESC")
		topics = Array.new
		pt.each do |p|
		  topics.push(p.topic)
		end
		return topics.uniq
	end
	
	def snippets
	  snips = Snippet.find(:all, :conditions=>"user_id=#{self.id}", :order=>"created_at DESC")
	  self.bookmarks.each do |b|
	    snips.push(Snippet.find(b.snippet_id))
    end
    return snips.uniq
	end
		
end
