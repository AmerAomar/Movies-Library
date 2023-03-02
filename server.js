'use strict'

// import the express framework
const express = require('express');
const server = express();
const axios = require('axios');
const { mutateExecOptions } = require('nodemon/lib/config/load');
require('dotenv').config();
const pg=require('pg')

const client = new pg.Client(process.env.movieDb_url)


server.use(express.json());

// the server must have address
const PORT = 3000;

// http://localhost:3000 or http://localhost:3000/
/*const fileSystem = require('fs');     // built-in method that allow the server to read the file
const JsonInfo = fileSystem.readFileSync('./data.json')// this data here is in json format
const data = JSON.parse(JsonInfo);   // now this variable containe the data from the json file converted to the js format
*/
//Routes



// server.get('/', (req, res) => {
//     const myMovie = function(data) {
//         this.title = data.title;
//         this.poster_path = data.poster_path;
//         this.overview = data.overview;
//     };
    
//     const movieData = new myMovie(data); /*here i create a new instance from the constructor and send the variable data
//                                           ((the object that was in the json file)) and the constructor is responsable to get the specifice
//                                           data from the data object.*/
//     res.send(movieData);             // here it will response the instance that have the specifice data
// });

// server.get('/test', (req, res) => {
//     let string = "Hello from this route";  // here in the callBack function u can do what ever processes u want and send it as a response
//     res.status(200).send(string);       //here i send the response after some processes
// });

// server.get('/favorite', (req, res) => {
//     res.send('Welcome to Favorite Page');
// });

// // default Route
// server.get('*', (req, res) => {
//     let handler404 = { 
//         status: 404,
//         responseText: "Page not found"
//     }
//     res.status(404).send(handler404);
// });
client.connect()
.then(()=>{
server.listen(PORT, () =>{
   console.log(`listening on ${PORT} : I am ready`);
 });
})

// // error handling middleware
// let handler500 = {
//     status: 500,
//     responseText: 'Sorry, something went wrong'
// };

// server.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send(handler500);
// });



/***** Here will start the lab 12*****/

const Con = function(data) {
    this.id = data.id;
    this.title = data.title;
    this.releasedate=data.first_air_date;
    this.poster_path = data.poster_path;
    this.overview = data.overview;
  };
  //Routes
  server.get('/trending', trendingHandler);
  server.get('/search', searchHandler);
  server.get('/person/:id',personHandler);
  server.get('/company/:id',companyHandler);
  server.get('/moviesDB',moviesGetHandler);
  server.post('/moviesDB',moviesAddHandler);
  server.put('/UPDATE/:id',updateHandler);
  server.delete('/DELETE/:id',deleteHandler);
  server.get('/getMovie/:id',getMovieIdHandler);

  //function handlers
  function trendingHandler(req, res) {
    const APIkey = process.env.apikey;
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${APIkey}&language=en-US`;
    try {
      axios.get(url)
        .then((result) => {
          let mapResult = result.data.results.map((item) => {
            let trending = new Con(item);
            return trending;
          });
          res.send(mapResult);
        })
        .catch((err) => {
          console.log("sorry", err);
          res.status(500).send(err);
        });
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

function searchHandler(req,res)
{
    let x=req.query.query;
    const APIkey = process.env.apikey;
    const url=`https://api.themoviedb.org/3/search/movie?api_key=${APIkey}&language=en-US&query=${x}&page=2`
    try{
        axios.get(url)
        .then((result)=>{
            let mapResult=result.data.results.map((item)=>{
                let search= new Con(item);
                return search;
            });
            res.send(mapResult);
        })
        .catch((err) => {
            console.log("sorry", err);
            res.status(500).send(err);
          })
    }
    catch (error) {
        errorHandler(error, req, res);
      }
}


function personHandler(req,res){//when u choose id number, try many different times
    function Person(data){
        this.name=data.name;
        this.birthday=data.birthday;
        this.biography=data.biography
    }
let pId=req.params.id;
    const APIkey = process.env.apikey;
    const url=`https://api.themoviedb.org/3/person/${pId}?api_key=${APIkey}&language=en-US`;
    try {
        axios.get(url)
          .then((result) => {
            let person = new Person(result.data);
            res.send(person);
          })
          .catch((err) => {
            console.log("sorry", err);
            res.status(500).send(err);
          })
      } 
    catch (error) {
        errorHandler(error, req, res);
      }
}


function companyHandler(req,res){
    function Company(data){
        this.name=data.name;
        this.origin_country=data.origin_country;
        
    }
let cId=req.params.id;
    const APIkey = process.env.apikey;
    const url=`https://api.themoviedb.org/3/company/${cId}?api_key=${APIkey}&language=en-US`;
    try {
        axios.get(url)
          .then((result) => {
            let company = new Company(result.data);
            res.send(company);
          })
          .catch((err) => {
            console.log("sorry", err);
            res.status(500).send(err);
          })
      } 
    catch (error) {
        errorHandler(error, req, res);
      }
}


function moviesGetHandler(req,res){
  const sql = `SELECT * FROM moviestable`;
  client.query(sql)
  .then((amer)=>{
    res.send(amer.rows)
  })
  .catch((err)=>{
errorHandler(err,req,res);
  })

}

function moviesAddHandler(req,res){
  const theMovie=req.body
  const sql=`INSERT INTO moviestable (title, release_year, director,genre,rating)
  VALUES ($1, $2, $3,$4,$5) RETURNING *;`
  const values = [theMovie.title, theMovie.release_year, theMovie.director, theMovie.genre, theMovie.rating];
  client.query(sql,values)
  .then((theRes)=>{
    res.send("the movie data was added")
  })
  .catch(err=>{
    errorHandler(err,req,res)
  })
}

function updateHandler(req,res){
  const id =req.params.id;
  const sql=`UPDATE moviestable SET title=$1, release_year=$2, director=$3 ,genre=$4,rating=$5 WHERE id=${id} RETURNING *`;
  let values=[req.body.title,req.body.release_year,req.body.director,req.body.genre,req.body.rating];
  client.query(sql,values)
  .then((data)=>{
res.send(data.rows)
  })
  .catch((err)=>{
    errorHandler(err,req,res)
  })
}

function deleteHandler(req,res){
  let id=req.params.id;
  let sql=`DELETE FROM moviestable WHERE id=${id}`;
  client.query(sql)
  .then((data)=>{
    res.status(200).send("DELETED!")
  })
.catch((err)=>{
  errorHandler(err,req,res)
})
}

function getMovieIdHandler(req,res){
  let id=req.params.id;
  let sql=`SELECT * FROM moviestable WHERE id=${id}`
  client.query(sql)
  .then((data)=>{
    res.send(data.rows[0])
  })
  .catch((err)=>{
    errorHandler(err,req,res)
  })
}

  function errorHandler(error, req, res) {
    const err = {
      status: 500,
      message: error
    };
    res.status(500).send(err);
  }
  
  