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
        const deletedCollection = client.db('todo-app').collection('deleted-todos')


        app.post("/users", async (req, res) => {
          const user = req.body;
          const result = usersCollection.insertOne(user);
          res.send(result);
        });

        app.post('/add-todo', async(req, res)=>{
          const todo = req.body;
          const result = await todosCollection.insertOne(todo);
          res.send(result)
        })


        app.get('/all-todo', async(req, res)=>{
          const email = req.query.email;
          const query = { email: email };
          const result = await todosCollection.find(query).sort({ $natural: -1 }).toArray();
          res.send(result);
        })

        app.get("/details/:id", async(req, res)=>{
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await todosCollection.findOne(query);
          res.send(result)
        })

        app.get("/trash", async(req, res)=>{
          const email = req.query.email;
          const query = {email: email};
          const result = await deletedCollection.find(query).sort({ $natural: -1 }).toArray();
          res.send(result)
        })

        app.patch("/edit", async(req, res)=>{
          const {id,description} = req.body;
          const filter = { _id: new ObjectId(id) };
          const options = { upsert: true };
          const updatedDoc = {
            $set: {
             description: description,
            },
          };
          const result = await todosCollection.updateOne(
            filter,
            updatedDoc,
            options
          );
          res.send(result);
        })

        app.patch('/update-status', async(req, res)=>{
          const id = req.query.id;
          const filter = { _id: new ObjectId(id) };
          const options = { upsert: true };
          const updatedDoc = {
            $set: {
             status: 'completed',
            },
          };
          const result = await todosCollection.updateOne(
            filter,
            updatedDoc,
            options
          );
          res.send(result);
          
        })

        app.delete("/delete/:id", async(req, res)=>{
          const id = req.params.id;
          console.log(id)
          const query = { _id: new ObjectId(id) };
          const todo = await todosCollection.findOne(query);
          const deleteCollection = await deletedCollection.insertOne(todo);
          const filter = { _id: new ObjectId(id) };
          const result = await todosCollection.deleteOne(filter);
          res.send(result);
          // res.send(addDeleteCollection)
        })

        app.delete('/undo-todo/:id', async(req, res)=>{
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const todo = await deletedCollection.findOne(query);
          const addTodoCollection = await todosCollection.insertOne(todo)
          const filter = { _id: new ObjectId(id) };
          const result = await deletedCollection.deleteOne(filter);
          res.send(result)
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
