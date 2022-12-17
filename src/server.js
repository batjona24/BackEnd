import database from "../src/database.js";
import express from 'express';
import cors from 'cors';
import { validatePassword, validateEmail } from "../src/functions.js";

const app = express ();
app.use(express.json());
app.use(cors());


//Sign up Route
app.post("/api/sign-up", async(request, response) => {
    const {email, password} = request.body;
    try {
        if ( await validateEmail(email)&& validatePassword(password)) {
        await database.raw(`insert into users (email, password) values ('${email}','${password}')`);
        const result = await database.raw(`select * from users order by id desc limit 1`);
        response.status(200);
        response.json(result);
        }
    }
    catch(error){
        response.status(404);
        response.json(error.message);
      }
});


//Sign-in Route
app.post("/api/sign-in", async (request, response) => {
    const {email, password} = request.body;
    const result = await database.raw(`select email, id from users where email='${email}' and password = '${password}'`);
    if (result.length == 0) {
      response.status(404)
      response.json("Username and password do not match!")
    }
    response.status(200);
    response.json(result[0]);
});


//Update email route
app.put("/api/email/:id", async(request, response) => {
    const id = request.params.id;
    const {email} = request.body;
    try {
      await validateEmail(email);
      await database.raw(`update users set email='${email}' where id=${id}`);
      const result = await database.raw(`select * from users where id= ${id}`);
      response.status(200);
      response.json(result);
    }
    catch(err) {
        response.status(404);
        response.json(err.message);
    }
});


//Update password route
app.put("/api/password/:id", async(request, response) => {
    const id = request.params.id;
    const {password} = request.body;
    try {
      await validatePassword(password); 
      await database.raw(`update users set password='${password}' where id=${id}`);
      const result = await database.raw(`select * from users where id= ${id}`);
      response.status(200);
      response.json(result);
    }
    catch(err) {
        response.status(404);
        response.json(err.message);
    }
});

//Create a new trip route
app.post("/api/trip", async(request, response) => {
    const trip = request.body;
    const insert = await database.raw(`insert into trips (user_id, date, destination, description, days, rating, lat, lon) values ('${trip.user_id}','${trip.date}','${trip.destination}','${trip.description}','${trip.days}','${trip.rating}','${trip.lat}','${trip.lon}')`);
    const id = insert.lastInsertRowid;
    const result = await database.raw(`select * from trips where id= ${id}`);
    response.status(200);
    response.json(result);
})

//Get all trips of the logged in user route
app.get("/api/:user_id/trips", async (request, response) => {
    const user_id = request.params.user_id;
    const result = await database.raw(`select * from trips where user_id = ${user_id}`);
    response.status(200);
    response.json(result);
  });

  //API to get all trips
app.get("/api/trips", async (request, response) => {
    const result = await database.raw(`select * from trips`);
    response.status(200);
    response.json(result);
  });


//Update trip data route
app.put("/api/trip/:id", async (request, response) => {
    const id = request.params.id;
    const {date, destination, description, days, rating, lat, lon} = request.body;
    await database.raw(`update trips set date = '${date}', destination = '${destination}', description='${description}', days='${days}', rating='${rating}', lat ='${lat}', lon='${lon}', days = '${days}' where id =${id} `);
    const result = await database.raw(`select * from trips where id = ${id}`)
    response.status(200)
    response.json(result)
  });

//Remove one trip from database route
app.delete("/api/trip/:id", async (request, response) => {
    const id = request.params.id;
    //await database.raw(`delete from trips`);
    await database.raw(`delete from trips where id=${id}`);
    const result =  await database.raw(`select * from trips`);
  
    response.status(200);
    response.json(result);
  });

//Route that handles every other route
app.all("/*", async (request, response ) => {
    response.status(404);
    response.json({error: "This route does not exist"});
});

const hostname = "localhost";
const port = 4000;

app.listen(port, hostname, () => {
    console.log(`Server listening on http://${hostname}:${port}`);
  });
  