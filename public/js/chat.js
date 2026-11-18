(function () {
  "use strict";

  var form = document.getElementById("chat-form");
  if (!form) return;

  var list = document.getElementById("chat-messages");
  var input = document.getElementById("chat-input");
  var sendBtn = document.getElementById("chat-send");
  var counter = document.getElementById("chat-counter");
  var maxLen = Number(form.getAttribute("data-max")) || 300;

  var loading = false;
  var loadingEl = null;

  var GAYA = {
    user: {
      row: "flex justify-end",
      bubble:
        "max-w-[85%] rounded-2xl rounded-br-sm bg-slate-900 text-white px-3 py-2 text-sm whitespace-pre-wrap break-words",
    },
    ai: {
      row: "flex justify-start",
      bubble:
        "max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-slate-200 px-3 py-2 text-sm whitespace-pre-wrap break-words",
    },
    error: {
      row: "flex justify-start",
      bubble:
        "max-w-[85%] rounded-2xl rounded-bl-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm break-words",
    },
  };

  function scrollKeBawah() {
    list.scrollTop = list.scrollHeight;
  }

  function tambahPesan(tipe, teks) {
    var gaya = GAYA[tipe];
    var row = document.createElement("div");
    row.className = gaya.row;
    var bubble = document.createElement("div");
    bubble.className = gaya.bubble;
    bubble.textContent = teks;
    row.appendChild(bubble);
    list.appendChild(row);
    scrollKeBawah();
  }

  // Indikator loading: tiga titik yang memantul
  function tampilLoading() {
    loadingEl = document.createElement("div");
    loadingEl.className = "flex justify-start";
    loadingEl.setAttribute("data-loading", "true");
    var bubble = document.createElement("div");
    bubble.className =
      "rounded-2xl rounded-bl-sm bg-white border border-slate-200 px-4 py-3 flex items-center gap-1";
    bubble.setAttribute("aria-label", "Asisten sedang mengetik");
    for (var i = 0; i < 3; i++) {
      var dot = document.createElement("span");
      dot.className = "w-2 h-2 rounded-full bg-slate-400 animate-bounce";
      dot.style.animationDelay = i * 150 + "ms";
      bubble.appendChild(dot);
    }
    loadingEl.appendChild(bubble);
    list.appendChild(loadingEl);
    scrollKeBawah();
  }

  function hapusLoading() {
    if (loadingEl && loadingEl.parentNode)
      loadingEl.parentNode.removeChild(loadingEl);
    loadingEl = null;
  }

  function setLoading(status) {
    loading = status;
    sendBtn.disabled = status;
    input.disabled = status;
    sendBtn.textContent = status ? "Menunggu..." : "Kirim";
  }

  function perbaruiInput() {
    counter.textContent = String(input.value.length);
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  }

  async function kirim(teks) {
    tambahPesan("user", teks);
    input.value = "";
    perbaruiInput();
    setLoading(true);
    tampilLoading();

    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, 45000);

    try {
      var res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: teks }),
        signal: controller.signal,
      });

      var data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }

      if (!res.ok || !data || !data.success) {
        var pesan =
          (data && data.error && data.error.message) ||
          "Terjadi kesalahan. Silakan coba lagi.";
        tambahPesan("error", pesan);
      } else {
        tambahPesan("ai", data.data.reply);
      }
    } catch (err) {
      tambahPesan(
        "error",
        err && err.name === "AbortError"
          ? "Permintaan terlalu lama. Silakan coba lagi."
          : "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } finally {
      clearTimeout(timer);
      hapusLoading();
      setLoading(false);
      input.focus();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (loading) return;
    var teks = input.value.trim();
    if (!teks) return;
    if (teks.length > maxLen) {
      tambahPesan(
        "error",
        "Pesan terlalu panjang. Maksimal " + maxLen + " karakter.",
      );
      return;
    }
    kirim(teks);
  });

  // Enter = kirim, Shift+Enter = baris baru
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  input.addEventListener("input", perbaruiInput);

  // Tombol pertanyaan cepat
  document
    .querySelectorAll("#chat-suggestions [data-pertanyaan]")
    .forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (loading) return;
        kirim(btn.getAttribute("data-pertanyaan"));
      });
    });
})();
