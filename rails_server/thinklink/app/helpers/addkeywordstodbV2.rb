require 'datastore.rb'

require 'ruby-debug'

$letters = "0123456789abcdefghijklmnopqrstuvwxyz";
$count = 0

module AddWiki
	include Datastore		
		
	def add_wiki
		fromfile = File.open "/home/rob/Reference/Wikipedia/java_keywordiness_once"
		fromfile.each do |line|
			$count+=1;
			keywords = line.scan(/(.+)->(.+):([^#]+)\n/)
			keywords.each do |keyword|
				add_wiki_keyword keyword[0], keyword[1], keyword[2]
			end
			if $count % 10000 == 0
				puts "count: #{$count}"
			end
		end
	end
	
	#TODO: search in lower case?
	#1 = topic
	def get_topic_id(name)
		id = sql_select_value "SELECT id FROM v2_node WHERE text = '#{esc(name)}'"
		return id
	end

	def insert_prefix(prefix,link_id,score)
		sql_insert "INSERT DELAYED INTO v2_linkwords (prefix,link_id,score) VALUES 
			(#{esc(prefix)},#{link_id},#{score})"
	end
	
	def insert_keyword(prefix,link_id,score)
		sql_insert "INSERT DELAYED INTO v2_linkwords (prefix,link_id,score) VALUES 
			('#{esc(prefix)}',#{link_id},'#{score}')"
	end
	
	def add_wiki_keyword(prefix,target,score)
		targetid = get_topic_id target
		if targetid
			insert_keyword prefix,targetid,score
		end
	end
	
end
