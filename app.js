const express = require('express')
const app = express() 
const mustacheExpress = require('mustache-express')

app.use(express.static('css')) 

app.use(express.urlencoded())

app.engine('mustache',mustacheExpress())

app.set('views','./views')

app.set('view engine','mustache')

const pgp = require('pg-promise')() 

//const connectionString = "postgres://localhost:5432/bblogdb"
//const db = pgp(connectionString)

const cn = {
    host: 'localhost',
    port: 5432,
    database: 'bblogdb',
    user: 'postgres',
    password: 'test',
    max: 30 // use up to 30 connections
}; 

const db = pgp(cn)

app.get('/posts',(req,res) => {

    db.any('SELECT postid,title,body from posts;').then(results => {
        res.render('index',{posts: results})
    })

})

app.get('/add-post',(req,res) => {
    res.render('add-post')
})

app.get('/post-details/:postid',(req,res) => {

    let postId = req.params.postpId 

    db.one('SELECT postid,is_published, name FROM posts WHERE postid = $1',[postpId])
    .then(data => {
        res.render('post-details', data)
    })

})

app.post('/add-post',(req,res) => {

    let name = req.body.name
    let body = req.body.body
    let is_published = false 

    if(req.body.is_published == "on") {
        is_published = true 
    }

    db.none('INSERT INTO posts(title,body,is_published) VALUES($1,$2,$3)',[name,body,is_published]).then(() => {
        res.redirect('/posts')
    }) 

})

app.listen(3000,() => {
    console.log('Server is running...')
})