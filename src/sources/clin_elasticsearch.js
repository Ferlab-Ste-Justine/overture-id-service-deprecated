const R = require('ramda')
const Either = require('data.either')

const errors = require('restify-errors')

const { Client } = require('@elastic/elasticsearch')

const eUtils = require('./clin_elasticsearch_utils')

const { 
    load_mandatory_str_env_var
} = require('../utils')

const client = new Client({ node: load_mandatory_str_env_var('ELASTISEARCH_URL') })

const get_patient = async (params) => {
    const submitterId = params['submittedPatientId']
    const search = eUtils.generate_patient_search({
        "bool": {
            "must": [
                { "match": { "studies.id":  params['submittedProjectId'] }},
                { "match": { "id":  submitterId }}
            ]
        }
    })
    try {
        const { body } = await client.search(search)
        return R.compose(
            (result) => Promise.resolve(result),
            eUtils.get_from_first_result(
                eUtils.resultAccesors.patientSystemId
            )
        )(body)
    } catch(err) {
        return Promise.resolve(
            Either.Left(new errors.ServiceUnavailableError({
                cause: err
            }, "ID source unavailable"))
        )
    }
}

const get_specimen = async (params) => {
    const submitterId = params['submittedSpecimenId']
    const search = eUtils.generate_patient_and_search({
        "studies.id":  params['submittedProjectId'],
        "specimens.container":  submitterId
    })
    try {
        const { body } = await client.search(search)
        return R.compose(
            (result) => Promise.resolve(result),
            eUtils.get_from_first_result(
                R.compose(
                    eUtils.specimenAccessors.systemId,
                    eUtils.resultAccesors.specimenWithSubmitterId(submitterId)
                )
            )
        )(body)
    } catch(err) {
        return Promise.resolve(
            Either.Left(new errors.ServiceUnavailableError({
                cause: err
            }, "ID source unavailable"))
        )
    }
}

const get_sample  = async (params) => {
    const submitterId = params['submittedSampleId']
    const search = eUtils.generate_patient_and_search({
        "studies.id":  params['submittedProjectId'],
        "samples.container":  submitterId
    })
    try {
        const { body } = await client.search(search)
        return R.compose(
            (result) => Promise.resolve(result),
            eUtils.get_from_first_result(
                R.compose(
                    eUtils.specimenAccessors.systemId,
                    eUtils.resultAccesors.sampleWithSubmitterId(submitterId)
                )
            )
        )(body)
    } catch(err) {
        return Promise.resolve(
            Either.Left(new errors.ServiceUnavailableError({
                cause: err
            }, "ID source unavailable"))
        )
    }
}

const is_healthy = async () => {
    return client.cat.health({'format': 'json'})
}

const label = 'clin-elastisearch'

module.exports = {
    get_patient,
    get_specimen,
    get_sample,
    is_healthy,
    label
}