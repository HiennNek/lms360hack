// Đăng nhập LMS360: lưu access_token trong trình duyệt và gửi lại cho backend mỗi lần gọi.

export const BACKEND_BASE =
    import.meta.env.VITE_BACKEND_URL || 'https://lms360hack-backend.hiennek1.workers.dev';

const TOKEN_KEY = 'lms360_access_token';

interface LoginResponse {
    success?: boolean;
    access_token?: string;
    error?: string;
}

export function getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function authHeaders(): Record<string, string> {
    const token = getAccessToken();
    return token ? { 'X-Access-Token': token } : {};
}

// Cập nhật nút đăng nhập trên thanh trên cùng + thông báo "đăng nhập trước".
function syncLoginUI(): void {
    const loggedIn = !!getAccessToken();

    const label = document.getElementById('login-button-label');
    if (label) label.textContent = loggedIn ? 'Đã đăng nhập' : 'Đăng nhập';

    const icon = document.querySelector('#login-button .material-symbols-outlined');
    if (icon) icon.textContent = loggedIn ? 'how_to_reg' : 'login';

    const notice = document.getElementById('login-notice');
    if (notice) notice.classList.toggle('hidden', loggedIn);
}

export function initLoginUI(): void {
    syncLoginUI();

    const button = document.getElementById('login-button');
    if (!button) return;

    button.addEventListener('click', () => {
        requestLogin().catch(() => {}); // người dùng bấm Hủy -> im lặng
    });
}

interface LoginModal {
    root: HTMLElement;
    username: HTMLInputElement;
    password: HTMLInputElement;
    error: HTMLElement;
    submit: HTMLButtonElement;
    cancel: HTMLButtonElement;
    why: HTMLButtonElement;
    whyIcon: HTMLElement;
    explain: HTMLElement;
}

let modal: LoginModal | null = null;

function createModal(): LoginModal {
    const root = document.createElement('div');
    root.style.display = 'none';
    root.className =
        'fixed inset-0 z-[100] items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm';
    root.innerHTML = `
    <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-[var(--r-outer)] shadow-2xl border border-white/10 overflow-hidden">
      <div class="p-[var(--p-outer)]">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Nội dung cần đăng nhập</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">Nhập tài khoản LMS360 để tải nội dung này.</p>
        <button id="lms-login-why" type="button"
          class="flex items-center gap-1 text-sm font-semibold text-primary hover:underline transition-colors mb-4">
          <span>Tại sao tôi cần đăng nhập?</span>
          <span class="material-symbols-outlined text-base" id="lms-login-why-icon">expand_more</span>
        </button>
        <div id="lms-login-explain" class="hidden mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 space-y-2">
          <p>LMS360 yêu cầu authentication cho bài học này, nên cần một phiên đăng nhập hợp lệ mới có thể tải được nội dung.
            LMS360 Hack đăng nhập giúp bạn một lần để lấy access_token, sau đó token sẽ được lưu trong trình duyệt
            và tái sử dụng cho những bài sau. A.k.a cách bypass lỗi 403</p>
          <p>Mật khẩu chỉ được gửi tới máy chủ LMS360 và không được lưu lại ở bất kỳ đâu.</p>
        </div>
        <input id="lms-login-username" type="text" autocomplete="username" placeholder="Mã số định danh học sinh (số tài khoản)"
          class="w-full bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-[var(--r-mid)] h-12 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <input id="lms-login-password" type="password" autocomplete="current-password" placeholder="Mật khẩu"
          class="w-full mt-3 bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-[var(--r-mid)] h-12 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <p id="lms-login-error" class="error-message mt-3 text-sm"></p>
        <div class="flex items-start gap-2 mt-4 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-[var(--r-mid)]">
          <span class="material-symbols-outlined text-amber-500">info</span>
          <p>Việc đăng nhập lại có thể khiến phiên đăng nhập LMS360 hiện tại của bạn (trên web hoặc app) bị đăng xuất.
            Điều này là bình thường và bạn vẫn có thể tiếp tục sử dụng LMS360 sau khi login lại.</p>
        </div>
        <div class="flex gap-3 mt-6">
          <button id="lms-login-cancel"
            class="flex-1 h-12 rounded-[var(--r-mid)] bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all">Hủy</button>
          <button id="lms-login-submit"
            class="gradient-button flex-1 h-12 text-white font-bold hover:scale-[1.02] transition-all">Đăng nhập</button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(root);

    const why = root.querySelector('#lms-login-why') as HTMLButtonElement;
    const whyIcon = root.querySelector('#lms-login-why-icon') as HTMLElement;
    const explain = root.querySelector('#lms-login-explain') as HTMLElement;

    why.addEventListener('click', () => {
        const hidden = explain.classList.toggle('hidden');
        whyIcon.textContent = hidden ? 'expand_more' : 'expand_less';
    });

    return {
        root,
        username: root.querySelector('#lms-login-username') as HTMLInputElement,
        password: root.querySelector('#lms-login-password') as HTMLInputElement,
        error: root.querySelector('#lms-login-error') as HTMLElement,
        submit: root.querySelector('#lms-login-submit') as HTMLButtonElement,
        cancel: root.querySelector('#lms-login-cancel') as HTMLButtonElement,
        why,
        whyIcon,
        explain,
    };
}

// Hỏi tài khoản/mật khẩu, đăng nhập qua backend và trả về access_token đã lưu.
export function requestLogin(): Promise<string> {
    if (!modal) modal = createModal();
    const m = modal;

    m.username.value = '';
    m.password.value = '';
    m.error.textContent = '';
    m.submit.disabled = false;
    m.explain.classList.add('hidden');
    m.whyIcon.textContent = 'expand_more';
    m.root.style.display = 'flex';

    return new Promise<string>((resolve, reject) => {
        const close = () => {
            m.root.style.display = 'none';
            m.submit.removeEventListener('click', onSubmit);
            m.cancel.removeEventListener('click', onCancel);
        };

        const onCancel = () => {
            close();
            reject(new Error('Đã hủy đăng nhập.'));
        };

        const onSubmit = async () => {
            const username = m.username.value.trim();
            const password = m.password.value;

            if (!username || !password) {
                m.error.textContent = 'Vui lòng nhập tài khoản và mật khẩu.';
                return;
            }

            m.submit.disabled = true;
            m.error.textContent = 'Đang đăng nhập...';

            try {
                const res = await fetch(`${BACKEND_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });
                const data = (await res.json().catch(() => null)) as LoginResponse | null;
                const token = data?.access_token;

                if (!res.ok || !token) {
                    m.error.textContent = data?.error || `Đăng nhập thất bại (HTTP ${res.status}).`;
                    m.submit.disabled = false;
                    return;
                }

                localStorage.setItem(TOKEN_KEY, token);
                syncLoginUI();
                close();
                resolve(token);
            } catch {
                m.error.textContent = 'Không kết nối được tới máy chủ, thử lại.';
                m.submit.disabled = false;
            }
        };

        m.submit.addEventListener('click', onSubmit);
        m.cancel.addEventListener('click', onCancel);
        m.password.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') onSubmit();
        });
        m.username.focus();
    });
}
