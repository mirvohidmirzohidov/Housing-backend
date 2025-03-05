const mongoose = require("mongoose");
const House = require("./models/House");

// MongoDB ga ulan
mongoose.connect("mongodb://localhost:27017/houzing", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function addFavouriteField() {
  try {
    const result = await House.updateMany({}, { $set: { favourite: false } });
    console.log(`${result.modifiedCount} ta uylarga 'favourite' qo‘shildi.`);
  } catch (error) {
    console.error("Xatolik:", error);
  } finally {
    mongoose.connection.close(); // Ulanishni yopish
  }
}

addFavouriteField();