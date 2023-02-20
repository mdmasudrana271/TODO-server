const express  = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express();


// midleware 

app.use(cors())
app.use(express());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8tifwil.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send("unauthorized access");
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: "forbidden access" });
      }
      req.decoded = decoded;
      next();
    });
  }


async function run(){
    try {
        const todosCollection = client.db('todo-app').collection('todos')

        app.post('/add-todo', async(req, res)=>{
          const todo = req.body;
          const result = await todosCollection.insertOne(todo);
          res.send(result)
        })


    }
    finally{

    }
}

run().catch(error=>{
    console.log(error)
})



app.get('/', (req, res)=>{
    res.send('todo app server is running')
})

app.listen(port, ()=>{
    console.log(`i am running on port ${port}`)
})
