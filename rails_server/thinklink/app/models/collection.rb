class Collection  
	include ApplicationHelper
	
	def initialize(kind,txt,items)
		@kind = kind
		@txt = txt
		@items = items
		@id = getUniq
	end

	def icon(user)
		if @kind == "search"
			return "/images/magnifier.png"
		elsif @kind == "recent"
			return "/images/time.png"
		elsif @kind == "hot"
			return "/images/star.png"
		end
	end

	def childtitle
		if @kind == "search"
			return "search results"
		elsif @kind == "recent"
			return "recent folders"
		elsif @kind == "hot"
			return "hot items"
		end
	end

	attr_accessor :items
	attr_accessor :id
	attr_accessor :txt
	
	def self.search(query) 
	  topics = Topic.find :all, :conditions => "MATCH (txt) AGAINST ('#{query}' IN BOOLEAN MODE)"
    points = Point.find :all, :conditions => "MATCH (txt) AGAINST ('#{query}' IN BOOLEAN MODE)"
    items = topics.concat points
    
    return Collection.new("search","Search results for '#{query}'",items)
	end
	
	def self.recent(user)
		items = user.recenttopics.slice(0,50)
		return Collection.new("recent","Recent Folders",items)
	end
	
	#TODO: make this more efficient
	def self.hot
		points = Point.find_by_sql("
			SELECT points.id, points.txt, 
				COUNT(bookmarks.user_id) AS count 
				FROM points,
					(SELECT * FROM bookmark_points LIMIT 200) AS bookmarks 
			WHERE points.id = bookmarks.point_id 
			GROUP BY points.id
			ORDER BY count DESC, points.id DESC
			LIMIT 50")
		return Collection.new("hot","Hot Claims",points)			
	end
end
