//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose =require("mongoose");
const { name } = require("ejs");
const app = express();
require('dotenv').config()
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const mongoPassword = process.env.PASSWORD
mongoose.connect(`mongodb+srv://admin-batu:${mongoPassword}@cluster0.igkxznw.mongodb.net/todoListDB`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Sunucu seçimi için zaman aşımı süresini artırın
});

const itemsSchema = {
  name: String,
}
const Item = mongoose.model("item",itemsSchema); 

const item1 = new Item({
  name: "welcome to your todo list"
  
})
const item2 = new Item({
  name: "hello"
  
})
const item3 = new Item({
  name: "hello asdasd"
  
})



const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
  
};
const List = mongoose.model("List", listSchema);
// Item.insertMany(defaultItems)
//   .then(() => {
//     console.log("Successfully saved default items");
//     mongoose.connection.close();
//   })
//   .catch((err) => {
//     console.log(err);
//   });
app.get('/:customListName', async (req, res) => {
  const customListName = req.params.customListName;

  try {
    const existingList = await List.findOne({ name: customListName });

    if (existingList) {
      // Özel liste zaten varsa özel liste sayfasına yönlendir
      res.render("list", { listTitle: customListName, newListItems: existingList.items });
    } else {
      // Özel liste yoksa oluştur ve özel liste sayfasına yönlendir
      const customList = new List({
        name: customListName,
        items: defaultItems
      });

      await customList.save();
      console.log('Belge başarıyla kaydedildi ve koleksiyon oluşturuldu.');
      res.redirect("/" + customListName);
    }
  } catch (error) {
    console.error(error);
  }
});


app.get("/", function(req, res) {
  Item.find({})
  .then(items => {
    // items, belgelerin bir dizisidir
    
    
    res.render("list", {listTitle: "today", newListItems: items});
  })
  .catch(error => {
    console.error(error);
  });


  

});

app.post("/", async function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  try {
    if (listName === "today") {
      await item.save();
      res.redirect("/");
    } else {
      const foundList = await List.findOne({ name: listName });
      if (foundList) {
        foundList.items.push(item);
        await foundList.save();
        res.redirect("/" + listName);
      } else {
        console.error("List not found.");
      }
    }
  } catch (error) {
    console.error(error);
  }
});

  

app.post('/delete' , (req , res)=>{
  const deleteList = req.body.listName ;
  const deleteİd  =   req.body.checkbox;
if (deleteList === "today") {
  Item.deleteOne({_id: deleteİd})
  .then(() => {
    res.redirect("/"); // kaydedildikten sonra ana sayfaya yönlendir
  })
  .catch(error => {
    console.error(error);
  });
}  else {
    List.findOneAndUpdate({name: deleteList},{$pull: {items: {_id:deleteİd}}})
    .then(() => {
      
      
      res.redirect("/"+deleteList);

    }) 
    

}
  
   
})
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
