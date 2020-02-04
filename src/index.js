//Library dependencies
const R = require('ramda')
const express = require('express')
const Either = require('data.either')

//Internal dependencies
const configs = require('./config')
const logger = require('./logger')

//Routing

const server = express()

var dummy_increment = 0
server.use(function (req, res, next) {
    logger.httpLogger.info({
        'request': {
            'method': req.method,
            'url': req.url
        }
    })
    res.status(200).send('id_' + dummy_increment)
    dummy_increment += 1
})

const err_message = R.path(['body', 'message'])
const err_code = R.path(['body', 'code'])
const err_has_code = R.compose(R.not, R.isNil, err_code)
server.use(function (err, req, res, next) {
    if (err_has_code(err)) {
        const code = err_code(err)
        if(code == 'Unauthorized') {
            res.status(401).send(err_message(err))
        } else if(code == 'Forbidden') {
            res.status(403).send(err_message(err))
        } else {
            return next(err)
        }
    } else {
        return next(err)
    }
    
})

//Server launch

server.listen(configs.servicePort, function() {
    console.log('%s listening at %s', server.name, server.url)
})