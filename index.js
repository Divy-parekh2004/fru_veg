const express = require('express');
const app = express();
const path = require('path');
const port = 8080 ; 

app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname , 'views'));
app.use(express.static(path.join(__dirname , 'public')));

app.get("/" , (req , res) => {
    res.render("index.ejs");
});

app.get('/customer', (req, res) => {
    res.render("customer.ejs");  // Render the customer.ejs page
  });

app.listen(port , () => {
    console.log(`listening on port ${port}`);
})