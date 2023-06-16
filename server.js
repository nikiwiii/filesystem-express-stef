const express = require('express');
const hbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const app = express();
const multer = require('multer');
const port = 4000;
const bodyParser = require('body-parser');
const crypto = require('crypto')
const Data = require('nedb')
const nocache = require("nocache");
const cookieparser = require("cookie-parser");

app.use(cookieparser())
app.use(nocache())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine(
  'hbs',
  hbs.engine({
    defaultLayout: 'main.hbs',
    helpers: {},
  })
);
let currentFile = '';
let users = [];
let usersFromDB = new Data({
  filename: 'kolekcja.db',
  autoload: true
})

let alertText = '';


const checkIfUserExists = (name) => {
  let found = false;
  users.forEach((e, i) => {
    if (Object.values(e).indexOf(name) > -1) {
      found = true;
    }
  });
  return found;
};

const sha256 = async (message) => {
  //encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('zaszyfrowano');
  return hashHex;
}

app.post('/registerOrLogin', async (req, res) => {
  usersFromDB.find({}, async (err, docs) => {
    users = docs
    alertText = '';
    const currPassword = await sha256(req.body.password)
    if (!checkIfUserExists(req.body.name)) {
      users.push({
        name: req.body.name,
        password: currPassword
      });
      usersFromDB.insert(users[users.length - 1])
      console.log('stworzono użytkownika');
      res.cookie("login", req.body.name, { httpOnly: true, maxAge: 120 * 1000 })
      res.cookie("path", './upload/' + req.cookies.login + '/', { httpOnly: true, maxAge: 120 * 1000 })
      res.cookie("logged", true, { httpOnly: true, maxAge: 120 * 1000 })
    } else {
      const matched = users.find((e) => e.name === req.body.name);
      console.log(matched);
      if (matched.password == currPassword) {
        res.cookie("login", req.body.name, { httpOnly: true, maxAge: 120 * 1000 })
        res.cookie("path", './upload/' + req.cookies.login + '/', { httpOnly: true, maxAge: 120 * 1000 })
        res.cookie("logged", true, { httpOnly: true, maxAge: 120 * 1000 })
      } else {
        alertText = 'złe hasło';
      }
    }
    if (!fs.existsSync('./upload/' + req.body.name)) {
      fs.mkdir('./upload/' + req.body.name, (err) => {
        if (err) console.log(err);
        console.log('stworzono folder');
      });
    }
    console.log(users);
    console.log(alertText);
    res.redirect('/');
  });
});

app.get('/accounts', (req, res) => {
  usersFromDB.find({}, async (err, docs) => {
    res.render('accounts.hbs', {
      accounts: docs,
      admin: req.cookies.login === 'admin' ? true : false
    })
  })
})

app.get('/deleteUser=:id', (req, res) => {
  const id = req.params.id
  usersFromDB.remove({
    _id: id
  }, (err) => {
    res.redirect('/accounts')
  })
})

app.get('/notLogged', (req, res) => {
  res.cookie("logged", "false", { httpOnly: true, maxAge: 120 * 1000 })
  res.redirect('/');
});

const segregate = (path) => {
  let folders = [];
  let files = [];
  let tab = fs.readdirSync(path);
  tab.forEach((e) => {
    if (fs.lstatSync(path + e).isDirectory()) {
      folders.push({
        name: e,
        type: true,
        path: path.substr(9, path.length).replaceAll('/', '~') + e, //query zachowa path z '~' zamiast '/'
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
        path: path.substr(9, path.length).replaceAll('/', '~') + e,
      });
    }
  });
  return [folders, files];
};

const getPathArr = (path) => {
  let pathobj = [];
  let patharr = path.substr(2, path.length).split('/');
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
  console.log(req.cookies);
  if (req.cookies.logged != "false" && req.cookies.logged != "true") {
    res.cookie("logged", "false", { httpOnly: true, maxAge: 120 * 1000 })
  }
  if (!Object.entries(req.cookies).includes('path')) {
    res.cookie("path", './upload/', { httpOnly: true, maxAge: 120 * 1000 })
  }
  if (req.cookies.logged == "false") {
    res.render('login.hbs', {
      alertText: alertText,
    });
  } else {
    res.cookie("path", './upload/' + req.cookies.login + '/', { httpOnly: true, maxAge: 120 * 1000 })
    let folders = [];
    let files = [];
    let tab = fs.readdirSync(req.cookies.path);
    tab.forEach((e) => {
      if (fs.lstatSync(req.cookies.path + e).isDirectory()) {
        folders.push({
          name: e,
          type: true,
          path: req.cookies.path.substr(9, req.cookies.path.length).replaceAll('/', '~') + e, //query zachowa path z '~' zamiast '/'
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
          path: req.cookies.path.substr(9, req.cookies.path.length).replaceAll('/', '~') + e,
        });
      }
    });
    let pathobj = [];
    let patharr = req.cookies.path.substr(2, req.cookies.path.length).split('/');
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
    res.render('index.hbs', {
      // files: segregate(req.cookies.path),
      files: [folders, files],
      pathArr: pathobj,
      nonuploadfolder: req.cookies.path.length !== 9 ? true : false, //czy obecny folder jest inny niz /upload
    });
  }
});

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static('static'));

app.post('/newfolder', (req, res) => {
  if (!fs.existsSync(req.cookies.path + req.body.name)) {
    fs.mkdir(req.cookies.path + req.body.name, (err) => {
      if (err) throw err;
      console.log('stworzono ' + req.body.name);
      res.redirect('/');
    });
  } else {
    fs.mkdir(
      req.cookies.path + req.body.name + '_kopia_' + new Date().valueOf(),
      (err) => {
        if (err) throw err;
        console.log('stworzono kopie ' + req.body.name);
        res.redirect('/');
      }
    );
  }
});

app.post('/newfile', (req, res) => {
  let name = req.body.name;
  if (!name.includes('.')) {
    name += '.txt';
  }
  if (!fs.existsSync(req.cookies.path + name)) {
    fs.appendFile(req.cookies.path + name, '', (err) => {
      if (err) throw err;
      console.log('stworzono ' + name);
      res.redirect('/');
    });
  } else {
    fs.appendFile(
      req.cookies.path +
      name.substr(0, name.lastIndexOf('.')) +
      '_kopia_' +
      new Date().valueOf() +
      name.substr(name.lastIndexOf('.'), name.length),
      '',
      (err) => {
        if (err) throw err;
        console.log('stworzono kopie ' + name);
        res.redirect('/');
      }
    );
  }
});

app.get('/folder&name=:name', (req, res) => {
  const name = req.params.name;
  if (fs.existsSync(req.cookies.path + name)) {
    fs.rm(
      req.cookies.path + name, {
      recursive: true,
      force: true,
    },
      (err) => {
        if (err) throw err;
        console.log('usunieto ' + name);
        res.redirect('/');
      }
    );
  } else {
    res.redirect('/');
  }
});
app.get('/file&name=:name', (req, res) => {
  const name = req.params.name;
  if (fs.existsSync(req.cookies.path + name)) {
    fs.unlink(req.cookies.path + name, (err) => {
      if (err) throw err;
      console.log('usunieto ' + req.params.name);
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

// const upload = (req) => {
//   return multer({
//     dest: req.cookies.path,
//   });
// }
// let type = upload('ll').single('filefold');

// app.post('/uploadf', type, function (req, res) {
//   console.log(req.file);
//   let temp_file = req.file.path;
//   let name = req.file.originalname;
//   let target_file =
//     req.cookies.path +
//     (name.includes('.') ?
//       name.substr(0, name.lastIndexOf('.')) +
//       '_' +
//       req.file.filename.substr(0, 4) +
//       name.substr(name.lastIndexOf('.'), name.length) :
//       name + '_' + req.file.filename.substr(0, 4) + '.txt');
//   fs.readFile(temp_file, (err, data) => {
//     fs.unlink(temp_file, (err) => {
//       fs.appendFile(target_file, data, (err) => {
//         res.redirect('/');
//       });
//     });
//   });
// });

app.get('/name=:path', (req, res) => {
  if (req.cookies.login != 'admin' && req.params.path == '~') {
  } else {
    let currentFolder =
      './upload' +
      (req.params.path[0] === '~' ?
        req.params.path.replaceAll('~', '/') :
        '/' + req.params.path.replaceAll('~', '/'));
    req.cookies.path[req.cookies.path.length - 1] !== '/' ? (req.cookies.path += '/') : null;
    res.cookie("path", currentFolder, { httpOnly: true, maxAge: 120 * 1000 })
    console.log(currentFolder);
  }
  res.redirect('/');
});

app.post('/newfoldername', (req, res) => {
  fs.rename(
    req.cookies.path,
    req.cookies.path.substr(
      0,
      req.cookies.path.slice(0, req.cookies.path.length - 1).lastIndexOf('/')
    ) +
    '/' +
    req.body.name,
    (err) => {
      if (err) throw err;
      let currentFolder =
        req.cookies.path.substr(
          0,
          req.cookies.path.slice(0, req.cookies.path.length - 1).lastIndexOf('/')
        ) +
        '/' +
        req.body.name +
        '/';
      res.cookie("path", currentFolder, { httpOnly: true, maxAge: 120 * 1000 })
      res.redirect('/');
    }
  );
});

let isCurrFileImg = false;
let baseUrl;
let UrlPathIdk;
let formatImg;

app.get('/edit=:path', (req, res) => {
  // console.log(req.cookies.path + req.params.path);
  // console.log(fs.existsSync(req.cookies.path + req.params.path));
  let path = './upload/' + req.params.path.replaceAll('~', '/');
  currentFile = path;
  let format = currentFile.substr(
    currentFile.lastIndexOf('.') + 1,
    currentFile.length
  );
  if (['png', 'jpg', 'svg'].includes(format)) {
    formatImg = format;
    UrlPathIdk = req.params.path;
    isCurrFileImg = true;
    baseUrl = fs.readFileSync(currentFile, {
      encoding: 'base64'
    });
    res.render('image-editor.hbs', {
      currentFile: currentFile.substr(
        currentFile.lastIndexOf('/') + 1,
        currentFile.length
      ),
      urlPath: UrlPathIdk,
      base64: baseUrl,
      format: formatImg,
      path: currentFile,
      effects: [{
        name: 'grayscale'
      },
      {
        name: 'invert'
      },
      {
        name: 'sepia'
      },
      {
        name: 'none'
      },
      ],
    });
  } else {
    fs.readFile(path, (err, data) => {
      isCurrFileImg = false;
      if (err) throw err;
      if (data == '') {
        if (format == 'html') {
          var starterData = `<!DOCTYPE html>
          <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                
            </body>
          </html>`;
        } else if (format == 'js') {
          var starterData = 'let a = 0';
        } else if (format == 'css') {
          var starterData = '* { margin: 0; padding: 0 }';
        }
      }
      res.render('edytor.hbs', {
        urlPath: req.params.path,
        path: path,
        contents: data.length !== 0 ? data.toString('utf8') : starterData,
        currentFile: currentFile.substr(
          currentFile.lastIndexOf('/') + 1,
          currentFile.length
        ),
      });
    });
  }
});

let editorFontSize = 14;
let editorColor = 2;

app.post('/sendSettings', (req, res) => {
  //body sie nie przekazuje samo wiec robie takie cos przepraszam
  let sentStuff = JSON.parse(req.headers.body);
  editorColor = sentStuff.color;
  editorFontSize = sentStuff.size;
  res.send(JSON.stringify('zapisano'));
});

app.get('/getSettings', (req, res) => {
  res.send(
    JSON.stringify({
      size: editorFontSize,
      color: editorColor,
    },
      null,
      5
    )
  );
});

app.post('/sendChanged', (req, res) => {
  let data = JSON.parse(req.headers.body).newText;
  fs.writeFile(currentFile, data, (err) => {
    res.send(JSON.stringify('zapisano zmiany'));
  });
});

app.post('/newfilename', (req, res) => {
  console.log(
    currentFile.substr(currentFile.lastIndexOf('/') + 1, currentFile.length)
  );
  console.log(currentFile);
  fs.rename(
    currentFile,
    currentFile.substr(0, currentFile.lastIndexOf('/') + 1) + req.body.name,
    (err) => {
      if (err) throw err;
      currentFile = req.cookies.path + req.body.name;
      fs.readFile(currentFile, (err, data) => {
        if (err) throw err;
        if (isCurrFileImg) {
          res.render('image-editor.hbs', {
            currentFile: currentFile.substr(
              currentFile.lastIndexOf('/') + 1,
              currentFile.length
            ),
            urlPath: currentFile
              .replaceAll('/', '~')
              .substr(9, currentFile.length),
            base64: baseUrl,
            format: formatImg,
            path: currentFile,
            effects: [{
              name: 'grayscale'
            },
            {
              name: 'invert'
            },
            {
              name: 'sepia'
            },
            {
              name: 'none'
            },
            ],
          });
        } else {
          res.render('edytor.hbs', {
            path: req.cookies.path + req.body.name,
            contents: data.toString('utf8'),
            currentFile: currentFile.substr(
              currentFile.lastIndexOf('/') + 1,
              currentFile.length
            ),
          });
        }
      });
    }
  );
});

app.get('/previewFile=:path', (req, res) => {
  res.sendFile(__dirname + '/upload/' + req.params.path.replaceAll('~', '/'));
});

app.post('/imageSaved', (req, res) => {
  const img64 = req.body.newImg.substr(22, req.body.newImg.length);
  console.log(img64.substr(0, 10));
  fs.writeFile(currentFile, img64, {
    encoding: 'base64'
  }, (err) => {
    console.log(err);
  });
  res.send(JSON.stringify('zapisano obraz'));
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});