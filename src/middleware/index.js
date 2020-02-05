const R = require('ramda')

const check_query = R.curry((querySchema, logger) => (req, res, next) => {
    const validation = querySchema.validate(req.query);
    if(!validation.error) {
        logger.info({
            'event': 'incoming_request',
            'method': req.method,
            'url': req.url,
            'validation': 'passed'
        })
        res.status(400).send(validation.error)
    } else {
        logger.info({
            'event': 'incoming_request',
            'method': req.method,
            'url': req.url,
            'validation': 'failed',
            'error': validation.error
        })
        next()
    }
})

const getId = R.curry((source, sourceType, logger) => (req, res, next) => {
    source[sourceType](req.query).then((result) => {
        if(result.isRight) {
            logger.debug({
                'event': 'id_mapping_success',
                'method': req.method,
                'url': req.url,
                'result': result.value
            })
            res.status(200).send(result.value)
        } else {
            logger.info({
                'event': 'id_mapping_failure',
                'method': req.method,
                'url': req.url,
                'error': result.value
            })
            next(result.value)
        }
    })
})

module.exports = {
    check_query,
    getId
}