const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var fs = require('fs');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qlwbf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
  res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("creative-agency").collection("service");
  const userAddedServiceCollection = client.db("creative-agency").collection("userAddedService");
  const reviewCollection = client.db("creative-agency").collection("review");
  console.log("database connected")

  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const description = req.body.description;
    const title = req.body.title;
  

    const encImg = file.data.toString('base64')
    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer(encImg, 'base64')
    }

    serviceCollection.insertOne({
       title, description,img: image
    })
      .then(result => {
        console.log(result)
      })
  })

  app.get('/service', (req, res) => {
    serviceCollection.find({})
      .toArray((err, document) => {
        res.send(document);
      })
  })

  app.post('/userAddedService', (req, res) => {
    const addedService = req.body;
    console.log(addedService)
    userAddedServiceCollection.insertOne(addedService)
      .then(result => {
        console.log(result.insertedCount > 0)
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/userService', (req, res) => {
    userAddedServiceCollection.find({ email: req.query.email })
      .toArray((err, document) => {
        res.send(document)
      })
  })
  app.get('/adminUserService', (req, res) => {
    userAddedServiceCollection.find({})
      .toArray((err, document) => {
        res.send(document)
      })
  })

  app.post('/addReview', (req, res) => {
    const addedReview = req.body;
    console.log(addedReview)
    reviewCollection.insertOne(addedReview)
      .then(result => {
        console.log(result.insertedCount > 0)
        res.send(result.insertedCount > 0)
      })
  })
  app.get('/review', (req, res) => {
    reviewCollection.find({})
      .toArray((err, document) => {
        res.send(document)
      })
  })
});




app.listen(process.env.PORT || port)