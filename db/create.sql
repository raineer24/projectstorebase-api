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
merchant_id BIGINT(50) NOT NULL,
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
userAccount_id BIGINT(50) NOT NULL,
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

/* merchantAccount */
CREATE TABLE grocerystore.merchantAccount
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
name VARCHAR(250),
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
enabled BIT(1) DEFAULT 1,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16

/* sellerAccount */
CREATE TABLE grocerystore.sellerAccount (
	id bigint(19) NOT NULL auto_increment,
	username char(60) NOT NULL,
	password varchar(250) NOT NULL,
	email char(100) DEFAULT 'NULL',
	name varchar(250) NOT NULL,
	dateCreated bigint(19) NOT NULL,
	dateUpdated bigint(19) NOT NULL,
	merchant_id bigint(19) DEFAULT 0,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
