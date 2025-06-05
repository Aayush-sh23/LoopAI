

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000; 



app.use(cors());



app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());




app.use('/', apiRoutes);



app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).send('Something broke!'); 
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});