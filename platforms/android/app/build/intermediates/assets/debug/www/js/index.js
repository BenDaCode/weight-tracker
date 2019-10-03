
//settings
var last_records="";
var user_age="";
var user_size="";
var launch=false;

//elements
var footer=document.getElementById('footer');

//data
var weight_optionsData=[
        { id:"last_days", parameter: "last_days", value:10}
    ];

var weight_userData=[];
var weight_historyData=[];
    
//app
var app=(function(){

    var db;
    var request=window.indexedDB.open("weightTracker", 1);

    var checkLaunch=function(){

        return new Promise(function(resolve,reject){
            if (!('indexedDB' in window)) {
                reject("error while loading indexedDB");

            }else{
                resolve("indexedDB supported");
            }
        });
    }

    var createDatabase=function(){

        return new Promise(function(resolve,reject){

             request.onerror = function(event) {
                reject("error while loading indexedDB");
             };
             
             request.onsuccess = function(event) {
                db = request.result;
             };

             request.onupgradeneeded = function(event) {

                db = event.target.result;

                createTable('weight_history',weight_historyData,'date')
                   .then(function(resolve){
                        console.log(resolve);
                        return  createTable('weight_options',weight_optionsData,'parameter');
                    }).then(function(resolve){
                        console.log(resolve);
                        return  createTable('weight_user',weight_userData,'parameter');
                    }).then(function(resolve){
                        console.log(resolve);
                    });

            }

            resolve("indexedDB was loaded");
        })
    }
    

    var createTable=function(table,data,index){

        return new Promise(function(resolve,reject){
            var objectStore = db.createObjectStore(table, {keyPath: "id"});

            objectStore.createIndex(index, index, { unique: true });
            
            if(data!=""){
                for (var i in data) {
                    objectStore.add(data[i]);
                }
            }

            resolve("created "+table);

        });

     }
    
    var setConfig=function(path,name){

        return new Promise(function(resolve,reject){

            readOnce('weight_options','last_days',function(result){
                last_records=result[0].value;

                readAll('weight_user',function(result){
                    console.log(result);
                    if(result!=""){

                        user_age=result[0].value;
                        user_size=result[1].value;

                        resolve('config was loaded');

                    }else{
                        reject(true);
                    }
        
                });
            });
        });
    }

    var initialize=function(){

        checkLaunch().then(function(resolve){

                return createDatabase();
               
            }).then(function(resolve){
        
                console.log(resolve);
                return  setConfig();

            }).then(function(resolve){

                console.log(resolve);
                loadPage('home.html','/ Home');

                document.getElementById('footer').style.display="inline";

            }).catch(function(setup){

                 document.getElementById('footer').style.display="none";

                if(setup==true){
                    loadPage('launch.html','/ Setup');
                }else{
                    loadPage('error.html','/ Error');
                }

                console.log(setup);
            });
    }

    return{
        init: initialize
    }
}());

//start   
app.init();
