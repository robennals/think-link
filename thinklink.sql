-- phpMyAdmin SQL Dump
-- version 2.9.1.1-Debian-2ubuntu1
-- http://www.phpmyadmin.net
-- 
-- Host: localhost
-- Generation Time: Jul 16, 2008 at 11:02 AM
-- Server version: 5.0.38
-- PHP Version: 5.2.1
-- 
-- Database: `thinklink`
-- 

-- --------------------------------------------------------

-- 
-- Table structure for table `badsites`
-- 

CREATE TABLE `badsites` (
  `domain` varchar(128) NOT NULL,
  PRIMARY KEY  (`domain`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `badsites`
-- 

INSERT INTO `badsites` (`domain`) VALUES 
('associatedcontent.com');

-- --------------------------------------------------------

-- 
-- Table structure for table `document`
-- 

CREATE TABLE `document` (
  `url` varchar(128) NOT NULL,
  `title` varchar(128) default NULL,
  `author` varchar(128) default NULL,
  PRIMARY KEY  (`url`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `document`
-- 

INSERT INTO `document` (`url`, `title`, `author`) VALUES 
('http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/', 'Finding Contradictions in Text', 'Marie-Catherine de Marneffe'),
('http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', 'Ivan Titov, Ryan McDonald'),
('http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/', 'The information ecology of social media and online communities', 'Tim Finin, Anupam Joshi, Pranam Kolari, Akshay Java, Anubhav Kale and Amit Karandikar');

-- --------------------------------------------------------

-- 
-- Table structure for table `keywords`
-- 

CREATE TABLE `keywords` (
  `word` varchar(32) NOT NULL,
  `point` int(11) NOT NULL,
  PRIMARY KEY  (`word`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `keywords`
-- 


-- --------------------------------------------------------

-- 
-- Table structure for table `link`
-- 

CREATE TABLE `link` (
  `source_id` int(11) NOT NULL,
  `howlinked` enum('asserts','supports','identical','opposes','related') NOT NULL,
  `creator` int(11) NOT NULL,
  `linktype` enum('pp','sp') NOT NULL,
  `destid` int(11) NOT NULL,
  KEY `relation` (`howlinked`),
  KEY `creator` (`creator`),
  KEY `id` (`source_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `link`
-- 

INSERT INTO `link` (`source_id`, `howlinked`, `creator`, `linktype`, `destid`) VALUES 
(7, 'opposes', 0, 'pp', 9),
(9, 'supports', 0, 'pp', 2),
(7, 'supports', 0, 'pp', 3),
(7, 'supports', 0, 'sp', 4),
(5, 'asserts', 0, 'sp', 11),
(6, 'supports', 0, 'sp', 3),
(8, 'opposes', 0, 'sp', 7),
(10, 'supports', 0, 'sp', 7),
(11, 'supports', 0, 'sp', 21),
(0, '', 0, 'pp', 0);

-- --------------------------------------------------------

-- 
-- Table structure for table `object`
-- 

CREATE TABLE `object` (
  `id` int(11) NOT NULL auto_increment,
  `type` enum('user','point','link') NOT NULL,
  `latest` int(11) NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `type` (`type`,`latest`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- 
-- Dumping data for table `object`
-- 


-- --------------------------------------------------------

-- 
-- Table structure for table `pdf`
-- 

CREATE TABLE `pdf` (
  `url` varchar(512) NOT NULL,
  `dir` varchar(4) NOT NULL,
  `id` int(4) NOT NULL auto_increment,
  PRIMARY KEY  (`id`),
  KEY `url` (`url`,`dir`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=15 ;

-- 
-- Dumping data for table `pdf`
-- 

INSERT INTO `pdf` (`url`, `dir`, `id`) VALUES 
('http://www.educationaldatamining.org/EDM2008/uploads/proc/14_Lynch_43.pdf', '60', 5),
('http://ebiquity.umbc.edu/_file_directory_/papers/376.pdf', '2d', 6),
('http://www.aclweb.org/anthology-new/P/P08/P08-1118.pdf', 'd3', 7),
('http://www.aclweb.org/anthology-new/P/P08/P08-1036.pdf', '3c', 8),
('http://fmdb.cs.ucla.edu/Treports/890045.pdf', '98', 9),
('http://ebiquity.umbc.edu/paper/html/id/371/', 'd3', 11),
('http://portal.acm.org/ft_gateway.cfm?id=169209&type=pdf&coll=portal&dl=ACM&CFID=78220272&CFTOKEN=68137937', '73', 13),
('http://www.cs.berkeley.edu/~klein/papers/similarity-search-WWW-11.pdf', '5a', 14);

-- --------------------------------------------------------

-- 
-- Table structure for table `point`
-- 

CREATE TABLE `point` (
  `id` int(11) NOT NULL auto_increment,
  `txt` varchar(128) NOT NULL,
  `date` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`id`),
  KEY `txt` (`txt`),
  FULLTEXT KEY `text` (`txt`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=32 ;

-- 
-- Dumping data for table `point`
-- 

INSERT INTO `point` (`id`, `txt`, `date`) VALUES 
(1, 'test point 1', '2008-07-14 11:03:32'),
(2, 'test point 2', '2008-07-14 11:04:22'),
(3, 'Viewing opposing arguments helps people decide which argument they agree with', '2008-07-14 11:15:25'),
(4, 'Scope and context are important for statements and arguments', '2008-07-14 11:17:15'),
(5, 'Relationships between statements may be vague or difficult to define', '2008-07-14 15:41:45'),
(6, 'NLP tasks require large training sets to be effective', '2008-07-14 15:54:29'),
(7, 'Social media systems contribute up to one third of new web content.', '2008-07-15 13:44:34'),
(8, 'Finin et al analysed blogs to detect spam blogs, influential blogs, opinions, and communities of interest.', '2008-07-15 13:46:04'),
(9, 'Millions of people contribute to social media', '2008-07-15 13:46:31'),
(10, 'Finin et al modeled information flow and trust on blogs', '2008-07-15 13:48:31'),
(11, 'One can infer social networks from blog posts', '2008-07-15 14:06:29'),
(12, 'Finin et al detected influential blogs', '2008-07-15 14:07:23'),
(13, 'Influence on the web is often a function of topic', '2008-07-15 14:08:52'),
(14, 'Epidemic models can be used to find influential individuals', '2008-07-15 14:09:20'),
(15, 'A blog can be very influential without having many readers', '2008-07-15 14:10:19'),
(16, 'One can infer blog topics by looking at Bloglines folders', '2008-07-15 14:14:24'),
(17, 'Researchers have performed sentiment extraction on blog posts', '2008-07-15 14:18:09'),
(18, 'We can predict "tipping points" by analysing sentiment in blogs', '2008-07-15 14:18:43'),
(19, 'blog posts are difficult to analyse with standard language analysis tools', '2008-07-15 14:19:32'),
(20, 'Finin et al showed how to eliminate spam content from blogs', '2008-07-15 14:20:29'),
(21, '"link polarity" allows one to deduce which blogs influence each other', '2008-07-15 14:22:09'),
(22, 'Spam is a serious problem for blogs and social media', '2008-07-15 14:25:38'),
(23, 'Spam blogs use hijacked content to draw attention to adverts or link farms', '2008-07-15 14:28:29'),
(24, 'Spam blogs can be detected by looking at the word sequences on the page', '2008-07-15 14:30:26'),
(25, 'Spam blogs can be detected by looking at what links to them', '2008-07-15 14:32:11'),
(26, 'One can infer link polarity by the words around the link', '2008-07-15 14:34:17'),
(27, 'Link polarity can be inferred without using complex natural language processing techniques', '2008-07-15 14:36:00'),
(28, 'Republican blogs typically have a higher connectivity than democrat blogs', '2008-07-15 14:38:11'),
(29, 'Finin et al applied trust propagation models over polar links to infer trust and influence patterns for blogs', '2008-07-15 14:39:23'),
(30, 'Blog writers are enthusiastic blog readers', '2008-07-15 14:55:57'),
(31, 'Summary statements can serve as a representation of a document', '2008-07-16 10:56:50');

-- --------------------------------------------------------

-- 
-- Table structure for table `point_agreements`
-- 

CREATE TABLE `point_agreements` (
  `user` int(11) unsigned NOT NULL,
  `point` int(11) unsigned NOT NULL,
  `agree` tinyint(1) NOT NULL,
  PRIMARY KEY  (`user`,`point`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `point_agreements`
-- 


-- --------------------------------------------------------

-- 
-- Table structure for table `point_links`
-- 

CREATE TABLE `point_links` (
  `source` int(11) unsigned NOT NULL,
  `dest` int(11) unsigned NOT NULL,
  `howlinked` enum('asserts','supports','identical','opposes','related') NOT NULL,
  `creator` int(11) unsigned NOT NULL,
  KEY `source` (`source`),
  KEY `dest` (`dest`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `point_links`
-- 

INSERT INTO `point_links` (`source`, `dest`, `howlinked`, `creator`) VALUES 
(2, 1, 'related', 8),
(8, 10, 'related', 1),
(9, 7, 'related', 1),
(8, 12, 'related', 1),
(12, 14, 'related', 1),
(13, 16, 'related', 1),
(8, 20, 'related', 1),
(20, 25, 'related', 1),
(23, 25, 'related', 1),
(21, 26, 'related', 1),
(12, 21, 'related', 1),
(19, 27, 'related', 1);

-- --------------------------------------------------------

-- 
-- Table structure for table `ratings`
-- 

CREATE TABLE `ratings` (
  `snippet_id` int(11) unsigned NOT NULL,
  `point_id` int(11) unsigned NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `rating` int(4) unsigned NOT NULL,
  `time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`snippet_id`,`point_id`,`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `ratings`
-- 

INSERT INTO `ratings` (`snippet_id`, `point_id`, `user_id`, `rating`, `time`) VALUES 
(1, 1, 8, 3, '2008-07-14 11:05:29'),
(46, 29, 1, 4, '2008-07-15 14:39:28'),
(45, 28, 1, 3, '2008-07-15 14:39:32');

-- --------------------------------------------------------

-- 
-- Table structure for table `snippet`
-- 

CREATE TABLE `snippet` (
  `id` int(11) NOT NULL auto_increment,
  `txt` text NOT NULL,
  `url` varchar(128) NOT NULL,
  `pagetitle` varchar(128) NOT NULL,
  `title` varchar(128) NOT NULL,
  `author` varchar(128) default NULL,
  `source` int(11) NOT NULL,
  `date` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `creator` int(11) NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `url` (`url`,`date`,`creator`),
  FULLTEXT KEY `text` (`txt`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=50 ;

-- 
-- Dumping data for table `snippet`
-- 

INSERT INTO `snippet` (`id`, `txt`, `url`, `pagetitle`, `title`, `author`, `source`, `date`, `creator`) VALUES 
(1, 'In the beginning God created the heaven and the earth. ', 'http://mashmaker.intel-research.net/beth/', 'testing', '', NULL, 0, '2008-07-14 11:03:32', 8),
(2, 'And the evening and the morning were the third day', 'http://mashmaker.intel-research.net/beth/', 'testing', '', NULL, 0, '2008-07-14 11:04:22', 8),
(3, 'the system could enable voters to make more informed choices between candidates and sift through the amount of available informa- tion', 'http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/pdf-1.html', 'Page 1', 'Finding Contradictions in Text', NULL, 0, '2008-07-14 11:15:25', 8),
(4, 'The importance of event coreference was recognized in the MUC information extraction tasks in which it was key to identify sce- narios related to the same event', 'http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/pdf-2.html', 'Page 2', 'Finding Contradictions in Text', NULL, 0, '2008-07-14 11:17:15', 8),
(5, 'However, for contradiction detection to be useful, a looser definition that more closely matches human intuitions is necessary', 'http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/pdf-2.html', 'Page 2', 'Finding Contradictions in Text', NULL, 0, '2008-07-14 15:42:46', 8),
(6, 'For contradiction, however, it is critical to filter unrelated sentences to avoid finding false evidence of contradiction when there is contrasting information about different events.', 'http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/pdf-5.html', 'Page 5', 'Finding Contradictions in Text', NULL, 0, '2008-07-14 15:51:28', 8),
(7, 'highlight- ing the difficulty in generalizing from a small corpus of positive contradiction examples, as well as under- lining the complexity of building a broad coverage system', 'http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/pdf-7.html', 'Page 7', 'Finding Contradictions in Text', NULL, 0, '2008-07-14 15:57:37', 8),
(8, 'And God made two great lights', 'http://mashmaker.intel-research.net/beth/', 'testing', '', '', 0, '2008-07-14 18:00:40', 8),
(9, 'And God set them in the firmament of the heaven to give light upon the earth, 18: And to rule over the day and over ', 'http://mashmaker.intel-research.net/beth/', 'testing', '', '', 0, '2008-07-14 18:04:15', 8),
(10, 'Online reviews ', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-14 18:07:01', 8),
(11, 'We propose a statistical model which is able to discover corresponding topics in text and extract tex- tual evidence from reviews', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-15 09:03:12', 8),
(12, 'Our model achieves high ac- curacy, without any explicitly labeled data ex- cept the user provided opinion ratings', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', 'Ivan Titov', 0, '2008-07-15 09:05:28', 8),
(13, 'A word in the document is sampled either from the mixture of global topics or from the mixture of local topics specific to the local context of the word.', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-3.html', 'Page 3', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', 'Ivan Titov', 0, '2008-07-15 09:56:28', 8),
(14, 'in online discussion forum', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', NULL, 0, '2008-07-15 10:32:10', 1),
(15, 'However, these labels ', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', NULL, 0, '2008-07-15 10:32:41', 1),
(16, 'his study, we look at the', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', NULL, 0, '2008-07-15 10:33:15', 1),
(17, 'The first is aspect', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', NULL, 0, '2008-07-15 10:34:37', 1),
(18, 'For example', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-15 10:37:01', 1),
(19, 'For example', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-15 10:37:04', 1),
(20, 'coarse-grained', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-15 10:37:25', 1),
(21, '2006', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-15 10:49:38', 1),
(22, 'Though it may be reasonable to expect a user to provide a rating for each aspect, it is unlikely that a user will annotate every sentence and phrase in a review as being relevant to some aspect.', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-2.html', 'Page 2', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', NULL, 0, '2008-07-15 13:17:23', 8),
(23, 'Social media systems such as weblogs, photo- and link- sharing sites, wikis and on-line forums are currently thought to produce up to one third of new Web content', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', '', '', 0, '2008-07-15 13:44:34', 1),
(24, 'We describe recent work on building systems that use models of the Blogosphere to recognize spam blogs, find opinions on topics, identify communities of interest, derive trust relationships, and detect influential bloggers.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', '', '', 0, '2008-07-15 13:46:04', 1),
(25, 'Their reach and impact is significant, with tens of mil- lions of people providing content on a regular basis around the world.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', '', '', 0, '2008-07-15 13:46:31', 1),
(26, 'Recent estimates suggest that so- cial media systems are responsible for as much as one third of new Web content', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', '', '', 0, '2008-07-15 13:46:50', 1),
(27, 'We are developing a model of information flow, in- fluence and trust on the Blogosphere', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', '', '', 0, '2008-07-15 13:48:31', 1),
(28, 'For example, the people who contribute to blogs and author blog posts form a so- cial network with their peers, which can be induced by the links between blogs.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:06:29', 1),
(29, 'We begin by describing an overarching task of discovering which blogs and blog- gers are most influential within a community or about a topic.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:07:23', 1),
(30, 'However, influ- ence on the Web is often a function of topic. For exam- ple, Engadget''s1 influence is in the domain of consumer electronics and Daily Kos2 in politics.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:08:52', 1),
(31, 'Epidemic-based mod- els like linear threshold and cascade models (Kempe, Kleinberg, & Tardos 2003; 2005; Leskovec et al. 2007) have been used to find a small set of individuals who are most influential in social network.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:09:20', 1),
(32, 'With the large number of niches existing on the Blogosphere, a blog that is relatively low ranked can be highly influential in this small community of interest', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:10:19', 1),
(33, 'By clustering related folders, we can induce an intuitive set of topics for feeds and blogs.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:14:24', 1),
(34, 'An important component in understanding influence is to detect the sentiment and opinions expressed in blog posts.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:18:10', 1),
(35, 'An aggregated opinion over many users is a predictor for an interesting trend in a community. Sufficient adoption of this trend could lead to a "tip- ping point', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:18:43', 1),
(36, 'Since blog posts are often informally written, poorly structured, rife with spelling and grammatical errors, and feature non-traditional content they are difficult to process with standard language analysis tools.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-3.html', 'Page 3', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:19:32', 1),
(37, 'In the next section we describe techniques designed to eliminate spam content from a blog index.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-3.html', 'Page 3', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:20:29', 1),
(38, 'In the following sections we also introduce a tech- nique we call "link polarity". We represent each edge in the influence graph with a vector of topic and corre- sponding weights indicating either positive or negative sentiment associated with the link for a Web resource. Thus if a blog A links to a blog B with a negative senti- ment for a topic T, influencing B would have little effect on A. ', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-3.html', 'Page 3', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:22:10', 1),
(39, 'spam has be- come a serious problem in blogs and social media', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-3.html', 'Page 3', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:25:38', 1),
(40, 'Spam blogs constitute the second kind of spam. These are blogs created using splog creation tools (Finin 2006), and are either fully or partly machine generated. Splogs have two often overlapping mo- tives. The first is the creation of blogs containing gib- berish or hijacked content from other blogs and news sources with the sole purpose of hosting profitable context based advertisements. The second is the cre- ation of blogs which realize link farms intended to increase the ranking of affiliate sites (blogs or non- blog web-pages). One such splog is shown in figure 4.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-4.html', 'Page 4', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:28:29', 1),
(41, 'For instance, text like "comments-off" (comments are usu- ally turned-off in splogs), "new-york" (a high paying advertising term), "in-uncategorized" (spammers do not bother to specify categories for blog posts) are features common to splogs, whereas text like "2-comments", "1- comment", "i-have", "to-my" were some features com- mon to authentic blogs.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-5.html', 'Page 5', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:30:26', 1),
(42, 'We have investigated the use of link distributions to see if splogs can be identified once they place themselves on the blog (web) hyper-link graph. The intuition is that that authentic blogs are very un- likely to link to splogs and that splogs frequently do link to other splogs.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-5.html', 'Page 5', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:32:11', 1),
(43, 'The text neighboring the link provides direct meaningful insight into blogger a''s opinion', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-5.html', 'Page 5', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:34:17', 1),
(44, 'For our requirements, we do not need to employ complex natural language processing techniques since bloggers typically convey their bias about the post/blog pointed by the link in a straightforward manner.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-6.html', 'Page 6', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:36:00', 1),
(45, 'Republican blogs typically have a higher connectivity then Democratic blogs in the politi- cal blogosphere', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-7.html', 'Page 7', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:38:11', 1),
(46, 'The main contribution of this work lies in applying trust propa- gation models over polar links.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-7.html', 'Page 7', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:39:23', 1),
(47, 'Blog writers are enthusiastic blog readers.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-7.html', 'Page 7', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:55:57', 1),
(48, 'Videotape of a Canadian teenager being questioned at the U.S. Navy base in Guantanamo Bay', 'http://www.bloomberg.com/apps/news?pid=20601086&sid=avX5fkXEfVWc', 'Bloomberg.com: Latin America', '', NULL, 0, '2008-07-15 18:30:35', 1),
(49, 'There are many possible ways to represent a document for the purpose of supporting effective similarity search.', 'http://www2002.org/CDROM/refereed/75/', 'Evaluating Strategies for Similarity Search on the Web', '', NULL, 0, '2008-07-16 10:56:50', 8);

-- --------------------------------------------------------

-- 
-- Table structure for table `snippet_links`
-- 

CREATE TABLE `snippet_links` (
  `snippet` int(11) unsigned NOT NULL,
  `point` int(11) unsigned NOT NULL,
  `howlinked` enum('asserts','supports','opposes') NOT NULL,
  `creator` int(11) unsigned NOT NULL,
  KEY `point` (`point`),
  KEY `snippet` (`snippet`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `snippet_links`
-- 

INSERT INTO `snippet_links` (`snippet`, `point`, `howlinked`, `creator`) VALUES 
(1, 1, 'asserts', 8),
(2, 2, 'asserts', 8),
(3, 3, 'supports', 8),
(4, 4, 'supports', 8),
(5, 5, 'supports', 8),
(6, 4, 'supports', 8),
(7, 6, 'supports', 8),
(8, 1, 'asserts', 8),
(9, 1, 'asserts', 8),
(10, 1, 'asserts', 8),
(11, 1, 'asserts', 8),
(12, 2, 'asserts', 8),
(13, 4, 'supports', 8),
(14, 2, 'asserts', 1),
(15, 1, 'asserts', 1),
(16, 2, 'asserts', 1),
(17, 2, 'asserts', 1),
(18, 1, 'asserts', 1),
(19, 1, 'asserts', 1),
(20, 2, 'asserts', 1),
(21, 1, 'asserts', 1),
(22, 1, 'asserts', 8),
(23, 7, 'asserts', 1),
(24, 8, 'asserts', 1),
(25, 9, 'asserts', 1),
(26, 7, 'asserts', 1),
(27, 10, 'asserts', 1),
(28, 11, 'asserts', 1),
(29, 12, 'asserts', 1),
(30, 13, 'asserts', 1),
(31, 14, 'asserts', 1),
(32, 15, 'asserts', 1),
(33, 16, 'asserts', 1),
(34, 17, 'asserts', 1),
(35, 18, 'asserts', 1),
(36, 19, 'asserts', 1),
(37, 20, 'asserts', 1),
(38, 21, 'asserts', 1),
(39, 22, 'asserts', 1),
(40, 23, 'asserts', 1),
(41, 24, 'supports', 1),
(42, 25, 'asserts', 1),
(43, 26, 'asserts', 1),
(44, 27, 'asserts', 1),
(45, 28, 'asserts', 1),
(46, 29, 'asserts', 1),
(47, 30, 'asserts', 1),
(48, 22, 'asserts', 1),
(49, 31, 'supports', 8);

-- --------------------------------------------------------

-- 
-- Table structure for table `source`
-- 

CREATE TABLE `source` (
  `id` int(11) NOT NULL auto_increment,
  `domain` varchar(64) NOT NULL,
  `hostexp` varchar(64) NOT NULL,
  `name` varchar(64) NOT NULL,
  `sourceexp` varchar(64) NOT NULL,
  `subjectexp` varchar(64) NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `domain` (`domain`,`name`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

-- 
-- Dumping data for table `source`
-- 

INSERT INTO `source` (`id`, `domain`, `hostexp`, `name`, `sourceexp`, `subjectexp`) VALUES 
(1, 'reuters.com', '', 'Reuters', '', '(.*) \\|'),
(2, 'foxnews.com', '', 'Fox News', '', '.* - ([^-]*)'),
(3, 'bbc.co.uk', '', 'BBC News', '', '\\| ([^|]*)$'),
(0, '', '', '', '', '');

-- --------------------------------------------------------

-- 
-- Table structure for table `user`
-- 

CREATE TABLE `user` (
  `id` int(11) NOT NULL auto_increment,
  `email` varchar(128) NOT NULL,
  `name` varchar(64) NOT NULL,
  `password` varchar(16) NOT NULL,
  `secret` varchar(16) NOT NULL,
  `status` enum('active','pending','banned') NOT NULL,
  `datejoined` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `facebookid` int(11) NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `secret` (`secret`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

-- 
-- Dumping data for table `user`
-- 

INSERT INTO `user` (`id`, `email`, `name`, `password`, `secret`, `status`, `datejoined`, `facebookid`) VALUES 
(1, 'rob@ennals.org', 'rob', 'password', 'HneGhDrJVP', 'active', '2008-06-18 15:37:10', 0),
(2, 'rob@ennals.org', 'rob2', 'pass', 'K8BHWiP5te', 'pending', '2008-06-18 15:41:29', 0),
(3, 'rob.ennals@gmail.com', 'rob3', 'pass', '24EM3TC2PX', 'pending', '2008-06-18 15:42:40', 0),
(4, 'rob.ennals@gmail.com', 'rob4', 'test', 'gfUJdWCqX2', 'pending', '2008-06-18 17:24:54', 0),
(5, 'rob.ennals@gmail.com', 'rob5', 'test', '3JV7XbmJ7t', 'pending', '2008-06-18 17:25:19', 0),
(6, 'rob.ennals@gmail.com', 'rob6', 'bla', 'u6d9tcTtdp', 'pending', '2008-06-18 17:42:09', 0),
(7, 'rob.ennals@gmail.com', 'rob7', 'foo', 'rFfujVmtxU', 'active', '2008-06-18 18:23:27', 0),
(8, 'trush@eecs.berkeley.edu', 'Beth', 'think', 'KYkN6h7uNW', 'active', '2008-06-19 13:42:05', 0);
