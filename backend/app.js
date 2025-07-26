import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import db from './utils/db-connection.js'
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import messageRoutes from './routes/messageRoutes.js'

dotenv.config({
    path: './.env'
})

const app = express()

const PORT = 5000

// CORS must come BEFORE other middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your React app URL (Vite default)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Other middleware after CORS
app.use(cookieParser())
app.use(express.json())

app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is working!' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Auth Routes 
app.use('/user', authRoutes)

// Dashboard Routes
app.use('/api/v1/dashboard', dashboardRoutes)

// message routes
app.use('/api/v1', messageRoutes) // Changed this line

db.sync().then((result) => {
  app.listen(PORT, () => {
    console.log("Server is running on 5000")
  })
}).catch((err) => {
  console.log("Error in syncing with database in app.js", err.message)
});