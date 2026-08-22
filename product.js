document.addEventListener("DOMContentLoaded", async () => {

    /* =========================================
       GET SELECTED PRODUCT
    ========================================= */

    let selectedProduct = JSON.parse(
        localStorage.getItem("ruhiraSelectedProduct")
    );

    if (!selectedProduct) {
        selectedProduct = {
            id: "RKS101"
        };
    }


    /* =========================================
       PAGE ELEMENTS
    ========================================= */

    const productName =
        document.getElementById("product-name");

    const productCode =
        document.getElementById("product-code");

    const productPrice =
        document.getElementById("product-price");

    const breadcrumbProduct =
        document.getElementById("breadcrumb-product");

    const productDescription =
        document.getElementById("product-description");

    const mainImage =
        document.getElementById("main-product-image");

    const thumbnailsContainer =
        document.getElementById("product-thumbnails");

    const sizeButtons =
        document.querySelectorAll(".size-button");

    const quantityElement =
        document.getElementById("quantity");

    const increaseButton =
        document.getElementById("increase-quantity");

    const decreaseButton =
        document.getElementById("decrease-quantity");

    const addToCartButton =
        document.getElementById("add-to-cart");

    const buyNowButton =
        document.getElementById("buy-now");


    /* =========================================
       LOAD PRODUCT FROM API
    ========================================= */

    let products;

    try {

        const response = await fetch(
            "/api/products"
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load products"
            );
        }

        products = await response.json();

    } catch (error) {

        console.error(
            "Product loading failed:",
            error
        );

        alert(
            "Unable to load product. Please refresh the page."
        );

        return;

    }


    const product = products.find(
        item =>
            item.product_code === selectedProduct.id
    );


    if (!product) {

        alert("Product not found.");

        window.location.href = "index.html";

        return;

    }


    /* =========================================
       LOAD PRODUCT INFORMATION
    ========================================= */

    productName.textContent =
        product.name;

    productCode.textContent =
        product.product_code;

    productPrice.textContent =
        "₹" +
        Number(product.price)
            .toLocaleString("en-IN");

    productDescription.textContent =
        product.description;

    breadcrumbProduct.textContent =
        product.name;

    document.title =
        product.name + " | Ruhira";


    /* =========================================
       LOAD IMAGES
    ========================================= */

    const productImages =
        product.images.map(
            image => image.url
        );


    mainImage.src =
        productImages[0];

    mainImage.alt =
        product.name;


    productImages.forEach(
        (imageUrl, index) => {

            const thumbnailButton =
                document.createElement("button");

            thumbnailButton.type =
                "button";

            thumbnailButton.className =
                "thumbnail-button";

            if (index === 0) {

                thumbnailButton.classList.add(
                    "active"
                );

            }


            const image =
                document.createElement("img");

            image.src =
                imageUrl;

            image.alt =
                product.name +
                " image " +
                (index + 1);


            thumbnailButton.appendChild(
                image
            );

            thumbnailsContainer.appendChild(
                thumbnailButton
            );


            thumbnailButton.addEventListener(
                "click",
                () => {

                    mainImage.src =
                        imageUrl;


                    document
                        .querySelectorAll(
                            ".thumbnail-button"
                        )
                        .forEach(button => {

                            button.classList.remove(
                                "active"
                            );

                        });


                    thumbnailButton.classList.add(
                        "active"
                    );

                }
            );

        }
    );


    /* =========================================
       SIZE SELECTION
    ========================================= */

    let selectedSize =
        null;

    let selectedVariantId =
        null;


    sizeButtons.forEach(button => {

        const size =
            button.textContent.trim();


        const variant =
            product.variants.find(
                item => item.size === size
            );


        if (
            !variant ||
            variant.stock <= 0
        ) {

            button.disabled =
                true;

            button.classList.add(
                "disabled"
            );

        }


        button.addEventListener(
            "click",
            () => {

                if (button.disabled) {
                    return;
                }


                sizeButtons.forEach(
                    sizeButton => {

                        sizeButton.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );

                selectedSize =
                    size;

                selectedVariantId =
                    variant.id;

            }
        );

    });


    /* =========================================
       QUANTITY
    ========================================= */

    let quantity =
        1;


    increaseButton.addEventListener(
        "click",
        () => {

            quantity++;

            quantityElement.textContent =
                quantity;

        }
    );


    decreaseButton.addEventListener(
        "click",
        () => {

            if (quantity > 1) {

                quantity--;

                quantityElement.textContent =
                    quantity;

            }

        }
    );


    /* =========================================
       CART
    ========================================= */

    function getCart() {

        return JSON.parse(
            localStorage.getItem(
                "ruhiraCart"
            )
        ) || [];

    }


    function updateCartCount() {

        const cart =
            getCart();

        const totalItems =
            cart.reduce(
                (total, item) =>
                    total + item.quantity,
                0
            );


        document
            .querySelectorAll(
                ".cart-count"
            )
            .forEach(cartCount => {

                cartCount.textContent =
                    totalItems;

            });

    }


    function addProductToCart() {

        let cart =
            getCart();


        const existingProduct =
            cart.find(item => {

                return (
                    item.variant_id ===
                    selectedVariantId
                );

            });


        if (existingProduct) {

            existingProduct.quantity +=
                quantity;

        } else {

            cart.push({

                id:
                    product.product_code,

                variant_id:
                    selectedVariantId,

                name:
                    product.name,

                price:
                    Number(product.price),

                image:
                    productImages[0],

                size:
                    selectedSize,

                quantity:
                    quantity

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

    addToCartButton.addEventListener(
        "click",
        () => {

            if (
                !selectedSize ||
                !selectedVariantId
            ) {

                alert(
                    "Please select a size before adding to cart."
                );

                return;

            }


            addProductToCart();


            addToCartButton.textContent =
                "ADDED TO CART ✓";


            setTimeout(() => {

                addToCartButton.textContent =
                    "ADD TO CART";

            }, 1500);

        }
    );


    /* =========================================
       BUY NOW
    ========================================= */

    buyNowButton.addEventListener(
        "click",
        () => {

            if (
                !selectedSize ||
                !selectedVariantId
            ) {

                alert(
                    "Please select a size before continuing."
                );

                return;

            }


            addProductToCart();

            window.location.href =
                "cart.html";

        }
    );


    /* =========================================
       INITIAL CART COUNT
    ========================================= */

    updateCartCount();

});