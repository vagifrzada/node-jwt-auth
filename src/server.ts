import app from './app'
import http from 'http'
import { connectToMongo } from './core/database'

const port = process.env.APP_PORT

async function main() {
    await connectToMongo()
    const server = http.createServer(app)
    server.listen(port, () => console.log(`App is running on port ${port}`))
}

main()
