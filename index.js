require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, res) => {
  if (err) {
    console.log(err + "error" + err)
  } else {
    console.log("successful database connection");
  }
});
console.log(mongoose.connection.readyState);

const schema = new mongoose.Schema({ url: 'string' });
const Url = mongoose.model('Url', schema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use((req, res, next) => {
  var data = req.method + " " + req.path + " " + req.ip;
  console.log(data);
  next();
});

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  console.log(req.body);
  const bodyurl = req.body.url;

  const something = dns.lookup(urlparser.parse(bodyurl).hostname, (error, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" });
    } else {
      var url = new Url({ url: bodyurl })
      url.save((err, data) => {
        console.error(err);
        res.json({
          original_url: data.url,
          short_url: data.id
        })
      });
    }
    console.log("dns", error);
    console.log("address", address);
  });
  console.log("something", something);
});

app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  Url.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "Invalid URL" });
    } else {
      res.redirect(data.url);
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
