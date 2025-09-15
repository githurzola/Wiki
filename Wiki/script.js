document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadBtn");
  const searchInput = document.getElementById("searchInput");
  const tocItems = Array.from(document.querySelectorAll("#toc li"));
  const tocLinks = Array.from(document.querySelectorAll("#toc li a"));
  const content = document.getElementById("content");

  // --- Descargar PDF como texto estructurado ---
  downloadBtn.addEventListener("click", () => {
    downloadBtn.disabled = true;
    downloadBtn.textContent = "Generando PDF...";

    try {
      if (typeof window.jspdf === "undefined") {
        throw new Error("Falta la librería jsPDF (cárgala desde CDN).");
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      let y = 20;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      function addText(txt, size = 12, bold = false, spacing = 8) {
        if (!txt || !txt.trim()) return;

        // ❌ Saltar si el texto contiene "Video explicativo"
        if (txt.toLowerCase().includes("video explicativo")) return;

        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");

        const lines = doc.splitTextToSize(txt.trim(), pageWidth);
        doc.text(lines, margin, y);
        y += lines.length * 6 + spacing;

        if (y > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
        }
      }

      content.querySelectorAll("h1, h2, h3, p, li, table").forEach(el => {
        const txt = el.innerText || "";
        if (txt.toLowerCase().includes("video explicativo")) return; // filtro directo

        if (el.tagName === "H1") {
          addText(txt, 18, true, 10);
        } else if (el.tagName === "H2") {
          addText(txt, 15, true, 8);
        } else if (el.tagName === "H3") {
          addText(txt, 13, true, 6);
        } else if (el.tagName === "P") {
          addText(txt, 12, false, 6);
        } else if (el.tagName === "LI") {
          if (txt.trim()) addText("• " + txt, 12, false, 4);
        } else if (el.tagName === "TABLE") {
          const rows = Array.from(el.querySelectorAll("tr")).map(tr =>
            Array.from(tr.querySelectorAll("th, td"))
              .map(cell => cell.innerText.trim())
              .join(" | ")
          );
          rows.forEach(r => addText(r, 11, false, 4));
        }
      });

      doc.save("Wiki_Temperatura_Resumen.pdf");
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("No fue posible generar el PDF. Revisa la consola (F12).");
    } finally {
      setTimeout(() => {
        downloadBtn.disabled = false;
        downloadBtn.textContent = "Descargar PDF";
      }, 1200);
    }
  });

  // --- Buscador ---
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    tocItems.forEach(li => {
      const a = li.querySelector("a");
      const txt = a.textContent.toLowerCase();
      li.style.display = txt.includes(q) ? "" : "none";
    });
  });

  // --- Resaltar sección activa ---
  const sections = document.querySelectorAll("article, section.card");
  const options = { threshold: 0.6 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (!id) return;
        tocLinks.forEach(link => link.classList.remove("active"));
        const active = document.querySelector(`#toc a[href="#${id}"]`);
        if (active) active.classList.add("active");
      }
    });
  }, options);

  document.querySelectorAll("article[id], section[id]").forEach(sec => observer.observe(sec));
});
