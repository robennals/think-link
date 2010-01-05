/* claims_pages.db
 * A schema for storing contents retrieved for claims phrases
 * To run:
 * mysql> USE phrase;
 * mysql> source claims_pages.db;
 * 
 * JMA 3 Jan 2010 Confrontational Computing
 */

DROP TABLE IF EXISTS claim;

CREATE TABLE claim
    (claim      VARCHAR(255) DEFAULT NULL
    , is_phrase INT          DEFAULT 0 
    /* = 1 e.g. "is disputed that"
       = 2 e.g. "global warming exists"
     */
    , claim_id  INT          NOT NULL
    , page_id   INT          NOT NULL
    , PRIMARY KEY (claim_id)
    );

DROP TABLE IF EXISTS site;

CREATE TABLE site 
    (url_root  CHAR(36) DEFAULT NULL
    , site_id  INT      NOT NULL
    , claim_id INT      NOT NULL
    , PRIMARY KEY (site_id)
    );

DROP TABLE IF EXISTS page;

/*
 Page contents extracted from page body together
 with the url path specific to the site.
 */
CREATE TABLE page
    (path_str        VARCHAR(1000) DEFAULT NULL
    , content_file   VARCHAR(255)  DEFAULT NULL
    , retrieval_time DATETIME      DEFAULT NULL
    , title          VARCHAR(255)  DEFAULT NULL
    , rank           INT           DEFAULT -1
    , paragraphs     TEXT          DEFAULT NULL
    , page_id        INT           NOT NULL
    , claim_id       INT           NOT NULL
    , site_id        INT           NOT NULL
    , PRIMARY KEY (page_id)
    );

/* EOF */

