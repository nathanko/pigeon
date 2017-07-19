var storage;
var storageRef;
var dataRef;

(function () {
  // Initialize Firebase
  var config = {
  	apiKey: "AIzaSyDekqVZg1WnLisD6O50vJL_TmD6X-9LKFI",
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

function uniqueFilename(name){
  var dot = name.lastIndexOf('.');
  var uuid = new Date().valueOf().toString(36);
  return dot >= 0 ? name.substring(0, dot)+"-"+ uuid+name.substring(dot) : name+"-"+uuid;
}

function putFile(){
  document.getElementById("downloadArea").style.visibility = "hidden"; //in case it's already showing
  var file = document.getElementById("fileInput").files[0];   
  if (!file){
    document.getElementById("uploadProgress").style.width = "2%";
    return;
  }
  var ttl = new Date();
  ttl.setDate(ttl.getDate()+1);  //TTL 24 hours
  var metadata = {
    contentType: file.type,
    customMetadata: {
      "destroyOn": ttl.toISOString() //TODO: add server-side function to purge
    }
  };
  console.log(metadata.customMetadata);
  //TODO: Need true UUID
  var filename = uniqueFilename(file.name);
  var uploadTask = dataRef.child(filename).put(file, metadata);
  uploadTask.on('state_changed', function(snapshot){
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log(progress);
    document.getElementById("uploadProgress").style.width = progress+"%";
    //TODO: Add progress bar
  }, function(error) {
    console.log("Failed to upload: "+filename);
  }, function() {
    var downloadLink = uploadTask.snapshot.downloadURL;
    console.log("Successfully uploaded: "+filename);
    bitlyShorten(downloadLink, function(shortLink){
      console.log("Download link: "+shortLink);
      document.getElementById("downloadUrl").value = shortLink; 
      storeFileLink(file.name, shortLink, ttl);
      document.getElementById("uploadProgress").style.width = "100%";
      document.getElementById("downloadArea").style.visibility = "visible";
      document.getElementById("downloadUrl").select(); 
    });
  });
}
function renameFile(filepath){
  var name = filepath.lastIndexOf('\\') > 0 ? filepath.substring(filepath.lastIndexOf('\\')+1) : filepath;
  document.getElementById('chooseafile').innerHTML = name.length > 0 ? name : "Choose a file...";
}
function storeFileLink(name, url, expiry){
  var currStorage = JSON.parse(localStorage.getItem("recent_uploads"));

  if (!currStorage){
    currStorage = [];
  }
  currStorage = currStorage.concat([{
    name: name,
    url: url,
    expiry: expiry
  }]);

  localStorage.setItem("recent_uploads", JSON.stringify(currStorage));
  console.log("recent_uploads in localStorage:"+JSON.stringify(currStorage));
}

/***Bitly***/
//TODO: use more secure method
var bitlyAccessToken = "f35ff45dd07b0674c98b34eb6a42ed045ee7163d";
function bitlyShorten(url, callback){
  console.log("Getting bit.ly shortlink for "+url);
  var apiUrl = "https://api-ssl.bitly.com/v3/shorten?access_token="+bitlyAccessToken+"&longUrl="+encodeURI(url)+"&format=txt";
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText.trim());
  }
    xmlHttp.open("GET", apiUrl, true); // true for asynchronous 
    xmlHttp.send(null);
  }