import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

export async function connectToMongo(): Promise<boolean> {
    mongoose.connection.once('connected', () => {
        console.log('Connected to MongoDB')
    })

    mongoose.connection.on('error', (err) => {
        console.error(`MongoDB error: '${err.message}'`)
        process.exit(1)
    })

    const connectionParams = {
        serverSelectionTimeoutMS: 3000,
    }
    await mongoose.connect(MONGODB_URI, connectionParams)
    return true
}

export async function disconnectFromMongo(): Promise<boolean> {
    await mongoose.disconnect()
    return true
}
