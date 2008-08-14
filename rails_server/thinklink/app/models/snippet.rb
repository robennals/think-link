require 'ruby-debug'

class Snippet < ActiveRecord::Base
	belongs_to :point
	belongs_to :user
	belongs_to :source
	has_many :ratings
	has_many :bookmarks
	
	def url
	  snipurl = Snippet.find(self.id, :select=>'url_real')[:url_real]
	  matcharray = snipurl.match('pdf-[1-9]+.html') # see if matches html-generated pdf document
	  if (!matcharray.nil?)
	    return snipurl.chomp(matcharray[0]).concat('pdf.html') # if so, link back to main pdf frameset
	  else
	    return snipurl
	  end
	end
	
	def avgrating
		return ratings.average("rating")
	end
	
	def numbookmarks
	  return self.bookmarks.count()
	end
	
	def isbookmarked(user)
	  if user.nil? 
	    return false
	  end
	  count = Bookmark.find(:all,:conditions =>"user_id=#{user.id} AND snippet_id=#{self.id}").size
    return count > 0 
	end
	
	def isdeleted(user)
	  if user.nil? 
	    return false
	  end
	  count = Deletion.find(:all,:conditions =>"user_id=#{user.id} AND snippet_id=#{self.id}").size
    return count > 0
	end 
	
	def isdeletedall
	  count = Deletion.find(:all,:conditions =>"snippet_id=#{self.id}").size
    return count > 2
	end 
	
	def topics
	  return self.point.topics
	end
end
