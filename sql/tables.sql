-- Active: 1710513943151@@127.0.0.1@3306@todo
CREATE TABLE users(  
	id VARCHAR(255) NOT NULL PRIMARY KEY,
	username VARCHAR(255) NOT NULL UNIQUE,
	hashed_password VARCHAR(255) NOT NULL
);

CREATE TABLE todos(  
	id VARCHAR(255) NOT NULL PRIMARY KEY,
	user_id VARCHAR(255) NOT NULL,
	title VARCHAR(255) NOT NULL,
	done BOOLEAN NOT NULL
);