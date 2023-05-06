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

const segregate = () => {
  var folders = [];
  var files = [];
  var tab = fs.readdirSync('./upload/');
  tab.forEach((e) => {
    if (fs.lstatSync('./upload/' + e).isDirectory()) {
      folders.push({
        name: e,
        type: true,
      });
    } else {
      files.push({
        name: e.substr(0, e.indexOf('.')),
        format: e.substr(e.indexOf('.'), e.length),
        type: false,
      });
    }
  });
  return [folders, files];
};

app.get('/', (req, res) => {
  res.render('index.hbs', {
    files: segregate(),
  });
});

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static('static'));

app.post('/newfolder', (req, res) => {
  if (!fs.existsSync('./upload/' + req.body.name)) {
    fs.mkdir('./upload/' + req.body.name, (err) => {
      if (err) throw err;
      console.log('jest');
    });
  } else {
    fs.mkdir(
      './upload/' + req.body.name + '_kopia_' + new Date().valueOf(),
      (err) => {
        if (err) throw err;
        console.log('jest');
      }
    );
  }
  res.render('index.hbs', {
    files: segregate(),
  });
});

app.post('/newfile', (req, res) => {
  var name = req.body.name;
  if (!name.includes('.')) {
    name += '.txt';
  }
  if (!fs.existsSync('./upload/' + name)) {
    fs.appendFile('./upload/' + name, '', (err) => {
      if (err) throw err;
      console.log('jest');
    });
  } else {
    fs.appendFile(
      './upload/' +
        name.substr(0, name.indexOf('.')) +
        '_kopia_' +
        new Date().valueOf() +
        name.substr(name.indexOf('.'), name.length),
      '',
      (err) => {
        if (err) throw err;
        console.log('jest');
      }
    );
  }
  res.render('index.hbs', {
    files: segregate(),
  });
});

app.get('/folder&name=:name', (req, res) => {
  const name = req.params.name;
  if (fs.existsSync('./upload/' + name)) {
    fs.rmdir('./upload/' + name, (err) => {
      if (err) throw err;
      console.log('nuh uh');
    });
  }
  res.render('index.hbs', {
    files: segregate(),
  });
});
app.get('/file&name=:name', (req, res) => {
  const name = req.params.name;
  if (fs.existsSync('./upload/' + name)) {
    fs.unlink('./upload/' + name, (err) => {
      if (err) throw err;
      console.log('nuh uh');
    });
  }
  res.render('index.hbs', {
    files: segregate(),
  });
});

app.post('/uploadf', (req, res) => {
  if (!fs.existsSync('./upload/' + req.body.filefold)) {
    fs.appendFile('./upload/' + req.body.filefold, '', (err) => {
      if (err) throw err;
      console.log('jest');
    });
  } else {
    fs.appendFile(
      './upload/' + req.body.filefold + '_kopia_' + new Date().valueOf(),
      '',
      (err) => {
        if (err) throw err;
        console.log('jest');
      }
    );
  }
  res.render('index.hbs', {
    files: segregate(),
  });
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
