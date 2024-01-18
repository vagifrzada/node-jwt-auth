interface ErrorParams {
    type: string
    message: string
    statusCode: number
    data?: any
}

export default class AppError extends Error {
    public readonly type: string
    public readonly statusCode: number
    public readonly data?: any

    constructor(params: ErrorParams) {
        super(params.message)
        this.type = params.type
        this.statusCode = params.statusCode
        this.data = params?.data
    }
}
