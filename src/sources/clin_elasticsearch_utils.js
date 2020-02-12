const R = require('ramda')
const Either = require('data.either')

const errors = require('restify-errors')

const search = {
    index: R.lensProp('index'),
    query: R.lensPath(['body', 'query'])
}

const response = {
    resultsCount: R.lensPath(['hits', 'total']),
    results: R.lensPath(['hits', 'hits'])
}

const specimen = {
    systemId: R.lensProp('id'),
    submitterId: R.lensPath(['container', 0])
}

/*
    (val, key, obj) => { match: { key: val }}
*/
const match = (val, key, obj) => R.assocPath(["match", key], val, {})

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
    R.mapObjIndexed(match)
)

/*
    (index, query) => {
        index,
        { body: { query } }
    }
*/
const generate_search = R.curry((index, query) => {
    return R.compose(
        R.set(search.index, 'patient'),
        R.set(search.query, query)
    )({})
})

/*
    (index, keyVals) => {
        index: 'patient',
        { body: { query: generate_and_query(keyVals) } }
    }
*/
const generate_patient_and_search = R.compose(
    generate_search('patient'),
    generate_and_query
)

const get_from_first_result = (getter) => {
    return R.ifElse(
        R.compose(
            R.gt(R.__, 0), 
            R.view(response.resultsCount)
        ),
        R.compose(
            R.right,
            getter,
            R.prop(0),
            R.view(response.results)
        ),
        () => Either.Left(new errors.NotFoundError("resource not found"))
    );
}

module.exports = {
    generate_search,
    generate_and_query,
    generate_patient_and_search,
    get_from_first_result
}