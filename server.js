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
let currentPath = './upload/';

const segregate = () => {
  let folders = [];
  let files = [];
  let tab = fs.readdirSync(currentPath);
  tab.forEach((e) => {
    if (fs.lstatSync(currentPath + e).isDirectory()) {
      folders.push({
        name: e,
        type: true,
        path:
          currentPath.substr(9, currentPath.length).replaceAll('/', '~') + e, //query zachowa path z '~' zamiast '/'
      });
    } else {
      files.push({
        name: e.substr(0, e.indexOf('.')),
        format: e.substr(e.indexOf('.'), e.length),
        type: false,
        fullname: e,
        path:
          currentPath.substr(9, currentPath.length).replaceAll('/', '~') + e,
      });
      console.log(
        currentPath.substr(9, currentPath.length).replaceAll('/', '~') + e
      );
    }
  });
  return [folders, files];
};

const getPathArr = () => {
  let pathobj = [];
  patharr = currentPath.substr(2, currentPath.length).split('/');
  temp = '';
  patharr.forEach((e, i) => {
    if (i != 0) {
      temp += e + '~';
    } else {
      temp += '~';
    }
    pathobj.push({
      path: temp,
      name: e,
    });
  });
  pathobj[pathobj.length - 1].path.substr(
    0,
    pathobj[pathobj.length - 1].path.length - 1
  ); //usuniecie ostatniego '/'
  return pathobj;
};

app.get('/', (req, res) => {
  res.render('index.hbs', {
    files: segregate(),
    pathArr: getPathArr(),
    nonuploadfolder: currentPath.length !== 9 ? true : false, //czy obecny folder jest inny niz /upload
  });
});

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static('static'));

app.post('/newfolder', (req, res) => {
  if (!fs.existsSync(currentPath + req.body.name)) {
    fs.mkdir(currentPath + req.body.name, (err) => {
      if (err) throw err;
      console.log('stworzono ' + req.body.name);
      res.render('index.hbs', {
        files: segregate(),
        pathArr: getPathArr(),
        nonuploadfolder: currentPath.length !== 9 ? true : false,
      });
    });
  } else {
    fs.mkdir(
      currentPath + req.body.name + '_kopia_' + new Date().valueOf(),
      (err) => {
        if (err) throw err;
        console.log('stworzono kopie ' + req.body.name);
        res.render('index.hbs', {
          files: segregate(),
          pathArr: getPathArr(),
          nonuploadfolder: currentPath.length !== 9 ? true : false,
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
  if (!fs.existsSync(currentPath + name)) {
    fs.appendFile(currentPath + name, '', (err) => {
      if (err) throw err;
      console.log('stworzono ' + name);
      res.render('index.hbs', {
        files: segregate(),
        pathArr: getPathArr(),
        nonuploadfolder: currentPath.length !== 9 ? true : false,
      });
    });
  } else {
    fs.appendFile(
      currentPath +
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
          pathArr: getPathArr(),
          nonuploadfolder: currentPath.length !== 9 ? true : false,
        });
      }
    );
  }
});

app.get('/folder&name=:name', (req, res) => {
  const name = req.params.name;
  if (fs.existsSync(currentPath + name)) {
    fs.rm(currentPath + name, { recursive: true, force: true }, (err) => {
      if (err) throw err;
      console.log('usunieto ' + name);
      res.render('index.hbs', {
        files: segregate(),
        pathArr: getPathArr(),
        nonuploadfolder: currentPath.length !== 9 ? true : false,
      });
    });
  }
});
app.get('/file&name=:name', (req, res) => {
  const name = req.params.name;
  if (fs.existsSync(currentPath + name)) {
    fs.unlink(currentPath + name, (err) => {
      if (err) throw err;
      console.log('usunieto ' + req.params.name);
      res.render('index.hbs', {
        files: segregate(),
        pathArr: getPathArr(),
        nonuploadfolder: currentPath.length !== 9 ? true : false,
      });
    });
  }
});

app.post('/uploadf', (req, res) => {
  if (!fs.existsSync(currentPath + req.body.filefold)) {
    fs.appendFile(currentPath + req.body.filefold, '', (err) => {
      if (err) throw err;
      console.log('wrzucono ' + req.body.filefold);
      res.render('index.hbs', {
        files: segregate(),
        pathArr: getPathArr(),
        nonuploadfolder: currentPath.length !== 9 ? true : false,
      });
    });
  } else {
    fs.appendFile(
      currentPath + req.body.filefold + '_kopia_' + new Date().valueOf(),
      '',
      (err) => {
        if (err) throw err;
        console.log('wrzucono kopie ' + req.body.filefold);
        res.render('index.hbs', {
          files: segregate(),
          pathArr: getPathArr(),
          nonuploadfolder: currentPath.length !== 9 ? true : false,
        });
      }
    );
  }
});

app.get('/name=:path', (req, res) => {
  currentPath =
    './upload' +
    (req.params.path[0] === '~'
      ? req.params.path.replaceAll('~', '/')
      : '/' + req.params.path.replaceAll('~', '/'));
  currentPath[currentPath.length - 1] !== '/' ? (currentPath += '/') : null;
  console.log(currentPath);
  res.render('index.hbs', {
    files: segregate(),
    pathArr: getPathArr(),
    nonuploadfolder: currentPath.length !== 9 ? true : false,
  });
});

app.post('/newfoldername', (req, res) => {
  fs.rename(
    currentPath,
    currentPath.substr(
      0,
      currentPath.slice(0, currentPath.length - 1).lastIndexOf('/')
    ) +
      '/' +
      req.body.name,
    (err) => {
      if (err) throw err;
      currentPath =
        currentPath.substr(
          0,
          currentPath.slice(0, currentPath.length - 1).lastIndexOf('/')
        ) +
        '/' +
        req.body.name +
        '/';
      res.render('index.hbs', {
        files: segregate(),
        pathArr: getPathArr(),
        nonuploadfolder: currentPath.length !== 9 ? true : false,
      });
    }
  );
});

app.get('/edit=:path', (req, res) => {
  console.log(req.params.path);
  fs.readFile('./upload/' + req.params.path, 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
    res.render('edytor.hbs', {
      path: './upload/' + req.params.path,
      contents: data,
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
