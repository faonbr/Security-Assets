'use strict';

angular.module('customLoginApp')


    .service('baseFactory', ['$resource', function($resource) {
    
                var configData = null;
                
                this.getLoginContext = function(){
                    
                    return $resource("/api/getLoginContext",null, null);
                    
                };
        
                this.getCurrentAuthnToken = function(){
                    
                    return $resource("/api/getCurrentAuthnToken",null, null);
                    
                };
        
                
                this.getConfig = function(callback){   
                    if (configData == null){  
                      $resource("/api/getConfigData",null, null).get(function(response) {
                         configData = response;
                         console.log("Init");
                         callback(configData);
                       });  
                    }
                    else
                        callback(configData);   
                };
                        
        }]) 

   
;
