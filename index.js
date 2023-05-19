const express  = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()

const app = express();


// midleware 

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8tifwil.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run(){
    try {
        const todosCollection = client.db('todo-app').collection('todos')
        const usersCollection = client.db('todo-app').collection('users')


        app.post("/users", async (req, res) => {
          const user = req.body;
          const result = usersCollection.insertOne(user);
          res.send(result);
          console.log(user)
        });

        app.post('/add-todo', async(req, res)=>{
          const todo = req.body;
          const result = await todosCollection.insertOne(todo);
          res.send(result)
        })


        app.get('/all-todo', async(req, res)=>{
          const query = {};
          const result = await todosCollection.find(query).toArray();
          res.send(result);
        })

        app.get("/details/:id", async(req, res)=>{
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await todosCollection.findOne(query);
          res.send(result)
          console.log(result)
        })
        


    }
    finally{

    }
}

run().catch((error) => {
  console.log(error.message);
});


app.get('/', (req, res)=>{
    res.send('todo app server is running')
})

app.listen(port, ()=>{
    console.log(`i am running on port ${port}`)
})
