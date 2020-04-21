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

const get_id = R.curry((source, sourceType, logger) => (req, res, next) => {
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

const health_check = R.curry((source, logger) => {
    return (req, res, next) => {
        source.is_healthy().then((isHealthy) => {
            if(isHealthy) {
                logger.info('Health check succeeded')
                res.status(200)
                res.send('ok')
            } else {
                logger.warn('Health check failed')
                res.status(500)
                res.send('not ok')
            }
        }).catch((err) => {
            logger.warn('Health check failed')
            res.status(500)
            res.send('not ok')
        })
    }
})

module.exports = {
    check_query,
    get_id,
    health_check
}