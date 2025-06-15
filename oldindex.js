const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const session = require('express-session');
const { Country, State, City } = require('country-state-city');
const port = 8080;
const env = require('dotenv');
env.config();

let isconfirmed;

app.use(session({
    secret: process.env.secret_key,
    resave: false,
    saveUninitialized: false,
}));

const customerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'signup', required: true },
    fullname: { type: String, required: true },
    mobilenumber: { type: String, required: true },
    userid: { type: String, required: true },
    full_address: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String },
    area_city: { type: String },
    pincode: { type: String }
});

const delieverSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'signup', required: true },
    role: { type: String, required: true },
    fullname: { type: String, required: true },
    mobilenumber: { type: String, required: true },
    userid: { type: String, required: true },
    full_address: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String },
    area_city: { type: String },
    pincode: { type: String }
});

const signupSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    hasCustomerProfile: { type: Boolean, default: false },
    hasDelieverProfile: { type: Boolean, default: false }
});

const loginSchema = new mongoose.Schema({
    identifier: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const priceSchema = new mongoose.Schema({
    delieverId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliever', required: true },
    prices: [
        {
            name: String,
            price: Number
        }
    ],
    updatedAt: { type: Date, default: Date.now }
});

const Price = mongoose.model("price", priceSchema);


mongoose
    .connect('mongodb://127.0.0.1:27017/fru_veg')
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB Connection Error:", err));

const Customer = mongoose.model("customer", customerSchema);
const Deliever = mongoose.model("deliever", delieverSchema);
const signup = mongoose.model("signup", signupSchema);
const login = mongoose.model("login", loginSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

function requireLogin(req, res, next) {
    if (!req.session.user) {
        req.session.redirectTo = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}

app.get('/countries', (req, res) => {
    const countries = Country.getAllCountries();
    res.json(countries);
});

app.get('/states/:countryCode', (req, res) => {
    const states = State.getStatesOfCountry(req.params.countryCode);
    res.json(states);
});

app.get('/cities/:countryCode/:stateCode', (req, res) => {
    const cities = City.getCitiesOfState(req.params.countryCode, req.params.stateCode);
    res.json(cities);
});

app.get('/customer', requireLogin, (req, res) => {
    res.render('customer');
});

app.get('/deliever', requireLogin, (req, res) => {
    res.render('deliever');
});

app.get('/signup', (req, res) => {
    res.render("signup.ejs");
});

app.get('/login', (req, res) => {
    res.render("login.ejs");
});

app.get("/", async (req, res) => {
    let userWithProfile = null;

    if (req.session.user) {
        userWithProfile = await signup.findById(req.session.user.id);
    }

    res.render("index.ejs", {
        session: req.session.user,
        user: userWithProfile,
        isconfirmed
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/my_profile_customer', requireLogin, async (req, res) => {
    try {
        const customer = await Customer.findOne({ userId: req.session.user.id }).populate('userId');
        if (!customer) return res.status(404).send("Customer profile not found");

        res.render('my_profile_customer', { customer });
    } catch (err) {
        console.error("Error fetching customer profile:", err);
        res.status(500).send("Server error");
    }
});

app.get('/my_del_profile' ,requireLogin , async (req,res) => {
    try{
        const deliever = await Deliever.findOne({ userId : req.session.user.id}).populate('userId');
        if(!deliever) return res.status(404).send("Deliever profile not found ");

        res.render('my_del_profile' , {deliever});
    }catch(err){
        console.log("Error fetching customer profile : " , err);
        res.status(500).send("Server error");
    }
})


app.get('/matching-customers', requireLogin, async (req, res) => {
    try {
        const deliever = await Deliever.findOne({ userId: req.session.user.id });

        if (!deliever) {
            return res.status(404).send("Deliever profile not found");
        }

        const { country, state, area_city } = deliever;

        const matchingCustomers = await Customer.find({
            country,
            state,
            area_city
        });

        res.render('matching_customers', { customers: matchingCustomers });
    } catch (error) {
        console.error("Error fetching matching customers:", error);
        res.status(500).send("Server error while matching customers");
    }
});
app.get('/matching-delievers', requireLogin, async (req, res) => {
    try {
        const customer = await Customer.findOne({ userId: req.session.user.id });

        if (!customer) {
            return res.status(404).send("Customer profile not found");
        }

        const { country, state, area_city } = customer;

        const matchingDelievers = await Deliever.find({
            country,
            state,
            area_city
        });

        res.render('matching_delievers', { delievers: matchingDelievers });
    } catch (error) {
        console.error("Error fetching matching delievers:", error);
        res.status(500).send("Server error while matching delievers");
    }
});

app.get('/edit-prices', requireLogin, async (req, res) => {
    try {
        const deliever = await Deliever.findOne({ userId: req.session.user.id });
        if (!deliever) return res.status(404).send("Deliever profile not found");

        let existingPrices = await Price.findOne({ delieverId: deliever._id });
        if (!existingPrices) {
            existingPrices = new Price({ delieverId: deliever._id, prices: [] });
            await existingPrices.save();
        }

        res.render('edit_prices', { priceList: existingPrices.prices });
    } catch (err) {
        console.error("Error loading price list:", err);
        res.status(500).send("Server error");
    }
});

app.get('/deliever/:id/prices', requireLogin, async (req, res) => {
    try {
        const delieverId = req.params.id;

        const deliever = await Deliever.findById(delieverId);
        if (!deliever) return res.status(404).send("Deliever not found");

        const priceData = await Price.findOne({ delieverId });
        const priceList = priceData ? priceData.prices : [];

        res.render('view_price_list', { deliever, priceList });
    } catch (err) {
        console.error("Error loading price list:", err);
        res.status(500).send("Server error");
    }
});





app.post('/signup', async (req, res) => {
    const { fullname, mobile, email, password, confirmpassword } = req.body;

    if (!fullname || !mobile || !email || !password || !confirmpassword) {
        return res.status(400).send("Missing required fields");
    }

    if (password !== confirmpassword) {
        return res.status(400).send("Passwords do not match");
    }

    try {
        const existingUser = await signup.findOne({ mobile });
        if (existingUser) return res.status(400).send("Mobile number already registered");

        const newsignup = new signup({ fullname, mobile, email, password });
        const savedUser = await newsignup.save();

        req.session.user = {
            id: savedUser._id,
            fullname: savedUser.fullname,
            mobile: savedUser.mobile
        };

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving user: " + err);
    }
});

app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).send("Missing login credentials");
    }

    try {
        const query = identifier.includes("@") ? { email: identifier } : { mobile: identifier };
        const user = await signup.findOne(query);

        if (!user) return res.status(401).send("User not found");
        if (user.password !== password) return res.status(401).send("Incorrect password");

        req.session.user = {
            id: user._id,
            fullname: user.fullname,
            mobile: user.mobile
        };

        await new login({ identifier }).save();

        const redirectTo = req.session.redirectTo || '/';
        delete req.session.redirectTo;
        res.redirect(redirectTo);
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Server error during login");
    }
});

app.post('/customer', requireLogin, async (req, res) => {
    const { fullname,mobilenumber , userid , full_address, country, state, area_city, pincode } = req.body;

    if (!full_address || !country) {
        return res.status(400).send("Missing required fields");
    }

    try {
        const userId = req.session.user.id;

        const existingProfile = await Customer.findOne({ userId });
        if (existingProfile) return res.status(400).send("Customer profile already exists");

        const newCustomer = new Customer({
            userId,
            fullname,
            mobilenumber,
            userid,
            full_address,
            country,
            state,
            area_city,
            pincode
        });

        await newCustomer.save();
        await signup.findByIdAndUpdate(userId, { hasCustomerProfile: true });

        isconfirmed = true;
        res.redirect('/');
    } catch (err) {
        console.error("❌ Error saving customer data:", err);
        res.status(500).send("Server Error");
    }
});

app.post('/deliever', requireLogin, async (req, res) => {
    const { role,fullname, mobilenumber,userid, full_address, country, state, area_city, pincode } = req.body;

    if (!role || !full_address || !country) {
        return res.status(400).send("Missing required fields");
    }

    try {
        const userId = req.session.user.id;

        const existingProfile = await Deliever.findOne({ userId });
        if (existingProfile) return res.status(400).send("Deliever profile already exists");

        const newDeliever = new Deliever({
            userId,
            role,
            fullname,
            mobilenumber,
            userid,
            full_address,
            country,
            state,
            area_city,
            pincode
        });

        await newDeliever.save();
        await signup.findByIdAndUpdate(userId, { hasDelieverProfile: true });

        res.redirect('/');
    } catch (err) {
        console.error("❌ Error saving deliever data:", err);
        res.status(500).send("Server Error");
    }
});

app.post('/edit-prices', requireLogin, async (req, res) => {
    try {
        const deliever = await Deliever.findOne({ userId: req.session.user.id });
        if (!deliever) return res.status(404).send("Deliever profile not found");

        const { names, prices } = req.body;

        const priceEntries = Array.isArray(names)
            ? names.map((name, i) => ({ name, price: parseFloat(prices[i]) }))
            : [{ name: names, price: parseFloat(prices) }];

        await Price.findOneAndUpdate(
            { delieverId: deliever._id },
            { prices: priceEntries, updatedAt: new Date() },
            { new: true }
        );

        res.redirect('/edit-prices');
    } catch (err) {
        console.error("Error saving price list:", err);
        res.status(500).send("Server error");
    }
});


app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
