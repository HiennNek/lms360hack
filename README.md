# LMS360 Hack - Mã nguồn back-end

> [!NOTE]
> ## Cách build và chạy LMS360 Hack (back-end)
> ### Đầu tiên, bạn phải có `Node.js` và `npm`
> #### Tiếp theo, bạn cần chuyển qua branch back-end
> ```bash
> git switch back-end
> ```
> #### Cài đặt dependency bằng: 
> ```bash
> npm install
> ```
> #### Chạy development server bằng
> ```bash
> npm run dev
> ```
> #### Hoặc upload lên Cloudflare Workers và chạy production server
> ```bash
> npm run deploy
> ```

> [!IMPORTANT]  
> Thay đổi phần code này trong `worker.js` để bật ‌‌/ tắt CORS và rate limit
> ```javascript
> const FEATURE_FLAGS = {
>  ENABLE_CORS: true, // only allow requests from lms360hack.pages.dev,
> //                      disable it if you want to test from localhost or other origin
>  ENABLE_RATE_LIMIT: true,
> };
> ```

#### Bằng cách sử dụng LMS360 Hack hoặc sản phẩm / dịch vụ có liên quan đến LMS360 Hack hoặc sử dụng một phần / toàn bộ mã nguồn của LMS360 Hack, bạn đã đồng ý tuân thủ [chính sách sử dụng, điều khoản phân phối và tuyên bố từ chối trách nhiệm](https://raw.githubusercontent.com/HiennNek/lms360hack/refs/heads/front-end/LICENSE.md) của tôi.
