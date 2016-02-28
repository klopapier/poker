-- phpMyAdmin SQL Dump
-- version 3.5.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 23. Okt 2015 um 20:44
-- Server Version: 5.5.29
-- PHP-Version: 5.4.10

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Datenbank: `poker`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `board`
--

CREATE TABLE IF NOT EXISTS `board` (
  `board_id` int(11) NOT NULL AUTO_INCREMENT,
  `flop1` varchar(25) DEFAULT NULL,
  `flop2` varchar(25) DEFAULT NULL,
  `flop3` varchar(25) DEFAULT NULL,
  `turn` varchar(25) DEFAULT NULL,
  `river` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`board_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `game`
--

CREATE TABLE IF NOT EXISTS `game` (
  `game_id` int(11) NOT NULL AUTO_INCREMENT,
  `players_left` int(11) NOT NULL,
  `game_type` varchar(15) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `is_started` tinyint(1) NOT NULL,
  `current_hand_id` int(11) DEFAULT NULL,
  `game_structure_id` int(11) DEFAULT NULL,
  `btn_player_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `game_blind`
--

CREATE TABLE IF NOT EXISTS `game_blind` (
  `game_structure_id` int(11) NOT NULL DEFAULT '0',
  `blind` varchar(25) NOT NULL DEFAULT '',
  PRIMARY KEY (`game_structure_id`,`blind`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `game_structure`
--

CREATE TABLE IF NOT EXISTS `game_structure` (
  `game_structure_id` int(11) NOT NULL AUTO_INCREMENT,
  `current_blind_level` varchar(25) DEFAULT NULL,
  `blind_length` int(11) DEFAULT NULL,
  `current_blind_ends` datetime DEFAULT NULL,
  `pause_start_time` datetime DEFAULT NULL,
  `starting_chips` int(11) DEFAULT NULL,
  PRIMARY KEY (`game_structure_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `hand`
--

CREATE TABLE IF NOT EXISTS `hand` (
  `hand_id` int(11) NOT NULL AUTO_INCREMENT,
  `board_id` int(11) DEFAULT NULL,
  `game_id` int(11) NOT NULL,
  `player_to_act_id` varchar(255) DEFAULT NULL,
  `blind_level` varchar(25) NOT NULL,
  `pot` int(11) DEFAULT NULL,
  `bet_amount` int(11) DEFAULT NULL,
  `total_bet_amount` int(11) DEFAULT NULL,
  PRIMARY KEY (`hand_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `hand_deck`
--

CREATE TABLE IF NOT EXISTS `hand_deck` (
  `hand_id` int(11) NOT NULL,
  `card` varchar(25) NOT NULL,
  PRIMARY KEY (`hand_id`,`card`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `player_hand`
--

CREATE TABLE IF NOT EXISTS `player_hand` (
  `player_hand_id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` varchar(255) NOT NULL,
  `hand_id` int(11) NOT NULL,
  `card1` varchar(25) DEFAULT NULL,
  `card2` varchar(25) DEFAULT NULL,
  `bet_amount` int(11) DEFAULT NULL,
  `round_bet_amount` int(11) DEFAULT NULL,
  PRIMARY KEY (`player_hand_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tblbet`
--

CREATE TABLE IF NOT EXISTS `tblbet` (
  `bet_id` int(11) NOT NULL AUTO_INCREMENT,
  `value` varchar(50) NOT NULL,
  `maxBuyIn` int(11) NOT NULL,
  `minBuyIn` int(11) NOT NULL,
  `blindLength` int(11) NOT NULL,
  PRIMARY KEY (`bet_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=19 ;

--
-- Daten für Tabelle `tblbet`
--

INSERT INTO `tblbet` (`bet_id`, `value`, `maxBuyIn`, `minBuyIn`, `blindLength`) VALUES
(1, '100M/200M', 20000, 400, 100),
(2, '50M/100M', 0, 0, 0),
(3, '20M/40M', 0, 0, 0),
(4, '5M/10M', 1000, 20, 5),
(5, '4M/8M', 800, 16, 0),
(6, '2M/4M', 0, 0, 0),
(7, '1M/2M', 0, 0, 0),
(8, '200K/400K', 0, 0, 0),
(9, '100K/200K', 0, 0, 0),
(10, '40K/80K', 0, 0, 0),
(11, '20K/40K', 0, 0, 0),
(12, '10K/20K', 0, 0, 0),
(13, '5K/10K', 0, 0, 0),
(14, '2K/4K', 0, 0, 0),
(15, '500/1K', 0, 0, 0),
(16, '200/400', 0, 0, 0),
(17, '100/200', 0, 0, 0),
(18, '50/100', 0, 0, 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tblgame_structure`
--

CREATE TABLE IF NOT EXISTS `tblgame_structure` (
  `game_structure_id` int(100) NOT NULL AUTO_INCREMENT,
  `bet_id` int(11) NOT NULL,
  `seatCount` int(11) NOT NULL,
  `gameTyp` varchar(50) NOT NULL,
  `privatTable` tinyint(1) NOT NULL,
  `nameSeat` varchar(50) NOT NULL,
  PRIMARY KEY (`game_structure_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=30 ;

--
-- Daten für Tabelle `tblgame_structure`
--

INSERT INTO `tblgame_structure` (`game_structure_id`, `bet_id`, `seatCount`, `gameTyp`, `privatTable`, `nameSeat`) VALUES
(1, 4, 2, 'vip', 0, '2-handed Table'),
(2, 4, 2, 'vip', 0, '2-handed Table'),
(3, 4, 2, 'vip', 0, '2-handed Table'),
(4, 4, 5, 'vip', 0, '5-handed Table'),
(5, 4, 5, 'vip', 0, '5-handed Table'),
(6, 4, 5, 'holdem', 0, '5-handed Table'),
(7, 4, 5, 'holdem', 0, '5-handed Table'),
(8, 1, 2, 'vip', 0, '2-handed Table'),
(9, 1, 2, 'vip', 0, '2-handed Table'),
(10, 1, 2, 'vip', 0, '2-handed Table'),
(11, 1, 5, 'vip', 0, '5-handed Table'),
(12, 1, 5, 'vip', 0, '5-handed Table'),
(13, 2, 2, 'vip', 0, '2-handed Table'),
(14, 2, 2, 'vip', 0, '2-handed Table'),
(15, 2, 2, 'vip', 0, '2-handed Table'),
(16, 2, 5, 'vip', 0, '5-handed Table'),
(17, 2, 5, 'vip', 0, '5-handed Table'),
(18, 3, 2, 'vip', 0, '2-handed Table'),
(19, 3, 2, 'vip', 0, '2-handed Table'),
(20, 3, 2, 'vip', 0, '2-handed Table'),
(21, 3, 5, 'vip', 0, '5-handed Table'),
(22, 3, 5, 'vip', 0, '5-handed Table'),
(23, 5, 5, 'holdem', 0, '5-handed Table'),
(24, 5, 5, 'holdem', 0, '5-handed Table'),
(25, 5, 5, 'vip', 0, '5-handed Table'),
(26, 5, 5, 'vip', 0, '5-handed Table'),
(27, 5, 2, 'vip', 0, '2-handed Table'),
(28, 5, 2, 'vip', 0, '2-handed Table'),
(29, 5, 2, 'vip', 0, '2-handed Table');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tblplayers`
--

CREATE TABLE IF NOT EXISTS `tblplayers` (
  `playerId` int(50) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `chips` int(11) DEFAULT NULL,
  `game_id` int(11) DEFAULT NULL,
  `game_position` int(11) NOT NULL,
  `sitting_out` tinyint(4) NOT NULL,
  `finished_place` int(11) DEFAULT NULL,
  PRIMARY KEY (`playerId`)
) ENGINE=InnoDB  DEFAULT CHARSET=ascii AUTO_INCREMENT=19 ;

--
-- Daten für Tabelle `tblplayers`
--

INSERT INTO `tblplayers` (`playerId`, `email`, `password`, `username`, `chips`, `game_id`, `game_position`, `sitting_out`, `finished_place`) VALUES
(1, 'satu@mail.com', '$2a$10$SwsejTc5V24Rq4xkzGEcReOVxGwuOF/JV7auWjPEJqrjljRjjOEuW', 'satu', 20000, NULL, 0, 0, NULL),
(2, 'dua@mail.com', '$2a$10$anEs6A1b4xwSxfjqBYdknu1QBwrEFkWIEeh0dr63y3qolf8Vewt7O', 'dua', 30000, NULL, 0, 0, NULL),
(3, 'tiga@mail.com', '$2a$10$sTrsl7tTzy5boPTIdQS1H.rzHOZFgCAnYkBhrsO2mr.sNi70vY0J.', 'tiga', 1000, NULL, 0, 0, NULL),
(12, 'koko@mail.de', '$2a$10$XI8Lm9IlDdZ3Z8SeoPkmQeYVC366uBzeTMHcbId3YzbDc2nk/jR1C', 'koko', 1000, NULL, 0, 0, NULL),
(16, 'dodo@mail.com', '$2a$10$0WdCMahx.aVWhFEmacetHOc1XgQ5VaTBnWcI/ylCV62QN0.b6zm4C', 'dodo', 1000, NULL, 0, 0, NULL),
(17, 'kus@mail.com', '$2a$10$I5fg6RRleZU.cvi3pfPzTekZD/i24qVAYPNrrXmsUbcD2y0PuuGZ6', 'kussi', 100000, NULL, 0, 0, NULL),
(18, 'iren@mail.com', '$2a$10$wbFD94dUMtT/YLMyVSkyXuRGBvnFHVBAUajLJKQLanBzTMynhI.I6', 'ireni', 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbltable`
--

CREATE TABLE IF NOT EXISTS `tbltable` (
  `table_id` int(11) NOT NULL AUTO_INCREMENT,
  `tableTyp` int(11) NOT NULL,
  PRIMARY KEY (`table_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Daten für Tabelle `tbltable`
--

INSERT INTO `tbltable` (`table_id`, `tableTyp`) VALUES
(1, 2),
(2, 5);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
