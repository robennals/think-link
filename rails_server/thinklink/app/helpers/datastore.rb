
#TODO track deletions

require 'crapbase/crapbase_mysql'
# require 'json'

module DataStore
	include CrapBase

	def get_url_snippets(url)
		return get_all("url",url,"snippets")
	end
	
	def add_snippet (text,url,realurl,title)
		id = new_guid
		batch_insert :obj, id,
				:info => {:type => :snippet, :text => text, :url => url, :realurl => realurl, :title => title} 
		return id
	end
			
	def snippets_for_url(url)
		return get_all("url",url,snippets)
	end
	
	def add_node(text,type,user)  #claim or topic
		id = new_guid
		batch_insert :obj,id,:info => {:text => text, :type => type}
		return id
	end
	
	def add_link(subject,verb,object)
		id = new_guid
		batch_insert :obj, id, :info => {:type => :link, :subject => subject, :verb => verb, :object => object}
		return id
	end
	
	def get_links(nodeid)
		from = get_all :objgen,id,:links_from
		to = get_all :objgen,id,:links_to
		return {:links_from => from, :links_to => to}
	end
	
	def add_node_rating(id,user,rating)
		insert :obj,id,:ratings,user,rating
	end
	
	def add_user(email,name,password)
		id = new_guid
		batch_insert :obj, id, 
				:info => {:type => "user", :email => email, :name => name, :password => password}
		return id
	end
	
	def set_newid (oldid,newid,type)
		batch_insert :compatmap,oldid,type => {:id => newid}
	end
	
	def get_newid (oldid,type)
		get_column :compatmap,oldid,type,:id
	end


private	
	def get_tables
		return { 
			:obj => [:info, :ratings],
			:objgen => [:links_from, :links_to, :avg_rating, :props],
			:url => [:snippets],
			:email => [:user],
			:compatmap => [:claim,:topic,:user,:snippet]
		}	
	end

	def delete_datastore
		delete_tables(get_tables()) 
	end

	def update_link(key,info)
		subjinfo = get_all :obj,info[:subject],:info
		objinfo = get_all :obj,info[:object],:info
		insert :objgen,info[:subject],:links_from,key,
			{:verb => info[:verb], :object=>info[:object], :text => objinfo[:text]}
		insert :objgen,info[:object],:links_to,key,info
			{:verb => info[:verb], :subject=>info[:subject], :text => subjinfo[:text]}
	end

	def update_obj_links(key)
		links_to = get_all :objgen,key,:links_to
		links_to.each do |object,json|
			link = JSON.parse json
			update_link(key,{:object => object,:subject=>link[:subject],:verb => link[:verb]} 
		end
		links_from = get_all :objgen,key,:links_from
		links_from.each do |subject,json|
			link = JSON.parse json
			update_link(key,{:object => object,:subject=>link[:subject],:verb => link[:verb]} 
		end

	end

	def initialize_datastore
		initialize_crapbase
	
		create_tables(get_tables())
				
		#url -> snippet info
		add_trigger :table => :obj, :family => :info, :column => :url do |table,key,values|
			info = values[:info]
			insert :url, info[:url], :snippets, key, info
		end
		
		#email -> user
		add_trigger :table => :obj, :family => :info, :column => :email do |table,key,values|
			info = values[:info]
			insert :email, info[:email], :user, key, info 
		end
		
		#link -> related objects for each linked object
		add_trigger :table => :obj, :family => :info, :column => :subject do |table,key,values|
			info = values[:info]
			subjinfo = get_all :obj,info[:subject],:info
			objinfo = get_all :obj,info[:object],:info
			insert :objgen,info[:subject],:links_from,key,
				{:verb => info[:verb], :object=>info[:object], :text => objinfo[:text]}
			insert :objgen,info[:object],:links_to,key,info
				{:verb => info[:verb], :subject=>info[:subject], :text => subjinfo[:text]}

#			update_link key,values[:info]
		end
		
		#link -> mark item as being supported or opposed when link created
		add_trigger :table => :obj, :family => :info, :column => :verb do |table,key,values|
			info = values[:info]
			if info[:verb] == 'opposes'
				insert :objgen,values[:object],:props,:opposed,true
			elsif 
				info[:verb] == 'supports'
				insert :objgen,values[:object],:props,:supported,true
			end
		end
		
		#delayed rating aggregation
		add_batch_trigger :table => :obj, :family => :ratings, :delay => 10 do |keys|
			keys.each do |key|
				ratings = get_all :obj,key,:ratings
				sum = 0
				count = 0
				ratings.each do |rating|
					sum += rating
					count += 1
				end
				insert :objgen,key,:avg_rating,:rating,sum/count
			end
		end		
				
	end
	
	#need: no be able to update different parts of the YAML for a single snippet
	# with different queries
	#or just to be able to cluster different column groups so we know they can be
	#accessed efficiently at the same time
		
end
