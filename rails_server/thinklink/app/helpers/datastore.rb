
require 'crapbase/crapbase_mysql'
require 'json'

$base = CrapBase.new

module DataStore
	def get_url_snippets(url)
		return $base.get_all("url",url,"snippets")
	end
	
	def add_snippet (text,url,realurl,title)
		id = $base.new_guid
		$base.batch_insert :obj, id, :info => {:type => :snippet}, 
				:snipinfo => {:text => text, :url => url, :realurl => realurl, :title => title} 
	end
		
#	def add_snippet info
#		id = $base.new_guid
#		$base.batch_insert "snippet",id,	:info => info		
##		{
##				:text => text, :claim => claim, :claimtxt => claimtxt,
##				:url => url, :realurl => realurl, 
##				:pagetitle => pagetitle, :normtitle => normtitle,
##				:author => author}		
#		return id
#	end
	
	def snippets_for_url(url)
		return $base.get_all("url",url,snippets)
	end
	
	def add_node(text,type,user)  #claim or topic
		id = $base.new_guid
		$base.batch_insert :obj,id,:info => {:text => text, :type => type}
		return id
	end
	
	def add_link(subject,verb,object)
		id = $base.new_guid
		$base.insert :obj, id, :linkinfo => {:subject => subject, :verb => verb, :object => object}
	end
	
	def get_links(nodeid)
		from = $base.get_all :obj,id,:links_from
		to = $base.get_all :obj,id,:links_to
		snippets = $base.get_all :obj,id,:snippets
		return {:links_from => from, :links_to => to, :snippets => snippets}
	end
	
	def add_node_rating(id,user,rating)
		$base.insert :obj,id,:ratings,user,rating
	end
	
	def add_user(email,name,password)
		id = $base.new_guid
		$base.batch_insert :obj, id, 
				:userinfo => {:email => email, :name => name, :password => password}
		return id
	end
	

private	
	def initialize	
		$base.create_tables(
			:obj => [:info, :snipinfo, :userinfo, :linkinfo, :ratings, 
									:links_from, :links_to, :avg_rating],
			:url => [:snippets],
			:compatmap => [:claim,:topic,:user]
			)
				
		#url -> snippet info
		$base.add_trigger :table => :obj, :family => :snipinfo do |key,values|
			info = values[:info]
			$base.insert :url, info[:url], :snippets, key, info
		end
		
		#link -> related objects for each linked object
		$base.add_trigger :table => :obj, :family => :linkinfo do |key,values|
			info = values[:info]
			$base.insert :obj,info[:subject],:links_to,key,info
			$base.insert :obj,info[:object],:links_to,key,info
		end
		
		#delayed rating aggregation
		$base.add_batch_trigger :table => :user, :family => :ratings, :delay => 10 do |keys|
			keys.each do |key|
				ratings = $base.get_all :node,key,:ratings
				sum = 0
				count = 0
				ratings.each do |rating|
					sum += rating
					count += 1
				end
				$base.insert :obj,key,:avg_rating,:rating,sum/count
			end
		end		
	end
	
	#need: no be able to update different parts of the YAML for a single snippet
	# with different queries
	#or just to be able to cluster different column groups so we know they can be
	#accessed efficiently at the same time
		
end

$store = DataStore.new
