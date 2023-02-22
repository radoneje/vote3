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




router.get("/u/:short", async (req, res) => {
   try {
       let events = await req.knex("t_events").where({short: req.params.short, isDeleted: false})
       if (events.length == 0)
           return res.sendStatus(404);
       res.render("work", {event:events[0]})
   }
   catch (e){
       console.warn(e)
       res.status(500).send(e)
   }
})
router.get("/status/:short/:lastTime?", async (req, res) => {
    try {
        let lastTime=req.params.lastTime||0;
        let timeout=5;
       res.json({timeout, lastTime})
    }
    catch (e){
        console.warn(e)
        res.status(500).send(e)
    }
})


export default router
