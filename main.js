// script.js
let database = [];
const tbody = document.querySelector('.table-container tbody');

async function fetchData(url) {
    const data = await fetch(url)
        .then(response => response.json())
        .then(data => data)
        .catch(error => console.error('Error fetching data:', error));
    return data;
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
    const url_large = 'http://www.filltext.com/?rows=1000&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&delay=3&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D';
    if (this.value == "large") {
        tbody.innerHTML = '';
        await startLoading();
        database = await fetchData(url_large);
        await endLoading();
        await populateTable(database);
    } else {
        tbody.innerHTML = '';
        await startLoading();
        database = await fetchData(url_small);
        await endLoading();
        await populateTable(database);
    }
});

(async () => {
    await startLoading();
    database = await fetchData('http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D');
    await endLoading();
    await populateTable(database);
})();

async function populateTable(data) {
    let tableRows = '';
    for (let i = 0; i < data.length; i++) {
        const row = `
        <tr ondblclick = "displayInfo(this)">
            <td>${i}</td>
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
    const db = [...database];
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
        await populateTable(database);
    }
}

async function sortByString(header, field) {
    const db = [...database];

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
        await populateTable(database);
    }
}

async function sortByAddress(header) {
    const db = [...database];

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
        await populateTable(database);
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
        description
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

// const searchBox = document.querySelector('#search-box');
// const findBtn = document.querySelector('.search-box-container button');

// findBtn.addEventListener('click', async function () {
//     const db = database.filter(function (data) {
//         const dataString = `${data.id} ${data.firstName} ${data.lastName} ${data.phone} ${data.email} ${data.address.state} ${data.address.streetAddress}`;
//         return dataString.toLowerCase().includes(searchBox.value);
//     });
//     console.table(db);
//     await populateTable(db);
// })
