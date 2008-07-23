-- phpMyAdmin SQL Dump
-- version 2.9.1.1-Debian-2ubuntu1
-- http://www.phpmyadmin.net
-- 
-- Host: localhost
-- Generation Time: Jul 18, 2008 at 11:30 PM
-- Server version: 5.0.38
-- PHP Version: 5.2.1
-- 
-- Database: `thinklink`
-- 

-- --------------------------------------------------------

-- 
-- Table structure for table `documents`
-- 

CREATE TABLE `documents` (
  `url` varchar(128) NOT NULL,
  `title` varchar(128) default NULL,
  `author` varchar(128) default NULL,
  PRIMARY KEY  (`url`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `documents`
-- 

INSERT INTO `documents` (`url`, `title`, `author`) VALUES 
('http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/', 'Finding Contradictions in Text', 'Marie-Catherine de Marneffe'),
('http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', 'Ivan Titov, Ryan McDonald'),
('http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/', 'The information ecology of social media and online communities', 'Tim Finin, Anupam Joshi, Pranam Kolari, Akshay Java, Anubhav Kale and Amit Karandikar'),
('http://mashmaker.intel-research.net/rob/server/pdfs/f5/16/', 'Fully Distributed EM for Very Large Datasets', 'Jason Wolfe, Aria Haghighi, Dan Klein'),
('http://mashmaker.intel-research.net/rob/server/pdfs/da/18/', 'DISTRIBUTIONAL CLUSTERING OF ENGLISH WORDS', 'Fernando Pereira');

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
-- Table structure for table `pdf`
-- 

CREATE TABLE `pdf` (
  `url` varchar(512) NOT NULL,
  `dir` varchar(4) NOT NULL,
  `id` int(4) NOT NULL auto_increment,
  PRIMARY KEY  (`id`),
  KEY `url` (`url`,`dir`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=19 ;

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
('http://www.cs.berkeley.edu/~klein/papers/similarity-search-WWW-11.pdf', '5a', 14),
('http://portal.acm.org/ft_gateway.cfm?id=317451&type=pdf&coll=GUIDE&dl=GUIDE&CFID=36969353&CFTOKEN=78065988', '14', 15),
('http://www.cs.berkeley.edu/~aria42/pubs/icml08-distributedem.pdf', 'f5', 16),
('http://www.cs.berkeley.edu/~pliang/papers/agreement-nips2008.pdf', 'eb', 17),
('http://www.cs.cornell.edu/home/llee/papers/ptl93.pdf', 'da', 18);

-- --------------------------------------------------------

-- 
-- Table structure for table `point_agreements`
-- 

CREATE TABLE `point_agreements` (
  `user_id` int(11) unsigned NOT NULL,
  `point_id` int(11) unsigned NOT NULL,
  `agree` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY  (`user_id`,`point_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `point_agreements`
-- 

INSERT INTO `point_agreements` (`user_id`, `point_id`, `agree`, `created_at`) VALUES 
(8, 72, 1, '0000-00-00 00:00:00');

-- --------------------------------------------------------

-- 
-- Table structure for table `point_links`
-- 

CREATE TABLE `point_links` (
  `point_a_id` int(11) unsigned NOT NULL,
  `point_b_id` int(11) unsigned NOT NULL,
  `howlinked` enum('asserts','supports','identical','opposes','related') NOT NULL,
  `creator` int(11) unsigned NOT NULL,
  KEY `source` (`point_a_id`),
  KEY `dest` (`point_b_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `point_links`
-- 

INSERT INTO `point_links` (`point_a_id`, `point_b_id`, `howlinked`, `creator`) VALUES 
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
(19, 27, 'related', 1),
(27, 39, 'related', 8),
(26, 39, 'related', 8),
(21, 39, 'related', 8),
(8, 40, 'related', 8),
(40, 14, 'supports', 8),
(33, 42, 'related', 8),
(6, 33, 'related', 8),
(33, 44, 'related', 8),
(47, 48, 'related', 1),
(48, 49, 'related', 1),
(47, 49, 'related', 1),
(67, 68, 'opposes', 8),
(70, 71, 'related', 8),
(67, 74, 'opposes', 8),
(67, 75, 'related', 8),
(74, 75, 'related', 8),
(76, 77, 'supports', 8),
(78, 79, 'related', 8);

-- --------------------------------------------------------

-- 
-- Table structure for table `points`
-- 

CREATE TABLE `points` (
  `id` int(11) NOT NULL auto_increment,
  `txt` varchar(128) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `txt` (`txt`),
  FULLTEXT KEY `text` (`txt`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=81 ;

-- 
-- Dumping data for table `points`
-- 

INSERT INTO `points` (`id`, `txt`, `user_id`, `created_at`, `updated_at`) VALUES 
(1, 'test point 1', 0, '2008-07-14 11:03:32', '0000-00-00 00:00:00'),
(2, 'test point 2', 0, '2008-07-14 11:04:22', '0000-00-00 00:00:00'),
(3, 'Viewing opposing arguments helps people decide which argument they agree with', 0, '2008-07-14 11:15:25', '0000-00-00 00:00:00'),
(4, 'Scope and context are important for statements and arguments', 0, '2008-07-14 11:17:15', '0000-00-00 00:00:00'),
(5, 'Relationships between statements may be vague or difficult to define', 0, '2008-07-14 15:41:45', '0000-00-00 00:00:00'),
(6, 'NLP tasks require large training sets to be effective', 0, '2008-07-14 15:54:29', '0000-00-00 00:00:00'),
(7, 'Social media systems contribute up to one third of new web content.', 0, '2008-07-15 13:44:34', '0000-00-00 00:00:00'),
(8, 'Finin et al analysed blogs to detect spam blogs, influential blogs, opinions, and communities of interest.', 0, '2008-07-15 13:46:04', '0000-00-00 00:00:00'),
(9, 'Millions of people contribute to social media', 0, '2008-07-15 13:46:31', '0000-00-00 00:00:00'),
(10, 'Finin et al modeled information flow and trust on blogs', 0, '2008-07-15 13:48:31', '0000-00-00 00:00:00'),
(11, 'One can infer social networks from blog posts', 0, '2008-07-15 14:06:29', '0000-00-00 00:00:00'),
(12, 'Finin et al detected influential blogs', 0, '2008-07-15 14:07:23', '0000-00-00 00:00:00'),
(13, 'Influence on the web is often a function of topic', 0, '2008-07-15 14:08:52', '0000-00-00 00:00:00'),
(14, 'Epidemic models can be used to find influential individuals', 0, '2008-07-15 14:09:20', '0000-00-00 00:00:00'),
(15, 'A blog can be very influential without having many readers', 0, '2008-07-15 14:10:19', '0000-00-00 00:00:00'),
(16, 'One can infer blog topics by looking at Bloglines folders', 0, '2008-07-15 14:14:24', '0000-00-00 00:00:00'),
(17, 'Researchers have performed sentiment extraction on blog posts', 0, '2008-07-15 14:18:09', '0000-00-00 00:00:00'),
(18, 'We can predict "tipping points" by analysing sentiment in blogs', 0, '2008-07-15 14:18:43', '0000-00-00 00:00:00'),
(19, 'blog posts are difficult to analyse with standard language analysis tools', 0, '2008-07-15 14:19:32', '0000-00-00 00:00:00'),
(20, 'Finin et al showed how to eliminate spam content from blogs', 0, '2008-07-15 14:20:29', '0000-00-00 00:00:00'),
(21, '"link polarity" allows one to deduce which blogs influence each other', 0, '2008-07-15 14:22:09', '0000-00-00 00:00:00'),
(22, 'Spam is a serious problem for blogs and social media', 0, '2008-07-15 14:25:38', '0000-00-00 00:00:00'),
(23, 'Spam blogs use hijacked content to draw attention to adverts or link farms', 0, '2008-07-15 14:28:29', '0000-00-00 00:00:00'),
(24, 'Spam blogs can be detected by looking at the word sequences on the page', 0, '2008-07-15 14:30:26', '0000-00-00 00:00:00'),
(25, 'Spam blogs can be detected by looking at what links to them', 0, '2008-07-15 14:32:11', '0000-00-00 00:00:00'),
(26, 'One can infer link polarity by the words around the link', 0, '2008-07-15 14:34:17', '0000-00-00 00:00:00'),
(27, 'Link polarity can be inferred without using complex natural language processing techniques', 0, '2008-07-15 14:36:00', '0000-00-00 00:00:00'),
(28, 'Republican blogs typically have a higher connectivity than democrat blogs', 0, '2008-07-15 14:38:11', '0000-00-00 00:00:00'),
(29, 'Finin et al applied trust propagation models over polar links to infer trust and influence patterns for blogs', 0, '2008-07-15 14:39:23', '0000-00-00 00:00:00'),
(30, 'Blog writers are enthusiastic blog readers', 0, '2008-07-15 14:55:57', '0000-00-00 00:00:00'),
(31, 'Summary statements can serve as a representation of a document', 0, '2008-07-16 10:56:50', '0000-00-00 00:00:00'),
(32, 'Document similarity needs to consider both document content  and inlinks', 0, '2008-07-16 11:03:23', '0000-00-00 00:00:00'),
(33, 'Parallel execution may be necessary to process a large volume of data', 0, '2008-07-16 11:05:44', '0000-00-00 00:00:00'),
(34, 'User studies are ineffective', 0, '2008-07-16 11:07:16', '0000-00-00 00:00:00'),
(35, 'Hierarchical data organization on the web groups similar data together', 0, '2008-07-16 11:11:57', '0000-00-00 00:00:00'),
(36, 'Deriving the full set of meaningful words is important to computing similarity', 0, '2008-07-16 11:19:52', '0000-00-00 00:00:00'),
(37, 'One can influence others'' opinions via blogging', 0, '2008-07-16 14:51:23', '0000-00-00 00:00:00'),
(38, 'User consensus is authoritative in document classification', 0, '2008-07-16 14:57:55', '0000-00-00 00:00:00'),
(39, 'Like-minded blogs can discovered using link polarity and trust propagation', 0, '2008-07-16 15:04:00', '0000-00-00 00:00:00'),
(40, 'The Blogosphere can be analyzed to discover the most influential bloggers', 0, '2008-07-16 15:08:37', '0000-00-00 00:00:00'),
(41, 'Feature selection is important in machine learning algorithms', 0, '2008-07-16 15:17:20', '0000-00-00 00:00:00'),
(42, 'MapReduce cannot be used when a centralized reduce operation has high overhead', 0, '2008-07-16 17:00:15', '0000-00-00 00:00:00'),
(43, 'LDA is useful for finding statements about the same topic', 0, '2008-07-16 17:15:04', '0000-00-00 00:00:00'),
(44, 'Parallel execution is easier when each data item is independent', 0, '2008-07-16 17:17:02', '0000-00-00 00:00:00'),
(45, 'Using a master node to communicate in distributed settings can be inefficient', 0, '2008-07-16 17:29:03', '0000-00-00 00:00:00'),
(46, 'Jesse Jackson uses the n-word to refer to black people', 0, '2008-07-16 18:59:24', '0000-00-00 00:00:00'),
(47, 'Nixon used executive privilege to dodge prosecution during the watergate scandal', 0, '2008-07-16 19:00:18', '0000-00-00 00:00:00'),
(48, 'George W Bush used executive priveledge to dodge prosecution over the Valerie Plame scandal', 0, '2008-07-16 19:01:07', '0000-00-00 00:00:00'),
(49, 'Executive privilege is not intended to be used to protect the president from investigation', 0, '2008-07-16 19:03:22', '0000-00-00 00:00:00'),
(50, 'Most diets do not work well', 0, '2008-07-16 19:27:10', '0000-00-00 00:00:00'),
(51, 'Dieters lose most weight at the beginning of the diet', 0, '2008-07-16 19:28:11', '0000-00-00 00:00:00'),
(52, 'Dieters often regain lost weight as the diet continues', 0, '2008-07-16 19:28:43', '0000-00-00 00:00:00'),
(53, 'If Apple loses the Psystar case then other companies are likely to start selling Mac clones', 0, '2008-07-16 19:31:06', '0000-00-00 00:00:00'),
(54, 'Many computer companies would like to sell Mac clones', 0, '2008-07-16 19:32:04', '0000-00-00 00:00:00'),
(55, 'EPO is the hormone that regulates red blood cell production', 0, '2008-07-16 19:40:06', '0000-00-00 00:00:00'),
(56, 'In rails one can use the class_name option to belongs_to to use arbitrary names for foreign keys', 0, '2008-07-16 22:26:54', '0000-00-00 00:00:00'),
(57, 'Rails programmers should use eager loading to reduce the number of database queries made', 0, '2008-07-16 22:28:08', '0000-00-00 00:00:00'),
(58, 'database views can be used to adapt a legacy database to rails conventions', 0, '2008-07-16 22:29:24', '0000-00-00 00:00:00'),
(59, 'set_table_name allows one to override the rails default table name', 0, '2008-07-16 22:38:50', '0000-00-00 00:00:00'),
(60, 'set_primary_key allows one to override the rails default primary key name', 0, '2008-07-16 22:39:21', '0000-00-00 00:00:00'),
(61, 'Taxes are too high in California', 0, '2008-07-17 09:22:56', '0000-00-00 00:00:00'),
(62, 'Middle-income wage-earners can find themselves pushed into higher tax brackets', 0, '2008-07-17 09:26:31', '0000-00-00 00:00:00'),
(63, 'People are moving away from California', 0, '2008-07-17 09:28:21', '0000-00-00 00:00:00'),
(64, 'California is dependent on its wealthy wage-earners', 0, '2008-07-17 09:29:10', '0000-00-00 00:00:00'),
(65, 'Housing prices are falling', 0, '2008-07-17 09:30:12', '0000-00-00 00:00:00'),
(66, 'California is spending too much money', 0, '2008-07-17 09:31:11', '0000-00-00 00:00:00'),
(67, 'The iPhone is the most popular smart phone', 0, '2008-07-17 09:40:21', '0000-00-00 00:00:00'),
(68, 'BlackBerrys have hidden features', 0, '2008-07-17 09:46:49', '0000-00-00 00:00:00'),
(69, 'The New Yorker magazine is influential', 0, '2008-07-17 09:49:24', '0000-00-00 00:00:00'),
(70, 'Barack Obama artwork is popular', 0, '2008-07-17 09:50:11', '0000-00-00 00:00:00'),
(71, 'African Americans are associated with graffiti', 0, '2008-07-17 09:51:42', '0000-00-00 00:00:00'),
(72, 'McCain is less controversial than Obama', 0, '2008-07-17 10:11:23', '0000-00-00 00:00:00'),
(73, 'Obama has used cocaine', 0, '2008-07-17 10:29:57', '0000-00-00 00:00:00'),
(74, 'The iPhone is lacking features', 0, '2008-07-17 10:39:34', '0000-00-00 00:00:00'),
(75, 'The iPhone is too expensive', 0, '2008-07-17 10:40:21', '0000-00-00 00:00:00'),
(76, 'The Bush administration is too conservative', 0, '2008-07-17 10:49:23', '0000-00-00 00:00:00'),
(77, 'The Bush administration is trying to redefine contraception as abortion', 0, '2008-07-17 10:50:28', '0000-00-00 00:00:00'),
(78, 'Text classification is useful', 0, '2008-07-18 11:00:26', '0000-00-00 00:00:00'),
(79, 'Text classification often deals with sparse data sets', 0, '2008-07-18 11:05:47', '0000-00-00 00:00:00'),
(80, 'rails 2.0 requires you to declare a named route for each type in order to use the form_for method', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- --------------------------------------------------------

-- 
-- Table structure for table `ratings`
-- 

CREATE TABLE `ratings` (
  `snippet_id` int(11) unsigned NOT NULL,
  `point_id` int(11) unsigned NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `rating` int(4) unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY  (`snippet_id`,`point_id`,`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `ratings`
-- 

INSERT INTO `ratings` (`snippet_id`, `point_id`, `user_id`, `rating`, `created_at`) VALUES 
(1, 1, 8, 3, '2008-07-14 11:05:29'),
(46, 29, 1, 4, '2008-07-15 14:39:28'),
(45, 28, 1, 3, '2008-07-15 14:39:32'),
(28, 11, 8, 5, '2008-07-16 14:45:38'),
(30, 13, 8, 5, '2008-07-16 14:52:47'),
(36, 19, 8, 4, '2008-07-16 15:00:18');

-- --------------------------------------------------------

-- 
-- Table structure for table `snippet_links`
-- 

CREATE TABLE `snippet_links` (
  `snippet_id` int(11) unsigned NOT NULL,
  `point_id` int(11) unsigned NOT NULL,
  `howlinked` enum('asserts','supports','opposes') NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  KEY `point` (`point_id`),
  KEY `snippet` (`snippet_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- 
-- Dumping data for table `snippet_links`
-- 

INSERT INTO `snippet_links` (`snippet_id`, `point_id`, `howlinked`, `user_id`) VALUES 
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
(49, 31, 'supports', 8),
(50, 32, 'asserts', 8),
(51, 33, 'supports', 8),
(52, 34, 'asserts', 8),
(53, 35, 'supports', 8),
(54, 36, 'asserts', 8),
(55, 36, 'asserts', 8),
(56, 11, 'asserts', 8),
(57, 37, 'supports', 8),
(58, 38, 'asserts', 8),
(59, 39, 'asserts', 8),
(60, 40, 'asserts', 8),
(61, 41, 'supports', 8),
(62, 33, 'asserts', 8),
(63, 42, 'supports', 8),
(64, 43, 'asserts', 8),
(65, 33, 'supports', 8),
(66, 44, 'asserts', 8),
(67, 45, 'asserts', 8),
(68, 46, 'asserts', 1),
(69, 47, 'asserts', 1),
(70, 48, 'asserts', 1),
(71, 49, 'asserts', 1),
(72, 50, 'asserts', 1),
(73, 51, 'asserts', 1),
(74, 52, 'asserts', 1),
(75, 53, 'asserts', 1),
(76, 54, 'asserts', 1),
(77, 55, 'asserts', 1),
(78, 56, 'asserts', 1),
(79, 57, 'asserts', 1),
(80, 58, 'asserts', 1),
(81, 59, 'asserts', 1),
(82, 60, 'asserts', 1),
(83, 61, 'supports', 8),
(84, 62, 'asserts', 8),
(85, 63, 'asserts', 8),
(86, 64, 'supports', 8),
(87, 65, 'supports', 8),
(88, 66, 'supports', 8),
(89, 67, 'supports', 8),
(90, 68, 'asserts', 8),
(91, 69, 'supports', 8),
(92, 70, 'supports', 8),
(93, 71, 'supports', 8),
(94, 72, 'supports', 8),
(95, 73, 'asserts', 8),
(96, 74, 'supports', 8),
(97, 75, 'asserts', 8),
(98, 74, 'supports', 8),
(99, 74, 'supports', 8),
(100, 74, 'supports', 8),
(101, 76, 'supports', 8),
(102, 77, 'asserts', 8),
(103, 76, 'supports', 8),
(104, 78, 'supports', 8),
(105, 79, 'asserts', 8),
(106, 2, 'asserts', 1),
(107, 80, 'asserts', 1);

-- --------------------------------------------------------

-- 
-- Table structure for table `snippets`
-- 

CREATE TABLE `snippets` (
  `id` int(11) NOT NULL auto_increment,
  `txt` text NOT NULL,
  `url` varchar(128) NOT NULL,
  `pagetitle` varchar(128) NOT NULL,
  `title` varchar(128) NOT NULL,
  `author` varchar(128) default NULL,
  `source_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  `point_id` int(11) unsigned NOT NULL,
  `howlinked` varchar(11) NOT NULL default 'related',
  PRIMARY KEY  (`id`),
  KEY `url` (`url`,`created_at`,`user_id`),
  KEY `point_id` (`point_id`),
  FULLTEXT KEY `text` (`txt`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=108 ;

-- 
-- Dumping data for table `snippets`
-- 

INSERT INTO `snippets` (`id`, `txt`, `url`, `pagetitle`, `title`, `author`, `source_id`, `created_at`, `user_id`, `point_id`, `howlinked`) VALUES 
(1, 'In the beginning God created the heaven and the earth. ', 'http://mashmaker.intel-research.net/beth/', 'testing', '', NULL, 0, '2008-07-14 11:03:32', 8, 1, 'related'),
(2, 'And the evening and the morning were the third day', 'http://mashmaker.intel-research.net/beth/', 'testing', '', NULL, 0, '2008-07-14 11:04:22', 8, 2, 'related'),
(3, 'the system could enable voters to make more informed choices between candidates and sift through the amount of available informa- tion', 'http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/pdf-1.html', 'Page 1', 'Finding Contradictions in Text', NULL, 0, '2008-07-14 11:15:25', 8, 3, 'related'),
(4, 'The importance of event coreference was recognized in the MUC information extraction tasks in which it was key to identify sce- narios related to the same event', 'http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/pdf-2.html', 'Page 2', 'Finding Contradictions in Text', NULL, 0, '2008-07-14 11:17:15', 8, 4, 'related'),
(5, 'However, for contradiction detection to be useful, a looser definition that more closely matches human intuitions is necessary', 'http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/pdf-2.html', 'Page 2', 'Finding Contradictions in Text', NULL, 0, '2008-07-14 15:42:46', 8, 5, 'related'),
(6, 'For contradiction, however, it is critical to filter unrelated sentences to avoid finding false evidence of contradiction when there is contrasting information about different events.', 'http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/pdf-5.html', 'Page 5', 'Finding Contradictions in Text', NULL, 0, '2008-07-14 15:51:28', 8, 4, 'related'),
(7, 'highlight- ing the difficulty in generalizing from a small corpus of positive contradiction examples, as well as under- lining the complexity of building a broad coverage system', 'http://mashmaker.intel-research.net/rob/server/pdfs/d3/7/pdf-7.html', 'Page 7', 'Finding Contradictions in Text', NULL, 0, '2008-07-14 15:57:37', 8, 6, 'related'),
(8, 'And God made two great lights', 'http://mashmaker.intel-research.net/beth/', 'testing', '', '', 0, '2008-07-14 18:00:40', 8, 1, 'related'),
(9, 'And God set them in the firmament of the heaven to give light upon the earth, 18: And to rule over the day and over ', 'http://mashmaker.intel-research.net/beth/', 'testing', '', '', 0, '2008-07-14 18:04:15', 8, 1, 'related'),
(10, 'Online reviews ', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-14 18:07:01', 8, 1, 'related'),
(11, 'We propose a statistical model which is able to discover corresponding topics in text and extract tex- tual evidence from reviews', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-15 09:03:12', 8, 1, 'related'),
(12, 'Our model achieves high ac- curacy, without any explicitly labeled data ex- cept the user provided opinion ratings', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', 'Ivan Titov', 0, '2008-07-15 09:05:28', 8, 2, 'related'),
(13, 'A word in the document is sampled either from the mixture of global topics or from the mixture of local topics specific to the local context of the word.', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-3.html', 'Page 3', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', 'Ivan Titov', 0, '2008-07-15 09:56:28', 8, 4, 'related'),
(14, 'in online discussion forum', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', NULL, 0, '2008-07-15 10:32:10', 1, 2, 'related'),
(15, 'However, these labels ', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', NULL, 0, '2008-07-15 10:32:41', 1, 1, 'related'),
(16, 'his study, we look at the', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', NULL, 0, '2008-07-15 10:33:15', 1, 2, 'related'),
(17, 'The first is aspect', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', NULL, 0, '2008-07-15 10:34:37', 1, 2, 'related'),
(18, 'For example', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-15 10:37:01', 1, 1, 'related'),
(19, 'For example', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-15 10:37:04', 1, 1, 'related'),
(20, 'coarse-grained', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-15 10:37:25', 1, 2, 'related'),
(21, '2006', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-1.html', 'Page 1', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', '', 0, '2008-07-15 10:49:38', 1, 1, 'related'),
(22, 'Though it may be reasonable to expect a user to provide a rating for each aspect, it is unlikely that a user will annotate every sentence and phrase in a review as being relevant to some aspect.', 'http://mashmaker.intel-research.net/rob/server/pdfs/3c/8/pdf-2.html', 'Page 2', 'A Joint Model of Text and Aspect Ratings for Sentiment Summarization', NULL, 0, '2008-07-15 13:17:23', 8, 1, 'related'),
(23, 'Social media systems such as weblogs, photo- and link- sharing sites, wikis and on-line forums are currently thought to produce up to one third of new Web content', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', 'The information ecology of social media and online communities', '', 0, '2008-07-15 13:44:34', 1, 7, 'related'),
(24, 'We describe recent work on building systems that use models of the Blogosphere to recognize spam blogs, find opinions on topics, identify communities of interest, derive trust relationships, and detect influential bloggers.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', 'The information ecology of social media and online communities', '', 0, '2008-07-15 13:46:04', 1, 8, 'related'),
(25, 'Their reach and impact is significant, with tens of mil- lions of people providing content on a regular basis around the world.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', 'The information ecology of social media and online communities', '', 0, '2008-07-15 13:46:31', 1, 9, 'related'),
(26, 'Recent estimates suggest that so- cial media systems are responsible for as much as one third of new Web content', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', 'The information ecology of social media and online communities', '', 0, '2008-07-15 13:46:50', 1, 7, 'related'),
(27, 'We are developing a model of information flow, in- fluence and trust on the Blogosphere', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', 'The information ecology of social media and online communities', '', 0, '2008-07-15 13:48:31', 1, 10, 'related'),
(28, 'For example, the people who contribute to blogs and author blog posts form a so- cial network with their peers, which can be induced by the links between blogs.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-1.html', 'Page 1', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:06:29', 1, 11, 'related'),
(29, 'We begin by describing an overarching task of discovering which blogs and blog- gers are most influential within a community or about a topic.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:07:23', 1, 12, 'related'),
(30, 'However, influ- ence on the Web is often a function of topic. For exam- ple, Engadget''s1 influence is in the domain of consumer electronics and Daily Kos2 in politics.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:08:52', 1, 13, 'related'),
(31, 'Epidemic-based mod- els like linear threshold and cascade models (Kempe, Kleinberg, & Tardos 2003; 2005; Leskovec et al. 2007) have been used to find a small set of individuals who are most influential in social network.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:09:20', 1, 14, 'related'),
(32, 'With the large number of niches existing on the Blogosphere, a blog that is relatively low ranked can be highly influential in this small community of interest', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:10:19', 1, 15, 'related'),
(33, 'By clustering related folders, we can induce an intuitive set of topics for feeds and blogs.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:14:24', 1, 16, 'related'),
(34, 'An important component in understanding influence is to detect the sentiment and opinions expressed in blog posts.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:18:10', 1, 17, 'related'),
(35, 'An aggregated opinion over many users is a predictor for an interesting trend in a community. Sufficient adoption of this trend could lead to a "tip- ping point', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:18:43', 1, 18, 'related'),
(36, 'Since blog posts are often informally written, poorly structured, rife with spelling and grammatical errors, and feature non-traditional content they are difficult to process with standard language analysis tools.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-3.html', 'Page 3', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:19:32', 1, 19, 'related'),
(37, 'In the next section we describe techniques designed to eliminate spam content from a blog index.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-3.html', 'Page 3', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:20:29', 1, 20, 'related'),
(38, 'In the following sections we also introduce a tech- nique we call "link polarity". We represent each edge in the influence graph with a vector of topic and corre- sponding weights indicating either positive or negative sentiment associated with the link for a Web resource. Thus if a blog A links to a blog B with a negative senti- ment for a topic T, influencing B would have little effect on A. ', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-3.html', 'Page 3', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:22:10', 1, 21, 'related'),
(39, 'spam has be- come a serious problem in blogs and social media', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-3.html', 'Page 3', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:25:38', 1, 22, 'related'),
(40, 'Spam blogs constitute the second kind of spam. These are blogs created using splog creation tools (Finin 2006), and are either fully or partly machine generated. Splogs have two often overlapping mo- tives. The first is the creation of blogs containing gib- berish or hijacked content from other blogs and news sources with the sole purpose of hosting profitable context based advertisements. The second is the cre- ation of blogs which realize link farms intended to increase the ranking of affiliate sites (blogs or non- blog web-pages). One such splog is shown in figure 4.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-4.html', 'Page 4', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:28:29', 1, 23, 'related'),
(41, 'For instance, text like "comments-off" (comments are usu- ally turned-off in splogs), "new-york" (a high paying advertising term), "in-uncategorized" (spammers do not bother to specify categories for blog posts) are features common to splogs, whereas text like "2-comments", "1- comment", "i-have", "to-my" were some features com- mon to authentic blogs.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-5.html', 'Page 5', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:30:26', 1, 24, 'related'),
(42, 'We have investigated the use of link distributions to see if splogs can be identified once they place themselves on the blog (web) hyper-link graph. The intuition is that that authentic blogs are very un- likely to link to splogs and that splogs frequently do link to other splogs.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-5.html', 'Page 5', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:32:11', 1, 25, 'related'),
(43, 'The text neighboring the link provides direct meaningful insight into blogger a''s opinion', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-5.html', 'Page 5', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:34:17', 1, 26, 'related'),
(44, 'For our requirements, we do not need to employ complex natural language processing techniques since bloggers typically convey their bias about the post/blog pointed by the link in a straightforward manner.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-6.html', 'Page 6', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:36:00', 1, 27, 'related'),
(45, 'Republican blogs typically have a higher connectivity then Democratic blogs in the politi- cal blogosphere', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-7.html', 'Page 7', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:38:11', 1, 28, 'related'),
(46, 'The main contribution of this work lies in applying trust propa- gation models over polar links.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-7.html', 'Page 7', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:39:23', 1, 29, 'related'),
(47, 'Blog writers are enthusiastic blog readers.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-7.html', 'Page 7', 'The information ecology of social media and online communities', NULL, 0, '2008-07-15 14:55:57', 1, 30, 'related'),
(48, 'Videotape of a Canadian teenager being questioned at the U.S. Navy base in Guantanamo Bay', 'http://www.bloomberg.com/apps/news?pid=20601086&sid=avX5fkXEfVWc', 'Bloomberg.com: Latin America', '', NULL, 0, '2008-07-15 18:30:35', 1, 22, 'related'),
(49, 'There are many possible ways to represent a document for the purpose of supporting effective similarity search.', 'http://www2002.org/CDROM/refereed/75/', 'Evaluating Strategies for Similarity Search on the Web', '', NULL, 0, '2008-07-16 10:56:50', 8, 31, 'related'),
(50, 'The anchor-window often constitutes a hand-built summary of the target document [1], collecting both explicit hand-summarization and implicit hand-classification present in referring documents.', 'http://www2002.org/CDROM/refereed/75/', 'Evaluating Strategies for Similarity Search on the Web', '', NULL, 0, '2008-07-16 11:03:23', 8, 32, 'related'),
(51, 'Because each stage of our algorithm is trivially parallelizable, our indexing approach can scale to the few billion accessible documents currently on the Web.', 'http://www2002.org/CDROM/refereed/75/', 'Evaluating Strategies for Similarity Search on the Web', '', NULL, 0, '2008-07-16 11:05:44', 8, 33, 'related'),
(52, 'user studies are time-consuming, costly, and not well-suited to research that involves the comparison of many parameters', 'http://www2002.org/CDROM/refereed/75/', 'Evaluating Strategies for Similarity Search on the Web', '', NULL, 0, '2008-07-16 11:07:16', 8, 34, 'related'),
(53, 'a document in the recreation/aviation/un-powered class is on average more similar to other documents in that same class than those outside of that class', 'http://www2002.org/CDROM/refereed/75/', 'Evaluating Strategies for Similarity Search on the Web', '', NULL, 0, '2008-07-16 11:11:57', 8, 35, 'related'),
(54, 'For both the content and anchor-based approaches, we chose to remove all HTML comments, Javascript code, tags (except ''alt'' text), and non-alphabetic characters. A stopword list containing roughly 800 terms was also applied.', 'http://www2002.org/CDROM/refereed/75/', 'Evaluating Strategies for Similarity Search on the Web', '', NULL, 0, '2008-07-16 11:19:52', 8, 36, 'related'),
(55, 'In the case where we are judging document similarities, rare terms are much less useful as they are often typos, rare names, or other nontopical terms that adversely affect the similarity measure.', 'http://www2002.org/CDROM/refereed/75/', 'Evaluating Strategies for Similarity Search on the Web', '', NULL, 0, '2008-07-16 11:35:07', 8, 36, 'related'),
(56, 'A typ- ical blog post has a set of comments that link back to people and blogs associated with them.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-16 14:47:02', 8, 11, 'related'),
(57, 'Through original content and sometimes via commentary on top- ics of current interest, bloggers influence each other and their audience.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-16 14:51:23', 8, 37, 'related'),
(58, 'In our approach, we say that a feed is topically relevant and authoritative if many users have cate- gorized it under similar folder names.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-2.html', 'Page 2', 'The information ecology of social media and online communities', NULL, 0, '2008-07-16 14:57:55', 8, 38, 'related'),
(59, 'Us- ing link polarity and trust propagation we have demon- strated how like-minded blogs can be discovered', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-3.html', 'Page 3', 'The information ecology of social media and online communities', NULL, 0, '2008-07-16 15:04:00', 8, 39, 'related'),
(60, 'By considering influence as a temporal phenomenon, we can find key individuals that are early adopters or "buzz generators" for a topic. ', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-3.html', 'Page 3', 'The information ecology of social media and online communities', NULL, 0, '2008-07-16 15:08:37', 8, 40, 'related'),
(61, 'Interesting discrim- inative features were observed in this experiment. For instance, text like "comments-off" (comments are usu- ally turned-off in splogs), "new-york" (a high paying advertising term), "in-uncategorized" (spammers do not bother to specify categories for blog posts) are features common to splogs, whereas text like "2-comments", "1- comment", "i-have", "to-my" were some features com- mon to authentic blogs.', 'http://mashmaker.intel-research.net/rob/server/pdfs/2d/6/pdf-5.html', 'Page 5', 'The information ecology of social media and online communities', NULL, 0, '2008-07-16 15:17:20', 8, 41, 'related'),
(65, 'Given the amount of data and number of parameters in many EM applications, it is worthwhile to distribute the algorithm across many machines.', 'http://mashmaker.intel-research.net/rob/server/pdfs/f5/16/pdf-3.html', 'Page 3', 'Fully Distributed EM for Very Large Datasets', NULL, 0, '2008-07-16 17:15:48', 8, 33, 'related'),
(64, 'In LDA, we fix a finite number of topics T and assume a closed vocabulary of size V .', 'http://mashmaker.intel-research.net/rob/server/pdfs/f5/16/pdf-2.html', 'Page 2', 'Fully Distributed EM for Very Large Datasets', NULL, 0, '2008-07-16 17:15:04', 8, 43, 'related'),
(63, 'In this case, one quickly gets to the point where no single compute node can store the model pa- rameters (expectations over word pairs in this case) for all of the data at once', 'http://mashmaker.intel-research.net/rob/server/pdfs/f5/16/pdf-1.html', 'Page 1', 'Fully Distributed EM for Very Large Datasets', NULL, 0, '2008-07-16 17:00:15', 8, 42, 'related'),
(62, 'With dramatic recent increases in both data scale and multi-core environments, it has become increasingly important to understand how machine learning algo- rithms can be efficiently parallelized.', 'http://mashmaker.intel-research.net/rob/server/pdfs/f5/16/pdf-1.html', 'Page 1', 'Fully Distributed EM for Very Large Datasets', NULL, 0, '2008-07-16 16:46:14', 8, 33, 'related'),
(66, 'Distributing the E-Step is relatively straightforward, since the expected sufficient statistics for each datum can be computed independently given a current esti- mate of the parameters.', 'http://mashmaker.intel-research.net/rob/server/pdfs/f5/16/pdf-3.html', 'Page 3', 'Fully Distributed EM for Very Large Datasets', NULL, 0, '2008-07-16 17:17:02', 8, 44, 'related'),
(67, 'MapReduce takes a completely centralized approach to implementing the C-Step, in which the accumula- tion of at the Reduce node can be slow or even infea- sible.', 'http://mashmaker.intel-research.net/rob/server/pdfs/f5/16/pdf-4.html', 'Page 4', 'Fully Distributed EM for Very Large Datasets', NULL, 0, '2008-07-16 17:29:03', 8, 45, 'related'),
(68, 'Jackson used the plural form of the â€œn-word,â€ not â€œblack people,â€ in the second part of his comment.', 'http://latimesblogs.latimes.com/washington/2008/07/what-else-jesse.html', 'What else Jesse Jackson said when he slammed Barack Obama | Top of the Ticket | Los Angeles Times', '', NULL, 0, '2008-07-16 18:59:24', 1, 46, 'related'),
(69, 'The concept of executive privilege rings a special bell with readers of a certain age. It was relied on by the Richard M. Nixon White House seeking to shield documents and personnel from inquiring congressional committees and prosecutors during the Watergate investigations.', 'http://latimesblogs.latimes.com/presidentbush/2008/07/cheney-plame-ag.html', 'Bush claims executive privilege in Valerie Plame Wilson case | Countdown to Crawford | Los Angeles Times', '', NULL, 0, '2008-07-16 19:00:18', 1, 47, 'related'),
(70, 'President Bush quietly claimed executive privilege on Tuesday, after Atty. Gen. Michael B. Mukasey requested the shield. Mukasey is seeking to avoid delivering to congressional investigators documents dealing with interviews of Vice President Dick Cheney and members of his staff regarding the unmasking of CIA covert agent Valerie Plame Wilson. ', 'http://latimesblogs.latimes.com/presidentbush/2008/07/cheney-plame-ag.html', 'Bush claims executive privilege in Valerie Plame Wilson case | Countdown to Crawford | Los Angeles Times', '', NULL, 0, '2008-07-16 19:01:07', 1, 48, 'related'),
(71, 'This executive privilege claim, and your justification for it, appears to turn the privilege on its head. The purpose of executive privilege is to encourage candid advice to the president, not to cover up what the vice president and White House staff say to investigating authorities when that information is requested in the course of congressional oversight.', 'http://latimesblogs.latimes.com/presidentbush/2008/07/cheney-plame-ag.html', 'Bush claims executive privilege in Valerie Plame Wilson case | Countdown to Crawford | Los Angeles Times', '', NULL, 0, '2008-07-16 19:03:22', 1, 49, 'related'),
(72, 'Instead, the results highlight the difficulty of weight loss and the fact that most diets do not work well.', 'http://www.nytimes.com/2008/07/17/health/nutrition/17diets.html', 'Long-Term Diet Study Suggests Success Is Hard to Come By - NYTimes.com', '', NULL, 0, '2008-07-16 19:27:14', 1, 50, 'related'),
(73, 'The biggest weight loss happened in the first five months of the diet â€” low-fat and Mediterranean dieters lost about 10 pounds, and low-carbohydrate dieters lost 14 pounds. ', 'http://www.nytimes.com/2008/07/17/health/nutrition/17diets.html', 'Long-Term Diet Study Suggests Success Is Hard to Come By - NYTimes.com', '', NULL, 0, '2008-07-16 19:28:11', 1, 51, 'related'),
(74, 'By the end of two years, all the dieters had regained some, but not all, of the lost weight.', 'http://www.nytimes.com/2008/07/17/health/nutrition/17diets.html', 'Long-Term Diet Study Suggests Success Is Hard to Come By - NYTimes.com', '', NULL, 0, '2008-07-16 19:28:43', 1, 52, 'related'),
(75, 'In one fell swoop, other companies will realize that they will be able to get away with selling Mac OS X on their own brand of computers and use the precedent of the Psystar case to their advantage if and when they face legal action from Apple.', 'http://news.cnet.com/8301-13506_3-9992544-17.html', 'Apple must win its case against Psystar -- or else | The Digital Home - Don Reisinger''s take on the tech closest to home - CNET ', '', NULL, 0, '2008-07-16 19:31:06', 1, 53, 'related'),
(76, 'I would venture to say that the vast majority of small computer companies are looking to jump on that bandwagon at any second and have waited this long because of their desire to see what happens to Psystar.', 'http://news.cnet.com/8301-13506_3-9992544-17.html', 'Apple must win its case against Psystar -- or else | The Digital Home - Don Reisinger''s take on the tech closest to home - CNET ', '', NULL, 0, '2008-07-16 19:32:04', 1, 54, 'related'),
(77, 'is the hormone that regulates red blood cell production', 'http://en.wikipedia.org/wiki/Erythropoietin', 'Erythropoietin - Wikipedia, the free encyclopedia', '', NULL, 0, '2008-07-16 19:40:06', 1, 55, 'related'),
(78, ':class_name - Specify the class name of the association. Use it only if that name canâ€˜t be inferred from the association name. So has_one :author will by default be linked to the Author class, but if the real class name is Person, youâ€˜ll have to specify it with this option.', 'http://api.rubyonrails.org/classes/ActiveRecord/Associations/ClassMethods.html#M000530', 'Module: ActiveRecord::Associations::ClassMethods', '', NULL, 0, '2008-07-16 22:26:54', 1, 56, 'related'),
(79, 'Through the use of eager loading, the 101 queries can be reduced to 2. ', 'http://api.rubyonrails.org/classes/ActiveRecord/Associations/ClassMethods.html#M000530', 'Module: ActiveRecord::Associations::ClassMethods', '', NULL, 0, '2008-07-16 22:28:08', 1, 57, 'related'),
(80, 'if your database supports views then you can alias your table names and column names to Rails conventions.', 'http://wiki.rubyonrails.org/rails/pages/HowToUseLegacySchemas', 'HowToUseLegacySchemas in Ruby on Rails', '', NULL, 0, '2008-07-16 22:29:24', 1, 58, 'related'),
(81, 'For example, letâ€™s suppose that your legacy database use a table named FooBar, and that youâ€™d like to map the model Client onto this table. By using the set_table_name class method you can define this:', 'http://sl33p3r.free.fr/tutorials/rails/legacy/legacy_databases.html', 'Rails and Legacy Databases', '', NULL, 0, '2008-07-16 22:38:50', 1, 59, 'related'),
(82, 'The same goes for the private key. In RoR, the convention says that the primary key should be named id and should be auto-incremented. In many legacy databases the primary key wonâ€™t be named id. By using the set_primary_key you can redefine the name if the primary key to be used:', 'http://sl33p3r.free.fr/tutorials/rails/legacy/legacy_databases.html', 'Rails and Legacy Databases', '', NULL, 0, '2008-07-16 22:39:21', 1, 60, 'related'),
(83, 'New York City has long been the highest tax jurisdiction in the United States, but California politicians are proposing to steal that brass tiara.', 'http://online.wsj.com/article/SB121625150189660215.html', 'California as No. 1 - WSJ.com', '', NULL, 0, '2008-07-17 09:22:56', 8, 61, 'related'),
(84, 'This plan would also repeal indexing for inflation, which is a sneaky way for politicians to push middle-income Californians into higher tax brackets every year, especially when prices are rising as they are now.', 'http://online.wsj.com/article/SB121625150189660215.html', 'California as No. 1 - WSJ.com', '', NULL, 0, '2008-07-17 09:26:31', 8, 62, 'related'),
(85, 'Census Bureau data show that, from 1996-2005, 1.3 million more Americans left than came to California.', 'http://online.wsj.com/article/SB121625150189660215.html', 'California as No. 1 - WSJ.com', '', NULL, 0, '2008-07-17 09:28:21', 8, 63, 'related'),
(86, 'Those with incomes of more than $100,000 pay 83% of the state''s income taxes, and the richest 6,000 of the 38 million Californians pay $9 billion in taxes.', 'http://online.wsj.com/article/SB121625150189660215.html', 'California as No. 1 - WSJ.com', '', NULL, 0, '2008-07-17 09:29:10', 8, 64, 'related'),
(87, 'New housing data reveals that the average California home price fell by 28% from June 2007 to June 2008, almost double the decline of any other state.', 'http://online.wsj.com/article/SB121625150189660215.html', 'California as No. 1 - WSJ.com', '', NULL, 0, '2008-07-17 09:30:12', 8, 65, 'related'),
(88, 'State outlays were up 44% over the past five years, meaning that California is spending at a faster pace than even Congress. ', 'http://online.wsj.com/article/SB121625150189660215.html', 'California as No. 1 - WSJ.com', '', NULL, 0, '2008-07-17 09:31:11', 8, 66, 'related'),
(89, 'If you''re a BlackBerry user, you''re probably getting tired of hearing about all the things Apple''s iPhone can do.', 'http://online.wsj.com/article/SB121615180290355595.html', 'The Mossberg Solution - WSJ.com', '', NULL, 0, '2008-07-17 09:40:21', 8, 67, 'related'),
(90, 'This week, I gathered up some useful shortcuts that come built into most of the BlackBerrys, even older models, made by Research In Motion Ltd. but not many owners actually use or know about them.', 'http://online.wsj.com/article/SB121615180290355595.html', 'The Mossberg Solution - WSJ.com', '', NULL, 0, '2008-07-17 09:46:49', 8, 68, 'related'),
(91, 'This week''s New Yorker magazine cover, an illustration depicting Sen. Barack Obama and his wife as fist-bumping terrorists, has been all over the news.', 'http://online.wsj.com/article/SB121625710569060513.html', 'Picturing Obama - WSJ.com', '', NULL, 0, '2008-07-17 09:49:24', 8, 69, 'related'),
(92, 'Collectors, investors and fund-raisers -- many of them looking to cash in on the candidate''s popularity and place in history -- are snapping up campaign posters and other works depicting the presumptive Democratic nominee.', 'http://online.wsj.com/article/SB121625710569060513.html', 'Picturing Obama - WSJ.com', '', NULL, 0, '2008-07-17 09:50:11', 8, 70, 'related'),
(93, 'Much of the Obama art market is centered on "street art," a graffiti-inspired genre that takes the form of posters, stickers and other works that are meant to be plastered in public spaces.', 'http://online.wsj.com/article/SB121625710569060513.html', 'Picturing Obama - WSJ.com', '', NULL, 0, '2008-07-17 09:51:42', 8, 71, 'related'),
(94, 'There appears to be little demand for art promoting Sen. John McCain, the presumptive Republican presidential nominee, art experts say.', 'http://online.wsj.com/article/SB121625710569060513.html', 'Picturing Obama - WSJ.com', '', NULL, 0, '2008-07-17 10:11:23', 8, 72, 'related'),
(95, 'In Texas, Austin-based designer Baxter Orr, an Independent, created "Dope," a parody of Mr. Fairey''s posters that makes sport of Mr. Obama''s cocaine use as a young man.', 'http://online.wsj.com/article/SB121625710569060513.html', 'Picturing Obama - WSJ.com', '', NULL, 0, '2008-07-17 10:29:57', 8, 73, 'related'),
(96, 'Seven Reasons Why the New iPhone Sucks', 'http://www.divinecaroline.com/article/22279/52271-seven-reasons-new-iphone-sucks', 'Seven Reasons Why the New iPhone Sucks', '', NULL, 0, '2008-07-17 10:39:34', 8, 74, 'related'),
(97, 'If you take into account the regular monthly fee, the data fee, the text message fee, which used to be free, and the $99 annual mobileme fee you could end up spending over $1,000 a year to own an iPhone', 'http://www.divinecaroline.com/article/22279/52271-seven-reasons-new-iphone-sucks', 'Seven Reasons Why the New iPhone Sucks', '', NULL, 0, '2008-07-17 10:40:21', 8, 75, 'related'),
(98, 'Although there are plenty of phones, including AT&Tâ€™s Tilt, that will allow you to use your 3G phone as a high speed modem for your laptop, the iPhone wonâ€™t be one of them', 'http://www.divinecaroline.com/article/22279/52271-seven-reasons-new-iphone-sucks', 'Seven Reasons Why the New iPhone Sucks', '', NULL, 0, '2008-07-17 10:42:41', 8, 74, 'related'),
(99, 'Yes it will superimpose your position on a Google map, or show you the closest pizzeria but what about getting real-time route guidance?', 'http://www.divinecaroline.com/article/22279/52271-seven-reasons-new-iphone-sucks', 'Seven Reasons Why the New iPhone Sucks', '', NULL, 0, '2008-07-17 10:43:09', 8, 74, 'related'),
(100, 'Predictive typing is fine but spell checkers are everywhere else but here. ', 'http://www.divinecaroline.com/article/22279/52271-seven-reasons-new-iphone-sucks', 'Seven Reasons Why the New iPhone Sucks', '', NULL, 0, '2008-07-17 10:43:36', 8, 74, 'related'),
(101, 'While current law allows health care providers and professionals to refuse to provide abortions based on their religious beliefs, this provision would threaten the funding of organizations and health facilities if they do not hire people who would refuse to provide birth control and defines abortion so broadly that it would include many types of birth control, including oral contraception.', 'http://www.speaker.gov/blog/', 'The Gavel Â» Blog Archive Â» Bush Administration Tries to Redefine Contraception as Abortion', '', NULL, 0, '2008-07-17 10:49:23', 8, 76, 'related'),
(102, 'The majority of Americans oppose this out of touch position that redefines contraception as abortion', 'http://www.speaker.gov/blog/', 'The Gavel Â» Blog Archive Â» Bush Administration Tries to Redefine Contraception as Abortion', '', NULL, 0, '2008-07-17 10:50:28', 8, 77, 'related'),
(103, 'Time and again this Administration has jeopardized womenâ€™s access to essential family planning services for purely ideological reasons.', 'http://www.speaker.gov/blog/', 'The Gavel Â» Blog Archive Â» Bush Administration Tries to Redefine Contraception as Abortion', '', NULL, 0, '2008-07-17 10:54:00', 8, 76, 'related'),
(104, 'Methods for automatically classifying words according to their contexts of use have both scientific and prac- tical interest.', 'http://mashmaker.intel-research.net/rob/server/pdfs/da/18/pdf-1.html', 'Page 1', 'DISTRIBUTIONAL CLUSTERING OF ENGLISH WORDS', NULL, 0, '2008-07-18 11:00:26', 8, 78, 'related'),
(105, 'From the practical point of view, word classification addresses questions of data sparseness and generalization in statistical lan- guage models, particularly models for deciding among alternative analyses proposed by a grammar.', 'http://mashmaker.intel-research.net/rob/server/pdfs/da/18/pdf-1.html', 'Page 1', 'DISTRIBUTIONAL CLUSTERING OF ENGLISH WORDS', NULL, 0, '2008-07-18 11:05:47', 8, 79, 'related'),
(106, 'And God said, Behold', 'http://mashmaker.intel-research.net/beth/', 'testing', '', NULL, 0, '0000-00-00 00:00:00', 1, 2, 'related'),
(107, 'user_path is missing because you don''t have a named route for user. In a conventional rails 2.0 restful application the controller for User would be named UsersController, and in the config/routes.rb you''d have ActionController::Routing::Routes.draw do |map| map.resources :users which would generate a bunch of named routes and path/url helpers including the missing user_path ', 'http://www.ruby-forum.com/topic/141825', 'Rails 2.0.2 upgrade -> undefined method `user_path'' - Ruby Forum', '', NULL, 0, '0000-00-00 00:00:00', 1, 80, 'related');

-- --------------------------------------------------------

-- 
-- Table structure for table `sources`
-- 

CREATE TABLE `sources` (
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
-- Dumping data for table `sources`
-- 

INSERT INTO `sources` (`id`, `domain`, `hostexp`, `name`, `sourceexp`, `subjectexp`) VALUES 
(1, 'reuters.com', '', 'Reuters', '', '(.*) \\|'),
(2, 'foxnews.com', '', 'Fox News', '', '.* - ([^-]*)'),
(3, 'bbc.co.uk', '', 'BBC News', '', '\\| ([^|]*)$'),
(0, '', '', '', '', '');

-- --------------------------------------------------------

-- 
-- Table structure for table `users`
-- 

CREATE TABLE `users` (
  `id` int(11) NOT NULL auto_increment,
  `email` varchar(128) NOT NULL,
  `name` varchar(64) NOT NULL,
  `password` varchar(16) NOT NULL,
  `secret` varchar(16) NOT NULL,
  `status` enum('active','pending','banned') NOT NULL,
  `created_at` datetime NOT NULL,
  `facebookid` int(11) NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `secret` (`secret`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

-- 
-- Dumping data for table `users`
-- 

INSERT INTO `users` (`id`, `email`, `name`, `password`, `secret`, `status`, `created_at`, `facebookid`) VALUES 
(1, 'rob@ennals.org', 'rob', 'password', 'HneGhDrJVP', 'active', '2008-06-18 15:37:10', 0),
(2, 'rob@ennals.org', 'rob2', 'pass', 'K8BHWiP5te', 'pending', '2008-06-18 15:41:29', 0),
(3, 'rob.ennals@gmail.com', 'rob3', 'pass', '24EM3TC2PX', 'pending', '2008-06-18 15:42:40', 0),
(4, 'rob.ennals@gmail.com', 'rob4', 'test', 'gfUJdWCqX2', 'pending', '2008-06-18 17:24:54', 0),
(5, 'rob.ennals@gmail.com', 'rob5', 'test', '3JV7XbmJ7t', 'pending', '2008-06-18 17:25:19', 0),
(6, 'rob.ennals@gmail.com', 'rob6', 'bla', 'u6d9tcTtdp', 'pending', '2008-06-18 17:42:09', 0),
(7, 'rob.ennals@gmail.com', 'rob7', 'foo', 'rFfujVmtxU', 'active', '2008-06-18 18:23:27', 0),
(8, 'trush@eecs.berkeley.edu', 'Beth', 'think', 'KYkN6h7uNW', 'active', '2008-06-19 13:42:05', 0);
