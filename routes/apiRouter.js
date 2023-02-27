import express from 'express';

const router = express.Router();
import nodemailer from  'nodemailer'
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const config= require('../config.json');
import multer  from 'multer'
const upload = multer({dest: config.uloadPath})

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
        r=await req.knex("v_q").where({id:r[0].id});
        res.json(r[0])
    } catch (e) {
        res.status(404).send(e.toString())
    }
})
router.post("/event", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {
        let id=req.body.id;
        delete req.body.id;
        let r=await req.knex("t_events").update(req.body,"*").where({id:id});
        res.json(r[0])
    } catch (e) {
        res.status(404).send(e.toString())
    }
})
router.post("/q", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {
        let id=req.body.id;
        delete req.body.id;
        let r=await req.knex("t_q").update(req.body,"*").where({id:id});
        res.json(r[0])
    } catch (e) {
        res.status(404).send(e.toString())
    }
})
router.post("/file", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {
        let id=req.body.id;
        delete req.body.id;
        let r=await req.knex("t_eventfiles").update({isMod:req.body.isMod, isDeleted:req.body.isDeleted, title:req.body.title},"*").where({id:id});
        res.json(r[0])
    } catch (e) {
        res.status(404).send(e.toString())
    }
})

router.post("/addVote", upload.single('file'), async (req, res) => {
    if(!req.session.user)
        res.sendStatus(401)
    try {
        let votes=await req.knex("t_votes").insert({eventshort:req.body.short},"*")
        await req.knex("t_answers").insert({voteid:votes[0].id, sort:10, },"*")
        await req.knex("t_answers").insert({voteid:votes[0].id, sort:20, },"*")
        votes=await req.knex("v_votes").where({id:votes[0].id})
        res.json(votes[0])
    } catch (e) {
        res.status(404).send(e.toString())
    }

});

router.post("/addCloud", upload.single('file'), async (req, res) => {
    if(!req.session.user)
        res.sendStatus(401)
    try {
        let votes=await req.knex("t_clouds").insert({eventshort:req.body.short},"*")

        votes=await req.knex("v_clouds").where({id:votes[0].id})
        res.json(votes[0])
    } catch (e) {
        res.status(404).send(e.toString())
    }

});

router.get("/newFile", upload.single('file'), async (req, res) => {
    if(!req.session.user)
        res.sendStatus(401)
    try {
        let files=await req.knex("t_files").insert({},"*")
        res.json(files[0].id)
    } catch (e) {
        res.status(404).send(e.toString())
    }

});
router.post("/uploadFile", upload.single('file'), async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {
        let newFileName = req.file.destination + req.file.filename + path.extname(req.file.originalname)
        fs.renameSync(req.file.destination + req.file.filename, newFileName)
        let files=await req.knex("t_files").update({
            status:2,
            originalname:req.body.name,
            mimetype:req.file.mimetype,
            size:req.file.size,
            path:newFileName
        },"*").where({id:req.body.id})
        res.json(files[0])
    } catch (e) {
        res.status(404).send(e.toString())
    }
})

router.post("/fileToEvent", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {
        let files=await req.knex("t_eventfiles").insert({fileid:req.body.fileid, eventshort:req.body.short},"*")
        files=await req.knex("v_eventfiles").where({id:files[0].id})
        res.json(files[0])

    } catch (e) {
        res.status(404).send(e.toString())
    }
})
router.post("/changeVote", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {

        await req.knex("t_votes").update(req.body.prm,"*").where({id:req.body.id})
        let votes=await req.knex("v_votes").where({id:req.body.id})
        res.json(votes[0])

    } catch (e) {
        res.status(404).send(e.toString())
    }
})

router.post("/changeCloud", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {

        await req.knex("t_clouds").update(req.body.prm,"*").where({id:req.body.id})
        let votes=await req.knex("v_clouds").where({id:req.body.id})
        res.json(votes[0])

    } catch (e) {
        res.status(404).send(e.toString())
    }
})
router.post("/vote", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {
        let id=req.body.id;
        delete req.body.id;
        await req.knex("t_votes").update({
            isActive:req.body.isActive,
            isDeleted:req.body.isDeleted,
            isComplite:req.body.isComplite,
            isNumber:req.body.isNumber,
            isMulti:req.body.isMulti,
            isScreenResult: req.body.isScreenResult,
            isSortByResult:req.body.isSortByResult
        },"*").where({id:id});
        let votes=await req.knex("v_votes").where({id})
        res.json(votes[0])
    } catch (e) {
        res.status(404).send(e.toString())
    }
})

router.post("/cloud", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {
        let id=req.body.id;
        delete req.body.id;
        await req.knex("t_clouds").update({
            isActive:req.body.isActive,
            isDeleted:req.body.isDeleted,
            isComplite:req.body.isComplite,

            isScreenResult: req.body.isScreenResult,

        },"*").where({id:id});
        let votes=await req.knex("v_clouds").where({id})
        res.json(votes[0])
    } catch (e) {
        res.status(404).send(e.toString())
    }
})
router.post("/changeAnswer", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {

        await req.knex("t_answers").update(req.body.prm,"*").where({id:req.body.id})
        let answers=await req.knex("v_answers").where({id:req.body.id})
        res.json(answers[0])

    } catch (e) {
        res.status(404).send(e.toString())
    }
})
router.post("/answer", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {
        let id=req.body.id;
        delete req.body.id;
        await req.knex("t_answers").update({
            isDeleted:req.body.isDeleted,
            title:req.body.title,
            sort:req.body.sort
        },"*").where({id:id});
        let votes=await req.knex("v_answers").where({id})
        res.json(votes[0])
    } catch (e) {
        res.status(404).send(e.toString())
    }
})
router.post("/addAnswer", async (req, res) => {

    if(!req.session.user)
        res.sendStatus(401)
    try {

        let a=await req.knex("t_answers").insert({voteid:req.body.id},"*");
        let answers=await req.knex("v_answers").where({id:a[0].id})
        res.json(answers[0])

    } catch (e) {
        res.status(404).send(e.toString())
    }
})
router.post("/hand", async (req, res) => {
    try {
        let personid=req.body.personid
        if(!personid)
            personid=(await req.knex("t_persons").insert({},"*"))[0].id

        await req.knex("t_hands").insert({answershort:req.body.answer, personid},"*");
        res.json({personid})

    } catch (e) {
        res.status(404).send(e.toString())
    }
})
router.post("/cloudAnswer", async (req, res) => {
    try {
        let personid=req.body.personid
        if(!personid)
            personid=(await req.knex("t_persons").insert({},"*"))[0].id

        await req.knex("t_cloudanswers").where({cloudshort:req.body.short, personid}).del();
        let words=req.body.value.split(',');
        words.forEach(w=>{
            try {
                w=w.replace(/\s+/g," ")
                w = capitalizeFirstLetter(w.trim().toLowerCase());
                w=w.trim;
                w=w.replace(/^\s*/,"")
                w=w.replace(/\s*$/,"")
            }catch (e){

                console.log(w)
                w=null;
            }
        })
        words=words.filter(w=>{return w});
        for(let w of words){
            await req.knex("t_cloudanswers").insert({word:w,cloudshort:req.body.short, personid})
        }
       // await req.knex("t_cloudanswers").insert({answershort:req.body.answer, personid},"*");
        res.json({personid})

    } catch (e) {
        res.status(404).send(e.toString())
    }
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
})

router.post("/unHand", async (req, res) => {
    try {

        let a=await req.knex("t_hands").where({answershort:req.body.answer, personid:req.body.personid}).del();
        res.json(a)

    } catch (e) {
        res.status(404).send(e.toString())
    }
})














export default router
