document.addEventListener("DOMContentLoaded", () => {

    const productGrid =
        document.getElementById("product-grid");


    /*
       Safety check
    */

    if (!productGrid) {
        return;
    }


    /*
       Clear existing content
    */

    productGrid.innerHTML = "";


    /*
       Loop through all products
       from catalog.js
    */

    Object.values(products).forEach(product => {

        const productCard =
            document.createElement("article");

        productCard.className =
            "product-card";


        /*
           Use first image as
           the product thumbnail
        */

        const productImage =
            product.images[0];


        productCard.innerHTML = `

            <a
                href="product.html?id=${product.id}"
                class="product-link"
            >

                <div class="product-image">

                    <span class="new-tag">
                        NEW
                    </span>

                    <img
                        src="${productImage}"
                        alt="${product.name}"
                    >

                </div>


                <div class="product-info">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ${product.id}
                    </p>

                    <strong>
                        ₹${product.price.toLocaleString("en-IN")}
                    </strong>

                </div>

            </a>

        `;


        productGrid.appendChild(
            productCard
        );

    });

});
