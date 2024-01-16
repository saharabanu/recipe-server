const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");

const port = process.env.PORT || 5000;
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json());

// app.use(cors());
// const allowedOrigins = [
//   "http://localhost:3000",
//   // "https://elp-client.vercel.app",
//   // Add other allowed origins as needed
// ];

// app.use(
//   cors({
//     origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
//     credentials: true,
//   })
// );
// app.use(cookieParser());
// app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jy11d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const uri =
  "mongodb+srv://recipe:X7sKaMpBHgyQu34p@cluster0.2kdey3p.mongodb.net/All_recipes?retryWrites=true&w=majority";
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("all_recipe");
    const productsCollection = database.collection("recipes");
   

    // get api
    app.get("/recipes", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    //  get single product api
    app.get("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
     
      const product = await productsCollection.findOne(query);
     
      res.json(product);
    });


    // update product api
    app.put("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id:new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          title: updatedProduct.title,
        //   img: updatedProduct.img,
        ingredients: updatedProduct.ingredients,
        instruction: updatedProduct.instruction,
          size: updatedProduct.size,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
    //   console.log(result);
      res.json(result);
    });

    // delete product  api
    app.delete("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
    //   console.log(result)
      res.json(result);
    });

    // post api
    app.post("/recipes", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Recipe server is running!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
