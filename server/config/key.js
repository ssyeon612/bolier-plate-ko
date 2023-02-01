if (process.env.NODE.ENV === "production") {
    module.exports = require("./prod");
} else {
    module.exports = require("./dev");
}
