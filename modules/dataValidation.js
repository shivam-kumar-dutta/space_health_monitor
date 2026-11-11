function validateData(astronaut) {

    let errors = [];

    // Checking astronaut ID
    if (typeof astronaut.astronautId !== "string") {
        errors.push("Invalid astronaut ID");
    }

    // Checking heart rate
    if (typeof astronaut.heartRate !== "number") {
        errors.push("Heart rate must be a number");
    }

    // Checking SpO2
    if (typeof astronaut.spo2 !== "number") {
        errors.push("SpO2 must be a number");
    }

    // Checking temperature
    if (typeof astronaut.temperature !== "number") {
        errors.push("Temperature must be a number");
    }

    // Checking sleep hours
    if (typeof astronaut.sleepHours !== "number") {
        errors.push("Sleep hours must be a number");
    }

    return errors;
}

module.exports = validateData;