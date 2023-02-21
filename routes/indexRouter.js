import express from 'express';
const router = express.Router();

router.get("/", async (req, res)=>{

  res.render("index", {user:req.session.user})
})
router.get("/userEvent", async (req, res)=>{

  if(!req.session.user)
    res.sendStatus(404)
  res.render("event", {user:req.session.user})
})


export default router
