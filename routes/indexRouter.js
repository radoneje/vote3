import express from 'express';
const router = express.Router();


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

  res.render("eventElems/links.pug", {event:events[0]})
})
router.get("/", async (req, res)=>{


  res.render("index", {user:req.session.user})
})


export default router
