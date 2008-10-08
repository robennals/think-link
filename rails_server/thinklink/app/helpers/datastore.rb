
#TODO track deletions

require 'crapbase/crapbase_mysql'
# require 'json'

module Datastore
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
	
	def claim_for_snippet(key)
		links = get_all_json :objgen,key,:links_from
		links.each do |key,value|
			value['verb'] = 'states'
			claim = value['object']
			info = get_all :obj,claim,:info
			props = get_all :objgen,claim,:props
			return {:id => value['object'], :text => info['text']}.merge(props)
		end
		return nil
	end
			
	def url_snippets(url)
		snips = get_all_json :url,url,:snippets
		out = []
		snips.each do |key,data|		
			out.push :text => data['text'], :id => key, :claim => claim_for_snippet(key)
		end
		return out
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
	
	def get_links(id)
		from = get_all :objgen,id,:links_from
		to = get_all :objgen,id,:links_to
		return {:links_from => from, :links_to => to}
	end
	
	def add_rating(id,user,rating)
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
			:objgen => [:links_from, :links_to, :props],
			:url => [:snippets],
			:email => [:user],
			:compatmap => [:claim,:topic,:user,:snippet]
		}	
	end

	def delete_datastore
		delete_tables(get_tables()) 
	end

	def update_obj_links(key)
		links_to = get_all :objgen,key,:links_to
		links_to.each do |object,json|
			link = ActiveSupport::JSON.decode json
			update_link(key,{:object => object,:subject=>link[:subject],:verb => link[:verb]}) 
		end
		links_from = get_all :objgen,key,:links_from
		links_from.each do |subject,json|
			link = ActiveSupport::JSON.decode json
			update_link(key,{:object => object,:subject=>link[:subject],:verb => link[:verb]}) 
		end
	end

	def update_link(key,info)
		subjinfo = get_all :obj,info[:subject],:info
		subjprops = get_all :objgen,info[:subject],:props
		objinfo = get_all :obj,info[:object],:info
		objprops = get_all :objgen,info[:object],:props

		insert :objgen,info[:subject],:links_from,key,
			objprops.merge(:verb => info[:verb], :object=>info[:object], :text => objinfo['text'])
		insert :objgen,info[:object],:links_to,key,
			subjprops.merge(:verb => info[:verb], :subject=>info[:subject], :text => subjinfo['text'])
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
		#ISSUE: this updates the link immediately, and so we may see stale data		
		add_trigger :table => :obj, :family => :info, :column => :verb do |table,key,values|
			info = values[:info]			
			insert :objgen,info[:subject],:links_from,key,info
			insert :objgen,info[:object],:links_to,key,info
		end

#		add_trigger :table => :obj, :family => :info, :column => :subject do |table,key,values|
#			update_link key,values[:info]
#		end
		
		#link -> mark item as being supported or opposed when link created
		add_trigger :table => :obj, :family => :info, :column => :verb do |table,key,values|
			info = values[:info]
			if info[:verb] == 'opposes'
				insert :objgen,info[:object],:props,:opposed,true
				dirty_object :obj,key,:links
			elsif 
				info[:verb] == 'supports'
				insert :objgen,info[:object],:props,:supported,true
				dirty_object :obj,key,:links
			end
		end

#		add_batch_trigger :table => :obj, :family => :info, :column => :url, :delay => 1 do |keys|
#			keys.each do |key|
#				info = get_all :obj,key,:info
#				links_to = get_all :objgen,key,:links_to
#				
#			end
#		end
		
		#delayed rating aggregation
		add_batch_trigger :table => :obj, :family => :ratings, :delay => 10 do |keys|
			keys.each do |key|
				ratings = get_all :obj,key,:ratings
				sum = 0
				count = 0
				ratings.each do |user,rating|
					sum += rating
					count += 1
				end
				insert :objgen,key,:props,:avg_rating,sum/count
			end
		end		
	
		# --- TEST API: for better derived indexes ---
		
		# dirty an object when there is a link to it   (full query language wouldn't require these)
		#	add_dirty_link :obj, :info, :subject, :obj, :link
		#	add_dirty_link :obj, :info, :object, :obj, :link

		#update links to this object whenever it changes
#		add_batch_trigger :table => :obj, :family => :info, :column => :text, :delay => 5 do |keys|
#			keys.each do |key|
#				links_to = get_all :objgen,key,:links_to
#				links_to.each do |object,json|
#					link = ActiveSupport::JSON.decode json
#					update_link(key,{:object => object,:subject=>link['subject'],:verb => link['verb']}) 
#				end
#				links_from = get_all :objgen,key,:links_from
#				links_from.each do |subject,json|
#					link = ActiveSupport::JSON.decode json
#					update_link(key,{:object => link['object'],:subject => subject,:verb => link['verb']})
#				end
#			end			
#		end	
#		
#		#every few seconds, update 
#		add_batch_trigger :table => :obj, :family => :info, :column => :verb, :delay => 5 do |keys|
#			keys.each do |key|
#				info = get_all :obj,key,:info
#				update_link key,info
#			end
#		end
	end


	
	#need: no be able to update different parts of the YAML for a single snippet
	# with different queries
	#or just to be able to cluster different column groups so we know they can be
	#accessed efficiently at the same time
		
end
