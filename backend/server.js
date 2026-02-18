import express from "express";
import { searchPages } from "./search/search.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/api/text", (req, res) => {
    try{
        const input = req.body.text;
        console.log("received input: ", input);

        const results = searchPages(input);
        console.log("output", results);
        
        res.json(results);
    } catch(err){
        console.error(err);
        res.status(500).json({error: "server error"});
    }
    
});
app.listen(3000, () => {
    console.log("server running on 3000");
})