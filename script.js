// Ask permission for notifications
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

/* ---------------- LOGIN / SIGNUP ---------------- */

function showSignup(){
document.getElementById("loginForm").style.display="none"
document.getElementById("signupForm").style.display="block"
document.getElementById("formTitle").innerText="Sign Up"
}

function showLogin(){
document.getElementById("signupForm").style.display="none"
document.getElementById("loginForm").style.display="block"
document.getElementById("formTitle").innerText="Login"
}

// LOGIN

async function loginUser(){

const email=document.getElementById("email").value
const password=document.getElementById("password").value

try{

const res=await fetch("http://localhost:5000/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({email,password})
})

const data=await res.json()

if(data.message==="Login successful"){
window.location.href="dashboard.html"
}else{
alert("Invalid credentials")
}

}catch(err){
console.log(err)
alert("Server error")
}

}

// SIGNUP

async function signupUser(){

const name=document.getElementById("name").value
const email=document.getElementById("signupEmail").value
const password=document.getElementById("signupPassword").value

try{

const res=await fetch("http://localhost:5000/signup",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({name,email,password})
})

const data=await res.json()

alert(data.message)

if(data.message==="Account created successfully"){
showLogin()
}

}catch(error){
console.log(error)
alert("Signup failed")
}

}

/* ---------------- REMINDERS ---------------- */

async function createReminder(){

const title=document.getElementById("title").value
const description=document.getElementById("description").value
const date=document.getElementById("date").value
const time=document.getElementById("time").value

try{

const res=await fetch("http://localhost:5000/reminder",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({title,description,date,time})
})

const data=await res.json()

alert(data.message)

}catch(error){
console.log(error)
alert("Error creating reminder")
}

}

/* ---------------- LOAD REMINDERS ---------------- */

async function loadReminders(){

try{

const res=await fetch("http://localhost:5000/reminders")
const reminders=await res.json()

const container=document.getElementById("reminderList")

if(!container) return

container.innerHTML=""

reminders.forEach(r=>{

container.innerHTML+=`

<div class="reminder-card">

<h5 ${r.status==="completed" ? 'style="text-decoration:line-through;color:gray"' : ""}>
${r.title}
</h5>

<p>${r.description}</p>

<small>${r.date} ${r.time}</small>

<br>

<button onclick="completeReminder('${r._id}')" 
class="btn btn-success btn-sm mt-2">
✔ Complete
</button>

<button onclick="deleteReminder('${r._id}')" 
class="btn btn-danger btn-sm mt-2">
Delete
</button>

</div>

`

})

}catch(error){

console.log("Load reminder error:",error)

}

}

/* ---------------- DELETE ---------------- */

async function deleteReminder(id){

try{

await fetch("http://localhost:5000/reminder/"+id,{
method:"DELETE"
})

loadReminders()

}catch(error){

console.log(error)
alert("Delete failed")

}

}

/* ---------------- COMPLETE ---------------- */

async function completeReminder(id){

try{

await fetch("http://localhost:5000/reminder/complete/"+id,{
method:"PUT"
})

alert("Reminder completed")

loadReminders()

}catch(error){

console.log(error)
alert("Error completing reminder")

}

}

/* ---------------- CLOCK ---------------- */

function updateClock(){

const clock=document.getElementById("clock")

if(!clock) return

const now=new Date()

const h=now.getHours()
const m=now.getMinutes().toString().padStart(2,"0")
const s=now.getSeconds().toString().padStart(2,"0")

clock.innerText=h+":"+m+":"+s

}

setInterval(updateClock,1000)

/* ---------------- GREETING ---------------- */

function updateGreeting(){

const g=document.getElementById("greeting")

if(!g) return

const hour=new Date().getHours()

let greeting=""

if(hour<12){
greeting="Good Morning ☀"
}
else if(hour<18){
greeting="Good Afternoon 🌤"
}
else{
greeting="Good Evening 🌙"
}

g.innerText=greeting

}

updateGreeting()

/* ---------------- SEARCH ---------------- */

function searchReminders(){

const input=document.getElementById("searchReminder").value.toLowerCase()

const cards=document.querySelectorAll(".reminder-card")

cards.forEach(card=>{

const text=card.innerText.toLowerCase()

card.style.display=text.includes(input) ? "block" : "none"

})

}

/* ---------------- NOTIFICATION ---------------- */

async function checkReminderNotifications(){

try{

const res=await fetch("http://localhost:5000/reminders")
const reminders=await res.json()

const now=new Date()

const currentDate=now.toISOString().split("T")[0]

const hours=now.getHours().toString().padStart(2,"0")
const minutes=now.getMinutes().toString().padStart(2,"0")

const currentTime=hours+":"+minutes

reminders.forEach(r=>{

if(r.date===currentDate && r.time===currentTime){

if(Notification.permission==="granted"){
new Notification("Reminder: "+r.title,{
body:r.description
})
}

}

})

}catch(error){

console.log("Notification error:",error)

}

}

setInterval(checkReminderNotifications,60000)