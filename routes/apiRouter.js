import express from 'express';

const router = express.Router();

const randomIntFromInterval = (min, max) => { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

router.get("/", async (req, res) => {
    res.json([])
})
router.post("/login", async (req, res) => {
    let users = await req.knex("t_users").where({email: req.body.email})
    if (users.length == 0)
        users = await req.knex("t_users").insert({email: req.body.email}, "*")
    await req.knex("t_users").update({confirmCode: randomIntFromInterval(1000, 9999)})
    res.json({email: users[0].email})
})
router.post("/checkCode", async (req, res) => {
    try {
        let users = await req.knex("t_users").where({email: req.body.email, confirmCode: req.body.code})
        if (users.length == 0)
            return req.sendStatus(404)
        req.session.user = users[0];
        res.json({guid: users[0].guid})
    } catch (e) {
        req.sendStatus(404)
    }
})


export default router
