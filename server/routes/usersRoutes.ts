import express from 'express'
import { Users } from 'models/users'
import { JwtRequest } from 'server/auth0'
import checkJwt from 'server/auth0'

import * as db from '../db/users'

const router = express.Router()

//Get /api/v1/users
router.get('/', async (req, res) => {
  try {
    const users = await db.getAllUsers()
    res.json(users)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
})

//GET by id

//POST /api/v1/users
router.post('/', checkJwt, async (req: JwtRequest, res) => {
  try {
    const newUser = req.body
    const auth0id = req.auth?.sub
    const [users] = await db.addUser({
      ...newUser,
      auth0id,
    })
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
})

export default router
