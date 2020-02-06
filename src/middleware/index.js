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
        next()
    } else {
        logger.info({
            'event': 'incoming_request',
            'method': req.method,
            'url': req.url,
            'validation': 'failed',
            'error': validation.error
        })
        res.status(400).send(validation.error)
    }
})

const getId = R.curry((source, sourceType, logger) => (req, res, next) => {
    source[sourceType](req.query).then((result) => {
        if(result.isRight) {
            logger.debug({
                'event': 'id_mapping_success',
                'method': req.method,
                'url': req.url,
                'source': source.label,
                'type': sourceType,
                'result': result.value
            })
            res.status(200).send(result.value)
        } else {
            logger.info({
                'event': 'id_mapping_failure',
                'method': req.method,
                'url': req.url,
                'source': source.label,
                'type': sourceType,
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