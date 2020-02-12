const { 
    load_mandatory_str_env_var, 
    load_optional_str_env_var, 
    load_mandatory_json_env_var
} = require('./utils')

module.exports = {
    servicePort: load_mandatory_str_env_var('SERVICE_PORT'),
    sourceLogger: load_optional_str_env_var('SOURCE_LOGGER', () => 'default'),
    httpLogger: load_optional_str_env_var('HTTP_LOGGER', () => 'default'),
    idsSource: load_optional_str_env_var('IDS_SOURCE', () => 'dummy')
}