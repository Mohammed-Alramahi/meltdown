const express = require('express');
const cors = require('cors');
require('dotenv').config();
const server = express();
const mongoose= require('mongoose');
const axios = require('axios');
const key = '10ab1f8ae5ae843c5bf6fc4311abbf18';
server.use(cors());
server.use(express.json());
mongoose.connect('mongodb://localhost:27017/movies',{ useNewUrlParser: true, useUnifiedTopology: true });
server.listen(3300, () => {
    console.log("alive!!!");
})

server.get("/getmovies", getMovies);
server.post("/addtofav", addToFavHandler);
server.get("/getfav",getFavHandler)
server.delete("/deletefav/:id", deleteFavHandler);
server.put("/updatefav/:id", updateFavHandler);
movieSchema = new mongoose.Schema({
    name: String,
    overview: String,
    votes: Number,
    genre: Array
});
movieModel = new mongoose.model('movie', movieSchema);
async function  getMovies(req, res) {
    const url=`https://api.themoviedb.org/3/trending/all/day?api_key=${key}`
    const result = await axios.get(url);
    const movies = result.data.results.map(item => {
        return new Movie(item);
    })
    res.send(movies);
}
function getFavHandler(req, res) {
    movieModel.find({}, (err, data) => {
        if (!err) {
            res.send(data);
        }
    })
}

async function addToFavHandler(req, res) {
    const movie = req.body;
    const newMovie = new movieModel({
        name: movie.name,
        overview: movie.overview,
        votes: movie.votes,
        genre:movie.genre
        
    })
    newMovie.save();
}
function deleteFavHandler(req, res){
    const id = req.params.id;
    movieModel.remove({ _id: id }, (err) => {
        if (!err) {
            movieModel.find({}, (err, data) => {
                res.send(data);
            })
        }
    })
}

function updateFavHandler(req, res) {
    const movie = req.body;
    const id = req.params.id;
    movieModel.findOne({ _id: id }, (err, data) => {
        data.name= movie.name,
        data.overview= movie.overview,
        data.votes= movie.votes,
        data.save().then(() => {
            movieModel.find({}, (err, data) => {
                if(!err)
                res.send(data);
            })
        });

    })
   
}




class Movie{
    constructor(movie) {
        this.overview = movie.overview;
        this.name = movie.original_name;
        this.votes = movie.vote_average;
        this.genre = movie.genre_ids;
    }
}