require 'datastore.rb'

require 'ruby-debug'

$letters = "0123456789abcdefghijklmnopqrstuvwxyz";
$count = 0

module AddWiki
	include Datastore		
		
	def add_wiki
		fromfile = File.open "/home/rob/Reference/Wikipedia/java_wordfreqs_once"
		fromfile.each do |line|
			$count+=1;
			keywords = line.scan(/(.+):([^#]+)\n/)
			keywords.each do |keyword|
				insert_prefix keyword[0]
			end
			if $count % 10000 == 0
				puts "count: #{$count}"
			end
		end
	end
	
	def insert_prefix(prefix)
		sql_insert "INSERT DELAYED INTO v2_prefix (prefix) VALUES 
			('#{esc(prefix)}')"
	end
	
	
end
