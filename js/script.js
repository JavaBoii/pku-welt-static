// Define path to the CSV file
const csvPath = 'products.csv'; // Ensure the correct path to your CSV file

// Function to fetch and parse products
async function fetchProducts() {
    const response = await fetch(csvPath);
    const data = await response.text();

    Papa.parse(data, {
        header: true,
        delimiter: ",", // Adjust if your CSV uses another delimiter (such as semicolons)
        skipEmptyLines: true, // Skip empty rows
        complete: (results) => {
            console.log(results.data); // Debugging
            const categorizedProducts = categorizeProducts(results.data);
            renderCategorizedProducts(categorizedProducts);
        }
    });
}

// Function to categorize products based on the 'Gruppe' column
function categorizeProducts(data) {
    let categories = {};

    data.forEach((row) => {
        const group = row['Gruppe']; // Category is now in 'Gruppe' column
        if (group) {
            if (!categories[group]) {
                categories[group] = []; // Initialize group if not already present
            }
            categories[group].push(row); // Add the product to the relevant group
        }
    });

    return categories;
}

// Function to render the categorized products
function renderCategorizedProducts(categories) {
    const productList = document.getElementById('product-list');
    let htmlContent = '';

    Object.keys(categories).forEach((category, index) => {
        // Create a Bootstrap accordion section for each category
        const categoryId = `category-${index}`;

        htmlContent += `
            <div class="accordion mb-3" id="accordion-${categoryId}">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading-${categoryId}">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${categoryId}" aria-expanded="true" aria-controls="collapse-${categoryId}">
                            ${category}
                        </button>
                    </h2>
                    <div id="collapse-${categoryId}" class="accordion-collapse collapse show" aria-labelledby="heading-${categoryId}" data-bs-parent="#accordion-${categoryId}">
                        <div class="accordion-body">
                            ${renderProductsHTML(categories[category])}
                        </div>
                    </div>
                </div>
            </div>`;
    });

    productList.innerHTML = htmlContent;
}

// Function to generate the HTML for the product listing under each category, including protein columns
function renderProductsHTML(products) {
    return products.map(product => `
        <div class="row mb-3 border p-2">
            <div class="col-md-4">
                <img src="images/${product['Bild uuid']}.jpg" class="img-fluid" alt="${product['Deutscher Artikelname']}">
            </div>
            <div class="col-md-6">
                <h5>${product['Deutscher Artikelname']}</h5>
                <p>${product['Russischer Artikelname']}</p>
                <p>Gewicht: ${product['Nettogewicht']}</p>
                <p>Eiweiß (pro 100g): ${product['Eiweiß in g (auf 100g)']}g</p>
                <p>Eiweiß (pro Stück): ${product['Eiweiß in g (Pro Stück)']}g</p>
            </div>
            <div class="col-md-2">
                <p class="text-end">Preis: €${product['Preis in €']}</p>
            </div>
        </div>
    `).join('');
}


// Search function
document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filteredProducts = allProducts.filter(product =>
        product['Deutscher Artikelname'].toLowerCase().includes(searchTerm) ||
        product['Russischer Artikelname'].toLowerCase().includes(searchTerm)
    );
    document.getElementById('product-list').innerHTML = '';
    currentPage = 1;
    renderProducts(currentPage);
});

// Infinite Scroll (if you still need this feature)
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && filteredProducts.length > (currentPage - 1) * productsPerPage) {
        document.getElementById('loading-spinner').style.display = 'block';
        setTimeout(() => {
            renderProducts(currentPage);
        }, 1000);
    }
});

// Load products on page load
fetchProducts();
