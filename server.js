const express = require('express');
const hbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 4000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine(
  'hbs',
  hbs.engine({
    defaultLayout: 'main.hbs',
    helpers: {},
  })
);
let currPath = './upload/'

const segregate = () => {
  let folders = [];
  let files = [];
  let tab = fs.readdirSync(currPath);
  tab.forEach((e) => {
    if (fs.lstatSync(currPath + e).isDirectory()) {
      folders.push({
        name: e,
        type: true,
        path: currPath + e
      });
    } else {
      files.push({
        name: e.substr(0, e.indexOf('.')),
        format: e.substr(e.indexOf('.'), e.length),
        type: false,
        fullname: e
      });
    }
  });
  return [folders, files];
};

const getPathArr = () => {
  return currPath.substr(2, currPath.length - 3).split('/')
}


app.get('/', (req, res) => {
  res.render('index.hbs', {
    files: segregate(),
    pathArr: getPathArr(currPath),
  });
});

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static('static'));

app.post('/newfolder', (req, res) => {
  if (!fs.existsSync(currPath + req.body.name)) {
    fs.mkdir(currPath + req.body.name, (err) => {
      if (err) throw err;
      console.log('stworzono ' + req.body.name);
      res.render('index.hbs', {
        files: segregate(),
      });
    });
  } else {
    fs.mkdir(
      currPath + req.body.name + '_kopia_' + new Date().valueOf(),
      (err) => {
        if (err) throw err;
        console.log('stworzono kopie ' + req.body.name);
        res.render('index.hbs', {
          files: segregate(),
        });
      }
    );
  }
});

app.post('/newfile', (req, res) => {
  let name = req.body.name;
  if (!name.includes('.')) {
    name += '.txt';
  }
  if (!fs.existsSync(currPath + name)) {
    fs.appendFile(currPath + name, '', (err) => {
      if (err) throw err;
      console.log('stworzono ' + name);
      res.render('index.hbs', {
        files: segregate(),
      });
    });
  } else {
    fs.appendFile(
      currPath +
      name.substr(0, name.indexOf('.')) +
      '_kopia_' +
      new Date().valueOf() +
      name.substr(name.indexOf('.'), name.length),
      '',
      (err) => {
        if (err) throw err;
        console.log('stworzono kopie ' + name);
        res.render('index.hbs', {
          files: segregate(),
        });
      }
    );
  }
});

app.get('/folder&name=:name', (req, res) => {
  const name = req.params.name;
  if (fs.existsSync(currPath + name)) {
    fs.rmdir(currPath + name, (err) => {
      if (err) throw err;
      console.log('usunieto ' + name);
      res.render('index.hbs', {
        files: segregate(),
      });
    });
  }
});
app.get('/file&name=:name', (req, res) => {
  const name = req.params.name;
  if (fs.existsSync(currPath + name)) {
    fs.unlink(currPath + name, (err) => {
      if (err) throw err;
      console.log('usunieto ' + req.body.name);
      res.render('index.hbs', {
        files: segregate(),
      });
    });
  }
});

app.post('/uploadf', (req, res) => {
  if (!fs.existsSync(currPath + req.body.filefold)) {
    fs.appendFile(currPath + req.body.filefold, '', (err) => {
      if (err) throw err;
      console.log('wrzucono ' + req.body.filefold);
    });
  } else {
    fs.appendFile(
      currPath + req.body.filefold + '_kopia_' + new Date().valueOf(),
      '',
      (err) => {
        if (err) throw err;
        console.log('wrzucono kopie ' + req.body.filefold);
        res.render('index.hbs', {
          files: segregate(),
        });
      }
    );
  }
});

app.get('/path=:path', (req, res) => {
  currPath = req.params.path
})

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
