require 'datastore.rb'

require 'ruby-debug'

$letters = "0123456789abcdefghijklmnopqrstuvwxyz";
$count = 0

module AddWiki
	include Datastore
		
	def add_wiki
		$letters.scan(/./).each do |x|
			$letters.scan(/./).each do |y|
				break if y > x 
				
				puts "processing - #{x}#{y}"
				fromfile = File.open "/home/rob/Reference/Wikipedia/filtered/#{x}#{y}"
				fromfile.each do |line|
					links = line.scan(/(.+)->(.+)/)
					links.each do |link|
						add_wiki_link link[0], link[1]
					end
				end
			end
		end
	end
	
	#TODO: search in lower case?
	#1 = topic
	def get_topic_id(name)
		id = sql_select_value "SELECT id FROM v2_node WHERE text = '#{esc(name)}'"
		if !id 
			id = sql_insert "INSERT INTO v2_node (text,user_id,type,info) VALUES ('#{esc(name)}',0,1,'')"			
		end
		if id == 0
			debugger
		end
		return id
	end
	
	# 1 = related_to
	def insert_link(src,dst)
		sql_insert "INSERT DELAYED INTO v2_link (src,dst,type) VALUES (#{src},#{dst},1)"
	end
	
	def add_wiki_link(x,y)
		xid = get_topic_id x
		yid = get_topic_id y
		insert_link xid,yid
#		add_link xid,"relates to",yid
	end
	
end
