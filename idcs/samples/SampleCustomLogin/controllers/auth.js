var secrets = require('../config/secrets');
var crypto = require('crypto');
var NodeRSA = require('node-rsa');

IDCSRestClient = require('node-rest-client').Client
var loginClient = new IDCSRestClient();

getTenantName = function(hostname) {
    return hostname.split(".")[0];
}

getBytes = function (str) {
    return str.charCodeAt(0);
}

convertCertificateToPem = function(_cert) {
  var cert = _cert;
  var beginCert = '-----BEGIN CERTIFICATE-----';
  var endCert = '-----END CERTIFICATE-----';

  cert = cert.replace('\n', '');
  cert = cert.replace(beginCert, '');
  cert = cert.replace(endCert, '');

  var result = beginCert;
  while (cert.length > 0) {

    if (cert.length > 64) {
      result += '\n' + cert.substring(0, 64);
      cert = cert.substring(64, cert.length);
    } else {
      result += '\n' + cert;
      cert = '';
    }
  }

  if (result[result.length] !== '\n') {
    result += '\n';
  }
  result += endCert + '\n';
  return result;
}


exports.idcsanon = function() {
    var options = secrets.idcsanon;
    var anonclient = new IDCSRestClient();
  
    var postData = "grant_type=" + options.grant_type + "&scope=" + options.scope;
    var base64Creds = "Basic " + new Buffer(options.clientID +":"+options.clientSecret).toString("base64");
    var args = {
	   headers: { 
                    "Authorization": base64Creds,
                    "Content-Type" : "application/x-www-form-urlencoded; charset=utf-8"
                },
       data: postData
    };
    anonclient.post(options.tokenURL, args, function (data, response) {
        global.idcstoken = data.access_token;
    });
};


exports.dologin = function(req, res) {
    var loginCtx = req.body.loginCtx;
    var signature = req.body.signature;
    
    var options = secrets.idcsanon;
    var anonclient = new IDCSRestClient();
  
    var args = {
	   headers: { 
                    "Authorization": "Bearer " + idcstoken ,
                    "Content-Type" : "application/x-www-form-urlencoded; charset=utf-8"
                }
    };
    
    anonclient.get(options.jwkURL, args, function (data, response) {
        signingKey = data.keys;
        base64Cert = signingKey[0].x5c[0];
        publickey = convertCertificateToPem(base64Cert);
        
        var verifier = crypto.createVerify('sha256');
        verifier.update('loginCtx', 'utf8');
        verifier.update(loginCtx, 'utf8');
        var ver = verifier.verify(publickey, signature,'base64');
        if(ver){
            
            var sha256Hash = crypto.createHash('sha256');
            sha256Hash.update(getTenantName(secrets.idcshost).toLowerCase());
            var digest = sha256Hash.digest();
            var encryptionKey = digest.slice(0, 16);
            
            var iv = new Buffer(16);
            iv.fill(0);

            var decipher = crypto.createDecipheriv('aes-128-cbc', encryptionKey, iv);
            global.decryptedLoginCtx = decipher.update(loginCtx, 'base64', 'utf8');
            global.decryptedLoginCtx += decipher.final('utf8');
            res.redirect('/#!/signin');
        }   
    });
    
};

exports.handleSigninError = function(req, res) {
    var options = secrets.idcsanon;
    
    isRegister = req.body.isSocialRegister;
    bool = isRegister == null ? false : true;
    requestState = req.body.requestState;
    global.authnToken = req.body.authnToken;
    status = req.body.status;
    
    console.log(isRegister);
    console.log(requestState);
    console.log(global.authnToken);
    console.log(status);
    console.log(bool);
    console.log(req.body);
    
    t = req.body.userData;
    s = Buffer(t, 'base64')
    console.log(s);
    
    
    error = !bool && (global.authnToken == null);
    if (error) {
        code = req.body.code;
        message = req.body.message;
        //response.sendRedirect(request.getContextPath() + "/error.jsp?code=" + code + "&message=" + message);
        return;
    }
    if (!bool && !error) {
        res.redirect('/#!/idpsignin');
    }
};


exports.getLoginContext = function(req, res) {
    res.json({'token': global.idcstoken, 'ctx':global.decryptedLoginCtx});
};

exports.getCurrentAuthnToken = function(req, res) {
    res.json({'authnToken': global.authnToken});
};

exports.getConfigData = function(req, res) {
    res.json(secrets.idcsanon);
};



