const initialInsights = [
  {
    id: 1,
    finding: "Ăn uống cuối tuần",
    detail: "Cao hơn 24% mức thường",
    impact: "-820.000 đ",
    status: "done"
  },
  {
    id: 2,
    finding: "Đăng ký định kỳ",
    detail: "3 dịch vụ ít sử dụng",
    impact: "-390.000 đ",
    status: "done"
  },
  {
    id: 3,
    finding: "Gợi ý tuần này",
    detail: "Giới hạn 1,2 triệu",
    impact: "Tiết kiệm +8%",
    status: "rejected"
  }
];

const statusLabels = {
  done: "Hoàn tất",
  rejected: "Từ chối",
  pending: "Đang chờ"
};

let insights = [...initialInsights];

const rowsElement = document.querySelector("#insightRows");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const emptyState = document.querySelector("#emptyState");
const resultCount = document.querySelector("#resultCount");
const modal = document.querySelector("#insightModal");
const form = document.querySelector("#insightForm");
const formError = document.querySelector("#formError");

function renderInsights() {
  const keyword = searchInput.value.trim().toLocaleLowerCase("vi");
  const selectedStatus = statusFilter.value;

  const filtered = insights.filter((item) => {
    const searchableText = `${item.finding} ${item.detail} ${item.impact}`.toLocaleLowerCase("vi");
    const matchesKeyword = searchableText.includes(keyword);
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    return matchesKeyword && matchesStatus;
  });

  rowsElement.innerHTML = filtered.map((item) => `
    <tr>
      <td>${escapeHTML(item.finding)}</td>
      <td>${escapeHTML(item.detail)}</td>
      <td>${escapeHTML(item.impact)}</td>
      <td><span class="status ${item.status}">${statusLabels[item.status]}</span></td>
      <td>
        <div class="row-actions">
          <button class="row-action" type="button" data-action="cycle" data-id="${item.id}" title="Đổi trạng thái" aria-label="Đổi trạng thái của ${escapeHTML(item.finding)}">↻</button>
          <button class="row-action" type="button" data-action="delete" data-id="${item.id}" title="Xóa gợi ý" aria-label="Xóa ${escapeHTML(item.finding)}">×</button>
        </div>
      </td>
    </tr>
  `).join("");

  emptyState.hidden = filtered.length > 0;
  resultCount.textContent = `${filtered.length} / ${insights.length} gợi ý`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

searchInput.addEventListener("input", renderInsights);
statusFilter.addEventListener("change", renderInsights);

rowsElement.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "delete") {
    insights = insights.filter((item) => item.id !== id);
  } else if (action === "cycle") {
    const order = ["pending", "done", "rejected"];
    insights = insights.map((item) => {
      if (item.id !== id) return item;
      const nextStatus = order[(order.indexOf(item.status) + 1) % order.length];
      return { ...item, status: nextStatus };
    });
  }
  renderInsights();
});

document.querySelector("#openModalBtn").addEventListener("click", () => {
  form.reset();
  formError.textContent = "";
  modal.showModal();
  document.querySelector("#findingInput").focus();
});

function closeModal() {
  modal.close();
  formError.textContent = "";
}

document.querySelector("#closeModalBtn").addEventListener("click", closeModal);
document.querySelector("#cancelModalBtn").addEventListener("click", closeModal);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const finding = document.querySelector("#findingInput").value.trim();
  const detail = document.querySelector("#detailInput").value.trim();
  const impact = document.querySelector("#impactInput").value.trim();
  const status = document.querySelector("#newStatus").value;

  if (!finding || !detail || !impact) {
    formError.textContent = "Vui lòng điền đầy đủ các trường.";
    return;
  }

  insights.unshift({
    id: Date.now(),
    finding,
    detail,
    impact,
    status
  });

  closeModal();
  searchInput.value = "";
  statusFilter.value = "all";
  renderInsights();
});

const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
const sidebar = document.querySelector(".sidebar");

mobileMenuBtn.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("open");
  mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
  mobileMenuBtn.textContent = isOpen ? "✕" : "☰";
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((navLink) => navLink.classList.remove("active"));
    link.classList.add("active");
    sidebar.classList.remove("open");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    mobileMenuBtn.textContent = "☰";
  });
});

renderInsights();
