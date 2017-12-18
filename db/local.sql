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

-- DROP DATABASE IF EXISTS `grocerystore`;
--
-- CREATE DATABASE `grocerystore`;

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` bigint(50) NOT NULL AUTO_INCREMENT,
  `name` char(60) NOT NULL,
  `enabled` bit(1) DEFAULT b'1',
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
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
INSERT INTO `item` VALUES (1,122,'Mocha Latte','Coffee Bean Mocha Latte','150','150','','','','170',170,'Medium',1000,200,1513574267766,'coffee-bean-mocha-latte-medium','',1,1513576400173,1513576400173),(2,123,'Mocha Latte','Coffee Bean Mocha Latte','170','170','','','','170',170,'Large',1000,200,1513574267766,'coffee-bean-mocha-latte-large','',1,1513576486490,1513576486490);
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
  `name` char(60) NOT NULL,
  `enabled` bit(1) DEFAULT b'1',
  `dateCreated` bigint(50) NOT NULL,
  `dateUpdated` bigint(50) NOT NULL,
  `order_id` bigint(50) NOT NULL,
  `item_id` bigint(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderItem`
--

LOCK TABLES `orderItem` WRITE;
/*!40000 ALTER TABLE `orderItem` DISABLE KEYS */;
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

-- Dump completed on 2017-12-18 14:10:32
