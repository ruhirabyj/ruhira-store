document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       GET LATEST ORDER
    ========================= */

    const order = JSON.parse(
        localStorage.getItem("ruhiraLatestOrder")
    );


    /*
       If no order exists,
       return customer to homepage.
    */

    if (!order) {

        window.location.href = "index.html";

        return;

    }


    /* =========================
       PAGE ELEMENTS
    ========================= */

    const orderNumberElement =
        document.getElementById("order-number");

    const orderTotalElement =
        document.getElementById("order-total");

    const orderDateElement =
        document.getElementById("order-date");

    const confirmationItems =
        document.getElementById("confirmation-items");

    const deliveryAddress =
        document.getElementById("delivery-address");

    const cartCountElements =
        document.querySelectorAll(".cart-count");

    const cartButton =
        document.querySelector(".cart-button");


    /* =========================
       FORMAT PRICE
    ========================= */

    function formatPrice(price) {

        return "₹" + price.toLocaleString("en-IN");

    }


    /* =========================
       LOAD ORDER HEADER
    ========================= */

    orderNumberElement.textContent =
        order.orderNumber;

    orderTotalElement.textContent =
        formatPrice(order.total);

    orderDateElement.textContent =
        order.orderDate;


    /* =========================
       LOAD ORDER ITEMS
    ========================= */

    confirmationItems.innerHTML = "";


    order.items.forEach(item => {

        const itemTotal =
            item.price * item.quantity;


        const confirmationItem =
            document.createElement("div");


        confirmationItem.className =
            "confirmation-item";


        confirmationItem.innerHTML = `

            <div class="confirmation-item-image">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

            </div>


            <div class="confirmation-item-info">

                <h4>
                    ${item.name}
                </h4>

                <p>
                    ${item.id}
                    &nbsp; | &nbsp;
                    SIZE: ${item.size}
                    &nbsp; | &nbsp;
                    QTY: ${item.quantity}
                </p>

            </div>


            <div class="confirmation-item-price">

                ${formatPrice(itemTotal)}

            </div>

        `;


        confirmationItems.appendChild(
            confirmationItem
        );

    });


    /* =========================
       LOAD DELIVERY ADDRESS
    ========================= */

    const customer = order.customer;


    deliveryAddress.innerHTML = `

        <strong>
            ${customer.firstName}
            ${customer.lastName}
        </strong>

        <br>

        ${customer.address}

        ${customer.landmark
            ? "<br>" + customer.landmark
            : ""
        }

        <br>

        ${customer.city},
        ${customer.state}

        <br>

        ${customer.pincode}

        <br><br>

        ${customer.phone}

        <br>

        ${customer.email}

    `;


    /* =========================
       CART COUNT
    ========================= */

    cartCountElements.forEach(element => {

        element.textContent = "0";

    });


    /* =========================
       CART BUTTON
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

});
