document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       GET SELECTED PRODUCT
    ========================================= */

    let selectedProduct = JSON.parse(
        localStorage.getItem("ruhiraSelectedProduct")
    );


    /*
       If user directly opens product.html,
       show the first product instead of
       leaving the page empty.
    */

    if (!selectedProduct) {
        selectedProduct = {
            id: "RKS101"
        };
    }


    const product = products[selectedProduct.id] || products.RKS101;


    /* =========================================
       PAGE ELEMENTS
    ========================================= */

    const productName = document.getElementById("product-name");
    const productCode = document.getElementById("product-code");
    const productPrice = document.getElementById("product-price");
    const breadcrumbProduct = document.getElementById("breadcrumb-product");

    const mainImage = document.getElementById("main-product-image");
    const thumbnailsContainer = document.getElementById("product-thumbnails");


    /* =========================================
       LOAD PRODUCT INFORMATION
    ========================================= */

    productName.textContent = product.name;

    productCode.textContent = product.id;

    productPrice.textContent =
        "₹" + product.price.toLocaleString("en-IN");

    breadcrumbProduct.textContent = product.name;

    document.title = product.name + " | Ruhira";


    /* =========================================
       LOAD MAIN IMAGE
    ========================================= */

    mainImage.src = product.images[0];

    mainImage.alt = product.name;


    /* =========================================
       CREATE THUMBNAILS
    ========================================= */

    product.images.forEach((imageUrl, index) => {

        const thumbnailButton = document.createElement("button");

        thumbnailButton.type = "button";

        thumbnailButton.className = "thumbnail-button";

        if (index === 0) {
            thumbnailButton.classList.add("active");
        }


        const image = document.createElement("img");

        image.src = imageUrl;

        image.alt = product.name + " image " + (index + 1);


        thumbnailButton.appendChild(image);

        thumbnailsContainer.appendChild(thumbnailButton);


        thumbnailButton.addEventListener("click", () => {

            mainImage.src = imageUrl;


            document
                .querySelectorAll(".thumbnail-button")
                .forEach(button => {
                    button.classList.remove("active");
                });


            thumbnailButton.classList.add("active");

        });

    });

    /* =========================================
       SIZE SELECTION
    ========================================= */
    
    const sizeButtons =
        document.querySelectorAll(".size-button");
    
    
    let selectedSize = null;
    
    
    sizeButtons.forEach(button => {
    
        const size = button.textContent.trim();
    
        const stock = product.stock[size] || 0;
    
    
        /* No stock → disable the size */
    
        if (stock === 0) {
    
            button.classList.add("unavailable");
    
            button.disabled = true;
    
            return;
    
        }
    
    
        /* Automatically select first available size */
    
        if (selectedSize === null) {
    
            selectedSize = size;
    
            button.classList.add("active");
    
        }
    
    
        /* Allow clicking available sizes */
    
        button.addEventListener("click", () => {
    
            sizeButtons.forEach(sizeButton => {
                sizeButton.classList.remove("active");
            });
    
            button.classList.add("active");
    
            selectedSize = size;
    
        });
    
    });


    /* =========================================
       QUANTITY
    ========================================= */

    const quantityElement =
        document.getElementById("quantity");

    const increaseButton =
        document.getElementById("increase-quantity");

    const decreaseButton =
        document.getElementById("decrease-quantity");


    let quantity = 1;


    increaseButton.addEventListener("click", () => {

        quantity++;

        quantityElement.textContent = quantity;

    });


    decreaseButton.addEventListener("click", () => {

        if (quantity > 1) {

            quantity--;

            quantityElement.textContent = quantity;

        }

    });


    /* =========================================
       CART
    ========================================= */

    function getCart() {

        return JSON.parse(
            localStorage.getItem("ruhiraCart")
        ) || [];

    }


    function updateCartCount() {

        const cart = getCart();

        const totalItems = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );


        document
            .querySelectorAll(".cart-count")
            .forEach(cartCount => {
                cartCount.textContent = totalItems;
            });

    }


    function addProductToCart() {

        let cart = getCart();


        const existingProduct = cart.find(item => {

            return (
                item.id === product.id &&
                item.size === selectedSize
            );

        });


        if (existingProduct) {

            existingProduct.quantity += quantity;

        } else {

            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                size: selectedSize,
                quantity: quantity
            });

        }


        localStorage.setItem(
            "ruhiraCart",
            JSON.stringify(cart)
        );


        updateCartCount();

    }


    /* =========================================
       ADD TO CART
    ========================================= */

    const addToCartButton =
        document.getElementById("add-to-cart");


    addToCartButton.addEventListener("click", () => {

        addProductToCart();

        addToCartButton.textContent =
            "ADDED TO CART ✓";


        setTimeout(() => {

            addToCartButton.textContent =
                "ADD TO CART";

        }, 1500);

    });


    /* =========================================
       BUY NOW
    ========================================= */

    const buyNowButton =
        document.getElementById("buy-now");


    buyNowButton.addEventListener("click", () => {

        addProductToCart();

        window.location.href = "cart.html";

    });


    /* =========================================
       CART ICON
    ========================================= */

    const cartButton =
        document.querySelector(".cart-button");


    if (cartButton) {

        cartButton.addEventListener("click", () => {

            window.location.href = "cart.html";

        });

    }


    /* =========================================
       INITIAL CART COUNT
    ========================================= */

    updateCartCount();

});
