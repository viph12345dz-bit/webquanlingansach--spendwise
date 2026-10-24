const moderatorUser = setupAppPage('moderator-resource-review.html', 'moderator');

if (moderatorUser) {
    const searchInput = document.getElementById('globalSearch');
    const statusFilter = document.getElementById('statusFilter');
    const tableContent = document.getElementById('tableContent');

    function getReviewStatus(resource) {
        if (resource.status === 'Đã xuất bản' &&
            resource.moderationStatus !== 'approved') {
            return 'pending';
        }

        if (resource.status === 'Bản nháp' &&
            resource.moderationStatus === 'approved') {
            return 'draft';
        }

        if (resource.reviewSnapshot &&
            (resource.reviewSnapshot.title !== resource.title ||
                resource.reviewSnapshot.format !== resource.format ||
                resource.reviewSnapshot.updated !== resource.updated)) {
            return resource.status === 'Đã xuất bản' ? 'pending' : 'draft';
        }

        const savedStatus = resource.moderationStatus || resource.status;

        if (savedStatus === 'approved' || savedStatus === 'Đã duyệt') {
            return 'approved';
        }
        if (savedStatus === 'rejected' || savedStatus === 'Từ chối') {
            return 'rejected';
        }
        if (savedStatus === 'needs-revision' || savedStatus === 'Cần sửa') {
            return 'needs-revision';
        }
        if (savedStatus === 'Bản nháp') {
            return 'draft';
        }

        // Coach pages currently use “Đã xuất bản” for items waiting for review.
        return 'pending';
    }

    function getStatusLabel(status) {
        const labels = {
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối',
            'needs-revision': 'Yêu cầu sửa',
            draft: 'Bản nháp Coach'
        };

        return labels[status] || 'Chờ duyệt';
    }

    function renderPage() {
        const resources = getUserData('resources', []);
        const keyword = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;
        const counts = {
            pending: 0,
            approved: 0,
            rejected: 0,
            'needs-revision': 0,
            draft: 0
        };
        const rows = [];

        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i];
            const status = getReviewStatus(resource);
            const searchableText = [
                resource.title,
                resource.format,
                resource.description,
                resource.content,
                resource.coachName,
                resource.author,
                resource.coachId
            ].join(' ').toLowerCase();

            counts[status]++;

            if (keyword && searchableText.indexOf(keyword) === -1) {
                continue;
            }
            if (selectedStatus !== 'all' && selectedStatus !== status) {
                continue;
            }

            let actions = '<span class="muted">Bản nháp chưa gửi</span>';

            if (status === 'pending') {
                actions = '<div class="actions review-actions">' +
                    '<button class="link-button" data-review="' + cleanText(resource.id) +
                    '" data-status="approved" type="button">Duyệt</button>' +
                    '<button class="link-button danger" data-review="' + cleanText(resource.id) +
                    '" data-status="rejected" type="button">Từ chối</button>' +
                    '<button class="link-button" data-review="' + cleanText(resource.id) +
                    '" data-status="needs-revision" type="button">Yêu cầu sửa</button></div>';
            } else if (status !== 'draft') {
                actions = '<button class="link-button" data-review="' + cleanText(resource.id) +
                    '" data-status="pending" type="button">Đưa về chờ duyệt</button>';
            }

            rows.push(
                '<tr><td><span class="resource-title">' +
                    cleanText(resource.title || 'Chưa đặt tên') +
                    '</span><span class="resource-description">' +
                    cleanText(resource.description || resource.content || resource.format || '—') +
                    '</span></td>' +
                '<td>' + cleanText(resource.coachName || resource.author || resource.coachId || 'Coach') + '</td>' +
                '<td>' + statusLabel(getStatusLabel(status)) + '</td>' +
                '<td class="review-note">' + cleanText(resource.reviewNote || '—') + '</td>' +
                '<td>' + actions + '</td></tr>'
            );
        }

        renderStats([
            [counts.pending, 'Chờ duyệt'],
            [counts.approved, 'Đã duyệt'],
            [counts.rejected, 'Từ chối'],
            [counts['needs-revision'], 'Yêu cầu sửa']
        ]);

        if (rows.length === 0) {
            tableContent.innerHTML =
                '<div class="empty-state"><strong>Không có tài nguyên phù hợp</strong>' +
                '<span>Tài nguyên Coach gửi duyệt sẽ xuất hiện tại đây.</span></div>';
        } else {
            tableContent.innerHTML =
                '<div class="table-wrap"><table class="data-table">' +
                '<thead><tr><th>Tài nguyên</th><th>Coach</th><th>Trạng thái</th>' +
                '<th>Ghi chú kiểm duyệt</th><th>Thao tác</th></tr></thead>' +
                '<tbody>' + rows.join('') + '</tbody></table></div>';
        }

        bindReviewButtons();
    }

    function bindReviewButtons() {
        const buttons = document.querySelectorAll('[data-review]');

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function () {
                const id = this.dataset.review;
                const status = this.dataset.status;

                if (status === 'approved' || status === 'pending') {
                    saveReview(id, status, '');
                } else {
                    openReviewForm(id, status);
                }
            });
        }
    }

    function openReviewForm(id, status) {
        const isRejection = status === 'rejected';
        const title = isRejection ? 'Từ chối tài nguyên' : 'Yêu cầu Coach chỉnh sửa';
        const label = isRejection ? 'Lý do từ chối' : 'Nội dung cần chỉnh sửa';

        openModal(title, '<form id="reviewForm">' +
            '<div class="field"><label for="reviewNote">' + label + '</label>' +
                '<textarea id="reviewNote" rows="4" maxlength="500" required></textarea></div>' +
            '<p id="reviewMessage" class="form-message" aria-live="polite"></p>' +
            '<div class="modal-actions">' +
                '<button class="btn btn-outline" id="cancelReview" type="button">Hủy</button>' +
                '<button class="btn btn-primary" type="submit">Lưu kết quả</button>' +
            '</div></form>'
        );

        document.getElementById('cancelReview').addEventListener('click', closeModal);
        document.getElementById('reviewForm').addEventListener('submit', function (event) {
            event.preventDefault();
            const note = document.getElementById('reviewNote').value.trim();

            if (!note) {
                document.getElementById('reviewMessage').textContent = 'Vui lòng nhập ghi chú.';
                return;
            }

            saveReview(id, status, note);
        });
    }

    function saveReview(id, status, note) {
        const resources = getUserData('resources', []);
        const resource = findItemById(resources, id);

        if (!resource) {
            showToast('Không tìm thấy tài nguyên cần cập nhật.', 'error');
            closeModal();
            return;
        }

        resource.moderationStatus = status;
        resource.reviewNote = status === 'approved' || status === 'pending' ? '' : note;
        resource.reviewedAt = new Date().toISOString();
        resource.reviewedBy = moderatorUser.id;
        resource.reviewSnapshot = {
            title: resource.title,
            format: resource.format,
            updated: resource.updated
        };

        // Keep the status values that the current Coach page already understands.
        resource.status = status === 'approved' ? 'Đã xuất bản' : 'Bản nháp';

        saveUserData('resources', resources);
        closeModal();
        showToast('Đã lưu kết quả kiểm duyệt.');
        renderPage();
    }

    searchInput.addEventListener('input', renderPage);
    statusFilter.addEventListener('change', renderPage);
    renderPage();
}
