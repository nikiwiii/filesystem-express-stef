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
        onmain: true
    })
})

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

    // cars.insert(data, (_, doc) => {
    //     res.render('index.hbs', {
    //         onadd: true,
    //         id: doc._id
    //     })
    // })
})

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})