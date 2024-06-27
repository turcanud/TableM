// script.js
let database = [];
let mockDb = [];

const tbody = document.querySelector('.table-container tbody');
const tableNavigation = document.querySelector('.table-navigation');

async function fetchData(url) {
    const data = await fetch(url)
        .then(response => response.json())
        .then(data => data)
        .catch(error => console.error('Error fetching data:', error));
    return data;
}

async function tableNav(size = 25) {
    tableNavigation.innerHTML = '';
    const pages = Math.ceil(database.length / size);
    for (let i = 0; i < pages; i++) {
        const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn">${i + 1}</button>`;
        tableNavigation.innerHTML += navBtn;
    }
    const first = document.querySelector('.nav-btn');
    first.disabled = true;
}

const loader = document.querySelector('.loader');
async function startLoading() {
    loader.classList.remove('hidden');
}

async function endLoading() {
    loader.classList.add('hidden');
}

document.querySelector('#data-set-size-selector').addEventListener('change', async function () {
    const url_small = 'http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D';
    const url_large = 'http://www.filltext.com/?rows=1000&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D';
    if (this.value == "large") {
        tableNavigation.innerHTML = '';
        tbody.innerHTML = '';
        await startLoading();
        database = await fetchData(url_large);
        for (let i = 0; i < database.length; i++) {
            database[i].index = i;
        }
        mockDb = [...database];
        await endLoading();
        await populateTable(database, 0, parseInt(document.querySelector('.options select').value));
        await tableNav(parseInt(document.querySelector('.options select').value));
    } else {
        tableNavigation.innerHTML = '';
        tbody.innerHTML = '';
        await startLoading();
        database = await fetchData(url_small);
        for (let i = 0; i < database.length; i++) {
            database[i].index = i;
        }
        mockDb = [...database];
        await endLoading();
        await populateTable(database, 0, parseInt(document.querySelector('.options select').value));
        await tableNav(parseInt(document.querySelector('.options select').value));
    }
});

(async () => {
    await startLoading();
    database = await fetchData('http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D');
    for (let i = 0; i < database.length; i++) {
        database[i].index = i;
    }
    await endLoading();
    await populateTable(database);
    await tableNav();
})();

async function populateTable(data, idx = 0, limit = 25) {
    let tableRows = '';
    if (limit > data.length) limit = data.length;
    for (let i = idx; i < limit; i++) {
        const row = `
        <tr ondblclick = "displayInfo(this)">
            <td>${data[i].index}</td>
            <td>${data[i].id}</td>
            <td>${data[i].firstName}</td>
            <td>${data[i].lastName}</td>
            <td>${data[i].phone}</td>
            <td>${data[i].email}</td>
            <td>${data[i].address.state + ' ' + data[i].address.streetAddress}</td>
          </tr>
    `;
        tableRows += row;
    }
    tbody.innerHTML = tableRows;
}

document.querySelector('.options select').addEventListener('change', async function () {
    await populateTable(database, 0, parseInt(this.value));
    await tableNav(parseInt(this.value));
});

async function showPage(navButton) {
    await cleanSelectedNavBtn();
    const nr_page = parseInt(navButton.textContent);
    const page_size_data = parseInt(document.querySelector('.options select').value);
    const end = page_size_data * nr_page;
    await populateTable(database, (end - page_size_data), end);
    navButton.classList.add('selected-nav-btn');
    navButton.disabled = true;
}

async function cleanSelectedNavBtn() {
    const allNavBtns = document.querySelectorAll('.nav-btn');
    for (let i = 0; i < allNavBtns.length; i++) {
        allNavBtns[i].classList.remove('selected-nav-btn');
        allNavBtns[i].disabled = false;
    }
}

async function displayInfo(row) {
    const cells = row.getElementsByTagName('td');
    const id = parseInt(cells[1].innerText);
    const item = database.find(person => person.id === id);
    const info = `
        <div class="user-selected-info">
      <div class="user-selected-name">User selected: <b>${item.firstName + ' ' + item.lastName}</b></div>
      <div class="user-selected-description">
        Description: <textarea disabled>${item.description}</textarea>
      </div>
      <div class="user-selected-residential-adress">
        <span>Residential Adress: </span><b>${item.address.streetAddress}</b>
      </div>
      <div class="user-selected-city"><span>City: </span><b>${item.address.city}</b></div>
      <div class="user-selected-province-state">
        <span>Province/State: </span><b>${item.address.state}</b>
      </div>
      <div class="user-selected-index"><span>Index: </span><b>${item.id}</b></div>
    </div>
    `;
    document.querySelector('.user-selected-info').innerHTML = info;
    await scrollToElement();
}

async function sortByID(header) {
    const db = mockDb.length > 0 ? [...mockDb] : [...database];
    if (header.textContent.includes("−")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇓";
        db.sort((a, b) => a.id - b.id);
        await populateTable(db);
    } else if (header.textContent.includes("⇓")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇑";
        db.sort((a, b) => b.id - a.id);
        await populateTable(db);
    } else {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "−";
        await populateTable(mockDb.length > 0 ? mockDb : database);
    }
}

async function sortByString(header, field) {
    const db = mockDb.length > 0 ? [...mockDb] : [...database];

    if (header.textContent.includes("−")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇓";
        db.sort((a, b) => a[field].localeCompare(b[field]));
        await populateTable(db);
    }
    else if (header.textContent.includes("⇓")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇑";
        db.sort((a, b) => b[field].localeCompare(a[field]));
        await populateTable(db);
    }
    else {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "−";
        await populateTable(mockDb.length > 0 ? mockDb : database);
    }
}

async function sortByAddress(header) {
    const db = mockDb.length > 0 ? [...mockDb] : [...database];

    if (header.textContent.includes("−")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇓";
        db.sort((a, b) => a.address.state.localeCompare(b.address.state));
        await populateTable(db);
    }
    else if (header.textContent.includes("⇓")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇑";
        db.sort((a, b) => b.address.state.localeCompare(a.address.state));
        await populateTable(db);
    }
    else {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "−";
        await populateTable(mockDb.length > 0 ? mockDb : database);
    }
}

async function clearHeaderSigns() {
    const allHeadings = document.querySelectorAll('th');
    for (let i = 0; i < allHeadings.length; i++) {
        allHeadings[i].textContent = allHeadings[i].textContent.slice(0, -1) + "−";
    }
}


async function scrollToElement() {
    document.querySelector('.user-selected-info').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

const modal = document.getElementById("myModal");
const addBtn = document.querySelector('.options .btn');
const span = document.getElementsByClassName("close")[0];

addBtn.onclick = function () {
    document.body.style.overflow = "hidden";
    modal.style.display = "block";
}
span.onclick = function () {
    document.body.style.overflow = "auto";
    modal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == modal) {
        document.body.style.overflow = "auto";
        modal.style.display = "none";
    }
}

const register = document.querySelector('.modal-content .btn');
register.onclick = async function (e) {
    e.preventDefault();
    const firstName = document.querySelector('#firstName').value;
    const lastName = document.querySelector('#lastName').value;
    const email = document.querySelector('#email').value;
    const phone = document.querySelector('#phone').value;
    const streetAddress = document.querySelector('#streetAddress').value;
    const city = document.querySelector('#city').value;
    const state = document.querySelector('#state').value;
    const zip = document.querySelector('#zip').value;
    const description = document.querySelector('#description').value;
    let id = 0;

    for (let i = 0; i < Infinity; i++) {
        let notPresent = true;
        for (let j = 0; j < database.length; j++) {
            if (i == database[j].id) {
                notPresent = false;
                break;
            }
        }
        if (notPresent) {
            id = i;
            break;
        }
    }

    database.push({
        id, firstName, lastName, email, phone,
        "address": { streetAddress, city, state, zip },
        description, index: database.length
    })

    const row = `
        <tr ondblclick = "displayInfo(this)">
            <td>${database.length}</td>
            <td>${id}</td>
            <td>${firstName}</td>
            <td>${lastName}</td>
            <td>${phone}</td>
            <td>${email}</td>
            <td>${state + ' ' + streetAddress}</td>
          </tr>
    `;
    tbody.innerHTML += row;
    document.body.style.overflow = "auto";
    modal.style.display = "none";
}

const searchBox = document.querySelector('#search-box');

searchBox.addEventListener('change', async function () {
    await clearHeaderSigns();
    const db = database.filter(function (data) {
        const dataString = `${data.id} ${data.firstName} ${data.lastName} ${data.phone} ${data.email} ${data.address.state} ${data.address.streetAddress}`;
        const str = dataString.toLowerCase();
        return str.includes(searchBox.value.toLowerCase());
    });
    mockDb = [...db];
    await populateTable(db);
})
