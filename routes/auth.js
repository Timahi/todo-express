const router = require("express").Router();
const createHttpError = require("http-errors");
const pool = require("../db");
const { randomUUID } = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res, next) => {
	let conn;
	try {
		conn = await pool.getConnection();

		const { username, password } = req.body;
		if (!username || !password) {
			throw createHttpError(400, "Username and password are required");
		}

		const [existingUser] = await conn.query("SELECT * FROM users WHERE username = ?", [
			username,
		]);
		if (existingUser) throw createHttpError(400, "Username already exists");

		const id = randomUUID();

		const hashedPassword = await bcrypt.hash(password, 10);

		await conn.query("INSERT INTO users (id, username, hashed_password) VALUES (?, ?, ?)", [
			id,
			username,
			hashedPassword,
		]);

		res.status(201).json({ id, username });
	} catch (error) {
		next(error);
	} finally {
		conn.release();
	}
});

router.post("/login", async (req, res, next) => {
	let conn;
	try {
		conn = await pool.getConnection();

		const { username, password } = req.body;
		if (!username || !password) {
			throw createHttpError(400, "Username and password are required");
		}

		const [user] = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
		if (!user) throw createHttpError(400, "Invalid username or password");

		const isPasswordValid = await bcrypt.compare(password, user.hashed_password);

		if (!isPasswordValid) throw createHttpError(400, "Invalid username or password");

		const token = jwt.sign(
			{
				user: {
					id: user.id,
					username: user.username,
				},
			},
			process.env.JWT_SECRET,
			{
				expiresIn: "1h",
			},
		);

		res.json({
			user: {
				id: user.id,
				username: user.username,
			},
			access_token: token,
		});
	} catch (error) {
		next(error);
	} finally {
		conn.release();
	}
});

module.exports = router;
