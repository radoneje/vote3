import express from 'express';
const router = express.Router();


router.get("/userEvent", async (req, res)=>{

  if(!req.session.user)
    res.sendStatus(401)
  res.redirect("/userEvent/params")
})
router.get("/userEvent/params", async (req, res)=>{

  if(!req.session.user)
    res.sendStatus(404)
  res.render("eventElems/params.pug")
})
router.get("/", async (req, res)=>{

  res.render("index", {user:req.session.user})
})


export default router
