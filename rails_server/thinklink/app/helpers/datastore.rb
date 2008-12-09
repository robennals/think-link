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

# All data access must go in this file
# Every server request should perform all it's data access by calling ONE of these functions

#TODO track deletions
#TODO use denormalization to make get_links and url_snippets faster
#TODO search should use steming
#TODO use a memcache to avoid the cost of checking delete etc status for everything

require 'crapbase/crapbase_mysql'
# require 'json'

$bad_words = ["the","and","his","her","from","his","has","from","then","can","will","new","one","two","our"]

def printobjs(objs)
	keys = {}
	objs.each do |obj|
		obj.keys.each do |key|
			keys[key]=true
		end
	end
	keys.keys.each do |key|
		print key[0,10].ljust 10
		print " "
	end			
	print "\n"
	objs.each do |obj|
		keys.keys.each do |key|
			val = obj[key]
			if !val 
				val = ""
			end
			print val.to_s[0,10].ljust 10
			print " "
		end
		print "\n"
	end
	return nil		
end

def printlinks(obj)
	print "-- to --\n"
	obj['to'].each do |verb|
		print "#{verb}:\n"
		printobjs obj['to'][verb]
	end
	print "-- from --\n"
	obj['from'].each do |verb|
		print "#{verb}:\n"
		printobjs obj['to'][verb]
	end

end


module Datastore
	include CrapBase

# --- snippets ---

	def get_url_snippets(url)
		return get_all("url",url,"snippets")
	end
		
	def add_snippet (text,url,realurl,title,user,summary='')
		id = new_guid
		batch_insert :obj, id,
				:info => {:type => :snippet, 'text' => text, 'url' => url, 
						'realurl' => realurl, 'title' => title, 'user' => user, 'summary' => summary} 
		return id
	end

	def claim_for_snippet(key)
		links = get_all_json :objgen,key,:links_from
		links.each do |key,value|
			if value['verb'] == 'states'
				claim = value['object']
				info = get_all :obj,claim,:info
				props = get_all :objgen,claim,:props
				return {:id => value['object'], :text => info['text']}.merge(props)
			end
		end
		return nil
	end
	
	# get all the snippets for a url, including the first claim for each snippet		
	def url_snippets(url)
		snips = get_all_json :url,url,:snippets
		out = []
		snips.each do |key,data|		
			out.push :text => data['text'], :id => key, :claim => claim_for_snippet(key)
		end
		return out
	end
	
	
# --- users --- 
	
	def get_user(email,password)		
		users = get_slice_json :email, email, :user, 0, 1
		if users.empty?
			return nil
		end
		user = users[users.keys.first]
		user['id'] = users.keys.first
		if user['password'] == password
			return user
		else
			return nil
		end
	end

	def add_user(email,name,password)
		id = new_guid
		batch_insert :obj, id, 
				:info => {:type => "user", 'email' => email, 'name' => name, 'password' => password, 'date' => get_time}
		return id
	end

	def user_deletes(userid)
		return (get_all :obj,userid,:deleted).keys
	end
	
	def user_bookmarks(userid)
		return (get_all :obj,userid,:bookmarked).keys
	end

	def get_newsnips(userid)
#		newsnips = get_all :objgen,userid,:newsnips
		return (info_for_ids(get_all(:objgen,userid,:newsnips))).sort {|a,b| b['id'] <=> a['id']}
	end


# --- history ---	
		
	def log_view(userid,id)			
		insert :user,userid,:recent,Time.now.xmlschema,id
	end
	
	def info_for_ids(ids,limit = 100)
		seen = {}
		results = []
		ids.each do |id,data|
			if !seen.has_key? id
				seen[id] = true
				results.push get_info(id)
			end
			if results.length > limit
				return results
			end
		end		
		return results
	end
	
	def get_recent(userid)
		results = []
		recentids = get_slice :user,userid,:recent,0,200,true
		keys = recentids.keys.sort.reverse
		seen = {}
		keys.each do |time|
			id = recentids[time]
			if !seen.has_key? id 
				seen[id] = true
				results.push get_info(id)
			end
			if results.length > 100
				return results
			end
		end
		return results
	end


# --- nodes and links ---
		
	def add_node(type,user,info)  #claim or topic
		id = new_guid
		batch_insert :obj,id,:info => info.merge(:type => type, 'user' => user, 'date' => get_time)
		return id
	end
	
	def set_text(id,name)
		insert :obj,id,:info,'text',name		
	end

	
	def add_link(subject,verb,object)
		id = new_guid
		batch_insert :obj, id, :info => {:type => :link, 'subject' => subject, 'verb' => verb, 'object' => object, 'date' => get_time}
		return id
	end
	
	def get_info(id)
		info = get_all :obj,id,:info
		props = get_all :objgen,id,:props
		return props.merge(info).merge('id' => id)
	end
	
	def get_first_snippet(id)
		to = get_all_json :objgen,id,:links_to
		to.each do |key,link|
			if link['verb'] == 'states'
				return get_all :obj,link['subject'],:info
			end
		end
		return nil
	end
	
	def get_for_type(type,limit=10,offset=0)
		results = []
		rows = sql_select_all("SELECT * FROM obj_info WHERE columnname = 'type' AND value = '#{type}' LIMIT #{limit} OFFSET #{offset}")
		rows.each do |row|
			results.push(get_info(row['keyname']))
		end	
		return results
	end	
				
	# get all the links to and from a snippet, and all the info for each of them
	def get_links(id,userid = nil)
		out = get_info id
		out['from'] = get_links_from id
		out['to'] = get_links_to id
		if userid 			
			out['userorder'] = get_column :obj,id,:orders,userid
#			out['from'].each do |verb,list|
#				list.each do |link|
#					link['deleted'] = get_column :obj,link['id'],:deletes,userid				
#				end
#			end
#			out['to'].each do |verb,list|
#				list.each do |link|
#					link['deleted'] = get_column :obj,link['id'],:deletes,userid			
#				end	
#			end
		end		
		return out
	end
	
	def get_links_to(id)
		to = get_all_json :objgen,id,:links_to
		links_to = {}
		to.each do |key,link|
			keypush links_to, link['verb'], get_info(link['subject']).merge('linkid'=>key)
		end
		return links_to
	end
	
	def get_links_from(id)
		from = get_all_json :objgen,id,:links_from
		links_from = {}
		from.each do |key,link|
			keypush links_from, link['verb'], get_info(link['object']).merge('linkid'=>key)
		end
		return links_from
	end
	

# --- search ---	
	
	def search(phrase)
		words = phrase.split ' '
		idscore = {}
		words.each do |word|
			if word.length > 2 && !$bad_words.include?(word)
				hits = get_all :word, word, :objects
				freq = hits.length
				hits.keys.each do |id|
					idscore[id] = (1.0/freq) + idscore.fetch(id,0)
				end
			end 
		end	
		results = []
		sorted = idscore.sort {|a,b| b[1] <=> a[1]}	
		sorted.each do |idrow|
			id = idrow[0]
			results.push get_info(id)
		end
		return results
	end
	
	def get_keywords(nodeid)
		node = get_info nodeid
		words = node['text'].split ' '
		keywords = {}
		words.each do |word|
			freq = get_column_count :word, word, :objects			
			keywords[word] = freq
		end
		return keywords
	end
	
# -- ratings ---
	
	def set_order(id,userid,ordermap)
		insert :obj,id,:orders,userid,ordermap
	end
	
	def set_rating(id,user,rating)
		insert :obj,id,:ratings,user,rating
	end
	
	def delete(id,userid)
		insert :obj,userid,:deleted,id,get_time  # what did the user want to delete
	end
	
	def bookmark(id,userid)
		insert :obj,userid,:bookmarked,id,get_time 
	end
	
	def unbookmark(id,userid)
		remove :obj,userid,:bookmarked,id
	end
	
	# HACK: do this more nicely - should be deleting the link object
#	def delete_link(subject,object,verb)
#		insert :obj,subject,:deletes,"#{subject}-#{verb}-#{object}",
#	end
		

# --- migration ---
	
	def set_newid (oldid,newid,type)
		batch_insert :compatmap,oldid,type => {:id => newid}
	end
	
	def get_newid (oldid,type)
		get_column :compatmap,oldid,type,:id
	end


private	
	def keypush(hsh,key,val)
		if !hsh.has_key? key
			hsh[key] = []
		end
		hsh[key].push val
	end

	def get_tables
		return { 
			:obj => [:info, :ratings, :orders, :deleted, :bookmarked],
			:user => [:recent, :orders],				# in addition to stuff in :obj
			:objgen => [:links_from, :links_to, :props, :deletedby, :newsnips],
			:url => [:snippets],
			:email => [:user],
			:word => [:objects,:props],
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
		add_trigger :table => :obj, :family => :info, :column => 'url' do |table,key,values|
			info = values[:info]
			insert :url, info['url'], :snippets, key, info
		end
		
		#email -> user
		add_trigger :table => :obj, :family => :info, :column => 'email' do |table,key,values|
			info = values[:info]
			insert :email, info['email'], :user,key,info 
		end
		
		#user -> newly created snippets 
		add_trigger :table => :obj, :family => :info, :column => 'url' do |table,key,values|
			info = values[:info]
			insert :objgen,info['user'],:newsnips,key,info			
		end
		
		#remove newsnips if this is a snippet
		add_trigger :table => :obj, :family => :info, :column => 'verb' do |table,key,values|
			info = values[:info]
			if info['verb'] == 'states'
				subjectuser = (get_info info['subject'])['user']
				remove :objgen,subjectuser,:newsnips,info['subject']
			end
		end
				
		
		#id -> who deleted it. Used in batch processing of item scores.
		add_trigger :table => :obj, :family => :deleted do |table,key,values|
			user = key
			values.each do |id,date|				
				insert :objgen,id,:deletedby,user,date
			end
		end
		
		#link -> related objects for each linked object
		#ISSUE: this updates the link immediately, and so we may see stale data		
		add_trigger :table => :obj, :family => :info, :column => 'verb' do |table,key,values|
			info = values[:info]			
			insert :objgen,info['subject'],:links_from,key,info
			insert :objgen,info['object'],:links_to,key,info
		end


		#link -> mark item as being supported or opposed when link created
		add_trigger :table => :obj, :family => :info, :column => 'verb' do |table,key,values|
			info = values[:info]
			if info['verb'] == 'opposes'
				insert :objgen,info['object'],:props,:opposed,true
				dirty_object :obj,key,:links
			elsif 
				info['verb'] == 'supports'
				insert :objgen,info['object'],:props,:supported,true
				dirty_object :obj,key,:links
			end
		end
		
		#object -> index of words used in the name
		add_trigger :table => :obj, :family => :info, :column => 'text' do |table,key,values|
			if values[:info][:type] != :snippet			
				text = values[:info]['text']
				text.split(' ').each do |word|
					if word.length > 2 && !$bad_words.include?(word)
						insert :word,word,:objects,key,''
					end
				end
			end
		end
		
		#count number of uses of each word
		add_batch_trigger :table => :word, :family => :objects, :delay => 10 do |keys|
			keys.each do |key|
				count = get_column_count :word, key, :objects
				insert :word, key, :props, :frequency, count
			end
		end
		
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
		
		#user ordering aggregation
		add_batch_trigger :table => :obj, :family => :orders, :delay => 10 do |keys|
			keys.each do |key|
				orders = get_all_json :obj,key,:orders
				scores = {}
				orders.each do |userid,ordermap|
					ordermap.each do |verb,order|
						pos = 1
						order.each do |id|
							scores.fetch(verb,{})[id] += 1.0/pos
							pos += 1
						end
					end
				end
				results = {}
				scores.each do |verb,scoremap|
					sorted = scoremap.sort {|a,b| b[1] <=> a[1]}
					results[verb] = sorted.map {a|a[0]}
				end
				insert :objgen,key,:props,:avg_order,results
			end
		end
	end
	
	
	def get_time
		return Time.now.iso8601
	end

	
	#need: no be able to update different parts of the YAML for a single snippet
	# with different queries
	#or just to be able to cluster different column groups so we know they can be
	#accessed efficiently at the same time
		
end
