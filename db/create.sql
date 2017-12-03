/* DATABASE */
CREATE DATABASE grocerystore CHARACTER SET = 'utf16' COLLATE = 'utf16_bin';

/* TABLES */

/* userAccount */
CREATE TABLE grocerystore.userAccount
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
username CHAR(60) NOT NULL,
password VARCHAR(250) NOT NULL,
email CHAR(100),
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
uiid CHAR(150),
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16

/* userProfile */
CREATE TABLE grocerystore.userProfile
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
nameFirst CHAR(50) NOT NULL,
nameMiddle CHAR(50) NOT NULL,
nameLast CHAR(50) NOT NULL,
nameFull VARCHAR(250) NOT NULL,
nameOther VARCHAR(250) NOT NULL,
dateBirth BIGINT(50),
countryCode CHAR(2),
stateProvince VARCHAR(60),
address1 VARCHAR(500),
address2 VARCHAR(300),
geoLocation CHAR(25),
phoneMobile CHAR(20),
phoneHome CHAR(20),
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
userAccount_id VARCHAR(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16

/* userEntitlement */
/* id, type, enabled, dateCreated, dateUpdated, userAccount_id */
CREATE TABLE grocerystore.userEntitlement
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
type CHAR(50),
enabled BIT DEFAULT 1,
dateCreated BIGINT NOT NULL,
dateUpdated BIGINT NOT NULL,
userAccount_id BIGINT(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16


/* sellerAccount */
CREATE TABLE grocerystore.sellerAccount
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
username CHAR(60) NOT NULL,
password VARCHAR(250) NOT NULL,
email CHAR(100),
name VARCHAR(250) NOT NULL,
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16
