document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       GET LATEST ORDER
    ========================= */

    const order = JSON.parse(
        localStorage.getItem("ruhiraLatestOrder")
    );


    /*
       If no order exists,
       return customer to cart
    */

    if (!order) {

        window.location.href = "cart.html";

        return;

    }


    /* =========================
       PAGE ELEMENTS
    ========================= */

    const orderNumberElement =
        document.getElementById("order-number");

    const paymentTotalElement =
        document.getElementById("payment-total");

    const copyUpiButton =
        document.getElementById("copy-upi");

    const paidButton =
        document.getElementById("paid-button");


    /* =========================
       DISPLAY ORDER DETAILS
    ========================= */

    orderNumberElement.textContent =
        order.orderNumber;

    paymentTotalElement.textContent =
        "₹" + order.total.toLocaleString("en-IN");


    /* =========================
       COPY UPI ID
    ========================= */

    copyUpiButton.addEventListener(
        "click",
        () => {

            const upiId =
                document
                    .getElementById("upi-id")
                    .textContent
                    .trim();


            navigator.clipboard
                .writeText(upiId)
                .then(() => {

                    copyUpiButton.textContent =
                        "COPIED";

                    setTimeout(() => {

                        copyUpiButton.textContent =
                            "COPY";

                    }, 2000);

                });

        }
    );


    /* =========================
       I HAVE PAID
    ========================= */

    paidButton.addEventListener(
        "click",
        () => {

            /*
               Mark order as
               pending payment verification
            */

            order.status =
                "Payment Verification Pending";


            /*
               Save updated order
            */

            localStorage.setItem(
                "ruhiraLatestOrder",
                JSON.stringify(order)
            );


            /*
               Now clear cart
            */

            localStorage.removeItem(
                "ruhiraCart"
            );


            /*
               Go to order placed page
            */

            window.location.href =
                "order-confirmation.html";

        }
    );

});
