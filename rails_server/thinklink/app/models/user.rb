class User < ActiveRecord::Base
#	has_many :points
	has_many :snippets, :order => "created_at DESC"
	has_many :points, :through => :snippets, :uniq => true, :order => "created_at DESC"
	has_many :bookmarks
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
	
	def recenttopics
		pt = PointTopic.find(:all, :conditions=>"user_id=#{self.id}", :order=> "point_id DESC")
		topics = Array.new
		pt.each do |p|
		  topics.push(p.topic)
		end
		return topics.uniq
	end
		
end
