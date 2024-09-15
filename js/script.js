// Define path to the CSV file
const csvPath = 'products.csv';

// Initialize i18next for localization
i18next.init({
    lng: 'de', // Default language
    debug: true,
    resources: {
        en: {
            translation: {
                "title": "Product Catalog",
                "searchPlaceholder": "Search for products...",
                "price": "Price",
                "proteinPer100g": "Protein (per 100g)",
                "proteinPerPiece": "Protein (per piece)"
            }
        },
        de: {
            translation: {
                "title": "Produktkatalog",
                "searchPlaceholder": "Suche nach Produkten...",
                "price": "Preis",
                "proteinPer100g": "Eiweiß (pro 100g)",
                "proteinPerPiece": "Eiweiß (pro Stück)"
            }
        },
        ru: {
            translation: {
                "title": "Каталог продукции",
                "searchPlaceholder": "Поиск продуктов...",
                "price": "Цена",
                "proteinPer100g": "Белок (на 100 г)",
                "proteinPerPiece": "Белок (на штуку)"
            }
        }
    }
}, function(err, t) {
    // Translate elements on the page
    document.getElementById('page-title').innerHTML = i18next.t('title');
    document.getElementById('search').placeholder = i18next.t('searchPlaceholder');
});

// Change language function
function changeLanguage(lng) {
    i18next.changeLanguage(lng);
    document.getElementById('page-title').innerHTML = i18next.t('title');
    document.getElementById('pages-title').innerHTML = i18next.t('title');
    document.getElementById('search').placeholder = i18next.t('searchPlaceholder');
}

// Function to fetch and parse products
async function fetchProducts() {
    const response = await fetch(csvPath);
    const data = await response.text();

    Papa.parse(data, {
        header: true,
        delimiter: ",",
        skipEmptyLines: true,
        complete: (results) => {
            console.log(results.data);
            const categorizedProducts = categorizeProducts(results.data);
            renderCategorizedProducts(categorizedProducts);
        }
    });
}

// Function to categorize products based on the 'Gruppe' column
function categorizeProducts(data) {
    let categories = {};

    data.forEach((row) => {
        const group = row['Gruppe'];
        if (group) {
            if (!categories[group]) {
                categories[group] = [];
            }
            categories[group].push(row);
        }
    });

    return categories;
}

// Function to render the categorized products
// Function to render the categorized products and add sidebar links
// Function to render the categorized products and add sidebar links
function renderCategorizedProducts(categories) {
    const productList = document.getElementById('product-list');
    const sidebar = document.querySelector('#sidebar .list-group');
    let htmlContent = '';
    let sidebarContent = '';

    Object.keys(categories).forEach((category, index) => {
        const categoryId = `category-${index}`;

        // Sidebar links (make them part of the Bootstrap list-group)
        sidebarContent += `<a href="#${categoryId}" class="list-group-item list-group-item-action">${category}</a>`;

        // Product accordion
        htmlContent += `
            <div class="accordion mb-3" id="${categoryId}">
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
    sidebar.innerHTML = sidebarContent;
}



// Function to generate the HTML for the product listing under each category
// Function to generate the HTML for the product listing under each category
function renderProductsHTML(products) {
    return products.map(product => `
        <div class="row mb-3 border p-2">
            <div class="col-md-4">
                <img src="images/${product['Bild uuid']}.jpg" onerror="this.onerror=null;this.src='images/placeholder.jpg';" class="img-fluid" alt="${product['Deutscher Artikelname']}">
            </div>
            <div class="col-md-6">
                <h5>${product['Deutscher Artikelname']}</h5>
                <p>${product['Russischer Artikelname']}</p>
                <p>Gewicht: ${product['Nettogewicht']}</p>
                <p>Eiweiß (pro 100g): ${product['Eiweiß in g (auf 100g)']}g</p>
                <p>Eiweiß (pro Stück): ${product['Eiweiß in g (Pro Stück)']}g</p>
            </div>
            <div class="col-md-2 text-end">
                <span>Preis: €${product['Preis in €']}</span>
            </div>
        </div>
    `).join('');
}


// Load products on page load
fetchProducts();
