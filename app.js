//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// using ejs view engine for template
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
// to acces the public folder
app.use(express.static("public"));

// creating data base
mongoose
  .connect(
    `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.qncyq.mongodb.net/todolist-v2?authSource=admin&replicaSet=atlas-fg0zeh-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true`,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log("Conected to data base");
  })
  .catch(() => {
    console.log("Error connecting to data base");
  });

const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

// mongoose models
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({ name: "Welcome to your todolist!" });
const item2 = new Item({ name: "Hit the + button to adda new item." });
const item3 = new Item({ name: "<-- Hit this to delete an item" });

const defaultItems = [item1, item2, item3];
// insert default items

app.get("/", async (req, res) => {
  const findItems = await Item.find({});
  if (findItems.length === 0) {
    Item.insertMany(defaultItems);
    let items = await Item.find({});
    console.log("Inserting items");
    res.render("list", { listTitle: "Today", listItems: items });
  } else {
    res.render("list", { listTitle: "Today", listItems: findItems });
  }
});

app.get("/:customListName", async (req, res) => {
  // capitalise para que no haya distintas listan con el mismo nombre :)
  const customListName = _.capitalize(req.params.customListName);
  const findLists = await List.findOne({ name: customListName });
  if (!findLists) {
    const list = new List({
      name: customListName,
      items: defaultItems,
    });
    list.save();
    res.redirect(`/${customListName}`);
  } else {
    if (findLists.items.length === 0) {
      Item.insertMany(defaultItems);
      let items = await Item.find({});
      console.log("Inserting items");
      res.render("list", { listTitle: customListName, listItems: items });
    } else {
      res.render("list", {
        listTitle: customListName,
        listItems: findLists.items,
      });
    }
  }
});

app.post("/", async (req, res) => {
  // set body `parser before this
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    const list = await List.findOne({ name: listName });
    list.items.push(item);
    list.save();
    res.redirect(`/${listName}`);
  }
});

app.post("/delete", async (req, res) => {
  const chekedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    await Item.findByIdAndRemove({ _id: chekedItemId });
    res.redirect("/");
  } else {
    const list = await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: chekedItemId } } }
    );
    list.save();
    res.redirect(`/${listName}`);
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, (req, res) => {
  console.log("listening on port 3000");
});
