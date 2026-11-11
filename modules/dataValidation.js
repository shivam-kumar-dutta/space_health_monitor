function validateData(astronaut) {

    let errors = [];

    // Checking astronaut ID
    if (
    typeof astronaut.astronautId !== "string" ||
    astronaut.astronautId.trim() === ""
) {
    errors.push("Invalid astronaut ID");
}
    // Checking heart rate
    
if (astronaut.heartRate === undefined) {

    errors.push("Heart rate information is missing");

}

else if (astronaut.heartRate === null) {

    errors.push("Heart rate measurement is unavailable");

}

else if (!Number.isFinite(astronaut.heartRate)) {
    errors.push("Heart rate must be a valid finite number");
}

 // checking spo2
if (astronaut.spo2 === undefined) {

    errors.push("SpO2 information is missing");

}

else if (astronaut.spo2 === null) {

    errors.push("SpO2 measurement is unavailable");

}

else if (!Number.isFinite(astronaut.spo2)) {
    errors.push("SpO2 must be a valid finite number");
}
// Checking temperature

if (astronaut.temperature === undefined) {

    errors.push("Temperature information is missing");

}

else if (astronaut.temperature === null) {

    errors.push("Temperature measurement is unavailable");

}

else if (!Number.isFinite(astronaut.temperature)) {
    errors.push("Temperature must be a valid finite number");
}
// Checking sleep hours

if (astronaut.sleepHours === undefined) {

    errors.push("Sleep hours information is missing");

}

else if (astronaut.sleepHours === null) {

    errors.push("Sleep hours measurement is unavailable");

}

else if (!Number.isFinite(astronaut.sleepHours)) {
    errors.push("Sleep hours must be a valid finite number");
}
 

// Checking input ranges

else if (
    astronaut.heartRate < 1 ||
    astronaut.heartRate > 250
) {
    errors.push("Heart rate is outside the accepted input range");
}

if (
    astronaut.spo2 < 0 ||
    astronaut.spo2 > 100
) {
    errors.push("SpO2 is outside the accepted input range");
}

if (
    astronaut.temperature < 0 ||
    astronaut.temperature > 50
) {
    errors.push("Temperature is outside the accepted input range");
}

if (
    astronaut.sleepHours < 0 ||
    astronaut.sleepHours > 24
) {
    errors.push("Sleep hours is outside the accepted input range");
}
    return errors;
}
module.exports = validateData;