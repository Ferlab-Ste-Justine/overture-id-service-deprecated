//Library dependencies
const R = require('ramda')
const express = require('express')
const Either = require('data.either')
const Joi = require('@hapi/joi')

//Internal dependencies
const configs = require('./config')
const logger = require('./logger')
const idsSource = require('./sources')[configs.idsSource]

const middleware = require('./middleware')

//Routing

const server = express()

const nonEmptyString = Joi.string().min(1).required()

const patientQuery = Joi.object({
    'submittedProjectId': nonEmptyString,
    'submittedPatientId': nonEmptyString
})
server.get('/patient/id',
    middleware.check_query(patientQuery, logger.httpLogger),
    middleware.getId(idsSource, 'get_patient')
)

const specimenQuery = Joi.object({
    'submittedProjectId': nonEmptyString,
    'submittedSpecimenId': nonEmptyString
})
server.get('/specimen/id',
    middleware.check_query(specimenQuery, logger.httpLogger),
    middleware.getId(idsSource, 'get_specimen')
)

const sampleQuery = Joi.object({
    'submittedProjectId': nonEmptyString,
    'submittedSampleId': nonEmptyString
})
server.get('/sample/id',
    middleware.check_query(sampleQuery, logger.httpLogger),
    middleware.getId(idsSource, 'get_sample')
)

server.use(function (req, res, next) {
    logger.httpLogger.info({
        'event': 'unhandled_request',
        'method': req.method,
        'url': req.url
    })
    res.status(404).send('Unknown Url')
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
        } else if (code == 'NotFound') {
            res.status(404).send(err_message(err))
        } else {
            res.status(500).send('Undefined Error')
        }
    } else {
        return next(err)
    }
    
})

//Server launch

server.listen(configs.servicePort, function() {
    console.log('%s listening at %s', server.name, server.url)
})