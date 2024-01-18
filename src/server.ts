import fs from 'fs'
import path from 'path'
import app from './app'
import https from 'https'
import { connectToMongo } from './core/database'

const port = process.env.APP_PORT
const CERT_PATH = path.join(process.cwd(), 'cert')

async function main() {
    await connectToMongo()
    const server = https.createServer(
        {
            key: fs.readFileSync(path.join(CERT_PATH, 'key.pem')),
            cert: fs.readFileSync(path.join(CERT_PATH, 'cert.pem')),
        },
        app
    )
    server.listen(port, () => console.log(`App is running on port ${port}`))
}

main()
