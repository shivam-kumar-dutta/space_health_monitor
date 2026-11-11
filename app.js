const validateData = require("./modules/dataValidator");
// Importing the file system module
const fs = require("fs");

// Reading the JSON file
const data = fs.readFileSync("data/astronaut.json", "utf8");

// Converting JSON into JavaScript object
const astronaut = JSON.parse(data);
const errors = validateData(astronaut);

if (errors.length > 0) {
    console.log("\nDATA VALIDATION FAILED");
    errors.forEach(function(error) {
        console.log(error);
    });
} else {
    console.log("\nDATA VALIDATION SUCCESSFUL");
}


// Displaying astronaut information

console.log("================================");
console.log("   ASTRONAUT HEALTH MONITOR");
console.log("================================");

console.log("Astronaut ID:", astronaut.astronautId);

console.log("Heart Rate:", astronaut.heartRate, "bpm");

console.log("SpO2:", astronaut.spo2, "%");

console.log("Temperature:", astronaut.temperature, "°C");

console.log("Sleep Hours:", astronaut.sleepHours);


// Health monitoring

console.log("\n========== HEALTH REPORT ==========");


// Heart rate monitoring

if (astronaut.heartRate === null || astronaut.heartRate === undefined) {

    console.log("Heart-rate measurement unavailable.");

}

else if (astronaut.heartRate > 100) {

    console.log("ALERT: High heart rate detected!");

}

else {

    console.log("Heart rate: Normal.");

}


// Sleep monitoring

if (astronaut.sleepHours === null || astronaut.sleepHours === undefined) {

    console.log("Sleep measurement unavailable.");

}

else if (astronaut.sleepHours < 6) {

    console.log("ALERT: Insufficient sleep detected!");

}

else {

    console.log("Sleep duration: Normal.");

}

console.log("================================");