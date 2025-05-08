import app from "./app.js";
import connectDb from "./lib/connectDb.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectDb()
    .then(() => {
      console.log(`Server running on port ${PORT}`);
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err);
    });
});
