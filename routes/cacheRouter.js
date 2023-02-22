import express from 'express';

const router2 = express.Router();
import nodemailer from  'nodemailer'
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const config= require('../config.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let router={
    get:(url,params)=>{
        try {
            router2.get(url, params)
        }
        catch (e){
            params.res.sendStatus(500);
            comsole.log(e)
        }
    }
}


router.get("/u/:short", async (req, res) => {
   let events=await req.knex("t_evants").where({short:req.params.short, isDeleted:false})
    if(events.length==0)
        return res.sendStatus(404);
    res.json({a:"ok"})
})



export default router
