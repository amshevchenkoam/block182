"use strict";

let xposition = 0;
let yposition = 0;
let type = 0;
let texture = 0;
let block_function = 0;
let update_counter = 0;
let x_number = 1;
let y_number = 0;



document.querySelector('.dropdown').addEventListener('change', localSave);


function generateMap() {
    let mapContainer = document.getElementById("layer_1");
    mapContainer.innerHTML = "";
    for (let y = 1; y <= 8; y++) {
        let line = document.createElement("div");
        line.classList.add("line");
        for (let x = 1; x <= 8; x++) {
            let block = document.createElement("div");
            block.classList.add("block");
            block.id = `${x}_${y}`;
            block.textContent = "-";
            block.addEventListener("click", getData);
            line.appendChild(block);
        }
        mapContainer.appendChild(line);
    }
}

window.onload = generateMap;


document.querySelectorAll(".block").forEach(element => {
    element.addEventListener("click", getData);
});


function localSave() {
    const dropdown = document.querySelector('.dropdown');
    const selectedValue = dropdown.value;

    const activeBlock = document.querySelector('.block.active');

    if (activeBlock) {
        activeBlock.textContent = selectedValue;
    } else {
        console.warn("erer");
    }

    updateMap();
    checkNeighbors();
}


function getData() {
    let data = this.textContent.trim();
    let [xStr, yStr] = this.id.split('_');
    let xposition = parseInt(xStr, 10);
    let yposition = parseInt(yStr, 10);

    document.getElementById("xposition").textContent = xposition;
    document.getElementById("yposition").textContent = yposition;

    console.log("xposition:", xposition);
    console.log("yposition:", yposition);

    const dropdown = document.querySelector('.dropdown');

    if (dropdown.querySelector(`option[value="${data}"]`)) {
        dropdown.value = data;
    } else {
        for (let option of dropdown.options) {
            if (option.textContent.trim().toLowerCase() === data.toLowerCase()) {
                dropdown.value = option.value;
                break;
            }
        }
    }


    document.querySelectorAll(".block").forEach(el => {
        if (el !== this) {
            el.classList.remove("active");
        }
    });


    this.classList.add("active");
    localStorage.setItem('activeBlock', this.id);
}



function globalSave() {

    let mapContent = document.getElementById("layer_1").innerHTML;
    let fullHtml = mapContent;
    let blob = new Blob([fullHtml], { type: "text/html" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "map.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}

function updateMap() {

    document.querySelectorAll('.block').forEach(el => {
        const contentClass = el.textContent.trim();

        el.className = 'block';

        if (contentClass !== '') {
            el.classList.add(contentClass);
        }
    });

}

function checkNeighbors() {
    const exceptions = [
        ['g', 'i'], ['i', 'g'],
        ['j', 'b'], ['b', 'j'],
        ['j', 'c'], ['c', 'j'],
        ['b', 'c'], ['c', 'b']
    ];

    document.querySelectorAll('.block').forEach(block => {
        const content = block.textContent.trim();
        const id = block.id;

        if (!id || content === '') return;

        const [xStr, yStr] = id.split('_');
        const x = parseInt(xStr, 10);
        const y = parseInt(yStr, 10);

        if (isNaN(x) || isNaN(y)) return;

        block.classList.remove('line1', 'line2', 'line3', 'line4');

        const directions = [
            { dx: -1, dy: 0, className: 'line1' }, // left
            { dx: 1, dy: 0, className: 'line2' },  // right
            { dx: 0, dy: -1, className: 'line3' }, // top
            { dx: 0, dy: 1, className: 'line4' }   // bottom
        ];

        directions.forEach(dir => {
            const neighborId = `${x + dir.dx}_${y + dir.dy}`;
            const neighbor = document.getElementById(neighborId);

            if (neighbor) {
                const neighborContent = neighbor.textContent.trim();

                const isException = exceptions.some(pair =>
                    pair[0] === content && pair[1] === neighborContent
                );

                if (!neighbor.classList.contains(content) && !isException) {
                    block.classList.add(dir.className);
                }
            }
        });
    });
}


function mapTake() {
    fetch('/maps/house.html')
        .then(res => res.text())
        .then(html => {
            const layer = document.getElementById('layer_1');
            if (layer) {
                layer.innerHTML = html;
            }
        })
    
}

function floodFill(startX, startY, targetValue, newValue) {
    if (targetValue === newValue) return;

    const stack = [[startX, startY]];

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const block = document.getElementById(`${x}_${y}`);
        if (!block) continue;

        if (block.textContent.trim() !== targetValue) continue;

        block.textContent = newValue;


        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }

    updateMap();
    checkNeighbors();
}
