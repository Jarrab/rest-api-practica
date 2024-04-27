const express = require('express')
//utilizaremos crypto para crear una id unica
const cors = require ('cors')
const crypto= require('node:crypto')
const movies = require('./movies.json') 
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app= express()

app.use(express.json())  //midleware para ver si un post necesita algo mas

app.use(cors({
   origin: (origin, callback) => {
     const ACCEPTED_ORIGINS = [
       'http://localhost:8080',
       'http://localhost:1234',
       'https://movies.com',
       'https://midu.dev'
     ]
 
     if (ACCEPTED_ORIGINS.includes(origin)) {
       return callback(null, true)
     }
 
     if (!origin) {
       return callback(null, true)
     }
 
     return callback(new Error('Not allowed by CORS'))
   }
 }))


app.disable('x-powered-by')
// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS

// Todos los recursos que sean MOVIES se identifica con /movies


app.get('/', (req, res)=>{
   res.json({message: 'hola mundo'})
})
// todos los recursos que se indentifican con MOVIES se indentifican con /movies es decir
// todos mis datos que sean de movies o provengan de ahi tiene que tener el /movie
//filtrar por genero con, query params

//el .query se utiliza para filtros por lo general
app.get('/movies',(req, res)=>{
   const {genre} = req.query
   if(genre){
      const filteredMovie=movies.filter(
         movie=>movie.genre.some(g=>g.toLowerCase()===genre.toLowerCase())
      )
      return res.json(filteredMovie)
   }
   res.json(movies)
})

//buscar pelicula por id, el .param es mayormente para buscar y se utliza junto al :id o lo que quieras pones en id
app.get('/movies/:id', (req, res)=>{
   const {id}=req.params
   const movie = movies.find(movie=>movie.id===id)
   if(movie)return res.json(movie)

   res.status(404).json({message:"Movie not found"})
})

//POST Para ingresar una nueva pelicula
// el .body es para recuperar lo enviado por el usuario, por eso se utiliza en los post, put y patch
app.post('/movies',(req,res)=>{

   const resultado = validateMovie(req.body)

   if(resultado.error){
      return res.status(400).json({error:JSON.parse(resultado.error.message) })
      //400 es bad request 
   }
   // const{
   //    title,
   //    genre,
   //    year,
   //    director,
   //    duration,
   //    rate,
   //    poster
   // }= req.body //recuperamos todos estos datos de la request

   const newMovie={
      id: crypto.randomUUID(), //creara una uuid v4 uuid=indentificador unico universal
      //si el resultado no da error en el if, nos daria todo el resultado que mandaron
      ...resultado.data
      
      // title,
      // genre,
      // director,
      // year,
      // duration,
      // rate: rate ?? 0,
      // poster
   }

   movies.push(newMovie)
   res.status(201).json(newMovie) //el status para actualizar la cache del cliente
})

app.patch('/movies/:id',(req,res)=>{
   const result=validatePartialMovie(req.body)
   //el .safeparse no enviara un true o false
   if(!result.success){
      return res.status(404).json({error: JSON.parse(result.error.message)})
   }

   //el movies.findIndex devuelve la posicion(indice) del elemento que sea igual al id que buscamos
   //movies es nuestro array lleno de pelicula, dentro de esta le damos una funcion indice donde movie va a ser 
   //cada una de las peliculas que estan dentro de movies y se estaran comprando los indices hasta que uno sea igual o 
   //dara error
   const {id}=req.params
   const movieIndex=movies.findIndex(movie=>movie.id===id)
  
   if(movieIndex===-1){
      return res.status(404).json({message:'Movie not found'})
   }
    
   // los '...' aqui hacen que los 2 json se combinen son indispensables aqui, ya que solo se modifica lo que tenga
   //el json de reult, se maneja con patron llave, valor 
   const updateMovie = {
      ...movies[movieIndex],
      ...result.data
   }

   movies[movieIndex]=updateMovie
   return res.json(updateMovie)
})


const PORT = process.env.PORT ?? 1234

app.listen(PORT ,()=>{
   console.log(`server listen on port http:\\localhost:${PORT}`)
})


/* 
.query:
Se refiere a los parámetros de consulta que se incluyen en la URL después del signo de interrogación ?.
Son utilizados principalmente para filtrar, ordenar o paginar recursos.
Ejemplo: En la URL https://api.example.com/users?name=John&age=30, 
los parámetros de consulta son name y age, y sus valores son John y 30 respectivamente.

.param:
Se refiere a los parámetros de ruta que se incluyen en la propia ruta de la URL.
Son utilizados para identificar recursos específicos.
Ejemplo: En la ruta /users/:userId, userId es un parámetro de ruta que identifica un usuario específico. 
Por ejemplo, /users/123 podría representar el usuario con el ID 123.

.body:
Se refiere al cuerpo de la solicitud HTTP.
Es utilizado para enviar datos adicionales al servidor en solicitudes POST, PUT, etc.
Es comúnmente utilizado para enviar datos estructurados como JSON o XML.
Ejemplo: En una solicitud POST para crear un nuevo usuario, los detalles del usuario, 
como nombre, correo electrónico, etc., se enviarían en el cuerpo de la solicitud. */