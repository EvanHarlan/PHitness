let caloriesEaten = 0;
let calorieTarget = 0;

function getElementValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : null;
}

function validateInput(name, calories) {
    if (!name) {
        alert("Please enter a valid name.");
        return false;
    }
    if (isNaN(calories) || calories <= 0) {
        alert("Please enter a positive number for calories.");
        return false;
    }
    return true;
}

function addEntry(name, calories, listId, type) {
    const list = document.getElementById(listId);
    if (!list) return;

    const entry = document.createElement("li");
    entry.textContent = `${name} (${calories} calories)`;
    list.appendChild(entry);

    if (type === "meal") {
        caloriesEaten += calories;
    updateCalories();
}

export function addMeal() {
    const mealName = getElementValue("meal-name");
    const mealCalories = Number(getElementValue("meal-calories"));

    if (validateInput(mealName, mealCalories)) {
        addEntry(mealName, mealCalories, "meal-list", "meal");
    }
}

export function updateCalories() {
    const targetInput = document.getElementById("calorie-target");
    if (targetInput) {
        calorieTarget = Number(targetInput.value) || 0;
    }

    const caloriesRemaining = calorieTarget - caloriesEaten + caloriesBurned;

    document.getElementById("calories-eaten")?.textContent = caloriesEaten;
    document.getElementById("calories-remaining")?.textContent = caloriesRemaining;
}