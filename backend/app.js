import express from 'express'
import db from './utils/db-connection.js'

const app = express()

const PORT = process.env.PORT || 5000


db.sync().then((result) => {
    app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
}).catch((err) => {
    console.log("Error in app.js while syncing with database", err.message)
});

