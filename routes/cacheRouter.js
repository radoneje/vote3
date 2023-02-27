import express from 'express';

const router = express.Router();
import nodemailer from 'nodemailer'
import path from 'path';
import fs from 'fs';
import {createRequire} from 'module';
import {fileURLToPath} from 'url';

const require = createRequire(import.meta.url);
const config = require('../config.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.get("/u/:short", async (req, res) => {
    try {
        let events = await req.knex("t_events").where({short: req.params.short, isDeleted: false})
        if (events.length == 0)
            return res.sendStatus(404);
        res.render("work", {event: events[0]})
    } catch (e) {
        console.warn(e)
        res.status(500).send(e)
    }
})
router.get("/status/:short/:lastTime?", async (req, res) => {
    let lastTime = req.params.lastTime || 0;
    try {

        let ret = {timeout: 5, lastTime}
        let events = await req.knex("t_events").where({
            short: req.params.short,
            isDeleted: false
        }).andWhere("modtime", ">", lastTime)
        let params = {eventshort: req.params.short}
        let files = await req.knex("v_eventfiles").where(params).andWhere("modtime", ">", lastTime).orderBy("id",)
        let votes = await req.knex("v_votes").where(params).andWhere("modtime", ">", lastTime).orderBy("id")
        let clouds = await req.knex("v_clouds").where(params).andWhere("modtime", ">", lastTime).orderBy("id")

        if (req.query.prm != "all")
            params.isMod = true
        let q = await req.knex("v_q").where(params).andWhere("modtime", ">", lastTime).orderBy("id")


        if (events.length > 0) {
            ret.event = {
                short: events[0].short,
                title: events[0].title,
                isQ: events[0].isQ,
            }
            if (req.query.prm == "all") {
                ret.event.isQpreMod = events[0].isQpreMod
            }
            ret.lastTime = events[0].modtime
        }

        if (q.length > 0) {
            ret.q = q;
            let arr = []
            q.forEach(qq => {
                arr.push(qq.modtime)
            })
            ret.lastTime = Math.max(ret.lastTime, Math.max(...arr));
        }
        if (files.length > 0) {
            ret.files = files;
            let arr = []
            files.forEach(qq => {
                arr.push(qq.modtime)
            })
            ret.lastTime = Math.max(ret.lastTime, Math.max(...arr));
        }
        if (clouds.length > 0) {
            if (req.query.prm != "all") {
                clouds.forEach(cloud => {
                    if (!cloud.isActive) {
                        delete cloud.title;
                        delete cloud.result;
                    }
                })
            }
            ret.clouds = clouds;
            let arr = []
            clouds.forEach(qq => {
                arr.push(qq.modtime)
            })
            ret.lastTime = Math.max(ret.lastTime, Math.max(...arr));
        }
        if (votes.length > 0) {
            if (req.query.prm != "all") {
                votes.forEach(vote => {

                    if (vote.isComplite && vote.isActive && vote.isSortByResult) {
                        vote.answers = vote.answers.sort((a, b) => {
                            return b.hands - a.hands
                        })
                    }
                    if (!vote.isNumber && vote.isActive)
                        vote.answers.forEach(a => {
                            delete a.hands
                        })
                    if (!vote.isActive) {
                        delete vote.title;
                        delete vote.answers;
                    }
                })
            }
            ret.votes = votes;
            let arr = []
            votes.forEach(qq => {
                arr.push(qq.modtime)
            })
            ret.lastTime = Math.max(ret.lastTime, Math.max(...arr));
        }
        res.json(ret)
    } catch (e) {
        console.warn(e)
        res.status(500).send(req.params.short + ", " + lastTime + ", " + e.toString())
    }
})
router.get("/cloudRes/:short", async (req, res) => {

    let dt=await req.knex("v_getclouds").where({short:req.params.short})
    res.render("cloudBox", {data:dt[0].clouds, short:req.params.short})


})


export default router
