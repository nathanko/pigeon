var storage;
var storageRef;
var dataRef;

(function () {
  // Initialize Firebase
  var config = {
  	apiKey: "AIzaSyDekqVZg1WnLisD6O50vJL_TmD6X-9LKFI", //Should this be here??
  	authDomain: "slingshot-1760f.firebaseapp.com",
  	databaseURL: "https://slingshot-1760f.firebaseio.com",
  	projectId: "slingshot-1760f",
  	storageBucket: "slingshot-1760f.appspot.com",
  	messagingSenderId: "724529158971"
  };
  firebase.initializeApp(config);

  storage = firebase.storage();
  storageRef = storage.ref();
  dataRef = storageRef.child('data');

  console.log("Firebase config ready.");



})();


function putMessage(){
  // Raw string is the default if no format is provided
  var str = document.getElementById("stringInput").value;
  dataRef.child("message.txt").putString(str).then(function(snapshot) {
  	console.log("Uploaded string: "+str);
  });
}
function putFile(){
  console.log(dataRef);
  var file = document.getElementById("fileInput").files[0];
  var metadata = {
    contentType: file.type,
    customMetadata: {
      "pass":"letmein", 
      "destroyOn":"999999999" //TODO: add server-side function to purge
    }
  };
  dataRef.child(file.name).put(file, metadata).then(function(snapshot) {
    console.log("Uploaded file: "+file.name);
  });
}
function getFile(){
  console.log("getFile");
  var filename = document.getElementById("filename").value;
  var passphrase = document.getElementById("passphrase").value; //TODO: add server-side function to authenticate download request
  var filepath = dataRef.child(filename).getDownloadURL().then(function(url) {
    console.log("Got url: "+url);
    document.getElementById("content").innerHTML = "<a href='"+url+"' target='blank'><button class='btn btn-secondary pull-right'>Click here</button></a>";
  }).catch(function(error) {
    console.error(error.message_);
    document.getElementById("content").innerHTML = error.message_;
  });
}
function renameFile(filepath){
  console.log("nameFile()");
  document.getElementById('chooseafile').innerHTML = filepath.substring(filepath.lastIndexOf('\\')+1);
}
