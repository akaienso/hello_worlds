// Function to fetch language data from languages.json
async function fetchLanguages() {
  try {
    const response = await fetch("/js/languages.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch languages:", error);
  }
}

// Function to get a random adjacent key for a given key
function getRandomAdjacentKey(key) {
  const keyboardLayout = {
    a: ["q", "w", "s", "z"],
    b: ["v", "g", "h", "n"],
    c: ["x", "d", "f", "v"],
    d: ["s", "e", "r", "f", "c", "x"],
    e: ["w", "s", "d", "f", "r"],
    f: ["d", "e", "r", "t", "g", "v", "c"],
    g: ["f", "r", "t", "y", "h", "b", "v"],
    h: ["g", "t", "y", "u", "j", "n", "b"],
    i: ["u", "j", "k", "l", "o"],
    j: ["h", "y", "u", "i", "k", "m", "n"],
    k: ["j", "u", "i", "o", "l", "m"],
    l: ["k", "i", "o", "p"],
    m: ["n", "h", "j", "k"],
    n: ["b", "g", "h", "j", "m"],
    o: ["i", "k", "l", "p"],
    p: ["o", "l"],
    q: ["w", "a"],
    r: ["e", "d", "f", "g", "t"],
    s: ["w", "e", "d", "x", "z", "a"],
    t: ["r", "f", "g", "h", "y"],
    u: ["y", "h", "j", "k", "i"],
    v: ["c", "f", "g", "b"],
    w: ["q", "a", "s", "e"],
    x: ["z", "s", "d", "c"],
    y: ["t", "g", "h", "j", "u"],
    z: ["a", "s", "x"],
  };

  // If the key has adjacent keys, pick one randomly
  if (keyboardLayout[key]) {
    const adjacentKeys = keyboardLayout[key];
    return adjacentKeys[Math.floor(Math.random() * adjacentKeys.length)];
  }

  return key; // Return the original key if no adjacent keys are defined
}

// Function to simulate typing with random lags, typos, and corrections
function typeSyntax(syntax, terminalElement, cursorElement) {
    let i = 0;
    let isTypo = false;
    const averageCharWidth = 10; // Adjust this based on your font

    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (i < syntax.length) {
                if (!isTypo && Math.random() < 0.1) { // Introduce a typo
                    const correctKey = syntax[i].toLowerCase(); // Get the correct key (in lowercase)
                    const typoKey = getRandomAdjacentKey(correctKey); // Get a random adjacent key
                    terminalElement.textContent += typoKey; // Add the typo
                    isTypo = true;
                } else {
                    if (isTypo) {
                        terminalElement.textContent = terminalElement.textContent.slice(0, -1); // Remove typo
                        isTypo = false;
                    } else {
                        terminalElement.textContent += syntax[i++];
                    }
                }

                // Update cursor position
                const textLength = terminalElement.textContent.length;
                cursorElement.style.right = ((syntax.length - textLength) * averageCharWidth) + 'px';
            } else {
                clearInterval(interval);
                resolve();
            }
        }, Math.random() * 200 + 60); // Random delay
    });
}

// Function to erase the typed syntax
function eraseSyntax(terminalElement, cursorElement) {
    const averageCharWidth = 10; // Adjust this based on your font

    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (terminalElement.textContent.length > 0) {
                terminalElement.textContent = terminalElement.textContent.slice(0, -1);

                // Update cursor position
                const textLength = terminalElement.textContent.length;
                cursorElement.style.right = (textLength * averageCharWidth) + 'px';
            } else {
                clearInterval(interval);
                resolve();
            }
        }, 30); // Rapid backspace
    });
}

// Main function to start the simulation
async function startSimulation() {
  try {
    const languages = await fetchLanguages();
    const terminalElement = document.querySelector(".terminal");
    const cursorElement = document.querySelector(".terminal .cursor");

    while (true) {
      const language = languages[Math.floor(Math.random() * languages.length)];
      await typeSyntax(language.syntax, terminalElement, cursorElement);
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 10000 + 10000)
      ); // Wait between 10-20 seconds
      await eraseSyntax(terminalElement, cursorElement);
    }
  } catch (error) {
    console.error("Error in simulation:", error);
  }
}

// Adding DOMContentLoaded event listener to start the simulation
document.addEventListener('DOMContentLoaded', (event) => {
    
    const observer = new MutationObserver((mutations, observer) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                // Check for removed nodes
                if (mutation.removedNodes.length > 0) {
                    for (let node of mutation.removedNodes) {
                        if (node.classList && node.classList.contains('cursor')) {
                            console.log('Cursor element was removed!', node);
                        }
                    }
                }
            }
        }
    });
    
    const config = { childList: true, subtree: true };
    const targetNode = document.querySelector('.terminal'); // Adjust as needed

    observer.observe(targetNode, config);

    const cursorElement = document.querySelector('.terminal .cursor');
    console.log(cursorElement); // Check if it logs the element
    startSimulation(); // Or your function that needs the cursorElement
});

window.addEventListener('beforeunload', () => {
    observer.disconnect();
});

