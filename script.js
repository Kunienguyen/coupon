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
const DAILY_USE_LIMIT = 5;

let selectedCouponIndex = null;
let holdTimer = null;

function loadData() {

    return JSON.parse(
        localStorage.getItem("couponData")
    ) || {

        coupons: [],
        bonusSpins: 0,
        lastSpin: 0

    };

}

function saveData(data) {

    localStorage.setItem(
        "couponData",
        JSON.stringify(data)
    );

}

function formatTime(ms) {

    let total =
        Math.floor(ms / 1000);

    const d =
        Math.floor(total / 86400);

    total %= 86400;

    const h =
        Math.floor(total / 3600);

    total %= 3600;

    const m =
        Math.floor(total / 60);

    if (d > 0) {
        return `⏳ ${d}d ${h}h`;
    }

    if (h > 0) {
        return `⏳ ${h}h ${m}m`;
    }

    return `⚠️ ${m}m`;

}

function usedCouponsLast24h() {

    const data =
        loadData();

    const now =
        Date.now();

    return data.coupons.filter(c =>

        c.usedAt &&
        now - c.usedAt <
        24 * 60 * 60 * 1000

    ).length;

}

function getCouponColor(coupon) {

    if (
        coupon.status === "used"
    ) {
        return "gray";
    }

    const left =
        coupon.expireAt -
        Date.now();

    if (left <= 0) {
        return "red";
    }

    if (left <= WARNING_TIME) {
        return "yellow";
    }

    return "green";

}

function getCouponText(coupon) {

    if (
        coupon.status === "used"
    ) {
        return "⚫ USED";
    }

    const left =
        coupon.expireAt -
        Date.now();

    if (left <= 0) {
        return "🔴 EXPIRED";
    }

    return formatTime(left);

}

function updateUsageInfo() {

    const used =
        usedCouponsLast24h();

    const el =
        document.getElementById(
            "usageInfo"
        );

    if (el) {

        el.textContent =
            `🎟️ Used Today: ${used} / ${DAILY_USE_LIMIT}`;

    }

}

function updateStats() {

    const data =
        loadData();

    const total =
        data.coupons.length;

    const active =
        data.coupons.filter(c =>

            c.status !== "used" &&
            c.expireAt > Date.now()

        ).length;

    const used =
        data.coupons.filter(c =>

            c.status === "used"

        ).length;

    const expired =
        data.coupons.filter(c =>

            c.status !== "used" &&
            c.expireAt <= Date.now()

        ).length;

    document.getElementById(
        "totalCoupons"
    ).textContent = total;

    document.getElementById(
        "activeCoupons"
    ).textContent = active;

    document.getElementById(
        "usedCoupons"
    ).textContent = used;

    document.getElementById(
        "expiredCoupons"
    ).textContent = expired;

}

function renderCoupons() {

    const data =
        loadData();

    const container =
        document.getElementById(
            "couponContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    data.coupons.forEach(
        (coupon, index) => {

            const card =
                document.createElement(
                    "div"
                );

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
                ) {
                    return;
                }

                selectedCouponIndex =
                    index;

                document
                    .getElementById(
                        "couponName"
                    )
                    .textContent =
                    coupon.name;

                document
                    .getElementById(
                        "couponModal"
                    )
                    .classList
                    .remove("hidden");

            };

            container.appendChild(card);

        }
    );

}

function canSpin() {

    const data =
        loadData();

    if (
        data.bonusSpins > 0
    ) {
        return true;
    }

    return (
        Date.now() -
        data.lastSpin >=
        FREE_SPIN_TIME
    );

}function startSpin() {

    if (!canSpin()) {

        alert("Chưa đến thời gian quay.");

        return;

    }

    const spinAnim =
        document.getElementById(
            "spinAnimation"
        );

    spinAnim.innerHTML = `
        <div>🎁</div>
        <div style="font-size:18px;margin-top:10px;">
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

        const data =
            loadData();

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

        const win =
            document.getElementById(
                "winSound"
            );

        if (win) {

            win.currentTime = 0;

            win.play()
                .catch(() => {});

        }

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

        updateStats();

    }, 5000);

}

function updateCooldown() {

    const data =
        loadData();

    const box =
        document.getElementById(
            "cooldownText"
        );

    if (!box) return;

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
        Math.floor(left / 1000);

    const h =
        Math.floor(total / 3600);

    total %= 3600;

    const m =
        Math.floor(total / 60);

    const s =
        total % 60;

    box.textContent =
        `⏳ ${h}h ${m}m ${s}s`;

}

function showUsedPopup() {

    const popup =
        document.getElementById(
            "usedPopup"
        );

    if (!popup) return;

    popup.classList.remove(
        "hidden"
    );

    setTimeout(() => {

        popup.classList.add(
            "hidden"
        );

    }, 1200);

}

document.addEventListener(
"DOMContentLoaded",
() => {

    renderCoupons();

    updateCooldown();

    updateUsageInfo();

    updateStats();

    setInterval(() => {

        renderCoupons();

        updateCooldown();

        updateUsageInfo();

        updateStats();

    }, 1000);

    const clickSound =
        document.getElementById(
            "clickSound"
        );

    document
        .querySelectorAll("button")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    if (
                        clickSound
                    ) {

                        clickSound.currentTime = 0;

                        clickSound.play()
                            .catch(() => {});

                    }

                }
            );

        });

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
                setTimeout(() => {

                    location.href =
                        "admin.html";

                }, 3000);

        }
    );

    btn.addEventListener(
        "touchend",
        () => {

            clearTimeout(
                holdTimer
            );

        }
    );

    document.getElementById(
        "closeSpinBtn"
    ).onclick = () => {

        document
            .getElementById(
                "spinModal"
            )
            .classList
            .add("hidden");

    };

    document.getElementById(
        "startSpinBtn"
    ).onclick =
    startSpin;

    document.getElementById(
        "closeResultBtn"
    ).onclick = () => {

        document
            .getElementById(
                "resultModal"
            )
            .classList
            .add("hidden");

    };

    document.getElementById(
        "spinAgainBtn"
    ).onclick = () => {

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

    document.getElementById(
        "backPaymentBtn"
    ).onclick = () => {

        document
            .getElementById(
                "paymentModal"
            )
            .classList
            .add("hidden");

    };

    document.getElementById(
        "cancelCouponBtn"
    ).onclick = () => {

        document
            .getElementById(
                "couponModal"
            )
            .classList
            .add("hidden");

    };

    document.getElementById(
        "useCouponBtn"
    ).onclick = () => {

        if (
            usedCouponsLast24h()
            >= DAILY_USE_LIMIT
        ) {

            alert(
                "Đã dùng tối đa 5 coupon trong 24 giờ."
            );

            return;

        }

        const data =
            loadData();

        data.coupons[
            selectedCouponIndex
        ].status = "used";

        data.coupons[
            selectedCouponIndex
        ].usedAt =
            Date.now();

        saveData(data);

        document
            .getElementById(
                "couponModal"
            )
            .classList
            .add("hidden");

        showUsedPopup();

        renderCoupons();

        updateUsageInfo();

        updateStats();

    };

    document.getElementById(
        "cooldownBox"
    ).onclick = () => {

        document
            .getElementById(
                "skipModal"
            )
            .classList
            .remove("hidden");

    };

    document.getElementById(
        "closeSkipBtn"
    ).onclick = () => {

        document
            .getElementById(
                "skipModal"
            )
            .classList
            .add("hidden");

    };

});

/* Blue Archive trail */

const canvas =
document.getElementById(
    "trailCanvas"
);

if (canvas) {

    const ctx =
        canvas.getContext("2d");

    function resizeCanvas() {

        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;

    }

    resizeCanvas();

    window.addEventListener(
        "resize",
        resizeCanvas
    );

    const particles = [];

    function spawn(x, y) {

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            particles.push({

                x:
                    x +
                    (Math.random() - 0.5) * 10,

                y:
                    y +
                    (Math.random() - 0.5) * 10,

                size:
                    5 +
                    Math.random() * 8,

                alpha: 1

            });

        }

    }

    document.addEventListener(
        "mousemove",
        e => {

            spawn(
                e.clientX,
                e.clientY
            );

        }
    );

    document.addEventListener(
        "touchmove",
        e => {

            const t =
                e.touches[0];

            spawn(
                t.clientX,
                t.clientY
            );

        }
    );

    function animate() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        for (
            let i =
            particles.length - 1;
            i >= 0;
            i--
        ) {

            const p =
                particles[i];

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(120,220,255,${p.alpha})`;

            ctx.fill();

            p.alpha -= 0.03;

            p.size -= 0.15;

            if (
                p.alpha <= 0
            ) {

                particles.splice(
                    i,
                    1
                );

            }

        }

        requestAnimationFrame(
            animate
        );

    }

    animate();

}
