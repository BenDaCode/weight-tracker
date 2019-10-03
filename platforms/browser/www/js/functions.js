
 /*general functions*/     
function loadPage(file,pageTitle){

    var title=document.getElementById("pageTitle");

    $.get("pages/"+file, function( data ) {
        $( "#content" ).html(data);
         title.innerHTML=pageTitle;
    });
}

function openModal(modalID){

  modal = document.getElementById(modalID);
  modal.style.display = "block";
}

function closeModal(modalID){
 modal = document.getElementById(modalID);
 modal.style.display = "none";
}


//database operations in general
function readAll(database,callback){
    var openReq = window.indexedDB.open("weightTracker");

    openReq.onsuccess = function() {
        var content=[];

        var db = openReq.result;
        var transaction = db.transaction([database], 'readonly');
        var objectStore = transaction.objectStore(database);

        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
           
            if(cursor){
                content.push(cursor.value);
                cursor.continue();
            }
           
        };

        transaction.oncomplete = function (event) {
            db.close();
            if(callback) {
                  callback(content);
            }   
        };
    }
}
 
 function readOnce(database,id,callback) {

    var openReq = window.indexedDB.open("weightTracker");

    openReq.onsuccess = function() {
        var content=[];

        var db = openReq.result;
        var transaction = db.transaction([database], 'readonly');
        var objectStore = transaction.objectStore(database);
        var request = objectStore.get(id);

        request.onsuccess=function(event){
            if(request.result) {
                content.push(request.result);
            }
        }

        transaction.oncomplete = function (event) {
            db.close();
            if(callback) {
              callback(content);
            }   
        };
    } 
 }
 
/*weight_history 'home' database functions*/
 function getCurrentWeight(callback){

    var openReq = window.indexedDB.open("weightTracker");

    openReq.onsuccess = function() {
        var db = openReq.result;
        var transaction = db.transaction(['weight_history'], 'readonly');
        var objectStore = transaction.objectStore('weight_history');
        var index = objectStore.index('date');
        var openCursorRequest = index.openCursor(null, 'prev');
        var maxObject = null;

        openCursorRequest.onsuccess = function (event) {
            if (event.target.result) {
                maxObject = event.target.result.value; //the object with max revision
            }
        };

        transaction.oncomplete = function (event) {
            db.close();
            if(callback) {
            	 callback(maxObject);
            }    
        };
    }
}

function compareWeights(database,callback){

	var openReq = window.indexedDB.open("weightTracker");

    openReq.onsuccess = function() {
    	var count=1;

        var db = openReq.result;
        var transaction = db.transaction([database], 'readonly');
        var objectStore = transaction.objectStore(database);

     	var index = objectStore.index('date');
        var openCursorRequest = index.openCursor(null, 'prev');

        var lastWeight=0;
    	var currentWeight=0;
    	var compare = 0;
       
        openCursorRequest.onsuccess = function (event) {
        	var cursor = event.target.result;
        	

            if (cursor && count<=2) {

        		if(count==1){
        			currentWeight=parseFloat(cursor.value.weight); 

        		}else if(count==2){
					lastWeight=parseFloat(cursor.value.weight);
					compare=(currentWeight-lastWeight);

        		}
        		cursor.continue();
            }
            count++;
        };

        transaction.oncomplete = function (event) {
            db.close();
            if(callback) {
            	 callback(compare.toFixed(2));
            }    
        };
    }

}

function loadHomeChart(database,days,callback){

 	var openReq = window.indexedDB.open("weightTracker");

    openReq.onsuccess = function() {
    	var dataArrayDays=[];
    	var dataArrayWeights=[];
    	var count=1;

        var db = openReq.result;
        var transaction = db.transaction([database], 'readonly');
        var objectStore = transaction.objectStore(database);

     	objectStore.openCursor().onsuccess = function(event) {
	       var cursor = event.target.result;
	       
	       	if (cursor && count<=days) {
		      dataArrayDays.push(cursor.value.date);
		      dataArrayWeights.push(cursor.value.weight);
		      cursor.continue();		  
	   		}
	   		count++;
	    };

	  	transaction.oncomplete = function (event) {
        	db.close();
	        if(callback) {
	        	var data=[dataArrayDays,dataArrayWeights];
	        	callback(data);
	        }   
    	};
    }
 }



 //weight_tracker 'history' operations
 function loadHistory(database,callback){

 	var openReq = window.indexedDB.open("weightTracker");

    openReq.onsuccess = function() {
    	var content="";
        var count=0;

        var db = openReq.result;
        var transaction = db.transaction([database], 'readonly');
        var objectStore = transaction.objectStore(database);

        objectStore.openCursor(null,'prev').onsuccess = function(event) {
       		var cursor = event.target.result;
	       
	       	if (cursor) {
		       	content+="<div class='row'>"+
		                      "<div class='small-4 columns'><b style='color:dimgrey;font-size:1.5em'>"+cursor.key+"</b></div>"+
		                      "<div class='small-3 columns'><b style='color:dimgrey;font-size:1.5em;margin-top:1em'>"+cursor.value.weight+"kg</b></div>"+
		                      "<div class='small-5 columns'>"+
		                         "<div class=row>"+
		                            "<div class='small-6 columns'>"+
		                              "<button class='small tiny button'><i class='fi-pencil small'></i></button>"+
		                            "</div>"+
		                            "<div class='small-6 columns'>"+
		                             "<button class='small tiny button' onclick='deleteWeight(\""+database+"\",\""+cursor.key+"\")'><i class='fi-trash small'></i></button>"+
		                            "</div>"+
		                         "</div>"+
		                      "</div>"+
		                  "</div>";
                count++;
		        cursor.continue();
	   		}
	    };

	  	transaction.oncomplete = function (event) {
        	db.close();
	        if(callback) {
	        	  callback(content,count);
	        }   
    	};
    }
 }
 
 function addWeight(setDate,setWeight,database) {

 	if(setDate!="" && setWeight!="" && database!=""){
        var openReq = window.indexedDB.open('weightTracker');

        openReq.onsuccess = function() {
            var db = openReq.result;
    	 	var request = db.transaction([database], "readwrite")
    	    .objectStore(database)
    	    .add({ id: setDate, date:setDate, weight: parseFloat(setWeight).toFixed(2)});
    	    
    	    request.onsuccess = function(event) {
    	    	reloadHistory(database);
    	      	console.log("data added");
    	    };
    	    
    	    request.onerror = function(event) {
    	      deleteWeight(database,setDate);
    	      addWeight(setDate,setWeight,database);
    	      console.log("record overwritten");
    	    }
        }
 	}else{
 		console.log("values missing!");
 	}
 }

 function deleteWeight(database,id) {

    var openReq = window.indexedDB.open('weightTracker');

    openReq.onsuccess = function() {
        var db = openReq.result;
        var request = db.transaction([database], "readwrite")
        .objectStore(database)
        .delete(id);
        
        request.onsuccess = function(event) {
            reloadHistory(database);
            console.log("deleted record");
        };
    }

    return Promise.resolve();
 }

function reloadHistory(database){

	loadHistory(database,function(result,count){
		document.getElementById('list').innerHTML=result;
        document.getElementById('entries').innerHTML=count;
	});
}


//options ans user data functions
function getOptions(){
    document.getElementById('last_records').innerHTML=last_records;
    document.getElementById('user_age').innerHTML=user_age+" years"; 
    document.getElementById('user_size').innerHTML=user_size+" cm";
}


function editUserData(type,data){
    return new Promise(function(resolve,reject){

        var openReq = window.indexedDB.open('weightTracker');

        openReq.onsuccess = function() {
            var db = openReq.result;
            var request = db.transaction(["weight_user"], "readwrite")
            .objectStore("weight_user")
            .add({ id: type, parameter:type, value: data});
            
            request.onsuccess = function(event) {
                resolve("user data added");
            };
            
            request.onerror = function(event) {
                reject("user record overwritten");
            }
        }
    });
}

function setupUser(){

    user_size=document.getElementById('form_size').value;
    user_age=document.getElementById('form_age').value;

    if(user_size!="" && user_age!=""){

        editUserData("age",user_age).then(function(resolve){
            console.log(resolve);
            return editUserData("size",user_size);
        }).then(function(resolve){
            console.log(resolve);
            app.init();
        }).catch(function(reject){
            console.log(reject);
        });
        
    }else{
        console.log("missing data!");
    }
}



 


    