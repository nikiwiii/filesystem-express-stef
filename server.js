const express = require('express')
const hbs = require('express-handlebars')
const fs = require("fs")
const path = require("path")
const app = express()
const port = 4000


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({
    defaultLayout: 'main.hbs',
    helpers: {}
}));



// fs.unlink(filepath,  (err) =>{
//     if (err) throw err
//     console.log("czas 1: " + new Date().getMilliseconds());
// })


app.get("/", (req, res) => {
    res.render('index.hbs', {
        files: segregate()
    })
})

const segregate = () => {
    var tab = fs.readdirSync('./upload/')
    var folders = []
    var files = []
    tab.forEach(e => {
        if (fs.lstatSync('./upload/'+e).isDirectory()) {
            folders.push({name: e, type: true})
        }
        else {
            files.push({name: e, type: false})
        }
    });
    console.log(folders,files);
    return [folders,files]
}

app.use(express.urlencoded({
    extended: true
}))
app.use(express.static('static'))

app.post('/newfolder', (req, res) => {
    if (!fs.existsSync("./upload/" + req.body.name)) {
        fs.mkdir("./upload/" + req.body.name, (err) => {
            if (err) throw err
            console.log("jest");
        })
    }
    else {
        fs.mkdir("./upload/" + req.body.name + '_kopia_' + Date.now, (err) => {
            if (err) throw err
            console.log("jest");
        })
    }
    res.render('index.hbs', {
        files: segregate()
    })
})

app.post('/newfile', (req, res) => {
    if (!fs.existsSync("./upload/" + req.body.name)) {
        fs.appendFile("./upload/" + req.body.name, '', (err) => {
            if (err) throw err
            console.log("jest");
        })
    }
    else {
        fs.appendFile("./upload/" + req.body.name + '_kopia_' + Date.now, '', (err) => {
            if (err) throw err
            console.log("jest");
        })
    }
    res.render('index.hbs', {
        files: segregate()
    })
})


app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})