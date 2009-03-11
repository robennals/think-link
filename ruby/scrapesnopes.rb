
require 'rubygems'
require 'hpricot'
require 'find'

#Find.find("/home/rob/Reference/Crawls/www.snopes.com") do |path|
	#next if FileTest.directory? path
	#doc = Hpricot(open(path))
	#bullets = doc.search("//img[@title='Red bullet']")
	#bullets.each do |bullet|
		#next if bullet.parent.name == "font"
		#claim = bullet.next.to_s + 
				#bullet.next.next.search("text()").to_s + 
				#bullet.next.next.next.to_s
		#href = bullet.next.next[:href]
		#puts "#{claim}\t#{href}\n"		
	#end
#end

def tidy_text(s)
	return s.gsub(/^s*\?\s*/,"").gsub(/[\n\r]/,"").gsub("&nbsp;"," ").gsub(/\s+/," ")
end

outfile = File.new("snopesclaims_text.csv","w")

Find.find("/home/rob/Reference/Crawls/www.snopes.com") do |path|
	next if FileTest.directory? path
	doc = Hpricot(open(path))
	claim = doc.search("//font[@color='#2D8F26']/b[text()*='Claim']")
	status = doc.search("//font[@color='#2D8F26']/b[text()*='Status']")
	next if claim.length != 1 
	next if status.length != 1
	next if path.include? "print=y"
	
	claimtext = ""
	node = claim[0].parent.next;
	while(node) do
		break if !node.search("font").empty?
		break if !node.text? && !node.comment? && node.name == "font"
		claimtext += node.search("text()").to_s
		node = node.next
	end
	claimtext = tidy_text claimtext
	
#	claimtext = claim[0].parent.next.to_s.gsub(/^\s*\?\s*/,"").gsub(/[\n\r]/,"")
	
	statustext = status[0].parent.next.next.search("text()").to_s.gsub(/\./,"")
	
	bodytext = doc.search("//font[@size='3']/div/text()").map{|node| node.to_s}.join " "
	bodytext = tidy_text(bodytext)
	url = path.gsub("/home/rob/Reference/Crawls/","http://")
	
	puts "#{claimtext}\t#{path}\t#{statustext}"
	outfile.puts "#{url}\t#{statustext}\t#{claimtext}\t#{bodytext}"
end

outfile.close
