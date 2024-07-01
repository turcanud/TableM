// script.js
let database = [];
let mockDb = [];
let mockDbForSort = [];

const tbody = document.querySelector('.table-container tbody');
const tableNavigation = document.querySelector('.table-navigation');
const searchBox = document.querySelector('#search-box');

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
    const url_large = 'http://www.filltext.com/?rows=1000&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D';
    if (this.value == "large") {
        await clearHeaderSigns();
        mockDbForSort = [];
        searchBox.value = '';
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
        await clearHeaderSigns();
        mockDbForSort = [];
        searchBox.value = '';
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
    mockDb = [...database];
    await endLoading();
    await populateTable(mockDb);
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
    await populateTable(mockDbForSort.length > 0 ? [...mockDbForSort] : [...mockDb], 0, parseInt(this.value));
    await tableNav(parseInt(this.value));
});

async function tableNav(size = 25) {
    tableNavigation.innerHTML = '';
    const pages = Math.ceil(mockDb.length / size);
    for (let i = 0; i < pages; i++) {
        const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn">${i + 1}</button>`;
        tableNavigation.innerHTML += navBtn;
    }
    const first = document.querySelector('.nav-btn');
    const btnForm = first.getBoundingClientRect();
    first.disabled = true;
    if (btnForm.width !== 50) {
        tableNavigation.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn">${i + 1}</button>`;
            tableNavigation.innerHTML += navBtn;
        }
        tableNavigation.innerHTML += `<button type="button" class="nav-btn">. . .</button>`;
        for (let i = pages - 8; i <= pages; i++) {
            const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn">${i}</button>`;
            tableNavigation.innerHTML += navBtn;
        }
        const first = document.querySelector('.nav-btn');
        first.disabled = true;
    }
}

async function showPage(navButton) {
    await cleanSelectedNavBtn();
    const nr_page = parseInt(navButton.textContent);
    const page_size_data = parseInt(document.querySelector('.options select').value);
    const total_pages = Math.ceil(mockDb.length / page_size_data);
    const end = page_size_data * nr_page;
    await populateTable(mockDbForSort.length > 0 ? [...mockDbForSort] : [...mockDb], (end - page_size_data), end);

    // 1 2 3 4 5 6 7 (8) 9 10 11 12 ... 18 19 20
    // 1 2 3 ... 5 6 7 8 (9) 10 11 12 13 ... 18 19 20
    // 1 2 3 ... 6 7 8 9 (10) 11 12 13 14 ... 18 19 20
    // first 3 |...| 4left<-selected->4right |...| last 3 |

    if (total_pages > 15 && nr_page > 7 && nr_page < total_pages - 7) {
        tableNavigation.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            if (nr_page === i) {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn selected-nav-btn" disabled>${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            } else {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn">${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            }
        }
        tableNavigation.innerHTML += `<button type="button" class="nav-btn">. . .</button>`;
        for (let i = nr_page - 2; i <= nr_page + 2; i++) {
            if (nr_page === i) {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn selected-nav-btn" disabled>${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            } else {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn">${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            }
        }
        tableNavigation.innerHTML += `<button type="button" class="nav-btn">. . .</button>`;
        for (let i = total_pages - 3; i <= total_pages; i++) {
            if (nr_page === i) {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn selected-nav-btn" disabled>${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            } else {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn">${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            }
        }

    } else if (total_pages > 15 && (nr_page < 8 || nr_page > total_pages - 8)) {
        tableNavigation.innerHTML = '';
        for (let i = 1; i <= 8; i++) {
            if (nr_page === i) {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn selected-nav-btn" disabled>${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            } else {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn">${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            }
        }
        tableNavigation.innerHTML += `<button type="button" class="nav-btn">. . .</button>`;
        for (let i = total_pages - 8; i <= total_pages; i++) {
            if (nr_page === i) {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn selected-nav-btn" disabled>${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            } else {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn">${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            }
        }
    } else {
        tableNavigation.innerHTML = '';
        for (let i = 1; i <= total_pages; i++) {
            if (nr_page === i) {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn selected-nav-btn" disabled>${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            } else {
                const navBtn = `<button type="button" onclick="showPage(this)" class="nav-btn">${i}</button>`;
                tableNavigation.innerHTML += navBtn;
            }
        }
    }
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
    const db = [...mockDb];
    if (header.textContent.includes("−")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇓";
        db.sort((a, b) => a.id - b.id);
        for (let i = 0; i < db.length; i++) {
            db[i].index = i;
        }
        mockDbForSort = [...db];
        await populateTable(mockDbForSort);
        await cleanSelectedNavBtn();
        const first = document.querySelector('.nav-btn');
        first.disabled = true;
    } else if (header.textContent.includes("⇓")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇑";
        db.sort((a, b) => b.id - a.id);
        for (let i = 0; i < db.length; i++) {
            db[i].index = i;
        }
        mockDbForSort = [...db];
        await populateTable(mockDbForSort);
        await cleanSelectedNavBtn();
        const first = document.querySelector('.nav-btn');
        first.disabled = true;
    } else {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "−";
        await populateTable(mockDb);
        await cleanSelectedNavBtn();
        const first = document.querySelector('.nav-btn');
        first.disabled = true;
    }
}

async function sortByString(header, field) {
    const db = [...mockDb];

    if (header.textContent.includes("−")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇓";
        db.sort((a, b) => a[field].localeCompare(b[field]));
        for (let i = 0; i < db.length; i++) {
            db[i].index = i;
        }
        mockDbForSort = [...db];
        await populateTable(mockDbForSort);
        await cleanSelectedNavBtn();
        const first = document.querySelector('.nav-btn');
        first.disabled = true;
    }
    else if (header.textContent.includes("⇓")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇑";
        db.sort((a, b) => b[field].localeCompare(a[field]));
        for (let i = 0; i < db.length; i++) {
            db[i].index = i;
        }
        mockDbForSort = [...db];
        await populateTable(mockDbForSort);
        await cleanSelectedNavBtn();
        const first = document.querySelector('.nav-btn');
        first.disabled = true;
    }
    else {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "−";
        await populateTable(mockDb);
        await cleanSelectedNavBtn();
        const first = document.querySelector('.nav-btn');
        first.disabled = true;
    }
}

async function sortByAddress(header) {
    const db = [...mockDb];

    if (header.textContent.includes("−")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇓";
        db.sort((a, b) => a.address.state.localeCompare(b.address.state));
        for (let i = 0; i < db.length; i++) {
            db[i].index = i;
        }
        mockDbForSort = [...db];
        await populateTable(db);
        await cleanSelectedNavBtn();
        const first = document.querySelector('.nav-btn');
        first.disabled = true;
    }
    else if (header.textContent.includes("⇓")) {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "⇑";
        db.sort((a, b) => b.address.state.localeCompare(a.address.state));
        for (let i = 0; i < db.length; i++) {
            db[i].index = i;
        }
        mockDbForSort = [...db];
        await populateTable(db);
        await cleanSelectedNavBtn();
        const first = document.querySelector('.nav-btn');
        first.disabled = true;
    }
    else {
        await clearHeaderSigns();
        header.textContent = header.textContent.slice(0, -1) + "−";
        await populateTable(mockDb);
        await cleanSelectedNavBtn();
        const first = document.querySelector('.nav-btn');
        first.disabled = true;
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
document.querySelector('.options .btn').onclick = function () {
    document.body.style.overflow = "hidden";
    modal.style.display = "block";
}
document.getElementsByClassName("close")[0].onclick = function () {
    document.body.style.overflow = "auto";
    modal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == modal) {
        document.body.style.overflow = "auto";
        modal.style.display = "none";
    }
}

const inputs = document.querySelectorAll('form input');
for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('input', function () {
        const firstName = document.querySelector('#firstName').value.trim();
        const lastName = document.querySelector('#lastName').value.trim();
        const email = document.querySelector('#email').value.trim();
        const phone = document.querySelector('#phone').value.trim();
        const streetAddress = document.querySelector('#streetAddress').value.trim();
        const city = document.querySelector('#city').value.trim();
        const state = document.querySelector('#state').value.trim();
        const zip = document.querySelector('#zip').value.trim();
        const description = document.querySelector('#description').value.trim();

        if (firstName !== '' && lastName !== '' && email !== '' && phone !== '' && streetAddress !== '' && city !== '' && state !== '' && zip !== '' && description !== '') {
            document.querySelector('form button').disabled = false;
        } else {
            document.querySelector('form button').disabled = true;
        }
    });
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

    for (let i = 0; i < database.length; i++) {
        database[i].index += 1;
    }

    database.unshift({
        id, firstName, lastName, email, phone,
        "address": { streetAddress, city, state, zip },
        description, index: 0
    })

    mockDb = [...database];
    mockDbForSort = [];

    await populateTable(database);
    await tableNav(parseInt(document.querySelector('.options select').value));
    await clearHeaderSigns();
    searchBox.value = '';
    document.body.style.overflow = "auto";
    modal.style.display = "none";
}

searchBox.addEventListener('change', async function () {
    await clearHeaderSigns();
    const db = database.filter(function (data) {
        const dataString = `${data.id} ${data.firstName} ${data.lastName} ${data.phone} ${data.email} ${data.address.state} ${data.address.streetAddress}`;
        const str = dataString.toLowerCase();
        return str.includes(searchBox.value.toLowerCase());
    });
    mockDb = [...db];
    mockDbForSort = [...mockDb];
    await populateTable(db);
    await tableNav(parseInt(document.querySelector('.options select').value));
})
