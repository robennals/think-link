/* claims_pages.db
 * A schema for storing contents retrieved for claims phrases
 *
 * DANGER! Run this only if you want to replace the entire db & contents! 
 * To run:
 * mysql> USE phrase;
 * mysql> source claims_pages.db;
 * 
 * JMA 3 Jan 2010 Confrontational Computing
 */

/*** CLAIM ***************************************
 The sentence sent to the search engine. 
*/
DROP TABLE IF EXISTS claim;

CREATE TABLE claim
    (claim      VARCHAR(255) DEFAULT NULL
    , is_phrase INT          DEFAULT 0 
    /* a useful flags field
       = 1 e.g. "is disputed that"
       = 2 e.g. "global warming exists"
       < 0 mark for deletion
     */
    , claim_id  INT          NOT NULL -- hash of claim
    , PRIMARY KEY (claim_id)
    );


/*** SITE ***************************************
 Just the root of the url, common to many urls
*/
DROP TABLE IF EXISTS site;

CREATE TABLE site 
    (url_root  CHAR(36) DEFAULT NULL
    , is_valid INT          DEFAULT 0 -- <0 means marked for deletion
    , site_id  INT          NOT NULL  -- hash of url_root
    , PRIMARY KEY (site_id)
    );



/*** PAGE *****************************************
 Page contents extracted from page body together
 with the url path specific to the site.
 */
DROP TABLE IF EXISTS page;

CREATE TABLE page
    (path_str        VARCHAR(1000) DEFAULT NULL
    , is_valid       INT           DEFAULT 0 -- <0 means marked for deletion
    , content_file   VARCHAR(255)  DEFAULT NULL
    , retrieval_time DATETIME      DEFAULT NULL
    , title          VARCHAR(255)  DEFAULT NULL
    , rank           INT UNSIGNED  DEFAULT 100000000
    , paragraphs     TEXT          DEFAULT NULL
    , page_id        INT           NOT NULL     -- hash of path_str
    , claim_id       INT           DEFAULT NULL
    , site_id        INT           DEFAULT NULL
    , PRIMARY KEY (page_id)
    );

/* Add one test entry. */

INSERT INTO claim VALUES('All is flux'
    , 2
    , 632959151
    );

INSERT INTO page VALUES ('Writing/all_is_flux.html'
    , 1
    , 'all_is_flux.html'
    , '2010-01-05 15:59:59'
    , 'ALL IS FLUX'
    , 1
    , 'FIRE INTO WATER. Water into Earth. Earth into water. Water into fire. No man can step into the same river twice, for other waters are ever flowing onto him.'
    , -1516561284
    , 632959151
    , 789401766
    );

INSERT INTO site VALUES('http://www.goines.net/'
    , 0
    , 789401766
    );

/* Here's an example retrieval: */
SELECT CONCAT(s.url_root, p.path_str)
    , p.title
    , c.claim 
   FROM site AS s JOIN page AS p USING(site_id) 
   JOIN claim AS c USING(claim_id);

/* EOF */

