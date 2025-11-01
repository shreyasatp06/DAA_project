let subjects = [];

function addSubject() {
  const name = document.getElementById("subject").value.trim();
  const time = parseFloat(document.getElementById("time").value);
  const imp = parseFloat(document.getElementById("importance").value);
  const diff = parseFloat(document.getElementById("difficulty").value);

  if (!name || isNaN(time) || isNaN(imp) || isNaN(diff)) {
    alert("⚠️ Please fill all fields correctly!");
    return;
  }
  if (imp < 0 || imp > 10) {
    alert("⚠️ Importance must be between 0 and 10.");
    return;
  }
  if (diff < 1 || diff > 5) {
    alert("⚠️ Difficulty must be between 1 and 5.");
    return;
  }

  const ratio = imp / time;
  subjects.push({ name, time, imp, diff, ratio });
  document.getElementById("subject").value = '';
  document.getElementById("time").value = '';
  document.getElementById("importance").value = '';
  document.getElementById("difficulty").value = '';
  updateTable();
}

function updateTable() {
  const tbody = document.querySelector("#subjectTable tbody");
  tbody.innerHTML = '';
  subjects.forEach(s => {
    tbody.innerHTML += `<tr>
      <td>${s.name}</td>
      <td>${s.time}</td>
      <td>${s.imp}</td>
      <td>${s.diff}</td>
      <td>${s.ratio.toFixed(2)}</td>
    </tr>`;
  });
}

function generatePlan() {
  const total = parseFloat(document.getElementById("totalHours").value);
  const mode = document.getElementById("mode").value;

  if (!total || total <= 0) return alert("⚠️ Enter valid total available hours!");
  if (subjects.length === 0) return alert("⚠️ Add at least one subject!");

  if (mode === "01knapsack") {
    const result = zeroOneKnapsack(subjects, total);
    displayZeroOneResult(result);
    return;
  }

  // Fractional Knapsack
  let items = JSON.parse(JSON.stringify(subjects));

  switch (mode) {
    case "importance":
      items.sort((a, b) => b.imp - a.imp);
      break;
    case "time":
      items.sort((a, b) => a.time - b.time);
      break;
    case "ratio":
      items.sort((a, b) => b.ratio - a.ratio);
      break;
    case "difficulty":
      items.sort((a, b) => a.diff - b.diff); // Easier topics first
      break;
  }

  let remaining = total;
  let totalImportance = 0;
  let totalTime = 0;
  let plan = [];

  for (let i = 0; i < items.length && remaining > 0; i++) {
    if (items[i].time <= remaining) {
      plan.push({ ...items[i], fraction: 1 });
      remaining -= items[i].time;
      totalImportance += items[i].imp;
      totalTime += items[i].time;
    } else {
      let frac = remaining / items[i].time;
      plan.push({ ...items[i], fraction: frac });
      totalImportance += items[i].imp * frac;
      totalTime += items[i].time * frac;
      remaining = 0;
    }
  }

  displayResult(mode, plan, totalImportance, totalTime);
}

function displayResult(mode, plan, totalImportance, totalTime) {
  let titles = {
    importance: "Greedy: Maximize Importance",
    time: "Greedy: Minimize Time",
    ratio: "Greedy: Best Importance/Time Ratio",
    difficulty: "Greedy: Based on Difficulty Level"
  };

  let html = `<h3>${titles[mode]}</h3>
    <p><b>Total Importance Gained:</b> ${totalImportance.toFixed(2)}</p>
    <p><b>Total Time Used:</b> ${totalTime.toFixed(2)} hrs</p>`;

  html += `<table>
    <tr><th>Subject</th><th>Time Used</th><th>Fraction Used</th><th>Importance Gained</th></tr>`;

  plan.forEach(p => {
    html += `<tr>
      <td>${p.name}</td>
      <td>${(p.time * p.fraction).toFixed(2)}</td>
      <td>${(p.fraction * 100).toFixed(1)}%</td>
      <td>${(p.imp * p.fraction).toFixed(2)}</td>
    </tr>`;
  });

  html += `</table>`;
  document.getElementById("result").innerHTML = html;
}

// -------------------- 0/1 Knapsack (Backtracking) --------------------
function zeroOneKnapsack(items, capacity) {
  let bestValue = 0;
  let bestSet = [];

  function helper(i, currentValue, currentTime, currentSet) {
    if (i === items.length) {
      if (currentValue > bestValue) {
        bestValue = currentValue;
        bestSet = [...currentSet];
      }
      return;
    }

    if (currentTime + items[i].time <= capacity) {
      currentSet.push(items[i]);
      helper(
        i + 1,
        currentValue + items[i].imp,
        currentTime + items[i].time,
        currentSet
      );
      currentSet.pop();
    }

    helper(i + 1, currentValue, currentTime, currentSet);
  }

  helper(0, 0, 0, []);
  return { bestValue, items: bestSet };
}

function displayZeroOneResult(result) {
  let { bestValue, items } = result;
  let totalTime = items.reduce((sum, s) => sum + s.time, 0);

  let html = `<h3>Backtracking (0/1 Knapsack)</h3>
    <p><b>Total Importance Gained:</b> ${bestValue.toFixed(2)}</p>
    <p><b>Total Time Used:</b> ${totalTime.toFixed(2)} hrs</p>`;

  html += `<table>
    <tr><th>Subject</th><th>Time</th><th>Importance</th><th>Difficulty</th></tr>`;
  items.forEach(p => {
    html += `<tr>
      <td>${p.name}</td>
      <td>${p.time}</td>
      <td>${p.imp}</td>
      <td>${p.diff}</td>
    </tr>`;
  });

  html += `</table>`;
  document.getElementById("result").innerHTML = html;
}
