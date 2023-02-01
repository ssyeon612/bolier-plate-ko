const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// applications/json
app.use(bodyParser.json());
app.use(cookieParser());

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

app.post("/api/users/register", (req, res) => {
    const user = new User(req.body);
    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true,
        });
    });
});

app.post("/api/users/login", (req, res) => {
    // 데이터 베이스에서 이메일 확인
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다.",
            });
        }
        // 비밀번호 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." });
            // token 생성
            user.gernerateToken((err, user) => {
                if (err) return res.status(400).send(err);
                // token 쿠키에 저장
                res.cookie("x_auth", user.token).status(200).json({ loginSuccess: true, userId: user._id });
            });
        });
    });
});

app.get("/api/users/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
    });
});

app.get("/api/users/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true,
        });
    });
});

app.get("/api/hello", (req, res) => {
    res.send("안녕하세요");
});

const port = 5000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
