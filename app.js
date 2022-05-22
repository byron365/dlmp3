const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const cors = require('cors');


//Inicializaciones y middlewares
var port = process.env.PORT || '3000';
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());


//Motor de plantillas
app.set('views', './views');
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'layout',
    layoutDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',

}));
app.set('view engine', '.hbs');

//Variables de rutas
const indexRouter = require('./router/index');
const toolsRouter = require('./router/tools');

//Rutas
app.get('/', (req,res)=> res.redirect('/home'));
app.use('/home', indexRouter);
app.use('/tools', toolsRouter);

//Errores
app.get('*', (req,res)=>{
    res.render('404',{error:'404', msg: 'No se encontro la página'})
})

//Iniciando servidor
app.listen(port, ()=>console.log(`Servidor en el puerto ${port}`))