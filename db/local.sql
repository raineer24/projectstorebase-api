-- MySQL dump 10.16  Distrib 10.2.10-MariaDB, for osx10.13 (x86_64)
--
-- Host: localhost    Database: grocerystore
-- ------------------------------------------------------
-- Server version	10.2.10-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `name` char(60) NOT NULL,
  `level` char(1) NOT NULL,
  `category_id` bigint(50) NOT NULL,
  `enabled` bit(1) DEFAULT b'1',
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Fresh Deals','1',0,'',1513659772954,1513659772954),(2,'Perishables','1',0,'',1513659780369,1513659780369),(3,'Grocery','1',0,'',1513659789707,1513659789707),(4,'Household','1',0,'',1513659795129,1513659795129),(5,'Health and Beauty','1',0,'',1513659804473,1513659804473),(6,'Specialty Goods','1',0,'',1513659813072,1513659813072),(7,'Bakery','1',0,'',1513659818564,1513659818564),(8,'Pharmacy','1',0,'',1513659824798,1513659824798),(9,'Organic fruits','2',1,'',1513660293605,1513660293605),(10,'Organic Vegetables','2',1,'',1513660298626,1513660298626),(11,'Tofu','2',1,'',1513660309532,1513660309532),(12,'Pork','2',2,'',1513660323226,1513660323226),(13,'Beef','2',2,'',1513660333644,1513660333644),(14,'Lamb','2',2,'',1513660340269,1513660340269),(15,'Fish','2',2,'',1513660343779,1513660343779),(16,'Rice','2',3,'',1513660349031,1513660349031),(17,'Vegetables','2',3,'',1513660354698,1513660354698),(18,'Fruits','2',3,'',1513660357905,1513660357905),(19,'Breakfast Cereals','2',3,'',1513660368816,1513660368816),(20,'Kitchen wares','2',4,'',1513660392392,1513660392392),(21,'Laundry','2',4,'',1513660430503,1513660430503),(22,'Toiletries','2',4,'',1513660438478,1513660438478),(23,'Facial Care','2',5,'',1513660449628,1513660449628),(24,'Body Care','2',5,'',1513660475964,1513660475964),(25,'Mouth Care','2',5,'',1513660489246,1513660489246),(26,'Busy Organic Apple','3',9,'',1513660965299,1513660965299),(27,'Busy Organic Grapes','3',9,'',1513660971023,1513660971023),(28,'Busy Organic Orange','3',9,'',1513660975563,1513660975563),(29,'Florida Organic Orange','3',9,'',1513660980898,1513660980898),(30,'Florida Organic Grape Fruit','3',9,'',1513660998593,1513660998593),(31,'Georgia Organic Carrots','3',10,'',1513661013286,1513661013286),(32,'Georgia Organic Cabbage','3',10,'',1513661020461,1513661020461),(33,'Tinks Organic Lettuce','3',10,'',1513661028881,1513661028881),(34,'Tinks Organic Cabbage','3',10,'',1513661032777,1513661032777),(35,'Honi Tofu mix','3',11,'',1513661057515,1513661057515),(36,'Honi Tofu trail','3',11,'',1513661063856,1513661063856),(37,'American Tofu Original','3',11,'',1513661080935,1513661080935),(38,'American Tofu Imported','3',11,'',1513661087214,1513661087214),(39,'Japanese Tofu','3',11,'',1513661093534,1513661093534),(40,'Japanese Tofu zero calories','3',11,'',1513661102624,1513661102624),(41,'Johnson Shoulder part','3',12,'',1513661121920,1513661121920),(42,'Johnson Pork ribs','3',12,'',1513661129663,1513661129663),(43,'Johnson Pork thigh','3',12,'',1513661132956,1513661132956),(44,'Johnson Pork chop','3',12,'',1513661136576,1513661136576),(45,'Houston Pork chop','3',12,'',1513661148284,1513661148284);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item`
--

DROP TABLE IF EXISTS `item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `item` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `code` smallint(10) NOT NULL,
  `name` varchar(300) NOT NULL,
  `brandName` varchar(50) NOT NULL,
  `price` char(30) NOT NULL,
  `displayPrice` char(30) NOT NULL,
  `hasVat` bit(1) DEFAULT b'1',
  `isSenior` bit(1) DEFAULT b'1',
  `weighted` bit(1) DEFAULT b'1',
  `packaging` varchar(20) NOT NULL,
  `packageMeasurement` smallint(5) NOT NULL,
  `sizing` char(6) NOT NULL,
  `pacakgeMinimum` float DEFAULT NULL,
  `packageIntervals` float DEFAULT NULL,
  `availableOn` bigint(50) NOT NULL,
  `slug` tinytext NOT NULL,
  `enabled` bit(1) DEFAULT b'1',
  `category1` bigint(50) NOT NULL,
  `category2` bigint(50) NOT NULL,
  `category3` bigint(50) NOT NULL,
  `sellerAccount_id` bigint(50) NOT NULL,
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item`
--

LOCK TABLES `item` WRITE;
/*!40000 ALTER TABLE `item` DISABLE KEYS */;
INSERT INTO `item` VALUES (1,122,'Mocha Latte','Coffee Bean Mocha Latte','150','150','','','','170',170,'Medium',1000,200,1513574267766,'coffee-bean-mocha-latte-medium','',1,2,3,1,1513576400173,1513576400173),(2,123,'Large Mocha','Coffee Bean Mocha Latte','170','170','','','','170',170,'Large',1000,200,1513574267766,'coffee-bean-mocha-latte-large','',1,2,4,1,1513576486490,1513576486490);
/*!40000 ALTER TABLE `item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itemCategory`
--

DROP TABLE IF EXISTS `itemCategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `itemCategory` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `item_id` bigint(50) NOT NULL,
  `category_id` bigint(50) NOT NULL,
  `enabled` bit(1) DEFAULT b'1',
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itemCategory`
--

LOCK TABLES `itemCategory` WRITE;
/*!40000 ALTER TABLE `itemCategory` DISABLE KEYS */;
/*!40000 ALTER TABLE `itemCategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itemTag`
--

DROP TABLE IF EXISTS `itemTag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `itemTag` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `item_id` bigint(50) NOT NULL,
  `tag_id` bigint(50) NOT NULL,
  `enabled` bit(1) DEFAULT b'1',
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itemTag`
--

LOCK TABLES `itemTag` WRITE;
/*!40000 ALTER TABLE `itemTag` DISABLE KEYS */;
/*!40000 ALTER TABLE `itemTag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log`
--

DROP TABLE IF EXISTS `log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `message` text DEFAULT NULL,
  `url` text DEFAULT NULL,
  `type` char(60) DEFAULT NULL,
  `dateCreated` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log`
--

LOCK TABLES `log` WRITE;
/*!40000 ALTER TABLE `log` DISABLE KEYS */;
INSERT INTO `log` VALUES (1,'Get order items',NULL,'INFO',1514571706718);
/*!40000 ALTER TABLE `log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `number` char(30) NOT NULL,
  `itemTotal` char(30) NOT NULL,
  `total` char(30) NOT NULL,
  `shipmentTotal` char(30) DEFAULT NULL,
  `adjustmentTotal` char(30) DEFAULT NULL,
  `paymentTotal` char(30) DEFAULT NULL,
  `dateCompleted` bigint(50) DEFAULT NULL,
  `shipmentStatus` char(20) DEFAULT NULL,
  `paymenttStatus` char(20) DEFAULT NULL,
  `email` char(100) DEFAULT NULL,
  `specialInstructions` tinytext DEFAULT NULL,
  `includedTaxTotal` char(100) DEFAULT NULL,
  `additionalTaxTotal` char(100) DEFAULT NULL,
  `displayIncludedTaxTotal` char(100) DEFAULT NULL,
  `displayAdditionalTaxTotal` char(100) DEFAULT NULL,
  `taxTotal` char(100) DEFAULT NULL,
  `currency` char(10) DEFAULT NULL,
  `totalQuantity` char(5) DEFAULT NULL,
  `token` char(150) DEFAULT NULL,
  `billingAddress01` varchar(250) DEFAULT NULL,
  `billingAddress02` varchar(250) DEFAULT NULL,
  `shippingAddress01` varchar(250) DEFAULT NULL,
  `shippingAddress02` varchar(250) DEFAULT NULL,
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  `userAccount_id` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderItem`
--

DROP TABLE IF EXISTS `orderItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orderItem` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `enabled` bit(1) DEFAULT b'1',
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  `session_id` char(60) NOT NULL,
  `user_id` bigint(50) NOT NULL,
  `item_id` bigint(50) NOT NULL,
  `quantity` char(5) DEFAULT NULL,
  `processed` char(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderItem`
--

LOCK TABLES `orderItem` WRITE;
/*!40000 ALTER TABLE `orderItem` DISABLE KEYS */;
INSERT INTO `orderItem` VALUES (1,'',1514558673412,1514558673416,'123123asdfadsf9012312312lk3j2k1j312',0,1,'11','0'),(2,'',1514558586392,1514558586392,'123123asdfadsf9012312312lk3j2k1j312',0,2,'13','0');
/*!40000 ALTER TABLE `orderItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellerAccount`
--

DROP TABLE IF EXISTS `sellerAccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sellerAccount` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `username` char(60) NOT NULL,
  `password` varchar(250) NOT NULL,
  `email` char(100) DEFAULT NULL,
  `name` varchar(250) NOT NULL,
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellerAccount`
--

LOCK TABLES `sellerAccount` WRITE;
/*!40000 ALTER TABLE `sellerAccount` DISABLE KEYS */;
INSERT INTO `sellerAccount` VALUES (1,'norbs@gmail.com','password','norbs@gmail.com','Norberts',1512763935519,1512763935531);
/*!40000 ALTER TABLE `sellerAccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellerEntitlement`
--

DROP TABLE IF EXISTS `sellerEntitlement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sellerEntitlement` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `type` char(50) DEFAULT NULL,
  `enabled` bit(1) DEFAULT b'1',
  `dateCreated` bigint(20) NOT NULL,
  `dateUpdated` bigint(20) NOT NULL,
  `sellerAccount_id` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellerEntitlement`
--

LOCK TABLES `sellerEntitlement` WRITE;
/*!40000 ALTER TABLE `sellerEntitlement` DISABLE KEYS */;
/*!40000 ALTER TABLE `sellerEntitlement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellerTag`
--

DROP TABLE IF EXISTS `sellerTag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sellerTag` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `name` char(60) NOT NULL,
  `enabled` bit(1) DEFAULT b'1',
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellerTag`
--

LOCK TABLES `sellerTag` WRITE;
/*!40000 ALTER TABLE `sellerTag` DISABLE KEYS */;
/*!40000 ALTER TABLE `sellerTag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userAccount`
--

DROP TABLE IF EXISTS `userAccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userAccount` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `username` char(60) NOT NULL,
  `password` varchar(250) NOT NULL,
  `email` char(100) DEFAULT NULL,
  `firstName` char(50) NOT NULL,
  `lastName` char(50) NOT NULL,
  `uiid` char(150) DEFAULT NULL,
  `gender` char(10) DEFAULT NULL,
  `mobileNumber` char(20) DEFAULT NULL,
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userAccount`
--

LOCK TABLES `userAccount` WRITE;
/*!40000 ALTER TABLE `userAccount` DISABLE KEYS */;
INSERT INTO `userAccount` VALUES (1,'norbs.knight@gmail.com','password','norbs.knight111@gmail.com','Norbs','Knight','12345','M','123123',1512763400407,1512763400407),(2,'norbs.knight1@gmail.com','password','norbs.knight1@gmail.com','Norbs','Knight','12345','M','',1512761717733,1512761717733),(3,'norbs.knight2@gmail.com','','norbs.knight21@gmail.com','Norbs','Knight','12345','M','',1512810101593,1512810101593),(4,'norbs.knight12@gmail.com','','norbs.knight21@gmail.com','Norbs','Knight','','M','',1512810359181,1512810359181);
/*!40000 ALTER TABLE `userAccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userEntitlement`
--

DROP TABLE IF EXISTS `userEntitlement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userEntitlement` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `type` char(50) DEFAULT NULL,
  `enabled` bit(1) DEFAULT b'1',
  `dateCreated` bigint(20) NOT NULL,
  `dateUpdated` bigint(20) NOT NULL,
  `userAccount_id` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userEntitlement`
--

LOCK TABLES `userEntitlement` WRITE;
/*!40000 ALTER TABLE `userEntitlement` DISABLE KEYS */;
/*!40000 ALTER TABLE `userEntitlement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userProfile`
--

DROP TABLE IF EXISTS `userProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userProfile` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `nameFirst` char(50) NOT NULL,
  `nameMiddle` char(50) NOT NULL,
  `nameLast` char(50) NOT NULL,
  `nameFull` varchar(250) NOT NULL,
  `nameOther` varchar(250) NOT NULL,
  `dateBirth` bigint(50) DEFAULT NULL,
  `countryCode` char(2) DEFAULT NULL,
  `stateProvince` varchar(60) DEFAULT NULL,
  `address1` varchar(500) DEFAULT NULL,
  `address2` varchar(300) DEFAULT NULL,
  `geoLocation` char(25) DEFAULT NULL,
  `phoneMobile` char(20) DEFAULT NULL,
  `phoneHome` char(20) DEFAULT NULL,
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  `userAccount_id` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userProfile`
--

LOCK TABLES `userProfile` WRITE;
/*!40000 ALTER TABLE `userProfile` DISABLE KEYS */;
/*!40000 ALTER TABLE `userProfile` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-12-30  2:21:52
