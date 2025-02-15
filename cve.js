// Function to fetch and display CVE data
async function fetchAndDisplayCveData() {
    try {
        // Replace with your actual API URL
        const apiUrl = 'https://cve.circl.lu/api/last';
        
        // Fetch data from the API using the correct headers
        const response = await fetch(apiUrl, {
            method: 'GET', // Using GET method
            headers: {
                'Content-Type': 'application/json', // Set the appropriate content type
                'Accept': 'application/json', // Ensure the response is JSON
            }
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Check if the data has vulnerabilities and limit to 30 records
        if (Array.isArray(data) && data.length > 0) {
            const vulnerabilities = data.slice(0, 30); // Limit to 30 items
            displayCveData(vulnerabilities);
        } else {
            console.error('No vulnerabilities found or invalid data structure');
        }
    } catch (error) {
        console.error('Error fetching CVE data:', error);
    }
}

function displayCveData(vulnerabilities) {
    if (!Array.isArray(vulnerabilities) || vulnerabilities.length === 0) {
        console.error('Invalid or empty vulnerabilities data');
        return;
    }

    vulnerabilities.forEach(vulnerability => {
        const cve = vulnerability.cveMetadata;

        // Check if cve and its required properties exist
        if (!cve || !cve.cveId || !cve.datePublished) {
            console.error('Missing or invalid CVE data for', cve?.cveId);
            return;
        }

        const description = vulnerability.containers.cna.descriptions.find(desc => desc.lang === 'en')?.value || 'No description available';
        const references = vulnerability.containers.cna.references.map(ref => `<a href="${ref.url}" target="_blank">${ref.url}</a>`).join('<br>');

        // Create the CVE card
        const cveCard = document.createElement('div');
        cveCard.classList.add('col-md-4');
        cveCard.innerHTML = `
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">${cve.cveId}</h5>
                    <p class="card-text">${description}</p>
                    <p class="card-text"><strong>Published:</strong> ${new Date(cve.datePublished).toLocaleDateString()}</p>
                    <p class="card-text"><strong>References:</strong><br>${references}</p>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#cveModal" onclick="openModal('${cve.cveId}', '${description}')">Read more</button>
                </div>
            </div>
        `;
        document.getElementById('none-embed-cves').appendChild(cveCard);
    });
}

// Function to open the modal with detailed CVE information
function openModal(cveId, description) {
    const modalTitle = document.getElementById('cveModalLabel');
    const modalDescription = document.getElementById('cveDescription');
    modalTitle.textContent = cveId;
    modalDescription.textContent = description;
}

// Call the fetchAndDisplayCveData function when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayCveData);
