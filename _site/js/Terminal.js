// Function to simulate typing effect
function promptEffect(text, elementId, delay = 50, callback) {
    const element = document.getElementById(elementId);
    let i = 0;
    element.textContent = ""; // Clear previous content

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i); // Add one character at a time
            i++;
            setTimeout(type, delay); // Delay between characters
        } else {
            if (callback) callback(); // Execute callback after typing is done
        }
    }

    type(); // Start typing effect
}

// Function to simulate command execution
function sh(command, output) {
    const Prompt_command = document.getElementById('Prompt_command');
    const Prompt_output = document.getElementById('Prompt_output');
    const Prompt_cursor = document.getElementById('Prompt_cursor');

    // Clear previous output
    Prompt_output.textContent = "";

    // Simulate typing the command
    promptEffect(command, 'Prompt_command', 50, () => {
        // After typing the command, display the output
        setTimeout(() => {
            Prompt_output.textContent = output; // Display output
            Prompt_cursor.style.display = "inline"; // Show cursor again
        }, 500); // Delay before showing output
    });
}

// skill function
function skill() {
    return new Promise((resolve) => {
        setTimeout(() => {
            sh("cd skill\\'s", "Changing directory to 'skill\\'s'");
        }, 2000);

        setTimeout(() => {
            sh("ls -alh", `
total 44K. 
drwxrwxrwx 1 m4x m4x 4.0K Feb  6 16:39 .
drwxrwxrwx 1 m4x m4x 4.0K Feb  6 13:58 ..
-rwxrwxrwx 1 m4x m4x 3.1K Feb  6 18:06 BinaryExploition.css
-rwxrwxrwx 1 m4x m4x 5.1K Feb  6 16:54 reverseEngineering.html
-rwxrwxrwx 1 m4x m4x 5.4K Feb  6 18:14 WebEXPLOITION.js
drwxrwxrwx 1 m4x m4x 4.0K Feb  6 13:59 fullStack_WEb
drwxrwxrwx 1 m4x m4x 4.0K Feb  6 13:58 Networking
-rwxrwxrwx 1 m4x m4x 5.5K Feb  6 18:38 Desing
-rwxrwxrwx 1 m4x m4x 2.2K Feb  6 16:40 Data\\ Structures
-rwxrwxrwx 1 m4x m4x   52 Feb  6 13:58 Problem Solving
-rwxrwxrwx 1 m4x m4x 8.9K Feb  6 18:35 Algorithms.css
            `);
            resolve(); // Resolve the promise after the last command
        }, 3000);
    });
}

// currentlyAdhering function
function currentlyAdhering() {
    return new Promise((resolve) => {
        setTimeout(() => {
            sh("cd Currently Adhering", "Changing directory to 'Currently Adhering'");
        }, 2000);

        setTimeout(() => {
            sh('cat Currently Adhering | head -n 10', `
1   working as trainer afaq international
2   Trainings : 
3           Cyber security
4           networking
5           software Engineering
6           exploit devoplment
7           Web EXPLOITION
...
            `);
            resolve(); // Resolve the promise after the last command
        }, 4000);
    });
}

// Execute functions sequentially
document.addEventListener('DOMContentLoaded', async () => {
    await skill(); // Wait for skill() to complete
    await currentlyAdhering(); // Wait for currentlyAdhering() to complete
});