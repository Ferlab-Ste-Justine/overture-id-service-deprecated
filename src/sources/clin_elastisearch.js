const R = require('ramda')
const Either = require('data.either')

const errors = require('restify-errors')

const { Client } = require('@elastic/elasticsearch')

const eUtils = require('./clin_elasticsearch_utils')

const { 
    load_mandatory_str_env_var
} = require('../utils')

const client = new Client({ node: load_mandatory_str_env_var('ELASTISEARCH_URL') })

/*
GET /patient/_doc/_search
{
  "query" : {
    "bool": {
        "should": [
            {
              "bool": {
                "must": [
                  { "match": { "identifier.MR": "aaaaaaa" }},
                  { "match": { "organization.alias": "aaaaaaa" }}
                  
                ]
              }
            },
            { "match": { "identifier.JHN": "aaaaaaa" }}
        ]
    }
  }
}
*/
const get_patient = R.compose(
    (result) => Promise.resolve(result),
    R.ifElse(
        R.startsWith('DO'),
        R.compose(
            Either.Right,
            R.replace('DO', 'PATIENT')
        ),
        () => Either.Left(new errors.NotFoundError("Patient not found"))
    ),
    R.prop('submittedPatientId')
)

const get_specimen = (params) => {
    const search = eUtils.generate_patient_and_search({
        "studies.id":  params['submittedProjectId'],
        "specimens.container":  params['submittedSpecimenId']
    })
    try {
        const { body } = await client.search(search)
        return R.compose(
            (result) => Promise.resolve(result),
            Either.Right,
            eUtils.get_from_first_result(
                R.view(eUtils.specimen.systemId)
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
    const search = eUtils.generate_patient_and_search({
        "studies.id":  params['submittedProjectId'],
        "specimens.container":  params['submittedSampleId']
    })
    try {
        const { body } = await client.search(search)
        return R.compose(
            (result) => Promise.resolve(result),
            Either.Right,
            eUtils.get_from_first_result(
                R.view(eUtils.specimen.systemId)
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