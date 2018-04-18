angular.module('customLoginApp')
    
    .controller('baseController', ['$scope',  'baseFactory', '$http', function($scope, baseFactory,$http){
        $scope.sessionform = {};
        $scope.isIDP = false;
        $scope.idpList = [];
        
        var addParam = function(myform, value, paramName) {
            param = document.createElement("input");
            param.value = value;
            param.name = paramName;
            myform.appendChild(param);
        }
        
        var headers;
        var requestState;
        
        var idcsconfig;
        
        baseFactory.getConfig(function(data) { 
            idcsconfig = data;
        });
        
        baseFactory.getLoginContext().get(function(response) {
                $scope.apitoken = response["token"];
                $scope.loginCtx = JSON.parse(response["ctx"]);
            
                headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + $scope.apitoken};
                
                nextOp = $scope.loginCtx.nextOp;
                nextAuthFactors = $scope.loginCtx.nextAuthFactors;
                requestState = $scope.loginCtx.requestState;
                if (nextAuthFactors.indexOf("IDP") >= 0){
                      
                      $scope.isIDP = true;
                      $scope.idpList = $scope.loginCtx.IDP.configuredIDPs;
                      console.log($scope.idpList);
                }
            },
            function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
        });
        
        
        $scope.login = function(){
                
            postdata = {"op":"credSubmit","credentials": {"username": $scope.username,"password": $scope.password}, "requestState": requestState};
            console.log(idcsconfig);
            postreq = {
                method: 'POST',
                url: idcsconfig.sdkurl,
                headers: headers,
                data: postdata
            };

            $http(postreq).then(function(postresp) {
                authnToken = postresp.data.authnToken;
                var myform = document.createElement("form");
                myform.method = "POST";
                myform.action = idcsconfig.sdksessionurl;
                addParam(myform, authnToken, "authnToken");
                document.body.appendChild(myform);

                myform.submit();

            });
            
        };
        
        $scope.idpLogin = function(idp){
            
            var idpform = document.createElement("form");
            idpform.method = "POST";
            idpform.action = idcsconfig.sdkidpurl;
            addParam(idpform, requestState, "requestState");
            addParam(idpform, idp.idpName, "idpName");
            addParam(idpform, "SOCIAL", "idpType");
            addParam(idpform, idp.idpId, "idpId");
            addParam(idpform, idcsconfig.clientID, "clientId");
            addParam(idpform, false, "rememberAuthnChoice");
            document.body.appendChild(idpform);

            idpform.submit();
            
        };
    }])


   .controller('idpController', ['$scope',  'baseFactory', function($scope, baseFactory){
       
       var addParam = function(myform, value, paramName) {
            param = document.createElement("input");
            param.value = value;
            param.name = paramName;
            myform.appendChild(param);
        }
       
        var idcsconfig;
        
        baseFactory.getConfig(function(data) { 
            idcsconfig = data;
        });
        
       baseFactory.getCurrentAuthnToken().get(function(response) {
            authnToken = response["authnToken"];;
            console.log(authnToken);
            var myform = document.createElement("form");
            myform.method = "POST";
            myform.action = idcsconfig.sdksessionurl;
            addParam(myform, authnToken, "authnToken");
            document.body.appendChild(myform);
            myform.submit();        
        });   
    }])

;

