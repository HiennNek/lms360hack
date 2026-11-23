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

    if (!modal) modal = createModal();

    const button = document.getElementById('login-button');
    if (!button) return;

    button.addEventListener('click', () => {
        requestLogin().catch(() => {});
    });
}

interface LoginModal {
    root: HTMLElement;
    why: HTMLButtonElement | null;
    whyIcon: HTMLElement | null;
    explain: HTMLElement | null;
    student: HTMLElement | null;
    other: HTMLElement | null;
    username: HTMLInputElement;
    password: HTMLInputElement;
    showPassword: HTMLButtonElement;
    error: HTMLElement;
    submit: HTMLButtonElement;
    cancel: HTMLButtonElement;
    otherLink: HTMLButtonElement | null;
    studentRole: HTMLButtonElement | null;
    otherSubmit: HTMLButtonElement | null;
}

let modal: LoginModal | null = null;

function createModal(): LoginModal {
    const root = document.createElement('div');
    root.style.display = 'none';
    root.className = 'fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto p-6 bg-slate-900/70';
    root.innerHTML = `
    <div class="w-full max-w-md my-auto bg-white dark:bg-slate-900 rounded-[var(--r-outer)] shadow-2xl border border-white/10 overflow-hidden">
      <div class="p-[var(--p-outer)]">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Đăng nhập</h2>
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
          <a href="https://github.com/HiennNek/lms360hack/blob/front-end/EXPLANATION.md" target="_blank" class="text-primary hover:underline">Tôi cần giải thích rõ hơn</a>
          <p>Nếu bạn không tin tưởng trang web này, bạn có thể sử dụng <a href="https://github.com/HiennNek/lms360hack/tree/lms360hack_next" target="_blank" class="text-primary hover:underline">LMS360Hack Next</a></p>
        </div>

        <div class="lms-iframe">
          <div class="lms-iframe-body">
            <div id="lms-login-student">
              <img class="lms-mainlogo" src="/lms-login/logo-lms360.png" alt="LMS360">
              <h3 class="lms-title">Đăng nhập</h3>
              <p class="lms-subtitle">Học sinh &middot; Tài khoản Sở Giáo dục và Đào tạo TP.HCM</p>

              <div class="lms-input-row">
                <span class="lms-input-icon"><img src="/lms-login/username-icon.svg" alt=""></span>
                <span class="lms-input-wrap">
                  <input id="lms-login-username" class="lms-input" type="text" autocomplete="username" placeholder="Mã số định danh học sinh">
                </span>
              </div>
              <div class="lms-input-row">
                <span class="lms-input-icon"><img src="/lms-login/password-icon.svg" alt=""></span>
                <span class="lms-input-wrap">
                  <input id="lms-login-password" class="lms-input" type="password" autocomplete="current-password" placeholder="Mật khẩu">
                  <button id="lms-login-show-password" class="lms-eye" type="button" title="Hiện mật khẩu" aria-label="Hiện mật khẩu">
                    <span class="material-symbols-outlined">visibility_off</span>
                  </button>
                </span>
              </div>
              <p id="lms-login-error" class="lms-login-error"></p>

              <button id="lms-login-submit" class="lms-primary" type="button">Đăng nhập</button>
            </div>
            <!-- Not really iframe btw -->
            <div id="lms-login-other-panel" style="display:none">
              <div class="lms-brand">
                <span>Một sản phẩm của</span>
                <img src="/lms-login/logo-bachkhoa.png" alt="Bách Khoa">
              </div>
              <img class="lms-mainlogo" src="/lms-login/logo-lms360.png" alt="LMS360">
              <h3 class="lms-title">Đăng nhập</h3>

              <div class="lms-select">
                <span>Tài khoản Sở Giáo dục và Đào tạo TP.HCM</span>
                <span class="lms-chevron"></span>
              </div>

              <div class="lms-roles" id="lms-login-roles">
                <button type="button" class="lms-role active" data-role="student" id="lms-login-student-role"><span class="lms-radio"></span>Học sinh</button>
                <button type="button" class="lms-role" data-role="teacher"><span class="lms-radio"></span>Giáo viên</button>
              </div>

              <div class="lms-school">
                <span class="lms-school-icon"><img src="/lms-login/school-icon.svg" alt=""></span>
                <span class="lms-school-select">
                  <input id="lms-login-school" type="text" autocomplete="off" placeholder="Nhập tên hoặc mã trường">
                  <span class="lms-chevron"></span>
                </span>
              </div>

              <button id="lms-login-other-submit" type="button" class="lms-primary">Đăng nhập</button>
              <button id="lms-login-sso" type="button" class="lms-sso">Đăng nhập SSO Bách Khoa</button>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-2 mt-4 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-[var(--r-mid)]">
          <span class="material-symbols-outlined text-amber-500">info</span>
          <p>Việc đăng nhập lại có thể khiến phiên đăng nhập LMS360 hiện tại của bạn (trên web hoặc app) bị đăng xuất.
            Điều này là bình thường và bạn vẫn có thể tiếp tục sử dụng LMS360 sau khi login lại.
            <span class="font-bold">Tiến trình làm bài sẽ bị mất nếu như bạn không login trước!</span></p>
        </div>
        <div class="flex gap-3 mt-6">
          <button id="lms-login-cancel"
            class="flex-1 h-12 rounded-[var(--r-mid)] bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all">Hủy</button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(root);

    const why = root.querySelector('#lms-login-why') as HTMLButtonElement | null;
    const whyIcon = root.querySelector('#lms-login-why-icon') as HTMLElement | null;
    const explain = root.querySelector('#lms-login-explain') as HTMLElement | null;
    why?.addEventListener('click', () => {
        if (!explain || !whyIcon) return;
        const hidden = explain.classList.toggle('hidden');
        whyIcon.textContent = hidden ? 'expand_more' : 'expand_less';
    });

    const roles = root.querySelector('#lms-login-roles') as HTMLElement | null;
    roles?.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).closest('.lms-role');
        if (!target) return;
        roles.querySelectorAll('.lms-role').forEach((el) => el.classList.remove('active'));
        target.classList.add('active');
    });

    return {
        root,
        why,
        whyIcon,
        explain,
        student: root.querySelector('#lms-login-student') as HTMLElement,
        other: root.querySelector('#lms-login-other-panel') as HTMLElement,
        username: root.querySelector('#lms-login-username') as HTMLInputElement,
        password: root.querySelector('#lms-login-password') as HTMLInputElement,
        showPassword: root.querySelector('#lms-login-show-password') as HTMLButtonElement,
        error: root.querySelector('#lms-login-error') as HTMLElement,
        submit: root.querySelector('#lms-login-submit') as HTMLButtonElement,
        cancel: root.querySelector('#lms-login-cancel') as HTMLButtonElement,
        otherLink: root.querySelector('#lms-login-other') as HTMLButtonElement,
        studentRole: root.querySelector('#lms-login-student-role') as HTMLButtonElement,
        otherSubmit: root.querySelector('#lms-login-other-submit') as HTMLButtonElement,
    };
}

export function requestLogin(): Promise<string> {
    if (!modal) modal = createModal();
    const m = modal;

    m.username.value = '';
    m.password.value = '';
    m.password.type = 'password';
    const eye = m.showPassword.querySelector('.material-symbols-outlined');
    if (eye) eye.textContent = 'visibility_off';
    m.error.textContent = '';
    m.submit.disabled = false;
    m.explain?.classList.add('hidden');
    if (m.whyIcon) m.whyIcon.textContent = 'expand_more';
    if (m.student) m.student.style.display = '';
    if (m.other) m.other.style.display = 'none';
    m.root.style.display = 'flex';
    document.documentElement.classList.add('modal-open');

    return new Promise<string>((resolve, reject) => {
        const close = () => {
            m.root.style.display = 'none';
            document.documentElement.classList.remove('modal-open');
            m.cancel.removeEventListener('click', onCancel);
            m.root.removeEventListener('click', onBackdrop);
            m.otherLink?.removeEventListener('click', onOther);
            m.studentRole?.removeEventListener('click', onStudent);
            m.otherSubmit?.removeEventListener('click', onStudent);
            m.showPassword.removeEventListener('click', onTogglePassword);
            m.submit.removeEventListener('click', onSubmit);
            m.username.removeEventListener('keydown', onEnter);
            m.password.removeEventListener('keydown', onEnter);
        };

        const onCancel = () => {
            close();
            reject(new Error('Đã hủy đăng nhập.'));
        };

        const onBackdrop = (e: MouseEvent) => {
            if (e.target === m.root) onCancel();
        };

        const onOther = () => {
            if (m.student) m.student.style.display = 'none';
            if (m.other) m.other.style.display = '';
        };

        const onStudent = () => {
            if (m.other) m.other.style.display = 'none';
            if (m.student) m.student.style.display = '';
            m.username.focus();
        };

        const onTogglePassword = () => {
            const show = m.password.type === 'password';
            m.password.type = show ? 'text' : 'password';
            const icon = m.showPassword.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = show ? 'visibility' : 'visibility_off';
            m.showPassword.title = show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu';
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

        const onEnter = (e: KeyboardEvent) => {
            if (e.key === 'Enter') onSubmit();
        };

        m.cancel.addEventListener('click', onCancel);
        m.root.addEventListener('click', onBackdrop);
        m.otherLink?.addEventListener('click', onOther);
        m.studentRole?.addEventListener('click', onStudent);
        m.otherSubmit?.addEventListener('click', onStudent);
        m.showPassword.addEventListener('click', onTogglePassword);
        m.submit.addEventListener('click', onSubmit);
        m.username.addEventListener('keydown', onEnter);
        m.password.addEventListener('keydown', onEnter);
        m.username.focus();
    });
}
