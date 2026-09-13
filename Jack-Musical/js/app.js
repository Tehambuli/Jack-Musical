const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')
const memory = getMemory();

function getMemory() {
    return JSON.parse(localStorage.getItem('words') || "[]");
}

function memoryAddWord(newWord) {
    return localStorage.setItem('words', JSON.stringify([...getMemory(), newWord]));
}

const clearMemory = () => localStorage.setItem('words', JSON.stringify([]))

/**Jack Harlow's Songs and video links for APP
 * 
 * 1. "Denver" https://www.youtube.com/watch?v=vq4hRDnGbDY 
 * 
 * 2. "Drip Drop" https://www.youtube.com/watch?v=4-SJyuCFD18
 * 
 * 3. "Already Friends" https://www.youtube.com/watch?v=kM-4va2nuYg 
 * 
 * 
 * 4. "Heavy Hitter" https://www.youtube.com/watch?v=BeFbMwLSszI 
 * 
 * 5. "Thru the night"  https://www.youtube.com/watch?v=wPrEkA_gQp4 
 * 
 * 6. "Leaf Wraps" https://www.youtube.com/watch?v=CsLR0kBny4w 
 * 
 * 
 * 7. "What's poppin" https://www.youtube.com/watch?v=w9uWPBDHEKE 
 * 
 * 8. "Ghost"  https://www.youtube.com/watch?v=GByTR0pBYWE
 * 
 * 
 * 9. "Tyler Hero"  https://www.youtube.com/watch?v=np9Ub1LilKU 
 * 
 *  
 * 10. "Sundown"  https://www.youtube.com/watch?v=N2-dqe8qweY   
 * 
 */

const names = Object.keys(songLookup)
const longestName = names.reduce((longest, name) => Math.max(longest, name.length), 0)
const guessRows = [...Array(7)].map(() => [...Array(longestName)])

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const randomIndex = randomIntFromInterval(0, names.length - 1)
let wordle = names[randomIndex]

//wordle name//
//const wordle = 'LOVIN'

console.log(
    names, randomIndex, wordle
)

let currentRow = memory.length
let currentTile = 0
let isGameOver = false

const getCurrentTile = () => {
    return document.querySelectorAll('.tile-container > div')[currentRow].querySelectorAll('div')[currentTile];
};

setInterval(() => {
    const currentTile = getCurrentTile();
    if (!currentTile) return;

    currentTile.innerHTML = '_';

    setTimeout(() => {
        const hasLowdash = currentTile.innerHTML === '_';
        if (hasLowdash) currentTile.innerHTML = '';
    }, 1200);
}, 2000);

//guess row//

guessRows.forEach((guessRow, guessRowIndex) => {
    const rowElement = document.createElement('div')
    rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)

    guessRow.forEach((guess, guessIndex) => {
        const tileElement = document.createElement('div')
        tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
        tileElement.classList.add('tile')
        rowElement.append(tileElement)
    })

    tileDisplay.append(rowElement)
})

memory.forEach((word, wordIndex) => {
    document.querySelector(`#guessRow-${wordIndex}`).classList.add('correct')

    word.split('').forEach((letter, letterIndex) => {
        document.querySelector(`#guessRow-${wordIndex}-tile-${letterIndex}`).innerHTML = letter;
    })
})

//Key Button//
keys.forEach(key => {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key
    buttonElement.setAttribute('id', key)
    buttonElement.addEventListener('click', () => handleClick(key, buttonElement))
    keyboard.append(buttonElement)
})

//handle click//
const handleClick = (letter, buttonElement) => {
    console.log('clicked', letter)
    if (letter === '«') {
        deleteLetter()
        console.log('guessRows', guessRows)
        checkErrors();
        return
    }
    if (letter === 'ENTER') {
        checkRow()
        console.log('guessRows', guessRows)
        return
    }
    if (currentTile === 7) {
        buttonElement.classList.add('shake');
        setTimeout(() => buttonElement.classList.remove('shake'), 1000)
    }

    addLetter(letter)
    console.log('guessRows', guessRows)
}


//added letter//

const addLetter = (letter) => {
    if (currentTile < 7 && currentRow < 8) {
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        tile.textContent = letter
        guessRows[currentRow][currentTile] = letter
        tile.setAttribute('data', letter)
        currentTile++

        checkErrors();
    }
}

const checkErrors = () => {
    const wordle = getWordle()
    const isInvalid = wordle && (
        names.findIndex(name => name.includes(wordle)) < 0 ||
        getMemory().find(word => word.includes(wordle))
    )
    
    if (isInvalid) {
        highlight(currentRow, false)
    } else {
        unHighlight(currentRow)

        document.querySelectorAll('.tile-container > div')[currentRow].querySelectorAll('div').forEach(tile => {
            if (tile.innerHTML.trim() === '') return;
            tile.classList.add('correct-letter');
        });
    }
}

//delete letter//
const deleteLetter = () => {
    if (currentTile === 0) return

    if (currentTile < 7) {
        getCurrentTile().innerHTML = ''
    }

    currentTile--
    const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
    tile.textContent = ''
    guessRows[currentRow][currentTile] = ''
    tile.setAttribute('data', '')
    tile.classList.remove('correct-letter')
}

const getWordle = () => guessRows[currentRow].join('').replace('_', '').trim();

const checkRow = () => {
    wordle = getWordle();

    console.log('guess is ' + wordle, 'wordle  is ' + wordle)

    flipTile()

    if (currentRow >= 7) {
        isGameOver = false
        showMessage('Game Over')
        return
    }

    if (songLookup[wordle]) {
        if (getMemory().includes(wordle)) {
            shake()
            return
        }

        setTimeout(() => {
            showMessage('Magnificent!').then(openVideo)
            isGameOver = true
        }, 1000)
        highlight(currentRow);
        memoryAddWord(wordle)
    } else {
        showMessage('No match!')
        shake()
        return
    }

    if (currentRow < 7) {
        currentTile = 0
    }

    currentRow++
}

const highlight = (row, success = true) => {
    const rowElement = document.querySelectorAll('.tile-container > div')[row];
    rowElement.classList.add(success ? 'correct' : 'incorrect');
}
const unHighlight = (row) => {
    const rowElement = document.querySelectorAll('.tile-container > div')[row];
    console.log('->', { row })
    rowElement.classList.remove('correct');
    rowElement.classList.remove('incorrect');
}

const shake = () => {
    tileDisplay.classList.add('shake');
    setTimeout(() => tileDisplay.classList.remove('shake'), 3000)
}

const showMessage = (message) => {
    const messageElement = document.createElement('p')
    messageElement.textContent = message
    messageDisplay.append(messageElement)
    messageDisplay.style.display = 'block'

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Opening video for', wordle, songLookup[wordle])
            messageDisplay.removeChild(messageElement)
            resolve();
        }, 3000)
    });
}

const openVideo = () => {
    window.open(songLookup[wordle], '_blank')
}

//tile stuff-color, flip, and set time per roatation//

const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(color)
}

const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
    let checkWordle = wordle
    const guess = []

    rowTiles.forEach(tile => {
        guess.push({ letter: tile.getAttribute('data'), color: 'grey-overlay' })
    })

    guess.forEach((guess, index) => {
        if (guess.letter == wordle[index]) {
            guess.color = 'green-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    guess.forEach(guess => {
        if (checkWordle.includes(guess.letter)) {
            guess.color = 'yellow-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    rowTiles.forEach((tile, index) => {
        // setTimeout(() => {
        tile.classList.add('flip')
        tile.classList.add(guess[index].color)
        console.log(
            "foreach", tile, index, guess
        )
        if (guess[index].letter) {
            addColorToKey(guess[index].letter, guess[index].color)
        }
    })
}