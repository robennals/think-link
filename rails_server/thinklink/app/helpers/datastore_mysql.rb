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

module Datastore_mysql

# -- topic guessing --

	def guess_topics(text)
		suggestions = []
		words = text.scan(/\w+/)
		goodprefixes = [""]
		(1..words.length).each do |length|
			prefixes = []
			(0..words.length-length).each do |start|
				if goodprefixes.include? words[start...start+length-1].join " "
					prefixes.push words[start...start+length].join " "
				end
			end
			if prefixes.empty? then return sort_by_score suggestions end
			prefixcond = make_sql_or prefixes,"prefix"
			suggestions += sql_select_all "SELECT * FROM v2_linkwords WHERE #{prefixcond}"
			goodrows = sql_select_all "SELECT prefix FROM v2_prefix WHERE #{prefixcond}"			
			goodprefixes = goodrows.map {|x| x['prefix']}
		end
		return sort_by_score suggestions
	end
	
	def get_guess_infos(guesses)
		ids = guesses.map {|x| x['link_id']}
		prefixcond = make_sql_or ids, "id"
		infos = sql_select_all "SELECT * from v2_node WHERE #{prefixcond}"
		hsh = {}
		infos.each do |row|
			hsh[row['id']] = row
		end
		guesses.each do |guess|
			guess['node'] = hsh[guess['link_id']]
		end
		return guesses
	end
	
	def print_guesses(guesses)
		guesses.each do |guess|
			puts "#{guess['prefix']} -> #{guess['node']['text']}:#{guess['score']}"
		end
		return nil
	end
	
	def full_guesses(text)
		guess = guess_topics text
		infos = get_guess_infos guess[0..10]
		print_guesses infos
	end
	
	def sort_by_score(arr)
		return arr.sort {|x,y| y['score'].to_f <=> x['score'].to_f}
	end

	def make_sql_or(list,var)
		str = ""
		list.each do |val|
			if str != "" 
				str += " OR "
			end
			str += "(#{var} = '#{esc(val)}')"			
		end
		return str
	end

# --- snippets ---

	def get_url_snippets(url)
		return get_all("url",url,"snippets")
	end
		
	def add_snippet (text,url,realurl,title,user,summary='')
		id = add_node text,user,3,:url => url, :realurl => realurl, :title => title
		prefix = url[0..127]
		sql_insert "INSERT INTO v2_snippet (url_prefix,node_id) VALUES (#{esc(prefix)},#{id})"
		return id
	end

	# get all the snippets for a url, including the first claim for each snippet		
	def url_snippets(url)
		return sql_select_all "
			SELECT text,id,
			  (SELECT src FROM `v2_link` WHERE dst = v2_node.id LIMIT 1) AS claim_id,
			  (SELECT v2_node.text FROM v2_node WHERE id = claim_id LIMIT 1) AS claim_text 
			FROM v2_snippet WHERE url_prefix = '#{esc(url[1..128])}' LIMIT 100"
	end
	
	
# --- users --- 
	
	def get_user(email,password)		
		user = sql_select_one "SELECT * FROM v2_user WHERE email = '#{esc(email)}'"
		if !user
			return nil
		end		
		if user['password'] == password
			return user
		else
			return nil
		end
	end

	def add_user(email,name,password)
		id = add_node text,user,4,""
		sql_insert "SELECT INTO v2_user (email,node_id,password) VALUES ('#{esc(email)}','#{esc(node_id)}','#{esc(password)}')"
		return id
	end

	#TODO  (do this with a rating query)
	def user_deletes(userid)
		return []
	end
	def user_bookmarks(userid)
		return []
	end

	def get_newsnips(userid)
		return map_types(sql_select_all "
			SELECT v2_node.* FROM v2_node, v2_newsnips 
				WHERE v2_node.id = v2_newsnips.node_id
				AND v2_newsnips.user_id = #{userid} LIMIT 100")
	end


# --- history ---	
		
	def log_view(userid,id)	
		sql_insert "REPLACE DELAYED INTO v2_history (user_id,node_id) VALUES (#{userid},#{id})"		
	end
		
	def get_recent(userid)
		return map_types(sql_select_all "
			SELECT v2_node.* FROM v2_node, v2_history 
			 WHERE v2_node.id = v2_history.node_id 
			 AND v2_history.user_id = #{userid} LIMIT 100")
	end


# --- nodes and links ---
		
	def add_node(text,user,type,info)
		return sql_insert "INSERT INTO v2_node (text,user_id,type,info) 
			VALUES ('#{esc(text)}',#{user_id},#{type},'#{esc(type)}')"
	end
			
	def set_text(id,text,user)
		old_text = sql_select_value "SELECT text WHERE id = #{id}"
		sql_update "UPDATE v2_node SET v2_node.text='#{esc(text)}' WHERE id=#{id}"
		sql_insert "INSERT DELAYED INTO v2_renames (node_id,user_id,old_text,new_text)
			VALUES (#{id},#{user},'#{esc(old_text)}','#{esc(new_text)}')"
		insert :obj,id,:info,'text',name		
	end


	def add_link(subject,verb,object)
		type = int_for_verb verb
		return sql_insert "INSERT INTO v2_link (src,dst,type)
			VALUES (#{subject},#{object},#{type})"
		return id
	end
	
	def get_info(id)
		return map_type(sql_select_one "SELECT * FROM v2_node WHERE id=#{id}")
	end
		
	def get_links(id,userid = nil)
		info = get_info id
		out = {}
		out['id'] = info['id']
		out['text'] = info['text']
		out['type'] = info['type']
		out['opposed'] = info['opposed']
		out['avg_order'] = info['avg_order']
		out['from'] = map_links(get_links_from id)
		out['to'] = map_links(get_links_to id)
		if userid
			out['uservotes'] = sql_select_one "SELECT action FROM v2_vote 
				WHERE node_id = #{id} AND user_id = #{userid}"
		end
		return out
	end
	
	def map_links(links)
		hsh = Hash.new {|hash,key| hash[key] = []}
		map_types links
		links.each do |link|
			verb = verb_for_int link['linktype']
			link.delete 'linktype'
			hsh[verb].push link	
		end
		return hsh
	end
	
	def get_links_to(id)
		return sql_select_all "SELECT v2_node.id,text,v2_node.type AS type, v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link
			WHERE dst=#{id} AND src = v2_node.id"
	end

	def get_links_from(id)
		return sql_select_all "SELECT v2_node.id,text,v2_node.type AS type, v2_link.type AS linktype,v2_link.id AS linkid FROM v2_node,v2_link
			WHERE src=#{id} AND dst = v2_node.id"
	end
	
# --- search ---	
	
	def search(phrase)
		return map_types(sql_select_all "SELECT * FROM v2_node WHERE MATCH(text) AGAINST('#{esc(phrase)}') LIMIT 100")
	end
		
# -- ratings ---
	
	#TODO: replace these with the new "voting" system
	
	def set_order(id,userid,ordermap)
		# nothing 
	end
	
	def set_rating(id,user,rating)
		# nothing
	end
	
	def delete(id,userid)
		# nothing
	end
	
	def bookmark(id,userid)
		# nothing
	end
	
	def unbookmark(id,userid)
		# nothing
	end

	def int_for_verb(verb)
		case verb
			when "relates to": return 1
			when "supports": return 2
			when "opposes": return 3
			when "states": return 4
			when "about": return 5
			when "refines": return 6
			when "created by": return 7
		end			
	end
	
	def verb_for_int(int)
		case int.to_i 
			when 1: return "relates to"
			when 2: return "supports"
			when 3: return "opposes"
			when 4: return "states"
			when 5: return "about"
			when 6: return "refines"
			when 7: return "created by"
		end
	end
	
	def int_for_type(type)
		case type
			when "topic": return 1
			when "claim": return 2
			when "snippet": return 3
			when "user": return 4
		end	
	end
		
	def type_for_int(int)
		case int
			when "1": return "topic"
			when "2": return "claim"
			when "3": return "snippet"
			when "4": return "user"
		end
		return int
	end

	def map_type(row)
		row['type'] = type_for_int row['type']
		return row
	end

	def map_types(rows)
		rows.each do |row|
			row['type'] = type_for_int row['type']
		end
	end

	def map_verbs(rows)
		rows.each do |row|
			row['type'] = verb_for_int row['type']
		end
	end

	def sql_select_value(sql) 
		return ActiveRecord::Base.connection.select_value(sql)
	end

	def sql_select_one(sql)
		return ActiveRecord::Base.connection.select_one(sql)
	end
	
	def sql_select_all(sql)
		return ActiveRecord::Base.connection.select_all(sql)
	end
	
	def sql_insert(sql)
		return ActiveRecord::Base.connection.insert(sql)
	end
	
	def sql_execute(sql)
		ActiveRecord::Base.connection.execute(sql)
	end
		
	def esc(str)
#		return str.to_s.sub("'","''")
		return str.to_s.gsub(/\\|'/) { |c| "\\#{c}" }
	end
		
end
