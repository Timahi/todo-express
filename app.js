require("dotenv/config");

const express = require("express");
const cors = require("cors");
const createHttpError = require("http-errors");
const { isHttpError } = require("http-errors");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

/* Auth middleware */
app.use((req, res, next) => {
	res.locals.user = null;

	const token = req.headers.authorization?.split(" ")[1];

	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				res.locals.user = null;
			} else {
				res.locals.user = decoded.user;
			}
		});
	}

	next();
});

app.use("/auth", require("./routes/auth"));
app.use("/api/todos", require("./routes/todos"));

/* Handle 404 */
app.use("*", (req, res, next) => {
	next(createHttpError(404, "Not Found"));
});

app.use((err, req, res, next) => {
	if (process.env.NODE_ENV === "development") console.error(err);

	if (isHttpError(err)) {
		res.status(err.status).json({
			error: {
				status: err.status,
				message: err.message,
			},
		});
	} else {
		res.status(500).json({
			error: {
				status: 500,
				message: "Internal Server Error",
			},
		});
	}
});

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "localhost";
app.listen(PORT, HOST, () => {
	console.log(`Server is running on http://${HOST}:${PORT} in ${process.env.NODE_ENV} mode.`);
});
