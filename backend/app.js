import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import db from './utils/db-connection.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config({
    path: './.env'
})

const app = express()
app.use(cookieParser())

const PORT = 5000

app.use(express.json())
app.use(cors({
  origin:"*",
  credentials:true,
}))

app.use('/user', authRoutes)


db.sync().then((result) => {
  app.listen(PORT, () => {
    console.log("Server is running on 5000")
  })
}).catch((err) => {
  console.log("Error in syncing with database in app.js", err.message)
});