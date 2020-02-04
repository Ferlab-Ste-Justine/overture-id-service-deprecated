const winston = require('winston')
const configs = require('./config')

const loggers = {
    'default': winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [
            new winston.transports.Console({})
        ]
    }),
    'console_debug': winston.createLogger({
        level: 'debug',
        format: winston.format.json(),
        transports: [
            new winston.transports.Console({})
        ]
    }),
    'file_debug': winston.createLogger({
        level: 'debug',
        format: winston.format.json(),
        transports: [
            new winston.transports.File({ filename: '/opt/reverse_proxy_error.log', level: 'error' }),
            new winston.transports.File({ filename: '/opt/reverse_proxy_combined.log' })
        ]
    })
}

module.exports = {
    storeLogger: loggers[configs.storeLogger],
    httpLogger: loggers[configs.httpLogger]
}