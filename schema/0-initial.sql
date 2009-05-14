
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";




CREATE TABLE turk_claim (
  id int(11) NOT NULL auto_increment,
  hit_id int(11) NOT NULL,
  node_id int(11) NOT NULL,
  ev_id int(11) NOT NULL,
  turker_id int(11) NOT NULL,
  PRIMARY KEY  (id),
  KEY hit_id (hit_id)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



CREATE TABLE v2_history (
  user_id int(11) NOT NULL,
  node_id int(11) NOT NULL,
  `date` timestamp NOT NULL default CURRENT_TIMESTAMP,
  UNIQUE KEY user_id_2 (user_id,node_id),
  KEY user_id (user_id),
  KEY `date` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



CREATE TABLE v2_link (
  id int(11) NOT NULL auto_increment,
  src int(11) NOT NULL,
  dst int(11) NOT NULL,
  `type` enum('relates to','supports','opposes','about','snippro','snipcon','snipabout','instance') NOT NULL,
  user_id int(11) NOT NULL,
  agg_votes int(11) NOT NULL default '0',
  PRIMARY KEY  (id),
  UNIQUE KEY src (src,dst,`type`),
  KEY src_2 (src),
  KEY dst (dst)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;



CREATE TABLE v2_linkwords (
  prefix varchar(128) character set latin1 collate latin1_general_cs NOT NULL,
  link_id int(11) NOT NULL,
  score float NOT NULL,
  PRIMARY KEY  (prefix,link_id)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



CREATE TABLE v2_newsnips (
  user_id int(11) NOT NULL,
  node_id int(11) NOT NULL,
  KEY user_id (user_id,node_id)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



CREATE TABLE v2_node (
  id int(11) NOT NULL auto_increment,
  `text` varchar(512) character set utf8 NOT NULL,
  user_id int(11) NOT NULL,
  `type` enum('topic','claim','snippet','user','junk') NOT NULL,
  info text NOT NULL,
  opposed tinyint(1) NOT NULL default '0',
  description varchar(256) NOT NULL default '',
  avg_order varchar(512) NOT NULL default '',
  instance_count int(11) NOT NULL default '0',
  agree_count int(11) NOT NULL default '0',
  disagree_count int(11) NOT NULL default '0',
  PRIMARY KEY  (id),
  KEY `text` (`text`(333)),
  KEY instance_count (instance_count,agree_count,disagree_count),
  FULLTEXT KEY text_2 (`text`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;



CREATE TABLE v2_searchresult (
  id int(11) NOT NULL auto_increment,
  search_id int(11) NOT NULL,
  url_id int(11) NOT NULL,
  abstract varchar(512) NOT NULL,
  pagetext varchar(2048) NOT NULL,
  searchdate timestamp NOT NULL default CURRENT_TIMESTAMP,
  position int(11) NOT NULL,
  state enum('true','false','unknown') NOT NULL default 'unknown',
  claim_id int(11) NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY search_id_2 (search_id,url_id,abstract),
  KEY search_id (search_id)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;



CREATE TABLE v2_searchurl (
  id int(11) NOT NULL auto_increment,
  url varchar(512) NOT NULL,
  title varchar(512) NOT NULL,
  url_hash int(11) unsigned NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY url (url),
  KEY url_hash (url_hash)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;



CREATE TABLE v2_searchvote (
  result_id int(11) NOT NULL,
  search_id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  vote tinyint(1) NOT NULL,
  `date` timestamp NOT NULL default CURRENT_TIMESTAMP,
  UNIQUE KEY result_id_2 (result_id,search_id,user_id),
  KEY search_id (search_id)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



CREATE TABLE v2_snippet (
  node_id int(11) NOT NULL,
  url_prefix varchar(128) NOT NULL,
  page_text text character set utf8 NOT NULL,
  PRIMARY KEY  (node_id),
  KEY url_prefix (url_prefix)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



CREATE TABLE v2_snipsearch (
  id int(11) NOT NULL auto_increment,
  searchtext varchar(512) NOT NULL,
  claim_id int(11) NOT NULL,
  marked_yes int(11) NOT NULL default '0',
  marked_no int(11) NOT NULL default '0',
  PRIMARY KEY  (id),
  UNIQUE KEY searchtext (searchtext,claim_id)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;



CREATE TABLE v2_turkresult (
  result_id int(11) NOT NULL,
  turkuser varchar(64) NOT NULL,
  vote tinyint(1) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;



CREATE TABLE v2_user (
  id int(11) NOT NULL auto_increment,
  email varchar(64) NOT NULL,
  `password` varchar(16) NOT NULL,
  nonce varchar(16) NOT NULL,
  `name` varchar(64) NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;



CREATE TABLE v2_vote (
  user_id int(11) NOT NULL,
  node_id int(11) NOT NULL,
  link_id int(11) NOT NULL,
  vote tinyint(4) NOT NULL,
  PRIMARY KEY  (user_id,node_id,link_id),
  KEY link_id (link_id)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
