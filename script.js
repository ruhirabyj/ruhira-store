document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       PRODUCT DATA
    ========================= */

    const products = [
        {
            id: "RKS101",
            name: "Pink Bloom",
            price: 2199,
            image: "https://res.cloudinary.com/kipwuap2/image/upload/v1787125875/IMG_1424.jpg"
        },
        {
            id: "RKS102",
            name: "Forest Grove",
            price: 2199,
            image: "https://res.cloudinary.com/kipwuap2/image/upload/v1787125243/IMG_1749.jpg"
        },
        {
            id: "RKS103",
            name: "Amber Glow",
            price: 2199,
            image: "https://res.cloudinary.com/kipwuap2/image/upload/v1787125256/IMG_1794.jpg"
        },
        {
            id: "RKS104",
            name: "Midnight Noir",
            price: 2299,
            image: "https://res.cloudinary.com/kipwuap2/image/upload/v1787125275/IMG_1636.jpg"
        },
        {
            id: "RKS105",
            name: "Ivory Mist",
            price: 2799,
            image: "https://res.cloudinary.com/kipwuap2/image/upload/v1787125294/IMG_1577.jpg"
        }
    ];


    /* =========================
       CART
    ========================= */

    let cart = JSON.parse(localStorage.getItem("ruhiraCart")) || [];

    const cartCount = document.querySelector(".cart-count");


    function updateCartCount() {

        const totalItems = cart.reduce((total, item) => {
            return total + item.quantity;
        }, 0);

        if (cartCount) {
            cartCount.textContent = totalItems;
        }

        localStorage.setItem(
            "ruhiraCart",
            JSON.stringify(cart)
        );
    }


    function addToCart(product) {

        const existingProduct = cart.find(item => {
            return item.id === product.id;
        });

        if (existingProduct) {

            existingProduct.quantity += 1;

        } else {

            cart.push({
                ...product,
                quantity: 1
            });

        }

        updateCartCount();
    }


    updateCartCount();


    /* =========================
       PRODUCT CARD CLICK
    ========================= */

    const productCards = document.querySelectorAll(".product-card");


    productCards.forEach((card, index) => {

        card.style.cursor = "pointer";

        card.addEventListener("click", () => {

            const product = products[index];

            if (!product) return;


            /*
             * For now:
             * clicking a product stores the selected
             * product and opens product.html
             */

            localStorage.setItem(
                "ruhiraSelectedProduct",
                JSON.stringify(product)
            );

            window.location.href = "product.html";

        });

    });


    /* =========================
       CART BUTTON
    ========================= */

    const cartButton = document.querySelector(".cart-button");


    if (cartButton) {

        cartButton.addEventListener("click", () => {

            window.location.href = "cart.html";

        });

    }


    /* =========================
       SEARCH BUTTON
    ========================= */

    const searchButton = document.querySelector(
        'button[aria-label="Search"]'
    );


    if (searchButton) {

        searchButton.addEventListener("click", () => {

            const searchTerm = prompt(
                "What are you looking for?"
            );

            if (!searchTerm) return;


            const result = products.filter(product => {

                const searchText = searchTerm.toLowerCase();

                return (
                    product.name.toLowerCase().includes(searchText) ||
                    product.id.toLowerCase().includes(searchText)
                );

            });


            if (result.length > 0) {

                const product = result[0];

                localStorage.setItem(
                    "ruhiraSelectedProduct",
                    JSON.stringify(product)
                );

                window.location.href = "product.html";

            } else {

                alert(
                    "Sorry, we could not find any products matching \"" +
                    searchTerm +
                    "\"."
                );

            }

        });

    }


    /* =========================
       ACCOUNT BUTTON
    ========================= */

    const accountButton = document.querySelector(
        'button[aria-label="Account"]'
    );


    if (accountButton) {

        accountButton.addEventListener("click", () => {

            alert(
                "Account functionality will be added soon."
            );

        });

    }


    /* =========================
       SHOP NOW BUTTON
    ========================= */

    const shopButton = document.querySelector(".shop-button");


    if (shopButton) {

        shopButton.addEventListener("click", () => {

            const collection = document.querySelector("#collection");

            if (collection) {

                collection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    }

});
