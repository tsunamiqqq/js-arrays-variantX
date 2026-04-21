const students = [
  { id: 1, name: "Іван", age: 18, gpa: 82, faculty: "ІПЗ" },
  { id: 2, name: "Марія", age: 19, gpa: 95, faculty: "КН" },
  { id: 3, name: "Олег", age: 20, gpa: 74, faculty: "ІПЗ" },
  { id: 4, name: "Анна", age: 18, gpa: 91, faculty: "КІ" },
  { id: 5, name: "Софія", age: 21, gpa: 88, faculty: "КН" },
  { id: 6, name: "Максим", age: 22, gpa: 69, faculty: "КІ" },
  { id: 7, name: "Дмитро", age: 19, gpa: 78, faculty: "ІПЗ" },
  { id: 8, name: "Катерина", age: 20, gpa: 97, faculty: "КН" }
];

let displayedStudents = [...students];
let editingId = null;

const formMessage = document.getElementById("formMessage");

function showMessage(text, isError = false) {
  formMessage.textContent = text;
  formMessage.style.color = isError ? "#dc2626" : "#16a34a";
}

function getNextId() {
  return students.length ? Math.max(...students.map(student => student.id)) + 1 : 1;
}

function validateStudent(name, age, gpa, faculty) {
  if (!name.trim()) return "Ім'я не може бути порожнім";
  if (!faculty.trim()) return "Факультет не може бути порожнім";
  if (!Number.isInteger(age) || age < 15 || age > 100) return "Вік має бути цілим числом від 15 до 100";
  if (Number.isNaN(gpa) || gpa < 0 || gpa > 100) return "GPA має бути в межах від 0 до 100";
  return "";
}

function saveStudent() {
  const name = document.getElementById("name").value.trim();
  const age = Number(document.getElementById("age").value);
  const gpa = Number(document.getElementById("gpa").value);
  const faculty = document.getElementById("faculty").value.trim();

  const error = validateStudent(name, age, gpa, faculty);

  if (error) {
    showMessage(error, true);
    return;
  }

  if (editingId === null) {
    students.push({
      id: getNextId(),
      name,
      age,
      gpa,
      faculty
    });
    showMessage("Студента успішно додано");
  } else {
    const student = students.find(item => item.id === editingId);
    if (student) {
      student.name = name;
      student.age = age;
      student.gpa = gpa;
      student.faculty = faculty;
      showMessage("Дані студента оновлено");
    }
  }

  editingId = null;
  resetForm(false);
  applyFiltersAndSort();
}

function resetForm(clearMessage = true) {
  document.getElementById("name").value = "";
  document.getElementById("age").value = "";
  document.getElementById("gpa").value = "";
  document.getElementById("faculty").value = "";
  editingId = null;
  if (clearMessage) formMessage.textContent = "";
}

function editStudent(id) {
  const student = students.find(item => item.id === id);
  if (!student) return;

  document.getElementById("name").value = student.name;
  document.getElementById("age").value = student.age;
  document.getElementById("gpa").value = student.gpa;
  document.getElementById("faculty").value = student.faculty;
  editingId = id;
  showMessage("Режим редагування студента");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteStudent(id) {
  const index = students.findIndex(item => item.id === id);
  if (index !== -1) {
    students.splice(index, 1);
    applyFiltersAndSort();
  }
}

function compareStringsUk(a, b) {
  return a.localeCompare(b, "uk");
}

function sortStudents(arr, field, order) {
  const copied = [...arr];

  copied.sort((a, b) => {
    let mainResult = 0;

    if (field === "name") {
      mainResult = compareStringsUk(a.name, b.name);
    } else if (field === "age") {
      mainResult = a.age - b.age;
    } else if (field === "gpa") {
      mainResult = a.gpa - b.gpa;
    }

    if (mainResult !== 0) {
      return order === "asc" ? mainResult : -mainResult;
    }

    const nameResult = compareStringsUk(a.name, b.name);
    if (nameResult !== 0) {
      return nameResult;
    }

    return a.id - b.id;
  });

  return copied;
}

function applyFiltersAndSort() {
  const faculty = document.getElementById("filterFaculty").value;
  const minGpaInput = document.getElementById("minGpa").value;
  const minGpa = minGpaInput === "" ? 0 : Number(minGpaInput);
  const sortField = document.getElementById("sortField").value;
  const sortOrder = document.getElementById("sortOrder").value;

  let filtered = [...students];

  if (faculty) {
    filtered = filtered.filter(student => student.faculty === faculty);
  }

  if (!Number.isNaN(minGpa)) {
    filtered = filtered.filter(student => student.gpa >= minGpa);
  }

  displayedStudents = sortStudents(filtered, sortField, sortOrder);

  renderStudents();
  renderStats();
  renderFacultyOptions();
}

function resetFilters() {
  document.getElementById("filterFaculty").value = "";
  document.getElementById("minGpa").value = "";
  document.getElementById("sortField").value = "gpa";
  document.getElementById("sortOrder").value = "asc";
  applyFiltersAndSort();
}

function renderStudents() {
  const tableContainer = document.getElementById("studentsTable");

  if (!displayedStudents.length) {
    tableContainer.innerHTML = "<p>Немає студентів для відображення.</p>";
    return;
  }

  tableContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Ім'я</th>
          <th>Вік</th>
          <th>GPA</th>
          <th>Факультет</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        ${displayedStudents.map(student => `
          <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.gpa}</td>
            <td>${student.faculty}</td>
            <td>
              <div class="actions">
                <button class="btn-secondary" onclick="editStudent(${student.id})">Редагувати</button>
                <button class="btn-danger" onclick="deleteStudent(${student.id})">Видалити</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderStats() {
  const statsBlock = document.getElementById("statsBlock");

  if (!displayedStudents.length) {
    statsBlock.innerHTML = "<p>Немає даних для статистики.</p>";
    return;
  }

  const count = displayedStudents.length;
  const averageGpa = (
    displayedStudents.reduce((sum, student) => sum + student.gpa, 0) / count
  ).toFixed(2);

  const top3 = [...displayedStudents]
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 3)
    .map(student => `${student.name} (${student.gpa})`)
    .join(", ");

  const facultyDistribution = displayedStudents.reduce((acc, student) => {
    acc[student.faculty] = (acc[student.faculty] || 0) + 1;
    return acc;
  }, {});

  statsBlock.innerHTML = `
    <div class="stat-box">
      <h3>Кількість студентів</h3>
      <p>${count}</p>
    </div>
    <div class="stat-box">
      <h3>Середній GPA</h3>
      <p>${averageGpa}</p>
    </div>
    <div class="stat-box">
      <h3>Топ-3 студенти</h3>
      <p>${top3}</p>
    </div>
    <div class="stat-box">
      <h3>Розподіл по факультетах</h3>
      <p>
        ${Object.entries(facultyDistribution)
          .map(([faculty, qty]) => `${faculty}: ${qty}`)
          .join("<br>")}
      </p>
    </div>
  `;
}

function renderFacultyOptions() {
  const facultySelect = document.getElementById("filterFaculty");
  const currentValue = facultySelect.value;

  const faculties = [...new Set(students.map(student => student.faculty))];

  facultySelect.innerHTML = `
    <option value="">Усі факультети</option>
    ${faculties.map(faculty => `<option value="${faculty}">${faculty}</option>`).join("")}
  `;

  facultySelect.value = faculties.includes(currentValue) ? currentValue : "";
}

function compareValues(a, b, order) {
  return order === "asc" ? a > b : a < b;
}

function bubbleSort(arr, order = "asc") {
  const result = [...arr];
  let comparisons = 0;

  for (let i = 0; i < result.length - 1; i++) {
    for (let j = 0; j < result.length - 1 - i; j++) {
      comparisons++;
      if (compareValues(result[j], result[j + 1], order)) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }

  return { sortedArray: result, comparisons };
}

function quickSort(arr, order = "asc") {
  let comparisons = 0;

  function sortRecursive(array) {
    if (array.length <= 1) return [...array];

    const pivot = array[array.length - 1];
    const left = [];
    const right = [];

    for (let i = 0; i < array.length - 1; i++) {
      comparisons++;
      const current = array[i];

      if (order === "asc") {
        if (current < pivot) left.push(current);
        else right.push(current);
      } else {
        if (current > pivot) left.push(current);
        else right.push(current);
      }
    }

    return [...sortRecursive(left), pivot, ...sortRecursive(right)];
  }

  return {
    sortedArray: sortRecursive(arr),
    comparisons
  };
}

function parseNumberArray(input) {
  if (!input.trim()) return [];

  const parts = input.split(",").map(item => item.trim());
  const numbers = [];

  for (const part of parts) {
    const value = Number(part);
    if (Number.isNaN(value)) return null;
    numbers.push(value);
  }

  return numbers;
}

function runCustomSorts() {
  const input = document.getElementById("customArray").value;
  const order = document.getElementById("algoOrder").value;
  const resultBlock = document.getElementById("sortResults");
  const numbers = parseNumberArray(input);

  if (numbers === null) {
    resultBlock.textContent = "Помилка: введіть тільки числа через кому.";
    return;
  }

  if (numbers.length === 0) {
    resultBlock.textContent = "Помилка: масив не може бути порожнім.";
    return;
  }

  const bubbleStart = performance.now();
  const bubble = bubbleSort(numbers, order);
  const bubbleEnd = performance.now();

  const quickStart = performance.now();
  const quick = quickSort(numbers, order);
  const quickEnd = performance.now();

  resultBlock.textContent =
`Початковий масив: [${numbers.join(", ")}]

Bubble Sort:
Відсортований масив: [${bubble.sortedArray.join(", ")}]
Порівнянь: ${bubble.comparisons}
Час: ${(bubbleEnd - bubbleStart).toFixed(4)} мс

Quick Sort:
Відсортований масив: [${quick.sortedArray.join(", ")}]
Порівнянь: ${quick.comparisons}
Час: ${(quickEnd - quickStart).toFixed(4)} мс`;
}

function generateRandomArray(size, min = 1, max = 10000) {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

function benchmarkOne(size) {
  const array = generateRandomArray(size);

  const bubbleStart = performance.now();
  const bubble = bubbleSort(array, "asc");
  const bubbleEnd = performance.now();

  const quickStart = performance.now();
  const quick = quickSort(array, "asc");
  const quickEnd = performance.now();

  return {
    size,
    bubbleTime: (bubbleEnd - bubbleStart).toFixed(4),
    quickTime: (quickEnd - quickStart).toFixed(4),
    bubbleComparisons: bubble.comparisons,
    quickComparisons: quick.comparisons
  };
}

function runBenchmark() {
  const sizes = [100, 1000, 5000];
  const results = sizes.map(size => benchmarkOne(size));
  const block = document.getElementById("benchmarkResults");

  block.textContent = results.map(item =>
`Розмір масиву: ${item.size}
Bubble Sort -> час: ${item.bubbleTime} мс, порівнянь: ${item.bubbleComparisons}
Quick Sort  -> час: ${item.quickTime} мс, порівнянь: ${item.quickComparisons}`
  ).join("\n\n");
}

renderFacultyOptions();
applyFiltersAndSort();
