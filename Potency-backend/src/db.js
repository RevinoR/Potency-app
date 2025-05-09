import pg from "pg"
import env from "dotenv"

env.config();

const db = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
db.connect();

db.on('error', (err) => {
    console.error('error in client', err)
    process.exit(-1);
});



export const query = (text, params) => db.query(text, params);