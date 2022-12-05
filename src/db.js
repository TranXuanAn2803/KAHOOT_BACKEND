// mongodb+srv://teamweb2:teamweb2@web2.yhhleif.mongodb.net/test
var mongodb = require("mongodb");

var MongoClient = mongodb.MongoClient;

var url = "mongodb+srv://teamweb2:teamweb2@web2.yhhleif.mongodb.net/test";
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log("Unable to connect to the mongoDB server. Error:", err);
  } else {
    console.log("Connection established to", url);
  }
});
