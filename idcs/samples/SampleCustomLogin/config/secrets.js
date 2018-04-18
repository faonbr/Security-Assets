host = ""
port = "8943"
prot = "https"

module.exports = {
    
  idcshost: host,
    
  idcsport: port,
    
  idcsanon: {
    baseURL: prot + '://' + host + ':' + port,
    tokenURL: prot + '://' + host + ':' + port + '/oauth2/v1/token',
    jwkURL: prot + '://' + host + ':' + port + '/admin/v1/SigningCert/jwk',
    sdkurl:  prot + '://' + host + ':' + port + '/sso/v1/sdk/authenticate',
    sdksessionurl: prot + '://' + host + ':' + port + '/sso/v1/sdk/session',
    sdkidpurl: prot + '://' + host + ':' + port + '/sso/v1/sdk/idp',
    clientID: '',
    clientSecret: '',
    scope: 'urn:opc:idm:__myscopes__',
    grant_type: 'client_credentials'
  }
};
