import express from 'express';

const router = express.Router();
import nodemailer from  'nodemailer'
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const config= require('../config.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




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
    let r=await req.knex("t_users").update({confirmCode: randomIntFromInterval(1000, 9999)}, "*").where({id:users[0].id})
    res.json({email: r[0].email})
    try {
        let transporter = nodemailer.createTransport(config.spam);
        let info = await transporter.sendMail({
            from: 'news@uralcyberfin.ru', // sender address
            to: r[0].email, // list of receivers
            subject: "Код для входа", // Subject line
            html: "Ваш код для входа: <b>" + r[0].confirmCode + "</b>", // html body
        });
        console.log("sent to", r[0].email)
    }
    catch (e){console.warn(e)}

})
router.post("/checkCode", async (req, res) => {
    try {
        if(!req.body.code.match(/^\d+$/))
            res.sendStatus(404)

        let users = await req.knex("t_users").where({email: req.body.email, confirmCode: req.body.code})
        if (users.length == 0)
            return res.sendStatus(404)
        req.session.user = users[0];
        res.json({guid: users[0].guid})
    } catch (e) {
        res.sendStatus(404)
    }
})
router.post("/regPerson", async (req, res) => {
    try {
        let r=await req.knex("t_persons").insert({
            i:req.body.i,
            f:req.body.f,
            phone:req.body.phone,
            email:req.body.email,
            org:req.body.org
        },"*")
        res.json({personid:r[0].id})
    } catch (e) {
        res.status(404).send(e)
    }
})
router.post("/newQ", async (req, res) => {
    try {
        let r=await req.knex("t_q").insert(req.body,"*")
        r=await req.knex("v_q").where({id:r[0].id, isMod:true});
        res.json(r[0])
    } catch (e) {
        res.status(404).send(e)
    }
})





export default router
