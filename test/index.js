const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 8080;

const customerSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    mobilenumber: { type: String, required: true },
    userid: { type: String, required: true },
    full_address: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String },
    district: { type: String },
    area_city: { type: String },
    pincode: { type: String }
});

const delieverSchema = new mongoose.Schema({
    role: { type: String, required: true },
    fullname: { type: String, required: true },
    mobilenumber: { type: String, required: true },
    userid: { type: String, required: true },
    full_address: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String },
    district: { type: String },
    area_city: { type: String },
    pincode: { type: String }
});

mongoose
    .connect('mongodb://127.0.0.1:27017/fru_veg')
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB Connection Error:", err));

const Customer = mongoose.model("customer", customerSchema);
const Deliever = mongoose.model("deliever", delieverSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get('/customer', (req, res) => {
    res.render("customer.ejs");
});

app.get('/deliever', (req, res) => {
    res.render("deliever.ejs");
});

app.post('/deliever', (req, res) => {
    const { role, fullname, mobilenumber, userid, full_address, country, state, district, area_city, pincode } = req.body;

    if (!role || !fullname || !mobilenumber || !userid || !full_address || !country) {
        return res.status(400).send("Missing required fields");
    }

    const newDeliever = new Deliever({
        role,
        fullname,
        mobilenumber,
        userid,
        full_address,
        country,
        state,
        district,
        area_city,
        pincode
    });

    newDeliever
        .save()
        .then(() => res.redirect("/"))
        .catch((err) => {
            console.error("❌ Error saving deliever data:", err);
            res.status(500).send("Server Error");
        });
});

app.post('/customer', (req, res) => {
    const { fullname, mobilenumber, userid, full_address, country, state, district, area_city, pincode } = req.body;

    if (!fullname || !mobilenumber || !userid || !full_address || !country) {
        return res.status(400).send("Missing required fields");
    }

    const newCustomer = new Customer({
        fullname,
        mobilenumber,
        userid,
        full_address,
        country,
        state,
        district,
        area_city,
        pincode
    });

    newCustomer
        .save()
        .then(() => res.redirect("/"))
        .catch((err) => {
            console.error("❌ Error saving customer data:", err);
            res.status(500).send("Server Error");
        });
});

app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
