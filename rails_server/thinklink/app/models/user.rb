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
		
end
