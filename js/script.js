// Function to change the language via i18next and trigger the translation
// Function to change the language via i18next and update the language button label
function changeLanguage(lng) {
    i18next.changeLanguage(lng, () => {
        // Call translatePage after language change to apply translations
        translatePage();

        // Update the language dropdown button text
        const languageDropdownButton = document.getElementById('languageDropdown');
        switch (lng) {
            case 'en':
                languageDropdownButton.innerHTML = '🇬🇧 English';
                break;
            case 'de':
                languageDropdownButton.innerHTML = '🇩🇪 Deutsch';
                break;
            case 'ru':
                languageDropdownButton.innerHTML = '🇷🇺 Русский';
                break;
            default:
                languageDropdownButton.innerHTML = '🇷🇺 Русский'; // Fallback to default
        }
    });
}


// Initialize i18next for localization
i18next.init({
    lng: 'ru', // Default language
    debug: true,
    resources: {
        en: {
            translation: {
                "title": "Product Catalog",
                "categories": "Categories",
                "price": "Price: ",
                "weight": "Weight: ",
                "prot-per-100": "Protein (per 100g): ",
                "prot-per-unit": "Protein (per unit): ",
            }
        },
        de: {
            translation: {
                "title": "Produktkatalog",
                "categories": "Kategorien",
                "price": "Preis: ",
                "weight": "Gewicht: ",
                "prot-per-100": "Protein (pro 100g): ",
                "prot-per-unit": "Protein (pro Stück): ",
            }
        },
        ru: {
            translation: {
                "title": "Каталог продукции",
                "categories": "Категории",
                "price": "Цена: ",
                "weight": "Вес: ",
                "prot-per-100": "Белок (на 100г): ",
                "prot-per-unit": "Белок (на штуку): ",
            }
        }
    }
}, function (err, t) {
    // Initial translation of the page
    translatePage();
});

// Centralized function to translate all elements (static and dynamic)
function translatePage() {
    // Translate static elements
    document.getElementById('page-title').innerHTML = i18next.t('title');
    document.getElementById('page-title-2').innerHTML = i18next.t('title');
    document.getElementById('offcanvasNavbarLabel').innerHTML = i18next.t('categories');

    // Translate dynamic elements (like products, prices, etc.)
    translateDynamicElements();
}

// Translate dynamically loaded content (products, etc.)
function translateDynamicElements() {
    const priceLabels = document.querySelectorAll('.price-label');
    priceLabels.forEach(label => {
        label.textContent = i18next.t('price');
    });
    
    const weightLabels = document.querySelectorAll('.weight');
    weightLabels.forEach(label => {
        label.textContent = i18next.t('weight');
    });
    
    const protPer100Labels = document.querySelectorAll('.prot-per-100');
    protPer100Labels.forEach(label => {
        label.textContent = i18next.t('prot-per-100');
    });
    
    const protPerUnitLabels = document.querySelectorAll('.prot-per-unit');
    protPerUnitLabels.forEach(label => {
        label.textContent = i18next.t('prot-per-unit');
    });
}

// Fetch and render the products after the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    fetchProducts(); // Fetch products from the CSV and render them
});

// Function to fetch products and render them dynamically
async function fetchProducts() {
    try {
        const response = await fetch('products.csv');
        const data = await response.text();

        Papa.parse(data, {
            header: true,
            delimiter: ",",
            skipEmptyLines: true,
            complete: (results) => {
                const categorizedProducts = categorizeProducts(results.data);
                renderCategorizedProducts(categorizedProducts);
                translatePage(); // Call translation after rendering products
            },
            error: (error) => {
                console.error('Error parsing CSV:', error);
            }
        });
    } catch (error) {
        console.error('Error fetching CSV file:', error);
    }
}

// Categorize products based on 'Gruppe' column
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

// Render products and sidebar based on categories
function renderCategorizedProducts(categories) {
    const productList = document.getElementById('product-list');
    const sidebar = document.querySelector('#sidebar .list-group');
    let htmlContent = '';
    let sidebarContent = '';

    Object.keys(categories).forEach((category, index) => {
        const categoryId = `category-${index}`;

        // Sidebar links
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

// Render individual products in HTML
function renderProductsHTML(products) {
    return products.map(product => `
    <div class="row mb-3 border p-2">
        <div class="col-md-4">
            <div class="placeholder-glow">
                <span class="placeholder col-12" style="height: 200px; width: 200px;"></span>
                <img src="images/${product['Bild uuid']}.jpg" class="img-fluid" alt="${product['Deutscher Artikelname']}" 
                     onload="this.style.display='block'; this.previousElementSibling.style.display='none';"
                     onerror="this.onerror=null;this.src='images/placeholder.jpg';" style="display:none;">
            </div>
        </div>
        <div class="col-md-6">
            <h5>${product['Deutscher Artikelname']}</h5>
            <p>${product['Russischer Artikelname']}</p>
            <p><span class="weight"></span> ${product['Nettogewicht']}</p>
            <p><span class="prot-per-100"></span> ${product['Eiweiß in g (auf 100g)']}</p>
            <p><span class="prot-per-unit"></span> ${product['Eiweiß in g (Pro Stück)']}</p>
        </div>
        <div class="col-md-2 text-end">
            <p class="price-label">${i18next.t('price')}:</p> €${product['Preis in €']}
        </div>
    </div>
    `).join('');
}
