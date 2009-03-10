
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


outfile = File.new("snopesclaims.csv","w")

Find.find("/home/rob/Reference/Crawls/www.snopes.com") do |path|
	next if FileTest.directory? path
	doc = Hpricot(open(path))
	claim = doc.search("//font[@color='#2D8F26']/b[text()*='Claim']")
	status = doc.search("//font[@color='#2D8F26']/b[text()*='Status']")
	next if claim.length != 1 
	next if status.length != 1
	
	claimtext = claim[0].parent.next.to_s.gsub(/^\s*\?\s*/,"").gsub(/[\n\r]/,"")
	statustext = status[0].parent.next.next.search("text()").to_s.gsub(/\./,"")
	
	puts "#{claimtext}\t#{path}\t#{statustext}"
	outfile.puts "#{path}\t#{statustext}\t#{claimtext}"
end

outfile.close
