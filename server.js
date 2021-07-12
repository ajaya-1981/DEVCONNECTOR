const express = require('express');
const connectMongoDB = require('./config/db');
const app = express();

//connect Database

connectMongoDB();

//Init Middleware
app.use(express.json({extended : false}));

app.get('/', (req, res) => {
  res.send('API Running for Testing');
});

app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
