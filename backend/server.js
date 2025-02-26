// package.json - type = "module" - allows for import syntax
import express from "express"

const app = express();

app.listen(5000, () => {
    console.log("Server running on port 5000")
})