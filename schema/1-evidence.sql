
CREATE TABLE evidence (
  id int(11) NOT NULL auto_increment,
  claim_id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  text varchar(512) NOT NULL,
  url varchar(2048) NOT NULL,
  title varchar(512) NOT NULL,
  verb enum('supports','opposes','relates') NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

INSERT INTO evidence (verb,claim_id,url,text,title)
	SELECT 'opposes',v2_node.id AS claim_id, url_prefix AS url, concat("FALSE: ",text) AS text, text AS title FROM v2_snippet, v2_node, v2_link WHERE v2_link.dst = v2_node.id AND v2_snippet.node_id = v2_link.src AND v2_link.type = 'opposes';

INSERT INTO evidence (verb,claim_id,url,text,title)
	SELECT 'supports',v2_node.id AS claim_id, url_prefix AS url, concat("TRUE: ",text) AS text, text AS title FROM v2_snippet, v2_node, v2_link WHERE v2_link.dst = v2_node.id AND v2_snippet.node_id = v2_link.src AND v2_link.type = 'supports';

DELETE FROM `v2_node` WHERE type = 'snippet'


