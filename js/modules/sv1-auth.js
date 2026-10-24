(function () {
    'use strict';

    const roles = ['user', 'coach', 'moderator', 'admin'];

    function readList(key) {
        const raw = localStorage.getItem(key);
        const items = raw === null ? [] : JSON.parse(raw);
        if (!Array.isArray(items) || items.some(function (item) {
            return !item || typeof item !== 'object' || Array.isArray(item) || !item.id;
        })) {
            throw new Error('Dữ liệu ' + key + ' không hợp lệ. Chưa ghi đè dữ liệu.');
        }
        return items;
    }

    function readSession(key) {
        const raw = localStorage.getItem(key);
        const session = raw === null ? null : JSON.parse(raw);
        if (session !== null && (typeof session !== 'object' || !session.userId)) {
            throw new Error('Phiên đăng nhập không hợp lệ. Hãy đăng nhập lại.');
        }
        return session;
    }

    function isActive(user) {
        return user && roles.includes(user.role) && user.active !== false &&
            user.disabled !== true && user.status !== 'disabled';
    }

    // Kho cũ đang được Admin/Profile sử dụng: chỉ đồng bộ tài khoản vừa thao tác.
    function accounts() {
        if (localStorage.getItem(STORAGE_USERS) !== null) {
            return readList(STORAGE_USERS);
        }
        return readList('sw_users');
    }

    function findByEmail(email) {
        const items = accounts();
        for (let i = 0; i < items.length; i++) {
            if (String(items[i].email || '').trim().toLowerCase() === email) {
                return items[i];
            }
        }
        return null;
    }

    function currentUser() {
        const session = readSession('sw_session');
        if (localStorage.getItem(STORAGE_USERS) !== null) {
            const legacySession = readSession(STORAGE_SESSION);
            if (!legacySession) {
                return null;
            }
            const user = accounts().find(function (item) {
                return item.id === legacySession.userId;
            });
            if (!isActive(user) || (session && session.userId !== user.id)) {
                return null;
            }
            const contractUser = readList('sw_users').find(function (item) {
                return item.id === user.id;
            });
            if (contractUser && !isActive(contractUser)) {
                return null;
            }
            return user;
        }
        if (!session) {
            return null;
        }
        const user = readList('sw_users').find(function (item) {
            return item.id === session.userId && item.role === session.role;
        });
        return isActive(user) ? user : null;
    }

    // localStorage không có transaction: khôi phục các khóa đã ghi nếu một bước lỗi.
    function commit(changes) {
        const previous = changes.map(function (change) {
            return localStorage.getItem(change.key);
        });
        let written = 0;
        try {
            for (let i = 0; i < changes.length; i++) {
                if (changes[i].value === null) {
                    localStorage.removeItem(changes[i].key);
                } else {
                    localStorage.setItem(changes[i].key, JSON.stringify(changes[i].value));
                }
                written++;
            }
        } catch (error) {
            for (let i = written - 1; i >= 0; i--) {
                try {
                    if (previous[i] === null) {
                        localStorage.removeItem(changes[i].key);
                    } else {
                        localStorage.setItem(changes[i].key, previous[i]);
                    }
                } catch (restoreError) {
                    // Trình duyệt đang chặn storage; báo lỗi để người dùng kiểm tra.
                }
            }
            throw new Error('Không lưu được dữ liệu. Kiểm tra quyền localStorage hoặc dung lượng rồi thử lại.');
        }
    }

    function accountChanges(user) {
        const legacy = accounts();
        const contract = readList('sw_users').map(function (item) {
            // Admin/Profile còn ghi kho cũ: cập nhật bản sao cùng ID trước khi lưu.
            return legacy.find(function (current) { return current.id === item.id; }) || item;
        }).filter(function (item) {
            const sameEmail = String(item.email || '').trim().toLowerCase() === user.email;
            const stillExists = legacy.some(function (current) { return current.id === item.id; });
            // Email đã được Admin giải phóng có thể dùng lại, không hồi sinh tài khoản đã xóa.
            return item.id === user.id || !sameEmail || stillExists;
        });
        [legacy, contract].forEach(function (items) {
            const index = items.findIndex(function (item) { return item.id === user.id; });
            if (index === -1) {
                items.push(user);
            } else {
                items[index] = user;
            }
        });
        return [
            { key: 'sw_users', value: contract },
            { key: STORAGE_USERS, value: legacy }
        ];
    }

    function register(user) {
        const duplicate = accounts().some(function (item) {
            return String(item.email || '').trim().toLowerCase() === user.email;
        });
        if (duplicate) {
            throw new Error('Email này đã được đăng ký.');
        }
        if (!roles.includes(user.role)) {
            throw new Error('Chọn vai trò demo hợp lệ.');
        }
        commit(accountChanges(user));
    }

    function signIn(user) {
        if (!isActive(user)) {
            throw new Error('Tài khoản demo đã bị vô hiệu hóa.');
        }
        const changes = accountChanges(user);
        changes.push({ key: 'sw_session', value: { userId: user.id, role: user.role } });
        changes.push({ key: STORAGE_SESSION, value: { userId: user.id } });
        commit(changes);
    }

    function resetPassword(user, password) {
        user.password = password;
        const changes = accountChanges(user);
        const contractSession = readSession('sw_session');
        const legacySession = readSession(STORAGE_SESSION);
        if (contractSession && contractSession.userId === user.id) {
            changes.push({ key: 'sw_session', value: null });
        }
        if (legacySession && legacySession.userId === user.id) {
            changes.push({ key: STORAGE_SESSION, value: null });
        }
        commit(changes);
    }

    function signOut() {
        commit([
            { key: 'sw_session', value: null },
            { key: STORAGE_SESSION, value: null }
        ]);
    }

    function destination(user) {
        const page = user.role === 'user' ? 'user-finance-dashboard.html' : DEFAULT_PAGES[user.role];
        return pageUrl(page || 'login.html');
    }

    function emailError(email) {
        return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ?
            '' : 'Nhập email hợp lệ, ví dụ ban@example.test.';
    }

    function passwordError(password) {
        return password.trim() && password.length >= 6 && password.length <= 72 ?
            '' : 'Mật khẩu demo cần từ 6 đến 72 ký tự, không chỉ gồm khoảng trắng.';
    }

    window.SV1Auth = {
        accounts: accounts,
        findByEmail: findByEmail,
        currentUser: currentUser,
        register: register,
        signIn: signIn,
        signOut: signOut,
        resetPassword: resetPassword,
        destination: destination,
        emailError: emailError,
        passwordError: passwordError
    };
})();
