# Tại sao tôi cần phải login với những bài giảng không công khai? LMS360Hack có đang lấy tài khoản và mật khẩu của tôi để ~~làm bài giùm tôi~~ hack tài khoản tôi không???

Trước đây, khi load nội dung bài giảng từ LMS360 thì LMS360 sẽ không yêu cầu cookie hay login gì cả.

<img width="50%" alt="image" src="https://github.com/user-attachments/assets/ad6fc8ee-b58c-4e9d-80fc-5533d22ca99b" />

Như trong hình thì ta có thể thấy, chúng ta hoàn toàn có thể lấy được dữ liệu bài giảng LMS360 mà không cần đăng nhập (LMS360Hack hoạt động qua cách đó)

Qua một kỳ nghỉ hè thật vui vẻ thì khi đi học lại, LMS360 bỗng yêu cầu authentication (đăng nhập tài khoản) thì mới có thể lấy được nội dung.

**Khi không đăng nhập (request header không có cookie access_token):**

<img width="50%" alt="image" src="https://github.com/user-attachments/assets/23be9e9e-e366-48aa-93db-876f9b945af2" />

**Khi đã đăng nhập (khi đã cung cấp cookie access token vào trong header):**

<img width="50%" alt="image" src="https://github.com/user-attachments/assets/ea7649b6-2bce-4183-9d87-a75584789970" />

---

**Vậy nên, LMS360Hack phải làm gì??**

Đương nhiên là cho người dùng login bằng tài khoản LMS360 vào chứ còn gì nữa ;)

**Vậy, LMS360Hack xử lý phần login này như thế nào?**

Khi LMS360Hack phát hiện ra không thể truy cập nội dung mà người dùng đưa, website sẽ hỏi người dùng tài khoản và password để truy cập bài giảng.

Khi đã có tài khoản và mật khẩu, LMS360Hack sẽ gửi mật khẩu ấy đến server của LMS360 để lấy cookie:

<img width="50%" alt="image" src="https://github.com/user-attachments/assets/937175fb-201e-4835-b302-c459ed2e2d17" />

Sau khi đã có cookie, LMS360Hack sẽ lưu vào trình duyệt của bạn và sử dụng cookie đã lưu ấy để truy cập bài giảng.

---

**Vậy... Tôi có thu thập tài khoản và mật khẩu của bạn không?**

Câu trả lời là **không**!

Cả back-end và front-end (a.k.a 2 cái server của LMS360Hack) đều mã nguồn mở và được compile cũng như chạy trên server Cloudflare từ mã nguồn trên Github bằng Cloudflare CI, vậy nên bạn hoàn toàn có thể soi được code của LMS360Hack ngay trong trang Github này, cũng như hiểu được cơ chế hoạt động của LMS360Hack.

**Vậy, tại sao khi login thì phải qua server LMS360Hack thứ hai (back-end) thì mới tới được LMS360?**

> Vì trình duyệt của bạn không cho phép LMS360Hack truy cập trực tiếp LMS360 để đảm bảo an toàn, chỉ có website phụ hay các server của LMS360 thì mới có thể truy cập được LMS360. (a.k.a CORS - Cross-Origin Resource Sharing).

LMS360Hack mở thêm server thứ hai (back-end) để cho trình duyệt của bạn tưởng rằng LMS360Hack đang kết nối với server của chính nó chứ không phải kết nối với server ngoài.

Bạn có thể hiểu cách hoạt động của back-end như cách VPN hoạt động.

> Trình duyệt là nhà mạng, LMS360 là web bị nhà mạng không cho truy cập và LMS360Hack back-end là VPN.

```
User ----> LMS360Hack ----> LMS360 (Trình duyệt sẽ chặn không cho người dùng sử dụng vì LMS360Hack đang cố call LMS360 mà 2 đứa không quen biết gì nhau).
```

```
User ----> LMS360Hack ----> LMS360Hack (back-end) ----> LMS360 (Trình duyệt cho phép vì hai thằng LMS360Hack ấy là bạn thân của nhau và LMS360Hack (back-end) hoàn toàn có thể call LMS360 mà không bị trình duyệt phát hiện).
```

---

**Vậy nếu mật khẩu của bạn được gửi qua LMS360Hack (back-end) trước khi đến được LMS360 thật thì có ổn không?**

Như đã đề cập như trên, back-end của LMS360Hack hoàn toàn mã nguồn mở và không lưu lại mật khẩu người dùng.

Ngoài ra, dashboard của Cloudflare Worker không lưu lại request body hay respond body (không lưu lại những thứ bạn gửi) nên tôi cũng không thể soi được mật khẩu của bạn.

Nếu bạn không muốn nhập mật khẩu của mình cho LMS360Hack thì cũng không sao, vì tôi đã tạo ra một project mới tên là [LMS360Hack Next](https://github.com/HiennNek/lms360hack/tree/lms360hack_next)

LMS360Hack Next sẽ chạy hoàn toàn offline trên trình duyệt của bạn và hiện lên mỗi khi bạn sử dụng LMS360. LMS360Hack Next hoàn toàn không sử dụng server để chạy nên bạn có thể yên tâm hơn.

Tuy lúc cài có thể hơi khó hơn và không có khả năng tự động update, nhưng mình nghĩ đây sẽ là giải pháp an toàn và tiện lợi hơn khi sử dụng.

---

Cảm ơn bạn đã đọc ;)
