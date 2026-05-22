import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// كونفج الفايربيز بتاعك
const firebaseConfig = {
  apiKey: "AIzaSyDwMOax-amBzEm3FDjXKN8yBbB3cXNbb14",
  authDomain: "taskhub-9d282.firebaseapp.com",
  projectId: "taskhub-9d282",
  storageBucket: "taskhub-9d282.firebasestorage.app",
  messagingSenderId: "981675153894",
  appId: "1:981675153894:web:380c4194bb4ea9e1f51e27",
  measurementId: "G-W3YLPQ27YS"
};

// تشغيل الفايربيز
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// اسم الكوليكشن الخاص بالملابس
const productsRef = collection(db, "risk_products");

// --- 1. تشغيل كود الصفحة الرئيسية للزبون ---
if (document.getElementById("products-display")) {
    const productsDisplay = document.getElementById("products-display");
    
    // سحب المنتجات لايف (تحديث فوري أول ما ترفع)
    onSnapshot(productsRef, (snapshot) => {
        productsDisplay.innerHTML = "";
        
        if(snapshot.empty) {
            productsDisplay.innerHTML = "<p style='color:#888; text-align:center; grid-column: 1/-1;'>قريباً.. كولكشن جديد فاخر في الطريق!</p>";
            return;
        }

        snapshot.forEach((doc) => {
            const product = doc.data();
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <div class="product-img-wrapper">
                    <img src="${product.imgUrl}" alt="${product.title}" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="product-title">${product.title}</div>
                    <div class="product-price">
                        <span>${product.price} <span class="currency">EGP</span></span>
                    </div>
                </div>
            `;
            productsDisplay.appendChild(card);
        });
    });
}

// --- 2. تشغيل كود لوحة التحكم (الأدمن) ---
if (document.getElementById("admin-form")) {
    const adminForm = document.getElementById("admin-form");
    const adminList = document.getElementById("admin-products-list");

    // رفع منتج جديد
    adminForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const title = document.getElementById("prod-title").value;
        const price = document.getElementById("prod-price").value;
        const imgUrl = document.getElementById("prod-img").value;

        if(!title || !price || !imgUrl) return alert("املي البيانات كلها يا بوبوس!");

        try {
            await addDoc(productsRef, {
                title: title,
                price: price,
                imgUrl: imgUrl,
                createdAt: new Date().toISOString()
            });
            alert("تم رفع القطعة بنجاح والموقع اتحدث!");
            adminForm.reset();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("في مشكلة حصلت، اتأكد من الرابط.");
        }
    });

    // عرض المنتجات في لوحة التحكم مع زرار الحذف
    onSnapshot(productsRef, (snapshot) => {
        adminList.innerHTML = "";
        snapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            const id = documentSnapshot.id;

            const item = document.createElement("div");
            item.className = "admin-product-item";
            item.innerHTML = `
                <div>
                    <strong>${data.title}</strong> - ${data.price} EGP
                </div>
                <button class="btn-delete" data-id="${id}">حذف</button>
            `;
            adminList.appendChild(item);
        });

        // تشغيل أزرار الحذف
        const deleteButtons = document.querySelectorAll(".btn-delete");
        deleteButtons.forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.getAttribute("data-id");
                if(confirm("عايز تمسح القطعة دي من الموقع؟")) {
                    await deleteDoc(doc(db, "risk_products", id));
                }
            });
        });
    });
}
