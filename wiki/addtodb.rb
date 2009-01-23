require 'datastore.rb'

$letters = "0123456789abcdefghijklmnopqrstuvwxyz";
$count = 0

module AddWiki
	include Datastore
		
	def add_wiki
		$letters.scan(/./).each do |x|
			$letters.scan(/./).each do |y|
				break if y > x 
				
				puts "processing - #{x}#{y}"
				fromfile = File.open "C:/Users/rob/Reference/Wikipedia/filtered/#{x}#{y}"
				fromfile.each do |line|
					links = line.scan(/(.+)->(.+)/)
					links.each do |link|
						add_wiki_link link[0], link[1]

#						$count = $count+1						
#						if $count > 10000 
#							return
#						end

					end
				end
			end
		end
	end
	
	#TODO: search in lower case?
	def get_topic_id(name)
		row = get_column :text,name,:nodes,"id"
		if !row 
			row = add_node 'topic',0,'text'=>name
		end
		return row
	end
	
	def add_wiki_link(x,y)
		xid = get_topic_id x
		yid = get_topic_id y
		add_link xid,"relates to",yid
	end
	
end