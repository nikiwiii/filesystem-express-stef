const express = require('express');
const hbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const app = express();
const multer = require('multer')
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
let currentFile = ''

const segregate = () => {
  let folders = [];
  let files = [];
  let tab = fs.readdirSync(currentPath);
  tab.forEach((e) => {
    if (fs.lstatSync(currentPath + e).isDirectory()) {
      folders.push({
        name: e,
        type: true,
        path: currentPath.substr(9, currentPath.length).replaceAll('/', '~') + e, //query zachowa path z '~' zamiast '/'
      });
    } else {
      files.push({
        name: e.substr(0, e.lastIndexOf('.')),
        format: e.substr(e.lastIndexOf('.'), e.length),
        type: false,
        html: e.substr(e.lastIndexOf('.') + 1, e.length) === 'html' ? true : false,
        css: e.substr(e.lastIndexOf('.') + 1, e.length) === 'css' ? true : false,
        js: e.substr(e.lastIndexOf('.') + 1, e.length) === 'js' ? true : false,
        fullname: e,
        path: currentPath.substr(9, currentPath.length).replaceAll('/', '~') + e,
      });
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
      name.substr(0, name.lastIndexOf('.')) +
      '_kopia_' +
      new Date().valueOf() +
      name.substr(name.lastIndexOf('.'), name.length),
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
    fs.rm(currentPath + name, {
      recursive: true,
      force: true
    }, (err) => {
      if (err) throw err;
      console.log('usunieto ' + name);
      res.render('index.hbs', {
        files: segregate(),
        pathArr: getPathArr(),
        nonuploadfolder: currentPath.length !== 9 ? true : false,
      });
    });
  } else {
    res.render('index.hbs', {
      files: segregate(),
      pathArr: getPathArr(),
      nonuploadfolder: currentPath.length !== 9 ? true : false,
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
  } else {
    res.render('index.hbs', {
      files: segregate(),
      pathArr: getPathArr(),
      nonuploadfolder: currentPath.length !== 9 ? true : false,
    });
  }
});


let upload = multer({
  dest: currentPath
});
let type = upload.single('filefold');


app.post('/uploadf', type, function (req, res) {
  console.log(req.file);
  let temp_file = req.file.path;
  let name = req.file.originalname
  let target_file = currentPath + (name.includes('.') ? (name.substr(0, name.lastIndexOf('.')) + '_' + req.file.filename.substr(0, 4) + name.substr(name.lastIndexOf('.'), name.length)) : (name + '_' + req.file.filename.substr(0, 4) + '.txt'));
  fs.readFile(temp_file, (err, data) => {
    fs.unlink(temp_file, (err) => {
      fs.appendFile(target_file, data, (err) => {
        res.render('index.hbs', {
          files: segregate(),
          pathArr: getPathArr(),
          nonuploadfolder: currentPath.length !== 9 ? true : false,
        });
      })
    });
  });
})

app.get('/name=:path', (req, res) => {
  currentPath =
    './upload' +
    (req.params.path[0] === '~' ?
      req.params.path.replaceAll('~', '/') :
      '/' + req.params.path.replaceAll('~', '/'));
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
    currentPath.substr(0, currentPath.slice(0, currentPath.length - 1).lastIndexOf('/')) +
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
  // console.log(currentPath + req.params.path);
  // console.log(fs.existsSync(currentPath + req.params.path));
  let path = './upload/' + req.params.path.replaceAll('~','/')
  currentFile = path
  fs.readFile(path, (err, data) => {
    if (err) throw err;
    res.render('edytor.hbs', {
      path: path,
      contents: data.toString('utf8'),
      currentFile: currentFile.substr(currentFile.lastIndexOf('/')+1, currentFile.length)
    });
  });
});

let editorFontSize = 14
let editorColor = 2

app.post('/sendSettings', (req,res) => {
  //body sie nie przekazuje samo wiec robie takie cos przepraszam
  let sentStuff = JSON.parse(req.headers.body)
  editorColor = sentStuff.color
  editorFontSize = sentStuff.size
  res.send(JSON.stringify('zapisano'))
})

app.get('/getSettings', (req,res) => {
  res.send(JSON.stringify({
    size: editorFontSize,
    color: editorColor
  }, null, 5))
})

app.post('/sendChanged', (req,res) => {
  let data = JSON.parse(req.headers.body).newText
  fs.writeFile(currentFile, data, (err) => {
    res.send(JSON.stringify('zapisano zmiany'))
  })
})

app.post('/newfilename', (req,res) => {
  console.log(currentFile.substr(currentFile.lastIndexOf('/')+1, currentFile.length));
  console.log(req.body.name);
  fs.rename(currentFile, currentFile.substr(0, currentFile.lastIndexOf('/')+1) +  req.body.name, (err) => {
    if (err) throw err
    currentFile = currentPath + req.body.name
    fs.readFile(currentPath + req.body.name, (err, data) => {
      if (err) throw err;
      res.render('edytor.hbs', {
        path: currentPath + req.body.name,
        contents: data.toString('utf8'),
        currentFile: currentFile.substr(currentFile.lastIndexOf('/')+1, currentFile.length)
      });
    });
  }) 
})

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});