const router = require("express").Router();
const createHttpError = require("http-errors");
const pool = require("../db");
const { randomUUID } = require("crypto");

/* Auth protection middleware */
router.use((req, res, next) => {
	if (!res.locals.user) {
		next(createHttpError(401, "You must be logged in to access your todos"));
	}

	next();
});

router.get("/", async (req, res, next) => {
	let conn;
	try {
		conn = await pool.getConnection();
		const rows = await conn.query("SELECT id, title, done FROM todos WHERE user_id = ?", [
			res.locals.user.id,
		]);

		res.json(rows.map((row) => ({ id: row.id, title: row.title, done: !!row.done })));
	} catch (error) {
		next(error);
	} finally {
		conn.release();
	}
});

router.post("/", async (req, res, next) => {
	let conn;
	try {
		conn = await pool.getConnection();
		const { title } = req.body;
		if (!title) throw createHttpError(400, "Title is required");

		const id = randomUUID();

		await conn.query("INSERT INTO todos (id, user_id, title) VALUES (?, ?, ?)", [
			id,
			res.locals.user.id,
			title,
		]);

		res.status(201).json({ id, title, done: false });
	} catch (error) {
		next(error);
	} finally {
		conn.release();
	}
});

router.get("/:id", async (req, res, next) => {
	let conn;
	try {
		conn = await pool.getConnection();
		const { id } = req.params;
		const [row] = await conn.query(
			"SELECT id, title, done FROM todos WHERE id = ? AND user_id = ?",
			[id, res.locals.user.id],
		);

		if (!row) throw createHttpError(404, "Todo not found");

		res.json({ id: row.id, title: row.title, done: !!row.done });
	} catch (error) {
		next(error);
	} finally {
		conn.release();
	}
});

router.put("/:id", async (req, res, next) => {
	let conn;
	try {
		conn = await pool.getConnection();
		const { id } = req.params;
		const { title } = req.body;
		const done = !!req.body.done ? 1 : 0;

		await conn.query("UPDATE todos SET title = ?, done = ? WHERE id = ? AND user_id = ?", [
			title,
			done,
			id,
			res.locals.user.id,
		]);

		res.json({ id, title, done: !!done });
	} catch (error) {
		next(error);
	} finally {
		conn.release();
	}
});

router.delete("/:id", async (req, res, next) => {
	let conn;
	try {
		conn = await pool.getConnection();
		const { id } = req.params;
		await conn.query("DELETE FROM todos WHERE id = ? AND user_id = ?", [
			id,
			res.locals.user.id,
		]);
		res.sendStatus(204);
	} catch (error) {
		next(error);
	} finally {
		conn.release();
	}
});

module.exports = router;
