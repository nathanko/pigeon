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
  var uploadTask = dataRef.child(file.name).put(file, metadata);
  uploadTask.on('state_changed', function(snapshot){
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log(progress);
    //TODO: Add progress bar
  }, function(error) {
    console.log("Failed to upload: "+file.name);
  }, function() {
    var downloadLink = uploadTask.snapshot.downloadURL;
    document.getElementById("downloadUrl").style.visibility = "visible";
    console.log("Successfully uploaded: "+file.name);
    bitlyShorten(downloadLink, function(resp){
      console.log("Download link: "+resp);
      document.getElementById("downloadUrl").value = resp; 
      });
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
  var name = filepath.lastIndexOf('\\') > 0 ? filepath.substring(filepath.lastIndexOf('\\')+1) : filepath;
  document.getElementById('chooseafile').innerHTML = name.length > 0 ? name : "Choose a file...";
}
/***Bitly***/
var bitlyAccessToken = "f35ff45dd07b0674c98b34eb6a42ed045ee7163d";
function bitlyShorten(url, callback){
  console.log("Getting bit.ly shortlink for "+url);
  var apiUrl = "https://api-ssl.bitly.com/v3/shorten?access_token="+bitlyAccessToken+"&longUrl="+encodeURI(url)+"&format=txt";
  var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", apiUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}