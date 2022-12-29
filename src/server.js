import database from "../src/database.js";
import express from 'express';
import cors from 'cors';
import { validatePassword, validateEmail,signIn } from "../src/functions.js";

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
    catch(err){
        response.status(400);
        response.json(err.message);
      }
});

//Sign-in Route
app.post("/api/sign-in", async (request, response) => {
    const {email, password} = request.body;
    try {
      await signIn(email, password);
      const result = await database.raw(`select email, id from users where email='${email}' and password = '${password}'`);
      response.status(200);
      response.json(result[0]);
    } 
    catch (err) {
      response.status(401);
      response.json(err.message);
    }
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
        response.status(400);
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
        response.status(400);
        response.json(err.message);
    }
});

//Create a new trip route
app.post("/api/trip", async(request, response) => {
    const {user_id, date, destination, description, days, rating, lat, lon} = request.body;
    const destinationFirstLetterUpperCase = destination [ 0 ].toUpperCase()+destination.slice( 1 ).toLowerCase();
    if ( lat.length > 0  && lon.length > 0 ) {
      const insert = await database.raw(`insert into trips (user_id, date, destination, description, days, rating, lat, lon) values ('${user_id}','${date}','${destinationFirstLetterUpperCase}','${description}','${days}','${rating}','${lat}','${lon}')`);
      const id = insert.lastInsertRowid;
      const result = await database.raw(`select * from trips where id= ${id}`);
      response.status(200);
      response.json(result);
    }
    else {
      response.status(400);
      response.json(`This location does not exist. Please check your destination!`);
    }
})

//Get all trips of the logged in user route
app.get("/api/:user_id/trips", async (request, response) => {
    const user_id = request.params.user_id;
    const result = await database.raw(`select * from trips where user_id = ${user_id}`);
    response.status(200);
    response.json(result);
  });

 // Get the trip with the specific id_trip to be shown in the updated form
  app.get("/api/:trip_id/trip", async (request, response) => {
    const trip_id = request.params.trip_id;
    const result = await database.raw(`select * from trips where id = ${trip_id}`);
    response.status(200);
    response.json(result);
  });

//Update trip data route
app.put("/api/trip/:id", async (request, response) => {
    const id = request.params.id;
    const {date, destination, description, days, rating, lat, lon} = request.body;
    const destinationFirstLetterUpperCase = destination[ 0 ].toUpperCase()+destination.slice( 1 ).toLowerCase();
    if ( lat.length > 0  && lon.length > 0 ) {
      await database.raw(`update trips set date = '${date}', destination = '${destinationFirstLetterUpperCase}', description='${description}', days='${days}', rating='${rating}', lat ='${lat}', lon='${lon}', days = '${days}' where id =${id} `);
      const result = await database.raw(`select * from trips where id = ${id}`)
      response.status(200)
      response.json(result)
    }
    else {
      response.status(400);
      response.json(`This location does not exist. Please check your destination!`);
    }
  });

//Remove one trip from database route
app.delete("/api/trip/:id", async (request, response) => {
    const id = request.params.id;
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
  