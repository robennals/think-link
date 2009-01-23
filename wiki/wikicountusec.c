#include <glib.h>
#include <string.h>
#include <stdio.h>

char* letters = "0123456789abcdefghijklmnopqrstuvwxyz";

GHashTable* prefixes;


int main(){
	prefixes = g_hash_table_new(g_hash_str,g_str_equal);
	
	load_prefixes();
	
	process_wikipedia();
}

void load_prefixes(){
	len = strlen(letters);
	for(int i = 0; i < len; i++){
		char x = letters[i];
		char* filename = "namepruned/_";
		filename[11] = x;
		FILE* infile = fopen(filename,"r");

		char buf[4096];
		
		while(fgets(buf,sizeof(buf),infile)){
			
		}
		
		fclose(infile);
	}

}


$prefixes = {}

#total links is 143 million. (if one byte each then 143 Mb)
#3.5 Gb of link data
#considering only common links reduces by a factor of 20 (so should fit in memory)
#small wiki is 1,409,479 lines and 142,606,336 bytes (142Mb)
#big wiki is thus ~ 207,657,654 lines

# $prefixes = {"premium service" => 0, "premium" => 0}

$letters.scan(/./).each do |x|
	infile = File.open "namepruned/#{x}"

	puts x
	
	# load the prefixes		
	infile.each do |line|
		links = line.downcase.scan(/(.+):(.+)/)
		links.each do |link|
			name = link[0]
			words = name.scan(/\w+/)

			(0..words.length).each do |length|
				prefix = words[0..length]
				$prefixes[words.join " "] = 0
			end
			
			$count+=1
			
			if $count % 10000 == 0
				puts "reading words:#{$count}"
			end
		end
	end
	
	infile.close		
end

$count = 0		
ARGF.each do |line|
	words = line.downcase.scan(/\w+/)
	(0..words.length-1).each do |start|
		(1..words.length - start).each do |length|
			prefix = words[start...start+length].join " "
			if $prefixes.has_key? prefix
				$prefixes[prefix]+=1
			else
				break
			end
		end
	end	
	$count+=1
	if $count % 10000 == 0
		puts "reading wiki:#{$count}"
	end
end

outfile = File.new "prefixfreqs", "w"
$prefixes.each do |prefix,count|
	outfile.puts "#{prefix}:#{count}"
end

