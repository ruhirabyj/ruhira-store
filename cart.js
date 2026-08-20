document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       GET CART
    ========================= */

    function getCart() {
        return JSON.parse(
            localStorage.getItem("ruhiraCart")
        ) || [];
    }


    function saveCart(cart) {
        localStorage.setItem(
            "ruhiraCart",
            JSON.stringify(cart)
        );
    }


    /* =========================
       PAGE ELEMENTS
    ========================= */

    const cartItemsContainer =
        document.getElementById("cart-items-container");

    const emptyCart =
        document.getElementById("empty-cart");

    const orderSummary =
        document.getElementById("order-summary");

    const subtotalElement =
        document.getElementById("cart-subtotal");

    const totalElement =
        document.getElementById("cart-total");

    const checkoutButton =
        document.getElementById("checkout-button");

    const cartCountElements =
        document.querySelectorAll(".cart-count");


    /* =========================
       FORMAT PRICE
    ========================= */

    function formatPrice(price) {
        return "₹" + price.toLocaleString("en-IN");
    }


    /* =========================
       UPDATE CART COUNT
    ========================= */

    function updateCartCount(cart) {

        const totalItems = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });

    }


    /* =========================
       UPDATE TOTALS
    ========================= */

    function updateTotals(cart) {

        const subtotal = cart.reduce(
            (total, item) => {
                return total + (item.price * item.quantity);
            },
            0
        );

        const shipping = 99;

        subtotalElement.textContent =
            formatPrice(subtotal);

        totalElement.textContent =
            formatPrice(subtotal + shipping);

    }


    /* =========================
       RENDER CART
    ========================= */

    function renderCart() {

        const cart = getCart();

        cartItemsContainer.innerHTML = "";


        /* EMPTY CART */

        if (cart.length === 0) {

            emptyCart.classList.add("show");

            if (orderSummary) {
                orderSummary.style.display = "none";
            }

            updateCartCount(cart);

            return;
        }


        /* CART HAS ITEMS */

        emptyCart.classList.remove("show");

        if (orderSummary) {
            orderSummary.style.display = "block";
        }


        cart.forEach((item, index) => {

            const cartItem =
                document.createElement("article");

            cartItem.className = "cart-item";


            cartItem.innerHTML = `

                <div class="cart-item-image">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                </div>


                <div class="cart-item-details">

                    <p class="cart-item-code">
                        ${item.id}
                    </p>

                    <h2 class="cart-item-name">
                        ${item.name}
                    </h2>

                    <p class="cart-item-size">
                        SIZE: ${item.size}
                    </p>

                    <p class="cart-item-price">
                        ${formatPrice(item.price)}
                    </p>


                    <div class="cart-item-quantity">

                        <button
                            type="button"
                            class="decrease-cart-quantity"
                            data-index="${index}"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            type="button"
                            class="increase-cart-quantity"
                            data-index="${index}"
                        >
                            +
                        </button>

                    </div>

                </div>


                <div class="cart-item-actions">

                    <p class="cart-item-total">
                        ${formatPrice(
                            item.price * item.quantity
                        )}
                    </p>


                    <button
                        type="button"
                        class="remove-item"
                        data-index="${index}"
                    >
                        REMOVE
                    </button>

                </div>

            `;


            cartItemsContainer.appendChild(cartItem);

        });


        updateTotals(cart);

        updateCartCount(cart);

        attachCartEvents();

    }


    /* =========================
       CART BUTTON EVENTS
    ========================= */

    function attachCartEvents() {


        /* INCREASE QUANTITY */

        document
            .querySelectorAll(
                ".increase-cart-quantity"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );

                        const cart = getCart();

                        cart[index].quantity++;

                        saveCart(cart);

                        renderCart();

                    }
                );

            });


        /* DECREASE QUANTITY */

        document
            .querySelectorAll(
                ".decrease-cart-quantity"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );

                        const cart = getCart();


                        if (
                            cart[index].quantity > 1
                        ) {

                            cart[index].quantity--;

                            saveCart(cart);

                            renderCart();

                        }

                    }
                );

            });


        /* REMOVE ITEM */

        document
            .querySelectorAll(".remove-item")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );

                        const cart = getCart();

                        cart.splice(index, 1);

                        saveCart(cart);

                        renderCart();

                    }
                );

            });

    }


    /* =========================
       CHECKOUT
    ========================= */

    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            () => {

                const cart = getCart();


                if (cart.length === 0) {

                    alert(
                        "Your shopping bag is empty."
                    );

                    return;

                }


                /*
                 * Checkout page will be added next.
                 */

                window.location.href =
                    "checkout.html";

            }
        );

    }


    /* =========================
       CART ICON
    ========================= */

    const cartButton =
        document.querySelector(".cart-button");


    if (cartButton) {

        cartButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "cart.html";

            }
        );

    }


    /* =========================
       INITIAL LOAD
    ========================= */

    renderCart();

});
