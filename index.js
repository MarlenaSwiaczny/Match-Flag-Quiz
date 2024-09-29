import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const database = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};
let answers = [];

let quiz = [];

database.connect();

database.query("SELECT * FROM flags", (err, res) => {
  if (err) {
    console.err(err.stack);
  } else {
    quiz = res.rows;
  }

  database.end();
})

// GET home page
app.get("/", (req, res) => {
  totalCorrect = 0;
  nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { 
    question: currentQuestion,
    answers: answers 
  });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer;
  console.log("Answer request: ", req.body);
  if (currentQuestion.flag === answer) {
    totalCorrect++;
    console.log(totalCorrect);
    nextQuestion();
    console.log(currentQuestion);
    console.log(answers);
    res.render("index.ejs", {
      question: currentQuestion,
      totalScore: totalCorrect,
      answers: answers,
      wasCorrect: true
  })
  } else {
    res.render("index.ejs", {
      totalScore: totalCorrect,
      wasCorrect: false,
  })
  }
});

function nextQuestion() {
  currentQuestion = randomCountry();
  currentQuestion.isCorrect = true;
  answers = [currentQuestion.flag];
  for (let i=0; i<3; i++) {
    let otherCountry = randomCountry();
    answers.push(otherCountry.flag);
  }
  answers.sort(() => Math.random() -0.5);
 
} 

function randomCountry() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  return randomCountry
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
