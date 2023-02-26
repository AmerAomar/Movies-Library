'use strict'

// import the express framework
const express = require('express');
const server = express();

// the server must have address
const PORT = 3000;

// http://localhost:3000 or http://localhost:3000/
const fileSystem = require('fs');     // built-in method that allow the server to read the file
const JsonInfo = fileSystem.readFileSync('./data.json')// this data here is in json format
const data = JSON.parse(JsonInfo);   // now this variable containe the data from the json file converted to the js format

//Routes
server.get('/', (req, res) => {
    const myMovie = function(data) {
        this.title = data.title;
        this.poster_path = data.poster_path;
        this.overview = data.overview;
    };
    
    const movieData = new myMovie(data); /*here i create a new instance from the constructor and send the variable data
                                          ((the object that was in the json file)) and the constructor is responsable to get the specifice
                                          data from the data object.*/
    res.send(movieData);             // here it will response the instance that have the specifice data
});

server.get('/test', (req, res) => {
    let string = "Hello from this route";  // here in the callBack function u can do what ever processes u want and send it as a response
    res.status(200).send(string);       //here i send the response after some processes
});

server.get('/favorite', (req, res) => {
    res.send('Welcome to Favorite Page');
});

// default Route
server.get('*', (req, res) => {
    let handler404 = { 
        status: 404,
        responseText: "Page not found"
    }
    res.status(404).send(handler404);
});

server.listen(PORT, () =>{
    console.log(`listening on ${PORT} : I am ready`);
});

// error handling middleware
let handler500 = {
    status: 500,
    responseText: 'Sorry, something went wrong'
};

server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(handler500);
});
