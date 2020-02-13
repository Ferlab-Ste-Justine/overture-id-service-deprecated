const R = require('ramda')
const Either = require('data.either')

const errors = require('restify-errors')

const { Client } = require('@elastic/elasticsearch')

const eUtils = require('./clin_elasticsearch_utils')

const { 
    load_mandatory_str_env_var
} = require('../utils')

const client = new Client({ node: load_mandatory_str_env_var('ELASTISEARCH_URL') })

const get_patient = (params) => {
    const submitterId = params['submittedPatientId']
    const submitterIdComponents = eUtils.patient_submitter_id_components(submitterId)
    const search = eUtils.generate_patient_search({
        "bool": {
            "should": [
                {
                  "bool": {
                    "must": [
                      { "match": { "identifier.MR": submitterIdComponents['mr'] }},
                      { "match": { "organization.alias": submitterIdComponents['orgAlias'] }}
                      
                    ]
                  }
                },
                { "match": { "identifier.JHN": submitterId }}
            ]
        }
    })
    try {
        const { body } = await client.search(search)
        return R.compose(
            (result) => Promise.resolve(result),
            Either.Right,
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

const get_specimen = (params) => {
    const submitterId = params['submittedSpecimenId']
    const search = eUtils.generate_patient_and_search({
        "studies.id":  params['submittedProjectId'],
        "specimens.container":  submitterId
    })
    try {
        const { body } = await client.search(search)
        return R.compose(
            (result) => Promise.resolve(result),
            Either.Right,
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

const get_sample  = (params) => {
    const submitterId = params['submittedSampleId']
    const search = eUtils.generate_patient_and_search({
        "studies.id":  params['submittedProjectId'],
        "specimens.container":  submitterId
    })
    try {
        const { body } = await client.search(search)
        return R.compose(
            (result) => Promise.resolve(result),
            Either.Right,
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

const is_healthy = () => Promise.resolve(true);

const label = 'clin-elastisearch'

module.exports = {
    get_patient,
    get_specimen,
    get_sample,
    is_healthy,
    label
}