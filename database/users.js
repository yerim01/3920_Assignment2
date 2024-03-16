// const database = include('../databaseConnection');
const mysql = require('mysql2/promise');
const database = require('../databaseConnection');

async function createUser(postData) {
	let createUserSQL = `
		INSERT INTO user
		(username, password)
		VALUES
		(:user, :passwordHash);
	`;

	let params = {
		user: postData.user,
		passwordHash: postData.hashedPassword
	}
	
	try {
		const results = await database.query(createUserSQL, params);

        console.log("Successfully created user");
		console.log(results[0]);
		return true;
	}
	catch(err) {
		console.log("Error inserting user");
        console.log(err);
		return false;
	}
}

async function getUsers(postData) {
	let getUsersSQL = `
		SELECT username, password
		FROM user;
	`;
	
	try {
		const results = await database.query(getUsersSQL);

        console.log("Successfully retrieved users");
		console.log(results[0]);
		return results[0];
	}
	catch(err) {
		console.log("Error getting users");
        console.log(err);
		return false;
	}
}

async function getUserId(username) {
	let getUserSQL = `
		SELECT user_id
		FROM user
		WHERE username = :user;
	`;

	let params = {
		user: username
	};
	
	try {
		const results = await database.query(getUserSQL, params);

        if (results.length > 0) {
            console.log("Successfully found user");
            console.log(results[0]);
            return results[0].user_id;
        } else {
            console.log("User not found");
            return null;
        }
	}
	catch(err) {
		console.log("Error trying to find user");
        console.log(err);
		return false;
	}
}

module.exports = {createUser, getUsers, getUserId};