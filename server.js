const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const nodemailer = require("nodemailer")
const { ObjectId } = require("mongodb")

const app = express()

app.use(cors())
app.use(express.json())

// ---------------- DATABASE ----------------

mongoose.connect("mongodb://localhost:27017/project_webathon")

const db = mongoose.connection

db.once("open", ()=>{
console.log("MongoDB Connected")
})

db.on("error",(err)=>{
console.log(err)
})


// ---------------- EMAIL SETUP ----------------

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: "chandrashekahrazad022@gmail.com",
pass: "myfwzmchbsahkroa"
}
})


// ---------------- TEST ROUTE ----------------

app.get("/",(req,res)=>{
res.send("Server running successfully")
})


// ---------------- LOGIN ----------------

app.post("/login", async (req,res)=>{

try{

const {email,password} = req.body

const user = await db.collection("users")
.findOne({email,password})

if(user){
res.json({message:"Login successful"})
}else{
res.json({message:"Invalid email or password"})
}

}catch(err){

console.log(err)
res.status(500).json({message:"Server error"})

}

})


// ---------------- SIGNUP ----------------

app.post("/signup", async (req,res)=>{

try{

const {name,email,password} = req.body

await db.collection("users")
.insertOne({name,email,password})

res.json({message:"Account created successfully"})

}catch(err){

console.log(err)
res.status(500).json({message:"Signup error"})

}

})


// ---------------- CREATE REMINDER + EMAIL ----------------

app.post("/reminder", async (req,res)=>{

try{

const {title,description,date,time} = req.body

console.log("Reminder API triggered")

await db.collection("reminders").insertOne({
title,
description,
date,
time,
status:"pending"
})

console.log("Reminder saved in database")

// EMAIL CONTENT

const mailOptions = {
from: "chandrashekahrazad022@gmail.com",
to: "chandrashekahrazad022@gmail.com",
subject: "New Reminder Created",
text: `Reminder: ${title}

Description: ${description}

Date: ${date}

Time: ${time}`
}

// SEND EMAIL

console.log("Sending email...")

transporter.sendMail(mailOptions,(error,info)=>{

if(error){
console.log("Email error:",error)
}else{
console.log("Email sent:",info.response)
}

})

res.json({message:"Reminder created successfully"})

}catch(err){

console.log(err)
res.status(500).json({message:"Server error"})

}

})


// ---------------- GET REMINDERS ----------------

app.get("/reminders", async (req,res)=>{

try{

const reminders = await db.collection("reminders")
.find()
.toArray()

res.json(reminders)

}catch(err){

console.log(err)
res.status(500).json({message:"Error loading reminders"})

}

})


// ---------------- DELETE REMINDER ----------------

app.delete("/reminder/:id", async (req,res)=>{

try{

await db.collection("reminders")
.deleteOne({_id:new ObjectId(req.params.id)})

res.json({message:"Reminder deleted"})

}catch(err){

console.log(err)
res.status(500).json({message:"Delete error"})

}

})


// ---------------- COMPLETE REMINDER ----------------

app.put("/reminder/complete/:id", async (req,res)=>{

try{

await db.collection("reminders")
.updateOne(
{_id:new ObjectId(req.params.id)},
{$set:{status:"completed"}}
)

res.json({message:"Reminder completed"})

}catch(err){

console.log(err)
res.status(500).json({message:"Complete error"})

}

})


// ---------------- START SERVER ----------------

app.listen(5000,()=>{
console.log("Server started on port 5000")
})