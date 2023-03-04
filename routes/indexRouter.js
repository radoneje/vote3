import express from 'express';
const router = express.Router();
import  QRCode from 'qrcode'
import { fileURLToPath } from 'url';
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import axios from 'axios';


router.get("/userEvent", async (req, res)=>{

  if(!req.session.user)
    res.sendStatus(401)

  res.redirect("/userEvent/links")
})
router.get("/userEvent/links", async (req, res)=>{
  if(!req.session.user)
    res.sendStatus(404)
  let events=await req.knex("t_events").where({userid:req.session.user.id})
  if(events.length==0)
    events=await req.knex("t_events").insert({userid:req.session.user.id},"*")

  res.render("eventElems/links.pug", {event:events[0], host:req.protocol + 's://' + req.get('host')})
})
router.get("/userEvent/q", async (req, res)=>{
    if(!req.session.user)
        res.sendStatus(404)

    let events=await req.knex("t_events").where({userid:req.session.user.id})
    if(events.length==0)
        events=await req.knex("t_events").insert({userid:req.session.user.id},"*")

    res.render("eventElems/q.pug", {event:events[0]})
})
router.get("/userEvent/files", async (req, res)=>{
    if(!req.session.user)
        res.sendStatus(404)

    let events=await req.knex("t_events").where({userid:req.session.user.id})
    if(events.length==0)
        events=await req.knex("t_events").insert({userid:req.session.user.id},"*")

    res.render("eventElems/files.pug", {event:events[0]})
})
router.get("/userEvent/votes", async (req, res)=>{
    if(!req.session.user)
        res.sendStatus(404)

    let events=await req.knex("t_events").where({userid:req.session.user.id})
    if(events.length==0)
        events=await req.knex("t_events").insert({userid:req.session.user.id},"*")

    res.render("eventElems/votes.pug", {event:events[0]})
})
router.get("/userEvent/clouds", async (req, res)=>{
    if(!req.session.user)
        res.sendStatus(404)

    let events=await req.knex("t_events").where({userid:req.session.user.id})
    if(events.length==0)
        events=await req.knex("t_events").insert({userid:req.session.user.id},"*")

    res.render("eventElems/clouds.pug", {event:events[0]})
})
router.get("/userEvent/player", async (req, res)=>{
    if(!req.session.user)
        res.sendStatus(404)

    let events=await req.knex("t_events").where({userid:req.session.user.id})
    if(events.length==0)
        events=await req.knex("t_events").insert({userid:req.session.user.id},"*")

    res.render("eventElems/player.pug", {event:events[0]})
})


router.get("/userEvent/baro", async (req, res)=>{
    if(!req.session.user)
        res.sendStatus(404)

    let events=await req.knex("t_events").where({userid:req.session.user.id})
    if(events.length==0)
        events=await req.knex("t_events").insert({userid:req.session.user.id},"*")

    res.render("eventElems/baro.pug", {event:events[0]})
})
router.get("/userEvent/title", async (req, res)=>{
    if(!req.session.user)
        res.sendStatus(404)

    let events=await req.knex("t_events").where({userid:req.session.user.id})
    if(events.length==0)
        events=await req.knex("t_events").insert({userid:req.session.user.id},"*")

    res.render("eventElems/title.pug", {event:events[0]})
})
router.get("/userEvent/settings", async (req, res)=>{
    if(!req.session.user)
        res.sendStatus(404)

    let events=await req.knex("t_events").where({userid:req.session.user.id})
    if(events.length==0)
        events=await req.knex("t_events").insert({userid:req.session.user.id},"*")

    res.render("eventElems/settings.pug", {event:events[0]})
})






router.get("/qrcode/", async (req, res)=>{

  let url=decodeURI(req.query.url);

  res.setHeader('content-type','image/png');
  QRCode.toFileStream(res, url,
      {
        type: 'png',
        width: 600,
        errorCorrectionLevel: 'H'
      });
})
router.get("/file/:short", async (req, res)=>{
    try {

        let r=await req.knex("t_files").where({short:req.params.short});
        res.download(__dirname+"/../"+r[0].path, r[0].originalname )
    } catch (e) {
        res.status(404).send(e.toString())
    }
})

router.get("/verify", async (req, res)=>{

    if(req.query.error)
        return res.render("index", {user:req.session.user})
    let dt=await(axios.get("https://oauth.vk.com/access_token/?client_id=51571826&client_secret=n7zOChnGVZv8clOYDhcx&redirect_uri=https://event-24.ru/verify&code="+req.query.code))
    let access_token=dt.data.access_token;
    let user_id=dt.data.user_id;
    let email=dt.data.email;
    let users=await req.knex("t_users").where({vkid:user_id});
    if(users.length==0){
        dt=await(axios.get("https://api.vk.com/method/users.get?v=5.103&user_ids="+user_id+"&fields=sex&access_token="+access_token))
        let vkuser=dt.data.response[0];
        users=await req.knex("t_users").insert({isConfirmad:true,f:vkuser.first_name, i:vkuser.last_name,email:email, sex:vkuser.sex==2? true:false, vkid:user_id},"*")
    }

   if(users.length==0)
       res.render("index", {user:req.session.user})

    req.session.user=users[0];

    res.render("index", {user:req.session.user})
})

router.get("/", async (req, res)=>{


  res.render("index", {user:req.session.user})
})




export default router
