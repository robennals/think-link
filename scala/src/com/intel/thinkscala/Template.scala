package com.intel.thinkscala

class Template {
  def mainpage {
(<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html;.
	charset=iso-8859-1" />
	<meta http-equiv="Content-Language" content="en-us" />
	<title>MindMix</title>
	<link href="/stylesheets/style.css?1232414608" media="screen" rel="stylesheet" type="text/css" />
	
	

	<script type="text/javascript" src="/javascripts/jquery-1.2.3.js"></script>
	<script type="text/javascript" src="/javascripts/robjson.js"></script>

	<script type="text/javascript" src="/javascripts/webui.js"></script>
	<script type="text/javascript" src="/javascripts/localconfig.js"></script>
	
</head>
<body id="body">
	<div id="container">
	<table style="margin:4px; width:100%"><tr><td>
	<span class="helpmessage">
	Use <b>drag and drop</b> to create new connections between claims and topics.
	</span>

	</td><td style="text-align:right; padding-right: 10px;">
	<span>
	
		
			Not logged in: <a href="/help/pluginlogin.html">set plugin account</a>
		
	
	</span>
	</td></tr>
</table>


<div>
<table class='mastertable' id="mastertable">

<tr>
<td class="mastercolumn">
<div id="browser1">
</div>
</td>
<td class="mastercolumn">
<div id="browser2">
</div>
</td>
</tr>
</table>
</div>

<!-- <div class="dragbar" id="dragbar" onmousedown="dragBar(event)">
</div>
-->

<script type="text/javascript">
  <xml:unparsed>
function doResize(){
	var nowheight = document.body.offsetHeight;
	var wantheight = window.innerHeight;
	var resizeBox = $(".browser_body");
	var bodyheight = resizeBox.get(0).offsetHeight;
	var pad = 20;
	
	resizeBox.css("height",bodyheight + wantheight - nowheight - pad);
	
//	topheight = $(".helpmessage").get(0).offsetHeight + $(".browsetitle").get(0).offsetHeight;
//	resizeBox.css("height",window.innerHeight - topheight);
}
var thinklink_user_id = 0;
var thinklink_deletes = make_hash([]);
var thinklink_bookmarks = make_hash([]);

makeArgBrowseFrame("browser1",{"from": {}, "text": "History of recent browsing", "to": {"colitem": [{"text": "Apple Lisa", "id": "23091", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Adam Clayton", "id": "34232", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Apple Corps v. Apple Computer", "id": "39626", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Apple III", "id": "52196", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Afar people", "id": "52481", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Atlascopcosaurus", "id": "61035", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Atlas Copco", "id": "61036", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Awash River", "id": "64457", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Bono", "id": "81075", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Barack Obama", "id": "82602", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "BNSF Railway", "id": "82733", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Bill Gates", "id": "85792", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Ann Dunham", "id": "97264", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Beja people", "id": "97748", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Bob Kerrey", "id": "108577", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Como Bluff", "id": "146796", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Avoiding Dangerous Climate Change", "id": "151986", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Chuck Hagel", "id": "173109", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Charles Thone", "id": "187647", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Dvorak Simplified Keyboard", "id": "251955", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Effects of global warming", "id": "304479", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Economics of global warming", "id": "317145", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Effects of global warming on Australia", "id": "317169", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Gaza Strip", "id": "387248", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Galesburg, Illinois", "id": "398527", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Global warming", "id": "398854", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Arthur Agee", "id": "462461", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Hypsilophodont", "id": "470240", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "J. James Exon", "id": "565207", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Jerome Corsi", "id": "597586", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Kyoto Protocol", "id": "637749", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "List of fossil sites", "id": "701928", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Lolo Soetoro", "id": "703882", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Laosaurus", "id": "734550", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Maya Soetoro-Ng", "id": "813406", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Apple", "id": "823651", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Maltron keyboard", "id": "871322", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Nebraska", "id": "941754", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "North American Union", "id": "967222", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "October (album)", "id": "1011948", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Othnielosaurus", "id": "1019277", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Qassam rocket", "id": "1148704", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "QWERTY", "id": "1149469", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Rattle and Hum", "id": "1166511", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Sweden", "id": "1247656", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Steve Jobs", "id": "1251790", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Stern Review", "id": "1267959", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Subtitle (captioning)", "id": "1330552", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "The Case Against Barack Obama", "id": "1483173", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "The Obama Nation", "id": "1523096", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "U2 discography", "id": "1575914", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "Velotype", "id": "1621489", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}, {"text": "William Gates", "id": "1647191", "info": "", "avg_order": "", "user_id": "0", "type": "topic", "opposed": "0"}]}, "id": "recent", "type": "recent"},"400px");
makeArgBrowseFrame("browser2",{"from": {}, "text": "Unattached Claims", "to": {"colitem": []}, "id": "newsnips", "type": "newsnips"},"400px");
doResize();
window.addEventListener("resize",doResize,true);

</xml:unparsed>
</script>	</div>

</body>
</html>)

  }
  
}
