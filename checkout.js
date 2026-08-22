document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       GET CART
    ========================= */

    function getCart() {
        return JSON.parse(
            localStorage.getItem("ruhiraCart")
        ) || [];
    }


    /* =========================
       GET CART TOKEN
    ========================= */

    function getCartToken() {

        let cartToken =
            localStorage.getItem(
                "ruhiraCartToken"
            );

        if (!cartToken) {

            cartToken =
                crypto.randomUUID();

            localStorage.setItem(
                "ruhiraCartToken",
                cartToken
            );

        }

        return cartToken;

    }


    /* =========================
       PAGE ELEMENTS
    ========================= */

    const checkoutItems =
        document.getElementById("checkout-items");

    const subtotalElement =
        document.getElementById("checkout-subtotal");

    const totalElement =
        document.getElementById("checkout-total");

    const checkoutForm =
        document.getElementById("checkout-form");

    const cartButton =
        document.querySelector(".cart-button");

    const cartCountElements =
        document.querySelectorAll(".cart-count");


    /* =========================
       FORMAT PRICE
    ========================= */

    function formatPrice(price) {

        return "₹" +
            Number(price)
                .toLocaleString("en-IN");

    }


    /* =========================
       UPDATE CART COUNT
    ========================= */

    function updateCartCount(cart) {

        const totalItems = cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

        cartCountElements.forEach(element => {

            element.textContent =
                totalItems;

        });

    }


    /* =========================
       CALCULATE TOTAL
    ========================= */

    function calculateTotal(cart) {

        return cart.reduce(
            (total, item) => {

                return total +
                    (
                        Number(item.price) *
                        Number(item.quantity)
                    );

            },
            0
        );

    }


    /* =========================
       LOAD CHECKOUT ITEMS
    ========================= */

    function loadCheckout() {

        const cart =
            getCart();

        checkoutItems.innerHTML = "";


        /*
           If cart is empty,
           send customer back to cart.
        */

        if (cart.length === 0) {

            window.location.href =
                "cart.html";

            return;

        }


        cart.forEach(item => {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            const checkoutItem =
                document.createElement("div");

            checkoutItem.className =
                "checkout-item";


            checkoutItem.innerHTML = `

                <div class="checkout-item-image">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                </div>


                <div class="checkout-item-info">

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        ${item.id}
                        &nbsp; | &nbsp;
                        SIZE: ${item.size}
                        &nbsp; | &nbsp;
                        QTY: ${item.quantity}
                    </p>

                </div>


                <div class="checkout-item-price">

                    ${formatPrice(itemTotal)}

                </div>

            `;


            checkoutItems.appendChild(
                checkoutItem
            );

        });


        const subtotal =
            calculateTotal(cart);

        const shipping =
            99;

        subtotalElement.textContent =
            formatPrice(subtotal);

        totalElement.textContent =
            formatPrice(
                subtotal + shipping
            );


        updateCartCount(cart);

    }


    /* =========================
       PLACE ORDER
    ========================= */

    checkoutForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const cart =
                getCart();


            if (cart.length === 0) {

                window.location.href =
                    "cart.html";

                return;

            }


            /*
               Validate cart data.
            */

            for (const item of cart) {

                if (
                    !item.product_id ||
                    !item.variant_id ||
                    !item.quantity
                ) {

                    alert(
                        "Your cart contains an invalid item. Please remove it and add the product again."
                    );

                    return;

                }

            }


            /*
               Get customer information.

               Map the frontend field names
               to the fields expected by
               /api/orders.
            */

            const firstName =
                document
                    .getElementById("first-name")
                    .value
                    .trim();

            const lastName =
                document
                    .getElementById("last-name")
                    .value
                    .trim();


            const customer = {

                name:
                    `${firstName} ${lastName}`
                        .trim(),

                email:
                    document
                        .getElementById("email")
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById("phone")
                        .value
                        .trim(),

                address_line1:
                    document
                        .getElementById("address")
                        .value
                        .trim(),

                address_line2:
                    document
                        .getElementById("landmark")
                        .value
                        .trim(),

                city:
                    document
                        .getElementById("city")
                        .value
                        .trim(),

                state:
                    document
                        .getElementById("state")
                        .value
                        .trim(),

                pincode:
                    document
                        .getElementById("pincode")
                        .value
                        .trim()

            };


            /*
               Convert cart items to the
               format expected by /api/orders.
            */

            const orderItems =
                cart.map(item => ({

                    product_id:
                        Number(
                            item.product_id
                        ),

                    variant_id:
                        Number(
                            item.variant_id
                        ),

                    quantity:
                        Number(
                            item.quantity
                        )

                }));


            const submitButton =
                checkoutForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "";


            try {

                /*
                   Prevent duplicate clicks.
                */

                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "PROCESSING...";

                }


                const cartToken =
                    getCartToken();


                /*
                   STEP 1

                   Create the order in D1.

                   The backend will validate:
                   - product
                   - variant
                   - stock
                   - reservation
                   - real price
                */

                const orderResponse =
                    await fetch(
                        "/api/orders",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "X-Cart-Token":
                                    cartToken

                            },

                            body:
                                JSON.stringify({

                                    customer:
                                        customer,

                                    items:
                                        orderItems

                                })

                        }
                    );


                const orderData =
                    await orderResponse.json();


                if (!orderResponse.ok) {

                    throw new Error(
                        orderData.error ||
                        "Unable to create order"
                    );

                }


                if (
                    !orderData.success ||
                    !orderData.order ||
                    !orderData.order.id
                ) {

                    throw new Error(
                        "Order creation failed"
                    );

                }


                /*
                   STEP 2

                   Create Cashfree checkout
                   using the real D1 order ID.
                */

                const checkoutResponse =
                    await fetch(
                        "/api/checkout/create",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    order_id:
                                        orderData
                                            .order
                                            .id

                                })

                        }
                    );


                const checkoutData =
                    await checkoutResponse
                        .json();


                if (
                    !checkoutResponse.ok
                ) {

                    throw new Error(
                        checkoutData.error ||
                        "Unable to create payment"
                    );

                }


                /*
                   Save the real order and
                   Cashfree session information.

                   payment.js can use this
                   instead of a fake order.
                */

                const order = {

                    ...orderData.order,

                    customer:
                        customer,

                    items:
                        cart,

                    provider:
                        checkoutData.provider,

                    payment_session_id:
                        checkoutData
                            .payment_session_id

                };


                localStorage.setItem(
                    "ruhiraLatestOrder",
                    JSON.stringify(order)
                );


                /*
                   Redirect to payment page.
                */

                window.location.href =
                    "payment.html";


            } catch (error) {

                console.error(
                    "Checkout failed:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to place your order. Please try again."
                );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText;

                }

            }

        }
    );


    /* =========================
       CART ICON
    ========================= */

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

    loadCheckout();

});