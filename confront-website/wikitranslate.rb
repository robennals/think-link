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
#
#  This is a modified version of the "wikitranslate" program originally
#  written by Rob Ennals to create his home page, relicensed under 
#  an Apache license as part of Think Link.


require 'ftools'


def articleName filename
	name = filename.gsub(/(.*\/)?(.+)\.txt/,'\2')
	name = name.gsub("_"," ");
	return name;	
end

def fileName title
  return title.gsub(/\s/,'_');
end

def out_name title
  return "docweb/"+fileName(title)+".html"
end

def link_name title
	return fileName(title)+".html"
end

def listing_name filename
  return filename + "/index.html"
end

def noArgs(str)
	if str =~ /.*\(/
		str = str.scan(/(.*)\(/)[0][0]
	end
	if str =~ /.*\?/
		str = str.scan(/(.*)\?/)[0][0]
	end

	return str;
end

def make_headings(title)
  txt = ""	
  filename = fileName(title) + ".txt";
  started = false
  file = File.open filename
  file.each { |line| 		
  	if line =~ /===.+===/ then
  	    if !started then
      	txt << "<div class='headlinks'>"
    	  started = true
	    end
  		topic = line.scan(/===\s*(.*[^\s])\s*===/)[0][0];
  		txt << "<div class='headlink'><a href='#"+noArgs(fileName(topic))+"'>"+topic+"</a></div>"
  	end
  }
  if started then
	  txt << "</div>"
  end
  file.close;
  return txt;
end

def topic_link(topic,anchor,name)
  link = link_name(topic);
  if anchor then
  	link = link + "#" + fileName(anchor);
	end
	if $articles.include? topic then
		return "<a href='"+link+"'>"+name+"</a>"
	else
		return topic
	end	
end


def process_file(title)
	txt = "";

  filename = fileName(title) + ".txt";
  
  txt << make_headings(title)
  
	file = File.open filename
	inbullets = false
	inpre = false
	inbox = false
	file.each { |line|
	   if line =~ /^\s*\*(.*)/ then
	     line = line.gsub(/^\s*\*(.*)/,'<li>\1')
	     if !inbullets then
	       line = '<ul>'+line
	       inbullets = true
	     end
     elsif inbullets then
         line = '</ul>'+line
         inbullets=false
     end
     if line =~ /<\/pre>/ then
     	 inpre = false
     end

     if line =~ /<pre.*>/ then
     	 inpre = true
     	 txt << line;
     	 line = ""
     elsif inpre then
     	 line = line.gsub(/</,"&lt;");
     	 line = line.gsub(/>/,"&gt;");
     	 txt << line;
     	 line = ""
     end
     if line =~ /===.+===/ then
  		 topic = line.scan(/===\s*(.*[^\s])\s*===/)[0][0];
  		 line = "<a name='"+noArgs(fileName(topic))+"'><h3>"+topic+"</h3></a>"   		
 	   end	 	 
	 	 if line =~ /==.+==/ then
	 	   line = line.gsub(/==(.+)==/,"<a name='\\1'><h2>\\1</h2></a>")
 	   end
	 	 if line =~ /\[\[image:.+\]\]/ then
 		 	 	line = line.gsub(/\[\[image:(.+)\]\]/,"<a class='imagelink' target='_blank' href='images/\\1'><img class='bigimage' src='images/\\1'/></a>");
		 end
 	 	 if line =~ /\[\[imagebox:.+\]\]/ then
 		 	 	line = line.gsub(/\[\[imagebox:(.+)\]\]/,"<a class='imagelink' href='images/\\1'><img class='imagebox' src='images/\\1'/></a>");
		 end

     if inbox && line =~ /(.+)=(.+)/ then
     	  line = line.gsub(/(.+)=(.+)/,"<tr><td class='argname'>\\1</td><td class='argdesc'>\\2</td></tr>")
     end

		 if line =~ /\{\{arguments/ then
		 	  inbox = true
		 		line = "<div class='arghead'>Arguments:</div><div class='argbox'><table class='argtable'><tbody>"
		 end
		 if line =~ /\{\{(.*)/ then
		 	  inbox = true
		 	  head = line.scan(/\{\{(.*)/)[0][0];
		 		line = "<div class='arghead'>"+head+"</div><div class='argbox'><table class='argtable'><tbody>"
		 end
	   if line =~ /\}\}/ then
	   		inbox = false
	   		line = "</tbody></table></div>"
     end
 	 	 if line =~ /\[\[.+\#.+\]\]/ then
		 	 	line = line.gsub(/\[\[([^\]]+)\#([^\]]+)\]\]/) { |nothing| topic_link($1,$2,$2)};
		 end
 	 	 if line =~ /\[\[\#.+\]\]/ then
		 	 	line = line.gsub(/\[\[\#([^\]]+)\]\]/) { |nothing| "<a href='#"+$1+"'>"+$1+"</a>"}
		 end

 	 	 if line =~ /\[\[.+\|.+\]\]/ then
		 	 	line = line.gsub(/\[\[([^\]]+)\|([^\]]+)\]\]/) { |nothing| topic_link($1,nil,$2)};
		 end

	 	 if line =~ /\[\[.+\]\]/ then
		 	 	line = line.gsub(/\[\[([^\]]+)\]\]/) { |nothing| topic_link($1,nil,$1)};
		 end
		 #line = line.gsub(/\'\'([^\']+)\'\'/,"<span class='keyword'>\\1</span>");		 
	   if !(line =~ /[^\s]+/) then
 	     line = "<p>\n"
     end
     if !inpre then
     	txt << line
     end
	}
	file.close

  outfile = File.new(out_name(title),"w")
	template = File.open("template.html")
	
	template.each{|line|
		line = line.gsub("$TITLE",title);
		line = line.gsub("$CONTENT",txt);
		outfile.puts line
	}

	outfile.close
	template.close


end


$files = Dir["*.txt"];
$articles = [];
$files.each{|file|
	$articles <<= articleName file;
}

$articles.each { |title|
	puts title;
	process_file(title);
}
