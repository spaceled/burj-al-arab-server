// import { getAuth } from "firebase/auth";
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require("firebase-admin");
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config()

const port = 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.azz4g.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

// const password = 'yhEx3N6zPIfXxL4t';
// const user = 'arabian';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// const { initializeApp } = require('firebase-admin/app');
const serviceAccount = require("./configs/burj-al-arab-6a60e-firebase-adminsdk-j9gsu-28eb65e64a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://burj-al-arab.firebaseio.com'
});

// getAuth().currentUser.getIdToken(true)
// firebase.auth().currentUser.getIdToken(true)
// getAuth()
// .currentUser.getIdToken(true)
// // const user = admin.auth().currentUser;
// // user.getIdToken(auth, true)
// .then(function(idToken) {

// })
// .catch(function(error) {

// });
// idToken comes from the client app
// getAuth()
//   .verifyIdToken(idToken)
//   .then((decodedToken) => {
//     const uid = decodedToken.uid;
//     // ...
//   })
//   .catch((error) => {
//     // Handle error
//   });


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
    console.log(newBooking);
  })

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;


    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      // const auth = getAuth();
      // getAuth()
      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if (tokenEmail === req.query.email) {
            bookings.find({email: req.query.email})
            .toArray((err, documents) => {
              res.send(documents);
            })
          }
          else {
            res.status(401).send('un-authorized access');
          }
        })
        .catch((error) => {
          res.status(401).send('un-authorized access');
        });
    }
    else{
      res.status(401).send('Un-authorized access!')
    }
    // idToken comes from the client app
  })

  // client.close();
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)