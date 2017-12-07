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

/* merchantAccount */
CREATE TABLE grocerystore.merchantAccount
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
name VARCHAR(250) NOT NULL,
enabled BIT DEFAULT 1,
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
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
merchantAccount_id BIGINT(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16

/* sellerTag */
CREATE TABLE grocerystore.sellerTag
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
name CHAR(60) NOT NULL,
enabled BIT DEFAULT 1,
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16

/* category */
CREATE TABLE grocerystore.category
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
name CHAR(60) NOT NULL,
enabled BIT DEFAULT 1,
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16

/* item */
CREATE TABLE grocerystore.item
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
name VARCHAR(300) NOT NULL,
price CHAR(30) NOT NULL,
displayPrice CHAR(30) NOT NULL,
availableOn BIGINT(50) NOT NULL,
slug TINYTEXT NOT NULL,
enabled BIT DEFAULT 1,
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16

/* itemTag */
CREATE TABLE grocerystore.itemTag
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
item_id BIGINT(50) NOT NULL,
tag_id BIGINT(50) NOT NULL,
enabled BIT DEFAULT 1,
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16

/* itemCategory */
CREATE TABLE grocerystore.itemCategory
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
enabled BIT DEFAULT 1,
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
item_id BIGINT(50) NOT NULL,
category_id BIGINT(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16

/* order */
CREATE TABLE grocerystore.order
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
number CHAR(30) NOT NULL,
itemTotal CHAR(30) NOT NULL,
total CHAR(30) NOT NULL,
shipmentTotal CHAR(30),
adjustmentTotal CHAR(30),
paymentTotal CHAR(30),
dateCompleted BIGINT(50),
shipmentStatus CHAR(20),
paymenttStatus CHAR(20),
email CHAR(100),
specialInstructions TINYTEXT,
includedTaxTotal CHAR(100),
additionalTaxTotal CHAR(100),
displayIncludedTaxTotal CHAR(100),
displayAdditionalTaxTotal CHAR(100),
taxTotal CHAR(100),
currency CHAR(10),
totalQuantity CHAR(5),
token CHAR(150),
billingAddress01 VARCHAR(250),
billingAddress02 VARCHAR(250),
shippingAddress01 VARCHAR(250),
shippingAddress02 VARCHAR(250),
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
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
merchantAccount_id BIGINT(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16

/* orderItem */
CREATE TABLE grocerystore.orderItem
(id BIGINT(50) NOT NULL AUTO_INCREMENT,
name CHAR(60) NOT NULL,
enabled BIT DEFAULT 1,
dateCreated BIGINT(50) NOT NULL,
dateUpdated BIGINT(50) NOT NULL,
order_id BIGINT(50) NOT NULL,
item_id BIGINT(50) NOT NULL,
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16
