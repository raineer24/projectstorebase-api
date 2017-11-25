CREATE TABLE grocerystore.userAccount
(id BIGINT NOT NULL,
username CHAR(60) NOT NULL,
password VARCHAR(250) NOT NULL,
email CHAR(100) NOT NULL,
dateBirth INT,
dateCreated INT NOT NULL,
dateUpdated INT NOT NULL,
uiid CHAR(150),
PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf16
