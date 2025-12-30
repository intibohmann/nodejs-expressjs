const express = require('express');
const mysql = require('mysql');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const app = express();
const port = 3000;

// Configuração do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL');
});

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Rota para a página inicial
app.get('/', (req, res) => {
    const query = 'SELECT * FROM posts ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.render('index', { posts: results });
    });
});

// Rota para criar um novo post (formulário)
app.get('/create', (req, res) => {
    res.render('create');
});

// Rota para salvar novo post (com sanitização)
app.post('/save', (req, res) => {
    const { title, content } = req.body;
    const sanitizedContent = sanitizeHtml(content, {
        allowedTags: [ 'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'li', 'blockquote', 'code', 'pre', 'a', 'img' ],
        allowedAttributes: {
            'a': [ 'href', 'target' ],
            'img': [ 'src', 'alt', 'width', 'height' ]
        }
    });
    const query = 'INSERT INTO posts (title, content) VALUES (?, ?)';
    db.query(query, [title, sanitizedContent], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Rota para exibir um post
app.get('/post/:id', (req, res) => {
    const query = 'SELECT * FROM posts WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) throw err;
        res.render('post', { post: results[0] });
    });
});

// Rota para exibir o formulário de edição
app.get('/edit/:id', (req, res) => {
    const query = 'SELECT * FROM posts WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) throw err;
        res.render('edit', { post: results[0] });
    });
});

// Rota para atualizar o post (com sanitização)
app.post('/update/:id', (req, res) => {
    const { title, content } = req.body;
    const sanitizedContent = sanitizeHtml(content, {
        allowedTags: [ 'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'li', 'blockquote', 'code', 'pre', 'a', 'img' ],
        allowedAttributes: {
            'a': [ 'href', 'target' ],
            'img': [ 'src', 'alt', 'width', 'height' ]
        }
    });
    const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
    db.query(query, [title, sanitizedContent, req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Rota para excluir um post (via POST)
app.post('/delete/:id', (req, res) => {
    const query = 'DELETE FROM posts WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});