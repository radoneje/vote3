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
    let lastTime=req.params.lastTime||0;
    try {

        let ret={timeout:5, lastTime}
        let events=await req.knex("t_events").where({short:req.params.short, isDeleted:false}).andWhere("modtime", ">", lastTime)
        if(events.length>0) {
            ret.event = {
                short: events[0].short,
                title: events[0].title,
                isQ: events[0].isQ,
            }
            ret.lastTime=events[0].modtime
        }
        let q=await req.knex("v_q").where({isMod:true, eventshort:req.params.short}).andWhere("modtime", ">", lastTime).orderBy("date", "desc")
        if(q.length>0){
            ret.q=q;
            let arr=[]
            q.forEach(qq=>{arr.push(qq.modtime)})
            ret.lastTime=Math.max([ret.lastTime, Math.max(...arr)]);
        }
        res.json(ret)
    }
    catch (e){
        console.warn(e)
        res.status(500).send(req.params.short+", "+lastTime+", "+e.toString())
    }
})


export default router
