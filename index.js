const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const config = require("./config/key");
const { User } = require("./models/User");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// applications/json
app.use(bodyParser.json());

const mongoose = require("mongoose");
const { response } = require("express");
mongoose.set("strictQuery", true);
mongoose
    .connect(config.mongoURI)
    .then(() => console.log("MongoDB Connected..."))
    .catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.send("Hello World!!");
});

app.post("/register", (req, res) => {
    const user = new User(req.body);
    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
        });
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
