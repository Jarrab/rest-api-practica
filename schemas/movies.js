   
   const z = require('zod')
   //zod ignora los elementos que no esta validando el, es decir si en el post se pone un id no la va a 
   // tomar la ignora
   //en esta constante haremos toda la validacion con zod
   const movieSchema = z.object({
    title:z.string({
       invalid_type_error: 'movie tittle must be a string',
       required_error:'movie tittle be required'
    }),
    //con zod las validaciones se pueden 'concatenar'
    year:z.number().int().min(1900).max(2024),
    director:z.string(),
    duration:z.number().int().positive(),
    rate:z.number().min(0).max(10).default(5),
    poster:z.string().url({
       message: "poster must be a valid url"
    }),
    //con el gender hay que decirle que es tipo array, y mencionales los tipos, porque si no 
    //seria un array indefinido y podrian escribir lo que sea
    gender:z.array(
       //aqui adentro del arraya se puede poner lo que queremos que pueda ponerse
       z.string(['Action','Adventure','Comedy','Drama','Fantasy','Horro','Thriller','Sci-Fi']),
       //esto se puede poner alrevez igual z.number(['fantasia']).array()
       {
          required: 'movie gender is required',
          invalid_type_error:'movie  genre must be an array of enum genre'
       }
    )
 })

 function validateMovie(object){
    return movieSchema.safeParse(object)
 }

 function validatePartialMovie(object){  
   return movieSchema.partial().safeParse(object)
   /*el partial hace que todas las opciones de validacion que son necesaria
    no sean tan necesarias es decir que si le pasamos solo el genero y no 
    lo demas va a seguir con la validacion del genero, sin importar lo demas*/ 
 }

 module.exports={
    validateMovie,
    validatePartialMovie
 }