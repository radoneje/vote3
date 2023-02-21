import express from 'express';
const router = express.Router();

router.get("/", async (req, res)=>{
  res.json([])
})
router.post("/login", async (req, res)=>{
  res.json([req.body.email])
})


export default router
