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
       CALCULATE TOTAL
    ========================= */

    function calculateTotal(cart) {

        return cart.reduce(
            (total, item) => {

                return total +
                    (item.price * item.quantity);

            },
            0
        );

    }


    /* =========================
       LOAD CHECKOUT ITEMS
    ========================= */

    function loadCheckout() {

        const cart = getCart();

        checkoutItems.innerHTML = "";


        /*
           If cart is empty,
           send customer back to cart.
        */

        if (cart.length === 0) {

            window.location.href = "cart.html";

            return;

        }


        cart.forEach(item => {

            const itemTotal =
                item.price * item.quantity;


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

        const shipping = 99;

        subtotalElement.textContent =
            formatPrice(subtotal);

        totalElement.textContent =
            formatPrice(subtotal + shipping);


        updateCartCount(cart);

    }


    /* =========================
       PLACE ORDER
    ========================= */

    checkoutForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const cart = getCart();


            if (cart.length === 0) {

                window.location.href =
                    "cart.html";

                return;

            }


            /*
               Get customer information
            */

            const customer = {

                email:
                    document
                        .getElementById("email")
                        .value
                        .trim(),

                firstName:
                    document
                        .getElementById("first-name")
                        .value
                        .trim(),

                lastName:
                    document
                        .getElementById("last-name")
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById("phone")
                        .value
                        .trim(),

                address:
                    document
                        .getElementById("address")
                        .value
                        .trim(),

                landmark:
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
               Generate order number
            */

            const orderNumber =
                "RUH" +
                Date.now()
                    .toString()
                    .slice(-8);


            /*
               Create complete order
            */

            const order = {

                orderNumber: orderNumber,

                customer: customer,

                items: cart,

                total:
                    calculateTotal(cart) + 99,

                orderDate:
                    new Date()
                        .toLocaleString(
                            "en-IN"
                        )

            };


            /*
               Save order temporarily.
               The confirmation page
               will use this data.
            */

            localStorage.setItem(
                "ruhiraLatestOrder",
                JSON.stringify(order)
            );

            /*
               Redirect customer to
               UPI payment page
            */
            
            window.location.href =
                "payment.html";

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
