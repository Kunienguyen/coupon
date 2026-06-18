const COUPONS = [
"Lau nhà",
"Hút bụi",
"Rửa bát",
"Phơi quần áo",
"Dọn nhà",
"Học bài",
"Nấu cơm"
];

const EXPIRE_TIME = 72 * 60 * 60 * 1000;
const FREE_SPIN_TIME = 24 * 60 * 60 * 1000;
const WARNING_TIME = 5 * 60 * 60 * 1000;

let selectedCouponIndex = null;
let holdTimer;

function loadData() {
return JSON.parse(localStorage.getItem("couponData")) || {
coupons: [],
bonusSpins: 0,
lastSpin: 0
};
}

function saveData(data) {
localStorage.setItem("couponData", JSON.stringify(data));
}

function formatTime(ms) {

```
let total = Math.floor(ms / 1000);

const d = Math.floor(total / 86400);
total %= 86400;

const h = Math.floor(total / 3600);
total %= 3600;

const m = Math.floor(total / 60);

return `⏳ ${d}d ${h}h ${m}m`;
```

}

function getCouponColor(coupon) {

```
if (coupon.status === "used")
    return "gray";

const left =
    coupon.expireAt - Date.now();

if (left <= 0)
    return "red";

if (left <= WARNING_TIME)
    return "yellow";

return "green";
```

}

function getCouponText(coupon) {

```
if (coupon.status === "used")
    return "⚫ USED";

const left =
    coupon.expireAt - Date.now();

if (left <= 0)
    return "🔴 EXPIRED";

return formatTime(left);
```

}

function renderCoupons() {

```
const data = loadData();

const container =
    document.getElementById(
        "couponContainer"
    );

container.innerHTML = "";

data.coupons.forEach(
    (coupon, index) => {

    const card =
        document.createElement("div");

    card.className =
        `coupon ${getCouponColor(coupon)}`;

    card.innerHTML = `
        <h3>${coupon.name}</h3>
        <p>${getCouponText(coupon)}</p>
    `;

    card.onclick = () => {

        if (
            coupon.status === "used" ||
            coupon.expireAt <= Date.now()
        ) return;

        selectedCouponIndex = index;

        document
            .getElementById(
                "couponName"
            ).textContent =
            coupon.name;

        document
            .getElementById(
                "couponModal"
            )
            .classList
            .remove("hidden");

    };

    container.appendChild(card);

});
```

}

function canSpin() {

```
const data = loadData();

if (data.bonusSpins > 0)
    return true;

return (
    Date.now() - data.lastSpin
    >= FREE_SPIN_TIME
);
```

}

function startSpin() {

```
if (!canSpin()) {

    alert(
        "Chưa đến thời gian quay."
    );

    return;

}

const spinAnim =
    document.getElementById(
        "spinAnimation"
    );

spinAnim.innerHTML = `
    <div>🎁</div>
    <div style="
    font-size:18px;
    margin-top:15px;">
    SPINNING...
    </div>
`;

document
    .getElementById(
        "startSpinBtn"
    )
    .disabled = true;

setTimeout(() => {

    const result =
        COUPONS[
            Math.floor(
                Math.random()
                * COUPONS.length
            )
        ];

    const data = loadData();

    if (
        data.bonusSpins > 0
    ) {

        data.bonusSpins--;

    } else {

        data.lastSpin =
            Date.now();

    }

    data.coupons.unshift({

        name: result,

        status: "active",

        createdAt:
            Date.now(),

        expireAt:
            Date.now()
            + EXPIRE_TIME

    });

    saveData(data);

    document
        .getElementById(
            "spinModal"
        )
        .classList
        .add("hidden");

    document
        .getElementById(
            "resultModal"
        )
        .classList
        .remove("hidden");

    document
        .getElementById(
            "resultCoupon"
        )
        .textContent =
        result;

    document
        .getElementById(
            "resultExpire"
        )
        .textContent =
        "Expires in 3 days";

    document
        .getElementById(
            "startSpinBtn"
        )
        .disabled = false;

    renderCoupons();

}, 5000);
```

}

function updateCooldown() {

```
const data = loadData();

const box =
    document.getElementById(
        "cooldownText"
    );

if (
    data.bonusSpins > 0
) {

    box.textContent =
        `🎁 Bonus Spins: ${data.bonusSpins}`;

    return;

}

const left =
    FREE_SPIN_TIME -
    (
        Date.now()
        - data.lastSpin
    );

if (left <= 0) {

    box.textContent =
        "🎁 Free Spin Ready";

    return;

}

let total =
    Math.floor(
        left / 1000
    );

const h =
    Math.floor(
        total / 3600
    );

total %= 3600;

const m =
    Math.floor(
        total / 60
    );

const s =
    total % 60;

box.textContent =
    `⏳ ${h}h ${m}m ${s}s`;
```

}

document.addEventListener(
"DOMContentLoaded",
() => {

```
renderCoupons();

updateCooldown();

setInterval(() => {

    renderCoupons();

    updateCooldown();

}, 1000);

const btn =
    document.getElementById(
        "floatingBtn"
    );

btn.onclick = () => {

    document
        .getElementById(
            "spinModal"
        )
        .classList
        .remove("hidden");

};

btn.addEventListener(
    "touchstart",
    () => {

    holdTimer =
        setTimeout(
            () => {

        location.href =
            "admin.html";

    }, 3000);

});

btn.addEventListener(
    "touchend",
    () => {

    clearTimeout(
        holdTimer
    );

});

document
    .getElementById(
        "closeSpinBtn"
    )
    .onclick = () => {

    document
        .getElementById(
            "spinModal"
        )
        .classList
        .add("hidden");

};

document
    .getElementById(
        "startSpinBtn"
    )
    .onclick =
    startSpin;

document
    .getElementById(
        "closeResultBtn"
    )
    .onclick = () => {

    document
        .getElementById(
            "resultModal"
        )
        .classList
        .add("hidden");

};

document
    .getElementById(
        "spinAgainBtn"
    )
    .onclick = () => {

    document
        .getElementById(
            "resultModal"
        )
        .classList
        .add("hidden");

    document
        .getElementById(
            "paymentModal"
        )
        .classList
        .remove("hidden");

};

document
    .getElementById(
        "backPaymentBtn"
    )
    .onclick = () => {

    document
        .getElementById(
            "paymentModal"
        )
        .classList
        .add("hidden");

};

document
    .getElementById(
        "cancelCouponBtn"
    )
    .onclick = () => {

    document
        .getElementById(
            "couponModal"
        )
        .classList
        .add("hidden");

};

document
    .getElementById(
        "useCouponBtn"
    )
    .onclick = () => {

    const data =
        loadData();

    data.coupons[
        selectedCouponIndex
    ].status = "used";

    saveData(data);

    document
        .getElementById(
            "couponModal"
        )
        .classList
        .add("hidden");

    renderCoupons();

};

document
    .getElementById(
        "cooldownBox"
    )
    .onclick = () => {

    document
        .getElementById(
            "skipModal"
        )
        .classList
        .remove("hidden");

};

document
    .getElementById(
        "closeSkipBtn"
    )
    .onclick = () => {

    document
        .getElementById(
            "skipModal"
        )
        .classList
        .add("hidden");

};
```

});

```
```
