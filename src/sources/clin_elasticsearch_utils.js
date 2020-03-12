const R = require('ramda')
const Either = require('data.either')

const errors = require('restify-errors')

// Utilities to process elasticsearch response

const responseAccessors = {
    resultsCount: R.path(['hits', 'total']),
    hasResults: R.compose(R.gt(R.__, 0), R.path(['hits', 'total'])),
    results: R.compose(R.map(R.prop('_source')), R.path(['hits', 'hits'])),
    firstResult: R.path(['hits', 'hits', 0, '_source'])
}

const containerMatchingID = (submitterId) => R.compose(
    R.prop(0),
    R.filter(
        R.compose(
            R.equals(submitterId),
            R.prop(0),
            R.prop('container')
        )
    )
)

const resultAccesors = {
    specimenWithSubmitterId: (submitterId) => R.compose(
        containerMatchingID(submitterId),
        R.prop('specimens')
    ),
    sampleWithSubmitterId: (submitterId) => R.compose(
        containerMatchingID(submitterId),
        R.prop('samples')
    ),
    patientSystemId: R.prop('id'),
    patientSubmitterId: R.prop('id')
}

const specimenAccessors = {
    systemId: R.prop('id'),
    submitterId: R.path(['container', 0])
}

const get_from_first_result = (getter) => {
    return R.ifElse(
        responseAccessors.hasResults,
        R.compose(
            Either.Right,
            getter,
            responseAccessors .firstResult
        ),
        () => Either.Left(new errors.NotFoundError("resource not found"))
    );
}

// Utilities to build a search

const search = {
    index: R.lensProp('index'),
    query: R.lensPath(['body', 'query'])
}


/*
    (val) => { match: val }
*/
const matchify = (val) => { return {'match': val} }

/*
    (keyVals) => {
        bool: {
            must: [
                { match: { key1: val1 } },
                { match: { key2: val2 } },
                ...
            ]
        }
    }
*/
const generate_and_query = R.compose(
    R.assocPath(["bool", "must"], R.__, {}),
    R.compose(
        R.map(matchify),
        R.map(R.apply(R.objOf)),
        R.toPairs
    )
)

/*
    (index, query) => {
        index,
        { body: { query } }
    }
*/
const generate_search = R.curry((index, query) => {
    return R.compose(
        R.set(search.index, index),
        R.set(search.query, query)
    )({})
})

const generate_patient_search = generate_search('patient')

/*
    (index, keyVals) => {
        index: 'patient',
        { body: { query: generate_and_query(keyVals) } }
    }
*/
const generate_patient_and_search = R.compose(
    generate_patient_search,
    generate_and_query
)

module.exports = {
    responseAccessors,
    resultAccesors,
    specimenAccessors,
    generate_patient_search,
    generate_patient_and_search,
    get_from_first_result
}