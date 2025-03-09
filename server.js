const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");
const upload = require("./upload");
const House = require("./models/House");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/api/houses", async (req, res) => {
  try {
    const houses = await House.find().populate("user", "username email");
    res.json(houses);
  } catch (error) {
    res.status(500).json({ error: "Uylarni olishda xatolik" });
  }
});


app.post("/api/houses", authMiddleware, upload.array("attachments", 5), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user found" });
    }

    console.log("Request Body:", req.body); // Req.body ni tekshirib ko'rish uchun

    const {
      name,
      description,
      price,
      salePrice,
      room,
      bath,
      garage,
      area,
      beds,
      yearBuilt,
      address,
      city,
      region,
      country,
      zipCode,
      longitude,
      latitude,
      category
    } = req.body;

    // Ma'lumotlar mavjudligini tekshirish
    if (!name || !description) {
      return res.status(400).json({ message: "Name va Description talab qilinadi" });
    }

    const user = await User.findById(req.user.userId).select("firstname lastname email");
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    const house = new House({
      name,
      description,
      price: price || 0,
      salePrice: salePrice || 0,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      },
      houseDetails: {
        room: room || 0,
        bath: bath || 0,
        garage: garage || 0,
        area: area || 0,
        beds: beds || 0,
        yearBuilt: yearBuilt || new Date().getFullYear()
      },
      location: {
        longitude: longitude || 0,
        latitude: latitude || 0
      },
      address: address || "No Address",
      city: city || "Unknown",
      region: region || "Unknown",
      country: country || "Unknown",
      zipCode: zipCode || "00000",
      attachments: req.files ? req.files.map(file => ({ imgPath: file.path })) : [],
      category: category ? { name: category } : { name: "Uncategorized" }
    });

    await house.save();
    res.json({ message: "House added successfully", house });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "House creation failed", error: error.message });
  }
});


// add Favourite house
app.put('/api/houses/addFavourite/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { favourite } = req.query;

    if (favourite !== "true" && favourite !== "false") {
      return res.status(400).json({ message: "Noto‘g‘ri favourite qiymati" });
    }

    const updatedHouse = await House.findByIdAndUpdate(
      id,
      { favourite: favourite === "true" },
      { new: true }
    );

    if (!updatedHouse) {
      return res.status(404).json({ message: "Uy topilmadi" });
    }

    res.json(updatedHouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Favourite houses list
app.get("/api/houses/favouriteList", async (req, res) => {
  try {
    const favouriteHouses = await House.find({ favourite: true });
    res.json(favouriteHouses);
  } catch (error) {
    console.error("Error fetching favourite houses:", error.message); // Xatoni konsolga chiqarish
    res.status(500).json({ message: "Error fetching favourite houses", error: error.message });
  }
});



// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Register endpoint
const User = require("./models/User"); // User modelini chaqiramiz

app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Agar email allaqachon mavjud bo'lsa, foydalanuvchini ro'yxatdan o'tkazmaymiz
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yangi foydalanuvchini yaratish
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});


// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Userlarni olish
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Parolni olib tashlaymiz
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Foydalanuvchilarni olishda xatolik" });
  }
});

// Id bo'yicha ma'lumot olish
app.get("/api/houses/:id", async (req, res) => {
  try {
    const house = await House.findById(req.params.id).populate("user", "username email");
    if (!house) {
      return res.status(404).json({ error: "Uy topilmadi" });
    }
    res.json(house);
  } catch (error) {
    res.status(500).json({ error: "Uy ma'lumotlarini olishda xatolik" });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));