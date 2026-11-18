// public/js/pesan.js
// Form pesanan: pratinjau plat (F-07), total harga, dan dialog konfirmasi sebelum kirim.
// Validasi utama tetap dilakukan di backend; script ini hanya membantu pengguna.
(function () {
  "use strict";

  var form = document.getElementById("form-pesan");
  if (!form) return;

  var produk = document.getElementById("produkId");
  var plat = document.getElementById("teksPlat");
  var warna = document.getElementById("warna");
  var jumlah = document.getElementById("jumlah");
  var preview = document.getElementById("plat-preview");
  var total = document.getElementById("total");
  var info = document.getElementById("warna-info");
  var dialog = document.getElementById("dialog-konfirmasi");
  var ringkasan = document.getElementById("ringkasan");

  var WARNA = {
    Hitam: { bg: "#111111", fg: "#ffffff", border: "#dddddd" },
    Putih: { bg: "#ffffff", fg: "#111111", border: "#111111" },
    Merah: { bg: "#b91c1c", fg: "#ffffff", border: "#fecaca" },
    Biru: { bg: "#1d4ed8", fg: "#ffffff", border: "#bfdbfe" },
    Kuning: { bg: "#facc15", fg: "#111111", border: "#111111" },
  };

  function opsiTerpilih() {
    return produk.options[produk.selectedIndex];
  }
  function custom() {
    var o = opsiTerpilih();
    return !!o && o.getAttribute("data-custom") === "1";
  }
  function rupiah(n) {
    return "Rp" + Number(n).toLocaleString("id-ID");
  }
  function teksPlat() {
    return plat.value.toUpperCase().replace(/\s+/g, " ").trim();
  }

  function perbarui() {
    // Varian Standar selalu hitam; hanya Custom Warna yang boleh memilih warna
    var boleh = custom();
    warna.disabled = !boleh;
    if (!boleh) warna.value = "Hitam";
    info.textContent = boleh
      ? "Pilih warna plat sesuai keinginan."
      : "Pilihan warna hanya untuk varian Custom Warna.";

    var w = WARNA[warna.value] || WARNA.Hitam;
    preview.style.background = w.bg;
    preview.style.color = w.fg;
    preview.style.borderColor = w.border;
    preview.textContent = teksPlat() || "--";

    var o = opsiTerpilih();
    var harga = o ? Number(o.getAttribute("data-harga")) || 0 : 0;
    var qty = parseInt(jumlah.value, 10);
    total.textContent = rupiah(harga * (qty > 0 ? qty : 0));
  }

  function baris(label, nilai) {
    var dt = document.createElement("dt");
    dt.className = "text-slate-500";
    dt.textContent = label;
    var dd = document.createElement("dd");
    dd.className = "font-medium break-words";
    dd.textContent = nilai; // textContent: aman dari XSS
    ringkasan.appendChild(dt);
    ringkasan.appendChild(dd);
  }

  [produk, warna, jumlah].forEach(function (el) {
    el.addEventListener("change", perbarui);
  });
  [plat, jumlah].forEach(function (el) {
    el.addEventListener("input", perbarui);
  });

  form.addEventListener("submit", function (e) {
    if (form.getAttribute("data-konfirmasi") === "1") return; // sudah dikonfirmasi, kirim ke server
    if (!dialog || typeof dialog.showModal !== "function") return; // browser lama: kirim langsung

    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }
    e.preventDefault();

    ringkasan.textContent = "";
    baris("Varian", opsiTerpilih().textContent.replace(/\s+/g, " ").trim());
    baris("Teks plat", teksPlat());
    baris("Warna", warna.value);
    baris("Jumlah", jumlah.value);
    baris("Nama", document.getElementById("nama").value.trim());
    baris("Nomor HP", document.getElementById("noHp").value.trim());
    baris("Total", total.textContent);
    dialog.showModal();
  });

  document.getElementById("btn-batal").addEventListener("click", function () {
    dialog.close();
  });
  document.getElementById("btn-kirim").addEventListener("click", function () {
    form.setAttribute("data-konfirmasi", "1");
    warna.disabled = false; // field disabled tidak ikut terkirim
    dialog.close();
    form.requestSubmit();
  });

  perbarui();
})();
