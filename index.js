const searchInput = document.querySelector(".search-box input");
const searchBtn = document.querySelector(".search-box button");
const result = document.querySelector(".result");
const historyTab = document.querySelector("#history");
const historyContainer = document.querySelector(".history-container");
const searchTab = document.querySelector("#search");
const searchContainer = document.querySelector(".search-container");
const URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

if (!localStorage.getItem("searches"))
	localStorage.setItem("searches", JSON.stringify([]));

searchInput.addEventListener("input", () => {
	result.innerHTML = "Waiting...";
});
function searchWord() {
	let word = searchInput.value;
	result.innerHTML = "Finding...";
	if (word == "") {
		// result.style.display = "block"
		result.innerHTML = "Please Enter A Word!";
		result.classList.add("error");
		result.classList.remove("correct");
		return;
	}
	result.classList.add("correct");
	result.classList.remove("error");
	searchInput.value = "";
	searchAndDisplay(word);
}
searchBtn.addEventListener("click", searchWord);
searchInput.addEventListener("keydown", (e) => {
	if (e.key == "Enter") searchWord();
});
async function searchAndDisplay(word) {
	try {
		const data = await fetch(`${URL}${word}`);
		const res = (await data.json())[0];
		const meaning = res.meanings[0].definitions[0].definition;
		const example = res.meanings[0].definitions[0].example ?? "";
		const audio = res.phonetics.filter((cur) => cur.audio)?.[0]?.audio;
		const wordObj = { word, meaning, audio, example };
		result.style.display = "block";
		addToStorage(wordObj);
		displayWord(wordObj);
	} catch (e) {
		console.log(e);
		result.innerHTML = `No such word found: ${word}`;
		result.classList.add("error");
		result.classList.remove("correct");
	}
}

function addToStorage(obj) {
	let words = JSON.parse(localStorage.getItem("searches"));
	let i = words.findIndex((item) => item.word == obj.word);
	if (i != -1) words.splice(i, 1);
	words = [obj, ...words];
	localStorage.setItem("searches", JSON.stringify(words));
}
function displayWord({ word, meaning, audio, example }) {
	let audioHtml = `Listen: 
        <button class="play" onClick="handleAudioclick('${audio}')">
            <audio id="play-btn" src="${audio}"></audio>
            <i class="fa-solid fa-play"></i>
        </button>
    `;
	let exampleHtml = `<p class="example"><span>Example: </span>${example}</p>`;
	let html = `
        <div class="header">
            <h2>${word}</h2>
            ${audio ? '<p class="audio">' + audioHtml + "</p>" : ""}
        </div>
        <p class="meaning">
            <span>Meaning: </span>${meaning}
        </p>
        ${example && exampleHtml}
    `;
	result.innerHTML = html;
}
function handleAudioclick(url) {
	document.querySelector("#play-btn").play();
}

historyTab.addEventListener("click", () => {
	historyTab.style.display = "none";
	searchTab.style.display = "block";
	searchContainer.style.display = "none";
	result.style.display = "none";
	historyContainer.style.display = "block";
	displayHistory();
});
searchTab.addEventListener("click", () => {
	searchTab.style.display = "none";
	historyTab.style.display = "block";
	searchContainer.style.display = "block";
	result.style.display = "flex";
	historyContainer.style.display = "none";
	// result.innerHTML = "";
});

function displayHistory() {
	const words = JSON.parse(localStorage.getItem("searches"));
	let html = "";
	words.forEach(({ word, meaning }, index) => {
		html += `
            <div class="word">
                <p class="title">${word}</p>
				<button class="delete" id=${index}>
					<i class="fa-regular fa-trash-can"></i>
				</button>
                <p class="meaning">
                    ${meaning}
                </p>
            </div>
        `;
	});
	historyContainer.innerHTML = `<h3>Your History:</h3>
    <div class="words">${html}</div>`;
	[...document.querySelectorAll(".delete")].forEach((item) => {
		item.addEventListener("click", () => {
			let i = item.id;
			item.parentElement.remove();
			let words = JSON.parse(localStorage.getItem("searches"));
			words.splice(i, 1);
			localStorage.setItem("searches", JSON.stringify(words));
			displayHistory();
		});
	});
}
