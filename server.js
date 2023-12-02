var express = require('express');
var layouts = require('express-ejs-layouts');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { MongoClient } = require("mongodb");
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

var app = express();

const store = new MongoDBStore({
  uri: url + '/radioproj',
  collection: 'sessions'
});

const Song = new Schema({
  rank: String,
  title: String,
  artist: String,
  album: String,
  year: String
});

const Timeslot = new Schema({
  timeslot: { type: String },
  songs: [{ type: String, default: '' }]
});

const DJ = new Schema({
  name: { type: String, default: '' },
  listed: { type: Boolean },
  age: { type: Number, min: 1 },
  times: [Timeslot]
});

app.use(express.static('assets'));
app.use(layouts);

app.set('view engine', 'ejs');
app.set('layout', 'layouts/default');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'secretCodeEpicSauce!?!',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
  store: store
}));

app.use(express.json({limit:'1mb'}));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1/radioproj');
  const SongModel = mongoose.model('Song', Song);
  const DJModel = mongoose.model('DJ', DJ);
  const TimeslotModel = mongoose.model('Timeslot', Timeslot);

  // get song playing
  let song = "";
  await client.connect();
  const db = client.db("radioproj");
  const songs = db.collection("songs");

  const songDoc = await songs.findOne();
  songObj = await SongModel.findOne({});
  song = songObj.title;
  client.close();

  // routes
  app.get(['/'], async (req, res) => {
    res.render('pages/logonpage', {
      role: "Unknown User",
      currentSong: song
    });
  });

  app.post(['/login'], async (req, res) => {
    let djObj = await DJModel.findOne({ name : req.body.user });
    if(req.body.user == "Producer") {
      // only let "Producer" use the producer page
      req.session.user = req.body.user
      res.redirect('/producer');
    } else if(djObj) {
      // only let them use the dj page if they are a DJ in the database
      req.session.user = req.body.user;
      res.redirect('/dj');
    } else if(req.body.user == "Listener") {
      req.session.user = req.body.user
      res.redirect('/listener'); 
    }
    else {
      res.redirect('/');
    }
  });

  app.get(['/producer'], async (req, res) => {
    if(req.session.user == "Producer") {
      // get song list and dj list
      djsObjs = await DJModel.find();
      songsObjs = await SongModel.find();

      res.render('pages/producer', {
        role: "Producer",
        currentSong: song,
        songList: songsObjs,
        djsList: djsObjs
      });
    } else {
      res.redirect('/');
    }
  });

  app.get(['/dj'], async (req, res) => {
    let djObj = await DJModel.findOne({ name : req.session.user });
    
    if(djObj) {
      if(req.session.user == djObj.name) {
        songsObjs = await SongModel.find();
        djsObjs = await DJModel.find();
        res.render('pages/dj', {
          role: "DJ",
          currentSong: song,
          songList: songsObjs,
          djsList: djsObjs,
          djName: req.session.user
        });
      } else {
        res.redirect('/');
      }
    } else {
      res.redirect('/');
    }
  });

  app.get(['/listener'], async function (req, res) {
    if(req.session.user == "Listener") {
      let djsObjs = await DJModel.find();
      let songsObjs = await SongModel.find();
      let timeslotObjs = await TimeslotModel.find();
      res.render('pages/listener', {
        role: "Listener",
        currentSong: song,
        songList: songsObjs,
        djsList: djsObjs,
        timeslotList: timeslotObjs
      
      });
    } else {
      res.redirect('/');
    } 
  });



  app.get('/logout', function (req, res) {
    req.session.destroy((err) => {
      res.redirect('/');
    })
  });

//add songs
app.get('/add-songs', function(req, res) {
  res.render('pages/add-songs', {
    role: "Listener",
    currentSong: song
  });
});

//remove songs
app.get('/remove-songs', function(req, res) {
  res.render('pages/remove-songs', {
    role: "Listener",
    currentSong: song
  });
});

//returns all DJS in db
app.get('/getAllDjs', (req, res) => {
  // Perform a search in the MongoDB database
  db_db.collection('djs')
    .find({})
    .toArray()
    .then(results => {
      console.log(results);
      res.json(results);
    })
    .catch(error => {
      console.error('Error querying MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});



  app.post(['/playlistupdate'], async (req, res) => {
    if(req.session.user) {
      // get song list and dj list
      djsObjs = await DJModel.find();
      songsObjs = await SongModel.find();

      let dj = req.body.djName;
      let timeslot = req.body.timeslot;
      let songsNew = req.body.songs;
      
      theDJ = await DJModel.findOne({ name : dj });
      
      theDJ.times.forEach((timeslotObj) => {
        if(timeslotObj.timeslot == timeslot) {
          timeslotObj.songs = songsNew;
        }
      });

      res = await theDJ.save();
    } else {
      res.redirect('/');
    }
  });


  app.listen(8080);
}

main();