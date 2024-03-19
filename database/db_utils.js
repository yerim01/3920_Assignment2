// const database = include('../databaseConnection');
const database = require('../databaseConnection');

async function printMySQLVersion() {
	let sqlQuery = `
		SHOW VARIABLES LIKE 'version';
	`;
	
	try {
		const results = await database.query(sqlQuery);
		console.log("Successfully connected to MySQL");
		console.log(results[0]);
		return true;
	}
	catch(err) {
		console.log("Error getting version from MySQL");
        console.log(err);
		return false;
	}
}

async function getChatList(userId) {
	let sqlQuery = `
	SELECT room.room_name, room.room_id
	FROM room
	JOIN room_user AS ru ON ru.room_id = room.room_id
	JOIN user ON user.user_id = ru.user_id
	WHERE user.user_id = :userId
	ORDER BY room.room_name DESC;
	`;

	let params = {
		userId: userId
	};

	try {
		const results = await database.query(sqlQuery, params);
		console.log("Successfully got chat list");
		return results[0];
	} catch(err) {
		console.log("Error getting chat list");
		console.log(err);
		return false;
	}
}

async function getRoomsUnreadMessages(userId) {
    let sqlQuery = `
    SELECT r.room_name, COUNT(ms.message_id) AS unread_count
	FROM message_status AS ms
	JOIN message AS m ON ms.message_id = m.message_id
	JOIN room_user AS ru ON ru.room_user_id = m.room_user_id
	JOIN room AS r ON r.room_id = ru.room_id
	WHERE ms.user_id = :userId AND ms.is_read = 0
	GROUP BY r.room_name;
    `;

    let params = {
        userId: userId
    };

    try {
        const results = await database.query(sqlQuery, params);
		if (results[0].length === 0) {
			return [];
		}
        console.log("Successfully got list of rooms with unread messages");
        return results[0];
    } catch(err) {
        console.log("Error getting list of rooms with unread messages");
        console.log(err);
        return [];
    }
}

async function getRecentMessagesTime() {
    let sqlQuery = `
    SELECT r.room_name, MAX(m.created_at) AS recent_msg_time
	FROM message AS m
	JOIN room_user AS ru ON ru.room_user_id = m.room_user_id
	JOIN room AS r ON r.room_id = ru.room_id
	GROUP BY r.room_name
	ORDER BY r.room_name DESC;
    `;

    try {
        const results = await database.query(sqlQuery);
		if (results[0].length === 0) {
			return [];
		}
        console.log("Successfully got list of rooms with recent message time");
        return results[0];
    } catch(err) {
        console.log("Error getting list of rooms with recent message time");
        console.log(err);
        return [];
    }
}

async function getChatMessages(roomName) {
	let sqlQuery = `
	SELECT 
    u.user_id, 
    u.username, 
    m.text, 
    m.created_at, 
    m.message_id, 
    GROUP_CONCAT(e.emoji_id) AS emoji_ids, 
    GROUP_CONCAT(e.emoji_name) AS emoji_names, 
    GROUP_CONCAT(eu.user_id) AS emoji_user_ids
	FROM message as m
	JOIN room_user AS ru ON ru.room_user_id = m.room_user_id
	JOIN user AS u ON u.user_id = ru.user_id
	JOIN room AS r ON r.room_id = ru.room_id
	LEFT JOIN emoji_user AS eu ON eu.message_id = m.message_id
	LEFT JOIN emoji AS e ON e.emoji_id = eu.emoji_id
	WHERE r.room_name = :roomName
	GROUP BY m.message_id
	ORDER BY m.created_at ASC;
	`;

	let params = {
		roomName: roomName
	};

	try {
		const results = await database.query(sqlQuery, params);
		console.log("Successfully got chat messages");
		return results[0];
	} catch(err) {
		console.log("Error getting chat messages");
		console.log(err);
		return [];
	}

}


// async function getEmojiList() {
// 	let sqlQuery = `
// 	SELECT eu.message_id AS eu_message_id, eu.emoji_id, eu.user_id AS eu_user_id, e.emoji_name
// 	FROM emoji_user AS eu
// 	JOIN emoji AS e ON e.emoji_id = eu.emoji_id;
// 	`;

// 	try {
// 		const results = await database.query(sqlQuery);
// 		console.log("Successfully got emoji list");
// 		return results[0];
// 	} catch(err) {
// 		console.log("Error getting emoji list");
// 		console.log(err);
// 		return [];
// 	}
// }

async function getRoomUserId(userId, roomName) {
	let sqlQuery = `
	SELECT ru.room_user_id
	FROM room_user AS ru
	JOIN room AS r ON r.room_id = ru.room_id
	WHERE user_id = :userId AND r.room_name = :roomName;
	`;

	let params = {
		userId: userId,
		roomName: roomName
	};

	try {
		const results = await database.query(sqlQuery, params);
		console.log("Successfully got room user id");
		return results[0][0].room_user_id;
	} catch(err) {
		console.log("Error getting room user id");
		console.log(err);
		return null;
	}
}

async function getRecentMessageId(roomUserId) {
	let sqlQuery = `
	SELECT message_id
	FROM message
	WHERE room_user_id = :roomUserId
	ORDER BY created_at DESC
	LIMIT 1;
	`;

	let params = {
		roomUserId: roomUserId
	};

	try {
		const results = await database.query(sqlQuery, params);
		console.log("Successfully got recent message id");
		return results[0][0].message_id;
	} catch(err) {
		console.log("Error getting recent message id");
		console.log(err);
		return null;
	}

}

async function getRoomUserIds(roomName) {
	let sqlQuery = `
	SELECT ru.user_id
	FROM room_user AS ru
	JOIN room AS r ON r.room_id = ru.room_id
	WHERE r.room_name = :roomName;
	`;

	let params = {
		roomName: roomName
	};

	try {
		const results = await database.query(sqlQuery, params);
		console.log("Successfully got room user ids");
		return results[0];
	} catch(err) {
		console.log("Error getting room user id");
		console.log(err);
		return null;
	}

}

async function getUnreadMessageIds(userId, roomName) {
	let sqlQuery = `
	SELECT ms.user_id, ms.message_id
	FROM message_status AS ms
	JOIN message AS m ON ms.message_id = m.message_id
	JOIN room_user AS ru ON ru.room_user_id = m.room_user_id
	JOIN room AS r ON r.room_id = ru.room_id
	WHERE ms.user_id = :userId AND ms.is_read = 0 AND r.room_name = :roomName;
	`;

	let params = {
		userId: userId,
		roomName: roomName
	};

	try {
		const results = await database.query(sqlQuery, params);
		console.log("Successfully got unread message ids");
		return results[0];
	} catch(err) {
		console.log("Error getting unread message ids");
		console.log(err);
		return null;
	}
}

async function getUserList(){
	let sqlQuery = `
	SELECT user_id, username
	FROM user;
	`;

	try {
		const results = await database.query(sqlQuery);
		console.log("Successfully got user list");
		return results[0];
	} catch(err) {
		console.log("Error getting user list");
		console.log(err);
		return [];
	}

}

async function getInviteUserList(roomName) {
	let sqlQuery = `
	SELECT u.user_id, u.username
	FROM user AS u
	WHERE NOT EXISTS (
		SELECT 1
		FROM room_user AS ru
		JOIN room AS r ON r.room_id = ru.room_id
		WHERE r.room_name = :roomName AND ru.user_id = u.user_id
	);
	`;

	let params = {
		roomName: roomName
	};

	try {
		const results = await database.query(sqlQuery, params);
		console.log("Successfully got user ids in room");
		return results[0];
	} catch(err) {
		console.log("Error getting user ids in room");
		console.log(err);
		return [];
	}
}

async function insertMessage(roomUserId, message) {
	let insertQuery = `
	INSERT INTO message (room_user_id, text)
    VALUES (?, ?);`;

	let params = [roomUserId, message];

	try {
		const results = await database.execute(insertQuery, params);
		console.log("Successfully inserted message");
		return results[0];
	} catch(err) {
		console.log("Error inserting message", err);
        throw err;
	}
}

async function insertReadStatus(messageId, userId, isRead) {
	let insertQuery = `
	INSERT INTO message_status (message_id, user_id, is_read)
	VALUES (?, ?, ?);`;

	let params = [messageId, userId, isRead];

	try {
		const results = await database.execute(insertQuery, params);
		console.log("Successfully updated unread status");
		return results[0];
	} catch(err) {
		console.log("Error updating unread status", err);
		throw err;
	}
}

async function insertEmojiReaction(messageId, emojiId, userId) {
    // Step 1: Check if the user has already reacted to this message
    const checkQuery = `
        SELECT * FROM emoji_user
        WHERE message_id = ? AND user_id = ?;
    `;
    const checkParams = [messageId, userId];
    const [existingReactions] = await database.execute(checkQuery, checkParams);

    if (existingReactions.length > 0) {
        // User has already reacted, so update the existing reaction
        const updateQuery = `
            UPDATE emoji_user
            SET emoji_id = ?
            WHERE message_id = ? AND user_id = ?;
        `;
        const updateParams = [emojiId, messageId, userId];
        await database.execute(updateQuery, updateParams);
        console.log("Successfully updated reaction");
    } else {
        // No existing reaction, insert a new one
        const insertQuery = `
            INSERT INTO emoji_user (message_id, user_id, emoji_id)
            VALUES (?, ?, ?);
        `;
        const insertParams = [messageId, userId, emojiId];
        await database.execute(insertQuery, insertParams);
        console.log("Successfully inserted new reaction");
    }
}

async function insertNewRoom(roomName) {
	let insertRoomQuery = `
	INSERT INTO room (room_name)
	VALUES (?);
	`;

	let params = [roomName];

	try {
		const results = await database.execute(insertRoomQuery, params);
		console.log("Successfully inserted new room entries");
		return results[0].insertId;
	} catch(err) {
		console.log("Error inserting new room", err);
		throw err;
	}
}

async function insertRoomUser(selectedIds, userId, roomId) {
	let insertRoomUserQuery = `
	INSERT INTO room_user (user_id, room_id)
	VALUES (?, ?);
	`;

	let params = [userId, roomId];

	try {
		for (let i = 0; i < selectedIds.length; i++) {
			selectedParams = [selectedIds[i], roomId];
			await database.execute(insertRoomUserQuery, selectedParams);
		}

		const results = await database.execute(insertRoomUserQuery, params);
		console.log("Successfully inserted new room_user entries");
		return results[0];
	} catch(err) {
		console.log("Error inserting new room_user", err);
		throw err;
	}
}

async function updateReadStatus(messageId, userId, isRead) {
	let updateQuery = `
	UPDATE message_status
	SET is_read = ?
	WHERE message_id = ? AND user_id = ?;`;

	let params = [isRead, messageId, userId];

	try {
		const results = await database.execute(updateQuery, params);
		console.log("Successfully updated unread status");
		return results[0];
	} catch(err) {
		console.log("Error updating unread status", err);
		throw err;
	}
}

async function updateRoomUser(selectedIds, roomName, messageIds) {
    // Placeholder for the function that gets roomId by roomName
    // Assuming you have this function implemented somewhere
    const roomId = await getRoomIdByName(roomName);

    if (!roomId) {
        console.error("Room ID not found for the room name:", roomName);
        throw new Error("Room ID not found.");
    }

    let insertRoomUserQuery = `
    INSERT INTO room_user (user_id, room_id)
    VALUES (?, ?);
    `;

    try {
        for (let userId of selectedIds) {
            let selectedParams = [userId, roomId];
            // Execute insert query for each user
            await database.execute(insertRoomUserQuery, selectedParams);
        }
        console.log("Successfully inserted new room_user entries");
        for (let userId of selectedIds) {
            await updateListOfReadStatus(messageIds, userId, 0);
        }
    } catch(err) {
        console.log("Error inserting new room_user", err);
        throw err; // Re-throwing the error to be caught by the calling function
    }
}

async function getRoomIdByName(roomName) {
    // Example implementation of getRoomIdByName
    // Adjust according to your actual database schema and library
    const query = `SELECT room_id FROM room WHERE room_name = ? LIMIT 1;`;
    try {
        const [rows] = await database.execute(query, [roomName]);
        if (rows.length > 0) {
            return rows[0].room_id; // Return the first matching room_id
        }
        return null; // Return null if no matching room found
    } catch (err) {
        console.error("Error fetching room ID by name:", err);
        throw err;
    }
}

async function updateListOfReadStatus(messageIds, userId, isRead) {
	let insertQuery = `
	INSERT INTO message_status (message_id, user_id, is_read)
	VALUES (?, ?, ?);`;

	try {
		for (let messageId of messageIds) {
            let params = [messageId, userId, isRead];
            await database.execute(insertQuery, params);
        }
		console.log("Successfully updated unread status");
	} catch(err) {
		console.log("Error updating unread status", err);
		throw err;
	}
}


module.exports = {printMySQLVersion, getChatList, getRoomsUnreadMessages,
				getRecentMessagesTime, getChatMessages, getInviteUserList,
				getRoomUserId, insertMessage, getRecentMessageId, insertReadStatus,
				getRoomUserIds, getUnreadMessageIds, updateReadStatus,
				insertEmojiReaction, getUserList, insertNewRoom,
				insertRoomUser, updateRoomUser};