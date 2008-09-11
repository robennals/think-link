#  Copyright 2008 Intel Corporation
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

require 'ruby-debug'

class Snippet < ActiveRecord::Base
	belongs_to :point
	belongs_to :user
	belongs_to :source
	has_many :ratings
	has_many :bookmarks
	
	def goodurl
		snipurl = url_real
		if !url_real || url_real == ""
			return url
		end
		#  snipurl = Snippet.find(self.id, :select=>'url_real')[:url_real]
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
