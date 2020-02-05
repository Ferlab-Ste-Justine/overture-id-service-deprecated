const R = require('ramda')
const Either = require('data.either')

const errors = require('restify-errors')

const get_patient = R.compose(
    Promise.resolve,
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

const get_specimen = R.compose(
    Promise.resolve,
    R.ifElse(
        R.startsWith('SP'),
        R.compose(
            Either.Right,
            R.replace('SP', 'SPECIMEN')
        ),
        () => Either.Left(new errors.NotFoundError("specimen not found"))
    ),
    R.prop('submittedSpecimenId')
)

const get_sample = R.compose(
    Promise.resolve,
    R.ifElse(
        R.startsWith('SA'),
        R.compose(
            Either.Right,
            R.replace('SA', 'SAMPLE')
        ),
        () => Either.Left(new errors.NotFoundError("sample not found"))
    ),
    R.prop('submittedSampleId')
)

module.exports = {
    get_patient,
    get_specimen,
    get_sample
}