var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");
var exphbs = require("express-handlebars");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var cheerio = require("cheerio");

// Require all models
var Article = require("./models/article");
var Note = require("./models/Note");

mongoose.Promise = Promise;

var port = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/NYTimesArticles");

// Routes
app.get("/", function(req, res) {
  res.sendFile('index');
});

// A GET route for scraping the NY Times website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("http://www.nytimes.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("h2")
        .text();
      result.summary = $(this)
        .children('summary')
        .text();
      result.link = $(this)
        .children("h2")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
  .then(function(dbArticle) {
    res.json(dbArticle)
  })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.find({ _id: articles(req.params.id)})
  .populate('note')
  .then(function(dbArticle){
    res.json(dbArticle);
  })
  .catch(function(err) {
  res.json(err);
  });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Note.create(req.body)
  .then(function(dbNote){
    return db.Article.findOneAndUpdate({}, { $push: { notes: dbArticle._id} }, {
      new: true});
    })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err){
        res.json(err);
      });
  });

// Start the server
app.listen(port, function() {
  console.log("App running on port " + port + "!");
});
